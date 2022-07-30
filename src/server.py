from dataclasses import dataclass, field, asdict
from enum import Enum
import websockets
import asyncio
import time
import json
from datalog import Datalog
from LJCommands import CommandString, Command, parse_sequence_csv
from traceback import print_exc
import sys
from labjack import get_class
from stands import Stand, StandConfig
from typing import List, Mapping, Tuple, Optional
from pathlib import Path
import subprocess

# If you run `python3 server.py --dev` you get a simulated LabJack class
# If you run `python3 server.py` it tries to connect properly
# (To connect properly we need LabJackPython's u3.py and the Exodriver, see README)
devMode = '--dev' in sys.argv

STATE_BROADCAST_FREQUENCY = 20  # Get the LabJack state and broadcast it to all connected clients at 20Hz
ABORT_SEQUENCE_TIMEOUT = 900 # Seconds without any active connections before the abort sequence automatically fires

LOG_PATH = Path(__file__).parent / 'logs'

def get_output(cmd):
    """
    Get the STDOUT of a shell command as a string, suppressing STDERR.
    If there is only an error (including command not found), the return will be an empty string.
    """
    proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    return proc.communicate()[0].decode("utf-8")

class UPSStatus(str, Enum):
    "Enum for the status of the UPS"
    LINE_POWERED = 'LINE_POWERED'
    BATTERY_POWERED = 'BATTERY_POWERED'
    UNKNOWN = 'UNKNOWN'

@dataclass
class SystemState:
    # Is the software armed? - if disabled it blocks all commands
    arming_switch: bool = False
    # Are pins allowed to be manually toggled?
    manual_switch: bool = False
    # All commands that have yet to start executing in the current sequence. Includes:
    # * commands for sequences that haven't been run yet
    # * commands later on in an active sequence
    # But not:
    # * partially finished sleeps
    # * commands that have already run in an actively running sequence
    current_sequence: List[Command] = field(default_factory=list)
    # Is the current_sequence in progress?
    sequence_running: bool = False
    # The current sequence command being executed, if the sequence is running
    command_in_flight: Optional[Command] = None
    # Is data logging to a CSV file server-side enabled?
    data_logging: bool = False
    # Is the abort sequence currently running? Must be false if sequence_running is false
    aborting: bool = False
    # Warning to display in the client, as a (epoch milliseconds, message) tuple
    latest_warning: Optional[Tuple[int, str]] = None
    # LabJack sensor data - state['LOX']['analog'][pin_no] is a voltage for instance
    # Note this is not necessarily up-to-date: it's computed from LabJack.get_state()
    # before sending this entire object as JSON to the client
    labjacks: Mapping[str, dict] = field(default_factory=dict)
    # Last time the labjacks field was updated (epoch milliseconds)
    time: int = 0
    UPS_status: UPSStatus = UPSStatus.UNKNOWN

    def as_dict(self):
        return asdict(self)


class LJWebSocketsServer:

    def __init__(self, ip: str, port: int):
        self.config = {}
        self.state = SystemState()
        self.datalog = None
        self.time_of_last_disconnect = time.time()
        self.inactive_abort_fired = False

        self.abort_sequence = parse_sequence_csv('abort_sequence.csv')

        self.labjacks = {}

        self.labjacks['LOX'] = get_class(devMode)(StandConfig[Stand.LOX])
        self.labjacks['ETH'] = get_class(devMode)(StandConfig[Stand.ETH])

        self.ip = ip
        self.port = port
        self.clients = set()

        print(f"Hosting server on {ip} port {port}")

    async def timeout_counter(self):
        # run the abort sequence once when no devices have been connected for `ABORT_SEQUENCE_TIMOUT` seconds
        while True:
            # seconds since last disconnect
            dt = time.time() - self.time_of_last_disconnect
            # are any clients active?
            connected = len(self.clients) > 0

            if dt > ABORT_SEQUENCE_TIMEOUT and not connected and not self.inactive_abort_fired:
                self.inactive_abort_fired = True
                self.run_abort_sequence()

            await asyncio.sleep(1)

    async def sync_state(self):
        while True:
            if self.state.data_logging and self.datalog:
                self.log_data(self.state.as_dict(), type="STATE")
            for stand in self.labjacks:
                pin_data = self.labjacks[stand].get_state()
                self.state.labjacks[stand] = pin_data
            self.state.time = int(time.time() * 1000)
            # broadcast new state to all clients
            asyncio.ensure_future(self.broadcast('STATE', self.state.as_dict()))
            await asyncio.sleep(1 / STATE_BROADCAST_FREQUENCY)

    def log_data(self, data, type="MISC"):
        if self.datalog and self.state.data_logging:
            self.datalog.log_data(data, type)

    def get_UPS_status(self):
        if not devMode:
            status = get_output('apcaccess status')
            # if there's a connection, it should say "STATUS   : ONBATT" or "STATUS   : ONLINE" on one of the lines
            if "STATUS   : ONBATT" in status:
                return UPSStatus.BATTERY_POWERED
            elif "STATUS   : ONLINE" in status:
                return UPSStatus.LINE_POWERED
            else:
                return UPSStatus.UNKNOWN
        else:
            # for test servers, switch the UPS status every 3 seconds
            statuses = [UPSStatus.LINE_POWERED, UPSStatus.BATTERY_POWERED, UPSStatus.UNKNOWN]
            index = (int(time.time() / 60)) % len(statuses)
            return statuses[index]

    async def update_UPS_status(self):
        while True:
            self.state.UPS_status = self.get_UPS_status()
            await asyncio.sleep(1)

    async def event_handler(self, ws, path):
        self.clients.add(ws)
        try:
            async for message in ws:
                # reset inactivity measure
                self.inactive_abort_fired = False

                self.log_data(message, type="REQUEST")
                data = json.loads(message)
                if 'command' in data.keys():
                    try:
                        await self.handle_command(ws, data['command']['header'],
                            data['command'].get('data', None), data['time'])
                    except Exception as e:
                        print_exc()
                        self.state.latest_warning = (
                            int(time.time()*1000),
                            str(e)
                        )

                else:
                    assert False, f"Invalid command {message}"
        finally:
            self.clients.remove(ws)
            self.time_of_last_disconnect = time.time()

    def run_abort_sequence(self):
        self.log_data(True, type="ABORTING")
        self.state.aborting = True
        if not self.state.sequence_running:
            self.state.current_sequence = [*self.abort_sequence]
            self.execute_sequence()
        self.state.arming_switch = False
        self.state.manual_switch = False

    def set_datalogging_enabled(self, enabled):
        if enabled:
            self.state.data_logging = True
            self.datalog = Datalog(LOG_PATH)
            self.log_data(True, type="DATA_LOGGING")
        else:
            self.log_data(False, type="DATA_LOGGING")
            self.state.data_logging = False
            self.datalog = None

    async def handle_command(self, ws, header, data, time):
        if header == 'PING':
            await self.emit(ws, 'PING', time)
            return

        if self.state.aborting: return
        print(header)

        match header:
            case CommandString.DATALOG:
                self.set_datalogging_enabled(data)
            case CommandString.ARMINGSWITCH:
                self.log_data(data, type="ARMING_SWITCH")
                self.state.arming_switch = data
            case CommandString.ABORTSEQUENCE:
                self.run_abort_sequence()
            case CommandString.SETSEQUENCE:
                print(type(data))
                command = Command(
                    CommandString.SETSEQUENCE, data)
                self.state.current_sequence = command.data
            case CommandString.MANUALSWITCH:
                self.log_data(data, type="MANUAL_SWITCH")
                self.state.manual_switch = data
            case CommandString.BEGINSEQUENCE:
                if self.state.arming_switch:
                    self.execute_sequence()
            case CommandString.OPEN | CommandString.CLOSE:
                if self.state.arming_switch and self.state.manual_switch:
                    self.LJ_execute(Command(header, data))

    async def start_server(self):
        asyncio.ensure_future(self.sync_state())
        asyncio.ensure_future(self.timeout_counter())
        asyncio.ensure_future(self.update_UPS_status())
        async with websockets.serve(self.event_handler, self.ip, self.port):
            await asyncio.Future()

    def LJ_execute(self, command: Command):
        self.log_data(command.as_dict(), "COMMAND_EXECUTED")
        asyncio.ensure_future(self.broadcast('VALVE', command.as_dict()))
        if type(command) == dict:
            command = Command(command['header'], command['data'])
        if command.header == CommandString.OPEN:
            LJ = command.data["name"]
            pin = command.data["pin"]
            self.labjacks[LJ].open_valve(pin)
        elif command.header == CommandString.CLOSE:
            LJ = command.data["name"]
            pin = command.data["pin"]
            self.labjacks[LJ].close_valve(pin)
        else:
            assert False, "Unknown command string: " + json.dumps(command.as_dict())

    def execute_sequence(self):
        async def temp():
            assert not self.state.sequence_running

            self.state.sequence_running = True
            is_abort_sequence = self.state.aborting

            while len(self.state.current_sequence) != 0 and self.state.sequence_running:
                command = self.state.current_sequence.pop(0)
                self.state.command_in_flight = command
                if command.header == CommandString.SLEEP:
                    self.state.command_in_flight = {
                        "header": "SLEEP",
                        "data": command.data,
                        "time": round(time.time()*1000) + command.data
                    }
                    self.log_data(command.as_dict(), type="COMMAND_EXECUTED")
                    print(f"[Sequence] sleeping for {command.data}ms")
                    # break sleep into 5ms chunks so aborts will interrupt sleeps
                    def time_ms():
                        return time.time_ns() // 1_000_000
                    expiry = time_ms() + command.data # milliseconds
                    x = time_ms()
                    while time_ms() < expiry:
                        if self.state.aborting and not is_abort_sequence:
                            is_abort_sequence = True
                            self.state.current_sequence = [*self.abort_sequence]
                            break
                        await asyncio.sleep(0.005) # 5ms
                    print(f"delta: {time_ms()-x}ms")
                else:
                    if command.header == CommandString.OPEN:
                        print(f"[Sequence] opening {command.data}")
                    elif command.header == CommandString.CLOSE:
                        print(f"[Sequence] closing {command.data}")
                    self.LJ_execute(command)
                self.state.command_in_flight = None

            self.state.sequence_running = False
            self.state.aborting = False
        asyncio.ensure_future(temp())

    async def emit(self, ws, msg_type, data):
        # if msg_type == "STATE", data is the state, etc.
        obj = {
            "type": msg_type,
            "time": round(time.time()*1000),
            "data": data
        }
        await ws.send(json.dumps(obj))

    async def broadcast(self, msg_type, data):
        for ws in self.clients:
            await self.emit(ws, msg_type, data)


def get_local_ip():
    # Source: https://stackoverflow.com/a/166589
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    ret = s.getsockname()[0]
    s.close()
    return ret


if __name__ == '__main__':
    ip = get_local_ip()
    port = 8888
    server = LJWebSocketsServer(ip, port)
    asyncio.run(server.start_server())

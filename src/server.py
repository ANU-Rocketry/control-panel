from dataclasses import dataclass, field, asdict
import websockets
import asyncio
import time
import json
from datalog import Datalog
from LJCommands import CommandString, Command, parse_sequence_csv
from traceback import print_exc
import sys
from labjack import get_class
from utils import Path, get_local_ip
from typing import List, Mapping, Tuple, Optional

# If you run `python3 server.py --dev` you get a simulated LabJack class
# If you run `python3 server.py` it tries to connect properly
# (To connect properly we need LabJackPython's u3.py and the Exodriver, see README)
LabJack = get_class('--dev' in sys.argv)

STATE_GRAB = 50  # Get state from labjacks 50 times per second
STATE_EMIT = 10  # Emit the state to the front end 10 times per second
CONNECTION_TIMEOUT = 600  # Second to timeout and run abort sequence after WHILE ARMED (front-end should disarm after inactivity)

LOG_PATH = Path(__file__).folder('logs')
CONFIG_FILE = Path(__file__).file('config.json')


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

    def as_dict(self):
        return asdict(self)


class LJWebSocketsServer:

    def __init__(self, ip: str, port: int, config=CONFIG_FILE):
        self.config = {}
        self.state = SystemState()
        self.datalog = None
        self.abort_timer = None

        with open(config, "r") as in_file:
            data = json.loads(in_file.read())

        self.config = data
        self.abort_sequence = parse_sequence_csv(self.config['ABORT_SEQUENCE'])

        self.labjacks = {}

        for key in self.config['labjacks']:
            config = self.config['labjacks'][key]
            self.labjacks[key] = LabJack(config["serial"], config["analog"])

        self.ip = ip
        self.port = port
        self.clients = set()

        print(f"Hosting server on {ip}:{port}")

    async def event_handler(self, websocket, path):
        """
        Going to have to go through the Labjack object and produce the state...
        This will be a separate asynchronous task on a concurrent timer
        """
        self.clients.add(websocket)
        consumer_task = asyncio.ensure_future(
            self.consumer_handler(websocket, path))
        producer_task = asyncio.ensure_future(
            self.producer_handler(websocket, path))
        _, pending = await asyncio.wait(
            [consumer_task, producer_task],
            return_when=asyncio.FIRST_COMPLETED,
        )
        for task in pending:
            task.cancel()
        self.clients.remove(websocket)

    async def timeout_counter(self):
        lastConnection = time.time()
        timeSinceLast = 0
        while True:
            if self.clients != set() or not self.state.arming_switch:
                lastConnection = time.time()
            timeSinceLast = time.time() - lastConnection
            if timeSinceLast > (CONNECTION_TIMEOUT):
                self.run_abort_sequence()
            await asyncio.sleep(1)

    async def sync_state(self):
        while True:
            if self.state.data_logging and self.datalog:
                self.log_data(self.state.as_dict(), type="STATE")
            for stand in self.labjacks:
                pin_data = self.labjacks[stand].get_state(
                    self.config['labjacks'][stand]["digital"], self.config['labjacks'][stand]["analog"])
                self.state.labjacks[stand] = pin_data
            self.state.time = int(time.time() * 1000)
            await asyncio.sleep(1/STATE_GRAB)

    def log_data(self, data, type="MISC"):
        if self.datalog and self.state.data_logging:
            self.datalog.log_data(data, type)

    async def consumer_handler(self, ws, path):
        async for message in ws:
            self.log_data(message, type="REQUEST")
            data = json.loads(message)
            if 'command' in data.keys():
                try:
                    await self.handle_command(ws, data['command']['header'],
                        data['command'].get('data', None), data['time'])
                except Exception as e:
                    print_exc()
                    self.handleException(e)
            else:
                assert False, f"Invalid command {message}"

    def run_abort_sequence(self):
        self.log_data(True, type="ABORTING")
        self.state.aborting = True
        if not self.state.sequence_running:
            self.state.current_sequence = [*self.abort_sequence]
            self.execute_sequence()
        self.state.arming_switch = False
        self.state.manual_switch = False

    def handleException(self, e):
        self.state.latest_warning = (
            int(time.time()*1000),
            str(e)
        )

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

    async def producer_handler(self, ws, path):
        while True:
            await asyncio.sleep(1/STATE_EMIT)
            await self.emit(ws, 'STATE', self.state.as_dict())

    async def start_server(self):
        asyncio.create_task(self.sync_state())
        asyncio.create_task(self.timeout_counter())
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


if __name__ == '__main__':
    ip = get_local_ip()
    port = 8888
    socket = LJWebSocketsServer(ip, port)
    asyncio.run(socket.start_server())

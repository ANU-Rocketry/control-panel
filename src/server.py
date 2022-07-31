from dataclasses import dataclass, field, asdict
import websockets
import asyncio
import time
import json
from datalog import Datalog
from traceback import print_exc
import sys
import os
from labjack import get_class
from stands import ETH, LOX
from pathlib import Path
import utils
from commands import Sleep, Open, Close, ServerCommand, ClientCommandString

# If you run `python3 server.py --dev` you get a simulated LabJack class
# If you run `python3 server.py` it tries to connect properly
# (To connect properly we need LabJackPython's u3.py and the Exodriver, see README)
devMode = '--dev' in sys.argv

STATE_BROADCAST_FREQUENCY = 20  # Get the LabJack state and broadcast it to all connected clients at 20Hz
ABORT_SEQUENCE_TIMEOUT = 900 # Seconds without any active connections before the abort sequence automatically fires

LOG_PATH = Path(__file__).parent / 'logs'

class UPSStatus:
    LINE_POWERED = 'LINE_POWERED'
    BATTERY_POWERED = 'BATTERY_POWERED'
    UNKNOWN = 'UNKNOWN'
    All = [LINE_POWERED, BATTERY_POWERED, UNKNOWN]

UPSStatusMessages = {
    UPSStatus.LINE_POWERED: '✅ Line Powered',
    UPSStatus.BATTERY_POWERED: '❌ On Battery (No Power)',
    UPSStatus.UNKNOWN: '❔ Unknown',
}

class SequenceStatus:
    # A sequence may or may not be loaded, but it's not currently running
    # There may be a command in flight (ie a running sequence was paused), or not (sequence loaded but not started)
    IDLE = 0
    # Currently running a sequence other than the abort sequence
    RUNNING = 1
    # A sequence is running and we want to interrupt it to run the abort sequence instead
    ABORT_REQUESTED = 2
    # Currently running the abort sequence
    ABORTING = 3

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
    current_sequence: list[ServerCommand] = field(default_factory=list)
    # Is the current_sequence in progress?
    status: SequenceStatus = SequenceStatus.IDLE
    # The current sequence command being executed, if the sequence is running
    command_in_flight: ServerCommand | None = None
    # Is data logging to a CSV file server-side enabled?
    data_logging: bool = False
    # Warning to display in the client, as a (epoch milliseconds, message) tuple
    latest_warning: tuple[int, str] | None = None
    # LabJack sensor data - state['LOX']['analog'][pin_no] is a voltage for instance
    # Note this is not necessarily up-to-date: it's computed from LabJack.get_state()
    # before sending this entire object as JSON to the client
    labjacks: dict[str, dict] = field(default_factory=dict)
    # Last time the labjacks field was updated (epoch milliseconds)
    time: int = 0
    UPS_status: UPSStatus = UPSStatus.UNKNOWN

    def as_dict(self):
        # this is JSON encoded and sent to front end clients periodically
        c, self.command_in_flight = self.command_in_flight, None
        s, self.current_sequence = self.current_sequence, None
        ret = asdict(self)
        if c is not None: ret['command_in_flight'] = c.as_dict(); self.command_in_flight = c
        if s is not None: ret['current_sequence'] = [x.as_dict() for x in s]; self.current_sequence = s
        return ret


class ControlPanelServer:

    def __init__(self, ip: str, port: int):
        self.config = {}
        self.state = SystemState()
        self.datalog = None
        self.time_of_last_disconnect = time.time()
        self.inactive_abort_fired = False # so we don't fire the abort sequence repeatedly

        self.labjacks = {}

        self.labjacks['LOX'] = get_class(devMode)(LOX)
        self.labjacks['ETH'] = get_class(devMode)(ETH)

        self.sequence_names = os.listdir('./sequences/')

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

    def push_warning(self, msg: str):
        self.state.latest_warning = ( utils.time_ms(), msg )

    def get_UPS_status(self):
        if not devMode:
            status = utils.get_output('apcaccess status')
            # if there's a connection, it should say "STATUS   : ONBATT" or "STATUS   : ONLINE" on one of the lines
            if "STATUS   : ONBATT" in status:
                return UPSStatus.BATTERY_POWERED
            elif "STATUS   : ONLINE" in status:
                return UPSStatus.LINE_POWERED
            else:
                return UPSStatus.UNKNOWN
        else:
            # for test servers, switch the UPS status regularly
            index = (int(time.time() / 60)) % len(UPSStatus.All)
            return UPSStatus.All[index]

    async def update_UPS_status(self):
        while True:
            old = self.state.UPS_status
            self.state.UPS_status = self.get_UPS_status()
            if old != self.state.UPS_status:
                self.push_warning(f"UPS status changed: {UPSStatusMessages[self.state.UPS_status]}")
            await asyncio.sleep(1)

    async def event_handler(self, ws, path):
        self.clients.add(ws)
        try:
            async for message in ws:
                self.inactive_abort_fired = False # reset inactivity measure
                self.log_data(message, type="REQUEST")
                try:
                    data = json.loads(message)
                    await self.handle_command(ws, data['header'], data.get('data', None), data['time'])
                except Exception as e:
                    print_exc()
                    self.push_warning(str(e))
        finally:
            self.clients.remove(ws)
            self.time_of_last_disconnect = time.time()

    def load_sequence(self, name: str):
        # name='abort' means loading src/sequences/abort.py
        with open(Path(__file__).parent / 'sequences' / name) as f:
            # instead of writing a parser, we just exec each line in the file (not a security issue as sequences are trusted)
            return [
                utils.exec_expr_with_locals(line, Sleep=Sleep, Open=Open, Close=Close, LOX=LOX, ETH=ETH)
                for line in f.readlines()
            ]

    def run_abort_sequence(self):
        self.log_data(True, type="ABORTING")
        self.state.arming_switch = False
        self.state.manual_switch = False
        match self.state.status:
            case SequenceStatus.ABORTING | SequenceStatus.ABORT_REQUESTED:
                pass # let the existing abort continue
            case SequenceStatus.IDLE:
                self.state.current_sequence = self.load_sequence('abort')
                self.execute_sequence(initial_state=SequenceStatus.ABORTING)
            case SequenceStatus.RUNNING:
                # the sleep will pick up the abort request and break out early,
                # # so we can just overwrite the rest of the sequence with the abort
                self.state.status = SequenceStatus.ABORT_REQUESTED
                self.state.current_sequence = self.load_sequence('abort')

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
        match header:
            case ClientCommandString.PING:
                await self.emit(ws, 'PING', time)

            case ClientCommandString.ARMINGSWITCH:
                if not self.sequence_running():
                    self.log_data(data, type="ARMING_SWITCH")
                    self.state.arming_switch = data

            case ClientCommandString.MANUALSWITCH:
                if not self.sequence_running():
                    self.log_data(data, type="MANUAL_SWITCH")
                    self.state.manual_switch = data

            case ClientCommandString.OPEN:
                if self.state.arming_switch and self.state.manual_switch:
                    await Open(data['name'], data['pin']).act(self)

            case ClientCommandString.CLOSE:
                if self.state.arming_switch and self.state.manual_switch:
                    await Close(data['name'], data['pin']).act(self)

            case ClientCommandString.DATALOG:
                self.set_datalogging_enabled(data)

            case ClientCommandString.SETSEQUENCE:
                if self.state.arming_switch:
                    try:
                        self.state.current_sequence = self.load_sequence(data)
                    except:
                        self.push_warning(f"Could not load sequence {data}")

            case ClientCommandString.BEGINSEQUENCE:
                if self.state.arming_switch:
                    self.execute_sequence()

            case ClientCommandString.ABORTSEQUENCE:
                if self.state.arming_switch:
                    self.run_abort_sequence()

            case _:
                self.push_warning(f"Unknown command: {header}")

    async def start_server(self):
        asyncio.ensure_future(self.sync_state())
        asyncio.ensure_future(self.timeout_counter())
        asyncio.ensure_future(self.update_UPS_status())
        async with websockets.serve(self.event_handler, self.ip, self.port):
            await asyncio.Future()

    def execute_sequence(self, initial_state=SequenceStatus.RUNNING):
        async def task():
            self.state.status = initial_state
            self.state.manual_switch = False

            # if the status changes to idle, it means we've paused (keep the half completed sleep there and just exit execute_sequence)
            while len(self.state.current_sequence) != 0 and self.state.status != SequenceStatus.IDLE:
                self.state.command_in_flight = self.state.current_sequence.pop(0)
                complete = await self.state.command_in_flight.act(self)
                if complete: self.state.command_in_flight = None

                # if the status changes to ABORT_REQUESTED, we change it to ABORTING and discard the command in flight
                if self.state.status == SequenceStatus.ABORT_REQUESTED:
                    self.state.status = SequenceStatus.ABORTING

            self.state.status = SequenceStatus.IDLE

        asyncio.ensure_future(task())

    def should_interrupt_sleep(self) -> bool:
        return self.state.status == SequenceStatus.ABORT_REQUESTED

    def sequence_running(self) -> bool:
        match self.state.status:
            case SequenceStatus.RUNNING | SequenceStatus.ABORTING | SequenceStatus.ABORT_REQUESTED: return True
            case _: return False

    def sequence_command_allowed(self) -> bool:
        return self.state.arming_switch or self.state.status == SequenceStatus.ABORTING

    async def emit(self, ws, msg_type, data):
        # if msg_type == "STATE", data is the state, etc.
        obj = {
            "type": msg_type,
            "time": round(time.time()*1000),
            "data": data,
            "sequence_names": self.sequence_names
        }
        await ws.send(json.dumps(obj))

    async def broadcast(self, msg_type, data):
        try:
            for ws in self.clients:
                try:
                    await self.emit(ws, msg_type, data)
                except: pass
        except: pass # can fail if a client connects/disconnects mid broadcast, but that's ok

if __name__ == '__main__':
    ip = utils.get_local_ip()
    port = 8888
    server = ControlPanelServer(ip, port)
    asyncio.run(server.start_server())

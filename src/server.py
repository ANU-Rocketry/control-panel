from asyncio.tasks import wait
import websockets
import asyncio
import time
import json
from datalog import Datalog
from LJCommands import CommandString, Command
from traceback import print_exc
import sys
from labjack import get_class
from utils import Path, get_local_ip

# If you run `python3 server.py --dev` you get a simulated LabJack class
# If you run `python3 server.py` it tries to connect properly
# (To connect properly we need LabJackPython's u3.py and the Exodriver, see README)
LabJack = get_class('--dev' in sys.argv)

STATE_GRAB = 50  # Get state from labjacks 50 times per second
STATE_EMIT = 10  # Emit the state to the front end 10 times per second
CONNECTION_TIMEOUT = 600  # Second to timeout and run abort sequence after WHILE ARMED (front-end should disarm after inactivity)

LOG_PATH = Path(__file__).folder('logs')
CONFIG_FILE = Path(__file__).file('config.json')


class LJWebSocketsServer:

    def __init__(self, ip: str, port: int, config=CONFIG_FILE):
        self.config = {}
        self.state = {
            "sequence_executing": None,
            "arming_switch": False,
            "manual_switch": False,
            "current_sequence": [],
            "sequence_running": False,
            "data_logging": False,
            "aborting": False,
            "time": None,
            "latest_warning": None
        }
        self.abort_sequence = None
        self.datalog = None
        self.abort_timer = None

        with open(config, "r") as in_file:
            data = json.loads(in_file.read())
            self.config = data
            command = Command(CommandString.SETSEQUENCE,
                              csv_file=self.config["ABORT_SEQUENCE"])
            self.abort_sequence = command.parameter

        self.labjacks = {}
        self.clients = 0

        for key in self.config:
            if key == "ABORT_SEQUENCE":
                continue
            self.config[key]
            self.labjacks[key] = LabJack(self.config[key]["serial"], self.config[key]["analog"])
            self.state[key] = {
                "digital": {},
                "analog": {}
            }

        self.ip = ip
        self.port = port
        if not self.abort_sequence:
            raise Exception("#5001 No abort sequence supplied. Quitting.")
        print(f"Hosting server on {ip}:{port}")

    async def event_handler(self, websocket, path):
        """
        Going to have to go through the Labjack object and produce the state...
        This will be a separate asynchronous task on a concurrent timer
        """
        self.clients += 1
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
        self.clients -= 1

    async def timeout_counter(self):
        lastConnection = time.time()
        timeSinceLast = 0
        while True:
            if self.clients != 0 or not self.state["arming_switch"]:
                lastConnection = time.time()
            timeSinceLast = time.time() - lastConnection
            if timeSinceLast > (CONNECTION_TIMEOUT):
                self.run_abort_sequence()
            await asyncio.sleep(1)

    async def sync_state(self):
        while True:
            if self.state["data_logging"] and self.datalog:
                self.log_data(self.serialise_state(), type="STATE")
            for key in self.config:
                if key == "ABORT_SEQUENCE":
                    continue
                pin_data = self.labjacks[key].get_state(
                    self.config[key]["digital"], self.config[key]["analog"])
                self.state[key] = pin_data
            self.state["time"] = round(time.time()*1000)

            await asyncio.sleep(1/STATE_GRAB)

    def log_data(self, data, type="MISC"):
        if self.datalog and self.state["data_logging"]:
            self.datalog.log_data(data, type)

    async def consumer_handler(self, ws, path):
        async for message in ws:
            self.log_data(message, type="REQUEST")
            data = json.loads(message)
            if 'command' in data.keys():
                await self.handle_command(ws, data['command']['header'],
                                          data['command'].get('data', None), data['time'])
            else:
                raise Exception("#2069 Invalid Command Given: " + message)

    def run_abort_sequence(self):
        self.log_data(True, type="ABORTING")
        self.state["aborting"] = True
        if not self.state["sequence_running"]:
            self.state["current_sequence"] = [*self.abort_sequence]
            self.execute_sequence()
        self.state["arming_switch"] = False
        self.state["manual_switch"] = False

    def handleException(self, e):
        self.state["latest_warning"] = {
            "id":str(time.time()),
            "message":str(e)
        }

    """
    Implementing logic for command executions...
    """
    async def handle_command(self, ws, header, data, time):
        if header != "PING": print(header)
        #self.time_since_command = round(time.time()*1000)
        try:
            if header == "PING":
                await self.emit(ws, 'PING', time)
                return
            if self.state["aborting"]:
                return  # Aborting hard block
            if header == CommandString.DATALOG:
                if data:
                    self.state["data_logging"] = True
                    self.datalog = Datalog(LOG_PATH)
                    self.log_data(True, type="DATA_LOGGING")
                else:
                    self.log_data(False, type="DATA_LOGGING")
                    self.state["data_logging"] = False
                    self.datalog = None
            if header == CommandString.ARMINGSWITCH:
                self.log_data(None, type="ARMING_SWITCH")
                self.state["arming_switch"] = data
            elif header == CommandString.ABORTSEQUENCE:
                self.run_abort_sequence()
            elif header == CommandString.GETDIGITALSTATES:
                self.LJ_execute(
                    Command(
                        CommandString.GETDIGITALSTATES,
                        parameter=data
                    )
                )
            elif header == CommandString.GETANALOGSTATES:
                self.LJ_execute(
                    Command(
                        CommandString.GETANALOGSTATES,
                        parameter=data
                    )
                )
            elif header == CommandString.SETSEQUENCE:
                command = Command(
                    CommandString.SETSEQUENCE, parameter=data)
                self.state["current_sequence"] = command.parameter
            elif header == CommandString.GETDIGITALSTATES:
                await self.emit(ws, "PINVALUES", self.labjacks[data["name"]].get_state(
                    digital=data["pins"]))
            elif header == CommandString.GETANALOGSTATES:
                await self.emit(ws, "PINVALUES", self.labjacks[data["name"]].get_state(
                    analog=data["pins"]))
            elif header == CommandString.MANUALSWITCH:
                self.state["manual_switch"] = data

            if not self.state["arming_switch"]:
                return  # Arming switch hard block

            if header == CommandString.BEGINSEQUENCE:
                self.execute_sequence()
            elif self.state["manual_switch"]:
                if header == CommandString.OPEN:
                    self.LJ_execute(
                        Command(
                            CommandString.OPEN,
                            parameter=data
                        )
                    )
                elif header == CommandString.CLOSE:
                    self.LJ_execute(
                        Command(
                            CommandString.CLOSE,
                            parameter=data
                        )
                    )
        except Exception as e:
            print_exc()
            self.handleException(e)

    async def producer_handler(self, ws, path):
        while True:
            await asyncio.sleep(1/STATE_EMIT)
            await self.emit(ws, 'STATE', self.serialise_state())

    def serialise_state(self):
        state = {**self.state}
        # convert command objects to dictionaries
        state['current_sequence'] = [x.toDict()
                                     for x in state['current_sequence']]
        return state

    async def start_server(self):
        asyncio.create_task(self.sync_state())
        asyncio.create_task(self.timeout_counter())
        async with websockets.serve(self.event_handler, self.ip, self.port):
            await asyncio.Future()

    def LJ_execute(self, command: Command):
        self.log_data(command.toDict(), "COMMAND_EXECUTED")
        if type(command) == dict:
            command = Command(command['header'], parameter=command['data'])
        if command.header == CommandString.OPEN:
            LJ = command.parameter["name"]
            pin = command.parameter["pin"]
            self.labjacks[LJ].open_valve(pin)
        elif command.header == CommandString.CLOSE:
            LJ = command.parameter["name"]
            pin = command.parameter["pin"]
            self.labjacks[LJ].close_valve(pin)
        else:
            raise Exception(
                "#3104 execute() function was sent unknown command string: " + json.dumps(command.toDict()))

    def execute_sequence(self):
        async def temp():
            if self.state["sequence_running"]:
                raise Exception("#3001 sequence is already running")

            self.state["sequence_running"] = True
            is_abort_sequence = self.state['aborting']

            while len(self.state["current_sequence"]) != 0 and self.state["sequence_running"]:
                self.state["sequence_executing"] = self.state["current_sequence"].pop(
                    0)
                command = self.state["sequence_executing"]
                if command.header == CommandString.SLEEP:
                    self.state["sequence_executing"] = {
                        "header": "SLEEP",
                        "data": command.parameter,
                        "time": round(time.time()*1000) + command.parameter
                    }
                    self.log_data(command.toDict(), type="COMMAND_EXECUTED")
                    print(f"[Sequence] sleeping for {command.parameter}ms")
                    # break sleep into 5ms chunks so aborts will interrupt sleeps
                    def time_ms():
                        return time.time_ns() // 1_000_000
                    expiry = time_ms() + command.parameter # milliseconds
                    x = time_ms()
                    while time_ms() < expiry:
                        if self.state['aborting'] and not is_abort_sequence:
                            is_abort_sequence = True
                            self.state["current_sequence"] = [*self.abort_sequence]
                            break
                        await asyncio.sleep(0.005) # 5ms
                    print(f"delta: {time_ms()-x}ms")
                else:
                    if command.header == CommandString.OPEN:
                        print(f"[Sequence] opening {command.parameter}")
                    elif command.header == CommandString.CLOSE:
                        print(f"[Sequence] closing {command.parameter}")
                    self.LJ_execute(command)
                self.state["sequence_executing"] = None

            self.state["sequence_running"] = False
            self.state["aborting"] = False
        asyncio.ensure_future(temp())

    async def emit(self, ws, msg_type, data):
        # if msg_type == "STATE", data is the state, etc.
        obj = {
            "type": msg_type,
            "time": round(time.time()*1000),
            "data": data
        }
        await ws.send(json.dumps(obj))

def run_server(ip="192.168.1.5", port=8888):
    port = 8888
    socket = LJWebSocketsServer(ip, port)
    asyncio.run(socket.start_server())

if __name__ == '__main__':
    run_server(get_local_ip())

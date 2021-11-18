from asyncio.tasks import wait
import websockets
import asyncio
import time
from timer import Timer
import json
from datalog import Datalog
from lib.LJCommands import *
# Importing from fake labjack so we can test the software
from lib.LabJackFake import LabJack

STATE_GRAB = 50  # Get state from labjacks 50 times per second
STATE_EMIT = 10  # Emit the sate to the front end 10 times per second
CONNECTION_TIMEOUT = 5  # Second to timeout and run abort sequence after
LOG_PATH = "./logs"


class LJWebSocketsServer:

    def __init__(self, ip: str, port: int, config='config.json'):
        self.config = {}
        self.state = {
            "sequence_executing": None,
            "arming_switch": False,
            "manual_switch": False,
            "current_sequence": [],
            "sequence_running": False,
            "data_logging": False,
            "aborting": False,
            "time": None
        }
        self.abort_sequence = None
        self.datalog = None
        self.warning_timer = None
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
            self.labjacks[key] = LabJack(self.config[key]["serial"])
            self.state[key] = {
                "digital": {},
                "analog": {}
            }

        self.ip = ip
        self.port = port
        if not self.abort_sequence:
            raise Exception("#5001 No abort sequence supplied. Quitting.")
        print(f"Hosting server on {ip}:{port}")

    async def timeout_abort():
        # Need to run abort sequence somehow
        raise Exception("600 seconds since last command... aborting")

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

    async def timeoutCounter(self):
        lastConnection = time.time()
        timeSinceLast = 0
        while True:
            timeSinceLast = time.time() - lastConnection
            if not (self.clients == 0 and self.state["arming_switch"]):
                lastConnection = time.time()
            if timeSinceLast > (CONNECTION_TIMEOUT*1000):
                print("ABORT")
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

    """
    Implementing logic for command executions...
    """
    async def handle_command(self, ws, header, data, time):
        #self.time_since_command = round(time.time()*1000)

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
            self.log_data(True, type="ABORTING")
            self.state["aborting"] = True
            self.state["current_sequence"] = [*self.abort_sequence]
            if not self.state["sequence_running"]:
                self.execute_sequence()
            self.state["arming_switch"] = False
            self.state["manual_switch"] = False
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
            print("here")
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

    def start_server(self):
        asyncio.get_event_loop().run_until_complete(
            websockets.serve(self.event_handler, self.ip, self.port))
        asyncio.ensure_future(self.sync_state())
        asyncio.ensure_future(self.timeoutCounter())
        asyncio.get_event_loop().run_forever()

    def LJ_execute(self, command: Command):
        self.log_data(command.toDict(), "COMMAND_EXECUTED")
        if type(command) == dict:
            command = Command(command['header'], parameter=command['data'])
        # TODO: arming switch shouldn't be a toggle, it should take a bool
        if command.header == CommandString.OPEN:
            LJ = command.parameter["name"]
            pin = command.parameter["pin"]
            self.labjacks[LJ].open_relay(pin)
        elif command.header == CommandString.CLOSE:
            LJ = command.parameter["name"]
            pin = command.parameter["pin"]
            self.labjacks[LJ].close_relay(pin)
        else:
            raise Exception(
                "#3104 execute() function was sent unknown command string: " + json.dumps(command.toDict()))

    def execute_sequence(self):
        async def temp():
            if self.state["sequence_running"]:
                raise Exception("#3001 sequence is already running")

            self.state["sequence_running"] = True

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
                    await asyncio.sleep(command.parameter / 1000)
                else:
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


if __name__ == '__main__':
    ip = "127.0.0.1"
    port = 8888
    socket = LJWebSocketsServer(ip, port)
    socket.start_server()

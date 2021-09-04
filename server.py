from asyncio.tasks import wait
import websockets
import asyncio
import time
import json
from lib.LJCommands import *
# Importing from fake labjack so we can test the software
from lib.LabJackFake import LabJack

STATE_GRAB = 20  # Get state from labjacks 20 times per second
STATE_EMIT = 20  # Emit the sate to the front end 20 times per second


class LJWebSocketsServer:

    def __init__(self, ip: str, port: int, config='config.json'):
        self.config = {}
        self.state = {
            "arming_switch": False,
            "manual_switch": False,
            "current_sequence": [],
            "sequence_running": False,
            "data_logging": False,
            "aborting": False
        }
        self.abort_sequence = None

        with open(config, "r") as in_file:
            data = json.loads(in_file.read())
            self.config = data
            print(self.config)
            # ADD ABORT SEQUENCE PARSER HERE

        self.labjacks = {}

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

    async def event_handler(self, websocket, path):
        """
        Going to have to go through the Labjack object and produce the state...
        This will be a separate asynchronous task on a concurrent timer
        """
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

    async def sync_state(self):
        while True:
            await asyncio.sleep(1/STATE_GRAB)
            for key in self.config:
                if key == "ABORT_SEQUENCE":
                    continue
                pin_data = self.labjacks[key].get_state(
                    self.config[key]["digital"], self.config[key]["analog"])
                self.state[key] = pin_data

    async def consumer_handler(self, ws, path):
        async for message in ws:
            data = json.loads(message)
            if 'command' in data.keys():
                await self.handle_command(ws, data['command']['header'],
                                          data['command'].get('data', None), data['time'])

    """
    Implementing logic for command executions...
    """
    async def handle_command(self, ws, header, data, time):
        if not self.state["aborting"]:   
            if header == CommandString.OPEN:
                self.execute(
                    Command(
                        CommandString.OPEN,
                        parameter=data
                    )
                )
            elif header == CommandString.CLOSE:
                self.execute(
                    Command(
                        CommandString.OPEN,
                        parameter=data
                    )
                )
            elif header == CommandString.GETDIGITALSTATES:
                self.execute(
                    Command(
                        CommandString.GETDIGITALSTATES,
                        parameter=data
                    )
                )
            elif header == CommandString.GETANALOGSTATES:
                self.execute(
                    Command(
                        CommandString.GETANALOGSTATES,
                        parameter=data
                    )
                )          
            elif header == CommandString.BEGINSEQUENCE:
                self.execute_sequence()
            elif header == CommandString.ABORTSEQUENCE:
                self.state["aborting"] = True
                if self.state["sequence_running"]:
                    self.state["current_sequence"] = self.abort_sequence
                else:
                    self.state["current_sequence"] = self.abort_sequence
                    self.execute_sequence()      
            elif header == CommandString.ARMINGSWITCH:
                self.execute(
                    Command(
                        CommandString.ARMINGSWITCH,
                        parameter=data
                    )
                )       
            elif header == CommandString.MANUALSWITCH:
                self.execute(
                    Command(
                        CommandString.MANUALSWITCH,
                        parameter=data
                    )
                )
            elif header == CommandString.SETSEQUENCE       

            if header != CommandString.PING.value:
                print(header, data)

            if header == CommandString.PING.value:
                await self.emit(ws, 'PING', time)
            elif header == CommandString.ARMINGSWITCH.value:
                self.execute(Command(CommandString.ARMINGSWITCH, parameter=data))
            elif header == CommandString.OPEN.value:
                self.execute(Command(
                    CommandString.OPEN,
                    parameter=data
                ))
            elif header == CommandString.CLOSE.value:
                self.execute(Command(
                    CommandString.CLOSE,
                    parameter=data
                ))

    async def producer_handler(self, ws, path):
        while True:
            await asyncio.sleep(1/STATE_EMIT)
            await self.emit(ws, 'STATE', self.state)

    def start_server(self):
        asyncio.get_event_loop().run_until_complete(
            websockets.serve(self.event_handler, self.ip, self.port))
        asyncio.get_event_loop().create_task(self.sync_state())
        asyncio.get_event_loop().run_forever()

    def execute(self, command: Command):
        # TODO: arming switch shouldn't be a toggle, it should take a bool
        print(command)
        if command.header == CommandString.ARMINGSWITCH:
            self.state['arming_switch'] = not self.state['arming_switch']
            print(self.state['arming_switch'])
        elif command.header == CommandString.OPEN:
            LJ = command.parameter["name"]
            pin = command.parameter["pin"]
            self.labjacks[LJ].open_relay(pin)
            print(LJ, pin)
        elif command.header == CommandString.CLOSE:
            LJ = command.parameter["name"]
            pin = command.parameter["pin"]
            self.labjacks[LJ].close_relay(pin)
        elif command.header == CommandString.ABORTSEQUENCE:
            print("aborted")
        elif command.header == CommandString.GETDIGITALSTATES:
            # TODO maybe a problem with the LJ naming convention of lower or upper
            LJ = command.parameter["name"]
            for pin in command.parameter["pins"]:
                self.state[LJ]["digital"][pin] = True
        elif command.header == CommandString.GETANALOGSTATES:
            # TODO maybe a problem with the LJ naming convention of lower or upper
            LJ = command.parameter["name"]
            for pin in command.parameter["pins"]:
                self.state[LJ]["analog"][pin] = True
        elif command.header == CommandString.ARMINGSWITCH:
            self.state["arming_switch"] = command.parameter
        elif command.header == CommandString.MANUALSWITCH:
            self.state["manual_switch"] = command.parameter
        elif command.header == CommandString.BEGINSEQUENCE:
            raise Exception("#3101 BEGINSEQUENCE command within non async execute() function")
        elif command.header == CommandString.ABORTSEQUENCE:
            raise Exception("#3102 ABORTSEQUENCE command within non async execute() function")
        elif command.header == CommandString.SLEEP:
            raise Exception("#3103 SLEEP command found outside of sequence in particular in execute() function")
        elif command.header == CommandString.SETSEQUENCE:
            raise Exception("Set sequence called in execute()")
        else:
            raise Exception("#3104 execute() function was sent unknown command string")

    async def execute_sequence(self):
        if self.state["sequence_running"]:
            raise Exception("#3001 sequence is already running")
        
        self.state["sequence_running"] = True

        # not sure if this async stuff works... like will it run the whole thing in a loop? What about the sleeps
        while (self.state["sequence_running"]):
            next_command = self.state["current_sequence"].pop(0)
            self.execute(next_command)

            # await asyncio.sleep

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

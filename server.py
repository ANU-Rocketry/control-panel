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


class LJSocketWebSockets:

    def __init__(self, ip: str, port: int, config='config.json'):
        self.config = {}
        self.state = {
            "arming_switch": False,
            "manual_switch": False,
            "current_sequence": [],
            "sequence_running": False,
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

    async def consumer_handler(self, websocket, path):
        async for message in websocket:
            await self.consumer(message)

    async def producer_handler(self, websocket, path):
        while True:
            message = await self.producer()
            await websocket.send(message)

    def start_server(self):
        asyncio.get_event_loop().run_until_complete(
            websockets.serve(self.event_handler, self.ip, self.port))
        asyncio.get_event_loop().create_task(self.sync_state())
        asyncio.get_event_loop().run_forever()

    async def producer(self):
        await asyncio.sleep(1/STATE_EMIT)

        return json.dumps({
            "type": "STATE",
            'data': self.state,
            'time': time.time()
        })

    def execute(self, command: Command):
        if command.header == CommandString.ARMINGSWITCH:
            self.state['arming_switch'] = not self.state['arming_switch']
            print(self.state['arming_switch'])
        else:
            print(command)

    async def consumer(self, data):
        jData = json.loads(data)
        print(data)
        if 'command' in jData.keys():
            if jData["command"]["header"] == CommandString.PING.value:
                await self.websocket.send(json.dumps(
                    {
                        "PONG": jData["time"]
                    }
                ))
                print("PING")
            elif jData["command"]["header"] == CommandString.ARMINGSWITCH.value:
                self.execute(Command(CommandString.ARMINGSWITCH))
                print("ARMINGSWITCH")


if __name__ == '__main__':
    ip = "127.0.0.1"
    port = 8888
    socket = LJSocketWebSockets(ip, port)
    socket.start_server()

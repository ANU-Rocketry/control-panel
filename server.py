from asyncio.tasks import wait
from tkinter.constants import COMMAND
import websockets
import asyncio
import time
import json
from lib.LJCommands import *
# Importing from fake labjack so we can test the software
from lib.LabJackFake import LabJack

class LJWebSocketsServer:

    def __init__(self, ip: str, port: int, **kwargs):
        self.labjacks = kwargs
        self.ip = ip
        self.port = port
        self.state = {
            'arming_switch': False,
            'digital_pins': {},
            'analog_pins': {}
        }

    async def event_handler(self, websocket, path):
        """
        Going to have to go through the Labjack object and produce the state...
        This will be a separate asynchronous task on a concurrent timer
        """
        consumer_task = asyncio.ensure_future(
            self.consumer_handler(websocket, path))
        producer_task = asyncio.ensure_future(
            self.producer_handler(websocket, path))
        done, pending = await asyncio.wait(
            [consumer_task, producer_task],
            return_when=asyncio.FIRST_COMPLETED,
        )
        for task in pending:
            task.cancel()

    async def consumer_handler(self, ws, path):
        async for message in ws:
            data = json.loads(message)
            if 'command' in data.keys():
                await self.handle_command(ws, data['command']['header'],
                    data['command'].get('parameter', None), data['time'])

    """
    Implementing logic for command executions...
    """
    async def handle_command(self, ws, header, data, time):
        if header != CommandString.PING.value: print(header)

        if header == CommandString.PING.value:
            await self.emit(ws, 'PING', time)
        elif header == CommandString.ARMINGSWITCH.value:
            self.execute(Command(CommandString.ARMINGSWITCH, parameter=data))

    async def producer_handler(self, ws, path):
        while True:
            await asyncio.sleep(1/20)
            await self.emit(ws, 'STATE', self.state)

    def start_server(self):
        start_server = websockets.serve(self.event_handler, self.ip, self.port)
        asyncio.get_event_loop().run_until_complete(start_server)
        asyncio.get_event_loop().run_forever()

    def execute(self, command: Command):
        # TODO: arming switch shouldn't be a toggle, it should take a bool
        if command.header == CommandString.ARMINGSWITCH:
            self.state['arming_switch'] = not self.state['arming_switch']
            print(self.state['arming_switch'])
        else:
            print(command)

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
    socket = LJWebSocketsServer(ip, port, lox=LabJack(1), eth=LabJack(2))
    socket.start_server()

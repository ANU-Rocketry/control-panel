#!/usr/bin/env python

import asyncio
import websockets
import json
from lib.LJCommands import *
# Importing from fake labjack so we can test the software
from lib.LabJackFake import LabJack


class LJClientWebSockets:
    def __init__(self, host, port, loop):
        self.host = host
        self.port = port
        self.loop = loop
        self.state = None
        self.last_update = 0

    async def sendCommand(self, command: Command):
        await self.websocket.send(json.dumps(command.toDict()))

    async def listen(self):
        while True:
            data = json.loads(await self.websocket.recv())
            self.state = data['state']
            self.last_update = data['time']

    async def connect(self):
        uri = "ws://" + self.host + ":" + str(self.port)
        self.websocket = await websockets.connect(uri)

    def start_client(self):
        self.loop.run_until_complete(self.connect())
        self.loop.create_task(self.listen())


if __name__ == '__main__':
    ip = "127.0.0.1"
    port = 8888
    loop = asyncio.new_event_loop()
    socket = LJClientWebSockets(ip, port, loop)
    socket.start_client()
    loop.run_forever()

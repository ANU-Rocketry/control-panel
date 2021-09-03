#!/usr/bin/env python

# WS client example

import asyncio
import websockets
from lib.LJCommands import *
# Importing from fake labjack so we can test the software
from lib.LabJackFake import LabJack

class LJClientWebSockets:
    def __init__(self, host, port):
        self.host = host
        self.port = port

    async def send(self, message):
        await self.websocket.send(message)

    async def listen(self):
        while True:
            print( await self.websocket.recv())

    async def connect(self):
        uri = "ws://" + self.host + ":" + str(self.port)
        self.websocket = await websockets.connect(uri)

    def start_client(self):
        asyncio.get_event_loop().run_until_complete(self.connect())
        tasks = [
            asyncio.ensure_future(self.listen()),
        ]
        asyncio.get_event_loop().run_until_complete(asyncio.wait(tasks))

if __name__ == '__main__':
    ip = "127.0.0.1"
    port = 8888
    socket = LJClientWebSockets(ip, port)
    socket.start_client()

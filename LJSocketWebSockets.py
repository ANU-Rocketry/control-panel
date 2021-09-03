from asyncio.tasks import wait
import websockets
import asyncio
from lib.LJCommands import *
# Importing from fake labjack so we can test the software
from lib.LabJackFake import LabJack

class LJSocketWebSockets:

    def __init__(self, ip: str, port: int, **kwargs):
        self.labjacks = kwargs
        self.ip = ip
        self.port = port
    
    async def event_handler(self, websocket, path):
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

    async def consumer_handler(self, websocket, path):
        async for message in websocket:
            await self.consumer(message)

    async def producer_handler(self, websocket, path):
        while True:
            message = await self.producer()
            await websocket.send(message)

    def start_server(self):
        start_server = websockets.serve(self.event_handler, self.ip, self.port)
        asyncio.get_event_loop().run_until_complete(start_server)
        asyncio.get_event_loop().run_forever()

    async def producer(self):
        await asyncio.sleep(5)
        return "hey"

    async def consumer(self,message):
        print (message)
        

if __name__ == '__main__':
    ip = "127.0.0.1"
    port = 8888
    socket = LJSocketWebSockets(ip, port, lox=LabJack(1), eth=LabJack(2))
    socket.start_server()
    
    

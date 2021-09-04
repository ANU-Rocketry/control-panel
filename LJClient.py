from lib.LJCommands import Command, CommandString
import asyncio
from enum import Enum
from struct import pack
import time
import json

class tcp_client():
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.event_loop = asyncio.new_event_loop()

    def start(self):
        self.event_loop.run_until_complete(self.main())

    async def main(self):
        self.reader, self.writer = await asyncio.open_connection(self.host, self.port)
    
    async def async_send_command(self, command : Command):
        message = json.dumps({
            "command": str(command),
            "time": time.time()
        }).encode('utf-8')
        data = pack('I', len(message)) + message

        self.writer.write(data)
        await self.writer.drain()

        response_length = int.from_bytes(await self.reader.readexactly(4), 'little')
        response = (await self.reader.readexactly(response_length)).decode('utf-8').replace("'", '"')
        return json.loads(response)
    
    def send_command(self, command):
        return self.event_loop.run_until_complete(self.async_send_command(command))
    
    def close(self):
        self.writer.close()
        self.event_loop.run_until_complete(self.writer.wait_closed())


if __name__ == '__main__':
    ip = "127.0.0.1"
    port = 8888

    client = tcp_client(ip,port)
    command = Command(
        header = CommandString.OPEN,
        parameter = ["lox", 13])
    client.start()
    print(client.send_command(command))
    print(client.send_command(command))
    client.close()

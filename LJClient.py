from lib.LJCommands import Command, CommandString
import asyncio
from enum import Enum
from struct import pack
import time
import json


async def tcp_client(ip: str, port: int, command: Command):
    reader, writer = await asyncio.open_connection(host=ip, port=port)
    message = json.dumps({
        "command": str(command),
        "time": time.time()
    }).encode('utf-8')
    data = pack('I', len(message)) + message

    writer.write(data)
    await writer.drain()

    response_length = int.from_bytes(await reader.readexactly(4), 'little')
    response = (await reader.readexactly(response_length)).decode('utf-8').replace("'", '"')
    print(json.loads(response)['response'])

    writer.close()
    await writer.wait_closed()

asyncio.run(tcp_client("127.0.0.1", 8888, Command(CommandString.SLEEP, 5000)))

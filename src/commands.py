
from abc import ABCMeta, abstractmethod
from stands import Stand
import asyncio
import utils

# Commands that the server executes to control the hardware
# Changing pins manually will dispatch a client command which creates a server command
# Creating a sequence creates a list of server commands
# Types include open, close, sleep
class ServerCommand(metaclass=ABCMeta):
    name: str
    @abstractmethod
    async def act(self, server) -> bool: # returns whether it's finished
        pass
    @abstractmethod
    def as_dict(self) -> dict:
        pass # returned dict requires "name" field
    def __str__(self) -> str:
        return self.name

class Sleep(ServerCommand):
    def __init__(self, seconds: int):
        self.name = "SLEEP"
        self.ms = int(seconds * 1000)
        self.remaining = self.ms

    async def act(self, server):
        if self.ms <= 0: return
        # Sleeps for self.ms milliseconds, checking every 5ms if the server wants to interrupt the sleep
        # Interrupts might occur due to pausing or an abort mid-sequence

        # break sleep into 5ms chunks so aborts will interrupt sleeps
        expiry = utils.time_ms() + self.ms # milliseconds
        while (remaining := expiry - utils.time_ms()) >= 0:
            self.remaining = remaining
            if server.should_interrupt_sleep(): break
            await asyncio.sleep(0.005) # 5ms
        # update remaining time if we're pausing so that we can continue by calling act again
        self.ms = max(0, expiry - utils.time_ms())
        return self.ms <= 0

    def as_dict(self):
        return { "name": self.name, "ms": self.ms, "remaining": self.remaining }

class Open(ServerCommand):
    def __init__(self, stand: Stand, pin: int = None):
        if isinstance(stand, tuple): stand, pin = stand # so you can Open(LOX.Main)
        self.name = "OPEN"
        self.stand = stand
        self.pin = pin
    async def act(self, server):
        if server.sequence_command_allowed():
            server.labjacks[self.stand].open_valve(self.pin)
        asyncio.ensure_future(server.broadcast('VALVE', {
            'time': utils.time_ms(), 'header': 'OPEN', 'pin': self.pin
        }))
        return True
    def as_dict(self):
        return { "name": self.name, "stand": self.stand, "pin": self.pin }

class Close(ServerCommand):
    def __init__(self, stand: Stand, pin: int = None):
        if isinstance(stand, tuple): stand, pin = stand # so you can Open(LOX.Main)
        self.name = "CLOSE"
        self.stand = stand
        self.pin = pin
    async def act(self, server):
        if server.sequence_command_allowed():
            server.labjacks[self.stand].close_valve(self.pin)
        asyncio.ensure_future(server.broadcast('VALVE', {
            'time': utils.time_ms(), 'header': 'CLOSE', 'pin': self.pin
        }))
        return True
    def as_dict(self):
        return { "name": self.name, "stand": self.stand, "pin": self.pin }

class ClientCommandString:
    PING = 'PING'
    ARMINGSWITCH = 'ARMINGSWITCH'
    MANUALSWITCH = 'MANUALSWITCH'
    OPEN = 'OPEN'
    CLOSE = 'CLOSE'
    DATALOG = 'DATALOG'
    SETSEQUENCE = 'SETSEQUENCE'
    BEGINSEQUENCE = 'BEGINSEQUENCE'
    ABORTSEQUENCE = 'ABORTSEQUENCE'
    PAUSESEQUENCE = 'PAUSESEQUENCE'

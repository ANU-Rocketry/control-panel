#idea:
#we have a series of objects that are used so that we can view them on the front end.
#all of the computation is done through the field "act"

from abc import ABCMeta, abstractmethod
from stands import Stand, StandConfig
import time
import asyncio

def time_ms():
    return time.time_ns() // 1_000_000

# Commands that the server executes to control the hardware
# Changing pins manually will dispatch a client command which creates a server command
# Creating a sequence creates a list of server commands
# Types include open, close, sleep
class Command(metaclass=ABCMeta):
    name: str
    @abstractmethod
    async def act(self, server):
        pass
    @abstractmethod
    def as_dict(self):
        pass # returned dict requires "name" field
    def __str__(self):
        return self.name

class Sleep(Command):
    def __init__(self, ms: int):
        self.name = "SLEEP"
        self.ms = ms

    async def act(self, server):
        if self.ms <= 0: return
        # Sleeps for self.ms milliseconds, checking every 5ms if the server wants to interrupt the sleep
        # Interrupts might occur due to pausing or an abort mid-sequence

        print(f"[Sequence] sleeping for {self.ms}ms")
        # break sleep into 5ms chunks so aborts will interrupt sleeps
        expiry = time_ms() + self.ms # milliseconds
        while time_ms() < expiry:
            if server.should_interrupt_sleep(): break
            await asyncio.sleep(0.005) # 5ms
        # update remaining time if we're pausing so that we can continue by calling act again
        self.ms = max(0, expiry - time_ms())

    def as_dict(self):
        return { "name": self.name, "ms": self.ms }

class Open(Command):
    def __init__(self, stand: Stand, pin: int):
        self.name = "OPEN"
        self.stand = stand
        self.pin = pin
    async def act(self, server):
        server.labjacks[self.stand].open_valve(self.pin)
    def as_dict(self):
        return { "name": self.name, "stand": self.stand, "pin": self.pin }

class Close(Command):
    def __init__(self, stand: Stand, pin: int):
        self.name = "CLOSE"
        self.stand = stand
        self.pin = pin
    async def act(self, server):
        server.labjacks[self.stand].close_valve(self.pin)
    def as_dict(self):
        return { "name": self.name, "stand": self.stand, "pin": self.pin }

#parser: map(eval, string.split("\n")) #check new line

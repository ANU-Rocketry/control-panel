#idea:
#we have a series of objects that are used so that we can view them on the front end.
#all of the computation is done through the field "act"

from enum import Enum
from abc import ABCMeta, abstractmethod



class Command(metaclass=ABCMeta):

    name: str

    @abstractmethod
    def act(server):
        pass

    def __str__(self):
        return self.name

    @abstractmethod
    def as_dict(self):
        # returned dict requires "name" field
        pass

class Sleep(Command):
    def __init__(self, ms: int):
        self.name = "SLEEP"
        self.ms = ms

    def act(server):
        raise Exception("NOT IMPLEMENTED YET")

    def as_dict(self):
        return { "name": self.name, "ms": self.ms }

class Open(Command):
    def __init__(self, stand: Stand, pin: Pin):
        self.name = "OPEN"
        self.stand = stand
        self.pin = pin

    def act():
        raise Exception("NOT IMPLEMENTED YET")
    def as_dict(self):
        return {name: self.name, stand: self.stand, name: self.name}

class Close(Command):
    def __init__(self, stand, name):
        self.name = "Close " + stand + " " + name
        self.stand = stand
        self.name = name
    def act():
        except Exception("NOT IMPLEMENETED YET")
    def as_dict(self):
        return {name: self.name, stand: self.stand, name: self.name}

#parser: map(eval, string.split("\n")) #check new line

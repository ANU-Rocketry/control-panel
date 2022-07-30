#idea:
#we have a series of objects that are used so that we can view them on the front end.
#all of the computation is done through the field "act"

from enum import Enum

#THIS IS AN INTERFACE, DO NOT INSTANTIATE
class Command:
    def __init__(self):
        self.name = "ERROR: DO NOT INSTANTIATE THE COMMAND CLASS"
    def act():
        except Exception("DO NOT USE THE COMMAND CLASS")
    def __str__(self):
        return self.name
    def as_dict(self):
        #returned dict requires "name" field
        except Exception("DO NOT USE THE COMMAND CLASS")

class Sleep(Command):
    def __init__(self, ms):
        self.name = "Sleep " + str(ms)
        self.ms = ms
    def act():
        except Exception("NOT IMPLEMENTED YET")
    def as_dict(self):
        return {name: self.name, ms: self.ms}

class Open(Command):
    def __init__(self, stand, name):
        self.name = "Open " + stand + " " + name
        self.stand = stand
        self.name = name #convert to pin numbers
    def act():
        except Exception("NOT IMPLEMENTED YET")
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

class stands(Enum):
    LOX = 1
    ETH = 2

class pins(Enum):
    ?????

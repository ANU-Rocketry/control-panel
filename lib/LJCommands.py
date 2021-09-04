import json
import csv
from enum import Enum
import ast
import time

ALLOWED_CHANNEL_NUMS = [14,12,10,8,19,17,16,18,9,11,13,15]

class CommandString(str, Enum):
    """
    An enum to define command headers/names.
    """
    SLEEP = 'SLEEP',
    OPEN = 'OPEN',
    CLOSE = 'CLOSE',
    GETDIGITALSTATES = 'GETDIGITALSTATES',
    GETANALOGSTATES = 'GETANALOGSTATES',
    SETSEQUENCE = 'SETSEQUENCE',
    BEGINSEQUENCE = 'BEGINSEQUENCE',
    ABORTSEQUENCE = 'ABORTSEQUENCE',
    ARMINGSWITCH = 'ARMINGSWITCH',
    MANUALSWITCH = 'MANUALSWITCH',
    DATALOG = "DATALOG",
    PING = 'PING'

"""
Paras: take in a command string and a data value is the JSON
"""

class StandString(str, Enum):
    LOX = 'LOX',
    ETH = 'ETH'

class Command():
    """
    The Command object defines a command that is processable by the LJSocket.
    """

    def __init__(self, header: CommandString, parameter=None, csv_file=None):
        """ The constructor for a command object. Ensures a valid command is provided.

        Args:
            header (CommandString, optional): A command string defining the header of the command. Defaults to None.
            parameter ([type], optional): The parameter of the command, the type is dependent on the header. Defaults to None.
            csv_file ([type], optional): A csv to produce a sequence command from. Defaults to None.
        """

        """
        Make sure command string is perfectly formed with the parameters...
        Run abort sequence and error packet to the client.
        """
        
        self.parameter = parameter
        self.header = header

        if (type(header) != CommandString):
            raise Exception("#2001 command header is not valid")

        if (not csv_file and not parameter):
            raise Exception("#2002 parameter and csv file is not provided")
        
        # If a csv is provided and no parameter create from csv
        if csv_file and not parameter:
            try:
                assert header == CommandString.SETSEQUENCE
            except:
                raise Exception("#2003 csv provided and no parameter without SETSEQUENCE header")
            
            commands = []
            with open(csv_file, 'r') as in_file:
                data = csv.reader(in_file, delimiter=',')
                for line in data:
                    param_dict = {}
                    if not (line[0] == CommandString.OPEN 
                            or line[0] == CommandString.CLOSE
                            or line[0] == CommandString.SLEEP):
                        raise Exception(f"#2004 invalid first column command for sequence '{line[0]}'")
                    
                    if line[0] != CommandString.SLEEP:
                        if not (type(line[1]) == StandString):
                            raise Exception(f"#2005 invalid second column command for sequence '{line[1]}'")
                        
                        if not (line[2] in ALLOWED_CHANNEL_NUMS):
                            raise Exception(f"#2006 with OPEN or CLOSE, PIN is not within allowed channel numbers '{line[2]}'")

                        param_dict["name"] = line[1]
                        param_dict["pin"] = line[2]
                    else:
                        if not (type(line[1]) == int):
                            raise Exception(f"#2007 sleep duration is not an integer '{line[1]}'")

                        param_dict["miliseconds"] = line[1]

                    commands.append(
                        Command(CommandString(line[0]), parameter=param_dict))
                self.parameter = commands
            

        # Checks that parameter types are valid
        if self.header in [CommandString.OPEN, CommandString.CLOSE]:
            if not (type(self.parameter) == dict
                and (type(self.parameter["name"]) == StandString)
                and (type(self.parameter["pin"]) in ALLOWED_CHANNEL_NUMS)):
                    raise Exception(f"#2008 for single OPEN or CLOSE command, param dictionary is malformed '{parameter}'")

        elif self.header in [CommandString.GETDIGITALSTATES, CommandString.GETANALOGSTATES]:
            if not (type(self.parameter) == dict
                    and type(self.parameter["name"]) == StandString
                    and type(self.parameter["pins"] == list)):
                    raise Exception(f"#2009 digital or analogue state request is malformed")
            
            for pin in self.parameter["pins"]:
                if not (pin in ALLOWED_CHANNEL_NUMS):
                    raise Exception(f"#2010 pin '{pin}' is not an allowed pin numnber in digital or analog state read")

        elif self.header == CommandString.SLEEP:
            if not type(self.parameter["milisecond"]) == int:
                raise Exception(f"#2011 SLEEP command does not have an integer")

    # Converts a command to a string that is parsable by LJSocket and for readability
    def __str__(self) -> str:
        if self.header == CommandString.SETSEQUENCE:
            param = list(map(str, self.parameter))
            return str([self.header.value, param])
        return str([self.header.value, self.parameter])

    def toDict(self) -> dict:
        return {
            'header': self.header.name,
            'parameter': self.parameter
        }

import json
import csv
from enum import Enum
import ast
import time

# Could be wrong
ALLOWED_CHANNEL_NUMS = [14, 12, 10, 8, 19, 17, 16, 18, 9, 11, 13, 15]


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

STANDSTRINGS = ['LOX', 'ETH']


class Command():
    """
    The Command object defines a command that is processable by the LJSocket.
    """

    def __init__(self, header: CommandString, parameter=None, csv_file=None):
        """ The constructor for a command object. Ensures a valid command is provided.

        Outdated...
        Args:
            header (CommandString, optional): A command string defining the header of the command. Defaults to None.
            parameter ([type], optional): The parameter of the command, the type is dependent on the header. Defaults to None.
            csv_file ([type], optional): A csv to produce a sequence command from. Defaults to None.
        """

        self.parameter = parameter
        self.header = header

        if (type(header) != CommandString):
            raise Exception("#2001 command header is not valid")

        # If a csv is provided and no parameter create from csv
        if csv_file and not parameter:
            try:
                assert header == CommandString.SETSEQUENCE
            except:
                raise Exception(
                    "#2101 csv provided and no parameter without SETSEQUENCE header")

            commands = []
            with open(csv_file, 'r') as in_file:
                data = csv.reader(in_file, delimiter=',')
                for line in data:
                    if not (line[0] == CommandString.OPEN
                            or line[0] == CommandString.CLOSE
                            or line[0] == CommandString.SLEEP):
                        raise Exception(
                            f"#2102 invalid first column command for sequence '{line[0]}'")

                    if line[0] != CommandString.SLEEP:
                        param_dict = {}
                        if not (line[1] in STANDSTRINGS):
                            raise Exception(
                                f"#2103 invalid second column command for sequence '{line[1]}'")

                        if not (line[2] in ALLOWED_CHANNEL_NUMS):
                            raise Exception(
                                f"#2104 with OPEN or CLOSE, PIN is not within allowed channel numbers '{line[2]}'")

                        param_dict["name"] = line[1]
                        param_dict["pin"] = line[2]
                        commands.append(
                            Command(CommandString(line[0]), parameter=param_dict))
                    else:
                        if not (type(line[1]) == int):
                            raise Exception(
                                f"#2105 sleep duration is not an integer '{line[1]}'")
                        param = line[1]
                        commands.append(
                            Command(CommandString(line[0]), parameter=param))

                self.parameter = commands

        # Checks that parameter types are valid
        if self.header in [CommandString.OPEN, CommandString.CLOSE]:
            if not (type(self.parameter) == dict
                    and (self.parameter["name"] in STANDSTRINGS)
                    and (self.parameter["pin"] in ALLOWED_CHANNEL_NUMS)):
                raise Exception(
                    f"#2201 for single OPEN or CLOSE command, param dictionary is malformed '{parameter}'")

        elif self.header in [CommandString.GETDIGITALSTATES, CommandString.GETANALOGSTATES]:
            if not (type(self.parameter) == dict
                    and self.parameter["name"] in STANDSTRINGS
                    and type(self.parameter["pins"] == list)):
                raise Exception(
                    f"#2202 digital or analogue state request is malformed")

            for pin in self.parameter["pins"]:
                if not (pin in ALLOWED_CHANNEL_NUMS):
                    raise Exception(
                        f"#2203 pin '{pin}' is not an allowed pin numnber in digital or analog state read")

        elif self.header == CommandString.SLEEP:
            if not type(self.parameter) == int:
                raise Exception(
                    f"#2204 SLEEP command does not have an integer")

        elif self.header == CommandString.ARMINGSWITCH or self.header == CommandString.MANUALSWITCH:
            if not (type(self.parameter) == bool):
                print(self.parameter)
                raise Exception(
                    f"#2205 switch {self.header} is not of bool type")

    # Converts a command to a string that is parsable by LJSocket and for readability
    def __str__(self) -> str:
        return str([self.header.value, self.parameter])

    def toDict(self) -> dict:
        return {
            "header": self.header,
            "data": self.parameter
        }

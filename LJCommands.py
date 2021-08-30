import json
import csv
from enum import Enum
from typing import Sequence
import ast


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
    PING = "PING"


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
        self.parameter = parameter
        self.header = header

        # If a csv is provided and no parameter create from csv
        if csv_file and not parameter:
            assert header == CommandString.SETSEQUENCE
            commands = []
            with open(csv_file, 'r') as in_file:
                data = csv.reader(in_file, delimiter=',')
                for cString, param in data:
                    commands.append(
                        Command(CommandString(cString), parameter=int(param)))
                self.parameter = commands

        # Check the header is a CommandString and isn't null
        assert type(self.header) == CommandString and self.header

        # Checks that parameter types are valid
        if self.header in [CommandString.OPEN, CommandString.CLOSE]:
            assert (type(self.parameter) == list
                    and type(self.parameter[0]) == str
                    and type(self.parameter[1]) == int
                    and self.parameter != None)

        elif self.header in [CommandString.GETDIGITALSTATES, CommandString.GETANALOGSTATES]:
            assert (type(self.parameter) == list
                    and type(self.parameter[0]) == str
                    and type(self.parameter[1]) == list
                    and [type(i) == int for i in self.parameter[1]])

        elif self.header == CommandString.SETSEQUENCE:
            assert type(self.parameter) == list
            for command in self.parameter:
                assert type(command) == Command
                assert command.header in [
                    CommandString.SLEEP, CommandString.OPEN, CommandString.CLOSE]

        elif self.header == CommandString.SLEEP:
            assert type(self.parameter == int)

    # Converts a command to a string that is parsable by LJSocket and for readability
    def __str__(self) -> str:
        if self.header == CommandString.SETSEQUENCE:
            param = list(map(str, self.parameter))
            return str([self.header.value, param])
        return str([self.header.value, self.parameter])
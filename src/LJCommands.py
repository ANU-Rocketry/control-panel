import json
import csv

# Could be wrong
ALLOWED_CHANNEL_NUMS = [14, 12, 10, 8, 19, 17, 16, 18, 9, 11, 13, 15]


class CommandString:
    SLEEP = 'SLEEP'
    OPEN = 'OPEN'
    CLOSE = 'CLOSE'
    GETDIGITALSTATES = 'GETDIGITALSTATES'
    GETANALOGSTATES = 'GETANALOGSTATES'
    SETSEQUENCE = 'SETSEQUENCE'
    BEGINSEQUENCE = 'BEGINSEQUENCE'
    ABORTSEQUENCE = 'ABORTSEQUENCE'
    ARMINGSWITCH = 'ARMINGSWITCH'
    MANUALSWITCH = 'MANUALSWITCH'
    DATALOG = 'DATALOG'

STANDSTRINGS = ['LOX', 'ETH']

def parse_sequence_csv(file: str) -> list['Command']:
    commands = []
    with open(file, 'r') as in_file:
        data = list(csv.reader(in_file, delimiter=','))

    for line in data:
        command = line[0]

        match command:
            case CommandString.SLEEP:
                duration = int(line[1])
                assert type(duration) == int and duration >= 0, f"Sleep duration '{duration}' is invalid"
                commands.append(Command(command, duration))

            case CommandString.OPEN | CommandString.CLOSE:
                stand, pin = line[1], int(line[2])
                assert stand in STANDSTRINGS, f"Invalid test stand '{stand}'"
                assert pin in ALLOWED_CHANNEL_NUMS, f"Invalid pin '{pin}' for open/close in sequence"
                commands.append(Command(command, { 'name': stand, 'pin': pin }))

            case _:
                assert False, f"Invalid command '{command}' for sequence"

    return commands

class Command:

    def __init__(self, header: str, parameter=None, csv_file=None):
        self.parameter = parameter
        self.header = header

        # If a csv is provided and no parameter create from csv
        if csv_file and not parameter:
            try:
                assert header == CommandString.SETSEQUENCE
            except:
                raise Exception(
                    "#2101 csv provided and no parameter without SETSEQUENCE header")

            self.parameter = parse_sequence_csv(csv_file)

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

        elif self.header in [CommandString.ARMINGSWITCH, CommandString.MANUALSWITCH, CommandString.DATALOG]:
            if not (type(self.parameter) == bool):
                raise Exception(
                    f"#2205 switch {self.header} is not of bool type")

        elif self.header in [CommandString.BEGINSEQUENCE, CommandString.ABORTSEQUENCE]:
            if self.parameter is not None:
                raise Exception(
                    f"#2206 begin/end sequence takes no parameters")

        elif self.header == CommandString.SETSEQUENCE:
            if type(self.parameter) != list:
                raise Exception(
                    f"#2207 sequence is not a valid list of command JSON's or Command objects")
            for i, commandlike in enumerate(self.parameter):
                # if the JSON/dict is invalid we'll get an exception
                if type(commandlike) == str:
                    commandlike = json.loads(commandlike)
                if type(commandlike) == dict:
                    commandlike = Command(
                        header=CommandString[commandlike['header']], parameter=commandlike['parameter'])
                self.parameter[i] = commandlike

    # Converts a command to a string that is parsable by LJSocket and for readability
    def __str__(self) -> str:
        return str([self.header.value, self.parameter])

    def toDict(self) -> dict:
        return {
            "header": self.header,
            "data": self.parameter
        }

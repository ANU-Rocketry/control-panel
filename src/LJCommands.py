from dataclasses import dataclass, asdict
import json
import csv

# Could be wrong
ALLOWED_CHANNEL_NUMS = [14, 12, 10, 8, 19, 17, 16, 18, 9, 11, 13, 15]


class CommandString:
    SLEEP = 'SLEEP'
    OPEN = 'OPEN'
    CLOSE = 'CLOSE'
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
                commands.append(Command(command, duration))

            case CommandString.OPEN | CommandString.CLOSE:
                stand, pin = line[1], int(line[2])
                commands.append(Command(command, { 'name': stand, 'pin': pin }))

            case _:
                assert False, f"Invalid command '{command}' for sequence"
    return commands

@dataclass
class Command:
    header: str
    data: object

    def __init__(self, header: str, data: object):

        # Validation
        match header:
            case CommandString.SLEEP:
                duration = data
                assert type(duration) == int and duration >= 0, f"Sleep duration '{duration}' is invalid"
            case CommandString.OPEN | CommandString.CLOSE:
                stand, pin = data['name'], data['pin']
                assert stand in STANDSTRINGS, f"Invalid test stand '{stand}'"
                assert pin in ALLOWED_CHANNEL_NUMS, f"Invalid pin '{pin}' for open/close in sequence"
            case CommandString.SETSEQUENCE:
                if type(data) == str:
                    data = parse_sequence_csv(data)
                assert type(data) == list
                for i, cmd in enumerate(data):
                    if type(cmd) == str:
                        data[i] = json.loads(cmd)
                    if type(cmd) == dict:
                        if 'parameter' in cmd:
                            cmd['data'] = cmd['parameter']
                            del cmd['parameter']
                        data[i] = Command(**cmd)
            case CommandString.ARMINGSWITCH | CommandString.MANUALSWITCH | CommandString.DATALOG:
                assert type(data) == bool
            case CommandString.BEGINSEQUENCE, CommandString.ABORTSEQUENCE:
                assert data is None

        # Initialisation
        self.header = header
        self.data = data

    # Converts a command to a string that is parsable by LJSocket and for readability
    def __str__(self) -> str:
        return json.dumps(self.as_dict())

    def as_dict(self) -> dict:
        return asdict(self)

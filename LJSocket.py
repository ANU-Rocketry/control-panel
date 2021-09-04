import asyncio
from asyncio.exceptions import IncompleteReadError
from collections import deque
from lib.LJCommands import *
# Importing from fake labjack so we can test the software
from lib.LabJackFake import LabJack
from struct import *
import json
import time

import websockets


class LJSocket:
    """The LJSocket class provides a tcp interface with the labjacks given upon
    instansiation.
    See Docs for command schema
    """

    def __init__(self, ip: str, port: int, **kwargs):
        """
        The constructor for the LJSocket class. Providing the ability to customise
        how the LJSocket interfaces with the LabJacks.

        Args:
            ip (str): ip to host socket on
            port (int): port to host on
            **kwargs: labjack names and LabJack objects
        """

        self.labjacks = kwargs
        self.ip = ip
        self.port = port

        # Tells us whether there is currently a sequence runing
        self.SEQUENCE_RUNNING = False
        self.SEQUENCE = deque()  # A sequence is represented by a double sided queue of commands
        self.event_loop = asyncio.new_event_loop()

    def startServer(self):
        """
            This function starts the asynchronous TCP server.
        """
        self.event_loop.create_task(self.main())
        self.event_loop.run_forever()

    async def _handle_connection(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
        """
        A private function which handles incomming new connections.

        Args:
            reader (asyncio.StreamReader): A stream reader object, supplied the asyncio stream
            writer (asyncio.StreamWriter): A stream writer object, supplied the asyncio stream
        """
        # Loop, looking for new incoming data
        while True:
            print("hjere")
            """ When new data commands in it comes in the format (32bitInt:data),
            the 32 bit integer is unsigned and tells us the size of the data. """
            r = await reader.readexactly(calcsize('I'))
            message_size = int.from_bytes(r, byteorder='little')
            try:
                # read in the amount of data we now know we need from the TCP connection
                data = json.loads((await reader.readexactly(message_size)).decode('utf-8'))
                # try to parse the data and the command is valid, execute it
                command = self.parse_input(data)
                self.execute_command(command)
                response = str(
                    {"response": "Command Executed Successfully",
                     "time": time.time()}).encode('utf-8')

            # If the data is not valid or a problem occurs this will throw but not kill the thread.
            except Exception as e:
                print(e)
                response = str({"response": f"Error has occured. Check server log.",
                               "time": time.time()}).encode('utf-8')

            # Create a binary string to respond with
            response_data = pack('I', len(response)) + response

            # Send the response
            writer.write(response_data)
            await writer.drain()

    async def main(self):
        """The `main` function is asynchronous and can be added to the event loop
        as a task to start the server
        """
        server = await asyncio.start_server(
            self._handle_connection, '127.0.0.1', 8888)

        addr = server.sockets[0].getsockname()
        print(f'Serving on {addr}')

        async with server:
            await server.serve_forever()

    def parse_input(self, data: dict) -> Command:
        """The `parse_input` function takes a incomming VALID tcp request and
        will form a valid command object from the request.

        Args:
            data (dict): A valid incoming TCP request payload.

        Returns:
            Command: A command object that can be processed.
        """
        string = data["command"]  # We retrieve the string representing the command
        lst = ast.literal_eval(string)  # We evaluate this string as is
        assert len(lst) == 2  # ensure the length of so called command is 2
        # Determine the header as a CommandString enum
        newHeader = CommandString(lst[0])
        param = lst[1]  # Take down the parameters

        # Parse a sequence
        if newHeader == CommandString.SETSEQUENCE:
            params = []
            for command in param:
                subHeader, subParam = ast.literal_eval(command)
                params.append(Command(header=CommandString(
                    subHeader), parameter=int(subParam)))
            return Command(newHeader, params)

        # return our parsed command object
        return Command(newHeader, int(param))

    def isInputValid(self, input: dict) -> bool:
        """A simple function to determine whether an input is valid or not

        Args:
            input (dict): A dictionary recieved via TCP
        Returns:
            bool: True if command is valid, False otherwise.
        """
        try:
            command = self.parse_input(input["command"])
            # TO DO - check if parameters contain a labjack, if so ensure we have that labjack in self.labjacks
        except:
            return False
        return ("command" in input.keys()
                and "time" in input.keys())

    async def execute_sequence(self):
        """
        The execute_sequence function begins the sequence that is 
        """
        if self.SEQUENCE_RUNNING:
            raise Exception('Sequence is already running.')
        self.SEQUENCE_RUNNING = True
        while(self.SEQUENCE):
            nextCommand = self.SEQUENCE.popleft()
            # Process command here - TO BE DONE

        self.SEQUENCE_RUNNING = False

    def execute_command(self, command: Command):
        """Executes a given command

        Args:
            command (Command): A valid Command object
        """

        # Command router
        router = {
            "OPEN": self.executeClose,
            "CLOSE": self.executeOpen,
            "GETANALOGSTATES": self.executeGetAnalogStates
        }

        # Execute relevent function with parameters
        if command.header in router.keys():
            router[command.header](command.parameter)

    def executeClose(self, params: tuple[str, int]):
        """Executes a closing command

        Args:
            params (tuple[str, int]): A valid command parameter, (name of labjack, pin to close)
        """
        self.labjacks[params[0]].closeRelay(params[1])

    def executeOpen(self, params: tuple[str, int]):
        """Executes an opening command

        Args:
            params (tuple[str, int]): A valid command parameter, (name of labjack, pin to open)
        """
        # TO DO

    def executeGetAnalogStates(self, params: list[int]) -> list[float]:
        """Gets states of analog pins

        Args:
            params ([name, [int]]): A list containing name of target labjack and list of pins to read
        Returns:
            [float]: a list of voltages for the pins in the same order
        """
        lj = self.labjacks[params[0]]
        voltages = []
        for pin in params:
            voltages.append(lj.getVoltage(pin))
        return voltages


if __name__ == '__main__':
    ip = "127.0.0.1"
    port = 8888

    socket = LJSocket(ip, port, lox=LabJack(1), eth=LabJack(2))
    socket.startServer()

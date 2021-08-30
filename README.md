# LJSoftware

Full stack suite to allow custom control of LabJacks, over TCP for rocket testing

# Data Schema

Data is transferred between socket and client over TCP.

This TCP request is structured as follows:

`<32 bit integer describing size of data><JSON formated in utf-8>`

## JSON

The data in a valid TCP request is JSON following the schema:

```json
{
"command":Command as a string,
"time": Seconds since EPOC
}
```

## Command

A command consists of a `header` and a `parameter`. Valid commands can be seen below:


| header | parameter | example |
| - | - | - |
| OPEN | [labjack_name, pin] | ['OPEN', ['eth', 13]] |
| CLOSE | [labjack_name, pin] | ['CLOSE', ['eth', 13]] |
| SLEEP | milliseconds | ['SLEEP', 1300] |
| GETDIGITALSTATES | [labjack_name, [pin1, pin2, ...]] | ['GETDIGITALSTATES', [1, 3]] |
| GETANALOGSTATES | [labjack_name, [pin1, pin2, ...]] | ['GETANALOGSTATES', [7, 9]] |
| BEGINSEQUENCE | None | 'BEGINSEQUENCE' |
| ABORTSEQUENCE | None | 'ABORTSEQUENCE' |
| SETSEQUENCE | [command1, command2, ...] | \[['OPEN', ['eth', 13]], ['SLEEP', 1300]] |

A sequence is a list of multiple commands. These commands can only consist of `OPEN`, `CLOSE` and `SLEEP` commands.

These commands can be represented and authorised by the `LJCommands.py/Command` object. They can also be represented as strings in the JSON TCP requests.

# Project Overview

The `LabJack.py` file contains a simple library used to communicate with the LabJacks themselves. The `LabJackFake.py` file provides a fake interface such that we can build the rest of the software without the LabJacks.


The `LJCommands.py` file contains the `Command` and `CommandString` objects, which define hollistic commands and headers respectively. The `Command` object ensures correctness of commands. This object throws errors.


The `LJClient.py` will contain an object that interfaces with the `LJSocket` over TCP and contains an interface similar to that in `LabJack.py` to communicate with the LabJacks, abstracting all TCP yucky stuff.


The `LJSocket.py` file contains the `LJSocket` object which hosts an asynchronous TCP web server that serves clients, parses JSON data, commands, and all backend stuff.

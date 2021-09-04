# LJSoftware

Full stack suite to allow custom control of LabJacks, over TCP for rocket testing

# Data Schema

Data is transferred between socket and client over TCP.

This TCP request is structured as follows:

`<32 bit integer describing size of data><JSON formated in utf-8>`

## JSON

The data in a valid TCP request (from client to server) is JSON following the schema:

```json
{
"command":
  {
    "header": <Header String>,
    "data": <Command Parameter>
  },
"time": <Time in milliseconds since EPOC>
}
```
The data in a state 'emit' from the server is JSON following the schema:

```json
{
"type": "STATE",
"data":
  {
    "arming_switch" : Bool,
    "manual_switch" : Bool,
    "current_sequence" : null or list of commands,
    "sequence_running": Bool,
    "lox":
      {
        "digital":{
          Pin(int):Bool
        },
        "analog":{
          Pin(int):Float
        }
      },
     "eth":
      {
        "digital":{
          Pin(int):Bool
        },
        "analog":{
          Pin(int):Float
        }
      }
  },
"time": <Time in milliseconds since EPOC>
}
```
The data in an error response follows the following schema:

```json
{
"type": "ERROR",
"data": Error message,
"time": <Time in milliseconds since EPOC>
}
```

## Command

A command consists of a `header` and a `parameter`. Valid commands can be seen below:


| header | parameter |
| - | - |
| OPEN | {"name":labjack_name, "pin":pin} |
| CLOSE | {"name":labjack_name, "pin":pin} |
| SLEEP | {"milliseconds": time in ms} |
| GETDIGITALSTATES | {"name":labjack_name, "pins":[pin1, pin2, ...]} |
| GETANALOGSTATES | {"name":labjack_name, "pins":[pin1, pin2, ...]}|
| BEGINSEQUENCE | (parameter is unimportant) |
| ABORTSEQUENCE | (parameter is unimportant) |
| ARMINGSWITCH | on_bool |
| MANUALSWITCH | on_bool |
| SETSEQUENCE | [command1, command2, ...] |

A sequence is a list of multiple commands. These commands can only consist of `OPEN`, `CLOSE` and `SLEEP` commands.

These commands can be represented and authorised by the `LJCommands.py/Command` object. They can also be represented as strings in the JSON TCP requests.

# Error Handling

Errors are categorised according to their importance by a system of numbering:
  - 1000-level digits are overall importance
  - 100-level digits partition errors accoridng to subtype

### Command Errors

| error code | description |
| - | - |
| 2001 | Command header is not valid |
| 2101 | Csv provided and no parameter without SETSEQUENCE header |
| 2102 | Invalid first column command for sequence |
| 2103 | Invalid second column command for sequence |
| 2104 | With OPEN or CLOSE, PIN is not within allowed channel numbers |
| 2105 | Sleep duration is not an integer |
| 2201 | For single OPEN or CLOSE command, param dictionary is malformed |
| 2202 | Digital or analogue state request is malformed |
| 2203 | Pin is not an allowed numnber in digital or analog state read |
| 2204 | SLEEP is not of integer type |
| 2205 | ARMINGSWITCH or MANUALSWITCH is not of bool type |

# Project Overview

The `LabJack.py` file contains a simple library used to communicate with the LabJacks themselves. The `LabJackFake.py` file provides a fake interface such that we can build the rest of the software without the LabJacks.


The `LJCommands.py` file contains the `Command` and `CommandString` objects, which define hollistic commands and headers respectively. The `Command` object ensures correctness of commands. This object throws errors.


The `LJClient.py` will contain an object that interfaces with the `LJSocket` over TCP and contains an interface similar to that in `LabJack.py` to communicate with the LabJacks, abstracting all TCP yucky stuff.


The `LJSocket.py` file contains the `LJSocket` object which hosts an asynchronous TCP web server that serves clients, parses JSON data, commands, and all backend stuff.

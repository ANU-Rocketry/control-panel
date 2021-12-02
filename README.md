# LJSoftware

Full stack suite to allow custom control of LabJacks, over TCP for rocket testing

![screenshot](./screenshot.png)

This project consists of two parts: a backend that runs on a Raspberry Pi written in Python, and a front end website client written using Node.js. The two communicate over a point-to-point wifi connection. In order to use this project you only need Python 3 and Python's Pip package manager (installed by default with Python).

On the Raspberry Pi, download this repository, run `pip install asyncio websockets` in a terminal. You will also need the LabJack `u3` Python library

Then you can run the server with `python server.py` in the RPi terminal. Currently the LabJack data is fake, if you have a real LabJack plugged into the RPi and `u3` installed then just change the line `from lib.LabJackFake import LabJack` in `server.py` to `from lib.LabJack import LabJack` and it should work.

To run the front-end, on your laptop download this repository, go to the `reactfront/build` folder and open a terminal. Then run `python http.server` and open the link it comes up with.

To connect to a RPi, find the local IP address of the RPi (looks like `192.168.1.20` or `10.20.68.27`) and write the local IP address in the Raspberry Pi IP field in the front end. It should then start showing data. If it stops showing data it's not connected.

If you have any problems, just file a GitHub Issue or email us if you have our details.

# TODO

* Document `LabJackFake`
* Link to where you can download `u3.py` (or is it a pip module?)
* Document the sequence feature and link to the example sequence files with explanations

# Development

To run the dev build of the front-end, you will need to install Node.js on the computer you're running the front-end on. Then download this repository on that computer, go into the `reactfront` folder in a terminal / command prompt, run `npm install` and then `npm start`. After a short wait this will open a browser tab with the front end in it. When you're done make sure to `npm run build` so the `reactfront/build` folder is updated.

# Data Schema

Data is transferred between the server and client over websockets.

## JSON

The data in a valid request (from client to server) is JSON following the schema:

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
| DATALOG | on_bool |
| SETSEQUENCE | [command1, command2, ...] |

A sequence is a list of multiple commands. These commands can only consist of `OPEN`, `CLOSE` and `SLEEP` commands.

These commands can be represented and authorised by the `LJCommands.py/Command` object. They can also be represented as strings in the JSON TCP requests.

# Error Handling

Errors are categorised according to their importance by a system of numbering:
  - 1000-level digits are overall importance
  - 100-level digits partition errors according to subtype

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
| 2206 | Begin/end sequence takes no parameters |
| 2207 | Invalid sequence (not a list of JSON strings, dictionaries or Command objects) |

# Project Overview

The `LabJack.py` file contains a simple library used to communicate with the LabJacks themselves. The `LabJackFake.py` file provides a fake interface such that we can build the rest of the software without the LabJacks.


The `LJCommands.py` file contains the `Command` and `CommandString` objects, which define hollistic commands and headers respectively. The `Command` object ensures correctness of commands. This object throws errors.


The `LJClient.py` will contain an object that interfaces with the `LJSocket` over TCP and contains an interface similar to that in `LabJack.py` to communicate with the LabJacks, abstracting all TCP yucky stuff.


The `LJSocket.py` file contains the `LJSocket` object which hosts an asynchronous TCP web server that serves clients, parses JSON data, commands, and all backend stuff.

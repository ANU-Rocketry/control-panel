
from enum import Enum
from labjack import get_class, LabJackBase

class Stand:
    LOX = 'LOX'
    ETH = 'ETH'

# These LabJack pin numbers are duplicated in the front end
class LOX:
    SerialNumber = 1

    Main = ('LOX', 16)
    Fill = ('LOX', 18)
    Drain = ('LOX', 9)
    Pressure = ('LOX', 11)
    Vent = ('LOX', 13)
    Purge = ('LOX', 15)
    Valves = [Main[1], Fill[1], Drain[1], Pressure[1], Vent[1], Purge[1]]

    N2Sensor = ('LOX', 1)
    LOXSensor = ('LOX', 3)
    Sensors = [N2Sensor[1], LOXSensor[1]]

class ETH:
    SerialNumber = 2

    Main = ('ETH', 14)
    Fill = ('ETH', 12)
    Drain = ('ETH', 10)
    Pressure = ('ETH', 8)
    Vent = ('ETH', 19)
    Purge = ('ETH', 17)
    Valves = [Main[1], Fill[1], Drain[1], Pressure[1], Vent[1], Purge[1]]

    N2Sensor = ('ETH', 1)
    ETHSensor = ('ETH', 3)
    Sensors = [N2Sensor[1], ETHSensor[1]]

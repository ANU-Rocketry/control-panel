
class Stand:
    LOX = 'LOX'
    ETH = 'ETH'

# These LabJack pin numbers are duplicated in the front end

class LightStand(Stand):
    def __init__(self, stand):
      self.green = (stand, 13)
      self.yellow = (stand, 12)
      self.red = (stand, 18)
      self.buzzer = (stand, 19)

      self.LightStand = [self.green[1], self.yellow[1], self.red[1], self.buzzer[1]]

class LOX:
    SerialNumber = 2

    Main = ('LOX', 15)
    Fill = ('LOX', 16)
    Drain = ('LOX', 17)
    Pressure = ('LOX', 8)
    Vent = ('LOX', 9)
    Purge = ('LOX', 14)
    Valves = [Main[1], Fill[1], Drain[1], Pressure[1], Vent[1], Purge[1]]

    LightStand = LightStand('LOX')

    N2Sensor = ('LOX', 1)
    LOXSensor = ('LOX', 3)
    Sensors = [N2Sensor[1], LOXSensor[1]]

class ETH:
    SerialNumber = 1

    Main = ('ETH', 15)
    Fill = ('ETH', 16)
    Drain = ('ETH', 17)
    Pressure = ('ETH', 8)
    Vent = ('ETH', 9)
    Purge = ('ETH', 14)
    Valves = [Main[1], Fill[1], Drain[1], Pressure[1], Vent[1], Purge[1]]

    LightStand = LightStand('LOX')

    N2Sensor = ('ETH', 1)
    ETHSensor = ('ETH', 3)
    Sensors = [N2Sensor[1], ETHSensor[1]]

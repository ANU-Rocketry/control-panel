
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
  
    name = "LOX"
    
    SerialNumber = 2

    Main = ('LOX', 14)
    Fill = ('LOX', 16)
    Drain = ('LOX', 17)
    Pressure = ('LOX', 9)
    Vent = ('LOX', 10)
    Purge = ('LOX', 8)
    Chill = ('LOX', 15)
    #added Chill to LOX valves
    Valves = [Main[1], Fill[1], Drain[1], Pressure[1], Vent[1], Purge[1], Chill[1]]

    LightStand = LightStand('LOX')

    # N2Sensor is plugged back into FIO5 (the thermocouple's dummy MOSI pin moved
    # off FIO5 to EIO3 to make room - see Thermocouple below).
    N2Sensor = ('LOX', 5)
    # LOXSensor restored onto FIO4, since that pin is free (the UART only claimed
    # FIO6/FIO7, not FIO4/FIO5 - see CryoFlowUART below).
    LOXSensor = ('LOX', 4)
    # OLD: analog 4-20mA cryo flow sensor, replaced by UART below
    # CryoFlowSensor = ('LOX', 2)  # New cryogenic flow sensor
    # InletPressureSensor moved from FIO6 to FIO2 (the old, now-unused analog cryo
    # sensor pin) so the U3's onboard hardware UART could take over FIO6/FIO7 as its
    # adjacent TX/RX pair. Also update reactfront/src/pins.json's lox_inlet entry to
    # match (labjack_pin duplicated there for the frontend).
    InletPressureSensor = ('LOX', 2)
    # OLD: Sensors = [N2Sensor[1], LOXSensor[1], CryoFlowSensor[1], InletPressureSensor[1]]
    Sensors = [N2Sensor[1], LOXSensor[1], InletPressureSensor[1]]

    # Cryo flow meter — microcontroller reads the PT420 and streams CSV lines
    # (timestamp_ms,freq_Hz,filtered_Hz,L_per_s) over the U3's onboard hardware UART
    # (see labjack.py's asynchConfig/get_cryo_flow_lps - not bit-banged GPIO).
    # TX=FIO6, RX=FIO7 (fixed adjacent pair - labjack.py explicitly passes 'tx' below
    # as the TimerCounterPinOffset, rather than relying on the library's FIO4/5 default).
    CryoFlowUART = {'rx': 7, 'tx': 6, 'baud': 114286}

    # MAX6675 thermocouple SPI pins: SCK=FIO1, CS=FIO0, SO=FIO3
    # 'mosi' is unused by the MAX6675 (it only transmits on SO, no data in) but the
    # U3's native hardware SPI command still requires a MOSI pin number and briefly
    # drives it as output during each transfer - EIO3 (11) is used since nothing
    # else on this stand claims it (FIO5 went back to N2Sensor). Keep EIO3 unwired.
    Thermocouple = {'sck': 1, 'cs': 0, 'so': 3, 'mosi': 11}

class ETH:
    SerialNumber = 1
    
    name = "ETH"

    Main = ('ETH', 15)
    Fill = ('ETH', 16)
    Drain = ('ETH', 17)
    Pressure = ('ETH', 8)
    Vent = ('ETH', 9)
    Purge = ('ETH', 14)
    Igniter = ('ETH', 10)  # New igniter valve for ethanol
    
    Valves = [Main[1], Fill[1], Drain[1], Pressure[1], Vent[1], Purge[1], Igniter[1]]

    # Light stands for both ETH and LOX are same
    LightStand = LightStand('LOX')

    N2Sensor = ('ETH', 5)
    ETHSensor = ('ETH', 4)
    InletPressureSensor = ('ETH', 6) 
    LoadCell = ('ETH', 0)  # FIO0 - DC voltage from load cell amplifier
    # LOX stand's load cell, wired into this (ETH) LabJack - so its voltage arrives
    # in the ETH stand's analog readings, not the LOX stand's.
    LOXLoadCell = ('ETH', 1)  # FIO1 - DC voltage from load cell amplifier
    Sensors = [N2Sensor[1], ETHSensor[1], InletPressureSensor[1], LoadCell[1], LOXLoadCell[1]]

    # MAX6675 thermocouple SPI pins: SCK=FIO3, CS=FIO2, SO=EIO3
    # 'mosi' is unused by the MAX6675 (it only transmits on SO, no data in) but the
    # U3's native hardware SPI command still requires a MOSI pin number and briefly
    # drives it as output during each transfer - moved from FIO1 to FIO7 when the
    # LOX load cell took FIO1 (see LOXLoadCell above). FIO7 is the only FIO pin
    # nothing else on this stand (valves, sensors, light stand, CS/SCK above)
    # claims. Keep FIO7 unwired.
    Thermocouple = {'sck': 3, 'cs': 2, 'so': 11, 'mosi': 7}



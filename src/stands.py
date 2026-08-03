
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

    # N2Sensor/LOXSensor were on FIO5/FIO4 - unplugged and freed up so the U3's
    # onboard hardware UART (see CryoFlowUART below) could take over those two pins,
    # which it needs as an adjacent TX/RX pair. Not read while the UART owns FIO4/5.
    # N2Sensor = ('LOX', 5)
    # LOXSensor = ('LOX', 4)
    # OLD: analog 4-20mA cryo flow sensor, replaced by UART below
    # CryoFlowSensor = ('LOX', 2)  # New cryogenic flow sensor
    InletPressureSensor = ('LOX', 6)
    # OLD: Sensors = [N2Sensor[1], LOXSensor[1], CryoFlowSensor[1], InletPressureSensor[1]]
    Sensors = [InletPressureSensor[1]]

    # Cryo flow meter — microcontroller reads the PT420 and streams CSV lines
    # (timestamp_ms,freq_Hz,filtered_Hz,L_per_s) over the U3's onboard hardware UART
    # (see labjack.py's asynchConfig/get_cryo_flow_lps - not bit-banged GPIO).
    # TX=FIO4, RX=FIO5 (fixed adjacent pair, the U3's default UART pin offset).
    # 'rx'/'tx' below are informational only - the real pin routing is controlled by
    # configIO's TimerCounterPinOffset (defaulted to 4 in asynchConfig), not these keys.
    CryoFlowUART = {'rx': 5, 'tx': 4, 'baud': 114286}

    # MAX6675 thermocouple SPI pins: SCK=FIO1, CS=FIO0, SO=FIO3
    Thermocouple = {'sck': 1, 'cs': 0, 'so': 3}

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
    Sensors = [N2Sensor[1], ETHSensor[1], InletPressureSensor[1], LoadCell[1]]

    # MAX6675 thermocouple SPI pins: SCK=FIO3, CS=FIO2, SO=EIO3
    Thermocouple = {'sck': 3, 'cs': 2, 'so': 11}



from abc import ABCMeta, abstractmethod
from traceback import print_exc
import sys
import time
import math
import random
from stands import LOX, ETH

def get_class(dev: bool) -> type:
    return LabJackFake if dev else LabJack

class LabJackBase(metaclass=ABCMeta):
    """Base class for LabJack and LabJackFake"""

    config: type
          
    @abstractmethod
    def _set_digital_state(self, pin_number: int, open: bool):
        pass # don't call this (call set_valve_state), but do override it

    @abstractmethod
    def _set_valve_state(self, pin_number: int, open: bool):
        pass # don't call this (call set_valve_state), but do override it

    @abstractmethod
    def get_valve_state(self, pin_number: int) -> bool:
        pass
    
    @abstractmethod
    def _get_digital_state(self, pin_number: int) -> bool:
        pass

    @abstractmethod
    def get_voltage(self, pin_number: int) -> float:
        pass

    @abstractmethod
    def get_thermocouple_temp(self) -> float | None:
        pass

    @abstractmethod
    def get_cryo_flow_lps(self) -> float | None:
        pass

    def open_valve(self, pin_number: int):
        self.set_valve_state(pin_number, True)

    def close_valve(self, pin_number: int):
        self.set_valve_state(pin_number, False)

    def set_valve_state(self, pin_number: int, open: bool):
        # make sure that we end up in an allowed state by coercing other valves as needed
        # ie if opening vent is requested, close pressurisation and then open vent rather than doing nothing
        # or going into a dangerous state
        # if open and pin_number == LOX.Pressure[1]:
        #     self._set_valve_state(LOX.Vent[1], False)
        # if open and pin_number == ETH.Pressure[1]:
        #     self._set_valve_state(ETH.Vent[1], False)
        # if open and pin_number == LOX.Vent[1]:
        #     self._set_valve_state(LOX.Pressure[1], False)
        # if open and pin_number == ETH.Vent[1]:
        #     self._set_valve_state(ETH.Pressure[1], False)

        self._set_valve_state(pin_number, open)

    def get_state(self) -> dict:
        """
        Returns a dictionary of states of all valves and analog pins for a given stand's pins
        Used to update the entire front end 20 times a second.
        Example: { "digital": { 1: True, 2: False, 3: True }, "analog": { 4: 1.3, 5: 2.7, 6: 0.01} }
        """
        state = {}
        if self.digital_pins:
            state["digital"] = {}
            for pin in self.digital_pins:
                state["digital"][pin] = self.get_valve_state(pin)
        if self.analog_inputs:
            state["analog"] = {}
            for pin in self.analog_inputs:
                state["analog"][pin] = self.get_voltage(pin)
        if self.light_stand_pins:
            state["light_stand"] = {}
            for pin in self.light_stand_pins:
                state["light_stand"][pin] = self._get_digital_state(pin)
        if hasattr(self.config, 'Thermocouple'):
            state["temperature"] = self.get_thermocouple_temp()
        if hasattr(self.config, 'CryoFlowUART'):
            state["cryo_flow_lps"] = self.get_cryo_flow_lps()
        return state

    def _is_inverted_relay(self, pin_number):
        # the vent valves (ETH 19, LOX 13) have relays at 0 (low voltage) iff the valve is mechanically closed
        # all other valves have relays at 1 (high voltage) iff the valves are mechanically open
        # this is part of the electronics
        # the interface of this class hides this implementation detail
        if (self.config.name == "ETH"):
          return pin_number == ETH.Vent[1]
        else:
          return pin_number == LOX.Vent[1]

class LabJack(LabJackBase):
    """
    Manages a handle to a real LabJack and lets you open/close valves (controlled by digital pins/relays)
    and read voltages (analog pins). All methods may throw exceptions.
    The LabJack must be plugged in via USB and the LabJack Exodriver must
    be installed before instantiating a LabJack object.
    """

    def __init__(self, standConfig: type):
        """Opens a USB connection to a LabJack and configures whether pins are analog/digital"""
        self.config = standConfig
        self.digital_pins = standConfig.Valves
        self.analog_inputs = standConfig.Sensors
        self.light_stand_pins = standConfig.LightStand.LightStand
        # Import LabJackPython (Python imports are cached so this only happens once)
        import LabJackPython
        # if you get an error here do `sudo pip uninstall LabJackPython` and then `sudo pip install LabJackPython==2.0.4`
        assert LabJackPython.__version__ == '2.0.4', 'User error: LabJackPython pip module must be exactly v2.0.4'
        import u3
        self.serial_number = standConfig.SerialNumber
        self.device = u3.U3(firstFound=False, serial=self.serial_number)
        x = 0
        for pin in self.analog_inputs:
            x |= 1 << int(pin)
        # print(self.device.configIO())
        self.device.configIO(FIOAnalog=x, EIOAnalog=0)
        self._tc_cache = None
        self._tc_last_read = 0.0
        self._cryo_cache = None
        self._cryo_last_read = 0.0

    def _get_digital_state(self, pin_number: int) -> bool:
        try:
            return self.device.getDIOState(pin_number)
        except Exception:
            print(pin_number)
            print_exc()
            print(f"pin: {pin_number}")
            sys.exit()

    def _set_digital_state(self, pin_number: int, state: bool):
        # Set the value in the hardware
        self.device.setDIOState(pin_number, state=int(state))

    def _set_valve_state(self, pin_number: int, open: bool):
        """
        Opens/closes a valve by toggling the relay (digital pin) on the LabJack
        We make no guarantee it will be successful (may fail silently due to hardware error or invalid state)
        or when it will happen (it may happen asynchronously some milliseconds later, you can check by calling
        get_valve_state later).
        Note that some valves are on when their relays are high voltage and some are on
        when they're low voltage. We abstract this away here so don't worry about it.
        """
        # Invert if the relay on state opposes the valve open state
        if self._is_inverted_relay(pin_number): open = not open
        # Set the value in the hardware
        self._set_digital_state(pin_number, open)

    def get_valve_state(self, pin_number: int) -> bool:
        """Returns True if the valve is mechanically open and False otherwise"""
        if self._is_inverted_relay(pin_number): return not self._get_digital_state(pin_number)
        else: return self._get_digital_state(pin_number)

    def get_voltage(self, pin_number: int) -> float:
        try:
            return self.device.getAIN(pin_number)
        except Exception:
            print(pin_number)
            print_exc()
            print(f"pin {pin_number}")
            sys.exit()

    def _spiread8(self, sck: int, so: int) -> int:
        """Read 8 bits from MAX6675 via SPI bit-bang, MSB first.
        Matches MAX6675 Arduino library spiread() exactly:
          SCK LOW -> delay -> read bit -> SCK HIGH -> delay -> repeat
        """
        d = 0
        for i in range(7, -1, -1):
            self._set_digital_state(sck, False)
            time.sleep(0.001)                          # 1ms, matches Arduino delay(1)
            if self._get_digital_state(so):
                d |= (1 << i)
            self._set_digital_state(sck, True)
            time.sleep(0.001)
        return d

    def _read_thermocouple_once(self, sck: int, cs: int, so: int) -> float | None:
        """Single raw read from MAX6675. Returns °C or None on fault/error."""
        self._set_digital_state(sck, True)    # SCK idles HIGH
        self._set_digital_state(cs, False)    # CS LOW — begin read
        time.sleep(0.001)                      # 1ms setup delay

        v = self._spiread8(sck, so)            # high byte (bits 15:8)
        v <<= 8
        v |= self._spiread8(sck, so)           # low byte  (bits 7:0)

        self._set_digital_state(cs, True)      # CS HIGH — end read

        if v & 0x4:                            # bit 2: open thermocouple fault
            return None
        return (v >> 3) * 0.25                 # bits 14:3 → °C at 0.25°C resolution

    def get_thermocouple_temp(self) -> float | None:
        """Read temperature from MAX6675, taking median of 3 reads to reject noise spikes.
        A single bad SPI read (from EMI or relay switching) gets outvoted by the other two.
        """
        if not hasattr(self.config, 'Thermocouple'):
            return None
        now = time.time()
        if now - self._tc_last_read < 1.0:
            return self._tc_cache
        tc = self.config.Thermocouple
        sck, cs, so = tc['sck'], tc['cs'], tc['so']
        try:
            readings = []
            for _ in range(3):
                val = self._read_thermocouple_once(sck, cs, so)
                if val is not None:
                    readings.append(val)
                time.sleep(0.005)              # 5ms between reads — MAX6675 needs time to settle

            temp = sorted(readings)[len(readings) // 2] if readings else None
        except Exception:
            try:
                self._set_digital_state(cs, True)
            except Exception:
                pass
            print_exc()
            temp = None
        self._tc_cache = temp
        self._tc_last_read = now
        return temp

    def _uart_read_byte(self, rx_pin: int, bit_period: float, timeout: float = 0.5) -> int | None:
        """
        Bit-bang read one UART byte (8 data bits, no parity, 1 stop bit) from rx_pin.
        Returns None if no start bit appears within `timeout` seconds.
        """
        deadline = time.time() + timeout
        # Idle is HIGH; wait for the line to drop (start bit)
        while self._get_digital_state(rx_pin):
            if time.time() > deadline:
                return None

        # Skip past the start bit into the middle of data bit 0
        time.sleep(bit_period * 1.5)

        byte = 0
        for i in range(8):
            if self._get_digital_state(rx_pin):
                byte |= (1 << i)  # LSB first
            time.sleep(bit_period)

        return byte

    def _uart_read_line(self, rx_pin: int, baud: int, max_chars: int = 80) -> str | None:
        """Bit-bang read ASCII characters from rx_pin until a newline, or None on timeout."""
        bit_period = 1.0 / baud
        chars = []
        for _ in range(max_chars):
            byte = self._uart_read_byte(rx_pin, bit_period)
            if byte is None:
                break
            char = chr(byte)
            if char in ('\n', '\r'):
                if chars:
                    break
                continue  # skip leading line endings
            chars.append(char)
        return ''.join(chars) if chars else None

    def get_cryo_flow_lps(self) -> float | None:
        """
        Reads one CSV line from the cryo flow meter's UART stream
        (timestamp_ms,freq_Hz,filtered_Hz,L_per_s) and returns the L_per_s column.
        Throttled to once per second; returns the last good value on parse/timeout
        failures (e.g. the "=== LOGGING ON ===" header line) so a bad read doesn't
        blank the display.
        """
        if not hasattr(self.config, 'CryoFlowUART'):
            return None
        now = time.time()
        if now - self._cryo_last_read < 1.0:
            return self._cryo_cache

        cfg = self.config.CryoFlowUART
        line = self._uart_read_line(cfg['rx'], cfg['baud'])
        if line:
            parts = line.strip().split(',')
            if len(parts) == 4:
                try:
                    self._cryo_cache = float(parts[3])
                except ValueError:
                    pass  # not a data row (e.g. header), keep last good value

        self._cryo_last_read = now
        return self._cryo_cache

class LabJackFake(LabJackBase):
    """
    FAKE LabJack class for mock testing when you don't have access to a real LabJack. Mirrors the LabJack class interface.
    Maintains digital pin states you set and returns sine waves for the voltages.
    """

    def __init__(self, standConfig: type):
        self.config = standConfig
        self.digital_pins = standConfig.Valves
        self.analog_inputs = standConfig.Sensors
        self.light_stand_pins = standConfig.LightStand.LightStand
        self.serial_number = standConfig.SerialNumber
        self.state = {
            "digital": {},
            "analog": {},
            "light_stand": {}
        }
        self._tc_last_read = 0.0

    def _set_default_state(self, pin_number: int):
        default_on = [13, 19]  # only vent valves are default on
        self.state['digital'][pin_number] = True if pin_number in default_on else False

    def _set_digital_state(self, pin_number: int, state: bool):
        self.state["light_stand"][pin_number] = state
    
    def _set_valve_state(self, pin_number: int, state: bool):
        self.state["digital"][pin_number] = state
        
    def _get_digital_state(self, pin_number: int) -> bool:
        if pin_number in self.state["light_stand"]:
            return self.state["light_stand"][pin_number]
        else:
            self.state["light_stand"][pin_number] = False
            return self._get_digital_state(pin_number)

    def get_valve_state(self, pin_number: int) -> bool:
        if pin_number in self.state["digital"]:
            return self.state["digital"][pin_number]
        else:
            self._set_default_state(pin_number)
            return self.get_valve_state(pin_number)

    def get_voltage(self, pin_number: int) -> float:
        spike = 1 if random.random() > 0.995 else 0
        high = math.sin(time.time() + pin_number + self.serial_number) * 0.4
        low = math.sin(time.time() / 10 + pin_number + 7) * 2
        return high + low + 1 + (random.random() - 0.5) * 0.2 + spike

    def get_thermocouple_temp(self) -> float | None:
        return round(25.0 + math.sin(time.time() * 0.1 + self.serial_number) * 5.0, 2)

    def get_cryo_flow_lps(self) -> float | None:
        if not hasattr(self.config, 'CryoFlowUART'):
            return None
        return round(0.9 + math.sin(time.time() / 5 + self.serial_number) * 0.5, 4)

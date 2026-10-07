from abc import ABCMeta, abstractmethod
from traceback import print_exc, format_exc
import sys
import time
import math
import random
import threading
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

    @abstractmethod
    def send_cryo_command(self, char: str) -> bool:
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

    def __init__(self, standConfig: type, log_callback=print):
        """Opens a USB connection to a LabJack and configures whether pins are analog/digital"""
        self.config = standConfig
        self.digital_pins = standConfig.Valves
        self.analog_inputs = standConfig.Sensors
        self.light_stand_pins = standConfig.LightStand.LightStand
        # Used for [CRYO] diagnostics below. Defaults to plain print() so this class
        # still works standalone; server.py passes its own log_debug so these messages
        # also show up live in the frontend's debug log panel, not just the terminal.
        self._log = log_callback
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
        self._cryo_cache = None
        self._cryo_line_buffer = ''
        self._cryo_last_debug_print = 0.0

        # Guards every actual self.device.* USB call. The thermocouple read is a slow
        # bit-banged SPI read (see _thermocouple_worker) that runs on its own background
        # thread so it can't stall the main asyncio event loop - but the LabJack USB
        # handle isn't safe for concurrent access from two threads, so both threads must
        # serialize on this lock around individual device calls. (The cryo flow read
        # doesn't need this treatment: it uses the U3's own onboard hardware UART
        # peripheral - see get_cryo_flow_lps - so it's a single fast USB call, not a
        # blocking bit-bang loop, and can run directly on the main thread.)
        self._device_lock = threading.Lock()
        self._tc_lock = threading.Lock()

        if hasattr(standConfig, 'CryoFlowUART'):
            cfg = standConfig.CryoFlowUART
            tx = cfg['tx']
            assert cfg['rx'] == tx + 1, \
                f"CryoFlowUART rx={cfg['rx']} must be tx={tx}+1 - the U3 hardware UART fixes RX to the pin right after TX"
            # Enables the U3's onboard hardware UART (see section 4.1.12 of the U3
            # datasheet), explicitly routed via TimerCounterPinOffset=tx so it lands on
            # whatever pin this stand's config actually specifies (TX=tx, RX=tx+1),
            # instead of silently falling back to the library's FIO4/FIO5 default.
            self.device.configIO(EnableUART=True, TimerCounterPinOffset=tx)
            result = self.device.asynchConfig(UARTEnable=True, DesiredBaud=cfg['baud'], configurePins=False)
            self._log(f"[CRYO] asynchConfig on {standConfig.name}: {result} (baud={cfg['baud']}, TX=FIO{tx}/RX=FIO{tx + 1})")
        if hasattr(standConfig, 'Thermocouple'):
            threading.Thread(target=self._thermocouple_worker, daemon=True).start()

    def _get_digital_state(self, pin_number: int) -> bool:
        try:
            with self._device_lock:
                return self.device.getDIOState(pin_number)
        except Exception:
            print(pin_number)
            print_exc()
            print(f"pin: {pin_number}")
            sys.exit()

    def _set_digital_state(self, pin_number: int, state: bool):
        # Set the value in the hardware
        with self._device_lock:
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
            with self._device_lock:
                return self.device.getAIN(pin_number)
        except Exception:
            print(pin_number)
            print_exc()
            print(f"pin {pin_number}")
            sys.exit()

    def _read_thermocouple_once(self, sck: int, cs: int, so: int, mosi: int) -> float | None:
        """Single raw read from MAX6675, using the U3's native hardware SPI engine
        (low-level function 0x3A, exposed as device.spi()) instead of bit-banging
        GPIO in software. One USB call clocks all 16 bits with a real on-device SCK
        and samples MISO in sync with it - software bit-banging can't keep a clock
        edge and a USB-polled pin read in sync at any real speed (a round trip is
        1-5ms), which is the same reason the cryo flow sensor needed the U3's
        hardware UART instead of bit-banged GPIO (see get_cryo_flow_lps).

        MOSIPinNum is a required argument but unused by the MAX6675 (SO only, no
        data in) - it must be a genuinely free pin since the U3 drives it as a
        digital output during the transfer, which would glitch anything actually
        wired there. See stands.py's Thermocouple dict for which pin and why.

        SPIMode='B' (CPOL=0, CPHA=1) matches common MAX6675 SPI implementations,
        but this is not verified against this exact wiring - check real readings
        against a known temperature once hardware is available; if they come out
        garbled/inverted, 'A' (CPOL=0, CPHA=0) is the other mode worth trying.
        """
        try:
            with self._device_lock:
                result = self.device.spi(
                    [0x00, 0x00],
                    AutoCS=True,
                    SPIMode='B',
                    SPIClockFactor=0,  # fastest this call supports (tens of kHz) - comfortably under the MAX6675's 4.3MHz max and in the ballpark of the ~100kHz target
                    CSPinNum=cs,
                    CLKPinNum=sck,
                    MISOPinNum=so,
                    MOSIPinNum=mosi,
                )
        except Exception:
            print_exc()
            return None

        hi, lo = result['SPIBytes']
        v = (hi << 8) | lo
        if v & 0x4:                            # bit 2: open thermocouple fault
            return None
        return (v >> 3) * 0.25                 # bits 14:3 → °C at 0.25°C resolution

    def _thermocouple_worker(self):
        """
        Runs on a dedicated background thread for the lifetime of the process. Each
        read is now a single fast hardware-SPI USB call (see _read_thermocouple_once)
        rather than a ~100-150ms bit-banged loop, but this still takes a median of 3
        reads 5ms apart to reject noise spikes (EMI/relay switching), so it stays off
        the main asyncio thread to keep get_thermocouple_temp() a non-blocking cache
        read - the same pattern already used for the cryo flow UART read.
        """
        tc = self.config.Thermocouple
        sck, cs, so, mosi = tc['sck'], tc['cs'], tc['so'], tc['mosi']
        while True:
            try:
                readings = []
                for _ in range(3):
                    val = self._read_thermocouple_once(sck, cs, so, mosi)
                    if val is not None:
                        readings.append(val)
                    time.sleep(0.005)  # 5ms between reads — MAX6675 needs time to settle

                temp = sorted(readings)[len(readings) // 2] if readings else None
                with self._tc_lock:
                    self._tc_cache = temp
            except Exception:
                print_exc()
            time.sleep(1.0)  # matches the sensor's own ~1s update cadence

    def get_thermocouple_temp(self) -> float | None:
        """
        Returns the most recent MAX6675 temperature reading (median of 3, to reject
        noise spikes from EMI/relay switching). Non-blocking: the actual SPI bit-bang
        read happens continuously on a background thread (_thermocouple_worker) and
        this just reads its latest cached result.
        """
        if not hasattr(self.config, 'Thermocouple'):
            return None
        with self._tc_lock:
            return self._tc_cache

    def get_cryo_flow_lps(self) -> float | None:
        """
        Reads any newly buffered bytes from the U3's onboard hardware UART peripheral
        (enabled once in __init__ via asynchConfig - see 4.1.12 in the U3 datasheet)
        and parses the latest complete CSV line (timestamp_ms,freq_Hz,filtered_Hz,L_per_s)
        for the L_per_s column. asynchRX() is a single fast USB call that just fetches
        bytes the UART hardware has already received and decoded on-device - unlike the
        old GPIO bit-banging approach, there's no blocking wait here, so this can run
        directly in the main loop like any other sensor read.
        """
        if not hasattr(self.config, 'CryoFlowUART'):
            return None
        try:
            with self._device_lock:
                result = self.device.asynchRX()
            n = min(32, result['NumAsynchBytesInRXBuffer'])
            if n > 0:
                chunk = bytes(result['AsynchBytes'][:n]).decode('ascii', errors='replace')
                self._log(f"[CRYO] {self.config.name}: received {n} bytes: {chunk!r}")
                self._cryo_line_buffer += chunk
                if len(self._cryo_line_buffer) > 500:  # guard against runaway growth if we ever lose sync
                    self._cryo_line_buffer = self._cryo_line_buffer[-500:]
            else:
                # Throttled so this doesn't spam the terminal at 20Hz - lets you
                # confirm the poll loop itself is alive even when nothing is arriving.
                now = time.time()
                if now - self._cryo_last_debug_print > 2.0:
                    self._log(f"[CRYO] {self.config.name}: polling, 0 bytes in RX buffer")
                    self._cryo_last_debug_print = now
        except Exception:
            # Routed through self._log (not print_exc) so this shows up in the
            # frontend debug log too, not just the terminal.
            self._log(f"[CRYO] {self.config.name}: error reading UART:\n{format_exc()}")
            return self._cryo_cache

        while '\n' in self._cryo_line_buffer:
            line, self._cryo_line_buffer = self._cryo_line_buffer.split('\n', 1)
            stripped = line.strip()
            parts = stripped.split(',')
            if len(parts) == 4:
                try:
                    self._cryo_cache = float(parts[3])
                    self._log(f"[CRYO] {self.config.name}: parsed line {stripped!r} -> L/s={self._cryo_cache}")
                except ValueError:
                    self._log(f"[CRYO] {self.config.name}: line {stripped!r} has 4 fields but last one isn't a number")
            elif stripped:
                self._log(f"[CRYO] {self.config.name}: line {stripped!r} doesn't have 4 comma-separated fields (probably a header/log line)")

        return self._cryo_cache

    def send_cryo_command(self, char: str) -> bool:
        """
        Sends a single command character to the cryo flow meter's microcontroller over
        the U3's onboard hardware UART TX line (the same peripheral get_cryo_flow_lps
        reads from - see asynchConfig in __init__). e.g. the microcontroller's firmware
        treats 't' as a test-mode toggle. Uses asynchTX, the write counterpart to
        asynchRX - also a single fast USB call, not a blocking bit-bang send.
        """
        if not hasattr(self.config, 'CryoFlowUART'):
            return False
        try:
            with self._device_lock:
                self.device.asynchTX([ord(char)])
            self._log(f"[CRYO] {self.config.name}: sent command {char!r}")
            return True
        except Exception:
            self._log(f"[CRYO] {self.config.name}: error sending command {char!r}:\n{format_exc()}")
            return False

class LabJackFake(LabJackBase):
    """
    FAKE LabJack class for mock testing when you don't have access to a real LabJack. Mirrors the LabJack class interface.
    Maintains digital pin states you set and returns sine waves for the voltages.
    """

    def __init__(self, standConfig: type, log_callback=print):
        self.config = standConfig
        self.digital_pins = standConfig.Valves
        self.analog_inputs = standConfig.Sensors
        self.light_stand_pins = standConfig.LightStand.LightStand
        self._log = log_callback
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

    def send_cryo_command(self, char: str) -> bool:
        if not hasattr(self.config, 'CryoFlowUART'):
            return False
        self._log(f"[CRYO] {self.config.name}: (fake) would send command {char!r}")
        return True

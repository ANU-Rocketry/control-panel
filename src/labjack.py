
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

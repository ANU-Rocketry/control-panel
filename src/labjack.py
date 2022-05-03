
from abc import ABCMeta, abstractmethod
from traceback import print_exc
import sys
from typing import Optional, Type
import time
import math
import random

def get_class(dev: bool) -> Type:
    return LabJackFake if dev else LabJack

class LabJackBase(metaclass=ABCMeta):
    """Base class for LabJack and LabJackFake"""

    @abstractmethod
    def __init__(self, serial_number: int, analog_inputs: list[int]):
        pass

    @abstractmethod
    def set_valve_state(self, pin_number: int, open: bool):
        pass

    @abstractmethod
    def get_valve_state(self, pin_number: int) -> bool:
        pass

    @abstractmethod
    def get_voltage(self, pin_number: int) -> float:
        pass

    @abstractmethod
    def get_state(self, digital: Optional[list[int]] = None, analog: Optional[list[int]] = None) -> dict:
        pass

    def open_valve(self, pin_number: int):
        self.set_valve_state(pin_number, True)

    def close_valve(self, pin_number: int):
        self.set_valve_state(pin_number, False)

    def get_state(self, digital: Optional[list[int]] = None, analog: Optional[list[int]] = None) -> dict:
        """
        Returns a dictionary of states of all specified valves and analog pins.
        Used to update the entire front end 20 times a second.
        Example:
        >>> labjack.get_state([1,2,3],[4,5,6])
        { "digital": { 1: True, 2: False, 3: True }, "analog": { 4: 1.3, 5: 2.7, 6: 0.01} }
        """
        state = {}
        if digital:
            state["digital"] = {}
            for pin in digital:
                state["digital"][pin] = self.get_valve_state(pin)
        if analog:
            state["analog"] = {}
            for pin in analog:
                state["analog"][pin] = self.get_voltage(pin)
        return state

    def _is_inverted_relay(self, pin_number):
        # the vent valves (ETH 19, LOX 13) have relays at 0 (low voltage) iff the valve is mechanically closed
        # all other valves have relays at 1 (high voltage) iff the valves are mechanically open
        # this is part of the electronics
        # the interface of this class hides this implementation detail
        return pin_number != 13 and pin_number != 19

    def _is_legal_state_with(self, pin: int, open: bool) -> bool:
        """
        If we open/close the pin are we still in an allowed state?
        Eg vent + pressurisation cannot be open both at once
        """
        state = self.get_state(digital=[13, 19, 11, 8], analog=[])['digital']
        state[pin] = open
        # Vent + pressurisation = disaster for both ETH (19,8) and LOX (13,11)
        if (state[19] and state[8]) or (state[13] and state[11]):
            return False
        return True

class LabJack(LabJackBase):
    """
    Manages a handle to a real LabJack and lets you open/close valves (controlled by digital pins/relays)
    and read voltages (analog pins). All methods may throw exceptions.
    The LabJack must be plugged in via USB and the LabJack Exodriver must
    be installed before instantiating a LabJack object.
    """

    def __init__(self, serial_number: int, analog_inputs: list[int]):
        """Opens a USB connection to a LabJack and configures whether pins are analog/digital"""
        # Import LabJackPython (Python imports are cached so this only happens once)
        import LabJackPython
        # if you get an error here do `sudo pip uninstall LabJackPython` and then `sudo pip install LabJackPython==2.0.4`
        assert LabJackPython.__version__ == '2.0.4', 'User error: LabJackPython pip module must be exactly v2.0.4'
        import u3
        self.serial_number = serial_number
        self.device = u3.U3(firstFound=False, serial=self.serial_number)
        x = 0
        for pin in analog_inputs:
            x |= 1 << int(pin)
        # print(self.device.configIO())
        self.device.configIO(FIOAnalog=x, EIOAnalog=0)

    def set_valve_state(self, pin_number: int, open: bool):
        """
        Opens/closes a valve by toggling the relay (digital pin) on the LabJack
        We make no guarantee it will be successful (may fail silently due to hardware error or invalid state)
        or when it will happen (it may happen asynchronously some milliseconds later, you can check by calling
        get_valve_state later).
        Note that some valves are on when their relays are high voltage and some are on
        when they're low voltage. We abstract this away here so don't worry about it.
        """
        # Is it a legal state we're moving into?
        if not self._is_legal_state_with(pin_number, open):
            return
        # Invert if the relay on state opposes the valve open state
        if self._is_inverted_relay(pin_number): open = not open
        # Set the value in the hardware
        self.device.setDIOState(pin_number, state=int(open))

    def get_valve_state(self, pin_number: int) -> bool:
        """Returns True if the valve is mechanically open and False otherwise"""
        try:
            val = self.device.getDIOState(pin_number)
            if self._is_inverted_relay(pin_number): return not val
            else: return val
        except Exception:
            print(pin_number)
            print_exc()
            print(f"pin: {pin_number}")
            sys.exit()

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

    def __init__(self, serial_number: int, analog_inputs: list[int]):
        self.serial_number = serial_number
        self.state = {
            "digital": {},
            "analog": {}
        }

    def set_valve_state(self, pin_number: int, state: bool):
        # Is it a legal state we're moving into?
        if not self._is_legal_state_with(pin_number, open):
            return
        self.state["digital"][pin_number] = state

    def _set_default_state(self, pin_number: int):
        default_on = [13, 19]  # only vent valves are default on
        self.state['digital'][pin_number] = True if pin_number in default_on else False

    def get_valve_state(self, pin_number: int) -> bool:
        if pin_number in self.state["digital"]:
            return self.state["digital"][pin_number]
        else:
            self._set_default_state(pin_number)
            return self.get_valve_state(pin_number)

    def get_voltage(self, pin_number: int) -> float:
        spike = 1 if random.random() > 0.995 else 0
        high = math.sin(time.time() + pin_number + self.serial_number)
        low = math.sin(time.time() / 10 + pin_number + 7)
        return high + low + 1 + (random.random() - 0.5) * 0.2 + spike

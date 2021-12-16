import u3
from traceback import print_exc
import sys
from typing import Optional

class LabJack:
    """
    Manages a handle to a real LabJack and lets you get/set digital pins (relays) and read voltages (analog pins).
    All methods may throw exceptions. The LabJack must be plugged in via USB and the LabJack Exodriver must
    be installed before instantiating a LabJack object.
    """

    def __init__(self, serial_number: int, analog_inputs: list[int]):
        """Opens a USB connection to a LabJack and configures whether pins are analog/digital"""
        self.serial_number = serial_number
        self.device = u3.U3(firstFound=False, serial=self.serial_number)
        x = 0
        for pin in analog_inputs:
            x |= 1 << int(pin)
        # print(self.device.configIO())
        self.device.configIO(FIOAnalog=x, EIOAnalog=0)

    def set_relay_state(self, pin_number: int, state: bool):
        """
        Attemps to set the value of a relay (digital pin) on the LabJack
        We make no guarantee it will be successful (may fail silently) or when it will happen
        (it may happen asynchronously some milliseconds later, you can check by calling get_relay_state later)
        This abstracts away pins with inverted default states (eg vent valves), so True
        *always* means the relay is mechanically open
        """
        if self._is_inverted_pin(pin_number): state = not state
        self.device.setDIOState(pin_number, state=int(state))

    def open_relay(self, pin_number: int):
        self.set_relay_state(pin_number, True)

    def close_relay(self, pin_number: int):
        self.set_relay_state(pin_number, False)

    def get_relay_state(self, pin_number: int) -> bool:
        """Returns True if the relay is mechanically open and False otherwise"""
        try:
            val = self.device.getDIOState(pin_number)
            if self._is_inverted_pin(pin_number): return not val
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

    def get_state(self, digital: Optional[list[int]] = None, analog: Optional[list[int]] = None) -> dict:
        """
        Returns a dictionary of states of all specified pins. Used to update the entire front end 20 times a second.
        Example:
        >>> labjack.get_state([1,2,3],[4,5,6])
        { "digital": { 1: True, 2: False, 3: True }, "analog": { 4: 1.3, 5: 2.7, 6: 0.01} }
        """
        state = {}
        if digital:
            state["digital"] = {}
            for pin in digital:
                state["digital"][pin] = self.get_relay_state(pin)
        if analog:
            state["analog"] = {}
            for pin in analog:
                state["analog"][pin] = self.get_voltage(pin)
        return state

    def _is_inverted_pin(self, pin_number):
        # the vent valves (ETH 19, LOX 13) are digitally 0 iff they're mechanically 0
        # all other valves are digitally 0 iff they're mechanically 1
        # this is part of the electronics
        # the interface of this class hides this implementation detail
        return pin_number != 13 and pin_number != 19

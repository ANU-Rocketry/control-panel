import time
import math
from traceback import print_exc
from typing import Optional

class LabJack:
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

    def set_relay_state(self, pin_number: int, state: bool):
        self.state["digital"][pin_number] = state
        print(f"Set relay {pin_number} to {state}")

    def open_relay(self, pin_number: int):
        self.set_relay_state(pin_number, True)

    def close_relay(self, pin_number: int):
        self.set_relay_state(pin_number, False)

    def get_relay_state(self, pin_number: int) -> bool:
        if pin_number in self.state["digital"]:
            return self.state["digital"][pin_number]
        else:
            # inverted pins are default off (ie only vent vales are default on)
            self.set_relay_state(pin_number, not self._is_inverted_pin(pin_number))
            return self.get_relay_state(pin_number)

    def get_voltage(self, pin_number: int) -> float:
        return math.sin(time.time() + pin_number + self.serial_number)

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

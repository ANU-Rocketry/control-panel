"""
A labjack class to simulate the actual labjack class for purposes of developing the rest of the software.
"""

import random


class LabJack:
    def __init__(self, serialNumber: int):
        # Constructor opens a USB connection to a LabJack
        self.serialNumber = serialNumber

    def isConnected(self) -> bool:
        """Checks if the current labjack is connected

        Returns:
            bool
        """
        return True

    def openRelay(self, pinNumber: int):
        """Opens a relay

        Args:
            pinNumber (int)
        """

    def closeRelay(self, pinNumber: int):
        """Closes a given relay

        Args:
            pinNumber (int)
        """

    def getRelayState(self, pinNumber: int):
        """Get the state of a digital relay

        Args:
            pinNumber (int)

        Returns:
            bool: true if low, false if high.
        """
        return True

    def getVoltage(self, pinNumber: int) -> float:
        """Gets the value of a given analog pin

        Args:
            pinNumber (int)

        Returns:
            float: Voltage of analog pin
        """
        return random.random()

    def getState(self, digitalPins=None, analogPins=None):
        """Gets the state of the current labjack

        Args:
            digitalPins ([int], optional): List of digital pins to get. Defaults to None.
            analogPins ([int], optional): List of analog pins to get. Defaults to None.

        Returns:
            dict: a dictionary containing the states of the digital and analog states
        """
        state = {}
        if digitalPins:
            state["digital"] = {}
            for pin in digitalPins:
                state["digital"][pin] = self.getRelayState(pin)
        if analogPins:
            state["analog"] = {}
            for pin in analogPins:
                state["analog"][pin] = self.getVoltage(pin)
        return state

import u3


class LabJack:
    def __init__(self, serialNumber: int):
        # Constructor opens a USB connection to a LabJack
        self.serialNumber = serialNumber
        self.device = u3.U3(firstFound=False, serial=self.serialNumber)

    def isConnected(self):
        """Checks if the current labjack is connected

        Returns:
            bool
        """
        try:
            if self.device.getName() == None:
                return False
            else:
                return True
        except:
            return False

    def openRelay(self, pinNumber: int):
        """Opens a relay

        Args:
            pinNumber (int)
        """
        # Attempts to open a relay given a pin number on the LabJack
        self.device.setDOState(pinNumber, state=0)

    def closeRelay(self, pinNumber: int):
        """Closes a given relay

        Args:
            pinNumber (int)
        """
        # Attempts to close a relay given a pin number on the LabJack
        self.device.setDOState(pinNumber, state=1)

    def getRelayState(self, pinNumber: int):
        """Get the state of a digital relay

        Args:
            pinNumber (int)

        Returns:
            bool: true if low, false if high.
        """
        # Attempts to get the state of a relay given a pin number on the LabJack
        self.device.getDIOState(pinNumber)

    def getVoltage(self, pinNumber: int) -> float:
        """Gets the value of a given analog pin

        Args:
            pinNumber (int)

        Returns:
            float: Voltage of analog pin
        """
        # Attempts to read a voltage given a pin number on the LabJack
        return self.device.getAIN(pinNumber)

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

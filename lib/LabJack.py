import u3


class LabJack:
    def __init__(self, serial_number: int):
        # Constructor opens a USB connection to a LabJack
        self.serial_number = serial_number
        self.device = u3.U3(first_found=False, serial=self.serial_number)

    def is_connected(self):
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

    def open_relay(self, pin_number: int):
        """Opens a relay

        Args:
            pinNumber (int)
        """
        # Attempts to open a relay given a pin number on the LabJack
        self.device.setDOState(pin_number, state=0)

    def close_relay(self, pin_number: int):
        """Closes a given relay

        Args:
            pinNumber (int)
        """
        # Attempts to close a relay given a pin number on the LabJack
        self.device.setDOState(pin_number, state=1)

    def get_relay_state(self, pin_number: int):
        """Get the state of a digital relay

        Args:
            pinNumber (int)

        Returns:
            bool: true if low, false if high.
        """
        # Attempts to get the state of a relay given a pin number on the LabJack
        return self.device.getDIOState(pin_number)

    def get_voltage(self, pin_number: int) -> float:
        """Gets the value of a given analog pin

        Args:
            pinNumber (int)

        Returns:
            float: Voltage of analog pin
        """
        # Attempts to read a voltage given a pin number on the LabJack
        return self.device.getAIN(pin_number)

    def get_state(self, digital=None, analog=None):
        """Gets the state of the current labjack

        Args:
            digitalPins ([int], optional): List of digital pins to get. Defaults to None.
            analogPins ([int], optional): List of analog pins to get. Defaults to None.

        Returns:
            dict: a dictionary containing the states of the digital and analog states
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

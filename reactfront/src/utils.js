
export function getPsi(volts, barMax, zero, span) {
    // volts: voltage reading from volts pin
    // barMax: the sensor measures from 0 bar to `barMax` bar
    // zero: current in milliamps at 0 bar
    // span: current span (mA) from 0 bar to `barMax` bar, ie the current
    //   at `barMax` bar is zero + span
    // note that we use V=IR where the resistance is 120Ohm
    // so current = volts/120
    // (volts - zero) / span * barMax = bar
    const resistance = 120; // ohm
    const bar = (volts/resistance - zero/1000) / (span/1000) * barMax;
    const psi = bar * 14.504; // 1bar = 14.5psi
    return psi;
}

export const sensorData = {
    eth_tank: {
        barMax: 100,
        zero: 3.99, // mA at 0 bar
        span: 16.02, // mA span
    },
    lox_tank: {
        barMax: 100,
        zero: 3.99,
        span: 16.04,
    },

    // uncalibrated
    eth_n2: {
        barMax: 250,
        zero: 4,
        span: 16,
    },
    // uncalibrated
    lox_n2: {
        barMax: 250,
        zero: 4,
        span: 16,
    },
}

// Calibration function for dodgy old sensors
export function voltsToPsi(volts, barMax) {
    const resistance = 120; // ohm
    const current1 = 0.004; // amps
    const current2 = 0.02; // amps
    const bar = barMax/(resistance * current2) * (volts - resistance * current1)
    return bar * 14.504; // 1bar = 14.5psi
}

export function psiToVolts(psi, barMax) {
    const resistance = 120; // ohm
    const current1 = 0.004; // amps
    const current2 = 0.02; // amps
    const volts = psi/(barMax * 14.504) * resistance * current2 + resistance * current1
    return volts;
}


export function formatDataPoint(dict) {
    return {
        // Epoch time in fractional seconds
        time: dict.time,
        // Note: these bar max figures are also in the sensors list in control-panel.js
        'LOX Tank': getPsi(dict.labjacks.LOX.analog["3"], sensorData.lox_tank.barMax, sensorData.lox_tank.zero, sensorData.lox_tank.span),
        'LOX N2': voltsToPsi(dict.labjacks.LOX.analog["1"], 250 /* bar */),  // BADLY CALIBRATED!!!
        'ETH Tank': getPsi(dict.labjacks.ETH.analog["3"], sensorData.eth_tank.barMax, sensorData.eth_tank.zero, sensorData.eth_tank.span),
        'ETH N2': voltsToPsi(dict.labjacks.ETH.analog["1"], 250 /* bar */),  // BADLY CALIBRATED!!!
    }
}

export const emptyDataPoint = {
    time: NaN,
    'LOX Tank': NaN,
    'LOX N2': NaN,
    'ETH Tank': NaN,
    'ETH N2': NaN,
}

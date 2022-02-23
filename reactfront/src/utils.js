
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

export function getBar(volts, barMax, zero, span) {
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
    // const psi = bar * 14.504; // 1bar = 14.5psi
    return bar;
}

// Convert voltage to flow rate in GPM for flow sensors
export function getGPM(volts, minFlow, maxFlow, minVolts = 0.0, maxVolts = 5.0) {
    // Linear interpolation between voltage range and flow range
    const voltageRange = maxVolts - minVolts;
    const flowRange = maxFlow - minFlow;
    const gpm = ((volts - minVolts) / voltageRange) * flowRange + minFlow;
    return Math.max(0, gpm); // Don't allow negative flow
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
    // New cryogenic flow sensor - PT420 calibration from sheet
    lox_cryo: {
        minFlow: 0.80, // GPM
        maxFlow: 29.00, // GPM
        minVolts: 0.0,
        maxVolts: 5.0,
        type: 'flow',
        kFactor: 1686.86990, // from calibration sheet
        serialNumber: '130228-06'
    },
}

// Sensor averaging configuration
export const SENSOR_BATCH_SIZE = 20;

// Utility function to calculate batch average
export function calculateBatchAverage(values) {
    if (!values || values.length === 0) return null;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
}

// Utility function to process sensor batch
export function processSensorBatch(currentBatch, newValue, batchSize = SENSOR_BATCH_SIZE) {
    if (newValue === null || newValue === undefined || isNaN(newValue)) {
        return { batch: currentBatch, shouldUpdate: false, average: null };
    }

    const newBatch = [...currentBatch, newValue];
    
    if (newBatch.length >= batchSize) {
        const average = calculateBatchAverage(newBatch);
        return { 
            batch: [], // Reset batch
            shouldUpdate: true, 
            average: average,
            count: newBatch.length
        };
    }
    
    return { 
        batch: newBatch, 
        shouldUpdate: false, 
        average: null 
    };
}

// Create sensor batch update function
export function createSensorBatchUpdater(setBatches, setAverages) {
    return (sensorKey, newValue) => {
        if (newValue === null || newValue === undefined || isNaN(newValue)) {
            return; // Skip invalid values
        }
        
        setBatches(prev => {
            const currentBatch = prev[sensorKey] || [];
            const result = processSensorBatch(currentBatch, newValue);
            
            if (result.shouldUpdate) {
                // Update the display average
                setAverages(prevAvg => ({
                    ...prevAvg,
                    [sensorKey]: {
                        value: result.average,
                        count: result.count
                    }
                }));
            }
            
            return {
                ...prev,
                [sensorKey]: result.batch
            };
        });
    };
}

// Calibration function for dodgy old sensors
export function voltsToBar(volts, barMax) {
    const resistance = 120; // ohm
    const current1 = 0.004; // amps
    const current2 = 0.02; // amps
    const bar = barMax/(resistance * current2) * (volts - resistance * current1)
    // return bar * 14.504; // 1bar = 14.5psi
    return bar;
}

export function barToVolts(bar, barMax) {
    const resistance = 120; // ohm
    const current1 = 0.004; // amps
    const current2 = 0.02; // amps
    // const volts = bar/(barMax * 14.504) * resistance * current2 + resistance * current1
    const volts = bar/(barMax) * resistance * current2 + resistance * current1
    return volts;
}

// TODO Refactor this to use pins from json
export function formatDataPoint(dict) {
    return {
        // Epoch time in fractional seconds
        time: dict.time,
        // Note: these bar max figures are also in the sensors list in control-panel.js
        'LOX Tank': getBar(dict.labjacks.LOX.analog["4"], sensorData.lox_tank.barMax, sensorData.lox_tank.zero, sensorData.lox_tank.span),
        'LOX N2': voltsToBar(dict.labjacks.LOX.analog["5"], 250 /* bar */),  // BADLY CALIBRATED!!!
        'ETH Tank': getBar(dict.labjacks.ETH.analog["4"], sensorData.eth_tank.barMax, sensorData.eth_tank.zero, sensorData.eth_tank.span),
        'ETH N2': voltsToBar(dict.labjacks.ETH.analog["5"], 250 /* bar */),  // BADLY CALIBRATED!!!
        'LOX Flow': getGPM(dict.labjacks.LOX.analog["2"], sensorData.lox_cryo.minFlow, sensorData.lox_cryo.maxFlow), // New flow sensor
    }
}

export const emptyDataPoint = {
    time: NaN,
    'LOX Tank': NaN,
    'LOX N2': NaN,
    'ETH Tank': NaN,
    'ETH N2': NaN,
}
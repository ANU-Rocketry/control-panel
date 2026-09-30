export function getBar(volts, barMax, minVolts, maxVolts) {
    // Linear interpolation: minVolts → 0 bar, maxVolts → barMax bar
    const bar = (volts - minVolts) / (maxVolts - minVolts) * barMax;
    return bar;
}

// Convert voltage to flow rate in GPM for flow sensors
// export function getGPM(volts, minFlow, maxFlow, minVolts = 0.0, maxVolts = 5.0) {
//     // Linear interpolation between voltage range and flow range
//     const voltageRange = maxVolts - minVolts;
//     const flowRange = maxFlow - minFlow;
//     const gpm = ((volts - minVolts) / voltageRange) * flowRange + minFlow;
//     return Math.max(0, gpm); // Don't allow negative flow
// }

// Convert load cell voltage to weight in kg
// x = supplyVoltage (Volts) — adjustable, set to match your supply
// a = calibrationVoltage (Volts) — adjustable, measured voltage at zero load
// b = measuredVoltage (Volts) — live reading from FIO0
// Step 1: y = (x * 2 * 201) / 1500   → sensitivity in mV/kg
// Step 2: c = ((a - b) * 1000) / y   → weight in kg
export function getLoadCellKg(b, supplyVoltage, calibrationVoltage) {
    const y = (supplyVoltage * 2 * 201) / 1500;   // mV/kg sensitivity
    return ((calibrationVoltage - b) * 1000) / y;  // kg
}

// Convert voltage to flow rate in LPS (Litres Per Second) for flow sensors
export function getLPS(volts, minFlow, maxFlow, minVolts = 0.0, maxVolts = 5.0) {
    // Linear interpolation between voltage range and flow range
    // minFlow and maxFlow should be in LPS units
    const voltageRange = maxVolts - minVolts;
    const flowRange = maxFlow - minFlow;
    const lps = ((volts - minVolts) / voltageRange) * flowRange + minFlow;
    return Math.max(0, lps); // Don't allow negative flow
}

// Default calibration values
export const defaultSensorCalibration = {
    eth_tank: {
        barMax: 100,
        minVolts: 0.48,  // 4mA × 120Ω
        maxVolts: 2.4,  // 20mA × 120Ω
    },
    lox_tank: {
        barMax: 100,
        minVolts: 0.48,  // 4mA × 120Ω
        maxVolts: 2.4,  // 20mA × 120Ω
    },
    eth_n2: {
        barMax: 250,
        minVolts: 0.48,  // 4mA × 120Ω
        maxVolts: 2.4,  // 20mA × 120Ω
    },
    lox_n2: {
        barMax: 250,
        minVolts: 0.48,  // 4mA × 120Ω
        maxVolts: 2.4,  // 20mA × 120Ω
    },
    lox_inlet: {
        barMax: 150,
        minVolts: 0.48,  // 4mA × 120Ω
        maxVolts: 2.4,  // 20mA × 120Ω
    },
    eth_inlet: {
        barMax: 150,
        minVolts: 0.48,  // 4mA × 120Ω
        maxVolts: 2.4,  // 20mA × 120Ω
    },
    lox_cryo: {
        // Microcontroller computes L/s and streams it over UART — no voltage calibration needed
        type: 'flow',
        // OLD: analog 4-20mA calibration, replaced by UART (microcontroller does the conversion now)
        // minFlow: 0.050472,  // LPS (was 0.80 GPM)
        // maxFlow: 1.82961,   // LPS (was 29.00 GPM)
        // minVolts: 0.4684,
        // maxVolts: 2.342,
    },
    eth_temp: {
        type: 'temperature',
        offset: 0.0,
    },
    lox_temp: {
        type: 'temperature',
        offset: 0.0,
    },
    eth_load_cell: {
        type: 'force',
        supplyVoltage: 5.0,       // x — supply voltage in Volts
        calibrationVoltage: 0.0,  // a — measured voltage from FIO0 at zero load
    },
}

// Load calibration from localStorage using a deep merge — each sensor's fields are merged
// individually so that new default fields (e.g. minVolts/maxVolts replacing zero/span)
// are always present even when an older localStorage snapshot exists.
const _stored = JSON.parse(localStorage.getItem('sensorCalibration')) || {};
export let sensorData = Object.fromEntries(
    Object.keys(defaultSensorCalibration).map(key => [
        key,
        { ...defaultSensorCalibration[key], ...(_stored[key] || {}) }
    ])
);

// Function to update and save calibration
export function updateSensorCalibration(sensorKey, newCalibration) {
    sensorData[sensorKey] = { ...sensorData[sensorKey], ...newCalibration };
    localStorage.setItem('sensorCalibration', JSON.stringify(sensorData));
}

// Function to reset calibration to defaults
export function resetSensorCalibration(sensorKey = null) {
    if (sensorKey) {
        sensorData[sensorKey] = { ...defaultSensorCalibration[sensorKey] };
    } else {
        sensorData = { ...defaultSensorCalibration };
    }
    localStorage.setItem('sensorCalibration', JSON.stringify(sensorData));
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
        'LOX Tank': getBar(dict.labjacks.LOX.analog["4"], sensorData.lox_tank.barMax, sensorData.lox_tank.minVolts, sensorData.lox_tank.maxVolts),
        'LOX Tank V': dict.labjacks.LOX.analog["4"],
        'LOX N2': getBar(dict.labjacks.LOX.analog["5"], sensorData.lox_n2.barMax, sensorData.lox_n2.minVolts, sensorData.lox_n2.maxVolts),
        'LOX N2 V': dict.labjacks.LOX.analog["5"],
        'LOX Inlet': getBar(dict.labjacks.LOX.analog["6"], sensorData.lox_inlet.barMax, sensorData.lox_inlet.minVolts, sensorData.lox_inlet.maxVolts),
        'LOX Inlet V': dict.labjacks.LOX.analog["6"],
        'ETH Tank': getBar(dict.labjacks.ETH.analog["4"], sensorData.eth_tank.barMax, sensorData.eth_tank.minVolts, sensorData.eth_tank.maxVolts),
        'ETH Tank V': dict.labjacks.ETH.analog["4"],
        'ETH N2': getBar(dict.labjacks.ETH.analog["5"], sensorData.eth_n2.barMax, sensorData.eth_n2.minVolts, sensorData.eth_n2.maxVolts),
        'ETH N2 V': dict.labjacks.ETH.analog["5"],
        'ETH Inlet': getBar(dict.labjacks.ETH.analog["6"], sensorData.eth_inlet.barMax, sensorData.eth_inlet.minVolts, sensorData.eth_inlet.maxVolts),
        'ETH Inlet V': dict.labjacks.ETH.analog["6"],
        // OLD: analog 4-20mA cryo flow conversion, replaced by UART below
        // 'LOX Flow': getLPS(dict.labjacks.LOX.analog["2"], sensorData.lox_cryo.minFlow, sensorData.lox_cryo.maxFlow, sensorData.lox_cryo.minVolts, sensorData.lox_cryo.maxVolts),
        // 'LOX Flow Raw': dict.labjacks.LOX.analog["2"],
        // Cryo flow meter streams pre-computed L/s over UART — no voltage conversion needed
        'LOX Flow': dict.labjacks.LOX.cryo_flow_lps ?? NaN,
        'ETH Temp': dict.labjacks.ETH.temperature != null ? dict.labjacks.ETH.temperature + (sensorData.eth_temp.offset || 0.0) : NaN,
        'LOX Temp': dict.labjacks.LOX.temperature != null ? dict.labjacks.LOX.temperature + (sensorData.lox_temp.offset || 0.0) : NaN,
        'ETH Load Cell': dict.labjacks.ETH.analog?.["0"] !== undefined
            ? getLoadCellKg(dict.labjacks.ETH.analog["0"], sensorData.eth_load_cell.supplyVoltage, sensorData.eth_load_cell.calibrationVoltage)
            : NaN,
        'ETH Load Cell V': dict.labjacks.ETH.analog?.["0"] ?? NaN,
    }
}

export const emptyDataPoint = {
    time: NaN,
    'LOX Tank': NaN,
    'LOX Tank V': NaN,
    'LOX N2': NaN,
    'LOX N2 V': NaN,
    'LOX Inlet': NaN,
    'LOX Inlet V': NaN,
    'ETH Tank': NaN,
    'ETH Tank V': NaN,
    'ETH N2': NaN,
    'ETH N2 V': NaN,
    'ETH Inlet': NaN,
    'ETH Inlet V': NaN,
    // 'LOX Flow Raw': NaN, // OLD: was raw analog voltage, no longer applicable with UART
    'LOX Flow': NaN,
    'ETH Temp': NaN,
    'LOX Temp': NaN,
    'ETH Load Cell': NaN,
    'ETH Load Cell V': NaN,
}

//previous fixed calibration data

// export const sensorData = {
//     eth_tank: {
//         barMax: 100,
//         zero: 3.99, // mA at 0 bar
//         span: 16.02, // mA span
//     },
//     lox_tank: {
//         barMax: 100,
//         zero: 3.99,
//         span: 16.04,
//     },

//     // uncalibrated
//     eth_n2: {
//         barMax: 250,
//         zero: 4,
//         span: 16,
//     },
//     // uncalibrated
//     lox_n2: {
//         barMax: 250,
//         zero: 4,
//         span: 16,
//     },
//     // New cryogenic flow sensor - PT420 calibration from sheet
//     lox_cryo: {
//         minFlow: 0.80, // GPM
//         maxFlow: 29.00, // GPM
//         minVolts: 0.0,
//         maxVolts: 5.0,
//         type: 'flow'
//         // LPS conversion values for display
//         minFlowLPS: 0.80 * 0.06309, // ~0.050 LPS
//         maxFlowLPS: 29.00 * 0.06309, // ~1.830 LPS
//     },
// }

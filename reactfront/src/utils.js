export function getBar(volts, barMax, minVolts, maxVolts) {
    // Linear interpolation: minVolts -> 0 bar, maxVolts -> barMax bar
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

// Convert load cell voltage to weight in kg - two-point linear calibration, same
// shape as getBar() for pressure sensors: measure voltage at zero load and at a
// known reference weight, then interpolate between them. No dependency on the
// amplifier's internal gain, unlike the old single-point formula this replaced.
export function getLoadCellKg(volts, fullRange, zeroVoltage, maxVoltage) {
    const kg = (volts - zeroVoltage) / (maxVoltage - zeroVoltage) * fullRange;
    return kg;
}

// Calibrate the thermocouple amplifier's raw °C reading (MAX6675, decoded from its
// SPI bits in labjack.py): temperature = (raw - offset) / factor
export function getTemperatureC(raw, offset, factor) {
    return (raw - offset) / factor;
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
    // Thermocouples: temperature = (raw - offset) / factor, where raw is the °C value
    // the MAX6675 amplifier reports. The raw value is still logged and exported
    // ('ETH Temp Raw' / 'LOX Temp Raw') so readings can be recalibrated later.
    eth_temp: {
        type: 'temperature',
        offset: 1192 / 85,   // °C
        factor: 108 / 85,
    },
    lox_temp: {
        type: 'temperature',
        offset: 1192 / 85,   // °C
        factor: 108 / 85,
    },
    eth_load_cell: {
        type: 'force',
        fullRange: 100,     // kg at the reference calibration weight - placeholder, needs a real calibration weight to set accurately
        zeroVoltage: 0.0,   // measured voltage from FIO0 at zero load
        maxVoltage: 5.0,    // measured voltage from FIO0 at the fullRange calibration weight
    },
    // The LOX load cell is wired into the ETH LabJack (FIO1) - see stands.py
    lox_load_cell: {
        type: 'force',
        fullRange: 100,     // kg at the reference calibration weight - placeholder, needs a real calibration weight to set accurately
        zeroVoltage: 0.0,   // measured voltage from ETH FIO1 at zero load
        maxVoltage: 5.0,    // measured voltage from ETH FIO1 at the fullRange calibration weight
    },
}

// Calibration is stored on the server (src/calibration.json) and shared by every
// browser: the server sends it in a CALIBRATION message when a client connects and
// again whenever anyone changes it (see applyServerCalibration below). The server
// only holds the sensors someone has calibrated; everything else uses the defaults
// above. Each sensor's fields are merged individually so new default fields are
// always present.
function mergeWithDefaults(overrides) {
    return Object.fromEntries(
        Object.keys(defaultSensorCalibration).map(key => [
            key,
            { ...defaultSensorCalibration[key], ...((overrides && overrides[key]) || {}) }
        ])
    );
}

function readStored(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || {};
    } catch (e) {
        return {};
    }
}

// 'sensorCalibrationServerCopy' is this browser's copy of the last calibration the
// server sent, used only until the server's CALIBRATION message arrives after
// connecting. 'sensorCalibration' is the old per-browser calibration from before
// calibration moved to the server; it is left untouched so it can be uploaded once
// (see legacyLocalCalibration).
const _cached = localStorage.getItem('sensorCalibrationServerCopy') !== null
    ? readStored('sensorCalibrationServerCopy')
    : readStored('sensorCalibration');
export let sensorData = mergeWithDefaults(_cached);

// What the server last sent ({} = nothing calibrated yet), or null before it arrives
export let serverCalibration = null;

// Called for every CALIBRATION message from the server
export function applyServerCalibration(overrides) {
    serverCalibration = overrides || {};
    sensorData = mergeWithDefaults(serverCalibration);
    localStorage.setItem('sensorCalibrationServerCopy', JSON.stringify(serverCalibration));
}

// Sensors whose old per-browser calibration differs from the defaults, as
// { sensorKey: values }. Lets the calibration panel offer to upload them to a server
// that has no calibration saved yet.
export function legacyLocalCalibration() {
    const stored = readStored('sensorCalibration');
    const result = {};
    for (const key of Object.keys(defaultSensorCalibration)) {
        const defaults = defaultSensorCalibration[key];
        const merged = { ...defaults, ...(stored[key] || {}) };
        const changed = Object.keys(defaults).some(field =>
            typeof defaults[field] === 'number' && typeof merged[field] === 'number' && merged[field] !== defaults[field]);
        if (changed) {
            // Only send the fields this sensor still uses
            result[key] = Object.fromEntries(Object.keys(defaults).map(field => [field, merged[field]]));
        }
    }
    return result;
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
    // A stand whose LabJack has stopped responding is flagged stale by the server
    // (see LabJackWorker.get_state) and still carries its last known values. Treat
    // those as missing so the graphs show a gap instead of a flat line of old data.
    const fresh = stand => (stand && !stand.stale) ? stand : { analog: {} };
    const LOX = fresh(dict.labjacks.LOX);
    const ETH = fresh(dict.labjacks.ETH);
    return {
        // Epoch time in fractional seconds
        time: dict.time,
        // Note: these bar max figures are also in the sensors list in control-panel.js
        // LOX Tank (FIO4) and LOX N2 (FIO5) are both plugged in. Optional chaining is
        // kept so a missing key (e.g. a sensor removed from stands.py again) shows as
        // a gap instead of crashing formatDataPoint on every incoming state message.
        // LOX Inlet moved from FIO6 to FIO2 (see stands.py) and is still active.
        'LOX Tank': getBar(LOX.analog?.["4"], sensorData.lox_tank.barMax, sensorData.lox_tank.minVolts, sensorData.lox_tank.maxVolts),
        'LOX Tank V': LOX.analog?.["4"],
        'LOX N2': getBar(LOX.analog?.["5"], sensorData.lox_n2.barMax, sensorData.lox_n2.minVolts, sensorData.lox_n2.maxVolts),
        'LOX N2 V': LOX.analog?.["5"],
        'LOX Inlet': getBar(LOX.analog?.["2"], sensorData.lox_inlet.barMax, sensorData.lox_inlet.minVolts, sensorData.lox_inlet.maxVolts),
        'LOX Inlet V': LOX.analog?.["2"],
        'ETH Tank': getBar(ETH.analog["4"], sensorData.eth_tank.barMax, sensorData.eth_tank.minVolts, sensorData.eth_tank.maxVolts),
        'ETH Tank V': ETH.analog["4"],
        'ETH N2': getBar(ETH.analog["5"], sensorData.eth_n2.barMax, sensorData.eth_n2.minVolts, sensorData.eth_n2.maxVolts),
        'ETH N2 V': ETH.analog["5"],
        'ETH Inlet': getBar(ETH.analog["6"], sensorData.eth_inlet.barMax, sensorData.eth_inlet.minVolts, sensorData.eth_inlet.maxVolts),
        'ETH Inlet V': ETH.analog["6"],
        // OLD: analog 4-20mA cryo flow conversion, replaced by UART below
        // 'LOX Flow': getLPS(LOX.analog["2"], sensorData.lox_cryo.minFlow, sensorData.lox_cryo.maxFlow, sensorData.lox_cryo.minVolts, sensorData.lox_cryo.maxVolts),
        // 'LOX Flow Raw': LOX.analog["2"],
        // Cryo flow meter streams pre-computed L/s over UART — no voltage conversion needed
        'LOX Flow': LOX.cryo_flow_lps ?? NaN,
        // Thermocouples: the calibrated value is graphed, the amplifier's raw °C value
        // is kept alongside it for the CSV
        'ETH Temp': ETH.temperature != null
            ? getTemperatureC(ETH.temperature, sensorData.eth_temp.offset, sensorData.eth_temp.factor)
            : NaN,
        'ETH Temp Raw': ETH.temperature ?? NaN,
        'LOX Temp': LOX.temperature != null
            ? getTemperatureC(LOX.temperature, sensorData.lox_temp.offset, sensorData.lox_temp.factor)
            : NaN,
        'LOX Temp Raw': LOX.temperature ?? NaN,
        'ETH Load Cell': ETH.analog?.["0"] !== undefined
            ? getLoadCellKg(ETH.analog["0"], sensorData.eth_load_cell.fullRange, sensorData.eth_load_cell.zeroVoltage, sensorData.eth_load_cell.maxVoltage)
            : NaN,
        'ETH Load Cell V': ETH.analog?.["0"] ?? NaN,
        // LOX load cell is read through the ETH LabJack (FIO1), hence ETH.analog
        'LOX Load Cell': ETH.analog?.["1"] !== undefined
            ? getLoadCellKg(ETH.analog["1"], sensorData.lox_load_cell.fullRange, sensorData.lox_load_cell.zeroVoltage, sensorData.lox_load_cell.maxVoltage)
            : NaN,
        'LOX Load Cell V': ETH.analog?.["1"] ?? NaN,
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
    'ETH Temp Raw': NaN,
    'LOX Temp': NaN,
    'LOX Temp Raw': NaN,
    'ETH Load Cell': NaN,
    'ETH Load Cell V': NaN,
    'LOX Load Cell': NaN,
    'LOX Load Cell V': NaN,
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

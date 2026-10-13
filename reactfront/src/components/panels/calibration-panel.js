import React, { useState } from 'react';
import { Panel } from '../index';
import { sensorData, serverCalibration, legacyLocalCalibration, defaultSensorCalibration } from '../../utils';
import { Button } from '@material-ui/core';

export default function CalibrationPanel({ state, emit }) {
    const [calibration, setCalibration] = useState({ ...sensorData });
    const [selectedSensor, setSelectedSensor] = useState(() => {
        const saved = sessionStorage.getItem('calibrationSelectedSensor');
        return saved in sensorData ? saved : 'eth_tank';
    });
    const selectSensor = (key) => {
        // Remembered because this panel is rebuilt whenever the server sends new
        // calibration (see calibrationVersion in index.js)
        sessionStorage.setItem('calibrationSelectedSensor', key);
        setSelectedSensor(key);
    };

    // Calibration is saved on the server and shared with every connected device, so
    // nothing can be saved without a live connection
    const connected = state.socketStatus === WebSocket.OPEN;
    const requireConnection = () => {
        if (!connected) alert('Not connected to the server, so the calibration was NOT changed.');
        return connected;
    };

    // This browser's calibration from before it moved to the server, offered for
    // upload only while the server has nothing saved
    const legacy = legacyLocalCalibration();
    const offerLegacyUpload = serverCalibration !== null
        && Object.keys(serverCalibration).length === 0 && Object.keys(legacy).length > 0;
    const uploadLegacy = () => {
        if (!requireConnection()) return;
        const names = Object.keys(legacy).join(', ');
        if (!window.confirm(`Upload this browser's saved calibration for ${names} to the server? It will apply to every connected device.`)) return;
        Object.entries(legacy).forEach(([sensor, values]) => emit('SETCALIBRATION', { sensor, values }));
    };

    const handleUpdate = (sensorKey, field, value) => {
    // Allow empty string for editing
    if (value === '') {
        const newCalibration = {
            ...calibration,
            [sensorKey]: {
                ...calibration[sensorKey],
                [field]: ''
            }
        };
        setCalibration(newCalibration);
        return;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    const newCalibration = {
        ...calibration,
        [sensorKey]: {
            ...calibration[sensorKey],
            [field]: numValue
        }
    };
    setCalibration(newCalibration);
}

    const handleSave = (sensorKey) => {
    const sensor = calibration[sensorKey];
    
    console.log('Saving:', sensorKey);
    console.log('Sensor data:', sensor);
    
    const cleanedSensor = {};
    
    Object.entries(sensor).forEach(([key, val]) => {
        // Keep string fields as strings
        if (key === 'type' || key === 'serialNumber') {
            cleanedSensor[key] = val;
        } else {
            // Convert to number
            const numVal = parseFloat(val);
            
            // Check if it's a valid number
            if (val === '' || val === null || val === undefined || isNaN(numVal)) {
                console.error(`Invalid value for ${key}:`, val);
                alert(`Please enter a valid number for ${key}`);
                return;
            }
            
            cleanedSensor[key] = numVal;
        }
    });
    
    // Check if we have all required fields
    // OLD: lox_cryo used to require ['minFlow', 'maxFlow', 'minVolts', 'maxVolts'] here
    // when it was analog 4-20mA — no longer applicable now that it streams over UART.
    const requiredFields = (sensorKey === 'eth_temp' || sensorKey === 'lox_temp')
        ? ['offset', 'factor']
        : (sensorKey === 'eth_load_cell' || sensorKey === 'lox_load_cell')
        ? ['fullRange', 'zeroVoltage', 'maxVoltage']
        : ['barMax', 'minVolts', 'maxVolts'];
    
    const missingFields = requiredFields.filter(field => !(field in cleanedSensor));
    
    if (missingFields.length > 0) {
        alert(`Missing required fields: ${missingFields.join(', ')}`);
        return;
    }

    // temperature = (raw - offset) / factor, so a zero factor can never be valid
    if (requiredFields.includes('factor') && cleanedSensor.factor === 0) {
        alert('Factor cannot be 0.');
        return;
    }
    
    console.log('Cleaned sensor data:', cleanedSensor);
    
    if (!requireConnection()) return;
    // The server saves it and sends it to every connected device, including this one
    emit('SETCALIBRATION', { sensor: sensorKey, values: cleanedSensor });
    alert(`Calibration for ${sensorKey} sent to the server. It applies to every connected device.`);
};

    const handleReset = (sensorKey) => {
        if (!requireConnection()) return;
        if (window.confirm(`Reset ${sensorKey} to default calibration on every connected device?`)) {
            emit('RESETCALIBRATION', sensorKey);
        }
    };

    const handleResetAll = () => {
        if (!requireConnection()) return;
        if (window.confirm('Reset ALL sensors to default calibration on every connected device?')) {
            emit('RESETCALIBRATION', null);
        }
    };

    const sensors = [
        { key: 'eth_tank', name: 'ETH Tank Pressure' },
        { key: 'lox_tank', name: 'LOX Tank Pressure' },
        { key: 'eth_n2', name: 'ETH N2 Pressure' },
        { key: 'lox_n2', name: 'LOX N2 Pressure' },
        { key: 'eth_inlet', name: 'ETH Motor Inlet Pressure' },
        { key: 'lox_inlet', name: 'LOX Motor Inlet Pressure' },
        { key: 'lox_cryo', name: 'LOX Cryo Flow' },
        { key: 'eth_temp', name: 'Motor Thrust' },
        { key: 'lox_temp', name: 'Weighing Sensor' },
        { key: 'eth_load_cell', name: 'ETH Load Cell' },
        { key: 'lox_load_cell', name: 'LOX Load Cell' },
    ];

    const getSensorName = (sensorKey) => {
        const sensor = sensors.find(s => s.key === sensorKey);
        return sensor ? sensor.name : '';
    };

    const renderPressureSensor = (sensorKey) => {
        const sensor = calibration[sensorKey];
        const defaultSensor = defaultSensorCalibration[sensorKey];
        
        return (
            <div style={{ padding: '10px', border: '1px solid #ccc', marginBottom: '10px' }}>
                <h3>{getSensorName(sensorKey)}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 150px', gap: '10px' }}>
                    <label>Bar Max:</label>
                    <input
                        type="number"
                        step="0.1"
                        value={sensor.barMax}
                        onChange={(e) => handleUpdate(sensorKey, 'barMax', e.target.value)}
                    />

                    <label>Min Volts:</label>
                    <input
                        type="number"
                        step="0.001"
                        value={sensor.minVolts}
                        onChange={(e) => handleUpdate(sensorKey, 'minVolts', e.target.value)}
                    />

                    <label>Max Volts:</label>
                    <input
                        type="number"
                        step="0.001"
                        value={sensor.maxVolts}
                        onChange={(e) => handleUpdate(sensorKey, 'maxVolts', e.target.value)}
                    />
                </div>
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                    <Button variant="contained" color="primary" onClick={() => handleSave(sensorKey)}>
                        Save
                    </Button>
                    <Button variant="contained" onClick={() => handleReset(sensorKey)}>
                        Reset to Default
                    </Button>
                </div>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    <strong>Defaults:</strong> barMax={defaultSensor.barMax},
                    minVolts={defaultSensor.minVolts}V,
                    maxVolts={defaultSensor.maxVolts}V
                </div>
            </div>
        );
    };

    const renderFlowSensor = (sensorKey) => {
        // The microcontroller computes L/s itself and streams it over UART, so there's
        // no voltage calibration to do here - this card is remote control instead:
        // sending single-character commands to the microcontroller over the same UART's
        // TX line (see LabJack.send_cryo_command / server.py's CRYOCOMMAND handler).
        const stand = 'LOX';
        const testModeOn = !!(state?.data?.cryo_test_mode && state.data.cryo_test_mode[stand]);

        return (
            <div style={{ padding: '10px', border: '1px solid #ccc', marginBottom: '10px' }}>
                <h3>{getSensorName(sensorKey)}</h3>
                <p style={{ fontSize: '13px', color: '#555', marginTop: 0 }}>
                    Reads a pre-computed L/s value streamed over UART by the flow meter's
                    microcontroller. Sends single-character
                    commands to that microcontroller over the same UART's TX line.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Button
                        variant="contained"
                        color={testModeOn ? 'secondary' : 'primary'}
                        onClick={() => emit('CRYOCOMMAND', { stand, command: 't' })}
                    >
                        Test Mode: {testModeOn ? 'ON' : 'OFF'}
                    </Button>
                </div>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    Sends 't' to toggle the microcontroller's test mode.
                </div>
            </div>
        );
    };

    const renderTemperatureSensor = (sensorKey) => {
        const sensor = calibration[sensorKey];

        return (
            <div style={{ padding: '10px', border: '1px solid #ccc', marginBottom: '10px' }}>
                <h3>{getSensorName(sensorKey)}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 150px', gap: '10px' }}>
                    <label>Offset:</label>
                    <input
                        type="number"
                        step="any"
                        value={sensor.offset}
                        onChange={(e) => handleUpdate(sensorKey, 'offset', e.target.value)}
                    />

                    <label>Factor:</label>
                    <input
                        type="number"
                        step="any"
                        value={sensor.factor}
                        onChange={(e) => handleUpdate(sensorKey, 'factor', e.target.value)}
                    />
                </div>
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                    <Button variant="contained" color="primary" onClick={() => handleSave(sensorKey)}>
                        Save
                    </Button>
                    <Button variant="contained" onClick={() => handleReset(sensorKey)}>
                        Reset to Default
                    </Button>
                </div>
            </div>
        );
    };

    const renderLoadCellSensor = (sensorKey) => {
        const sensor = calibration[sensorKey];
        const defaultSensor = defaultSensorCalibration[sensorKey];
        // Both load cells are wired into the ETH LabJack (see stands.py)
        const pin = sensorKey === 'lox_load_cell' ? 'FIO1' : 'FIO0';

        return (
            <div style={{ padding: '10px', border: '1px solid #ccc', marginBottom: '10px' }}>
                <h3>{getSensorName(sensorKey)}</h3>
                <p style={{ fontSize: '13px', color: '#555', marginTop: 0 }}>
                    Voltage is read from {pin} on the ETH LabJack. Set Zero Voltage to the {pin}
                    reading with no load applied, and Max Voltage to the {pin} reading with a
                    known reference weight (Full Range) applied.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 150px', gap: '10px' }}>
                    <label>Full Range (kg):</label>
                    <input
                        type="number"
                        step="0.1"
                        value={sensor.fullRange}
                        onChange={(e) => handleUpdate(sensorKey, 'fullRange', e.target.value)}
                    />

                    <label>Zero Voltage (V):</label>
                    <input
                        type="number"
                        step="0.001"
                        value={sensor.zeroVoltage}
                        onChange={(e) => handleUpdate(sensorKey, 'zeroVoltage', e.target.value)}
                    />

                    <label>Max Voltage (V):</label>
                    <input
                        type="number"
                        step="0.001"
                        value={sensor.maxVoltage}
                        onChange={(e) => handleUpdate(sensorKey, 'maxVoltage', e.target.value)}
                    />
                </div>
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                    <Button variant="contained" color="primary" onClick={() => handleSave(sensorKey)}>
                        Save
                    </Button>
                    <Button variant="contained" onClick={() => handleReset(sensorKey)}>
                        Reset to Default
                    </Button>
                </div>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    <strong>Defaults:</strong> fullRange={defaultSensor.fullRange}kg,
                    zeroVoltage={defaultSensor.zeroVoltage}V,
                    maxVoltage={defaultSensor.maxVoltage}V
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                    <strong>Formula:</strong> kg per mV = fullRange / (maxVoltage − zeroVoltage)
                    &nbsp;:&nbsp; weight = ({pin} − zeroVoltage) × kg per mV
                </div>
            </div>
        );
    };

    return (
        <Panel title="Sensor Calibration" className='panel calibration'>
            <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '13px', color: '#555', marginTop: 0 }}>
                    Calibration is saved on the server and shared: a change made here
                    applies to every device connected to this server, and is kept when
                    the server restarts.
                </p>
                {offerLegacyUpload && (
                    <div style={{ padding: '10px', border: '1px solid #e0a800', background: '#fff8e1', marginBottom: '20px' }}>
                        <div style={{ marginBottom: '8px' }}>
                            The server has no calibration saved yet, but this browser has
                            values saved from before ({Object.keys(legacy).join(', ')}).
                        </div>
                        <Button variant="contained" onClick={uploadLegacy}>
                            Upload this browser's calibration to the server
                        </Button>
                    </div>
                )}
                <div style={{ marginBottom: '20px' }}>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        onClick={handleResetAll}
                        style={{ marginBottom: '20px' }}
                    >
                        Reset All to Defaults
                    </Button>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {sensors.map(sensor => (
                        <Button
                            key={sensor.key}
                            variant={selectedSensor === sensor.key ? "contained" : "outlined"}
                            onClick={() => selectSensor(sensor.key)}
                        >
                            {sensor.name}
                        </Button>
                    ))}
                </div>

                {selectedSensor === 'lox_cryo'
                    ? renderFlowSensor(selectedSensor)
                    : (selectedSensor === 'eth_temp' || selectedSensor === 'lox_temp')
                    ? renderTemperatureSensor(selectedSensor)
                    : (selectedSensor === 'eth_load_cell' || selectedSensor === 'lox_load_cell')
                    ? renderLoadCellSensor(selectedSensor)
                    : renderPressureSensor(selectedSensor)
                }
            </div>
        </Panel>
    );
}
import React, { useState } from 'react';
import { Panel } from '../index';
import { sensorData, updateSensorCalibration, resetSensorCalibration, defaultSensorCalibration } from '../../utils';
import { Button } from '@material-ui/core';

export default function CalibrationPanel() {
    const [calibration, setCalibration] = useState({ ...sensorData });
    const [selectedSensor, setSelectedSensor] = useState('eth_tank');

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
        ? ['offset']
        : sensorKey === 'eth_load_cell'
        ? ['supplyVoltage', 'calibrationVoltage']
        : ['barMax', 'minVolts', 'maxVolts'];
    
    const missingFields = requiredFields.filter(field => !(field in cleanedSensor));
    
    if (missingFields.length > 0) {
        alert(`Missing required fields: ${missingFields.join(', ')}`);
        return;
    }
    
    console.log('Cleaned sensor data:', cleanedSensor);
    
    updateSensorCalibration(sensorKey, cleanedSensor);
    alert(`Calibration saved for ${sensorKey}`);
    window.location.reload();
};

    const handleReset = (sensorKey) => {
        if (window.confirm(`Reset ${sensorKey} to default calibration?`)) {
            resetSensorCalibration(sensorKey);
            setCalibration({ ...sensorData });
            window.location.reload();
        }
    };

    const handleResetAll = () => {
        if (window.confirm('Reset ALL sensors to default calibration?')) {
            resetSensorCalibration();
            setCalibration({ ...sensorData });
            window.location.reload();
        }
    };

    const sensors = [
        { key: 'eth_tank', name: 'ETH Tank Pressure' },
        { key: 'lox_tank', name: 'LOX Tank Pressure' },
        { key: 'eth_n2', name: 'ETH N2 Pressure' },
        { key: 'lox_n2', name: 'LOX N2 Pressure' },
        { key: 'eth_inlet', name: 'ETH Motor Inlet Pressure' },
        { key: 'lox_inlet', name: 'LOX Motor Inlet Pressure' },
        // OLD: lox_cryo used to need voltage calibration here when it was analog 4-20mA.
        // Now the microcontroller computes L/s and streams it over UART, so there's
        // nothing left to calibrate on this panel — kept commented out for reference.
        // { key: 'lox_cryo', name: 'LOX Cryo Flow' },
        { key: 'eth_temp', name: 'ETH Temperature' },
        { key: 'lox_temp', name: 'LOX Temperature' },
        { key: 'eth_load_cell', name: 'ETH Load Cell' },
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
        const sensor = calibration[sensorKey];
        const defaultSensor = defaultSensorCalibration[sensorKey];
        
        return (
            <div style={{ padding: '10px', border: '1px solid #ccc', marginBottom: '10px' }}>
                <h3>{getSensorName(sensorKey)}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 150px', gap: '10px' }}>
                    <label>Min Flow (LPS):</label>
                    <input
                        type="number"
                        step="0.001"
                        value={sensor.minFlow}
                        onChange={(e) => handleUpdate(sensorKey, 'minFlow', e.target.value)}
                    />
                    
                    <label>Max Flow (LPS):</label>
                    <input
                        type="number"
                        step="0.001"
                        value={sensor.maxFlow}
                        onChange={(e) => handleUpdate(sensorKey, 'maxFlow', e.target.value)}
                    />
                    
                    <label>Min Volts:</label>
                    <input
                        type="number"
                        step="0.1"
                        value={sensor.minVolts}
                        onChange={(e) => handleUpdate(sensorKey, 'minVolts', e.target.value)}
                    />
                    
                    <label>Max Volts:</label>
                    <input
                        type="number"
                        step="0.1"
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
                    <strong>Defaults:</strong> minFlow={defaultSensor.minFlow.toFixed(6)}LPS, 
                    maxFlow={defaultSensor.maxFlow.toFixed(6)}LPS, 
                </div>
            </div>
        );
    };

    const renderTemperatureSensor = (sensorKey) => {
        const sensor = calibration[sensorKey];
        const defaultSensor = defaultSensorCalibration[sensorKey];

        return (
            <div style={{ padding: '10px', border: '1px solid #ccc', marginBottom: '10px' }}>
                <h3>{getSensorName(sensorKey)}</h3>
                <p style={{ fontSize: '13px', color: '#555', marginTop: 0 }}>
                    The MAX6675 outputs temperature directly in °C. Use the offset to correct for a known bias (e.g. <code>+2.5</code> adds 2.5°C to every reading).
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 150px', gap: '10px' }}>
                    <label>Offset (°C):</label>
                    <input
                        type="number"
                        step="0.1"
                        value={sensor.offset}
                        onChange={(e) => handleUpdate(sensorKey, 'offset', e.target.value)}
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
                    <strong>Default:</strong> offset={defaultSensor.offset}°C
                </div>
            </div>
        );
    };

    const renderLoadCellSensor = (sensorKey) => {
        const sensor = calibration[sensorKey];
        const defaultSensor = defaultSensorCalibration[sensorKey];

        return (
            <div style={{ padding: '10px', border: '1px solid #ccc', marginBottom: '10px' }}>
                <h3>ETH Load Cell</h3>
                <p style={{ fontSize: '13px', color: '#555', marginTop: 0 }}>
                    Voltage is read from FIO0 on the ETH LabJack.
                    Set Supply V to match your excitation voltage.
                    Set Cal V to the FIO0 voltage reading with no load applied (zero point).
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 150px', gap: '10px' }}>
                    <label>Supply Voltage (V):</label>
                    <input
                        type="number"
                        step="0.1"
                        value={sensor.supplyVoltage}
                        onChange={(e) => handleUpdate(sensorKey, 'supplyVoltage', e.target.value)}
                    />

                    <label>Calibration Voltage (V):</label>
                    <input
                        type="number"
                        step="0.001"
                        value={sensor.calibrationVoltage}
                        onChange={(e) => handleUpdate(sensorKey, 'calibrationVoltage', e.target.value)}
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
                    <strong>Defaults:</strong> supplyVoltage={defaultSensor.supplyVoltage}V,
                    calibrationVoltage={defaultSensor.calibrationVoltage}V
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                    <strong>Formula:</strong> sensitivity = (supplyV × 2 × 201) / 1500 mV/kg
                    &nbsp;→&nbsp; weight = (calV − FIO0) × 1000 / sensitivity
                </div>
            </div>
        );
    };

    return (
        <Panel title="Sensor Calibration" className='panel calibration'>
            <div style={{ padding: '20px' }}>
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
                            onClick={() => setSelectedSensor(sensor.key)}
                        >
                            {sensor.name}
                        </Button>
                    ))}
                </div>

                {selectedSensor === 'lox_cryo'
                    ? renderFlowSensor(selectedSensor)
                    : (selectedSensor === 'eth_temp' || selectedSensor === 'lox_temp')
                    ? renderTemperatureSensor(selectedSensor)
                    : selectedSensor === 'eth_load_cell'
                    ? renderLoadCellSensor(selectedSensor)
                    : renderPressureSensor(selectedSensor)
                }
            </div>
        </Panel>
    );
}
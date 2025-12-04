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
    
    // Validate that all fields have valid numbers
    const hasEmptyFields = Object.values(sensor).some(val => val === '' || isNaN(parseFloat(val)));
    
    if (hasEmptyFields) {
        alert('Please fill in all fields with valid numbers before saving');
        return;
    }
    
    updateSensorCalibration(sensorKey, calibration[sensorKey]);
    alert(`Calibration saved for ${sensorKey}`);
    window.location.reload(); // Reload to apply changes
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
        { key: 'lox_cryo', name: 'LOX Cryo Flow' }
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
                    
                    <label>Zero (mA):</label>
                    <input
                        type="number"
                        step="0.01"
                        value={sensor.zero}
                        onChange={(e) => handleUpdate(sensorKey, 'zero', e.target.value)}
                    />
                    
                    <label>Span (mA):</label>
                    <input
                        type="number"
                        step="0.01"
                        value={sensor.span}
                        onChange={(e) => handleUpdate(sensorKey, 'span', e.target.value)}
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
                    zero={defaultSensor.zero}mA, 
                    span={defaultSensor.span}mA
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
                    <label>Min Flow (GPM):</label>
                    <input
                        type="number"
                        step="0.01"
                        value={sensor.minFlow}
                        onChange={(e) => handleUpdate(sensorKey, 'minFlow', e.target.value)}
                    />
                    
                    <label>Max Flow (GPM):</label>
                    <input
                        type="number"
                        step="0.01"
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
                    
                    <label>K-Factor:</label>
                    <input
                        type="number"
                        step="0.01"
                        value={sensor.kFactor}
                        onChange={(e) => handleUpdate(sensorKey, 'kFactor', e.target.value)}
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
                    <strong>Defaults:</strong> minFlow={defaultSensor.minFlow}GPM, 
                    maxFlow={defaultSensor.maxFlow}GPM, 
                    kFactor={defaultSensor.kFactor}
                </div>
            </div>
        );
    };

    return (
        <Panel title="Sensor Calibration" className='panel calibration' style={{
            maxWidth: '800px',
            width: '100%',
            height: 'auto',
            overflow: 'auto'
        }}>
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
                    : renderPressureSensor(selectedSensor)
                }
            </div>
        </Panel>
    );
}
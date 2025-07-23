import { Switch } from '@material-ui/core';
import React, { useState, useEffect, useCallback } from 'react';
import { getBar, getGPM, sensorData, SENSOR_BATCH_SIZE } from '../../utils';
import { Panel } from '../index'
import pins from '../../pins.json'

function normalisePosition(num) {
    return num * 26;
}

function controlWidgetStyle({ x, y, width, height, enabled }) {
    return {
        position: 'absolute',
        borderStyle: 'solid',
        borderColor: 'transparent', // temp hack to keep alignment, should change margins instead
        width: normalisePosition(width),
        height: normalisePosition(height),
        top: normalisePosition(y),
        left: normalisePosition(x),
        ...(!enabled ? { cursor: 'help' } : {})
    };
}

function ControlSwitch({ state, emit, ...props }) {
    const value = state.data === null ? false : state.data.labjacks[props.test_stand]["digital"][props.labjack_pin]
    const setValue = x => state.data.labjacks[props.test_stand]["digital"][props.labjack_pin]
        ? emit('CLOSE', { name: props.test_stand, pin: parseInt(props.labjack_pin) })
        : emit('OPEN', { name: props.test_stand, pin: parseInt(props.labjack_pin) })

    const box = controlWidgetStyle(props);

    return (
        <div>
            {state.data && <div style={box} title={!props.enabled ? 'Please enable the arming and manual control switches to toggle' : ''}>
                <Switch checked={value} onChange={() => setValue(!value)} disabled={!props.enabled} />
                <label className={(value ? 'active' : 'inactive') + ' control-label ' + (props.enabled ? '' : 'disabled')}><br />
                </label>
            </div>}
        </div>
    );
}

function ControlCard({ state, emit, sensorBatches, sensorAverages, updateSensorHistory, ...props }) {
    const box = controlWidgetStyle({ enabled: true, ...props });
    let volts = null, displayValue = null, unit = '';

    // Create unique sensor key
    const sensorKey = `${props.test_stand}_${props.labjack_pin}`;

    let currentValue = null;

    if (state.data) {
        volts = state.data.labjacks[props.test_stand]["analog"][props.labjack_pin]
        const sensor = sensorData[props.sensorName]

        if (sensor) {
            if (sensor.type === 'flow') {
                // Flow sensor - display in GPM
                currentValue = getGPM(volts, sensor.minFlow, sensor.maxFlow, sensor.minVolts, sensor.maxVolts);
                unit = 'GPM';
            } else {
                // // Pressure sensor - display in PSI
                // currentValue = getPsi(volts, sensor.barMax, sensor.zero, sensor.span);
                // unit = 'PSI';
                // Pressure sensor - display in Bar
                currentValue = getBar(volts, sensor.barMax, sensor.zero, sensor.span);
                unit = 'Bar';
            }
        }
    }

    // Update sensor history only when currentValue changes
    useEffect(() => {
        if (currentValue !== null && currentValue !== undefined && !isNaN(currentValue)) {
            updateSensorHistory(sensorKey, currentValue);
        }
    }, [currentValue, sensorKey, updateSensorHistory]);

    // Use stored average if available, otherwise use current value
    const storedAverage = sensorAverages[sensorKey];
    if (storedAverage) {
        displayValue = storedAverage.value;
    } else {
        displayValue = currentValue;
    }

    // Apply color coding using CSS classes
    if (state.data && sensorData[props.sensorName]) {
        const sensor = sensorData[props.sensorName];
        if (sensor.type === 'flow') {
            // Color coding for flow: green if flowing, gray if not
            if (displayValue > sensor.minFlow + 0.1) { // Small threshold to avoid noise
                box.backgroundColor = 'lightgreen';
            }
        } else {
            // Pressure sensor color coding
            // const atmosphere = 14.6959 //psi
            // Display as pressurised if it's more than 2 atmospheres
            // const pressurised = displayValue && displayValue > atmosphere * 2
            const pressurised = displayValue && displayValue > 2
            if (pressurised) {
                box.backgroundColor = 'rgba(255, 99, 71, 0.7)';
            }
        }
    }

    return (
        <div style={box}>
            {displayValue !== null && (
                <div className="sensor-value-display">
                    {displayValue.toFixed(1)} {unit}
                </div>
            )}
            {volts && <div className="sensor-voltage-display">({volts.toFixed(2)}V)</div>}
        </div>
    );
}

export default function ControlPanel({ state, emit }) {
    // State to track sensor value batches and current averages
    const [sensorBatches, setSensorBatches] = useState({}); // Current batch being collected
    const [sensorAverages, setSensorAverages] = useState({}); // Current display averages

    // Function to update sensor history
    const updateSensorHistory = useCallback((sensorKey, newValue) => {
        if (newValue === null || newValue === undefined || isNaN(newValue)) {
            return; // Skip invalid values
        }

        setSensorBatches(prev => {
            const currentBatch = prev[sensorKey] || [];
            const newBatch = [...currentBatch, newValue];

            // If we've collected a full batch, calculate average and reset
            if (newBatch.length >= SENSOR_BATCH_SIZE) {
                const average = newBatch.reduce((sum, val) => sum + val, 0) / newBatch.length;

                // Update the display average
                setSensorAverages(prevAvg => ({
                    ...prevAvg,
                    [sensorKey]: {
                        value: average,
                        count: newBatch.length
                    }
                }));

                // Reset batch
                return {
                    ...prev,
                    [sensorKey]: []
                };
            }

            // Continue collecting values
            return {
                ...prev,
                [sensorKey]: newBatch
            };
        });
    }, []);

    return (
        <Panel title="Control Panel" className='panel control' style={{
            height: '650px',
            overflow: 'hidden',
            width: '790px',
        }}>
            <div className="control-panel">
                {pins.buttons.map((button) => state.data &&
                    <ControlSwitch
                        title={button.pin.test_stand.charAt(0) + ' ' + button.pin.abbrev}
                        key={button.pin.name}
                        state={state}
                        emit={emit}
                        {...button.pin}
                        {...button.position}
                        enabled={state.data && state.data.arming_switch && state.data.manual_switch}
                    />
                )}
                {pins.sensors.map((sensor) => state.data &&
                    <ControlCard
                        title={sensor.pin.abbrev}
                        key={sensor.pin.name}
                        state={state}
                        emit={emit}
                        {...sensor.pin}
                        {...sensor.position}
                        sensorName={sensor.pin.abbrev}
                        sensorBatches={sensorBatches}
                        sensorAverages={sensorAverages}
                        updateSensorHistory={updateSensorHistory}
                    />
                )}
            </div>
        </Panel>
    )
}
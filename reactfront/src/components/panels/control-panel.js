import { Switch } from '@material-ui/core';
import React, { useState, useEffect, useCallback } from 'react';
import { getBar, getLPS, sensorData, SENSOR_BATCH_SIZE } from '../../utils';
import { Panel } from '../index'
import pins from '../../pins.json'

function normalisePosition(num) {
    return num * 26;
}

function controlWidgetStyle({ x, y, width, height, enabled, shape }) {
    const baseStyle = {
        position: 'absolute',
        borderStyle: 'solid',
        borderColor: 'transparent', // temp hack to keep alignment, should change margins instead
        width: normalisePosition(width),
        height: normalisePosition(height),
        top: normalisePosition(y),
        left: normalisePosition(x),
        ...(!enabled ? { cursor: 'help' } : {})
    };

    // Apply semicircle styling if specified
    if (shape === 'semicircle') {
        return {
            ...baseStyle,
            top: normalisePosition(y) - 30,
            borderRadius: `0 0 ${normalisePosition(width)}px ${normalisePosition(width)}px`, // Bottom semicircle (upside down)
            overflow: 'hidden'
        };
    }

    // Apply pill styling if specified
    if (shape === 'pill') {
        return {
            ...baseStyle,
            borderRadius: `${normalisePosition(width) / 2}px`, // Pill shape with semicircles at width ends, radius = width/2
            overflow: 'hidden'
        };
    }


    return baseStyle;
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
                // Flow sensor - display in LPS (Litres Per Second)
                currentValue = getLPS(volts, sensor.minFlow, sensor.maxFlow, sensor.minVolts, sensor.maxVolts);
                unit = 'LPS';
            }  else {
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
            // Convert minimum flow threshold to LPS: 0.1 GPM = 0.006309 LPS
            const minFlowThresholdLPS = 0.1 * 0.06309; // ~0.0063 LPS
            if (displayValue > minFlowThresholdLPS) {
                box.backgroundColor = 'lightgreen';
            }
        } else {
            // Pressure sensor color coding
            const pressurised = displayValue && displayValue > 2
            if (pressurised) {
                box.backgroundColor = 'rgba(255, 99, 71, 0.7)';
            }
        }
    }

    // Get text styling based on shape
    const getTextStyle = (isVoltageDisplay = false) => {
        if (props.shape === 'semicircle') {
            return isVoltageDisplay
                ? { marginLeft: '12px' }
                : { marginTop: '28px' };
        }
        if (props.shape === 'pill') {
            return isVoltageDisplay
                ? {}
                : { marginTop: '70px' };
        }
        return {};
    };

    return (
        <div style={box}>
            {displayValue !== null && (
                <div className="sensor-value-display" style={getTextStyle()}>
                    {displayValue.toFixed(1)} {unit}
                </div>
            )}
            {volts && <div className="sensor-voltage-display" style={getTextStyle(true)}>({volts.toFixed(2)}V)</div>}
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
        <Panel title="Control Panel" className='panel control'>
            <div className="control-panel">
                {/* ETH Label - Top Left */}
                <div className="control-panel-label eth">
                    ETH
                </div>

                {/* LOX Label - Top Right */}
                <div className="control-panel-label lox">
                    LOX
                </div>

                {/* Switch Legend - Bottom Left */}
                <div style={{
                    position: 'absolute',
                    bottom: '-25px',
                    left: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Switch checked={true} disabled={true} size="small" className="legend-open-switch" />
                        <span style={{ position: 'relative', top: '-12px' }}>Open</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Switch checked={false} disabled={true} size="small" />
                        <span style={{ position: 'relative', top: '-12px' }}>Closed</span>
                    </div>
                </div>

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
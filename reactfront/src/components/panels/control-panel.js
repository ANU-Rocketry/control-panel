import { Switch } from '@material-ui/core';
import React from 'react';
import { getPsi, getGPM, sensorData } from '../../utils';
import { Panel } from '../index'
import pins from '../../pins.json'

function normalisePosition (num) {
    return num*26;
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
        ...(!enabled ? {cursor:'help'} : {})
    };
}

function ControlSwitch({ state, emit, ...props}) {
    const value = state.data === null ? false : state.data.labjacks[props.test_stand]["digital"][props.labjack_pin]
    const setValue = x => state.data.labjacks[props.test_stand]["digital"][props.labjack_pin]
        ? emit('CLOSE', { name: props.test_stand, pin: parseInt(props.labjack_pin) })
        : emit('OPEN', { name: props.test_stand, pin: parseInt(props.labjack_pin) })

    const box = controlWidgetStyle(props);
    const label = {
        position: 'absolute',
        margin: 'auto',
        fontSize: "1rem",
        top: normalisePosition(props.y - 1),
        left: normalisePosition(props.x - 1)-6,
        width: 100,
        textAlign: 'center'
    };

    return (
        <div>
            {state.data && <div style={box} title={!props.enabled ? 'Please enable the arming and manual control switches to toggle' : ''}>
                <Switch checked={value} onChange={() => setValue(!value)} disabled={!props.enabled} />
                <label className={(value ? 'active' : 'inactive') + ' control-label ' + (props.enabled ? '':'disabled')}><br/>
                {value ? "Open" : "Closed"}
                </label>
            </div>}
        </div>
    );
}

function ControlCard({ state, emit, ...props }) {
    const box = controlWidgetStyle({ enabled: true, ...props });
    let volts = null, displayValue = null, unit = '';
    
    if (state.data) {
        volts = state.data.labjacks[props.test_stand]["analog"][props.labjack_pin]
        const sensor = sensorData[props.sensorName]
        
        if (sensor) {
            if (sensor.type === 'flow') {
                // Flow sensor - display in GPM
                displayValue = getGPM(volts, sensor.minFlow, sensor.maxFlow, sensor.minVolts, sensor.maxVolts);
                unit = 'GPM';
                
                // Color coding for flow: green if flowing, gray if not
                if (displayValue > sensor.minFlow + 0.1) { // Small threshold to avoid noise
                    box.backgroundColor = 'lightgreen';
                }
            } else {
                // Pressure sensor - display in PSI
                displayValue = getPsi(volts, sensor.barMax, sensor.zero, sensor.span);
                unit = 'PSI';
                
                const atmosphere = 14.6959 //psi
                // Display as pressurised if it's more than 2 atmospheres
                const pressurised = displayValue && displayValue > atmosphere * 2
                if (pressurised) {
                    box.backgroundColor = 'tomato'
                }
            }
        }
    }

    return (
        <div style={box}>
            <div>{props.title}</div>
            {displayValue !== null && <div>{displayValue.toFixed(1)} {unit}</div>}
            {volts && <div>({volts.toFixed(2)}V)</div>}
        </div>
    );
}

export default function ControlPanel({ state, emit }) {
    return (
        <Panel title="Control Panel" className='panel control'>
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
                    />
                )}
            </div>
        </Panel>
    )
}
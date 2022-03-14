import { Switch } from '@material-ui/core';
import React from 'react';
import { getPsi, sensorData } from '../../utils';
import { Panel } from '../index'
import pins from '../../pins.json'

function normalisePosition (num) {
    return `${num*26}px`;
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

    const value = state.data === null ? false : state.data.labjacks[props.testEnd]["digital"][props.pin]
    const setValue =  x => state.data.labjacks[props.testEnd]["digital"][props.pin] ? emit('CLOSE', { name: props.testEnd, pin: parseInt(props.pin) }) : emit('OPEN', { name: props.testEnd, pin: parseInt(props.pin) })

    const box = controlWidgetStyle(props);
    const label = {
        position: 'absolute',
        margin: 'auto',
        fontSize: "1rem",
        top: normalisePosition(props.y - 1), 
        left: normalisePosition(props.x - 1), 
    };

    return (
        <div>
            {state.data && <div style={box} title={!props.enabled ? 'Please enable the arming and manual control switches to toggle' : ''}>
                <Switch checked={value} onChange={() => setValue(!value)} disabled={!props.enabled} />
                <label className={(value ? 'active' : 'inactive') + ' control-label ' + (props.enabled ? '':'disabled')}><br/>
                {value ? "Open" : "Closed"}
                </label>
            </div>}
            <h4 style={label}>
                {props.title}
            </h4>
        </div>
    );
}

function ControlCard({ state, emit, ...props }) {

    const box = controlWidgetStyle({ enabled: true, ...props });
    let volts = null, psi = null;
    if (state.data) {
        volts = state.data.labjacks[props.testEnd]["analog"][props.pin]
        const sensor = sensorData[props.sensorName]
        psi = getPsi(volts, sensor.barMax, sensor.zero, sensor.span)
    }

    const atmosphere = 14.6959 //psi
    // Display as pressurised if it's more than 2 atmospheres
    const pressurised = psi && psi > atmosphere * 2
    if (pressurised) {
        box.backgroundColor = 'tomato'
    }

    return (
        <div style={box}>
            <div style={{fontSize: "1rem"}}>
                {props.title}
            </div>
            <div style={{fontSize: "1rem"}}>
                {psi && psi.toFixed(1)} PSI ({volts && volts.toFixed(2)}V)
            </div>
        </div>
    );
}

export default function ControlPanel({ state, emit }) {
    return (  
        <Panel title="Control Panel" className='panel control'>
            <div className="control-panel">
                {pins.buttons.map((button) =>
                    <ControlSwitch
                        title={button.pin.test_stand.charAt(0) + ' ' + button.pin.abbrev + ' ' + button.pin.labjack_pin}
                        key={button.pin.name}
                        state={state}
                        emit={emit}
                        pin={button.pin.labjack_pin}
                        testEnd={button.pin.test_stand}
                        width={button.position.width}
                        height={button.position.height}
                        x={button.position.x}
                        y={button.position.y}
                        enabled={state.data && state.data.arming_switch && state.data.manual_switch}
                    />
                )}
                {pins.sensors.map((sensor) =>
                    <ControlCard
                        title={sensor.pin.abbrev}
                        key={sensor.pin.name}
                        state={state}
                        emit={emit}
                        pin={sensor.pin.labjack_pin}
                        testEnd={sensor.pin.test_stand}
                        width={sensor.position.width}
                        height={sensor.position.height}
                        x={sensor.position.x}
                        y={sensor.position.y}
                        sensorName={sensor.pin.abbrev}
                    />
                )}
            </div>
        </Panel>
    )
}

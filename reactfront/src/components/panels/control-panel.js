import { Card, CardContent, Switch } from '@material-ui/core';
import React from 'react';
import { Panel } from '../index'

function ControlCard(props) {

    const state = props.state
    const emit = props.emit

    const value = state.data === null ? false : state.data[props.testEnd]["digital"][props.pin]
    const setValue =  x => state.data[props.testEnd]["digital"][props.pin] ? emit('CLOSE', { name: props.testEnd, pin: parseInt(props.pin) }) : emit('OPEN', { name: props.testEnd, pin: parseInt(props.pin) })

    function normalise (num) {
        const oneBlock = 50/31
        return `calc(${oneBlock * num}vw - 2px)`
    }

    const box = {
        position: 'absolute',
        borderStyle: 'solid',
        width: normalise(props.width),
        height: normalise(props.height),
        top: normalise(props.y), 
        left: normalise(props.x), 
      };

    const label = {
        position: 'relative',
        top: "-70px", 
        left: "-30px", 
      };

    return (
        <div style={box}>
            <div>
                <label className={value ? 'active' : 'inactive'}>
                <Switch checked={value} onChange={() => setValue(!value)} />
                On
                </label>
            </div>
            <h4 style={label}>
                {props.title}
            </h4>
        </div>
    );
  }

export default function ControlPanel({ state, emit }) {

    const buttons = [
        {pin: "8", testEnd: "LOX", width: "2", height: "1", x: "8", y: "4"},
        {pin: "10", testEnd: "LOX", width: "2", height: "1", x: "11", y: "1"},
        {pin: "12", testEnd: "LOX", width: "2", height: "1", x: "11.5", y: "15"}
    ]

    return (  
        <Panel title="Control Panel">
            <div className="control-panel"> 
                {buttons.map((button) =>
                    <ControlCard 
                        title= {button.testEnd + " " + button.pin}
                        state={state}
                        emit={emit}
                        pin={button.pin}
                        testEnd={button.testEnd}
                        width={button.width}
                        height={button.height}
                        x={button.x}
                        y={button.y} />    
                )}
            </div>
        </Panel>
    )
}

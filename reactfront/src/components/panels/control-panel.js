import { Card, CardContent, Switch } from '@material-ui/core';
import React from 'react';
import { NormalSwitch, Panel } from '../index'

function ControlCard(props) {

    const state = props.state
    const emit = props.emit

    console.log(props.pin)

    const value = state.data === null ? false : state.data[props.testEnd]["digital"][props.pin]
    const setValue =  x => state.data[props.testEnd]["digital"][props.pin] ? emit('CLOSE', { name: props.testEnd, pin: parseInt(props.pin) }) : emit('OPEN', { name: props.testEnd, pin: parseInt(props.pin) })

    function normalise (num) {
        const oneBlock = 45/31
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
        position: 'absolute',
        fontSize: "1vw",
        top: normalise(props.y - 1), 
        left: normalise(props.x - 1), 
      };


    return (
        <div>
            <div style={box}>
                <NormalSwitch checked={value} onChange={() => setValue(!value)} />
                <label className={value ? 'active' : 'inactive'}>
                    <break/>
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

    return (  
        <Panel title="Control Panel">
            <div className="control-panel"> 
                {buttons.map((button) =>
                    <ControlCard 
                        title= {button.pin.nameShort}
                        state={state}
                        emit={emit}
                        pin={button.pin.labJackChanel}
                        testEnd={button.pin.testEnd}
                        width={button.position.width}
                        height={button.position.height}
                        x={button.position.x}
                        y={button.position.y} />    
                )}
            </div>
        </Panel>
    )
}


const buttons = [
    {
        pin: {valve: 11, labJackPin: 'EIO6', labJackChanel: '14', testEnd: 'ETH',  name: 'Main Fuel (Ethanol) Valve',                          nameShort: 'E.L.V1'},
        position: {width: "2", height: "1", x: "11.5", y: "15"}
    },
    {
        pin: {valve: 10, labJackPin: 'CIO1', labJackChanel: '12', testEnd: 'ETH',  name: 'Fuel (Ethanol) Fill Valve',                          nameShort: 'E.DF.V1'}, 
        position: {width: "2", height: "1", x: "8", y: "13"}
    },
    {
        pin: {valve: 9,  labJackPin: 'EIO2', labJackChanel: '10', testEnd: 'ETH',  name: 'Fuel (Ethanol) Dump Valve',                          nameShort: 'E.DF.V2'}, 
        position: {width: "2", height: "1", x: "4", y: "13"}
    },
    { 
        pin: {valve: 8,  labJackPin: 'EIO0', labJackChanel: '8',  testEnd: 'ETH',  name: 'Fuel (Ethanol) Tank Nitrogen Pressurisation Valve',  nameShort: 'N.L.E.V2'}, 
        position: {width: "2", height: "1", x: "8", y: "4"}
    },
    {
        pin: {valve: 7,  labJackPin: 'CIO3', labJackChanel: '19', testEnd: 'ETH',  name: 'Fuel (Ethanol) Tank Vent Valve',                     nameShort: 'N.L.E.V3'}, 
        position: {width: "2", height: "1", x: "11", y: "1"}
    },
    {
        pin: {valve: 6,  labJackPin: 'EIO4', labJackChanel: '17', testEnd: 'ETH',  name: 'Fuel (Ethanol) Line Nitrogen Purge Valve',           nameShort: 'E.L.V2'}, 
        position: {width: "2", height: "1", x: "8", y: "17"}
    },
    {
        pin: {valve: 5,  labJackPin: 'CIO0', labJackChanel: '16', testEnd: 'LOX',      name: 'Main Oxidiser (LOX) Valve',                          nameShort: 'O.L.V1'}, 
        position: {width: "2", height: "1", x: "17.5", y: "15"}
    },
    {
        pin: {valve: 4,  labJackPin: 'CIO2', labJackChanel: '18', testEnd: 'LOX',      name: 'Oxidiser (LOX) Fill Valve',                          nameShort: 'O.DF.V1'},
        position: {width: "2", height: "1", x: "21", y: "13"}
    },
    {
        pin: {valve: 3,  labJackPin: 'EIO1', labJackChanel: '9',  testEnd: 'LOX',      name: 'Oxidiser (LOX) Dump Valve',                          nameShort: 'O.DF.V2'}, 
        position: {width: "2", height: "1", x: "25", y: "13"}
    },
    {
        pin: {valve: 2,  labJackPin: 'EIO3', labJackChanel: '11', testEnd: 'LOX',      name: 'Oxidiser (LOX) Tank Nitrogen Pressurisation Valve',  nameShort: 'N.L.O.V2'}, 
        position: {width: "2", height: "1", x: "21", y: "4"}
    },
    {
        pin: {valve: 1,  labJackPin: 'EIO5', labJackChanel: '13', testEnd: 'LOX',      name: 'Oxidiser (LOX) Tank Vent Valve',                     nameShort: 'N.L.O.V3'}, 
        position: {width: "2", height: "1", x: "18", y: "1"}
    },
    {
        pin: {valve: 0,  labJackPin: 'EIO7', labJackChanel: '15', testEnd: 'LOX',      name: 'Oxidiser (LOX) Line Nitrogen Purge Valve',           nameShort: 'O.L.V2'},
        position: {width: "2", height: "1", x: "21", y: "17"}
    }
]
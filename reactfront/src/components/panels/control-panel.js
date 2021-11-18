import { Switch } from '@material-ui/core';
import React from 'react';
import { NormalSwitch, Panel } from '../index'

function ControlCard(props) {

    const state = props.state
    const emit = props.emit

    function normalise (num) {
        const oneBlock = 45/31
        return `calc(${oneBlock * num}vw - 2px)`
    }

    const box = {
        position: 'absolute',
        borderStyle: 'solid',
        borderColor: 'transparent', // temp hack to keep alignment, should change margins instead
        width: normalise(props.width),
        height: normalise(props.height),
        top: normalise(props.y), 
        left: normalise(props.x), 
      };

    const label = {
        position: 'absolute',
        margin: 'auto',
        fontSize: "1vw",
        top: normalise(props.y - 1), 
        left: normalise(props.x - 1), 
      };

    if (props.isButton) {

        const value = state.data === null ? false : state.data[props.testEnd]["digital"][props.pin]
        const setValue =  x => state.data[props.testEnd]["digital"][props.pin] ? emit('CLOSE', { name: props.testEnd, pin: parseInt(props.pin) }) : emit('OPEN', { name: props.testEnd, pin: parseInt(props.pin) })

        return (
            <div>
                <div style={box}>
                    <Switch checked={value} onChange={() => setValue(!value)} />
                    <label className={value ? 'active' : 'inactive'}><br/>
                    On
                    </label>
                </div>
                <h4 style={label}>
                    {props.title}
                </h4>
            </div>
        );
    } else {
        const value = state.data === null ? 0 : state.data[props.testEnd]["analog"][props.pin]
    
        return (
            <div style={box}>
                <div style={{fontSize: "1vw"}}>
                    {props.title}
                </div>
                <div style={{fontSize: "1vw"}}>
                    {value && value.toFixed(3)}
                </div>
            </div>
        );
    }
  }

export default function ControlPanel({ state, emit }) {

    return (  
        <Panel title="Control Panel">
            <div className="control-panel"> 
                {buttons.map((button) =>
                    <ControlCard
                        title={button.pin.nameShort}
                        key={button.pin.nameShort}
                        state={state}
                        emit={emit}
                        pin={button.pin.labJackChanel}
                        testEnd={button.pin.testEnd}
                        width={button.position.width}
                        height={button.position.height}
                        x={button.position.x}
                        y={button.position.y} 
                        isButton={true}/>    
                )}
                {sensors.map((sensor) =>
                    <ControlCard
                        title={sensor.pin.nameShort}
                        key={sensor.pin.nameShort}
                        state={state}
                        emit={emit}
                        pin={sensor.pin.labJackChanel}
                        testEnd={sensor.pin.testEnd}
                        width={sensor.position.width}
                        height={sensor.position.height}
                        x={sensor.position.x}
                        y={sensor.position.y} 
                        isButton={false}/>    
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
        pin: {valve: 7,  labJackPin: 'CIO3', labJackChanel: '99', testEnd: 'ETH',  name: 'Fuel (Ethanol) Tank Vent Valve',                     nameShort: 'N.L.E.V3'}, 
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

const sensors = [
    {
        pin: {sensorNumber: 0, labJackPin: 'FIO1', labJackChanel: '1', testEnd: 'LOX', maxPressure: '250bar', name: 'LOX Nitrogen Pressurant Sensor', nameShort: '(N.L.O.P1)'},
        position: {width: "5", height: "3", x: "25", y: "3"}
    },
    {
        pin: {sensorNumber: 1, labJackPin: 'FIO3', labJackChanel: '3', testEnd: 'LOX', maxPressure: '160bar', name: 'LOX Tank Pressure Sensor', nameShort: '(O.L.P1)'},
        position: {width: "3", height: "4.5", x: "17", y: "7.5"}
    },
    {
        pin: {sensorNumber: 2, labJackPin: 'FIO1', labJackChanel: '1', testEnd: 'ETH', maxPressure: '250bar', name: 'Ethanol Nitrogen Pressurant Sensor', nameShort: '(N.L.E.P1)'},
        position: {width: "5", height: "3", x: "1", y: "3"}
    },
    {
        pin: {sensorNumber: 3, labJackPin: 'FIO3', labJackChanel: '3', testEnd: 'ETH', maxPressure: '160bar', name: 'Ethanol Tank Pressure Sensor', nameShort: '(E.L.P1)'},
        position: {width: "3", height: "4.5", x: "11", y: "7.5"}
    }
]
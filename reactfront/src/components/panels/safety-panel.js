import React from 'react';
import { Panel, ToggleSwitch } from '../index'

export function SafetyCard(props) {
  var toggle = ""
  if (props.children) {
    toggle = props.children;
  } else if (props.isButton === "true") {
    toggle = <button onClick={() => props.setSwitchValue("")}>ABORT</button>
  } else {
    toggle = <ToggleSwitch value={props.switchValue} setValue={props.setSwitchValue} />
  }

  const style = props.label ? {cursor:'help',borderBottom:'1px dotted #333'} : {}

  return (
    <div className='safety-card'>
      <h2 title={props.label} style={style}>
        {props.title}
      </h2>
      {toggle}
    </div>
  );
}

export default function SafetyPanel({ state, emit, that }) {
  const armingSwitchActive = state.data === null ? false : state.data.arming_switch
  const toggleArmingSwitch = x => emit('ARMINGSWITCH', x)

  const manualSwitchActive = state.data === null ? false : state.data.manual_switch
  const toggleManualSwitch = x => emit('MANUALSWITCH', x)

  const dataLoggingActive = state.data === null ? false : state.data.data_logging
  const toggleDataLogging = x => emit('DATALOG', x)

  return (
    <Panel title="Safety" className='panel safety'>
      <div className="flex" style={{ justifyContent: 'flex-start' }}>
        <SafetyCard title="Arming Switch"
          label="Controls if the state can change"
          isButton="false"
          switchValue={armingSwitchActive}
          setSwitchValue={toggleArmingSwitch} />

        <SafetyCard title="Manual Control"
          label="Allow manual pin operation"
          isButton="false"
          switchValue={manualSwitchActive}
          setSwitchValue={toggleManualSwitch} />

        <SafetyCard title="Data Logging"
          label="Logging data"
          isButton="false"
          switchValue={dataLoggingActive}
          setSwitchValue={toggleDataLogging} />

        <SafetyCard title="Ping"
          label="Time delay to reach the server">
          {state.ping ? state.ping : '0'}ms
        </SafetyCard>

        <SafetyCard title="Raspberry Pi IP"
          label="Local IP address of the Raspberry Pi. Must be on the same network. If it's incorrect no new data will appear">
          <input value={state.wsAddress} onChange={e => {
            that.setState({ wsAddress: e.target.value }, () => {
              that.connect()
            })
          }} placeholder={state.defaultWSAddress} />
        </SafetyCard>
      </div>
    </Panel>
  )
}

import React from 'react';
import { Panel, ToggleSwitch } from '../index'

export function SafetyCard(props) {
  var toggle = ""
  if (props.children) {
    toggle = props.children;
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

  const UPSStatus = state.data === null ? false : state.data.UPS_status

  const statuses = ["Connecting", "Connected", "Closing", "Closed"]
  let connectionStatus
  if (that.socket) {
      connectionStatus = statuses[that.socket.readyState]
  } else {
      connectionStatus = "Not Connected"
  }

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

        <SafetyCard title="R-Pi IP"
          label="Local IP address of the Raspberry Pi. Must be on the same network. If it's incorrect no new data will appear">
          <input value={state.wsAddress} size='10' onChange={e => {
            that.setState({ wsAddress: e.target.value }, () => {
              localStorage.setItem('wsaddr', e.target.value)
              that.connect()
            })
          }} placeholder={state.defaultWSAddress} />
        </SafetyCard>

        <SafetyCard title="Ping"
          label="Time delay to reach the server">
          {state.ping ? state.ping : '0'}ms
        </SafetyCard>

        {UPSStatus && (
          <SafetyCard title="UPS Status">
            {UPSStatus}
          </SafetyCard>
        )}

        <SafetyCard title="Connection Status">
            {connectionStatus}
        </SafetyCard>
      </div>
    </Panel>
  )
}

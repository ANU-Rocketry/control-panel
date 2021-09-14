import React from 'react';
import { Panel, ToggleSwitch } from '../index'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

function SafetyCard(props) {
  var toggle = ""
  if (props.isButton === "true") {
    toggle = <button onClick={() => props.setSwitchValue("bum")}>ABORT</button>
  } else {
    toggle = <ToggleSwitch value={props.switchValue} setValue={props.setSwitchValue} />
  }

  return (
    <Card>
      <CardContent>
        <h2>
          {props.title}
        </h2>
        <Typography color="textSecondary">
          {props.label}
        </Typography>
        {toggle}
      </CardContent>
    </Card>
  );
}

export default function SafetyPanel({ state, emit }) {
  const armingSwitchActive = state.data === null ? false : state.data.arming_switch
  const toggleArmingSwitch = x => emit('ARMINGSWITCH', x)

  const manualSwitchActive = state.data === null ? false : state.data.manual_switch
  const toggleManualSwitch = x => emit('MANUALSWITCH', x)

  const abort = x => emit('ABORTSEQUENCE', x)

  const dataLoggingActive = state.data === null ? false : state.data.data_logging
  const toggleDataLogging = x => emit('DATALOG', x)

  return (
    <Panel title="Safety">
      <div className="flex">
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

        <SafetyCard title="Abort Button"
          label="Abort the current sequence"
          isButton="true"
          setSwitchValue={abort} />

        <SafetyCard title="Data Logging"
          label="Logging data"
          isButton="false"
          switchValue={dataLoggingActive}
          setSwitchValue={toggleDataLogging} />
      </div>
    </Panel>
  )
}

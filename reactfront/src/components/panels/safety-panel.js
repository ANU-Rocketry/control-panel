import React from 'react';
import { Panel, ToggleSwitch } from '../index'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

function SafetyCard(props) {
  var toggle = ""
  if (props.isButton == "true") {
    toggle = <button onClick={() => props.setSwitchValue}>ABORT</button>
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

  // TODO: backend should have a boolean param for arming switch instead of toggling
  const armingSwitchActive = state.data === null ? false : state.data.arming_switch
  const toggleArmingSwitch = x => emit('ARMINGSWITCH', x)

  const abort = x => emit('ABORT', x)

  const lox8Active = state.data === null ? false : state.data["LOX"]["digital"]["8"]
  const toggleLox8 = x => state.data["LOX"]["digital"]["8"] ? emit('CLOSE', { name: "LOX", pin: 8 }) : emit('OPEN', { name: "LOX", pin: 8 })

  return (
    <Panel title="Safety">
      <div className="flex">
        <SafetyCard title="Arming Switch"
          label="Switch Controlling The Arming"
          isButton="false"
          switchValue={armingSwitchActive}
          setSwitchValue={toggleArmingSwitch} />

        <SafetyCard title="Abort Button"
          label="Abort the current sequence"
          isButton="true"
          setSwitchValue={abort} />

        <SafetyCard title="LOX Pin 8"
          label="Switch pin 8"
          isButton="false"
          switchValue={lox8Active}
          setSwitchValue={toggleLox8} />
      </div>
    </Panel>
  )
}

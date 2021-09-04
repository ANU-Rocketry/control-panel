import React from 'react';
import { Panel, ToggleSwitch } from '../index'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

function SafetyCard(props) {
  var toggle = ""
  if (props.isButton == "true") {
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

  // TODO: backend should have a boolean param for arming switch instead of toggling
  const armingSwitchActive = state.data === null ? false : state.data.arming_switch
  const toggleArmingSwitch = x => emit('ARMINGSWITCH', x)

  const manualSwitchActive = state.data === null ? false : state.data.manual_switch
  const toggleManualSwitch = x => emit('MANUALSWITCH', x)

  const abort = x => emit('ABORTSEQUENCE', x)

  const lox8Active = state.data === null ? false : state.data["LOX"]["digital"]["8"]
  const toggleLox8 = x => state.data["LOX"]["digital"]["8"] ? emit('CLOSE', { name: "LOX", pin: 8 }) : emit('OPEN', { name: "LOX", pin: 8 })

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

        <SafetyCard title="LOX Pin 8"
          label="Switch pin 8"
          isButton="false"
          switchValue={lox8Active}
          setSwitchValue={toggleLox8} />
      </div>
    </Panel>
  )
}

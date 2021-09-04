import React from 'react';
import { Panel, ToggleSwitch } from '../index'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

function SafetyCard(props) {
  return (
    <Card>
      <CardContent>
        <h2>
          {props.title}
        </h2>
        <Typography color="textSecondary">
          {props.label}
        </Typography>
        <ToggleSwitch value={props.switchValue} setValue={props.setSwitchValue}/>
      </CardContent>
    </Card>
  );
}

export default function SafetyPanel({ state, emit }) {

  // TODO: backend should have a boolean param for arming switch instead of toggling
  const armingSwitchActive = state.data === null ? false : state.data.arming_switch
  const toggleArmingSwitch = x => emit('ARMINGSWITCH', x)

  const lox8Active = state.data === null ? false : state.data["LOX"]["digital"]["8"]
  const toggleLox8 = x => emit('OPEN', 8)

  return (
    <Panel title="Safety">
      <SafetyCard title="Arming Switch"
        label="Switch Controlling The Arming"
        switchValue={armingSwitchActive}
        setSwitchValue={toggleArmingSwitch}/>

      <SafetyCard title="LOX Pin 8"
        label="Switch pin 8"
        switchValue={lox8Active}
        setSwitchValue={toggleLox8}/>
    </Panel>
  )
}

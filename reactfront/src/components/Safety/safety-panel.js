import React from 'react';
import SafetyCard from './safety-card';
import { Panel } from '../index'

export default function SafetyPanel({ state, emit }) {
  // TODO: backend should have a boolean param for arming switch instead of toggling
  const armingSwitchActive = state.data === null ? false : state.data.arming_switch
  const toggleArmingSwitch = () => emit('ARMINGSWITCH', !armingSwitchActive)
  return (
    <Panel title="Safety">
      <SafetyCard title="Arming Switch"
        label="Switch Controlling The Arming"
        switchState={armingSwitchActive}
        switchFunction={toggleArmingSwitch}/>
    </Panel>
  )
}

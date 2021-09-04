import React from 'react';
import { Panel } from '../index'

export default function SafetyPanel({ state, emit }) {
  const lox8Active = state.data === null ? 0 : state.data["LOX"]["analog"]["4"]

  return (
    <Panel title="Graphs">
      
    </Panel>
  )
}

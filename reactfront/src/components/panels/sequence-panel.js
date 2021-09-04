import React from 'react';
import { Panel } from '../index'

export default function Sequences({ state, emit }) {
  const sequences = state.data === null ? 0 : state.data["LOX"]["analog"]["4"]

  return (
    <Panel title="Sequences">
      
    </Panel>
  )
}

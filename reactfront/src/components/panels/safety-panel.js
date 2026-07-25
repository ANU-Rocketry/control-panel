import React from 'react';
import { ToggleSwitch } from '../index'

export function SafetyCard(props) {
  var toggle = ""
  if (props.children) {
    toggle = props.children;
  } else {
    toggle = <ToggleSwitch value={props.switchValue} setValue={props.setSwitchValue} />
  }

  const style = props.label ? { cursor: 'help', borderBottom: '1px dotted #333' } : {}

  return (
    <div className='safety-card'>
      <h2 title={props.label} style={{ ...style, ...(props.style || {}) }}>
        {props.title}
      </h2>
      {toggle}
    </div>
  );
}

import React from 'react';
import { Paper } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';

export function SectionTitle({ children }) {
  return (
    <div style={{width:"100%", padding: "6px", height:"40px"}}>
      <h1>
        {children}
      </h1>
    </div>
  );
}

// Strings taken from server.py's UPSStatus enum
const UPSSymbols = { "LINE_POWERED": "✅", "BATTERY_POWERED": "🔋", "UNKNOWN": "❔" }
const UPSNames = {
  "LINE_POWERED": "Powered",
  "BATTERY_POWERED": "Battery",
  "UNKNOWN": "Unknown"
}

export function TopBar({ state, emit, sockStatus, that }) {
  const armingSwitchActive = state.data === null ? false : state.data.arming_switch
  const toggleArmingSwitch = x => emit('ARMINGSWITCH', x)

  const manualSwitchActive = state.data === null ? false : state.data.manual_switch
  const toggleManualSwitch = x => emit('MANUALSWITCH', x)

  const dataLoggingActive = state.data === null ? false : state.data.data_logging
  const toggleDataLogging = x => emit('DATALOG', x)

  const UPSStatus = state.data === null ? "UNKNOWN" : state.data.UPS_status
  const UPSInfo = UPSSymbols[UPSStatus] + " " + UPSNames[UPSStatus]

  const connected = sockStatus === WebSocket.OPEN
  const armed = state.data ? state.data.arming_switch : false
  const abort = () => emit('ABORTSEQUENCE')

  return (
    <div className='top-bar'>
      <div className='top-bar-row top-bar-row-1'>
        <div className='top-bar-left'>
          <img src='./logo.png' alt='logo' />
          <h1>Test Stand Control Panel</h1>
        </div>
        <div className='top-bar-right'>
          {UPSStatus && <span>UPS: {UPSInfo}</span>}
          <span style={{ color: connected ? '#7CFC7C' : '#FF6B6B' }}>
            Status: {connected ? 'Connected' : 'Disconnected'}
          </span>
          <span>
            Server IP:{' '}
            <input value={state.wsAddress} size='15' onChange={e => {
              that.setState({ wsAddress: e.target.value }, () => {
                localStorage.setItem('wsaddr', e.target.value)
                that.connect()
              })
            }} placeholder={state.defaultWSAddress} />
          </span>
        </div>
      </div>

      <div className='top-bar-row top-bar-row-2'>
        <div className='top-bar-toggles'>
          <div className='top-bar-toggle'>
            <span title="Controls if the state can change">Arming</span>
            <ToggleSwitch value={armingSwitchActive} setValue={toggleArmingSwitch} />
          </div>
          <div className='top-bar-toggle'>
            <span title="Allow manual pin operation">Manual</span>
            <ToggleSwitch value={manualSwitchActive} setValue={toggleManualSwitch} />
          </div>
          <div className='top-bar-toggle'>
            <span title="Logging data">Logging</span>
            <ToggleSwitch value={dataLoggingActive} setValue={toggleDataLogging} />
          </div>
        </div>
        <button className='header-abort-button'
          onClick={abort}
          disabled={!armed}
          style={{
            backgroundColor: armed ? 'tomato' : 'lightgrey',
            cursor: armed ? 'pointer' : 'default'
          }}>
          ABORT
        </button>
      </div>

      <div className='top-bar-row top-bar-row-3'>
        <div className='top-bar-panel-switch'>
          <button>Control Panel</button>
          <button>Sequence Panel</button>
          <button>Sensor Calibration</button>
        </div>
        <div className='top-bar-status-text'>
          <span>Arming: <span style={{ color: armingSwitchActive ? '#7CFC7C' : '#FF6B6B' }}>{armingSwitchActive ? 'True' : 'False'}</span></span>
          <span>Manual: <span style={{ color: manualSwitchActive ? '#7CFC7C' : '#FF6B6B' }}>{manualSwitchActive ? 'True' : 'False'}</span></span>
          <span>Logging: <span style={{ color: dataLoggingActive ? '#7CFC7C' : '#FF6B6B' }}>{dataLoggingActive ? 'True' : 'False'}</span></span>
        </div>
      </div>
    </div>
  )
}

export function Panel({ children, title, ...props }) {
  return (
    <div className='panel' {...props}>
        <SectionTitle>{title}</SectionTitle>
        <Paper style={{width:"100%", height:"calc(100% - 52px"}}>
          {children}
        </Paper>
    </div>
  );
}

export const BigSwitch = withStyles((theme) => ({
  root: {
    width: 60,
    height: 32,
    padding: 1,
    display: 'flex',
    overflow: 'visible',
  },
  switchBase: {
    padding: 2,
    color: theme.palette.grey[500],
    '&$checked': {
      transform: 'translateX(26px)',
      color: theme.palette.common.white,
      '& + $track': {
        opacity: 1,
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
      },
    },
  },
  thumb: {
    marginLeft: 1,
    marginTop: 1,
    width: 28,
    height: 28,
    boxShadow: 'none',
  },
  track: {
    border: `1px solid ${theme.palette.grey[500]}`,
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: theme.palette.common.white,
  },
  checked: {},
}))(Switch);

export const NormalSwitch = withStyles((theme) => ({
  root: {
    position: 'absolute',
    top: "-10px",
    left: "-10px",
    width: "6vw",
  },
}))(Switch);

export function ToggleSwitch({ value, setValue }) {
  return (
    <div className='toggle-switch' style={{ width: 60}}>
      <span className={value ? 'inactive' : 'active'}>Off</span>
      <BigSwitch checked={value} onChange={() => setValue(!value)} />
      <span className={value ? 'active' : 'inactive'} style={{ textAlign:'right', width:'100%', display:'block' }}>On</span>
    </div>
  );
}




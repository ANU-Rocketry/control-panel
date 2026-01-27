import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { TopBar } from "./components/index"
import SafetyPanel from './components/panels/safety-panel';
import GraphPanel, { newData, newEvent, pinFromID } from './components/panels/graph-panel'
import Sequences from './components/panels/sequence-panel';
import ControlPanel from './components/panels/control-panel';
import { formatDataPoint, emptyDataPoint } from './utils';
import { undefOnBadRef } from "./components/graph-utils.js"
import { Snackbar, Button } from '@material-ui/core'
import CalibrationPanel from './components/panels/calibration-panel';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null, mostRecentWarning: {}, showWarning: false,
      wsAddress: localStorage.getItem('wsaddr') || "192.168.0.5",
      defaultWSAddress: "192.168.0.5",
      events: [],
      socketStatus: -1,
    }
    this.emit = this.emit.bind(this)
    this.connect()
  }
  componentDidMount() {
    this.interval = setInterval(() => this.emit('PING'), 200);
    this.mounted = true;
  }
  componentWillUnmount() {
    this.mounted = false;
    clearInterval(this.interval);
  }
  pushWarning(time, message) {
    if (!this.state.mostRecentWarning ||
      (this.state.mostRecentWarning.time !== time && this.state.mostRecentWarning.message !== message)) {
      this.setState({ mostRecentWarning: { time, message }, showWarning: true })
    }
  }
  updateSocketStatus() {
    if (!this.socket) return
    const diff = { socketStatus: this.socket.readyState }
    if (this.socket.readyState !== WebSocket.OPEN) {
      this.pushWarning(new Date().getTime(), "Server connection lost")
    }
    this.setState(diff)
  }
  connect() {
    if (this.socket) this.socket.close();
    try {
    this.socket = new WebSocket(`ws://${this.state.wsAddress}:8888`)
    this.updateSocketStatus()
    this.socket.onopen = e => {
      console.log('websocket connection established')
      this.updateSocketStatus()
    }
    this.socket.onclose = e => {
      this.updateSocketStatus()
      this.socket = null
      console.log('websocket connection lost. reconnecting...')
      newData(emptyDataPoint)
      setTimeout(() => {
        if (!this.socket) {
          this.connect()
        }
      }, 1000)
    }
    this.socket.onmessage = e => {
      if (!this.mounted) return
      this.updateSocketStatus()
      const data = JSON.parse(e.data)
      switch (data.type) {
        case 'STATE':
          data.data.time = parseInt(data.data.time) / 1000
          // If there's a >1s gap, introduce a segment break
          // This is well behaved with NaNs (if state.data.time is undefined it's false)

          let stateTime = undefOnBadRef(() => this.state.data.time)
          if (data.data.time - stateTime > 1) {
            newData(emptyDataPoint)
          }
          newData(formatDataPoint(data.data))
          this.setState({ data: data.data })
          if (data.data.latest_warning) {
            this.pushWarning(data.data.latest_warning[0], data.data.latest_warning[1])
          }
          break
        case 'PING':
          this.setState({ ping: new Date().getTime() - data.data })
          break
        case 'VALVE':
          // We use this.state.data.time instead of new Date().getTime() because the devices can report epoch times off by a consistent
          // several hour offset in extreme conditions it seems
          // Example: data.data = { "header": "OPEN", "data": { "name": "LOX", "pin": 13 } }
          const time = data.time / 1000
          const pin = pinFromID(data.data.pin, data.data.stand).pin
          const label = (data.data.header === 'CLOSE' ? 'Closed' : 'Opened') + ' ' + pin.test_stand + ' ' + pin.abbrev
          newEvent({ time, label })
          this.setState({ events: [...this.state.events, { ...data.data, label, time }] })
          break
        default:
          console.error(data)
      }
    }
    } catch (e) {
      console.error(e)
    }
  }
  emit(commandHeader, parameter = null) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify({
      header: commandHeader,
      data: parameter,
      time: new Date().getTime()
    }));
  }

  
  render() {
    return (
      <div>
        <TopBar />
        <div className='panels-root'>
          <div className='panel-row-1'>
            <SafetyPanel state={this.state} emit={this.emit} sockStatus={this.state.socketStatus} that={this} />
            <Sequences state={this.state} emit={this.emit} />
          </div>
          <div className='panel-row-2'>
            <div className='left-column'>
              <ControlPanel state={this.state} emit={this.emit} />
              <CalibrationPanel />
            </div>
            <GraphPanel state={this.state} emit={this.emit} />
          </div>
          {this.state.showWarning && (
            <Snackbar open
              onClose={() => this.setState({ showWarning: false })}
              message={this.state.mostRecentWarning.message}
              action={(
                <Button onClick={() => this.setState({ showWarning: false })}
                  style={{color: "white", textTransform: "none", textDecoration: "underline"}}>
                  Dismiss
                </Button>
              )}
            />
          )}
        </div>
      </div>
    )
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
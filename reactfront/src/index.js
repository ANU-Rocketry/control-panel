import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { TopBar } from "./components/index"
import SafetyPanel from './components/panels/safety-panel';
import GraphPanel, { newData, newEvent, pinFromID } from './components/panels/graph-panel'
import Sequences from './components/panels/sequence-panel';
import ControlPanel from './components/panels/control-panel';
import Alert from '@material-ui/lab/Alert';
import { formatDataPoint, emptyDataPoint } from './utils';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null, mostRecentWarning: {}, showWarning: false,
      wsAddress: localStorage.getItem('wsaddr') || "192.168.0.5",
      defaultWSAddress: "192.168.0.5",
      events: []
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
  connect() {
    if (this.socket) this.socket.close();
    try {
    this.socket = new WebSocket(`ws://${this.state.wsAddress}:8888`)
    this.socket.onopen = e => console.log('websocket connection established')
    this.socket.onclose = e => {
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
      if (!this.mounted) return;
      const data = JSON.parse(e.data);
      switch (data.type) {
        case 'STATE':
          newData(formatDataPoint(data.data))
          this.setState({ data: data.data })
          break
        case 'PING':
          this.setState({ ping: new Date().getTime() - data.data })
          break
        case 'VALVE':
          // We use this.state.data.time instead of new Date().getTime() because the devices can report epoch times off by a consistent
          // several hour offset in extreme conditions it seems
          // Example: { "header": "OPEN", "data": { "name": "LOX", "pin": 13 }, "time": 1651140990 }
          const time = parseInt(this.state.data.time) / 1000
          const pin = pinFromID(data.data.data.pin).pin
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
      command: {
        header: commandHeader,
        data: parameter
      },
      time: new Date().getTime()
    }));
  }

  render() {
    if (this.state.data && this.state.data.latest_warning && this.state.data.latest_warning.id !== this.state.mostRecentWarning.id) {
      console.log(this.state.mostRecentWarning);
      this.setState({ mostRecentWarning: this.state.data.latest_warning, showWarning: true });
    }
    return (
      <div>
        <TopBar />
        <div className='panels-root'>
          <div className='panel-row-1'>
            <SafetyPanel state={this.state} emit={this.emit} that={this} />
            <Sequences state={this.state} emit={this.emit} />
          </div>
          <div className='panel-row-2'>
            <ControlPanel state={this.state} emit={this.emit} />
            <GraphPanel state={this.state} emit={this.emit} />
          </div>
          {this.state.showWarning && (
            <Alert onClose={()=>{this.setState({ showWarning: false })}} severity="error" className='alert'>
              {this.state.mostRecentWarning.message}
            </Alert> 
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

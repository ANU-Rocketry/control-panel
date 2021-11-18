import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { TopBar } from "./components/index"
import SafetyPanel from './components/panels/safety-panel';
import GraphPanel from './components/panels/graph-panel'
import Sequences from './components/panels/sequence-panel';
import ControlPanel from './components/panels/control-panel';
import Alert from '@material-ui/lab/Alert';

const WS_ADDRESS = "ws://127.0.0.1:8888";

class App extends React.Component {

  constructor(props) {
    super(props);
    this.connect()
    this.state = { data: null, history: [], mostRecentWarning: {}, showWarning: false };
    this.emit = this.emit.bind(this)
  }
  componentDidMount() {
    this.interval = setInterval(() => this.emit('PING'), 1000);
    this.mounted = true;
  }
  componentWillUnmount() {
    this.mounted = false;
    clearInterval(this.interval);
  }
  connect() {
    this.socket = new WebSocket(WS_ADDRESS)
    this.socket.onopen = e => console.log('websocket connection established')
    this.socket.onclose = e => {
      setTimeout(() => this.connect(), 5000)
    }
    this.socket.onmessage = e => {
      if (!this.mounted) return;
      const data = JSON.parse(e.data);
      switch (data.type) {
        case 'STATE':
          // React state is not meant to be mutated but we don't want to copy
          // huge lists all the time and it won't cause us any problems in
          // this specific case
          // The history list is stored as [oldest, ..., newest]
          this.state.history.push(data.data);
          // Anything beyond 1 000 000 items is a bit extreme, halve it
          // 1M items will last more than 8 hours
          if (this.state.history.length > 1000000)
            this.state.history = this.state.history.slice(500000, -1);
          this.setState({ data: data.data, history: this.state.history })
          break
        case 'PING':
          this.setState({ ping: new Date().getTime() - data.data })
          break
        default:
          console.error(data)
      }
    }
  }
  emit(commandHeader, parameter = null) {
    if (this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify({
      command: {
        header: commandHeader,
        data: parameter
      },
      time: new Date().getTime()
    }));
  }

  render() {
    if (this.state.data && this.state.data.latest_warning && this.state.data.latest_warning.id != this.state.mostRecentWarning.id) {
      console.log(this.state.mostRecentWarning);
      this.state.mostRecentWarning = this.state.data.latest_warning;
      this.state.showWarning = true;
    }
    return (
      <div>
        <TopBar />
        <div className='panels-root'>
          <div className='panel-row-1'>
            <SafetyPanel state={this.state} emit={this.emit} />
            <Sequences state={this.state} emit={this.emit} />
          </div>
          <div className='panel-row-2'>
            <ControlPanel state={this.state} emit={this.emit} />
            <GraphPanel state={this.state} emit={this.emit} />
          </div>
          {
          this.state.showWarning 
            ? <Alert onClose={()=>{this.setState({ showWarning: false })}} severity="error" className='alert'>
              {this.state.mostRecentWarning.message}
              </Alert> 
            : null}
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
);

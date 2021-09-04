import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { TopBar } from "./components/index"
import SafetyPanel from './components/Safety/safety-panel';
import SequencePanel from './components/Sequence/sequence-panel';
import ControlPanel from './components/Controls/control-panel';
import GraphPanel from './components/Graphing/graph-panel';

const WS_ADDRESS = "ws://localhost:8888";

class App extends React.Component {

  constructor(props) {
    super(props);
    this.connect()
    this.state = { data: null };
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
          this.setState({ data: data.data })
          break
        case 'PING':
          this.setState({ ping: new Date().getTime() - data.data })
          break
        default:
          console.error(data)
      }
    }
  }
  emit(header, parameter = null) {
    if (this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify({
      command: { header, parameter },
      time: new Date().getTime()
    }));
  }

  render() {
    return (
      <div>
        <TopBar/>
        <div>
          <div className='panel-row-1'>
            <SafetyPanel state={this.state} emit={this.emit} />
            <SequencePanel/>
          </div>
          <div className='panel-row-2'>
            <ControlPanel/>
            <GraphPanel/>
          </div>
        </div>
        <div>Current data: {JSON.stringify(this.state.data)}</div>
        <div>Ping: {this.state.ping}</div>
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

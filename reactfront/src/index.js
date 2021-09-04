import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.socket = new WebSocket("ws://3f96-150-203-2-194.ngrok.io:80")
    this.socket.onopen = e => console.log('websocket connection established')
    this.state = { data: null };
  }
  componentDidMount() {
    this.socket.onmessage = e => {
      const data = JSON.parse(e.data);
      const ping = Math.round(new Date().getTime() - 1000 * data.time);
      this.setState({ data, ping });
    }
  }
  render() {
    const toggleArmingSwitch = () => {
      // TODO: backend should have a boolean param for arming switch instead of
      // a toggle
      this.socket.send(JSON.stringify({
        header: 'ARMINGSWITCH',
        parameter: null
      }))
    }
    const armingSwitchActive = this.state.data === null ? false : this.state.data.state.arming_switch;
    return (
      <div>
        <header>
          <p>LabJack example</p>
        </header>
        <div>
          <input type='checkbox' checked={armingSwitchActive} disabled={this.state.data === null} onChange={toggleArmingSwitch} />
          Arming switch
        </div>
        <div>Current data: {JSON.stringify(this.state.data)}</div>
        <div>Current ping: {this.state.ping}</div>
      </div>
    );
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

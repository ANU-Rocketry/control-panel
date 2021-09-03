import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.socket = new WebSocket("ws://2.tcp.ngrok.io:13604")
    this.socket.onopen = e => console.log('websocket connection established')
    this.state = { data: null };
  }
  componentDidMount() {
    this.socket.onmessage = e => {
      this.setState({ data: e.data });
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
    const armingSwitchActive = this.state.state && this.state.state.state.arming_switch;
    return (
      <div>
        <header>
          <p>LabJack example</p>
        </header>
        <div>
          <input type='checkbox' checked={armingSwitchActive} disabled={this.state.data === null} onChange={toggleArmingSwitch} />
          Arming switch
        </div>
        <div>Current data: {this.state.data}</div>
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

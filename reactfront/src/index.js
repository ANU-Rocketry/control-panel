import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Topbar from "./components/top-bar"
import MainBody from './components/main-body';


const WS_ADDRESS = "ws://127.0.0.1:8888";

class App extends React.Component {

  constructor(props) {
    super(props);
    this.connect()
    this.state = { data: null };
  }

  connect() {
    this.socket = new WebSocket(WS_ADDRESS)
    this.socket.onopen = e => console.log('websocket connection established')
    this.socket.onclose = e => {
      this.connect()
    }
    this.socket.onmessage = e => {
      const data = JSON.parse(e.data);
      if (data.PONG) {
        console.log(new Date().getTime() - data.PONG)
        return;
      }
      const ping = Math.round(new Date().getTime() - 1000 * data.time);
      this.setState({ data, ping });
    }
  }

  render(){
    return (
      <div>
        <Topbar/>
        <MainBody/>
      </div>
    )
  }

//   render() {
//     const toggleArmingSwitch = () => {
//       // TODO: backend should have a boolean param for arming switch instead of
//       // a toggle
//       this.socket.send(JSON.stringify({
//         command: {
//           header: 'ARMINGSWITCH',
//           parameter: null
//         },
//         time: new Date().getTime()
//       }))
//     }
//     const armingSwitchActive = this.state.data === null ? false : this.state.data.state.arming_switch;
//     return (
//       <div>
//         <header>
//           <p>LabJack example</p>
//         </header>
//         <div>
//           <Switch
//             checked={armingSwitchActive}
//             onChange={toggleArmingSwitch}
//           />
//           Arming switch
//         </div>
//         <div>Current data: {JSON.stringify(this.state.data)}</div>
//         <div>Inaccurate ping: {this.state.ping}</div>
//         <div>Print exact ping to console: <button onClick={ ()=>   this.socket.send(JSON.stringify({command:{header:'PING'},time:new Date().getTime()}))
// }>yo</button></div>
//       </div>
//     );
//   }

}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

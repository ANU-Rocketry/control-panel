import React from 'react';
import { Panel } from '../index'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, Brush } from 'recharts'
import Switch from '@material-ui/core/Switch';

function formatData(state, data) {
  return data.map(dict => {
    return {
      time: "t-" + ((parseInt(state.data.time) - parseInt(dict.time)) / 1000).toFixed(3),
      LOX_N2_Pressure: dict.LOX.analog["1"],
      LOX_Tank_Pressure: dict.LOX.analog["3"],
      ETH_N2_Pressure: dict.ETH.analog["1"],
      ETH_Tank_Pressure: dict.ETH.analog["3"],
    }
  })
}

function reduceResolution(data) {
  return data.filter(function(_, i) {
     return i % 2 === 0;
 })
}

export default function GraphPanel({ state, emit }) {
  const [paused, setPaused] = React.useState(false);
  const [staticData, setStaticData] = React.useState([...state.history]);
  const n = state.history.length;
  const sample = !paused ? state.history.slice(n - 200, -1) : staticData;
  const data = !paused ? formatData(state, sample) : staticData;
  return (
    <Panel title="Graphs">
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis>
            <Label angle={270} position='left' style={{ textAnchor: 'middle' }}>
              Pressure (PSI)
            </Label>
          </YAxis>
          <Tooltip
            position={{ x: 100, y: 0 }} // this was my preferred static position
          />
          {paused ? <Brush/> : null}
          <Legend />
          <Line type="monotone" dataKey="LOX_N2_Pressure" stroke="#ff0000"></Line>
          <Line type="monotone" dataKey="LOX_Tank_Pressure" stroke="#000000"></Line>
          <Line type="monotone" dataKey="ETH_N2_Pressure" stroke="#0099ff"></Line>
          <Line type="monotone" dataKey="ETH_Tank_Pressure" stroke="#66ff99"></Line>
        </LineChart>
      </ResponsiveContainer>
      <Switch checked={paused} onChange={e => {
        setPaused(e.target.checked)
        if (paused) setStaticData(formatData(state, reduceResolution(state.history.slice(n - 6000, -1))));
      }} /> Analysis Mode
    </Panel>
  )
}
import React from 'react';
import { Panel } from '../index'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, ReferenceArea } from 'recharts'

const MAX_GRAPH_POINTS = 100;

function decimate(history) {
  // We want to plot at most MAX_GRAPH_POINTS data points realistically
  const n = history.length;
  if (n <= MAX_GRAPH_POINTS) return history;
  const decimated = [];
  const step = n / MAX_GRAPH_POINTS;
  let i = 0;
  for (; i <= n - 1; i += step) {
    decimated.push(history[Math.round(i)])
  }
  if (i < n - 1) decimated.push(history[n - 1]);
  return decimated
}

export default function GraphPanel({ state, emit }) {
  const sample = decimate(state.history)
  const data = sample.map(dict => {
    if (!dict) console.log(sample)
    if (!state.data) console.log(state)
    return {
      time: "t - " + (parseInt(state.data.time) - parseInt(dict.time)),
      LOX_N2_Pressure: dict.LOX.analog["1"],
      LOX_Tank_Pressure: dict.LOX.analog["3"],
      ETH_N2_Pressure: dict.ETH.analog["1"],
      ETH_Tank_Pressure: dict.ETH.analog["3"],
    }
  })
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
          <Legend />
          <Line type="monotone" dataKey="LOX_N2_Pressure" stroke="#ff0000"></Line>
          <Line type="monotone" dataKey="LOX_Tank_Pressure" stroke="#000000"></Line>
          <Line type="monotone" dataKey="ETH_N2_Pressure" stroke="#0099ff"></Line>
          <Line type="monotone" dataKey="ETH_Tank_Pressure" stroke="#66ff99"></Line>
        </LineChart>
      </ResponsiveContainer>
    </Panel>
  )
}
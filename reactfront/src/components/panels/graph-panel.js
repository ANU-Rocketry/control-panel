import React from 'react';
import { Panel } from '../index'
import { Slider } from '@material-ui/core'
import { getPsi, sensorData } from '../../utils'
import { disablePageScroll, enablePageScroll } from 'scroll-lock'
import pins from '../../pins.json'

function formatData(state) {
  let [dmin, dmax] = [0, 0]
  const newData = state.history.map(dict => {
    const data = {
      // Epoch time in fractional seconds
      time: parseInt(dict.time) / 1000,
      // Time in the past, in fractional seconds (it's never positive)
      t_minus_time: (parseInt(dict.time) - parseInt(state.data.time)) / 1000,
      // Note: these bar max figures are also in the sensors list in control-panel.js
      // TODO: use the old code to calibrate these dodgy sensors poorly
      // TODO: include them in the min/max calculation
      // LOX_N2_Pressure: getPsi(dict.LOX.analog["1"], 250, 4, 16),  // uncalibrated!!!
      LOX_Tank_Pressure: getPsi(dict.labjacks.LOX.analog["3"], sensorData.lox_tank.barMax, sensorData.lox_tank.zero, sensorData.lox_tank.span),
      // ETH_N2_Pressure: getPsi(dict.ETH.analog["1"], 250, 4, 16),  // uncalibrated!!!
      ETH_Tank_Pressure: getPsi(dict.labjacks.ETH.analog["3"], sensorData.eth_tank.barMax, sensorData.eth_tank.zero, sensorData.eth_tank.span),
    }
    if (data.LOX_Tank_Pressure < dmin) dmin = data.LOX_Tank_Pressure
    if (data.ETH_Tank_Pressure < dmin) dmin = data.ETH_Tank_Pressure
    if (data.LOX_Tank_Pressure > dmax) dmax = data.LOX_Tank_Pressure
    if (data.ETH_Tank_Pressure > dmax) dmax = data.ETH_Tank_Pressure
    return data
  })
  return [newData, dmin, dmax]
}

function reduceResolution(data) {
  // Reduce the resolution by taking every `decimation` points
  // This decimation factor is chosen to keep the number of points bounded by 300
  // We ensure that the start and end points are included
  const n = data.length
  const decimation = Math.floor(n / 300) + 1
  return data.filter((_, i) => i % decimation === 0 || i === n - 1)
}

// TODO: binary search
function indexOfLastPointBeforeTime(points, time) {
  for (let i = points.length - 1; i >=0; i--) {
    if (points[i].time <= time) {
      return i
    }
  }
}

// Round a decimal to the nearest power of 1, 2 or 5 in log space
function roundToNiceDecimalIncrement(num) {
  if (num < 0) return roundToNiceDecimalIncrement(-num)
  if (num === 0) return 0
  // Power of 10 required to multiply num into the range [1,10)
  const power = -Math.floor(Math.log10(num))
  // log10(num * 10^power)
  const logNum = Math.log10(num) + power
  const [log1, log2, log5, log10] = [0, Math.log10(2), Math.log10(5), 1]
  const dLog = [Math.abs(logNum - log1), Math.abs(logNum - log2), Math.abs(logNum - log5), Math.abs(logNum - log10)]
  const mLog = Math.min(...dLog)
  let nearest = 0
  if (mLog === dLog[0]) nearest = 1
  else if (mLog === dLog[1]) nearest = 2
  else if (mLog === dLog[2]) nearest = 5
  else nearest = 10
  return nearest * 10 ** -power
}

// Generate around a suggested number of nicely rounded decimal axis ticks with units
// Returns a list of { tick: double, label: string } dicts
function generateAxisTicks(min, max, suggested, unit) {
  const increment = roundToNiceDecimalIncrement((max - min) / suggested)
  const ticks = []
  const adjustedMin = Math.ceil(min / increment) * increment
  const adjustedMax = Math.floor(max / increment) * increment
  for (let tick = adjustedMin; tick <= adjustedMax; tick += increment) {
    ticks.push({
      tick,
      // Formatted label including SI unit prefixes
      label: Math.abs(tick) > 1000 ? `${(tick/1000).toFixed(1)} k${unit}`
        : Math.abs(tick) > 1 ? `${tick.toFixed(1)} ${unit}`
        : Math.abs(tick) > 0.001 ? `${(tick*1000).toFixed(1)} m${unit}`
        : Math.abs(tick) > 0.000001 ? `${(tick*1000000).toFixed(1)} μ${unit}`
        : '0.0 ' + unit
    })
  }
  return ticks
}

function pinFromID(labjack_pin) {
  return pins.buttons.filter(pin => pin.pin.labjack_pin === labjack_pin)[0]
}

export default function GraphPanel({ state, emit }) {
  // Instead of using a cumbersome charting library, we use JSX with SVG to declaratively
  // and efficiently construct highly customisable graphs

  // state.history is a list of dictionaries. Each dictionary is a snapshot of the app state at a given time
  // We accumulate a chronologically ordered list of dictionaries of sensor readings at each state history snapshot
  const [points, ymin, ymax] = formatData(state)

  // Window of points to display
  // Fixed representation: [start_epoch_seconds, end_epoch_seconds] (stays focused on a fixed time window)
  // Sliding representation: [t_minus_seconds] (stays focused on the current time, up to a fixed number of seconds before)
  const [window, setWindow] = React.useState([-3]);
  // Window of point indices to display, with at least one on either side
  const currentSeconds = state.history.length ? parseInt(state.data.time) / 1000 : (new Date().getTime()) / 1000
  const effectiveTimeWindow = window.length === 1
    ? [currentSeconds + window[0], currentSeconds]
    : window
  const relativeTimeWindow = [effectiveTimeWindow[0] - currentSeconds, effectiveTimeWindow[1] - currentSeconds]
  const indexWindow = [
    indexOfLastPointBeforeTime(points, effectiveTimeWindow[0]),
    Math.max(indexOfLastPointBeforeTime(points, effectiveTimeWindow[1]) + 1, points.length - 1)
  ]

  // Decimate the data in the selected window to reduce the number of points to display
  const decimatedPoints = reduceResolution(points.slice(indexWindow[0], indexWindow[1]))

  // Box model
  const w = 600, h = 450;
  const margin = { l: 90, r: 16, t: 10, b: 35 }   // margin around the graph (between SVG bounding box and axes)
  // Conversion from decimal in [0,1] range to pixel
  const p2x = p => margin.l + p * (w - margin.l - margin.r)
  const p2y = p => margin.t + p * (h - margin.t - margin.b)
  // Conversion from t-minus time in seconds / pressure in psi to pixel
  const v2x = v => p2x((v - relativeTimeWindow[0]) / (relativeTimeWindow[1] - relativeTimeWindow[0]))
  const v2y = v => p2y((v - ymin) / (ymax - ymin))

  // Horizontal axis ticks
  const xTicks = generateAxisTicks(...relativeTimeWindow, 4, 's')
  const yTicks = generateAxisTicks(ymin, ymax, 10, 'psi')

  // [key, color, label] list
  const series = [
    ['LOX_Tank_Pressure', '#000000', 'LOX Tank'],
    ['ETH_Tank_Pressure', '#33dd66', 'ETH Tank'],
  ]

  const sliderChangeHandler = (_event, newTimeWindow) => {
    // Convert window to the appropriate time window representation
    if (newTimeWindow[1] >= currentSeconds - (currentSeconds - points[0].time) * 0.01) {
      setWindow([newTimeWindow[0] - newTimeWindow[1]])
    } else {
      setWindow(newTimeWindow)
    }
  }

  const wheelHandler = e => {
    // Annoyingly, using e.preventDefault() or e.stopPropagation() in the wheel or scroll events
    // does not stop the scroll from also happening (tested on Chrome on an M1 Mac)
    // So instead we use the scroll-lock library to disable scrolling when the mouse is over the graph view
    const d = e.deltaX + e.deltaY
    if (window.length === 1) {
      // Scale the left edge
      const left = Math.max(window[0] * Math.pow(1.001, -d), Math.min(points[0].t_minus_time, -10))
      setWindow([Math.min(left, -0.01)])
    } else {
      // Scale both edges (zooming around the center)
      const left = Math.max(window[0] * Math.pow(1.001, -d), points[0].time)
      const right = Math.max(Math.min(window[1] * Math.pow(1.001, d), points[points.length - 1].time), points[0].time + 0.01)
      setWindow([Math.min(left, right - 0.01), right])
    }
  }

  // Vertical lines at times when valves were toggled
  // state.valveHistory is a list of dicts like { "header": "CLOSE", "data": { "name": "ETH", "pin": 19 }, time: epoch_secs }
  // This example corresponds to the button with labjack_pin=19 in pins.json
  const verticalLabels = state.valveHistory.map(({header, data, time}) => {
    const pin = pinFromID(data.pin).pin
    const label = (header === 'CLOSE' ? 'Closed' : 'Opened') + ' ' + pin.test_stand + ' ' + pin.abbrev
    return {
      x: v2x(time - currentSeconds),
      label
    }
  })

  return (
    <Panel title="Graphs" className='panel graphs' onWheel={wheelHandler}>
      <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" width={w} height={h}
        onMouseOver={() => disablePageScroll()} onMouseOut={() => enablePageScroll()}>
        <defs>
          {/* Bounding box for data series rendering */}
          <clipPath id="data-clip-path">
            <rect x={p2x(0)} y={p2y(0)} width={p2x(1)-p2x(0)} height={p2y(1)-p2y(0)} />
          </clipPath>
        </defs>
        {/* Horizontal axis */}
        <line x1={p2x(0)} y1={p2y(1)} x2={p2x(1)} y2={p2y(1)} stroke="black" strokeWidth='2' />
        <text x={p2x(0.5)} y={h-2} textAnchor="middle" fontSize="12" fontWeight="bold">Time (s)</text>
        {xTicks.map(({ tick, label }) => (
          <React.Fragment key={tick}>
            <line x1={v2x(tick)} y1={p2y(1)} x2={v2x(tick)} y2={p2y(1)+5} stroke="black" />
            <text x={v2x(tick)} y={p2y(1)+7} textAnchor="middle" alignmentBaseline="text-before-edge" fontSize="12">{label}</text>
          </React.Fragment>
        ))}
        {/* Vertical axis */}
        <line x1={p2x(0)} y1={p2y(0)} x2={p2x(0)} y2={p2y(1)} stroke="black" strokeWidth='2' />
        <text y={20} x={-p2y(0.5)} textAnchor="middle" fontSize="12" fontWeight="bold" transform="rotate(-90)" dy="-0.5em">Pressure (psi)</text>
        {yTicks.map(({ tick, label }) => (
          <React.Fragment key={tick}>
            <line x1={p2x(0)} y1={v2y(tick)} x2={p2x(0)-5} y2={v2y(tick)} stroke="black" />
            <text x={p2x(0)-7} y={v2y(tick)} textAnchor="end" alignmentBaseline="middle" fontSize="12">{label}</text>
          </React.Fragment>
        ))}
        {/* Vertical labels (valve toggle indicators) */}
        {verticalLabels.map(({x, label}) => (
          <g key={x}>
            <line x1={x} y1={p2y(0)} x2={x} y2={p2y(1)} stroke="#333" strokeWidth='1' strokeDasharray='4' clipPath='url(#data-clip-path)' />
            <text x={x+5} y={p2y(1)} textAnchor="start" alignmentBaseline="text-after-edge" fontSize="12" clipPath='url(#data-clip-path)'>{label}</text>
          </g>
        ))}
        {/* Series (plotting data curves as polylines) */}
        {series.map(([key, color, label]) => (
          <polyline key={key} points={decimatedPoints.map(({ t_minus_time, ...point }) => ` ${v2x(t_minus_time)},${v2y(point[key])}`).join('')}
            fill="none" stroke={color} strokeWidth="1" clipPath='url(#data-clip-path)' />
        ))}
        {/* Key/Legend */}
        {series.map(([key, color, label], i) => (
          <g key={key}>
            <circle r="3.5" fill={color} cx={w-5} cy={14+i*20} />
            <text fontSize="12" x={w-15} textAnchor="end" alignmentBaseline='middle' fill={color} y={15+i*20}>{label}</text>
          </g>
        ))}
      </svg>
      {/* Time window selection slider */}
      <Slider
        value={effectiveTimeWindow}
        onChange={sliderChangeHandler}
        valueLabelDisplay='off'
        min={points[0]?.time}
        max={points[points.length - 1]?.time}
        style={{width: w - 40, marginLeft: 50}}
        step={0.01}
        marks={[
          { value: points[0]?.time, label: `${Math.round(points[points.length - 1]?.time-points[0]?.time)}s ago` },
          { value: points[points.length - 1]?.time, label: 'now' },
        ]}
      />
    </Panel>
  )
}

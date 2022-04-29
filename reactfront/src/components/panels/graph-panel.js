import React from 'react';
import { Panel } from '../index'
import { Slider } from '@material-ui/core'
import { getPsi, sensorData } from '../../utils'
import { disablePageScroll, enablePageScroll } from 'scroll-lock'
import pins from '../../pins.json'

window.enablePageScroll = enablePageScroll
window.disablePageScroll = disablePageScroll

// Calibration function for dodgy old sensors
function voltsToPsi(volts, barMax) {
  const resistance = 120; // ohm
  const current1 = 0.004; // amps
  const current2 = 0.02; // amps
  const bar = barMax/(resistance * current2) * (volts - resistance * current1)
  return bar * 14.504; // 1bar = 14.5psi
}

function formatDataPoint(dict, time) {
  return {
    // Epoch time in fractional seconds
    time: parseInt(dict.time) / 1000,
    // Time in the past, in fractional seconds (it's never positive)
    t_minus_time: (parseInt(dict.time) - parseInt(time)) / 1000,
    // Note: these bar max figures are also in the sensors list in control-panel.js
    LOX_Tank_Pressure: getPsi(dict.labjacks.LOX.analog["3"], sensorData.lox_tank.barMax, sensorData.lox_tank.zero, sensorData.lox_tank.span),
    LOX_N2_Pressure: voltsToPsi(dict.labjacks.LOX.analog["1"], 250 /* bar */),  // BADLY CALIBRATED!!!
    ETH_Tank_Pressure: getPsi(dict.labjacks.ETH.analog["3"], sensorData.eth_tank.barMax, sensorData.eth_tank.zero, sensorData.eth_tank.span),
    ETH_N2_Pressure: voltsToPsi(dict.labjacks.ETH.analog["1"], 250 /* bar */),  // BADLY CALIBRATED!!!
  }
}

function minMax(arr) {
  let [dmin, dmax] = [Infinity, -Infinity]
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < dmin) dmin = arr[i]
    if (arr[i] > dmax) dmax = arr[i]
  }
  return [dmin, dmax]
}

// expandRange(0, 10, 0.2) will return [-2, 12]
function expandRange(a, b, fraction) {
  return [a - (b - a) * fraction, b + (b - a) * fraction]
}

function formatData(state, historySubset) {
  const newData = historySubset?.map(dict => formatDataPoint(dict, state.data.time)) || []
  let pressures = [
    ...newData.map(x => x.LOX_Tank_Pressure),
    ...newData.map(x => x.LOX_N2_Pressure),
    ...newData.map(x => x.ETH_Tank_Pressure),
    ...newData.map(x => x.ETH_N2_Pressure),
  ]
  return [newData, expandRange(...minMax(pressures), 0.1)]
}

function reduceResolution(data) {
  // Reduce the resolution by taking every `decimation` points
  // This decimation factor is chosen to keep the number of points bounded by 300
  // We ensure that the start and end points are included
  const n = data.length
  const decimation = Math.floor(n / 300) + 1
  return data.filter((_, i) => i % decimation === 0 || i === n - 1)
}

// Binary search an array for the index of the last element that is lesser than or equal to `target`
// The optional `map` transformation function is applied to the array elements before the search (but not to the target)
// If no elements are <= target, it returns -1
function binarySearch(arr, target, map) {
  let left = 0
  let right = arr.length - 1
  let mid
  if (map === null) map = x => x  // optional transformation function
  while (left <= right) {
      mid = Math.floor((left + right) / 2)
      let mapped = map(arr[mid])
      if (mapped === target) {
          return mid
      } else if (mapped < target) {
          left = mid + 1
      } else {
          right = mid - 1
      }
  }
  return right
}

// Operates on the entire state
function indexOfLastPointBeforeTimeInFullState(state, time) {
  // Does a binary search over state.history until it finds the last point before time
  return binarySearch(state.history, time, dict => parseInt(dict.time) / 1000)
}

// Operates on a dictionary of some subset of formatted points (from formatData)
function indexOfLastPointBeforeTime(points, time) {
  return binarySearch(points, time, dict => dict.time)
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

// Formatted label including SI unit prefixes
function formatUnit(val, unit) {
  return Math.abs(val) >= 1000 ? `${(val/1000).toFixed(1)} k${unit}`
       : Math.abs(val) >= 1 ? `${val.toFixed(1)} ${unit}`
       : Math.abs(val) >= 0.001 ? `${(val*1000).toFixed(1)} m${unit}`
       : Math.abs(val) >= 0.000001 ? `${(val*1000000).toFixed(1)} μ${unit}`
       : `${val.toFixed(1)} ${unit}`
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
      label: formatUnit(tick, unit)
    })
  }
  return ticks
}

function pinFromID(labjack_pin) {
  return pins.buttons.filter(pin => pin.pin.labjack_pin === labjack_pin)[0]
}

// We store yBounds persistently to lerp between ranges smoothly
let yBounds = null
const minYBounds = [-10, 10]  // psi

export default function GraphPanel({ state, emit }) {
  // Instead of using a cumbersome charting library, we use JSX with SVG to declaratively
  // and efficiently construct highly customisable graphs
  const svgRef = React.useRef(null)

  // Window of points to display
  // Fixed representation: [start_epoch_seconds, end_epoch_seconds] (stays focused on a fixed time window)
  // Sliding representation: [t_minus_seconds] (stays focused on the current time, up to a fixed number of seconds before)
  const [window, setWindow] = React.useState([-3]);
  // Window of point indices to display, with at least one on either side
  // We use state.data.time where possible instead of new Date().getTime() because the devices can report epoch times off by a consistent
  // several hour offset in extreme conditions it seems. We use state.data.time everywhere we can for the current time for consistency
  const currentSeconds = state.history.length ? parseInt(state.data.time) / 1000 : (new Date().getTime()) / 1000
  const effectiveTimeWindow = window.length === 1
    ? [currentSeconds + window[0], currentSeconds]
    : window
  const relativeTimeWindow = [effectiveTimeWindow[0] - currentSeconds, effectiveTimeWindow[1] - currentSeconds]
  const indexWindow = [
    Math.max(indexOfLastPointBeforeTimeInFullState(state, effectiveTimeWindow[0]), 0),
    Math.min(indexOfLastPointBeforeTimeInFullState(state, effectiveTimeWindow[1]) + 2, state.history.length - 1)
  ]

  // state.history is a list of dictionaries. Each dictionary is a snapshot of the app state at a given time
  // We accumulate a chronologically ordered list of dictionaries of sensor readings at each state history snapshot
  // We select a slice of visible points from this list and then decimate it before processing it
  // Decimate the data in the selected window to reduce the number of points to display
  let [points, newYBounds] = formatData(state, reduceResolution(state.history.slice(indexWindow[0], indexWindow[1] + 1)))

  // lerp the bounds over time
  newYBounds = [Math.min(newYBounds[0], minYBounds[0]), Math.max(newYBounds[1], minYBounds[1])]
  if (yBounds === null) yBounds = newYBounds
  else yBounds = [yBounds[0] * 0.9 + newYBounds[0] * 0.1, yBounds[1] * 0.9 + newYBounds[1] * 0.1]

  // Percentage start/end of the y bounds we see (for primitive vertical zoom functionality)
  const [ySubset, setYSubset] = React.useState([0, 1])
  const ySliderChangeHandler = (_event, newYSubset) => {
    setYSubset([Math.min(...newYSubset), Math.max(...newYSubset)])
  }
  const effectiveYBounds = [yBounds[0] + (yBounds[1] - yBounds[0]) * ySubset[0], yBounds[1] - (yBounds[1] - yBounds[0]) * (1 - ySubset[1])]

  const fullTimeBounds = state.history && state.history.length > 0
    ? [parseInt(state.history[0].time) / 1000, parseInt(state.history[state.history.length - 1].time) / 1000]
    : [-1, 0]

  // Box model
  const w = 600, h = 450;
  const margin = { l: 90, r: 16, t: 10, b: 35 }   // margin around the graph (between SVG bounding box and axes)
  // Conversion from decimal in [0,1] range to pixel
  const p2x = p => margin.l + p * (w - margin.l - margin.r)
  const p2y = p => margin.t + p * (h - margin.t - margin.b)
  const x2p = x => (x - margin.l) / (w - margin.l - margin.r) // inverse
  // Conversion from t-minus time in seconds / pressure in psi to pixel
  const v2x = v => p2x((v - relativeTimeWindow[0]) / (relativeTimeWindow[1] - relativeTimeWindow[0]))
  const v2y = v => p2y(1 - (v - effectiveYBounds[0]) / (effectiveYBounds[1] - effectiveYBounds[0]))
  const x2v = x => relativeTimeWindow[0] + x2p(x) * (relativeTimeWindow[1] - relativeTimeWindow[0]) // inverse

  // Horizontal axis ticks
  const xTicks = generateAxisTicks(...relativeTimeWindow, 4, 's')
  const yTicks = generateAxisTicks(effectiveYBounds[0], effectiveYBounds[1], 10, 'psi')

  // [key, color, label] list
  const series = [
    ['LOX_Tank_Pressure', '#000000', 'LOX Tank'],
    ['LOX_N2_Pressure', '#ff0000', 'LOX N2'],
    ['ETH_Tank_Pressure', '#33dd66', 'ETH Tank'],
    ['ETH_N2_Pressure', '#0099ff', 'ETH N2'],
  ]

  // Hover tooltip
  // Mouse X position relative to the <svg>
  const [mousePosX, setMousePosX] = React.useState(null)
  const tooltipIndex = mousePosX && indexOfLastPointBeforeTime(points, currentSeconds + x2v(mousePosX))
  // TODO: linear interpolation between adjacent values
  const tooltipText = tooltipIndex && tooltipIndex >= 0 && series.map(s => s[2] + ' ' + formatUnit(points[tooltipIndex][s[0]], 'psi'))
  const flipTooltip = tooltipIndex && mousePosX > p2x(1) - 160

  const sliderChangeHandler = (_event, newTimeWindow) => {
    // Convert window to the appropriate time window representation
    if (newTimeWindow[1] >= currentSeconds - (currentSeconds - fullTimeBounds[0]) * 0.01) {
      setWindow([Math.min(newTimeWindow[0] - newTimeWindow[1], -0.01)])
    } else {
      if (newTimeWindow[1] - newTimeWindow[0] < 0.01) newTimeWindow[0] = newTimeWindow[1] - 0.01
      setWindow(newTimeWindow)
    }
  }

  const [mouseDown, setMouseDown] = React.useState(false)
  const [dragStartXAndTime, setDragStartXAndTime] = React.useState(null)

  const wheelHandler = e => {
    // Annoyingly, using e.preventDefault() or e.stopPropagation() in the wheel or scroll events
    // does not stop the scroll from also happening (tested on Chrome on an M1 Mac)
    // So instead we use the scroll-lock library to disable scrolling when the mouse is over the graph view
    const d = e.deltaX + e.deltaY
    if (window.length === 1) {
      // Scale the left edge
      const left = Math.max(window[0] * Math.pow(1.001, -d), Math.min(fullTimeBounds[0] - currentSeconds, -10))
      setWindow([Math.min(left, -0.01)])
    } else {
      // Scale both edges (zooming around the center)
      const mid = (window[0] + window[1]) / 2
      const left = Math.max(mid + (window[0] - mid) * Math.pow(1.001, -d), Math.min(fullTimeBounds[0] + 0.01, currentSeconds-10))
      const right = Math.min(mid + (window[1] - mid) * Math.pow(1.001, -d), fullTimeBounds[1])
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

  const handleMouseMove = e => {
    // Show tooltip on hover
    const x = e.clientX - svgRef.current?.getBoundingClientRect().left
    setMousePosX(x)
    if (mouseDown && dragStartXAndTime === null) {
      setDragStartXAndTime([x, effectiveTimeWindow])
    }
    if (mouseDown && dragStartXAndTime !== null) {
      const [startX, startWindow] = dragStartXAndTime
      let dt = x2v(startX) - x2v(x)
      let newWindow = [startWindow[0] + dt, startWindow[1] + dt]
      if (newWindow[0] < fullTimeBounds[0] && newWindow[1] > fullTimeBounds[1]) {
        newWindow = fullTimeBounds
      } else if (newWindow[0] < fullTimeBounds[0]) {
        dt = fullTimeBounds[0] - newWindow[0]
        newWindow = [newWindow[0] + dt, newWindow[1] + dt]
      } else if (newWindow[1] > fullTimeBounds[1]) {
        dt = fullTimeBounds[1] - newWindow[1]
        newWindow = [newWindow[0] + dt, newWindow[1] + dt]
      }
      if (newWindow[1] === fullTimeBounds[1]) {
        setWindow([newWindow[0] - newWindow[1]])
      } else {
        setWindow(newWindow)
      }
    }
    if (!mouseDown && dragStartXAndTime !== null) {
      setDragStartXAndTime(null)
    }
  }

  const handleMouseOut = e => {
    const rect = svgRef.current?.getBoundingClientRect()
    enablePageScroll()
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      setMousePosX(null)
    }
  }

  const downloadSVG = () => {
    const svg = svgRef.current
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], {type: 'image/svg+xml'})
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'graph.svg'
    link.click()
  }

  const jumpToPresent = () => setWindow([window[0] - window[1]])

  React.useEffect(() => {
    document.body.addEventListener('mouseup', () => setMouseDown(false))
  }, [])

  return (
    <Panel title="Graphs" className='panel graphs' onWheel={wheelHandler}>
      <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" width={w} height={h} style={{ userSelect: 'none', fontFamily: 'sans-serif' }}
        ref={svgRef}
        onMouseOver={() => disablePageScroll()} onMouseOut={handleMouseOut} onMouseMove={handleMouseMove}
        onMouseDown={() => setMouseDown(true)}
      >
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
        {verticalLabels.map(({x, label}, i) => x >= p2x(0) - 100 && x <= p2x(1) && (
          <g key={i}>
            <line x1={x} y1={p2y(0)} x2={x} y2={p2y(1)} stroke="#333" strokeWidth='1' strokeDasharray='2 4' clipPath='url(#data-clip-path)' />
            <text x={x+5} y={p2y(1)-(i%10)*10} textAnchor="start" alignmentBaseline="text-after-edge" fontSize="12" clipPath='url(#data-clip-path)'>{label}</text>
          </g>
        ))}
        {/* Series (plotting data curves as polylines) */}
        {series.map(([key, color, label]) => (
          <polyline key={key} points={points.map(({ t_minus_time, ...point }) => ` ${v2x(t_minus_time)},${v2y(point[key])}`).join('')}
            fill="none" stroke={color} strokeWidth="1" clipPath='url(#data-clip-path)' />
        ))}
        {/* Key/Legend */}
        {series.map(([key, color, label], i) => (
          <g key={key}>
            <circle r="3.5" fill={color} cx={w-5} cy={14+i*20} />
            <text fontSize="12" x={w-15} textAnchor="end" alignmentBaseline='middle' fill={color} y={15+i*20}>{label}</text>
          </g>
        ))}
        {/* Tooltip */}
        {tooltipText && mousePosX > p2x(0) && (
          <g>
            <line x1={mousePosX} y1={p2y(0)} x2={mousePosX} y2={p2y(1)} stroke="black" strokeWidth='1' clipPath='url(#data-clip-path)' />
            {tooltipText.map((text, i) => (
              <text key={i} x={Math.min(mousePosX+(flipTooltip?-5:5), p2x(1)-70)} y={p2y(0)+20+16*i} textAnchor={flipTooltip?"end":"start"} alignmentBaseline="text-after-edge" fontSize="12" clipPath='url(#data-clip-path)'>{text}</text>
            ))}
          </g>
        )}
      </svg>
      {/* Jump to present button */}
      <button className={'jump-to-present ' + (window.length !== 1 ? 'active' : '')} onClick={jumpToPresent}>&gt;</button>
      {/* Time window selection slider */}
      <Slider
        value={effectiveTimeWindow}
        onChange={sliderChangeHandler}
        valueLabelDisplay='off'
        min={fullTimeBounds[0]}
        max={fullTimeBounds[1]}
        style={{width: w - 40, marginLeft: 50}}
        step={0.01}
        marks={[
          { value: fullTimeBounds[0], label: `${Math.round(fullTimeBounds[1] - fullTimeBounds[0])}s ago` },
          { value: fullTimeBounds[1], label: 'now' },
        ]}
      />
      {/* Y scale range slider (low effort way to zoom in vertically) */}
      <Slider
        value={ySubset}
        onChange={ySliderChangeHandler}
        valueLabelDisplay='off'
        min={0} max={1}
        style={{width: w - 40, marginLeft: 50}}
        step={0.005}
        marks={[
          { value: 0, label: "Bottom" },
          { value: 1, label: "Top" },
        ]}
      />
      <button onClick={downloadSVG}>Download SVG</button>
    </Panel>
  )
}

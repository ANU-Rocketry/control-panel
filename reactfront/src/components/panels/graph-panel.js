import React from 'react'
import { Panel } from '../index'
import { disablePageScroll, enablePageScroll } from 'scroll-lock'
import {
  generateAxisTicks, binarySearch, formatUnit, lerp, clamp,
  intervalUnion, expandInterval, interpolateInterval, boundIntervalKeepingLength,
  undefOnBadRef
} from '../graph-utils'
import SeriesCollection from '../series'
import pins from '../../pins.json'

window.enablePageScroll = enablePageScroll
window.disablePageScroll = disablePageScroll

//finds pin configuration data based on a LabJack pin number
export function pinFromID(labjack_pin, test_stand = null) {
  if (test_stand) {
    // First try to find exact match with test_stand
    const exactMatch = pins.buttons.filter(pin => 
      pin.pin.labjack_pin === labjack_pin && 
      pin.pin.test_stand === test_stand
    )[0];
    if (exactMatch) return exactMatch;
  }
  
  // Fallback to original behavior (first match by labjack_pin only)
  return pins.buttons.filter(pin => pin.pin.labjack_pin === labjack_pin)[0];
}

// We store yBounds persistently to interpolate between ranges smoothly
let pressureYBounds = null
let flowYBounds = null
const minPressureYBounds = [-10, 10]  // psi
const minFlowYBounds = [0, 5]  // gpm

// newData({ time: epoch_secs, series1: value1, ... })
// You can update the data for any combination of series across any combination of dataloggers
export const newData = detail => document.dispatchEvent(new CustomEvent('datalogger-new-data', { detail }))

// newEvent({ time: epoch_secs, label: text })
export const newEvent = detail => document.dispatchEvent(new CustomEvent('datalogger-new-event', { detail }))

export function Datalogger({
  series, unit, label, yBoundsRef, minYBounds
}) {
  const seriesKeys = Array.from(Object.keys(series))

  // We'll store the data in a series of arrays, one for each series
  // These arrays compute decimated min/max values in an amortized fashion
  const store = new SeriesCollection(series)

  // Events are { time, label } objects rendered on the graph as a vertical dashed line with a textual label
  const events = []

  // Because we use a mutable array for state, we need to force React to update the graph when we tell it to
  let forceUpdate = () => {}
  let deferredForceUpdate = () => requestAnimationFrame(forceUpdate)

  document.addEventListener('datalogger-new-data', ({ detail }) => {
    for (let key of seriesKeys) {
      if (key in detail) {
        store.arrays[key].push(detail.time, detail[key])
      }
    }
    deferredForceUpdate()
  })

  document.addEventListener('datalogger-new-event', ({ detail }) => {
    events.push({ ...detail, key: events.length })
    deferredForceUpdate()
  })

  function Component({ currentSeconds }) {
    const svgRef = React.useRef(null)
    forceUpdate = React.useReducer(x => x + 1, 0)[1]

    // Box model
    const w = 600, h = 250; // Smaller height for multiple graphs, no preview needed

    if (!currentSeconds) currentSeconds = new Date().getTime() / 1000
    const startSeconds = store.minTime()

    const [window, _setWindow] = React.useState([-3])
    const setWindow = w => {
      if (w.length === 1 || w[1] >= currentSeconds) {  // sliding rep
        const tMinusTime = w.length === 1 ? w[0] : w[0] - currentSeconds
        const minTMinusTime = Math.min(-10, startSeconds - currentSeconds)
        _setWindow([clamp(tMinusTime, minTMinusTime, 0)])
      } else {  // fixed rep
        w = [Math.min(...w), Math.max(...w)]
        _setWindow([
          clamp(w[0], startSeconds, w[1] - 0.01),
          clamp(w[1], w[0], currentSeconds)
        ])
      }
    }

    const effectiveTimeWindow = window.length === 1
      ? [currentSeconds + window[0], currentSeconds]
      : window
    const relativeTimeWindow = [effectiveTimeWindow[0] - currentSeconds, effectiveTimeWindow[1] - currentSeconds]

    const points = store.sample(effectiveTimeWindow, w)

    // Use the passed yBounds reference
    yBoundsRef.current = interpolateInterval(yBoundsRef.current, intervalUnion([points.min, points.max], minYBounds), 0.1)
    const effectiveYBounds = expandInterval(yBoundsRef.current, 0.2)

    const fullTimeBounds = [startSeconds, currentSeconds]

    // Box model
    const margin = { l: 1, r: 1, t: 1, b: 1 }
    const p2x = p => margin.l + p * (w - margin.l - margin.r)
    const p2y = p => margin.t + p * (h - margin.t - margin.b)
    const x2p = x => (x - margin.l) / (w - margin.l - margin.r)
    const v2x = v => p2x((v - relativeTimeWindow[0]) / (relativeTimeWindow[1] - relativeTimeWindow[0]))
    const v2y = v => p2y(1 - (v - effectiveYBounds[0]) / (effectiveYBounds[1] - effectiveYBounds[0]))
    const x2v = x => relativeTimeWindow[0] + x2p(x) * (relativeTimeWindow[1] - relativeTimeWindow[0])

    // Horizontal axis ticks
    const xTicks = generateAxisTicks(...relativeTimeWindow, 4, 's')
    const yTicks = generateAxisTicks(...effectiveYBounds, 4, unit)

    // Hover tooltip
    const [mousePosX, setMousePosX] = React.useState(null)
    const tooltipIndices = seriesKeys.map(key => {
      if (!points[key] || !points[key].length) return null
      const t = currentSeconds + x2v(mousePosX)
      const i = binarySearch(i => points[key].fromPointIndex(i)[0], t, points[key].totalLength - 1)
      if (i === -1) return null
      const [seg, point] = points[key].splitPointIndex(i)
      if (point >= points[key][seg].length - 1 || seg < 0 || point < 0) return null
      return [seg, point]
    })
    
    const tooltipText = tooltipIndices.map((valIndex, seriesIndex) => {
      if (valIndex === null) return ''
      const [seg, point] = valIndex
      const data = points[seriesKeys[seriesIndex]]
      const val = lerp(data[seg][point][0], data[seg][point][1], data[seg][point+1][0], data[seg][point+1][1], currentSeconds + x2v(mousePosX))
      return `${seriesKeys[seriesIndex]}: ${formatUnit(val, unit)}`
    }).filter(text => text.length)
    const flipTooltip = mousePosX > p2x(1) - 200

    const [mouseDown, setMouseDown] = React.useState(false)
    const [dragStartXAndTime, setDragStartXAndTime] = React.useState(null)

    const wheelHandler = e => {
      const d = e.deltaX + e.deltaY
      const mid =
        window.length === 1 ? effectiveTimeWindow[1]
        : mousePosX ? currentSeconds + x2v(mousePosX)
        : (effectiveTimeWindow[0] + effectiveTimeWindow[1]) / 2
      const left = Math.max(mid + (effectiveTimeWindow[0] - mid) * Math.pow(1.001, d), Math.min(fullTimeBounds[0] + 0.01, currentSeconds-10))
      const right = Math.min(mid + (effectiveTimeWindow[1] - mid) * Math.pow(1.001, d), fullTimeBounds[1])
      setWindow([Math.min(left, right - 0.01), right])
    }

    const getXFromEvent = e => {
        return e.clientX - undefOnBadRef(() => svgRef.current.getBoundingClientRect().left)
    }

    const handleMouseDown = e => {
      setMouseDown(true)
      setDragStartXAndTime([getXFromEvent(e), effectiveTimeWindow])
    }

    const handleMouseMove = e => {
      const x = getXFromEvent(e)
      setMousePosX(x)
      if (mouseDown) {
        const [startX, startWindow] = dragStartXAndTime
        let dt = x2v(startX) - x2v(x)
        let newWindow = [startWindow[0] + dt, startWindow[1] + dt]
        newWindow = boundIntervalKeepingLength(newWindow, intervalUnion(fullTimeBounds, [currentSeconds-10, currentSeconds]))
        setWindow(newWindow)
      }
    }

    const handleMouseOut = e => {
      const rect = svgRef.current.getBoundingClientRect()
      enablePageScroll()
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        setMousePosX(null)
      }
    }

    const verticalLabels = events
      .map(({ time, ...e }) => ({ x: v2x(time - currentSeconds), ...e }))
      .filter(({ x }) => x >= p2x(0) - 10 && x <= p2x(1))
    const showVerticalLabelText = effectiveTimeWindow[1] - effectiveTimeWindow[0] < 15

    const downloadSVG = () => {
      const svg = svgRef.current
      const svgData = new XMLSerializer().serializeToString(svg)
      const blob = new Blob([svgData], {type: 'image/svg+xml'})
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${label.replace(/\s+/g, '_').toLowerCase()}_graph.svg`
      link.click()
    }

    return (
      <div style={{ marginBottom: '10px' }}>
        <h4 style={{ margin: '5px 0', fontSize: '14px' }}>{label}</h4>
        <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" width={w} height={h}
          style={{ userSelect: 'none', fontFamily: 'sans-serif', display: 'block' }}
          ref={svgRef}
          onMouseOver={() => disablePageScroll()} onMouseOut={handleMouseOut}
          onMouseDown={handleMouseDown} onWheel={wheelHandler} onMouseMove={handleMouseMove}
        >
          {/* Horizontal axis gridlines */}
          {xTicks.map(({ tick, label }) => (
            <line key={tick} x1={v2x(tick)} y1={p2y(1)} x2={v2x(tick)} y2={p2y(0)} stroke="#ddd" />
          ))}
          <line x1={0} y1={p2y(1)} x2={w} y2={p2y(1)} stroke="#888" strokeWidth='2' />
          {/* Vertical axis gridlines */}
          {yTicks.map(({ tick, label }) => (
            <line key={tick} x1={p2x(0)} y1={v2y(tick)} x2={p2x(1)} y2={v2y(tick)} stroke="#ddd" />
          ))}
          <line x1={p2x(0)} y1={0} x2={p2x(0)} y2={h} stroke="#888" strokeWidth='2' />
          {/* Vertical labels (valve toggle indicators) */}
          {verticalLabels.map(({x, label, key}, i) => (
            <g key={key}>
              <line x1={x} y1={p2y(0)} x2={x} y2={p2y(1)} stroke="#333" strokeWidth='1' strokeDasharray='2 4' />
              {showVerticalLabelText &&
                <text x={x+5} y={p2y(1)-(i%10)*12-20} textAnchor="start" alignmentBaseline="text-after-edge" fontSize="12">{label}</text>
              }
            </g>
          ))}
          {/* Series (plotting data curves as polylines) */}
          {seriesKeys.map(key => (
            <g key={key}>
              {points[key] && points[key].map((segment, i) => segment.length && segment.decimated && (
                <polygon key={i} points={segment.getMinMaxPoints(v2x, v2y, currentSeconds)}
                  fill={series[key].color} opacity='0.5' stroke="none" strokeWidth="0" />
              ))}
              {points[key] && points[key].map((segment, i) => segment.length && (
                <polyline key={i} points={segment.getPoints(v2x, v2y, currentSeconds)}
                  fill="none" stroke={series[key].color} strokeWidth="2" />
              ))}
            </g>
          ))}
          {/* Horizontal axis tick labels */}
          {xTicks.map(({ tick, label }) => v2x(tick) - p2x(0) > 40 && (
            <text key={tick} x={v2x(tick)} y={p2y(1)-2} textAnchor="middle" alignmentBaseline="after-edge" fontSize="12">{label}</text>
          ))}
          {/* Vertical axis tick labels */}
          {yTicks.map(({ tick, label }) => p2y(1) - v2y(tick) > 20 && (
            <text key={tick} x={p2x(0)+2} y={v2y(tick)} textAnchor="start" alignmentBaseline="after-edge" fontSize="12">{label}</text>
          ))}
          {/* Tooltip */}
          {tooltipText.length && mousePosX > p2x(0) && (
            <g>
              <line x1={mousePosX} y1={p2y(0)} x2={mousePosX} y2={p2y(1)} stroke="black" strokeWidth='1' />
              {tooltipText.map((text, i) => (
                <text key={i} x={Math.max(50, Math.min(mousePosX+(flipTooltip?-5:5), p2x(1)-100))} y={p2y(0)+18+20*i} textAnchor={flipTooltip?"end":"start"}
                  alignmentBaseline="text-after-edge" fontSize="12">{text}</text>
              ))}
            </g>
          )}
          {/* Key/Legend */}
          {seriesKeys.map((key, i) => (
            <g key={key} onClick={e => store.toggleSeries(key)} cursor='pointer'>
              <rect x={w-100} y={i*20} width="100" height="20" fill="transparent" />
              <circle r="4" fill={store.arrays[key].enabled ? series[key].color : 'lightgrey'} cx={w-10} cy={12+i*20} />
              <text fontSize="12" x={w-20} textAnchor="end" alignmentBaseline='middle' fill={store.arrays[key].enabled ? series[key].color : 'lightgrey'} y={13+i*20}>{key}</text>
            </g>
          ))}
        </svg>
        <button onClick={downloadSVG}>Download SVG</button>

      </div>
    )
  }

  return Component
}

// Create separate dataloggers for pressure and flow
const PressureDatalogger = Datalogger({
  unit: 'psi',
  label: 'Pressure Sensors',
  yBoundsRef: { current: pressureYBounds },
  minYBounds: minPressureYBounds,
  series: {
    'LOX Tank': { color: '#000' },
    'LOX N2': { color: '#f00' },
    'ETH Tank': { color: '#3d6' },
    'ETH N2': { color: '#09f' },
  },
})

const FlowDatalogger = Datalogger({
  unit: 'GPM',
  label: 'Flow Sensors',
  yBoundsRef: { current: flowYBounds },
  minYBounds: minFlowYBounds,
  series: {
    'LOX Flow': { color: '#ff6600' }, // Orange for flow
  },
})

export default function GraphPanel({ state }) {
  return (
    <Panel title="Graphs" className='panel graphs'>
      <PressureDatalogger currentSeconds={undefOnBadRef(() => state.data.time)} />
      <FlowDatalogger currentSeconds={undefOnBadRef(() => state.data.time)} />
    </Panel>
  )
}
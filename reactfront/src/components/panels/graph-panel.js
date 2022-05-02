import React from 'react'
import { Panel } from '../index'
import { Slider } from '@material-ui/core'
import { disablePageScroll, enablePageScroll } from 'scroll-lock'
import {
  minMax, reduceResolution, generateAxisTicks, binarySearch, formatUnit,
  zip, intervalUnion, expandInterval, shrinkInterval, interpolateInterval,
  lerp,
} from '../graph-utils'
import DecimatedMinMaxSeries from '../series'
import pins from '../../pins.json'

window.enablePageScroll = enablePageScroll
window.disablePageScroll = disablePageScroll


export function pinFromID(labjack_pin) {
  return pins.buttons.filter(pin => pin.pin.labjack_pin === labjack_pin)[0]
}

// We store yBounds persistently to interpolate between ranges smoothly
let yBounds = null
const minYBounds = [-10, 10]  // psi


// newData({ time: epoch_secs, series1: value1, ... })
// You can update the data for any combination of series across any combination of dataloggers
export const newData = detail => document.dispatchEvent(new CustomEvent('datalogger-new-data', { detail }))

// newEvent({ time: epoch_secs, label: text })
export const newEvent = detail => document.dispatchEvent(new CustomEvent('datalogger-new-event', { detail }))

export function Datalogger({
  series, unit, label
}) {
  const seriesKeys = Array.from(Object.keys(series))

  // We'll store the data in a series of arrays, one for each series
  // These arrays compute decimated min/max values in an amortized fashion
  const seriesArrays = seriesKeys.reduce((acc, key) => {
    acc[key] = new DecimatedMinMaxSeries()
    return acc
  }, {})

  // Events are { time, label } objects rendered on the graph as a vertical dashed line with a textual label
  const events = []

  // Because we use a mutable array for state, we need to force React to update the graph when we tell it to
  let forceUpdate = () => {}

  document.addEventListener('datalogger-new-data', ({ detail }) => {
    for (let key of seriesKeys) {
      if (key in detail) {
        seriesArrays[key].push(detail.time, detail[key])
      }
    }
    forceUpdate()
  })

  document.addEventListener('datalogger-new-event', ({ detail }) => {
    events.push({ ...detail, key: events.length })
    forceUpdate()
  })
  
  function Component({ currentSeconds }) {
    const svgRef = React.useRef(null)
    forceUpdate = React.useReducer(x => x + 1, 0)[1]

    // Window of points to display
    // Fixed representation: [start_epoch_seconds, end_epoch_seconds] (stays focused on a fixed time window)
    // Sliding representation: [t_minus_seconds] (stays focused on the current time, up to a fixed number of seconds before)
    const [window, setWindow] = React.useState([-3]);
    // Window of point indices to display, with at least one on either side
    // We avoid new Date().getTime() when possible because we want the epoch times to come from the same source as the data point times
    // This is so we can use system epoch times from systems without an accurate clock (e.g. a Raspberry Pi which was turned on without an
    // internet connection. They have no real-time clock that runs when the Pi isn't powered keeping the clock in sync with world time.)
    if (!currentSeconds) currentSeconds = new Date().getTime() / 1000
    const effectiveTimeWindow = window.length === 1
      ? [currentSeconds + window[0], currentSeconds]
      : window
    const relativeTimeWindow = [effectiveTimeWindow[0] - currentSeconds, effectiveTimeWindow[1] - currentSeconds]

    let newYBounds = null
    const points = seriesKeys.reduce((acc, key) => {
      acc[key] = seriesArrays[key].sample(...effectiveTimeWindow)
      newYBounds = intervalUnion(newYBounds, [Math.min(...acc[key].map(x => x[2])), Math.max(...acc[key].map(x => x[3]))])
      return acc
    }, {})

    // interpolate the bounds over time
    newYBounds = intervalUnion(newYBounds, minYBounds)
    yBounds = interpolateInterval(yBounds, newYBounds, 0.1)

    // Percentage start/end of the y bounds we see (for primitive vertical zoom functionality)
    const [ySubset, setYSubset] = React.useState([0, 1])
    const ySliderChangeHandler = (_event, newYSubset) => {
      setYSubset([Math.min(...newYSubset), Math.max(...newYSubset)])
    }
    const effectiveYBounds = expandInterval(shrinkInterval(yBounds, ySubset), 0.2)

    const startSeconds = seriesKeys.reduce((acc, key) => {
      const t = seriesArrays[key].array?.[0]
      if (t) acc = Math.min(acc, t)
      return acc
    }, currentSeconds)
    const fullTimeBounds = [startSeconds, currentSeconds]

    // Box model
    const w = 600, h = 450;
    const margin = { l: 90, r: 16, t: 10, b: 35 }   // margin around the graph (between SVG bounding box and axes)
    // Conversion from decimal in [0,1] range to pixel
    const p2x = p => margin.l + p * (w - margin.l - margin.r)
    const p2y = p => margin.t + p * (h - margin.t - margin.b)
    const x2p = x => (x - margin.l) / (w - margin.l - margin.r) // inverse
    // Conversion from t-minus time in seconds / value in unit to pixel
    const v2x = v => p2x((v - relativeTimeWindow[0]) / (relativeTimeWindow[1] - relativeTimeWindow[0]))
    const v2y = v => p2y(1 - (v - effectiveYBounds[0]) / (effectiveYBounds[1] - effectiveYBounds[0]))
    const x2v = x => relativeTimeWindow[0] + x2p(x) * (relativeTimeWindow[1] - relativeTimeWindow[0]) // inverse

    // Horizontal axis ticks
    const xTicks = generateAxisTicks(...relativeTimeWindow, 4, 's')
    const yTicks = generateAxisTicks(effectiveYBounds[0], effectiveYBounds[1], 10, 'psi')

    // TODO: re-add hover tooltip (this is at odds with being able to add new data to series independently. we should make it interpolate values for each series and be careful of nan gaps)
    // Hover tooltip
    // Mouse X position relative to the <svg>
    const [mousePosX, setMousePosX] = React.useState(null)
    // Index of the closest point left of the mouse, for each series (-1 if it's NaN or outside the window)
    const tooltipIndices = seriesKeys.map(key => {
      if (!points[key].length) return -1
      const t = currentSeconds + x2v(mousePosX)
      const i = binarySearch(i => points[key][i][0], t, points[key].length - 1)
      if (i === -1) return -1
      if (isNaN(points[key][i][1]) || i >= points[key].length - 1 || isNaN(points[key][i+1][1])) return -1
      return i
    })
    // Hover tooltip text
    const tooltipText = tooltipIndices.map((valIndex, seriesIndex) => {
      if (valIndex === -1) return ''
      const data = points[seriesKeys[seriesIndex]]
      const val = lerp(data[valIndex][0], data[valIndex][1], data[valIndex+1][0], data[valIndex+1][1], currentSeconds + x2v(mousePosX))
      return `${seriesKeys[seriesIndex]}: ${formatUnit(val, unit)}`
    }).filter(text => text.length)
    const flipTooltip = mousePosX > p2x(1) - 160

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

    const verticalLabels = events
      .map(({ time, ...e }) => ({ x: v2x(time - currentSeconds), ...e }))
      .filter(({ x }) => x >= p2x(0) - 100 && x <= p2x(1))

    const jumpToPresent = () => setWindow([window[0] - window[1]])

    React.useEffect(() => {
      document.body.addEventListener('mouseup', () => setMouseDown(false))
    }, [])

    return (
      <div>
        <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" width={w} height={h} style={{ userSelect: 'none', fontFamily: 'sans-serif' }}
          ref={svgRef}
          onMouseOver={() => disablePageScroll()} onMouseOut={handleMouseOut} onMouseMove={handleMouseMove}
          onMouseDown={() => setMouseDown(true)} onWheel={wheelHandler}
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
          <text y={20} x={-p2y(0.5)} textAnchor="middle" fontSize="12" fontWeight="bold" transform="rotate(-90)" dy="-0.5em">{label} ({unit})</text>
          {yTicks.map(({ tick, label }) => (
            <React.Fragment key={tick}>
              <line x1={p2x(0)} y1={v2y(tick)} x2={p2x(0)-5} y2={v2y(tick)} stroke="black" />
              <text x={p2x(0)-7} y={v2y(tick)} textAnchor="end" alignmentBaseline="middle" fontSize="12">{label}</text>
            </React.Fragment>
          ))}
          {/* Vertical labels (valve toggle indicators) */}
          {verticalLabels.map(({x, label, key}, i) => (
            <g key={key}>
              <line x1={x} y1={p2y(0)} x2={x} y2={p2y(1)} stroke="#333" strokeWidth='1' strokeDasharray='2 4' clipPath='url(#data-clip-path)' />
              <text x={x+5} y={p2y(1)-(i%10)*10} textAnchor="start" alignmentBaseline="text-after-edge" fontSize="12" clipPath='url(#data-clip-path)'>{label}</text>
            </g>
          ))}
          {/* Series (plotting data curves as polylines) */}
          {seriesKeys.map(key => (
            <polyline key={key} points={points[key].map(([ time, value ]) => ` ${v2x(time - currentSeconds)},${v2y(value)}`).join('')}
              fill="none" stroke={series[key].color} strokeWidth="1" clipPath='url(#data-clip-path)' />
          ))}
          {/* Key/Legend */}
          {seriesKeys.map((key, i) => (
            <g key={key}>
              <circle r="3.5" fill={series[key].color} cx={w-5} cy={14+i*20} />
              <text fontSize="12" x={w-15} textAnchor="end" alignmentBaseline='middle' fill={series[key].color} y={15+i*20}>{key}</text>
            </g>
          ))}
          {/* Tooltip */}
          {tooltipText.length && mousePosX > p2x(0) && (
            <g>
              <line x1={mousePosX} y1={p2y(0)} x2={mousePosX} y2={p2y(1)} stroke="black" strokeWidth='1' clipPath='url(#data-clip-path)' />
              {tooltipText.map((text, i) => (
                <text key={i} x={Math.min(mousePosX+(flipTooltip?-5:5), p2x(1)-70)} y={p2y(0)+20+16*i} textAnchor={flipTooltip?"end":"start"}
                  alignmentBaseline="text-after-edge" fontSize="12" clipPath='url(#data-clip-path)'>{text}</text>
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
          min={Math.min(fullTimeBounds[0], fullTimeBounds[1] - 1)}
          max={fullTimeBounds[1]}
          style={{width: w - 40, marginLeft: 50}}
          step={0.01}
          marks={[
            { value: Math.min(fullTimeBounds[0], fullTimeBounds[1] - 1), label: `${Math.round(fullTimeBounds[1] - fullTimeBounds[0])}s ago` },
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
      </div>
    )
  }

  return Component
}

const PressureDatalogger = Datalogger({
  unit: 'psi',
  label: 'Pressure',
  series: {
    'LOX Tank': { color: '#000' },
    'LOX N2': { color: '#f00' },
    'ETH Tank': { color: '#3d6' },
    'ETH N2': { color: '#09f' },
  },
})

export default function GraphPanel({ state }) {
  // Instead of using a cumbersome charting library, we use JSX with SVG to declaratively
  // and efficiently construct highly customisable graphs
  return (
    <Panel title="Graphs" className='panel graphs'>
      <PressureDatalogger currentSeconds={parseInt(state.data?.time) / 1000} />
    </Panel>
  )
}

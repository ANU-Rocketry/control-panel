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
    const w = 600, h = 450;

    // We avoid new Date().getTime() when possible because we want the epoch times to come from the same source as the data point times
    // This is so we can use system epoch times from systems without an accurate clock (e.g. a Raspberry Pi which was turned on without an
    // internet connection. They have no real-time clock that runs when the Pi isn't powered keeping the clock in sync with world time.)
    if (!currentSeconds) currentSeconds = new Date().getTime() / 1000
    const startSeconds = store.minTime()

    // Window of points to display
    // Fixed representation: [start_epoch_seconds, end_epoch_seconds] (stays focused on a fixed time window)
    // Sliding representation: [t_minus_seconds] (stays focused on the current time, up to a fixed number of seconds before)
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

    // Window in a fixed representation relative to the current time
    const effectiveTimeWindow = window.length === 1
      ? [currentSeconds + window[0], currentSeconds]
      : window
    // Window of 2 t-minus times
    const relativeTimeWindow = [effectiveTimeWindow[0] - currentSeconds, effectiveTimeWindow[1] - currentSeconds]

    const points = store.sample(effectiveTimeWindow, w)
    const preview = store.samplePreview(w)

    // interpolate the bounds over time
    yBounds = interpolateInterval(yBounds, intervalUnion([points.min, points.max], minYBounds), 0.1)
    const effectiveYBounds = expandInterval(yBounds, 0.2)

    const fullTimeBounds = [startSeconds, currentSeconds]

    // Box model
    const margin = { l: 1, r: 1, t: 1, b: 1 }   // margin around the graph (between SVG bounding box and axes)
    // Conversion from decimal in [0,1] range to pixel
    const p2x = p => margin.l + p * (w - margin.l - margin.r)
    const p2y = p => margin.t + p * (h - 50 - margin.t - margin.b)
    const x2p = x => (x - margin.l) / (w - margin.l - margin.r) // inverse
    // Conversion from t-minus time in seconds / value in unit to pixel
    const v2x = v => p2x((v - relativeTimeWindow[0]) / (relativeTimeWindow[1] - relativeTimeWindow[0]))
    const v2y = v => p2y(1 - (v - effectiveYBounds[0]) / (effectiveYBounds[1] - effectiveYBounds[0]))
    const x2v = x => relativeTimeWindow[0] + x2p(x) * (relativeTimeWindow[1] - relativeTimeWindow[0]) // inverse

    const previewMargin = { l: margin.l, r: margin.r, t: 6, b: 12 }
    const p2previewY = p => previewMargin.t + p * (50 - previewMargin.t - previewMargin.b)
    const v2previewY = v => p2previewY(1 - (v - preview.min) / (preview.max - preview.min))
    const v2previewX = v => p2x(1 - v / (Math.min(fullTimeBounds[1] - 10, fullTimeBounds[0]) - fullTimeBounds[1]))
    const previewX2v = x => (1 - x2p(x)) * (Math.min(fullTimeBounds[1] - 10, fullTimeBounds[0]) - fullTimeBounds[1]) // inverse

    // Horizontal axis ticks
    const xTicks = generateAxisTicks(...relativeTimeWindow, 4, 's')
    const yTicks = generateAxisTicks(...effectiveYBounds, 6, 'psi')

    // Hover tooltip
    // Mouse X position relative to the <svg>
    const [mousePosX, setMousePosX] = React.useState(null)
    // Index of the closest point left of the mouse, for each series (-1 if it's NaN or outside the window)
    const tooltipIndices = seriesKeys.map(key => {
      if (!points[key] || !points[key].length) return null
      const t = currentSeconds + x2v(mousePosX)
      // Search through the entire sequence of segments for the closest point before the cursor
      const i = binarySearch(i => points[key].fromPointIndex(i)[0], t, points[key].totalLength - 1)
      if (i === -1) return null
      // Get the segment index and the index of the point in the segment
      const [seg, point] = points[key].splitPointIndex(i)
      // If the point is at the end of the segment, the cursor is between segments
      if (point >= points[key][seg].length - 1 || seg < 0 || point < 0) return null
      return [seg, point]
    })
    // Hover tooltip text
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
      // Annoyingly, using e.preventDefault() or e.stopPropagation() in the wheel or scroll events
      // does not stop the scroll from also happening (tested on Chrome on an M1 Mac)
      // So instead we use the scroll-lock library to disable scrolling when the mouse is over the graph view
      const d = e.deltaX + e.deltaY
      // Scale both edges (zooming around the center, or if we're in a sliding rep we stay in a sliding rep by zooming around the right)
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
      // Show tooltip on hover
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
      .filter(({ x }) => x >= p2x(0) - 10 && x <= p2x(1))
    const showVerticalLabelText = effectiveTimeWindow[1] - effectiveTimeWindow[0] < 15

    const jumpToPresent = () => setWindow([window[0] - window[1]])

    React.useEffect(() => {
      document.body.addEventListener('mouseup', () => {
        setMouseDown(false)
        setDragStartXAndTime(null)
        setPreviewMouseDown(false)
        setPreviewDragStartTime(null)
        setPreviewResizeHandleMouseDown(false)
        setPreviewResizeHandleDragData(null)
      })
    }, [])

    const [previewResizeHandleMouseDown, setPreviewResizeHandleMouseDown] = React.useState(false)
    const [previewResizeHandleDragData, setPreviewResizeHandleDragData] = React.useState(null)
    const [previewMouseDown, setPreviewMouseDown] = React.useState(false)
    const [previewDragStartTime, setPreviewDragStartTime] = React.useState(null)

    const handlePreviewMouseOut = e => {
      enablePageScroll()
    }
    const handlePreviewMouseDown = e => {
      setPreviewMouseDown(true)
      setPreviewDragStartTime([previewX2v(getXFromEvent(e)), effectiveTimeWindow])
    }
    const handlePreviewResizeHandleMouseDown = (e, i) => {
      setPreviewResizeHandleMouseDown(true)
      setPreviewResizeHandleDragData(i)
    }
    const handlePreviewMouseMove = e => {
      const x = getXFromEvent(e)
      if (previewMouseDown) {
        const [dragStartTime, startWindow] = previewDragStartTime
        let dt = previewX2v(x) - dragStartTime
        let newWindow = [startWindow[0] + dt, startWindow[1] + dt]
        setWindow(boundIntervalKeepingLength(newWindow, fullTimeBounds))
      }
      if (previewResizeHandleMouseDown) {
        const i = previewResizeHandleDragData
        let newWindow = [...effectiveTimeWindow]
        newWindow[i] = clamp(currentSeconds + previewX2v(x), Math.min(fullTimeBounds[1] - 10, fullTimeBounds[0]), fullTimeBounds[1])
        if (i === 0) newWindow[0] = Math.min(newWindow[1] - 0.01, newWindow[0])
        else newWindow[1] = Math.max(newWindow[0] + 0.01, newWindow[1])
        setWindow(newWindow)
      }
    }

    return (
      <div onMouseMove={e => previewMouseDown ? handlePreviewMouseMove(e) : handleMouseMove(e)}>
        <svg viewBox={`0 0 ${w} ${h-50}`} xmlns="http://www.w3.org/2000/svg" width={w} height={h-50}
          style={{ userSelect: 'none', fontFamily: 'sans-serif', display: 'block' }}
          ref={svgRef}
          onMouseOver={() => disablePageScroll()} onMouseOut={handleMouseOut}
          onMouseDown={handleMouseDown} onWheel={wheelHandler}
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
              {/* Min/max shading polygons, these should be O(n log n) to partition into triangles and render */}
              {points[key] && points[key].map((segment, i) => segment.length && segment.decimated && (
                <polygon key={i} points={segment.getMinMaxPoints(v2x, v2y, currentSeconds)}
                  fill={series[key].color} opacity='0.5' stroke="none" strokeWidth="0" />
              ))}
              {/* Data points */}
              {points[key] && points[key].map((segment, i) => segment.length && (
                <polyline key={i} points={segment.getPoints(v2x, v2y, currentSeconds)}
                  fill="none" stroke={series[key].color} strokeWidth="1" />
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
        <svg viewBox={`0 0 ${w} ${50}`} xmlns="http://www.w3.org/2000/svg" width={w} height={50}
          style={{ userSelect: 'none', fontFamily: 'sans-serif', display: 'block' }}
          onMouseOut={handlePreviewMouseOut} onMouseMove={handlePreviewMouseMove}
          onMouseDown={handlePreviewMouseDown}
        >
          {/* Selected time window */}
          <rect x={v2previewX(relativeTimeWindow[0])} y={-2}
            width={v2previewX(relativeTimeWindow[1]) - v2previewX(relativeTimeWindow[0])} height={54}
            fill="#eee" stroke="#999" strokeWidth="2" />
          {/* Preview graph */}
          {seriesKeys.map(key => (
            <g key={key}>
              {preview[key] && preview[key].map((segment, i) => segment.length && (
                <polyline key={i} points={segment.getPoints(v2previewX, v2previewY, currentSeconds)}
                  fill="none" stroke={series[key].color} strokeWidth="1" />
              ))}
            </g>
          ))}
          {/* X seconds ago / now labels */}
          <text x='2' y='50' alignmentBaseline='text-after-edge' textAnchor='start' fontSize='12' fill='grey'>
            {Math.max(10, Math.round(fullTimeBounds[1] - fullTimeBounds[0]))}s ago
          </text>
          <text x={w-2} y='50' alignmentBaseline='text-after-edge' textAnchor='end' fontSize='12' fill='grey'>
            now
          </text>
          {/* Preview window resize handles */}
          <rect x={v2previewX(relativeTimeWindow[1])-4}
            y={10} width={8} height={30} fill="#999" stroke="none" strokeWidth="0" rx="4" />
          <rect x={v2previewX(relativeTimeWindow[0])-4}
            y={10} width={8} height={30} fill="#999" stroke="none" strokeWidth="0" rx="4" />
          <rect x={v2previewX(relativeTimeWindow[1])-6} onMouseDown={e => handlePreviewResizeHandleMouseDown(e, 1)}
            y="0" width="16" height="50" fill="transparent" stroke="none" strokeWidth="0" cursor="col-resize" />
          <rect x={v2previewX(relativeTimeWindow[0])-10} onMouseDown={e => handlePreviewResizeHandleMouseDown(e, 0)}
            y="0" width="16" height="50" fill="transparent" stroke="none" strokeWidth="0" cursor="col-resize" />
          {/* Jump to present button */}
          {window.length !== 1 && (
            <g cursor='pointer' onClick={jumpToPresent}>
              <rect x={w-16} y='2' width="15" height="18" fill="#999" stroke="none" strokeWidth="0" rx="4" />
              <polyline points={`${w-11},6 ${w-5},11 ${w-11},16`} fill="none" stroke="#fff" strokeWidth="2" />
            </g>
          )}
        </svg>
        <button onClick={downloadSVG}>Download SVG</button>
      </div>
    )
  }

  return Component
}

const PressureDatalogger = Datalogger({
  unit: 'psi',
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
      <PressureDatalogger currentSeconds={undefOnBadRef(() => state.data.time)} />
    </Panel>
  )
}
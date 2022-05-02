import React from 'react'

/**
 * Datalogger.JS
 * 
 * This library provides a React component for displaying a graph of multiple series of real-time data.
 * It provides an event-based API for adding new data points in real-time (append-only: you cannot remove points).
 * It does min/max shading and decimation, supports multiple series, has touchpad/mousewheel zoom and drag gestures,
 * and (**TODO**) can zoom in and out of a graph with a million points without dropping frames.
**/


// Desired usage:

/*
const PressureDatalogger = React.useState(Datalogger({
  unit: 'psi',
  series: {
    'LOX Tank': { lineColor: '#000' },
    'LOX N2': { lineColor: '#f00' },
    'ETH Tank': { lineColor: '#3d6' },
    'ETH N2': { lineColor: '#09f' },
  },
}))[0]

// ingesting nans introduces gaps in the graph, requires chronological order
PressureDatalogger.ingest([time_seconds, loxtank, loxn2, ethtank, ethn2])
PressureDatalogger.addEvent({ time: ..., label: 'Vent valve closed' })
PressureDatalogger.downloadSVG()
// or (called anywhere):
newData({time, 'LOX Tank': pressure, ...})

const render = () => <PressureDatalogger />
*/

// Implementation:

// newData({ time: epoch_secs, 'LOX Tank': pressure_level, ... })
// You can update the data for any combination of series across any combination of dataloggers
export const newData = detail => document.dispatchEvent(new CustomEvent('datalogger-new-data', { detail }))

// newEvent({ time: epoch_secs, label: text })
export const newEvent = detail => document.dispatchEvent(new CustomEvent('datalogger-new-event', { detail }))

// Binary search the [0, length-1] range of integers for the highest number `x` satisfying the `f(x) <= target`
// If `f(0) > target`, it returns -1
function binarySearch(f, target, length) {
  let left = 0
  let right = length - 1
  let mid
  while (left <= right) {
    mid = Math.floor((left + right) / 2)
    let mapped = f(mid)
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

/*
 * Packed, typed array of floating point (time, value) pairs
 * which computes min/max data at various decimations (4x, 16x, 64x, etc; computation is amortized)
 * and provides a way to get min/max values for a given time window at an appropriate decimation
 * It doesn't matter what units the time is, so long as it's consistent
 */
class DecimatedMinMaxSeries {
  constructor(capacity = 1_048_576) {
    // This is by default a 4MiB array of floats. It's enough to store 20 samples a second for ~24 hours straight
    // For now we don't even think about resizing
    this.capacity = capacity
    this.array = new Float64Array(this.capacity)
    // number of slots used in the array because array.length refers to the maximum capacity
    this.size = 0
  }
  push(time, value) {
    this.array[this.size++] = time
    this.array[this.size++] = value
  }
  pushArray(array) {
    array.set(array, this.size)
    this.size += array.length
  }
  sample(startTime, endTime) {
    const indexWindow = [
      binarySearch(i => this.array[i*2], startTime, this.size >> 1),
      binarySearch(i => this.array[i*2], endTime, this.size >> 1) + 1
    ]
    if (indexWindow[0] < 0 || indexWindow[1] < 0 || indexWindow[1] >= this.size >> 1) {
      return []
    }
    // We don't have decimation or min/max just yet, so we'll just return the raw data
    // In future we'll do [times, min, max] with decimation
    const times = new Float64Array(indexWindow[1] - indexWindow[0])
    const values = new Float64Array(indexWindow[1] - indexWindow[0])
    for (let i = 0; i < times.length; i++) {
      times[i] = this.array[(indexWindow[0] + i) * 2]
      values[i] = this.array[(indexWindow[0] + i) * 2 + 1]
    }
    return [times, values]
  }
}

function zip(a, b) {
  return a.map((v, i) => [v, b[i]])
}

export default function Datalogger({
  series
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

  document.addEventListener('datalogger-new-data', ({ detail }) => {
    for (let key of seriesKeys) {
      if (key in detail) {
        seriesArrays[key].push(detail.time, detail[key])
      }
    }
  })

  document.addEventListener('datalogger-new-event', ({ detail }) => events.push(detail))

  // Because we use a mutable array for state, we need to force React to update the graph when we tell it to
  const forceUpdate = () => {}

  function Component(props) {
    forceUpdate = useReducer(x => x + 1, 0)[1]
    const points = seriesKeys.reduce((acc, key) => {
      const [times, values] = seriesArrays[key].sample(props.startTime, props.endTime)
      acc[key] = [times, values]
      return acc
    }, {})

    return (
      <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" width={w} height={h} style={{ userSelect: 'none', fontFamily: 'sans-serif' }}>
        {/* Series (plotting data curves as polylines) */}
        {seriesKeys.map(key => (
          <polyline key={key} points={zip(...points[key]).map(([ time, value ]) => ` ${v2x(time - currentSeconds)},${v2y(value)}`).join('')}
            fill="none" stroke={series[key].color} strokeWidth="1" clipPath='url(#data-clip-path)' />
          ))}
      </svg>
    )
  }
  Component.addEvent = event => events.push(event)

  return Component
}

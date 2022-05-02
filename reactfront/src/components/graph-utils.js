
export function minMax(arr) {
  let [dmin, dmax] = [Infinity, -Infinity]
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < dmin) dmin = arr[i]
    if (arr[i] > dmax) dmax = arr[i]
  }
  return [dmin, dmax]
}

export function reduceResolution(data) {
  // Reduce the resolution by taking every `decimation` points
  // This decimation factor is chosen to keep the number of points bounded by 300
  // We ensure that the start and end points are included
  const n = data.length
  const decimation = Math.floor(n / 300) + 1
  return data.filter((_, i) => i % decimation === 0 || i === n - 1)
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
export function formatUnit(val, unit) {
  return Math.abs(val) >= 1000 ? `${(val/1000).toFixed(1)} k${unit}`
       : Math.abs(val) >= 1 ? `${val.toFixed(1)} ${unit}`
       : Math.abs(val) >= 0.001 ? `${(val*1000).toFixed(1)} m${unit}`
       : Math.abs(val) >= 0.000001 ? `${(val*1000000).toFixed(1)} μ${unit}`
       : `${val.toFixed(1)} ${unit}`
}

// Generate around a suggested number of nicely rounded decimal axis ticks with units
// Returns a list of { tick: double, label: string } dicts
export function generateAxisTicks(min, max, suggested, unit) {
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

// Binary search the [0, length-1] range of integers for the highest number `x` satisfying the `f(x) <= target`
// If `f(0) > target`, it returns -1
export function binarySearch(f, target, length) {
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

export function zip(a, b) {
  return a.map((v, i) => [v, b[i]])
}

export function intervalUnion(a, b) {
  if (!a) return b
  if (!b) return a
  return [Math.min(a[0], b[0]), Math.max(a[1], b[1])]
}

// shrinkInterval([0, 10], [0.1, 0.8]) will return [1, 8]
export function shrinkInterval([a, b], [sa, sb]) {
  return [a + (b - a) * sa, b - (b - a) * (1 - sb)]
}

// expandInterval([0, 10], 0.2) will return [-2, 12]
export function expandInterval([a, b], fraction) {
  return shrinkInterval([a, b], [-fraction, 1 + fraction])
}

export function interpolateInterval(a, b, fraction) {
  if (!a) return b
  if (!b) return a
  return [a[0] + (b[0] - a[0]) * fraction, a[1] + (b[1] - a[1]) * fraction]
}

export function lerp(x1, y1, x2, y2, x) {
  return y1 + (y2 - y1) * (x - x1) / (x2 - x1)
}

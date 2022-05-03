
import { binarySearch } from './graph-utils'

class DoubleArray {
  constructor(capacity) {
    this.array = new Float64Array(capacity)
    this.size = 0
    this.chunks = 0
  }
  push(...values) {
    try {
    this.array.set(values, this.size)
    this.size += values.length
    this.chunks++
    } catch (e) {
      console.error(this, values)
      console.error(e)
    }
  }
}

class MinMaxArray extends DoubleArray {
  constructor(points) {
    super(points * 4)
  }
  time(i) { return this.array[i*4] }
  mean(i) { return this.array[i*4+1] }
  min(i) { return this.array[i*4+2] }
  max(i) { return this.array[i*4+3] }
  updateDecimation(source) {
    // Apply 4x decimation to the source MinMaxArray
    if (source.chunks % 4 === 0 && source.chunks > 0) {
      const i = source.chunks - 4
      this.push(
        (source.time(i) + source.time(i+1) + source.time(i+2) + source.time(i+3)) / 4,
        (source.mean(i) + source.mean(i+1) + source.mean(i+2) + source.mean(i+3)) / 4,
        Math.min(source.min(i), source.min(i+1), source.min(i+2), source.min(i+3)),
        Math.max(source.max(i), source.max(i+1), source.max(i+2), source.max(i+3))
      )
    }
  }
}

class FullResolutionMinMaxArray extends MinMaxArray {
  constructor(points) {
    // TODO: undo
    super(0)
    this.array = []
  }
  push(...values) {
    // TODO: undo
    this.array.push(...values)
    this.size += values.length
    this.chunks++
  }
  time(i) { return this.array[i*2] }
  mean(i) { return this.array[i*2+1] }
  min(i) { return this.array[i*2+1] }
  max(i) { return this.array[i*2+1] }
}

/*
 * Packed, typed array of floating point (time, value) pairs
 * which computes min/max data at various decimations (4x, 16x, 64x, 256x; computation is amortized)
 * and provides a way to get min/max values for a given time window at an appropriate decimation
 * It doesn't matter what units the time is, so long as it's consistent
 */
export default class DecimatedMinMaxSeries {
  constructor() {
    // We use an (TODO incorrect) 8MiB array of floats for the raw data. This is enough to store 20 samples a second for 48 hours straight (1M points)
    // We don't worry about overflowing this buffer, because we're only ever going to be storing a few hours of data
    // this.arrays[0] is the raw data with stride 2; FullResolutionMinMaxArray provides a min/max view into it
    // this.arrays[1] is a 4x decimated version of this.arrays[0] with stride 4; each chunk is of the form [time1, mean1, min1, max1, ...]
    // this.arrays[n] is a (4^n)x decimated version of this.arrays[n-1] with stride 4
    // TODO: undo
    this.n_bound = 0
    this.arrays = {}
    this.capacity = 1_048_576
    this.arrays[0] = new FullResolutionMinMaxArray(this.capacity)
    for (let n = 1; n <= this.n_bound; n++) {
      this.arrays[n] = new MinMaxArray(this.capacity >> (2*n))
    }
  }
  push(time, value) {
    this.arrays[0].push(time, value)
    for (let n = 1; n <= this.n_bound; n++) {
      this.arrays[n].updateDecimation(this.arrays[n-1])
    }
  }
  sample(startTime, endTime, k = 200) {
    const indexWindow = [
      Math.max(binarySearch(i => this.arrays[0].time(i), startTime, this.arrays[0].chunks), 0),
      Math.min(binarySearch(i => this.arrays[0].time(i), endTime,   this.arrays[0].chunks) + 1, this.arrays[0].chunks)
    ]
    // We want the 4^n times decimated sample to have a length `x` in the interval [k/2, 2k] where `k` might be the pixel width of the graph
    // (unless of course x < k/2 in which case we return as many points as we have)
    // n = max(0, floor(log_4(2x/k)))
    const x = (indexWindow[1] - indexWindow[0])
    const n = Math.min(this.n_bound, Math.max(0, Math.floor(Math.log(2 * x / k + 0.01) / Math.log(4))))
    // const decimatedWindow = [indexWindow[0] >> (2*n-1), indexWindow[1] >> (2*n-1)]
    const decimatedWindow = [0, this.arrays[n].chunks]
    const size = decimatedWindow[1] - decimatedWindow[0]
    const result = new Array(size)

    // TODO: decimation of the last point will be here I guess
    // because the range of the window may not equal x
    // This is equivalent to copying a slice of the array and chunking every 4 elements into subarrays
    for (let i = 0; i < size; i++) {
      result[i] = [
        this.arrays[n].time(decimatedWindow[0] + i),
        this.arrays[n].mean(decimatedWindow[0] + i),
        this.arrays[n].min(decimatedWindow[0] + i),
        this.arrays[n].max(decimatedWindow[0] + i)
      ]
    }
    result.decimated = n > 0
    return result
  }
}

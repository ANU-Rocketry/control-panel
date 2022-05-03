
import { binarySearch } from './graph-utils'

class DoubleArray {
  constructor(capacity) {
    this.capacity = capacity
    this.array = new Float64Array(this.capacity)
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
    // Apply 2x decimation to the source MinMaxArray
    // Every 2 chunks of size 2 (raw data) or 4 (higher res decimated data) in the source array
    // corresponds to one [time, mean, min, max] entry here
    // When a new source chunk starts, we start a new entry in the destination array
    // Each time the source chunk is updated, we update the destination entry
    // When the source chunk finishes, we move on to the next destination entry
    // This way we have in-flight decimated data for the latest data points
    const c = source.chunks
    this.chunks = Math.ceil(c / 2)
    this.size = this.chunks * 4
    let s = this.size
    if (c === 0) return
    switch (c % 2) {
      case 0:
        // Finalising the decimation of the now-finished source chunk
        // Note that we use the final time of the source chunk as the time of the destination chunk
        // instead of an average: this is so that when the window touches t=0, the data is flush with the right
        // and it doesn't look like the data is missing. This is not problematic as long as the number of decimated
        // chunks is close to the number of pixels, so the error is small.
        this.array[s-4] = source.time(c-1)
        this.array[s-3] = (source.mean(c-2) + source.mean(c-1)) / 2
        this.array[s-2] = Math.min(source.min(c-2), source.min(c-1))
        this.array[s-1] = Math.max(source.max(c-2), source.max(c-1))
        break
      case 1:
        // Starting the decimation of the new in-progress source chunk with only one point
        this.array[s-4] = source.time(c-1)
        this.array[s-3] = source.mean(c-1)
        this.array[s-2] = source.min(c-1)
        this.array[s-1] = source.max(c-1)
        break
      default:
        break
    }
  }
}

class FullResolutionMinMaxArray extends DoubleArray {
  constructor(points) {
    super(points * 2)
  }
  time(i) { return this.array[i*2+0] }
  mean(i) { return this.array[i*2+1] }
  min(i)  { return this.array[i*2+1] }
  max(i)  { return this.array[i*2+1] }
}

/*
 * Packed, typed array of floating point (time, value) pairs
 * which computes min/max data at various decimations (2x, 4x, ..., 256x; computation is amortized)
 * and provides a way to get min/max values for a given time window at an appropriate decimation
 * It doesn't matter what the time is, so long as it's a consistent unit / reference time and monotonic
 */
export default class DecimatedMinMaxSeries {
  constructor() {
    // We can store up to 500k points in a series. This is enough to store 20 samples a second for 7 hours straight.
    // 2*2**19 + 4*2**18 + 4*2**17 + ... + 4*2**7 64bit doubles is approx 12MiB of arrays in total for this series
    // We don't worry about overflowing this buffer, because we're only ever going to be storing a few hours of data
    this.n_bound = 12 // 2^12 = 4096x decimation
    this.capacity = 524_288
    // this.arrays[0] stores the raw data
    // this.arrays[n] provides a 2^n times decimated version of this.arrays[0] with mean/min/max data
    this.arrays = {}
    this.arrays[0] = new FullResolutionMinMaxArray(this.capacity)
    for (let n = 1; n <= this.n_bound; n++) {
      this.arrays[n] = new MinMaxArray(this.capacity >> n)
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
      Math.min(binarySearch(i => this.arrays[0].time(i), endTime,   this.arrays[0].chunks) + 2, this.arrays[0].chunks)
    ]
    // We want the 2^n times decimated sample to have a length `x` in the interval [k/2, k] where `k` might be the pixel width of the graph
    // (unless of course x < k/2 in which case we return as many points as we have)
    // n = max(0, floor(log_2(x/k))+1)
    const x = (indexWindow[1] - indexWindow[0])
    const n = Math.min(this.n_bound, Math.max(0, 1 + Math.floor(Math.log(x / k + 0.01) / Math.log(2)))) || 0

    const decimatedWindow = [
      Math.max(binarySearch(i => this.arrays[n].time(i), startTime, this.arrays[n].chunks), 0),
      Math.min(binarySearch(i => this.arrays[n].time(i), endTime,   this.arrays[n].chunks) + 2, this.arrays[n].chunks)
    ]
    const size = decimatedWindow[1] - decimatedWindow[0]
    const result = new Array(size)

    // This is equivalent to copying a slice of the array and chunking every 4 elements into subarrays (if it's not a FullResolutionMinMaxArray)
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

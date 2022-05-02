
import { binarySearch } from './graph-utils'

class DoubleArray {
  constructor(capacity) {
    this.array = new Float64Array(capacity)
    this.size = 0
  }
  push(...values) {
    this.array.set(values, this.size)
    this.size += values.length
  }
}

class MinMaxArray extends DoubleArray {
  time(i) { return this.array[i*4] }
  mean(i) { return this.array[i*4+1] }
  min(i) { return this.array[i*4+2] }
  max(i) { return this.array[i*4+3] }
}

class FullResolutionMinMaxArray extends MinMaxArray {
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
    // This is by default a 4MiB array of floats. It's enough to store 20 samples a second for ~24 hours straight (500k points)
    // For now we don't even bother with resizing
    this.capacity = 1_048_576  // Must be a power of 2 which is at least 1024
    this.array = new Float64Array(this.capacity)
    // Number of slots used in the array because array.length refers to the maximum capacity
    this.size = 0

    // Decimated arrays
    // this.decimated[1] is a 4x decimated version of this.array with stride 4; each chunk is of the form [time1, mean1, min1, max1, ...]
    // this.decimated[n] is a (4^n)x decimated version of this.decimated[n-1] with stride 4
    this.n_bound = 4
    this.decimated = {}
    for (let n = 1; n <= this.n_bound; n++) {
      this.decimated[n] = new Float64Array(this.capacity >> (2*n-1))
    }
  }
  push(time, value) {
    this.array[this.size++] = time
    this.array[this.size++] = value
    // If the number of stride 2 points is a multiple of 4, we compute the next 4x decimation point
    if ((this.size & (2*4-1)) === 0) {
      const s = this.size - 4 // offset in this.array with stride 2 and length 4
      const i = s >> 1 // offset in this.decimated[1] with stride 4 and length 1
      this.decimated[1][i]   =         (this.array[s+0] + this.array[s+2] + this.array[s+4] + this.array[s+6]) / 4
      this.decimated[1][i+1] =         (this.array[s+1] + this.array[s+3] + this.array[s+5] + this.array[s+7]) / 4
      this.decimated[1][i+2] = Math.min(this.array[s+1],  this.array[s+3],  this.array[s+5],  this.array[s+7])
      this.decimated[1][i+3] = Math.max(this.array[s+1],  this.array[s+3],  this.array[s+5],  this.array[s+7])
      // If the number of stride 2 points is a multiple of 4^2, we compute the next 16x decimation point
      if ((this.size & (2*16-1)) === 0) {
        const j = i >> 2 // offset in this.decimated[2] with stride 4 and length 1
        this.decimated[2][j]   =         (this.decimated[1][i+0] + this.decimated[1][i+2] + this.decimated[1][i+4] + this.decimated[1][i+6]) / 4
        this.decimated[2][j+1] =         (this.decimated[1][i+1] + this.decimated[1][i+3] + this.decimated[1][i+5] + this.decimated[1][i+7]) / 4
        this.decimated[2][j+2] = Math.min(this.decimated[1][i+1],  this.decimated[1][i+3],  this.decimated[1][i+5],  this.decimated[1][i+7])
        this.decimated[2][j+3] = Math.max(this.decimated[1][i+1],  this.decimated[1][i+3],  this.decimated[1][i+5],  this.decimated[1][i+7])
        // If the number of stride 2 points is a multiple of 4^3, we compute the next 64x decimation point
        if ((this.size & (2*64-1)) === 0) {
          const k = j >> 2 // offset in this.decimated[3] with stride 4 and length 1
          this.decimated[3][k]   =         (this.decimated[2][j+0] + this.decimated[2][j+2] + this.decimated[2][j+4] + this.decimated[2][j+6]) / 4
          this.decimated[3][k+1] =         (this.decimated[2][j+1] + this.decimated[2][j+3] + this.decimated[2][j+5] + this.decimated[2][j+7]) / 4
          this.decimated[3][k+2] = Math.min(this.decimated[2][j+1],  this.decimated[2][j+3],  this.decimated[2][j+5],  this.decimated[2][j+7])
          this.decimated[3][k+3] = Math.max(this.decimated[2][j+1],  this.decimated[2][j+3],  this.decimated[2][j+5],  this.decimated[2][j+7])
          // If the number of stride 2 points is a multiple of 4^4, we compute the next 256x decimation point
          if ((this.size & (2*256-1)) === 0) {
            const l = k >> 2 // offset in this.decimated[4] with stride 4 and length 1
            this.decimated[4][l]   =         (this.decimated[3][k+0] + this.decimated[3][k+2] + this.decimated[3][k+4] + this.decimated[3][k+6]) / 4
            this.decimated[4][l+1] =         (this.decimated[3][k+1] + this.decimated[3][k+3] + this.decimated[3][k+5] + this.decimated[3][k+7]) / 4
            this.decimated[4][l+2] = Math.min(this.decimated[3][k+1],  this.decimated[3][k+3],  this.decimated[3][k+5],  this.decimated[3][k+7])
            this.decimated[4][l+3] = Math.max(this.decimated[3][k+1],  this.decimated[3][k+3],  this.decimated[3][k+5],  this.decimated[3][k+7])
          }
        }
      }
    }
  }
  sample(startTime, endTime, k = 400) {
    const indexWindow = [
      Math.max(binarySearch(i => this.array[i*2], startTime, this.size >> 1), 0),
      Math.min(binarySearch(i => this.array[i*2], endTime, this.size >> 1) + 2, this.size >> 1)
    ]
    // We want the 4^n times decimated sample to have a length `x` in the interval [k/2, 2k] where `k` might be the pixel width of the graph
    // (unless of course x < k/2 in which case we return as many points as we have)
    // n = max(0, floor(log_4(2x/k)))
    const x = (indexWindow[1] - indexWindow[0])
    const n = Math.max(0, Math.floor(Math.log(2 * x / k + 0.01) / Math.log(4)))

    if (n === 0) {
      // No decimation
      const result = new Array(x)
      for (let i = 0; i < x; i++) {
        const t = this.array[(indexWindow[0]+i)*2+0]
        const v = this.array[(indexWindow[0]+i)*2+1]
        result[i] = [ t, v, v, v ]
      }
      return result
    } else {
      const numPoints = Math.floor(x / 4**n)
      const result = new Array(numPoints)
      // Given an index `i` in the normal array with stride 2, `i/indexDecimationFactor` is the index with stride 4 in the `4^n` decimated array
      const indexDecimationFactor = Math.floor(2 * 4**(n-1))
      const decimatedIndexWindow = [
        Math.floor(indexWindow[0] / indexDecimationFactor),
        Math.ceil(indexWindow[1] / indexDecimationFactor)
      ]
      // TODO: decimation of the last point will be here I guess
      // because the range of the window may not equal numPoints
      // This is equivalent to copying a slice of the array and chunking every 4 elements into subarrays
      for (let i = 0; i < numPoints; i++) {
        result[i] = [
          this.decimated[n][(decimatedIndexWindow[0]+i)*4+0],
          this.decimated[n][(decimatedIndexWindow[0]+i)*4+1],
          this.decimated[n][(decimatedIndexWindow[0]+i)*4+2],
          this.decimated[n][(decimatedIndexWindow[0]+i)*4+3]
        ]
      }
      console.log(this)
      return result
    }
  }
}

const RUN = 32

export class TimSortArray<T> extends Array<T> {
  sort(compareFn: (a: T, b: T) => number = (a, b) => (a > b ? 1 : a < b ? -1 : 0)): this {
    const len = this.length
    for (let i = 0; i < len; i += RUN) {
      this.insertionSort(i, Math.min(i + RUN, len), compareFn)
    }

    const tmp: T[] = []
    for (let size = RUN; size < len; size <<= 1) {
      let right: number
      let mid: number
      for (let left = 0; (mid = left + size) < (right = Math.min(mid + size, len)); left = right) {
        this.merge(left, mid, right, compareFn, tmp)
      }
    }
    return this
  }

  private insertionSort(leftEnd: number, rightEnd: number, compareFn: (a: T, b: T) => number) {
    for (let i = leftEnd + 1; i < rightEnd; i += 1) {
      const value = this[i]

      let low = leftEnd
      let high = i
      while (low < high) {
        const mid = low + ((high - low) >>> 1)
        if (compareFn(this[mid], value) < 0) {
          low = mid + 1
        } else {
          high = mid
        }
      }

      this.copyWithin(low + 1, low, i)
      this[low] = value
    }
  }

  private merge(
    left: number,
    mid: number,
    right: number,
    compareFn: (a: T, b: T) => number,
    tmp: T[]
  ) {
    let i = left
    let j = mid
    let k = 0

    while (i < mid && j < right) {
      if (compareFn(this[i], this[j]) < 0) {
        tmp[k++] = this[i++]
      } else {
        tmp[k++] = this[j++]
      }
    }

    while (i < mid) {
      tmp[k++] = this[i++]
    }
    while (j < right) {
      tmp[k++] = this[j++]
    }

    for (let l = 0; l < k; l += 1) {
      this[left + l] = tmp[l]
    }
  }
}

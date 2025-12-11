export class IntroSortArray<T> extends Array<T> {
  private swap(i: number, j: number) {
    const temp = this[i]
    this[i] = this[j]
    this[j] = temp
  }

  private heapSort(leftEnd: number, rightEnd: number, compareFn: (a: T, b: T) => number) {
    const len = rightEnd - leftEnd
    const half = len >>> 1
    for (let i = half + leftEnd; i >= leftEnd; i -= 1) {
      let cur = i
      let left: number
      while (((left = (cur << 1) + 1), left < rightEnd)) {
        const right = left + 1
        let max = left
        if (right <= rightEnd && compareFn(this[right], this[left]) > 0) {
          max = right
        }
        if (compareFn(this[cur], this[max]) >= 0) {
          break
        }
        this.swap(cur, max)
        cur = max
      }
    }

    for (let i = rightEnd - 1; i > leftEnd; i -= 1) {
      this.swap(leftEnd, i)
      let cur = leftEnd
      let left: number
      while (((left = (cur << 1) + 1), left <= i)) {
        const right = left + 1
        let max = left
        if (right <= i && compareFn(this[right], this[left]) > 0) {
          max = right
        }
        if (compareFn(this[cur], this[max]) >= 0) {
          break
        }
        this.swap(cur, max)
        cur = max
      }
    }
  }

  private quickSort(leftEnd: number, rightEnd: number, compareFn: (a: T, b: T) => number) {
    const pivot = this[leftEnd]
    let low = leftEnd
    let high = rightEnd

    do {
      do {
        low += 1
      } while (low <= rightEnd && compareFn(this[low], pivot) < 0)

      do {
        high -= 1
      } while (high >= leftEnd && compareFn(this[high], pivot) > 0)

      if (low < high) {
        this.swap(low, high)
      }
    } while (low < high)

    this[leftEnd] = this[high]
    this[high] = pivot
    return high
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

      for (let j = i; j > low; j -= 1) {
        this[j] = this[j - 1]
      }
      this[low] = value
    }
  }

  sort(compareFn: (a: T, b: T) => number = (a, b) => (a > b ? 1 : a < b ? -1 : 0)): this {
    const len = this.length
    const stack: [number, number, number][] = [[0, len, ((Math.log2(len) + 1) >>> 0) << 1]]

    while (stack.length > 0) {
      const [leftEnd, rightEnd, depth] = stack.pop()!
      if (rightEnd - leftEnd <= 16) {
        continue
      }
      if (depth === 0) {
        this.heapSort(leftEnd, rightEnd, compareFn)
        continue
      }

      const high = this.quickSort(leftEnd, rightEnd, compareFn)
      stack.push([leftEnd, high - 1, depth - 1])
      stack.push([high + 1, rightEnd, depth - 1])
    }

    this.insertionSort(0, len, compareFn)
    return this
  }
}

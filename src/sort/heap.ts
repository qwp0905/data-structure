export class HeapSortArray<T> extends Array<T> {
  private swap(i: number, j: number) {
    const temp = this[i]
    this[i] = this[j]
    this[j] = temp
  }
  sort(compareFn: (a: T, b: T) => number = (a, b) => (a > b ? 1 : a < b ? -1 : 0)): this {
    const len = this.length
    for (let i = (len >>> 1) - 1; i >= 0; i -= 1) {
      let cur = i
      let left: number
      while (((left = (cur << 1) + 1), left < len)) {
        const right = left + 1
        let max = left
        if (right < len && compareFn(this[right], this[left]) > 0) {
          max = right
        }
        if (compareFn(this[cur], this[max]) >= 0) {
          break
        }
        this.swap(cur, max)
        cur = max
      }
    }

    for (let i = len - 1; i > 0; i -= 1) {
      this.swap(0, i)
      let cur = 0
      let left: number
      while (((left = (cur << 1) + 1), left < i)) {
        const right = left + 1
        let max = left
        if (right < i && compareFn(this[right], this[left]) > 0) {
          max = right
        }
        if (compareFn(this[cur], this[max]) >= 0) {
          break
        }
        this.swap(cur, max)
        cur = max
      }
    }
    return this
  }
}

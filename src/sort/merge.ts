export class MergeSortArray<T> extends Array<T> {
  sort(compareFn: (a: T, b: T) => number = (a, b) => (a > b ? 1 : a < b ? -1 : 0)): this {
    const len = this.length
    const temp: T[] = []
    for (let i = 1; i < len; i <<= 1) {
      let right: number
      let mid: number
      for (let left = 0; (mid = left + i) < (right = Math.min(mid + i, len)); left = right) {
        let j = left
        let k = mid
        let count = 0
        while (j < mid && k < right) {
          if (compareFn(this[j], this[k]) < 0) {
            temp[count++] = this[j++]
          } else {
            temp[count++] = this[k++]
          }
        }
        while (j < mid) {
          temp[count++] = this[j++]
        }
        while (k < right) {
          temp[count++] = this[k++]
        }
        for (let l = 0; l < count; l += 1) {
          this[l + left] = temp[l]
        }
      }
    }
    return this
  }
}

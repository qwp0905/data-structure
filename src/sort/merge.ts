export class MergeSortArray<T> extends Array<T> {
  sort(compareFn: (a: T, b: T) => number = (a, b) => (a > b ? 1 : a < b ? -1 : 0)): this {
    const temp: T[] = []
    for (let i = 1; i < this.length; i <<= 1) {
      for (let left = 0; left + i < this.length; left += i << 1) {
        const right = left + i
        const end = Math.min(right + i, this.length)
        let begin = left
        let count = left
        let center = right

        while (begin < right && center < end) {
          if (compareFn(this[begin], this[center]) < 0) {
            temp[count++] = this[begin++]
          } else {
            temp[count++] = this[center++]
          }
        }

        while (begin < right) {
          temp[count++] = this[begin++]
        }
        while (center < end) {
          temp[count++] = this[center++]
        }

        for (let k = left; k < end; k += 1) {
          this[k] = temp[k]
        }
      }
    }
    return this
  }
}

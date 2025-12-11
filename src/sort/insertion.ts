export class InsertionSortArray<T> extends Array<T> {
  sort(compareFn: (a: T, b: T) => number = (a, b) => (a > b ? 1 : a < b ? -1 : 0)): this {
    const len = this.length
    for (let i = 1; i < len; i += 1) {
      const value = this[i]
      let j: number
      for (j = i - 1; j >= 0 && compareFn(this[j], value) > 0; j -= 1) {
        this[j + 1] = this[j]
      }
      this[j + 1] = value
    }
    return this
  }
}

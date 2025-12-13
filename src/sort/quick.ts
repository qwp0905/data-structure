export class QuickSortArray<T> extends Array<T> {
  sort(compareFn: (a: T, b: T) => number = (a, b) => (a > b ? 1 : a < b ? -1 : 0)): this {
    const len = this.length
    const stack: [number, number][] = [[0, len]]

    while (stack.length > 0) {
      const [leftEnd, rightEnd] = stack.pop()!
      if (rightEnd - leftEnd <= 1) {
        continue
      }

      const pivot = this[leftEnd]
      let low = leftEnd
      let high = rightEnd
      let swap: T

      do {
        do {
          low += 1
        } while (low < rightEnd && compareFn(this[low], pivot) < 0)

        do {
          high -= 1
        } while (high >= leftEnd && compareFn(this[high], pivot) > 0)

        if (low < high) {
          swap = this[low]
          this[low] = this[high]
          this[high] = swap
        }
      } while (low < high)

      this[leftEnd] = this[high]
      this[high] = pivot
      stack.push([leftEnd, high])
      stack.push([high + 1, rightEnd])
    }
    return this
  }
}

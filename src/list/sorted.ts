export abstract class SortedList<T> {
  private readonly list: T[] = []
  protected abstract compare(a: T, b: T): number

  get(index: number) {
    return this.list[index]
  }

  indexOf(value: T) {
    const [index, found] = this.binarySearch(value)
    return found ? index : -1
  }

  includes(value: T) {
    const [, found] = this.binarySearch(value)
    return found
  }

  private binarySearch(value: T): [number, boolean] {
    let low = 0
    let high = this.list.length
    while (low < high) {
      const mid = low + Math.floor((high - low) / 2)
      const cmp = this.compare(value, this.list[mid])
      if (cmp < 0) {
        high = mid
      } else if (cmp > 0) {
        low = mid + 1
      } else {
        return [mid, true]
      }
    }
    return [low, false]
  }

  insert(value: T) {
    const [index] = this.binarySearch(value)
    this.list.splice(index, 0, value)
  }

  remove(value: T) {
    const [index, found] = this.binarySearch(value)
    if (!found) {
      return
    }
    this.list.splice(index, 1)
  }

  get length() {
    return this.list.length
  }

  *values() {
    yield* this.list
  }

  [Symbol.iterator] = this.values
}

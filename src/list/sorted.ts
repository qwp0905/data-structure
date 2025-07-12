export class SortedList<T> {
  private readonly list: T[] = []
  constructor(iterator?: Iterable<T>) {
    if (!iterator) {
      return
    }

    for (const value of iterator) {
      this.insert(value)
    }
  }

  protected compare?(a: T, b: T): number
  private _compare(a: T, b: T): number {
    return this.compare?.(a, b) ?? (a > b ? 1 : a < b ? -1 : 0)
  }

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
      const cmp = this._compare(value, this.list[mid])
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

  insert(value: T): number {
    const [index] = this.binarySearch(value)
    this.list.splice(index, 0, value)
    return index
  }

  insertOrReplace(value: T): number {
    const [index, found] = this.binarySearch(value)
    if (found) {
      this.list[index] = value
    } else {
      this.list.splice(index, 0, value)
    }
    return index
  }

  remove(value: T): number {
    const [index, found] = this.binarySearch(value)
    if (!found) {
      return -1
    }
    this.list.splice(index, 1)
    return index
  }

  get length() {
    return this.list.length
  }

  *values() {
    yield* this.list
  }

  [Symbol.iterator] = this.values
}

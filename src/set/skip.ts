import { SkipList } from "../list/skip"

export class SkipListSet<T> implements Set<T> {
  private readonly inner = new SkipList<T>()

  constructor(iterable?: Iterable<T>) {
    if (!iterable) {
      return
    }
    for (const v of iterable) {
      this.add(v)
    }
  }

  add(value: T): this {
    this.inner.insert({ key: value })
    return this
  }

  has(value: T): boolean {
    return !!this.inner.get(value)
  }

  delete(value: T): boolean {
    return !!this.inner.remove(value)
  }

  clear(): void {
    this.inner.clear()
  }

  get size(): number {
    return this.inner.length
  }

  *entries(): SetIterator<[T, T]> {
    for (const { key } of this.inner.entries()) {
      yield [key, key]
    }
  }

  *keys(): IterableIterator<T> {
    for (const { key } of this.inner.entries()) {
      yield key
    }
  }

  *values(): IterableIterator<T> {
    yield* this.keys()
  }

  [Symbol.iterator] = this.values

  forEach(callback: (value: T, key: T, map: typeof this) => void): void
  forEach<R>(callback: (this: T, value: T, key: T, map: typeof this) => void, thisArg: R): void
  forEach(callback: (value: T, key: T, map: typeof this) => void, thisArg?: any) {
    for (const key of this) {
      callback.call(thisArg, key, key, this)
    }
  }

  [Symbol.toStringTag] = this.constructor.name
}

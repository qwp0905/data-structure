import { BTree, DefaultEntry } from "../tree/b"

export class BTreeSet<T> implements Set<T> {
  private readonly tree = new BTree<T>()

  constructor(iterable?: Iterable<T>) {
    if (!iterable) {
      return
    }
    for (const v of iterable) {
      this.add(v)
    }
  }

  add(v: T) {
    this.tree.insert(new DefaultEntry(v))
    return this
  }

  has(v: T) {
    return this.tree.has(v)
  }

  delete(v: T) {
    return !!this.tree.delete(v)
  }

  clear() {
    this.tree.clear()
  }

  get size() {
    return this.tree.length
  }

  *values(): IterableIterator<T> {
    for (const { key } of this.tree) {
      yield key
    }
  }

  *keys(): IterableIterator<T> {
    yield* this.values()
  }

  *entries(): IterableIterator<[T, T]> {
    for (const key of this) {
      yield [key, key]
    }
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

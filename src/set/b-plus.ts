import { BPlusTree, DefaultEntry } from "../tree/b-plus"

export class BPlusTreeSet<T> implements Set<T> {
  private tree = new BPlusTree<T>()
  constructor(iterable?: Iterable<T>) {
    if (!iterable) {
      return
    }
    for (const k of iterable) {
      this.add(k)
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
    return !!this.tree.remove(v)
  }

  clear() {
    this.tree = new BPlusTree<T, DefaultEntry<T>>()
  }

  get size() {
    return this.tree.length
  }

  *entries(): IterableIterator<[T, T]> {
    for (const entry of this.tree.entries()) {
      yield [entry.key, entry.key]
    }
  }

  *values(): IterableIterator<T> {
    for (const entry of this.tree.entries()) {
      yield entry.key
    }
  }

  *keys(): IterableIterator<T> {
    yield* this.values()
  }

  [Symbol.iterator]() {
    return this.values()
  }

  [Symbol.toStringTag] = this.constructor.name

  forEach(callback: (value: T, key: T, map: typeof this) => void): void
  forEach<R>(callback: (this: R, value: T, key: T, map: typeof this) => void, thisArg: R): void
  forEach(callback: (value: T, key: T, map: typeof this) => void, thisArg?: any) {
    for (const key of this) {
      callback.call(thisArg, key, key, this)
    }
  }
}

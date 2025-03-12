import { BTree, Entry } from "../tree/b"

class MapEntry<K, V> implements Entry<K> {
  constructor(
    readonly key: K,
    readonly value: V
  ) {}
}

export class BTreeMap<K, V> implements Map<K, V> {
  private readonly tree = new BTree<K, MapEntry<K, V>>()

  constructor(iterable?: Iterable<[K, V]>) {
    if (!iterable) {
      return
    }
    for (const [k, v] of iterable) {
      this.set(k, v)
    }
  }

  set(k: K, v: V) {
    this.tree.insert(new MapEntry(k, v))
    return this
  }

  get(k: K) {
    return this.tree.get(k)?.value
  }

  delete(k: K) {
    return !!this.tree.remove(k)
  }

  clear() {
    this.tree.clear()
  }

  has(key: K): boolean {
    return this.tree.has(key)
  }

  get size() {
    return this.tree.length
  }

  *entries(): IterableIterator<[K, V]> {
    for (const { key, value } of this.tree) {
      yield [key, value]
    }
  }

  *keys(): IterableIterator<K> {
    for (const { key } of this.tree) {
      yield key
    }
  }

  *values(): IterableIterator<V> {
    for (const { value } of this.tree) {
      yield value
    }
  }

  [Symbol.toStringTag] = this.constructor.name

  forEach(callback: (value: V, key: K, map: typeof this) => void): void
  forEach<T>(callback: (this: T, value: V, key: K, map: typeof this) => void, thisArg: T): void
  forEach(callback: (value: V, key: K, map: typeof this) => void, thisArg?: any) {
    for (const [key, value] of this) {
      callback.call(thisArg, value, key, this)
    }
  }

  [Symbol.iterator] = this.entries
}

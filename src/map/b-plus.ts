import { BPlusTree, Entry } from "../tree/b-plus"

class MapEntry<K, V> implements Entry<K> {
  constructor(
    readonly key: K,
    readonly value: V
  ) {}
}

export class BPlusTreeMap<K, V> implements Map<K, V> {
  private tree = new BPlusTree<K, MapEntry<K, V>>()
  constructor(iterable?: Iterable<[K, V]>) {
    if (!iterable) {
      return
    }
    for (const [k, v] of iterable) {
      this.set(k, v)
    }
  }

  set(key: K, value: V): this {
    this.tree.insert(new MapEntry(key, value))
    return this
  }

  get(key: K): V | undefined {
    const entry = this.tree.get(key)
    return entry?.value
  }

  has(key: K): boolean {
    return this.tree.has(key)
  }

  delete(key: K): boolean {
    return !!this.tree.remove(key)
  }

  clear() {
    this.tree = new BPlusTree<K, MapEntry<K, V>>()
  }

  get size() {
    return this.tree.length
  }

  *entries(): IterableIterator<[K, V]> {
    for (const entry of this.tree.entries()) {
      yield [entry.key, entry.value]
    }
  }
  [Symbol.iterator] = this.entries;

  *keys(): IterableIterator<K> {
    for (const entry of this.tree.entries()) {
      yield entry.key
    }
  }

  *values(): IterableIterator<V> {
    for (const entry of this.tree.entries()) {
      yield entry.value
    }
  }

  [Symbol.toStringTag] = this.constructor.name

  forEach(callback: (value: V, key: K, map: typeof this) => void): void
  forEach<R>(callback: (this: R, value: V, key: K, map: typeof this) => void, thisArg: R): void
  forEach(callback: (value: V, key: K, map: typeof this) => void, thisArg?: any) {
    for (const [key, value] of this) {
      callback.call(thisArg, value, key, this)
    }
  }
}

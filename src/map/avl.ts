import { AVLTree } from "../tree/avl"

class MapEntry<K, V> {
  constructor(
    readonly key: K,
    readonly value: V
  ) {}
}

export class AVLTreeMap<K, V> implements Map<K, V> {
  private inner = new AVLTree<K, MapEntry<K, V>>()

  constructor(iterable?: Iterable<[K, V]>) {
    if (!iterable) {
      return
    }
    for (const [k, v] of iterable) {
      this.set(k, v)
    }
  }

  set(key: K, value: V): this {
    this.inner.insert(new MapEntry(key, value))
    return this
  }

  get(key: K): V | undefined {
    return this.inner.get(key)?.value
  }

  delete(key: K): boolean {
    return !!this.inner.remove(key)
  }

  clear(): void {
    this.inner = new AVLTree()
  }

  has(key: K): boolean {
    return !!this.inner.get(key)
  }

  get size(): number {
    return this.inner.length
  }

  *entries(): IterableIterator<[K, V]> {
    for (const { key, value } of this.inner.entries()) {
      yield [key, value]
    }
  }

  *keys(): IterableIterator<K> {
    for (const { key } of this.inner.entries()) {
      yield key
    }
  }

  *values(): IterableIterator<V> {
    for (const { value } of this.inner.entries()) {
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

export class InvertedWeakMap<K, V extends WeakKey> implements Map<K, V> {
  private readonly map = new Map<K, WeakRef<V>>()
  private readonly registry = new FinalizationRegistry<K>(this.map.delete.bind(this.map))

  constructor(iterable?: Iterable<[K, V]>) {
    if (!iterable) {
      return
    }
    for (const [k, v] of iterable) {
      this.set(k, v)
    }
  }

  clear() {
    this.map.clear()
  }

  set(key: K, value: V) {
    const prev = this.map.get(key)?.deref()
    if (prev) {
      this.registry.unregister(prev)
    }

    const ref = new WeakRef(value)
    this.map.set(key, ref)
    this.registry.register(value, key, value)
    return this
  }

  get(key: K) {
    const ref = this.map.get(key)
    return ref?.deref()
  }

  has(key: K) {
    return !!this.map.get(key)?.deref()
  }

  delete(key: K) {
    const ref = this.map.get(key)
    if (!ref) {
      return false
    }

    this.map.delete(key)
    const value = ref.deref()
    if (!value) {
      return false
    }

    this.registry.unregister(value)
    return true
  }

  get size() {
    return this.map.size
  }

  *entries(): IterableIterator<[K, V]> {
    for (const [key, ref] of this.map.entries()) {
      const value = ref.deref()
      if (!value) {
        continue
      }
      yield [key, value] as [K, V]
    }
  }

  *keys(): IterableIterator<K> {
    for (const [key] of this) {
      yield key
    }
  }

  *values(): IterableIterator<V> {
    for (const [, value] of this) {
      yield value
    }
  }

  [Symbol.iterator] = this.entries

  forEach(callback: (value: V, key: K, map: typeof this) => void): void
  forEach<T>(callback: (this: T, value: V, key: K, map: typeof this) => void, thisArg: T): void
  forEach(callback: (value: V, key: K, map: typeof this) => void, thisArg?: any) {
    for (const [key, value] of this) {
      callback.call(thisArg, value, key, this)
    }
  }

  [Symbol.toStringTag] = this.constructor.name
}

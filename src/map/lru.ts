import { DoubleLinkedList, DoubleLinkedNode } from "../list/linked"

class CacheEntry<K, V> extends DoubleLinkedNode<V> {
  constructor(
    public key: K,
    value: V
  ) {
    super(value)
  }

  size() {
    return sizeof(this.key) + sizeof(this.value)
  }
}

export class LRUCache<K, V> {
  private readonly oldSub = new DoubleLinkedList<V>()
  private readonly oldMap = new Map<K, CacheEntry<K, V>>()
  private readonly newSub = new DoubleLinkedList<V>()
  private readonly newMap = new Map<K, CacheEntry<K, V>>()
  private allocated = 0

  constructor(private readonly capacity: number) {}

  clear() {
    this.oldMap.clear()
    this.newMap.clear()
    this.oldSub.clear()
    this.newSub.clear()
    this.allocated = 0
  }

  get(key: K): V | undefined {
    const newOne = this.newMap.get(key)
    if (newOne) {
      this.newSub.moveBack(newOne)
      return newOne.value
    }

    const oldOne = this.oldMap.get(key)
    if (!oldOne) {
      return
    }

    this.oldSub.remove(oldOne)
    this.newSub.pushBack(oldOne)
    this.oldMap.delete(key)
    this.newMap.set(key, oldOne)
    this.rebalance()
    return oldOne.value
  }

  insert(key: K, value: V): void {
    const newOne = this.newMap.get(key)
    if (newOne) {
      this.allocated -= newOne.size()
      this.newSub.remove(newOne)
    }

    const oldOne = this.oldMap.get(key)
    if (oldOne) {
      this.allocated -= oldOne.size()
      this.oldSub.remove(oldOne)
    }

    const entry = new CacheEntry(key, value)
    this.allocated += entry.size()
    while (this.allocated > this.capacity && this.oldSub.length > 0) {
      const removed = this.oldSub.popFront()! as CacheEntry<K, V>
      this.oldMap.delete(removed.key)
      this.allocated -= removed.size()
      this.rebalance()
    }
    this.oldMap.set(key, entry)
    this.oldSub.pushBack(entry)
  }

  private rebalance() {
    while (this.newSub.length > this.oldSub.length * 4) {
      const removed = this.newSub.popFront()! as CacheEntry<K, V>
      this.newMap.delete(removed.key)
      this.allocated -= removed.size()
      this.oldSub.pushBack(removed)
    }
  }

  peek(key: K): V | undefined {
    return (this.oldMap.get(key) ?? this.newMap.get(key))?.value
  }

  has(key: K): boolean {
    return this.oldMap.has(key) || this.newMap.has(key)
  }

  remove(key: K): void {
    const newOne = this.newMap.get(key)
    if (newOne) {
      this.allocated -= newOne.size()
      this.newSub.remove(newOne)
      this.newMap.delete(key)
      return
    }

    const oldOne = this.oldMap.get(key)
    if (!oldOne) {
      return
    }

    this.allocated -= oldOne.size()
    this.oldSub.remove(oldOne)
    this.oldMap.delete(key)
    this.rebalance()
  }

  *keys(): IterableIterator<K> {
    yield* this.oldMap.keys()
    yield* this.newMap.keys()
  }

  *values(): IterableIterator<V> {
    yield* this.oldSub
    yield* this.newSub
  }

  *entries(): IterableIterator<[K, V]> {
    for (const [key, entry] of this.oldMap) {
      yield [key, entry.value]
    }
    for (const [key, entry] of this.newMap) {
      yield [key, entry.value]
    }
  }

  forEach(callback: (value: V, key: K, map: typeof this) => void): void
  forEach<T>(callback: (this: T, value: V, key: K, map: typeof this) => void, thisArg: T): void
  forEach(callback: (value: V, key: K, map: typeof this) => void, thisArg?: any) {
    for (const [key, value] of this.entries()) {
      callback.call(thisArg, value, key, this)
    }
  }
}

function sizeof(object: any): number {
  const stack = [object]
  const visited = new WeakSet<object>()
  let bytes = 0

  while (stack.length > 0) {
    const obj = stack.pop()
    if (obj === null) {
      continue
    }

    switch (typeof obj) {
      case "boolean":
        bytes += 4
        break
      case "number":
        bytes += 8
        break
      case "string":
        bytes += 12 + 4 * Math.ceil(obj.length / 4)
        break
      case "bigint":
        bytes += Buffer.from(obj.toString()).byteLength
        break
      case "symbol":
        bytes += (Symbol.keyFor(obj)?.length ?? obj.toString().length - 8) * 2
        break
      case "object":
        if (visited.has(obj)) {
          bytes += 8
          break
        }
        visited.add(obj)
        if (obj instanceof Map) {
          stack.push(Object.fromEntries(obj))
          break
        }
        if (obj instanceof Set) {
          stack.push(Array.from(obj))
          break
        }
        if (ArrayBuffer.isView(obj)) {
          bytes += obj.byteLength
          break
        }
        if (Array.isArray(obj)) {
          stack.push(...obj)
          break
        }
        for (const key of Reflect.ownKeys(obj)) {
          stack.push(key, obj[key])
        }
        break
    }
  }
  return bytes
}

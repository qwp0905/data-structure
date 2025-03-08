import { LinkedList, LinkedNode } from "../list/linked"

class CacheEntry<K> extends LinkedNode<K> {
  constructor(
    key: K,
    public stored: any
  ) {
    super(key)
  }

  size() {
    return sizeof(this.stored) + sizeof(this.value)
  }
}

export class LRUCache<K = string> {
  private readonly oldSubList = new LinkedList<K>()
  private readonly oldMap = new Map<K, CacheEntry<K>>()
  private readonly newSubList = new LinkedList<K>()
  private readonly newMap = new Map<K, CacheEntry<K>>()
  private allocated = 0

  constructor(private readonly capacity: number) {}

  get size(): number {
    return this.newMap.size + this.oldMap.size
  }

  usage() {
    return Number((this.allocated / this.capacity).toFixed(4))
  }

  clear(): void {
    this.oldMap.clear()
    this.newMap.clear()
    this.oldSubList.clear()
    this.newSubList.clear()
    this.allocated = 0
  }

  get<T>(key: K): T | undefined {
    const newOne = this.newMap.get(key)
    if (newOne) {
      this.newSubList.moveFront(newOne)
      return newOne.stored
    }

    const oldOne = this.oldMap.get(key)
    if (!oldOne) {
      return
    }

    this.oldSubList.remove(oldOne)
    this.newSubList.pushFront(oldOne)
    this.oldMap.delete(key)
    this.newMap.set(key, oldOne)
    this.rebalance()
    return oldOne.stored
  }

  insert(key: K, value: any): void {
    const newOne = this.newMap.get(key)
    if (newOne) {
      this.allocated -= newOne.size()
      newOne.stored = value
      this.allocated += newOne.size()
      this.evict()
      this.newSubList.moveFront(newOne)
      return
    }

    const oldOne = this.oldMap.get(key)
    if (oldOne) {
      this.allocated -= oldOne.size()
      this.oldSubList.remove(oldOne)
      this.oldMap.delete(key)
      oldOne.stored = value
      this.allocated += oldOne.size()
      this.evict()
      this.newSubList.pushFront(oldOne)
      this.newMap.set(key, oldOne)
      return
    }

    const entry = new CacheEntry(key, value)
    this.allocated += entry.size()
    this.evict()
    this.oldMap.set(key, entry)
    this.oldSubList.pushFront(entry)
  }

  private evict() {
    while (this.allocated > this.capacity && this.oldSubList.length > 0) {
      const removed = this.oldSubList.popBack()! as CacheEntry<K>
      this.oldMap.delete(removed.value)
      this.allocated -= removed.size()
      this.rebalance()
    }
  }

  private rebalance() {
    while (this.newSubList.length * 3 > this.oldSubList.length * 5) {
      const removed = this.newSubList.popBack()! as CacheEntry<K>
      this.newMap.delete(removed.value)
      this.allocated -= removed.size()
      this.oldSubList.pushFront(removed)
    }
  }

  peek<T>(key: K): T | undefined {
    return (this.oldMap.get(key) ?? this.newMap.get(key))?.stored
  }

  has(key: K): boolean {
    return this.oldMap.has(key) || this.newMap.has(key)
  }

  remove(key: K): void {
    const newOne = this.newMap.get(key)
    if (newOne) {
      this.allocated -= newOne.size()
      this.newSubList.remove(newOne)
      this.newMap.delete(key)
      return
    }

    const oldOne = this.oldMap.get(key)
    if (!oldOne) {
      return
    }

    this.allocated -= oldOne.size()
    this.oldSubList.remove(oldOne)
    this.oldMap.delete(key)
    this.rebalance()
  }

  *keys(): IterableIterator<K> {
    yield* this.oldMap.keys()
    yield* this.newMap.keys()
  }

  *values<T>(): IterableIterator<T> {
    for (const entry of this.oldMap.values()) {
      yield entry.stored
    }
    for (const entry of this.newMap.values()) {
      yield entry.stored
    }
  }

  *entries(): IterableIterator<[K, any]> {
    for (const [key, entry] of this.oldMap.entries()) {
      yield [key, entry.stored]
    }
    for (const [key, entry] of this.newMap.entries()) {
      yield [key, entry.stored]
    }
  }

  [Symbol.iterator] = this.entries

  forEach(callback: (value: any, key: K, map: typeof this) => void): void
  forEach<T>(callback: (this: T, value: any, key: K, map: typeof this) => void, thisArg: T): void
  forEach(callback: (value: any, key: K, map: typeof this) => void, thisArg?: any) {
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

    const type = typeof obj
    if (type === "boolean") {
      bytes += 4
      continue
    }
    if (type === "number") {
      bytes += 8
      continue
    }
    if (type === "string") {
      bytes += 12 + 4 * Math.ceil(obj.length / 4)
      continue
    }
    if (type === "bigint") {
      bytes += Buffer.from(obj.toString()).byteLength
      continue
    }
    if (type === "symbol") {
      bytes += (Symbol.keyFor(obj)?.length ?? obj.toString().length - 8) * 2
      continue
    }
    if (type !== "object") {
      continue
    }
    if (visited.has(obj)) {
      bytes += 8 // pointer size
      continue
    }
    visited.add(obj)
    if (obj instanceof Map) {
      stack.push(Object.fromEntries(obj))
      continue
    }
    if (obj instanceof Set) {
      stack.push(Array.from(obj))
      continue
    }
    if (ArrayBuffer.isView(obj)) {
      bytes += obj.byteLength
      continue
    }
    if (Array.isArray(obj)) {
      stack.push(...obj)
      continue
    }
    for (const key of Reflect.ownKeys(obj)) {
      stack.push(key, obj[key])
    }
  }

  return bytes
}

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
  private readonly map = new Map<K, CacheEntry<K, V>>()
  private readonly list = new DoubleLinkedList<V>()
  private allocated = 0

  constructor(private readonly capacity: number) {}

  get(key: K): V | undefined {
    const entry = this.map.get(key)
    if (!entry) {
      return
    }

    this.list.moveBack(entry)
    return entry.value
  }

  insert(key: K, value: V): void {
    const exists = this.map.get(key)
    if (exists) {
      this.allocated -= exists.size()
      this.list.remove(exists)
    }

    const entry = new CacheEntry(key, value)
    this.allocated += entry.size()

    while (this.allocated > this.capacity && this.list.length > 0) {
      const removed = this.list.popFront()! as CacheEntry<K, V>
      this.map.delete(removed.key)
      this.allocated -= removed.size()
    }
    this.map.set(key, entry)
    this.list.pushBack(entry)
  }

  peek(key: K): V | undefined {
    return this.map.get(key)?.value
  }

  delete(key: K): void {
    const entry = this.map.get(key)
    if (!entry) {
      return
    }

    this.allocated -= entry.size()
    this.map.delete(key)
    this.list.remove(entry)
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

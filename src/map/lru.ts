import { DoubleLinkedList, DoubleLinkedNode } from "../list/linked"

class CacheEntry<K, V> {
  constructor(
    public key: K,
    public value: V
  ) {}
}

export class LRUCache<K, V> {
  private readonly cache = new Map<K, DoubleLinkedNode<CacheEntry<K, V>>>()
  private readonly order = new DoubleLinkedList<CacheEntry<K, V>>()
  private allocated = 0

  constructor(private readonly capacity: number) {}

  get(key: K): V | undefined {
    const node = this.cache.get(key)
    if (!node) {
      return
    }

    this.order.moveBack(node)
    return node.value.value
  }

  set(key: K, value: V): void {
    const exists = this.cache.get(key)
    if (exists) {
      this.allocated -= sizeof(exists)
      exists.value.value = value
      this.allocated += sizeof(exists)
      this.order.moveBack(exists)
      return
    }

    const entry = new CacheEntry(key, value)
    const node = new DoubleLinkedNode(entry)
    this.allocated += sizeof(node)

    while (this.allocated > this.capacity && this.order.length > 0) {
      const removed = this.order.popFront()
      this.cache.delete(removed!.value.key)
      this.allocated -= sizeof(removed!)
    }
    this.cache.set(key, node)
    this.order.pushBack(node)
  }

  delete(key: K): void {
    const node = this.cache.get(key)
    if (!node) {
      return
    }

    this.allocated -= sizeof(node)
    this.cache.delete(key)
    this.order.delete(node)
  }
}

function sizeof<K, V>(node: DoubleLinkedNode<CacheEntry<K, V>>) {
  const calculate = getCalculator(new WeakSet())
  return (
    calculate(node.value) +
    ((node.next && 8) || 0) +
    ((node.prev && 8) || 0) +
    calculate(node.value.key) +
    8
  )
}

function sizeOfObject(seen: WeakSet<object>, object: any) {
  if (object == null) {
    return 0
  }

  let bytes = 0
  for (const key of Reflect.ownKeys(object)) {
    if (typeof object[key] === "object" && object[key] !== null) {
      if (seen.has(object[key])) {
        continue
      }
      seen.add(object[key])
    }

    bytes += getCalculator(seen)(key)
    bytes += getCalculator(seen)(object[key])
  }

  return bytes
}

function getCalculator(seen: WeakSet<object>) {
  return function calc(object: any): number {
    if (Buffer.isBuffer(object)) {
      return object.length
    }

    if (Array.isArray(object)) {
      return object.map(calc).reduce((a, c) => a + c, 0)
    }

    switch (typeof object) {
      case "string":
        return 12 + 4 * Math.ceil(object.length / 4)
      case "boolean":
        return 4
      case "number":
        return 8
      case "symbol": {
        return (Symbol.keyFor(object)?.length ?? object.toString().length - 8) * 2
      }
      case "object":
        return sizeOfObject(seen, object)
      default:
        return 0
    }
  }
}

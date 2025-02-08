class Entry<K, V> {
  constructor(
    public key: K,
    public value: V
  ) {}
}

class Node<K, V> {
  entries: Entry<K, V>[] = []
  children: Node<K, V>[] = []

  private isLeaf() {
    return this.children.length === 0
  }

  *[Symbol.iterator](): IterableIterator<Entry<K, V>> {
    if (this.isLeaf()) {
      yield* this.entries
      return
    }

    for (let i = 0; i < this.entries.length; i++) {
      yield* this.children[i]
      yield this.entries[i]
    }

    yield* this.children.at(-1)!
  }

  private search(k: K): [number, Entry<K, V> | null] {
    let left = 0
    let right = this.entries.length - 1
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const entry = this.entries[mid]
      if (k < entry.key) {
        right = mid - 1
      } else if (k > entry.key) {
        left = mid + 1
      } else {
        return [mid, this.entries[left]]
      }
    }

    return [left, null]
  }

  private split(): [Entry<K, V>, Node<K, V>] {
    const mid = Math.floor(this.entries.length / 2) + 1
    const right = new Node<K, V>()
    right.entries = this.entries.splice(mid)
    right.children = this.children.splice(mid)
    const entry = this.entries.pop()!
    return [entry, right]
  }

  set(k: K, v: V, maxKeys: number): [Entry<K, V>, Node<K, V>] | boolean {
    const [index, entry] = this.search(k)
    if (entry) {
      entry.value = v
      return false
    }

    if (this.isLeaf()) {
      this.entries.splice(index, 0, new Entry(k, v))
      if (this.entries.length < maxKeys) {
        return true
      }

      return this.split()
    }

    const evicted = this.children[index].set(k, v, maxKeys)
    if (typeof evicted === "boolean") {
      return evicted
    }

    const [ee, el] = evicted
    this.entries.splice(index, 0, ee)
    this.children.splice(index + 1, 0, el)
    if (this.entries.length < maxKeys) {
      return true
    }

    return this.split()
  }

  has(k: K): boolean {
    const [index, entry] = this.search(k)
    if (entry) {
      return true
    }
    if (this.isLeaf()) {
      return false
    }

    return this.children[index].has(k)
  }

  get(k: K): V | undefined {
    const [index, entry] = this.search(k)
    if (entry) {
      return entry.value
    }
    if (this.isLeaf()) {
      return
    }

    return this.children[index].get(k)
  }

  private swapPredecessor(entry: Entry<K, V>) {
    let node = this as Node<K, V>
    while (!node.isLeaf()) {
      node = node.children.at(-1)!
    }

    return node.entries.splice(-1, 1, entry)[0]
  }

  delete(k: K, minKeys: number) {
    const [index, found] = this.search(k)
    if (this.isLeaf()) {
      if (!found) {
        return false
      }

      this.entries.splice(index, 1)
      return true
    }

    if (found) {
      this.entries[index] = this.children[index].swapPredecessor(found)
    }

    if (!this.children[index].delete(k, minKeys)) {
      return false
    }

    if (this.children[index].entries.length >= minKeys) {
      return true
    }

    const left = this.children[index - 1]
    if (left?.entries.length > minKeys) {
      const entry = this.entries[index - 1]
      this.children[index].entries.unshift(entry)
      this.entries[index - 1] = left.entries.pop()!
      return true
    }
    const right = this.children[index + 1]
    if (right?.entries.length > minKeys) {
      const entry = this.entries[index]
      this.children[index].entries.push(entry)
      this.entries[index] = right.entries.shift()!
      return true
    }

    const [entry] = this.entries.splice(index, 1)
    const [node] = this.children.splice(index + 1, 1)
    this.children[index].entries.push(entry)
    this.children[index].entries.push(...node.entries)
    this.children[index].children.push(...node.children)
    return true
  }
}

export class BTreeMap<K, V> implements Map<K, V> {
  private root = new Node<K, V>()
  private len = 0

  constructor(private readonly degree: number) {}

  set(k: K, v: V) {
    const evicted = this.root.set(k, v, this.degree)
    if (typeof evicted === "boolean") {
      if (evicted) {
        this.len += 1
      }
      return this
    }

    this.len += 1
    const [entry, right] = evicted
    const newRoot = new Node<K, V>()
    newRoot.entries = [entry]
    newRoot.children = [this.root, right]
    this.root = newRoot
    return this
  }

  get(k: K): V | undefined {
    return this.root.get(k)
  }

  delete(k: K) {
    const minKeys = Math.ceil(this.degree / 2) - 1
    if (!this.root.delete(k, minKeys)) {
      return false
    }
    this.len += 1
    if (this.root.entries.length >= minKeys) {
      return true
    }
    this.root = this.root.children[0]

    return true
  }

  clear() {
    this.len = 0
    this.root = new Node<K, V>()
  }

  has(k: K) {
    return this.root.has(k)
  }

  get size() {
    return this.len
  }

  *entries(): IterableIterator<[K, V]> {
    for (const { key, value } of this.root) {
      yield [key, value]
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

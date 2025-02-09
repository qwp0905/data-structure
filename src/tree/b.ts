interface Entry<T> {
  readonly key: T
}

class DefaultEntry<T> implements Entry<T> {
  constructor(readonly key: T) {}
}

class Node<T, E extends Entry<T>> {
  entries: E[] = []
  children: Node<T, E>[] = []

  isLeaf() {
    return this.children.length === 0
  }

  *[Symbol.iterator](): IterableIterator<E> {
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

  private search(k: T): [number, E | null] {
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

  private split(): [E, Node<T, E>] {
    const mid = Math.floor(this.entries.length / 2) + 1
    const right = new Node<T, E>()
    right.entries = this.entries.splice(mid)
    right.children = this.children.splice(mid)
    const entry = this.entries.pop()!
    return [entry, right]
  }

  insert(entry: E, maxKeys: number): [E, Node<T, E>] | boolean {
    const [index, found] = this.search(entry.key)
    if (found) {
      this.entries[index] = entry
      return false
    }

    if (this.isLeaf()) {
      this.entries.splice(index, 0, entry)
      if (this.entries.length < maxKeys) {
        return true
      }

      return this.split()
    }

    const evicted = this.children[index].insert(entry, maxKeys)
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

  has(k: T): boolean {
    const [index, entry] = this.search(k)
    if (entry) {
      return true
    }
    if (this.isLeaf()) {
      return false
    }

    return this.children[index].has(k)
  }

  get(k: T): E | undefined {
    const [index, entry] = this.search(k)
    if (entry) {
      return entry
    }
    if (this.isLeaf()) {
      return
    }

    return this.children[index].get(k)
  }

  private swapPredecessor(entry: E) {
    let node = this as Node<T, E>
    while (!node.isLeaf()) {
      node = node.children.at(-1)!
    }

    return node.entries.splice(-1, 1, entry)[0]
  }

  delete(k: T, minKeys: number) {
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

    if (left) {
      const entry = this.entries.splice(index - 1, 1)[0]
      const node = this.children.splice(index, 1)[0]
      left.entries.push(entry, ...node.entries)
      left.children.push(...node.children)
      return true
    }

    if (right) {
      const entry = this.entries.splice(index, 1)[0]
      const node = this.children.splice(index, 1)[0]
      right.entries.unshift(...node.entries, entry)
      right.children.unshift(...node.children)
      return true
    }

    this.entries = this.children[0].entries
    this.children = this.children[0].children
    return true
  }
}

const DEFAULT_DEGREE = 5

export class BTree<T, E extends Entry<T> = Entry<T>> {
  private root = new Node<T, E>()
  private len = 0

  constructor(private readonly degree: number = DEFAULT_DEGREE) {}

  insert(entry: E) {
    const evicted = this.root.insert(entry, this.degree)
    if (typeof evicted === "boolean") {
      if (evicted) {
        this.len += 1
      }
      return this
    }

    this.len += 1
    const [en, right] = evicted
    const newRoot = new Node<T, E>()
    newRoot.entries = [en]
    newRoot.children = [this.root, right]
    this.root = newRoot
    return this
  }

  get(k: T): E | undefined {
    return this.root.get(k)
  }

  delete(k: T) {
    const minKeys = Math.ceil(this.degree / 2) - 1
    if (!this.root.delete(k, minKeys)) {
      return false
    }

    this.len -= 1
    if (this.root.entries.length > 0) {
      return true
    }

    if (this.root.isLeaf()) {
      return true
    }

    this.root = this.root.children[0]
    return true
  }

  clear() {
    this.len = 0
    this.root = new Node<T, E>()
  }

  has(k: T) {
    return this.root.has(k)
  }

  get length() {
    return this.len
  }

  *[Symbol.iterator](): IterableIterator<E> {
    yield* this.root
  }
}

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
    return this.tree.delete(k)
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

export class BTreeSet<T> implements Set<T> {
  private readonly tree = new BTree<T>()

  constructor(iterable?: Iterable<T>) {
    if (!iterable) {
      return
    }
    for (const v of iterable) {
      this.add(v)
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
    return this.tree.delete(v)
  }

  clear() {
    this.tree.clear()
  }

  get size() {
    return this.tree.length
  }

  *values(): IterableIterator<T> {
    for (const { key } of this.tree) {
      yield key
    }
  }

  *keys(): IterableIterator<T> {
    yield* this.values()
  }

  *entries(): IterableIterator<[T, T]> {
    for (const key of this) {
      yield [key, key]
    }
  }

  [Symbol.iterator] = this.values
  forEach(callback: (value: T, key: T, map: typeof this) => void): void
  forEach<R>(callback: (this: T, value: T, key: T, map: typeof this) => void, thisArg: R): void
  forEach(callback: (value: T, key: T, map: typeof this) => void, thisArg?: any) {
    for (const key of this) {
      callback.call(thisArg, key, key, this)
    }
  }
  [Symbol.toStringTag] = this.constructor.name
}

export interface Entry<T> {
  readonly key: T
}

export class DefaultEntry<T> implements Entry<T> {
  constructor(readonly key: T) {}
}

const next = Symbol()
class Leaf<T, E extends Entry<T>> {
  entries: E[] = [];
  [next]: Leaf<T, E> | null = null

  search(k: T): [number, boolean] {
    let left = 0
    let right = this.entries.length - 1
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      if (this.entries[mid].key > k) {
        right = mid - 1
      } else if (this.entries[mid].key < k) {
        left = mid + 1
      } else {
        return [mid, true]
      }
    }
    return [left, false]
  }

  top() {
    return this.entries[0].key
  }

  insert(entry: E, maxKeys: number): [T | null, Node<T, E> | null, E | null] {
    const [index, found] = this.search(entry.key)
    if (found) {
      const prev = this.entries[index]
      this.entries[index] = entry
      return [null, null, prev]
    }

    this.entries.splice(index, 0, entry)
    if (this.entries.length < maxKeys) {
      return [this.entries[0].key, null, null]
    }

    const mid = Math.floor(this.entries.length / 2)
    const node = new Leaf<T, E>()
    node.entries = this.entries.splice(mid)
    node[next] = this[next]
    this[next] = node
    return [node.top(), Node.leaf(node), null]
  }

  get(k: T): E | undefined {
    const [index, found] = this.search(k)
    if (!found) {
      return
    }

    return this.entries[index]
  }

  has(k: T): boolean {
    const [, found] = this.search(k)
    return found
  }

  delete(k: T): E | null {
    const [index, found] = this.search(k)
    if (!found) {
      return null
    }

    const [deleted] = this.entries.splice(index, 1)
    return deleted
  }
}
class Internal<T, E extends Entry<T>> {
  keys: T[] = []
  children: Node<T, E>[] = []

  search(k: T): number {
    let left = 0
    let right = this.keys.length - 1
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      if (this.keys[mid] > k) {
        right = mid - 1
      } else {
        left = mid + 1
      }
    }

    return left
  }

  insert(entry: E, maxKeys: number): [T | null, Node<T, E> | null, E | null] {
    const index = this.search(entry.key)
    const [top, node, inserted] = this.children[index].insert(entry, maxKeys)
    if (!node) {
      if (index > 0 && this.children[index].isLeaf()) {
        this.keys[index - 1] = this.children[index].leaf!.top()
      }

      return [null, null, inserted]
    }

    this.keys.splice(index, 0, top!)
    this.children.splice(index + 1, 0, node)
    if (this.keys.length < maxKeys) {
      return [null, null, inserted]
    }

    const mid = Math.floor(this.keys.length / 2) + 1
    const splitted = new Internal<T, E>()
    splitted.keys = this.keys.splice(mid)
    splitted.children = this.children.splice(mid)
    const key = this.keys.pop()!
    return [key, Node.internal(splitted), inserted]
  }

  get(k: T): E | undefined {
    return this.children[this.search(k)].get(k)
  }

  has(k: T): boolean {
    const index = this.search(k)
    if (this.keys[index - 1] === k) {
      return true
    }
    return this.children[index].has(k)
  }

  private getSuccessor() {
    let node = this as Internal<T, E>
    while (!node.children[0].isLeaf()) {
      node = node.children[0].internal!
    }
    return node.children[0].leaf!.top()
  }

  delete(k: T, minKeys: number): E | null {
    const index = this.search(k)
    const leaf = this.children[index].leaf
    if (leaf) {
      const deleted = leaf.delete(k)
      if (!deleted) {
        return null
      }

      if (leaf.entries.length >= minKeys) {
        if (index > 0) {
          this.keys[index - 1] = leaf.top()
        }
        return deleted
      }

      const left = this.children[index - 1]?.leaf
      if (left && left.entries.length > minKeys) {
        const entry = left.entries.pop()!
        leaf.entries.unshift(entry)
        this.keys[index - 1] = entry.key
        return deleted
      }

      const right = this.children[index + 1]?.leaf
      if (right && right.entries.length > minKeys) {
        const entry = right.entries.shift()!
        leaf.entries.push(entry)
        this.keys[index] = right.top()
        return deleted
      }

      if (left) {
        left.entries.push(...leaf.entries)
        left[next] = leaf[next]
        this.keys.splice(index - 1, 1)
        this.children.splice(index, 1)
        return deleted
      }

      leaf.entries.push(...right!.entries)
      leaf[next] = right![next]
      this.keys.splice(index, 1)
      this.children.splice(index + 1, 1)
      return deleted
    }

    const internal = this.children[index].internal!
    const found = index > 0 && this.keys[index - 1] === k
    const deleted = internal.delete(k, minKeys)
    if (!deleted) {
      return null
    }

    if (found) {
      this.keys[index - 1] = internal.getSuccessor()
    }
    if (internal.keys.length >= minKeys) {
      return deleted
    }

    const left = this.children[index - 1]?.internal
    if (left && left.keys.length > minKeys) {
      const key = left.keys.pop()!
      const child = left.children.pop()!
      internal.children.unshift(child)
      internal.keys.unshift(this.keys[index - 1])
      this.keys[index - 1] = key
      return deleted
    }

    const right = this.children[index + 1]?.internal
    if (right && right.keys.length > minKeys) {
      const key = right.keys.shift()!
      const child = right.children.shift()!
      internal.children.push(child)
      internal.keys.push(this.keys[index])
      this.keys[index] = key
      return deleted
    }

    if (left) {
      left.keys.push(this.keys[index - 1])
      left.keys.push(...internal.keys)
      left.children.push(...internal.children)
      this.keys.splice(index - 1, 1)
      this.children.splice(index, 1)
      return deleted
    }

    internal.keys.push(this.keys[index])
    internal.keys.push(...right!.keys)
    internal.children.push(...right!.children)
    this.keys.splice(index, 1)
    this.children.splice(index + 1, 1)
    return deleted
  }
}

class Cursor<T, E extends Entry<T>> implements IterableIterator<E> {
  constructor(
    private current: Leaf<T, E> | null,
    private index: number,
    private readonly end: T
  ) {}

  [Symbol.iterator]() {
    return this
  }

  next(): IteratorResult<E> {
    if (this.index === this.current!.entries.length) {
      this.current = this.current![next]
      this.index = 0
    }

    if (!this.current) {
      return { done: true, value: undefined }
    }

    const current = this.current!.entries[this.index++]
    if (current.key >= this.end) {
      return { done: true, value: undefined }
    }

    return { done: false, value: current }
  }
}
class Node<T, E extends Entry<T>> {
  constructor(
    public internal: Internal<T, E> | null,
    public leaf: Leaf<T, E> | null
  ) {}

  static leaf<T, E extends Entry<T>>(leaf: Leaf<T, E>) {
    return new Node<T, E>(null, leaf)
  }

  static internal<T, E extends Entry<T>>(internal: Internal<T, E>) {
    return new Node<T, E>(internal, null)
  }

  isLeaf() {
    return !!this.leaf
  }

  insert(entry: E, maxKeys: number) {
    if (this.isLeaf()) {
      return this.leaf!.insert(entry, maxKeys)
    } else {
      return this.internal!.insert(entry, maxKeys)
    }
  }

  get(k: T) {
    if (this.isLeaf()) {
      return this.leaf!.get(k)
    } else {
      return this.internal!.get(k)
    }
  }

  has(k: T): boolean {
    if (this.isLeaf()) {
      return this.leaf!.has(k)
    } else {
      return this.internal!.has(k)
    }
  }

  delete(k: T, minKeys: number) {
    if (this.isLeaf()) {
      return this.leaf!.delete(k)
    } else {
      return this.internal!.delete(k, minKeys)
    }
  }

  range(s: T, e: T): IterableIterator<E> {
    let node = this as Node<T, E>
    while (!node.isLeaf()) {
      const index = node.internal!.search(s)
      node = node.internal!.children[s === node.internal!.keys[index - 1] ? index - 1 : index]
    }
    const [index] = node.leaf!.search(s)
    return new Cursor(node.leaf!, index, e)
  }
}

export class BPlusTree<T, E extends Entry<T> = Entry<T>> {
  private root = new Node<T, E>(null, new Leaf<T, E>())
  private len = 0

  constructor(private readonly degree: number = 3) {}

  get length() {
    return this.len
  }

  insert(entry: E): E | undefined {
    const [key, node, prev] = this.root.insert(entry, this.degree)
    if (prev) {
      return prev
    }

    this.len += 1
    if (!node) {
      return
    }

    const internal = new Internal<T, E>()
    internal.keys = [key!]
    internal.children = [this.root, node]
    this.root = Node.internal(internal)
  }

  get(k: T): E | undefined {
    return this.root.get(k)
  }

  has(k: T): boolean {
    return this.root.has(k)
  }

  remove(k: T): E | undefined {
    const minKeys = Math.ceil(this.degree / 2) - 1
    const deleted = this.root.delete(k, minKeys)
    if (!deleted) {
      return
    }

    this.len -= 1
    if (this.root.isLeaf()) {
      return deleted
    }

    if (this.root.internal!.keys.length > 0) {
      return deleted
    }

    this.root = this.root.internal!.children[0]
    return deleted
  }

  *range(s: T, e: T): IterableIterator<E> {
    yield* this.root.range(s, e)
  }

  *entries() {
    let node = this.root
    while (!node.isLeaf()) {
      node = node.internal!.children[0]
    }

    for (let leaf: Leaf<T, E> | null = node.leaf; !!leaf; leaf = leaf[next]) {
      yield* leaf.entries
    }
  }
}

export interface Entry<T> {
  readonly key: T
}

export class DefaultEntry<T> implements Entry<T> {
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

  search(k: T): [number, E | null] {
    let left = 0
    let right = this.entries.length - 1
    while (left <= right) {
      const mid = (left + right) >>> 1
      const entry = this.entries[mid]
      if (k < entry.key) {
        right = mid - 1
      } else if (k > entry.key) {
        left = mid + 1
      } else {
        return [mid, this.entries[mid]]
      }
    }

    return [left, null]
  }

  split(): [E, Node<T, E>] {
    const mid = (this.entries.length >>> 1) + 1
    const right = new Node<T, E>()
    right.entries = this.entries.splice(mid)
    right.children = this.children.splice(mid)
    const entry = this.entries.pop()!
    return [entry, right]
  }

  insert(entry: E, maxKeys: number): [[E, Node<T, E>] | null, E | null] {
    const [index, found] = this.search(entry.key)
    if (found) {
      this.entries[index] = entry
      return [null, found]
    }

    if (this.isLeaf()) {
      this.entries.splice(index, 0, entry)
      if (this.entries.length < maxKeys) {
        return [null, null]
      }

      return [this.split(), null]
    }

    const [evicted, prev] = this.children[index].insert(entry, maxKeys)
    if (!evicted) {
      return [null, prev]
    }

    const [ee, el] = evicted
    this.entries.splice(index, 0, ee)
    this.children.splice(index + 1, 0, el)
    if (this.entries.length < maxKeys) {
      return [null, null]
    }

    return [this.split(), null]
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

  swapPredecessor(entry: E) {
    let node = this as Node<T, E>
    while (!node.isLeaf()) {
      node = node.children.at(-1)!
    }

    return node.entries.splice(-1, 1, entry)[0]
  }

  delete(k: T, minKeys: number, maxKeys: number): E | undefined {
    const [index, found] = this.search(k)
    if (this.isLeaf()) {
      if (!found) {
        return
      }

      this.entries.splice(index, 1)
      return found
    }

    if (found) {
      this.entries[index] = this.children[index].swapPredecessor(found)
    }

    const deleted = this.children[index].delete(k, minKeys, maxKeys)
    if (!deleted) {
      return
    }

    if (this.children[index].entries.length >= minKeys) {
      return deleted
    }

    const isLeaf = this.children[index].isLeaf()
    const left = this.children[index - 1]
    const right = this.children[index + 1]
    if (isLeaf && left?.entries.length > minKeys) {
      const entry = this.entries[index - 1]
      this.children[index].entries.unshift(entry)
      this.entries[index - 1] = left.entries.pop()!
      return deleted
    }

    if (isLeaf && right?.entries.length > minKeys) {
      const entry = this.entries[index]
      this.children[index].entries.push(entry)
      this.entries[index] = right.entries.shift()!
      return deleted
    }

    if (left) {
      const [entry] = this.entries.splice(index - 1, 1)
      const [node] = this.children.splice(index, 1)
      left.entries.push(entry, ...node.entries)
      left.children.push(...node.children)
      if (left.entries.length < maxKeys) {
        return deleted
      }

      const [en, rn] = left.split()
      this.entries.splice(index - 1, 0, en)
      this.children.splice(index, 0, rn)
      return deleted
    }

    const [entry] = this.entries.splice(index, 1)
    const [node] = this.children.splice(index, 1)
    right.entries.unshift(...node.entries, entry)
    right.children.unshift(...node.children)
    if (right.entries.length < maxKeys) {
      return deleted
    }

    const [en, rn] = right.split()
    this.entries.splice(index, 0, en)
    this.children.splice(index + 1, 0, rn)
    return deleted
  }

  *range(s: T, e: T): IterableIterator<E> {
    const [index, found] = this.search(s)
    if (found) {
      yield found
    }

    if (this.isLeaf()) {
      for (let i = index; i < this.entries.length && this.entries[i].key < e; i++) {
        yield this.entries[i]
      }
      return
    }

    for (let i = index; i < this.entries.length; i++) {
      yield* this.children[i].range(s, e)
      if (this.entries[i].key >= e) {
        return
      }
      yield this.entries[i]
    }
    yield* this.children.at(-1)!.range(s, e)
  }
}

export class BTree<T, E extends Entry<T> = Entry<T>> {
  private root = new Node<T, E>()
  private len = 0

  constructor(private readonly degree: number = 3) {}

  insert(entry: E): E | undefined {
    let current = this.root as Node<T, E> | null
    const stack: [number, Node<T, E>][] = []
    while (current) {
      const [index, found] = current.search(entry.key)
      if (found) {
        current.entries[index] = entry
        return found
      }

      stack.push([index, current])
      current = current.children[index]
    }

    this.len += 1
    let evicted: E | null = entry
    while (stack.length > 0) {
      const [index, parent] = stack.pop()!
      if (evicted) {
        parent.entries.splice(index, 0, evicted)
      }
      if (current) {
        parent.children.splice(index + 1, 0, current)
      }
      if (parent.entries.length < this.degree) {
        return
      }
      const [e, n] = parent.split()
      evicted = e
      current = n
    }

    const newRoot = new Node<T, E>()
    newRoot.entries = [evicted]
    newRoot.children = [this.root, current!]
    this.root = newRoot
  }

  get(k: T): E | undefined {
    let node = this.root as Node<T, E> | null
    while (!!node) {
      const [index, entry] = node.search(k)
      if (entry) {
        return entry
      }
      node = node.children[index]
    }
  }

  remove(k: T): E | undefined {
    if (this.len === 0) {
      return
    }

    const minKeys = ((this.degree + 1) >>> 1) - 1

    let current = this.root as Node<T, E>
    const stack: [number, Node<T, E>][] = []

    while (!current.isLeaf()) {
      const [index, found] = current.search(k)
      if (found) {
        current.entries[index] = current.children[index].swapPredecessor(found)
      }

      stack.push([index, current])
      current = current.children[index]
    }

    const [index, found] = current.search(k)
    if (!found) {
      return
    }
    current.entries.splice(index, 1)
    this.len -= 1

    while (stack.length > 0) {
      const [index, parent] = stack.pop()!
      const child = parent.children[index]
      if (child.entries.length >= minKeys) {
        continue
      }

      const isLeaf = parent.children[index].isLeaf()
      const left = parent.children[index - 1]
      const right = parent.children[index + 1]

      if (isLeaf && left?.entries.length > minKeys) {
        const entry = parent.entries[index - 1]
        parent.children[index].entries.unshift(entry)
        parent.entries[index - 1] = left.entries.pop()!
        continue
      }

      if (isLeaf && right?.entries.length > minKeys) {
        const entry = parent.entries[index]
        parent.children[index].entries.push(entry)
        parent.entries[index] = right.entries.shift()!
        continue
      }

      if (left) {
        const [entry] = parent.entries.splice(index - 1, 1)
        const [node] = parent.children.splice(index, 1)
        left.entries = left.entries.concat(entry).concat(node.entries)
        left.children = left.children.concat(node.children)
        if (left.entries.length < this.degree) {
          continue
        }

        const [en, rn] = left.split()
        parent.entries.splice(index - 1, 0, en)
        parent.children.splice(index, 0, rn)
        continue
      }

      const [entry] = parent.entries.splice(index, 1)
      const [node] = parent.children.splice(index, 1)
      right.entries = node.entries.concat(entry).concat(right.entries)
      right.children = node.children.concat(right.children)
      if (right.entries.length < this.degree) {
        continue
      }

      const [en, rn] = right.split()
      parent.entries.splice(index, 0, en)
      parent.children.splice(index + 1, 0, rn)
    }

    if (this.root.entries.length > 0) {
      return found
    }

    if (this.root.isLeaf()) {
      return found
    }

    this.root = this.root.children[0]
    return found
  }

  clear() {
    this.len = 0
    this.root = new Node<T, E>()
  }

  has(k: T) {
    return !!this.root.get(k)
  }

  range(s: T, e: T) {
    return this.root.range(s, e)
  }

  get length() {
    return this.len
  }

  *[Symbol.iterator](): IterableIterator<E> {
    yield* this.root
  }
}

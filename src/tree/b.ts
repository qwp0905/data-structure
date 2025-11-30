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

  swapPredecessor(entry: E) {
    let node = this as Node<T, E>
    while (!node.isLeaf()) {
      node = node.children.at(-1)!
    }

    return node.entries.splice(-1, 1, entry)[0]
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
      ;[evicted, current] = parent.split()
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
        parent.children[index].entries = [entry].concat(parent.children[index].entries)
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

  has(k: T): boolean {
    let node = this.root as Node<T, E> | null
    while (node) {
      const [index, entry] = node.search(k)
      if (entry) {
        return true
      }
      node = node.children[index]
    }
    return false
  }

  *range(s: T, e: T): IterableIterator<E> {
    let current: Node<T, E> | null = this.root
    let index: number | null = null
    const stack: [number, Node<T, E>][] = []

    while (current || stack.length > 0) {
      while (current) {
        index ??= current.search(s)[0]
        stack.push([index, current])
        current = current.children[index]
        index = null
      }

      ;[index, current] = stack.pop()!
      if (current.entries.length <= index) {
        current = null
        index = null
        continue
      }
      if (current.entries[index].key >= e) {
        return
      }
      yield current.entries[index]
      index += 1
    }
  }

  get length() {
    return this.len
  }

  *entries(): IterableIterator<E> {
    let index = 0
    let current = this.root as Node<T, E> | null
    const stack: [number, Node<T, E>][] = []

    while (current || stack.length > 0) {
      while (current) {
        stack.push([index, current])
        current = current.children[index]
        index = 0
      }

      ;[index, current] = stack.pop()!
      if (current.entries.length <= index) {
        current = null
        index = 0
        continue
      }
      yield current.entries[index]
      index += 1
    }
  }

  [Symbol.iterator] = this.entries
}

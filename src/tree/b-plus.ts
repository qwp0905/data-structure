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

  search(k: T): [number, E | null] {
    let left = 0
    let right = this.entries.length - 1
    while (left <= right) {
      const mid = (left + right) >>> 1
      const entry = this.entries[mid]
      if (entry.key > k) {
        right = mid - 1
      } else if (entry.key < k) {
        left = mid + 1
      } else {
        return [mid, entry]
      }
    }
    return [left, null]
  }

  split() {
    const mid = this.entries.length >>> 1
    const node = new Leaf<T, E>()
    node.entries = this.entries.splice(mid)
    node[next] = this[next]
    this[next] = node
    return node
  }

  top() {
    return this.entries[0].key
  }
}
class Internal<T, E extends Entry<T>> {
  keys: T[] = []
  children: Node<T, E>[] = []

  search(k: T): number {
    let left = 0
    let right = this.keys.length - 1
    while (left <= right) {
      const mid = (left + right) >>> 1
      if (this.keys[mid] > k) {
        right = mid - 1
      } else {
        left = mid + 1
      }
    }

    return left
  }

  split(): [T, Node<T, E>] {
    const mid = (this.keys.length >>> 1) + 1
    const splitted = new Internal<T, E>()
    splitted.keys = this.keys.splice(mid)
    splitted.children = this.children.splice(mid)
    return [this.keys.pop()!, Node.internal(splitted)]
  }

  getSuccessor() {
    let node = this as Internal<T, E>
    while (!node.children[0].leaf) {
      node = node.children[0].internal!
    }
    return node.children[0].leaf!.top()
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
}

export class BPlusTree<T, E extends Entry<T> = Entry<T>> {
  private root = new Node<T, E>(null, new Leaf<T, E>())
  private len = 0

  constructor(private readonly degree: number = 3) {}

  get length() {
    return this.len
  }

  insert(entry: E): E | undefined {
    let current = this.root as Node<T, E>
    const stack: [number, Internal<T, E>][] = []
    while (!current.leaf) {
      const internal = current.internal!
      const index = internal.search(entry.key)
      stack.push([index, internal])
      current = internal.children[index]
    }

    const leaf = current.leaf
    const [index, found] = leaf.search(entry.key)
    if (found) {
      leaf.entries[index] = entry
      return found
    }

    this.len += 1
    leaf.entries.splice(index, 0, entry)

    if (leaf.entries.length < this.degree) {
      if (stack.length === 0) {
        return
      }

      const [index, parent] = stack.pop()!
      if (index > 0) {
        parent.keys[index - 1] = leaf.top()
      }
      return
    }

    const splitted = leaf.split()
    let evicted: [T, Node<T, E>] = [splitted.top(), Node.leaf(splitted)]

    while (stack.length > 0) {
      const [index, parent] = stack.pop()!
      const [key, node] = evicted
      parent.keys.splice(index, 0, key)
      parent.children.splice(index + 1, 0, node)
      if (parent.keys.length < this.degree) {
        return
      }

      evicted = parent.split()
    }

    const [key, node] = evicted
    const internal = new Internal<T, E>()
    internal.keys = [key]
    internal.children = [this.root, node]
    this.root = Node.internal(internal)
  }

  get(k: T): E | undefined {
    let node = this.root as Node<T, E>
    while (!node.leaf) {
      const index = node.internal!.search(k)
      node = node.internal!.children[index]
    }
    const [, found] = node.leaf.search(k)
    if (!found) {
      return
    }
    return found
  }

  has(k: T): boolean {
    let node = this.root as Node<T, E>
    while (!node.leaf) {
      const index = node.internal!.search(k)
      node = node.internal!.children[index]
    }
    const [, found] = node.leaf.search(k)
    return !!found
  }

  remove(k: T): E | undefined {
    const minKeys = ((this.degree + 1) >>> 1) - 1

    let current = this.root as Node<T, E>
    const stack: [number, Internal<T, E>][] = []

    while (!current.leaf) {
      const internal = current.internal!
      const index = internal.search(k)
      stack.push([index, internal])
      current = internal.children[index]
    }

    const leaf = current.leaf
    const [index, found] = leaf.search(k)
    if (!found) {
      return
    }

    leaf.entries.splice(index, 1)
    this.len -= 1

    while (stack.length > 0) {
      const [index, parent] = stack.pop()!
      const leaf = parent.children[index].leaf
      if (leaf) {
        if (leaf.entries.length >= minKeys) {
          if (index > 0) {
            parent.keys[index - 1] = leaf.top()
          }
          return found
        }

        const left = parent.children[index - 1]?.leaf
        if (left && left.entries.length > minKeys) {
          const entry = left.entries.pop()!
          leaf.entries = [entry].concat(leaf.entries)
          parent.keys[index - 1] = entry.key
          return found
        }

        const right = parent.children[index + 1]?.leaf
        if (right && right.entries.length > minKeys) {
          const entry = right.entries.shift()!
          leaf.entries = leaf.entries.concat([entry])
          parent.keys[index] = right.top()
          return found
        }

        if (left) {
          left.entries = left.entries.concat(leaf.entries)
          left[next] = leaf[next]
          parent.keys.splice(index - 1, 1)
          parent.children.splice(index, 1)
          continue
        }

        leaf.entries = leaf.entries.concat(right!.entries)
        leaf[next] = right![next]
        parent.keys.splice(index, 1)
        parent.children.splice(index + 1, 1)
        continue
      }

      const internal = parent.children[index].internal!
      if (index > 0 && internal.keys[index - 1] === k) {
        internal.keys[index - 1] = internal.getSuccessor()
      }
      if (internal.keys.length >= minKeys) {
        return found
      }

      const left = parent.children[index - 1]?.internal
      if (left && left.keys.length > minKeys) {
        const key = left.keys.pop()!
        const child = left.children.pop()!
        internal.children = [child].concat(internal.children)
        internal.keys = [parent.keys[index - 1]].concat(internal.keys)
        parent.keys[index - 1] = key
        return found
      }

      const right = parent.children[index + 1]?.internal
      if (right && right.keys.length > minKeys) {
        const key = right.keys.shift()!
        const child = right.children.shift()!
        internal.children = internal.children.concat([child])
        internal.keys = internal.keys.concat([parent.keys[index]])
        parent.keys[index] = key
        return found
      }

      if (left) {
        left.keys = left.keys.concat(parent.keys[index - 1]).concat(internal.keys)
        left.children = left.children.concat(internal.children)
        parent.keys.splice(index - 1, 1)
        parent.children.splice(index, 1)
        continue
      }

      internal.keys = internal.keys.concat(parent.keys[index]).concat(right!.keys)
      internal.children = internal.children.concat(right!.children)
      parent.keys.splice(index, 1)
      parent.children.splice(index + 1, 1)
    }

    if (this.root.leaf) {
      return found
    }

    if (this.root.internal!.keys.length > 0) {
      return found
    }

    this.root = this.root.internal!.children[0]
    return found
  }

  *range(s: T, e: T): IterableIterator<E> {
    let node = this.root as Node<T, E>
    while (!node.leaf) {
      const index = node.internal!.search(s)
      node = node.internal!.children[s === node.internal!.keys[index - 1] ? index - 1 : index]
    }

    let leaf: Leaf<T, E> | null = node.leaf
    let [index] = leaf.search(s)
    if (index === leaf.entries.length) {
      leaf = leaf[next]
      index = 0
    }
    while (leaf && leaf.entries[index].key < e) {
      yield leaf.entries[index]
      if (++index < leaf.entries.length) {
        continue
      }
      leaf = leaf[next]
      index = 0
    }
  }

  *entries() {
    let node = this.root
    while (!node.leaf) {
      node = node.internal!.children[0]
    }

    for (let leaf: Leaf<T, E> | null = node.leaf; !!leaf; leaf = leaf[next]) {
      yield* leaf.entries
    }
  }
}

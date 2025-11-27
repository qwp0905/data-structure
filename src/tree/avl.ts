interface Entry<T> {
  readonly key: T
}

enum Direction {
  left,
  right
}

class Node<T, E extends Entry<T>> {
  left: Node<T, E> | null = null
  right: Node<T, E> | null = null
  constructor(
    public entry: E,
    public height = 1
  ) {}

  rebalance() {
    const left = this.left?.height ?? 0
    const right = this.right?.height ?? 0
    this.height = Math.max(left, right) + 1
    if (Math.abs(left - right) <= 1) {
      return this
    }
    if (left > right) {
      if (this.left!.left) {
        return this.rotateLeft()
      }
      this.left = this.left!.rotateRight()
      return this.rotateLeft()
    }

    if (this.right!.right) {
      return this.rotateRight()
    }
    this.right = this.right!.rotateLeft()
    return this.rotateRight()
  }

  getPredecessor() {
    let node = this as Node<T, E>
    while (node?.right) {
      node = node.right
    }
    return node
  }
  getSuccessor() {
    let node = this as Node<T, E>
    while (node?.left) {
      node = node.left
    }
    return node
  }

  private rotateLeft() {
    const node = this.left!
    this.left = node.right
    node.right = this
    this.height = Math.max(this.right?.height ?? 0, this.left?.height ?? 0) + 1
    node.height = Math.max(node.left?.height ?? 0, node.right.height) + 1
    return node
  }

  private rotateRight() {
    const node = this.right!
    this.right = node.left
    node.left = this
    this.height = Math.max(this.left?.height ?? 0, this.right?.height ?? 0) + 1
    node.height = Math.max(node.right?.height ?? 0, node.left.height) + 1
    return node
  }

  cmp(key: T) {
    if (key < this.entry.key) {
      return -1
    } else if (key > this.entry.key) {
      return 1
    } else {
      return 0
    }
  }
}

export class AVLTree<T, E extends Entry<T> = Entry<T>> {
  private root: Node<T, E> | null = null
  private len = 0

  get length() {
    return this.len
  }

  insert(entry: E): E | undefined {
    if (!this.root) {
      this.root = new Node(entry)
      this.len += 1
      return
    }

    let current = this.root as Node<T, E> | null
    const stack: [Node<T, E>, Direction][] = []

    while (current) {
      const currentEntry = current.entry
      const cmp = current.cmp(entry.key)
      if (cmp === 0) {
        current.entry = entry
        return currentEntry
      } else if (cmp < 0) {
        stack.push([current, Direction.left])
        current = current.left
      } else {
        stack.push([current, Direction.right])
        current = current.right
      }
    }

    current = new Node(entry)
    while (stack.length > 0) {
      const [parent, direction] = stack.pop()!
      const key = direction === Direction.left ? "left" : "right"
      parent[key] = current
      current = parent.rebalance()
    }

    this.root = current
    this.len += 1
  }

  get(k: T): E | undefined {
    let current = this.root as Node<T, E> | null
    while (current) {
      const cmp = current.cmp(k)
      if (cmp === 0) {
        return current.entry
      } else if (cmp < 0) {
        current = current.left
      } else {
        current = current.right
      }
    }
  }

  remove(k: T): E | undefined {
    let current = this.root as Node<T, E> | null
    const stack: [Node<T, E>, Direction][] = []

    while (current) {
      const cmp = current.cmp(k)
      if (cmp < 0) {
        stack.push([current, Direction.left])
        current = current.left
        continue
      } else if (cmp > 0) {
        stack.push([current, Direction.right])
        current = current.right
        continue
      }

      if (current.left) {
        const pred = current.left.getPredecessor()
        const entry = pred.entry
        pred.entry = current.entry
        current.entry = entry
        stack.push([current, Direction.left])
        current = current.left
        continue
      }
      if (current.right) {
        const suc = current.right.getSuccessor()
        const entry = suc.entry
        suc.entry = current.entry
        current.entry = entry
        stack.push([current, Direction.right])
        current = current.right
        continue
      }
      break
    }

    if (!current) {
      return
    }

    const deleted = current.entry
    current = null

    while (stack.length > 0) {
      const [parent, direction] = stack.pop()!
      const key = direction === Direction.left ? "left" : "right"
      parent[key] = current
      current = parent.rebalance()
    }

    this.root = current
    this.len -= 1
    return deleted
  }

  clear() {
    this.len = 0
    this.root = null
  }

  *entries() {
    if (!this.root) {
      return
    }

    let current = this.root as Node<T, E> | null
    const stack: Node<T, E>[] = []

    while (current || stack.length > 0) {
      while (current) {
        stack.push(current)
        current = current.left
      }

      current = stack.pop()!
      yield current.entry

      current = current.right
    }
  }

  *range(s: T, e: T) {
    if (!this.root) {
      return
    }

    let current = this.root as Node<T, E> | null
    const stack: Node<T, E>[] = []

    while (current || stack.length > 0) {
      while (current && current.cmp(s) <= 0) {
        stack.push(current)
        current = current.left
      }

      current ??= stack.pop()!
      if (current.cmp(e) <= 0) {
        return
      }
      if (current.cmp(s) <= 0) {
        yield current.entry
      }
      current = current.right
    }
  }

  [Symbol.iterator] = this.entries
}

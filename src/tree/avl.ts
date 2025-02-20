interface Entry<T> {
  readonly key: T
}

class Node<T, E extends Entry<T>> {
  left: Node<T, E> | null = null
  right: Node<T, E> | null = null
  constructor(
    public entry: E,
    public height = 1
  ) {}

  insert(entry: E): [Node<T, E>, E | null] {
    if (entry.key === this.entry.key) {
      const prev = this.entry
      this.entry = entry
      return [this, prev]
    }
    if (entry.key < this.entry.key) {
      if (!this.left) {
        this.left = new Node(entry)
        this.height = Math.max(2, this.height)
        return [this, null]
      }

      const [node, prev] = this.left.insert(entry)
      if (prev) {
        return [this, prev]
      }
      this.left = node
      this.height = Math.max(this.left.height + 1, this.height)
      return [this.rebalance(), null]
    }

    if (!this.right) {
      this.right = new Node(entry)
      this.height = Math.max(2, this.height)
      return [this, null]
    }

    const [node, prev] = this.right.insert(entry)
    if (prev) {
      return [this, prev]
    }
    this.right = node
    this.height = Math.max(this.right.height + 1, this.height)
    return [this.rebalance(), null]
  }

  get(k: T): E | undefined {
    if (k === this.entry.key) {
      return this.entry
    }
    if (k < this.entry.key) {
      return this.left?.get(k)
    }
    return this.right?.get(k)
  }

  private rebalance() {
    const left = this.left?.height ?? 0
    const right = this.right?.height ?? 0
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

  private getPredecessor() {
    let node = this as Node<T, E>
    while (node?.right) {
      node = node.right
    }
    return node
  }
  private getSuccessor() {
    let node = this as Node<T, E>
    while (node?.left) {
      node = node.left
    }
    return node
  }

  delete(k: T): [Node<T, E> | null, E | null] {
    if (k === this.entry.key) {
      if (!this.left && !this.right) {
        return [null, this.entry]
      }

      const entry = this.entry
      if (this.left) {
        const pred = this.left.getPredecessor()
        this.entry = pred.entry
        const [node] = this.left.delete(pred.entry.key)
        this.left = node
        this.height = Math.max(this.left?.height ?? 0, this.right?.height ?? 0) + 1
        return [this.rebalance(), entry]
      }

      const succ = this.right!.getSuccessor()
      this.entry = succ.entry
      const [node] = this.right!.delete(succ.entry.key)
      this.right = node
      this.height = (this.right?.height ?? 0) + 1
      return [this.rebalance(), entry]
    }

    if (k < this.entry.key) {
      if (!this.left) {
        return [null, null]
      }

      const [node, deleted] = this.left.delete(k)
      if (!deleted) {
        return [null, null]
      }

      this.left = node
      this.height = Math.max(this.left?.height ?? 0, this.right?.height ?? 0) + 1
      return [this.rebalance(), deleted]
    }

    if (!this.right) {
      return [null, null]
    }

    const [node, deleted] = this.right.delete(k)
    if (!deleted) {
      return [null, null]
    }

    this.right = node
    this.height = Math.max(this.left?.height ?? 0, this.right?.height ?? 0) + 1
    return [this.rebalance(), deleted]
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

  *entries(): IterableIterator<E> {
    if (this.left) {
      yield* this.left.entries()
    }
    yield this.entry
    if (this.right) {
      yield* this.right.entries()
    }
  }

  *range(s: T, e: T): IterableIterator<E> {
    if (this.left && s < this.entry.key) {
      yield* this.left.range(s, e)
    }
    if (s <= this.entry.key && e > this.entry.key) {
      yield this.entry
    }
    if (e > this.entry.key && this.right) {
      yield* this.right.range(s, e)
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

    const [node, prev] = this.root.insert(entry)
    this.root = node
    if (prev) {
      return prev
    }

    this.len += 1
  }

  get(k: T): E | undefined {
    return this.root?.get(k)
  }

  delete(k: T): E | undefined {
    if (!this.root) {
      return
    }

    const [node, deleted] = this.root.delete(k)
    if (!deleted) {
      return
    }

    this.len -= 1
    this.root = node
    return deleted
  }

  clear() {
    this.len = 0
    this.root = null
  }

  *[Symbol.iterator]() {
    if (!this.root) {
      return
    }
    yield* this.root.entries()
  }

  *range(s: T, e: T) {
    if (!this.root) {
      return
    }
    yield* this.root.range(s, e)
  }
}

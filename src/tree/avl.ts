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

  insert(entry: E): [Node<T, E>, boolean] {
    if (entry.key === this.entry.key) {
      this.entry = entry
      return [this, false]
    }
    if (entry.key < this.entry.key) {
      if (!this.left) {
        this.left = new Node(entry)
        this.height = Math.max(2, this.height)
        return [this, true]
      }

      const [node, inserted] = this.left.insert(entry)
      if (!inserted) {
        return [this, false]
      }
      this.left = node
      this.height = Math.max(this.left.height + 1, this.height)
      return [this.rebalance(), true]
    }

    if (!this.right) {
      this.right = new Node(entry)
      this.height = Math.max(2, this.height)
      return [this, true]
    }

    const [node, inserted] = this.right.insert(entry)
    if (!inserted) {
      return [this, false]
    }
    this.right = node
    this.height = Math.max(this.right.height + 1, this.height)
    return [this.rebalance(), true]
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

  delete(k: T): [Node<T, E> | null, boolean] {
    if (k === this.entry.key) {
      return [null, true]
    }
    if (k < this.entry.key) {
      if (!this.left) {
        return [null, false]
      }

      const [node, deleted] = this.left.delete(k)
      if (!deleted) {
        return [null, false]
      }

      this.left = node
      this.height = Math.max(this.left?.height ?? 0, this.right?.height ?? 0) + 1
      return [this.rebalance(), true]
    }

    if (!this.right) {
      return [null, false]
    }

    const [node, deleted] = this.right.delete(k)
    if (!deleted) {
      return [null, false]
    }

    this.right = node
    this.height = Math.max(this.left?.height ?? 0, this.right?.height ?? 0) + 1
    return [this.rebalance(), true]
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
}

export class AVLTree<T, E extends Entry<T> = Entry<T>> {
  private root: Node<T, E> | null = null
  private len = 0
  constructor() {}

  get length() {
    return this.len
  }

  insert(entry: E): void {
    if (!this.root) {
      this.root = new Node(entry)
      this.len += 1
      return
    }

    const [node, inserted] = this.root.insert(entry)
    if (inserted) {
      this.len += 1
    }
    this.root = node
  }

  get(k: T): E | undefined {
    return this.root?.get(k)
  }

  delete(k: T): boolean {
    if (!this.root) {
      return false
    }

    const [node, deleted] = this.root.delete(k)
    if (!deleted) {
      return false
    }

    this.len -= 1
    this.root = node
    return true
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
}

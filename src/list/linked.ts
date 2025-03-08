export class LinkedNode<T> {
  prev: LinkedNode<T> | null = null
  next: LinkedNode<T> | null = null
  constructor(readonly value: T) {}
}

export class LinkedList<T> implements Iterable<LinkedNode<T>> {
  private head: LinkedNode<T> | null = null
  private tail: LinkedNode<T> | null = null
  private len = 0

  constructor(iterable?: Iterable<T>) {
    if (!iterable) {
      return
    }
    for (const v of iterable) {
      this.pushBack(new LinkedNode(v))
    }
  }

  get length(): number {
    return this.len
  }

  moveBack(node: LinkedNode<T>) {
    this.remove(node)
    this.pushBack(node)
  }

  pushBack(node: LinkedNode<T>): void {
    if (this.len === 0) {
      this.head = node
    } else {
      this.tail!.next = node
      node.prev = this.tail
    }
    this.tail = node
    this.len++
  }

  popBack(): LinkedNode<T> | undefined {
    if (!this.tail) {
      return
    }

    const value = this.tail
    this.tail = this.tail.prev
    if (this.tail === null) {
      this.head = null
    } else {
      this.tail.next = null
    }
    this.len--
    return value
  }

  peekBack(): LinkedNode<T> | undefined {
    return this.tail ?? undefined
  }

  pushFront(node: LinkedNode<T>): void {
    if (this.len === 0) {
      this.tail = node
    } else {
      this.head!.prev = node
      node.next = this.head
    }
    this.head = node
    this.len++
  }

  moveFront(node: LinkedNode<T>) {
    this.remove(node)
    this.pushFront(node)
  }

  popFront(): LinkedNode<T> | undefined {
    if (!this.head) {
      return
    }

    const value = this.head
    this.head = this.head.next
    if (this.head === null) {
      this.tail = null
    } else {
      this.head.prev = null
    }
    this.len--
    return value
  }

  peekFront(): LinkedNode<T> | undefined {
    return this.head ?? undefined
  }

  remove(node: LinkedNode<T>) {
    if (this.len === 0) {
      return
    }
    if (node === this.head) {
      return this.popFront()
    }
    if (node === this.tail) {
      return this.popBack()
    }

    node.prev!.next = node.next
    node.next!.prev = node.prev
    this.len--

    return node
  }

  *values(): IterableIterator<LinkedNode<T>> {
    let current = this.head
    while (current !== null) {
      yield current
      current = current.next
    }
  }

  *reverse(): IterableIterator<LinkedNode<T>> {
    let current = this.tail
    while (current !== null) {
      yield current
      current = current.prev
    }
  }

  readonly [Symbol.iterator] = this.values

  clear() {
    this.head = null
    this.tail = null
    this.len = 0
  }
}

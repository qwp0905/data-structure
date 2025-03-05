export class DoubleLinkedNode<T> {
  prev: DoubleLinkedNode<T> | null = null
  next: DoubleLinkedNode<T> | null = null
  constructor(readonly value: T) {}
}

export class DoubleLinkedList<T> implements Iterable<T> {
  private head: DoubleLinkedNode<T> | null = null
  private tail: DoubleLinkedNode<T> | null = null
  private len = 0

  constructor(iterable?: Iterable<T>) {
    if (!iterable) {
      return
    }
    for (const v of iterable) {
      this.pushBack(new DoubleLinkedNode(v))
    }
  }

  get length(): number {
    return this.len
  }

  moveBack(node: DoubleLinkedNode<T>) {
    this.remove(node)
    this.pushBack(node)
  }

  pushBack(node: DoubleLinkedNode<T>): void {
    if (this.len === 0) {
      this.head = node
    } else {
      this.tail!.next = node
      node.prev = this.tail
    }
    this.tail = node
    this.len++
  }

  popBack(): DoubleLinkedNode<T> | undefined {
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

  peekBack(): T | undefined {
    return this.tail?.value
  }

  pushFront(node: DoubleLinkedNode<T>): void {
    if (this.len === 0) {
      this.tail = node
    } else {
      this.head!.prev = node
      node.next = this.head
    }
    this.head = node
    this.len++
  }

  moveFront(node: DoubleLinkedNode<T>) {
    this.remove(node)
    this.pushFront(node)
  }

  popFront(): DoubleLinkedNode<T> | undefined {
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

  peekFront(): DoubleLinkedNode<T> | undefined {
    return this.head ?? undefined
  }

  remove(node: DoubleLinkedNode<T>) {
    if (this.len === 0) {
      return
    }
    if (node === this.head) {
      this.popFront()
      return
    }
    if (node === this.tail) {
      this.popBack()
      return
    }

    node.prev!.next = node.next
    node.next!.prev = node.prev
    this.len--
  }

  *values(): IterableIterator<T> {
    let current = this.head
    while (current !== null) {
      yield current.value
      current = current.next
    }
  }

  *reverse() {
    let current = this.tail
    while (current !== null) {
      yield current.value
      current = current.prev
    }
  }

  readonly [Symbol.iterator] = this.values
}

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
      this.pushBack(v)
    }
  }

  get length(): number {
    return this.len
  }

  moveBack(node: DoubleLinkedNode<T>) {
    if (node === this.tail) {
      return
    }

    if (node === this.head) {
      this.head = this.head.next
      this.head!.prev = null
    } else {
      node.prev!.next = node.next
      node.next!.prev = node.prev
    }

    this.tail!.next = node
    node.prev = this.tail
    node.next = null
    this.tail = node
  }

  pushBack(value: T): void {
    const node = new DoubleLinkedNode(value)
    if (this.len === 0) {
      this.head = node
    } else {
      this.tail!.next = node
      node.prev = this.tail
    }
    this.tail = node
    this.len++
  }

  popBack(): T | undefined {
    if (!this.tail) {
      return
    }

    const value = this.tail.value
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

  pushFront(value: T): void {
    const node = new DoubleLinkedNode(value)
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
    if (node === this.head) {
      return
    }

    if (node === this.tail) {
      this.tail = this.tail.prev
      this.tail!.next = null
    } else {
      node.prev!.next = node.next
      node.next!.prev = node.prev
    }

    this.head!.prev = node
    node.next = this.head
    node.prev = null
    this.head = node
  }

  popFront(): T | undefined {
    if (!this.head) {
      return
    }

    const value = this.head.value
    this.head = this.head.next
    if (this.head === null) {
      this.tail = null
    } else {
      this.head.prev = null
    }
    this.len--
    return value
  }

  peekFront(): T | undefined {
    return this.head?.value
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

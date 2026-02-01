class LinkedNode<T> {
  prev: LinkedNode<T> | null = null
  next: LinkedNode<T> | null = null
  constructor(readonly value: T) {}
}

export class LinkedList<T> implements Iterable<T> {
  private head: LinkedNode<T> | null = null
  private tail: LinkedNode<T> | null = null
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

  pushBack(value: T): void {
    const node = new LinkedNode(value)
    if (!this.tail) {
      this.head = node
    } else {
      this.tail!.next = node
      node.prev = this.tail
    }
    this.tail = node
    this.len += 1
  }

  popBack(): T | undefined {
    if (!this.tail) {
      return
    }
    return this.remove(this.tail)
  }

  peekBack(): T | undefined {
    return this.tail?.value
  }

  pushFront(value: T): void {
    const node = new LinkedNode(value)
    if (!this.head) {
      this.tail = node
    } else {
      this.head.prev = node
      node.next = this.head
    }
    this.head = node
    this.len += 1
  }

  popFront(): T | undefined {
    if (!this.head) {
      return
    }
    return this.remove(this.head)
  }

  private remove(node: LinkedNode<T>): T | undefined {
    if (this.len === 0) {
      return
    }

    const prev = node.prev
    const next = node.next
    if (prev) {
      prev.next = next
      node.prev = null
    } else {
      this.head = next
    }

    if (next) {
      next.prev = prev
      node.next = null
    } else {
      this.tail = prev
    }
    this.len -= 1
    return node.value
  }

  peekFront(): T | undefined {
    return this.head?.value
  }

  *values(): IterableIterator<T> {
    for (let current = this.head; current !== null; current = current.next) {
      yield current.value
    }
  }

  *reverse(): IterableIterator<T> {
    for (let current = this.tail; current !== null; current = current.prev) {
      yield current.value
    }
  }

  readonly [Symbol.iterator] = this.values

  clear() {
    this.head &&= null
    this.tail &&= null
    this.len &&= 0
  }
}

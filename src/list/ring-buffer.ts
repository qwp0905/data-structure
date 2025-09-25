class RingNode<T> {
  public prev?: RingNode<T>
  public next?: RingNode<T>
  constructor(readonly value: T) {}

  getValue() {
    return this.value
  }
}

export class RingBuffer<T> implements Iterable<T> {
  private head?: RingNode<T>
  private tail?: RingNode<T>
  private len = 0

  constructor(iterable?: Iterable<T>) {
    if (!iterable) {
      return
    }
  }

  push(value: T) {
    const node = new RingNode(value)
    this.attach(node, this.tail)
  }

  rotate() {
    if (!this.head) {
      return
    }
    if (this.head === this.tail) {
      return this.head
    }
    const head = this.head
    this.detach(head)
    this.attach(head, this.tail)
    return head.value
  }

  private attach(node: RingNode<T>, at?: RingNode<T>) {
    node.prev = at
    node.next = at?.next
    if (node.prev) {
      node.prev.next = node
    } else {
      this.head = node
    }
    if (node.next) {
      node.next.prev = node
    } else {
      this.tail = node
    }
    this.len += 1
  }

  private detach(node: RingNode<T>) {
    if (node.prev) {
      node.prev.next = node.next
    } else {
      this.head = node.next
    }
    if (node.next) {
      node.next.prev = node.prev
    } else {
      this.tail = node.prev
    }
    node.prev = undefined
    node.next = undefined
    this.len -= 1
  }

  *[Symbol.iterator](): IterableIterator<T> {
    let current = this.head
    while (current !== undefined) {
      yield current.value
      current = current.next
    }
  }
}

interface Entry<T> {
  readonly key: T
}

class Node<T, E extends Entry<T>> {
  next: Node<T, E> | null = null
  bottom: Node<T, E> | null = null
  top: Node<T, E> | null = null
  prev: Node<T, E> | null = null
  constructor(public entry: E | null = null) {}

  getKey() {
    return this.entry?.key
  }

  getEntry() {
    return this.entry ?? undefined
  }

  setEntry(entry: E) {
    const prev = this.entry
    this.entry = entry
    return prev ?? undefined
  }

  isHead(): this is { entry: null; next: Node<T, E>; prev: null } {
    return !this.entry
  }

  isTail(): this is { entry: null; next: null; prev: Node<T, E> } {
    return !this.entry
  }

  hasBottom(): this is { bottom: Node<T, E> } {
    return !!this.bottom
  }

  hasValue(): this is { entry: E; next: Node<T, E>; prev: Node<T, E> } {
    return !!this.entry
  }
}

export class SkipList<T, E extends Entry<T> = Entry<T>> {
  private head = new Node<T, E>()
  private tail = new Node<T, E>()
  private height = 1
  private len = 0
  constructor(private readonly maxHeight: number = Infinity) {
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  private randomHeight() {
    const max = Math.min(this.maxHeight, this.height)
    let height = 1
    while (height < max && Math.random() < 0.5) {
      height += 1
    }
    return height
  }

  get(k: T): E | undefined {
    let node: Node<T, E> | null = this.head
    while (node) {
      if (node.getKey() === k) {
        return node.getEntry()
      }

      if (node.next!.isTail()) {
        node = node.bottom
        continue
      }

      if (node.next!.getKey()! > k) {
        node = node.bottom
        continue
      }

      node = node.next
    }
  }

  get length(): number {
    return this.len
  }

  insert(entry: E): E | undefined {
    let node: Node<T, E> = this.head
    while (node.hasBottom()) {
      if (node.getKey() === entry.key) {
        return node.setEntry(entry)
      }

      if (node.next?.hasValue() && node.next.getKey()! <= entry.key) {
        node = node.next
        continue
      }

      node = node.bottom
    }
    while (node.next?.hasValue() && node.next.getKey()! <= entry.key) {
      node = node.next
    }

    if (node.getKey() === entry.key) {
      return node.setEntry(entry)
    }

    this.len += 1
    const height = this.randomHeight()
    let prev: Node<T, E> = node
    let next: Node<T, E> = node.next!
    let bottom: Node<T, E> | null = null

    for (let i = 1; i <= height; i += 1) {
      const newNode = new Node<T, E>(entry)
      newNode.prev = prev
      prev.next = newNode
      newNode.next = next
      next.prev = newNode
      newNode.bottom = bottom
      if (!!bottom) {
        bottom.top = newNode
      }

      bottom = newNode
      while (!prev.top && prev.hasValue()) {
        prev = prev.prev
      }
      while (!next.top && next.hasValue()) {
        next = next.next
      }

      if (prev.top && next.top) {
        prev = prev.top
        next = next.top
        continue
      }

      const newHead = new Node<T, E>()
      const newTail = new Node<T, E>()
      newHead.next = newTail
      newTail.prev = newHead
      newHead.bottom = this.head
      newTail.bottom = this.tail
      this.head.top = newHead
      this.tail.top = newTail
      this.head = newHead
      this.tail = newTail
      prev.top = newHead
      next.top = newTail
      prev = newHead
      next = newTail
      this.height += 1
    }
  }

  *entries(): IterableIterator<E> {
    let node = this.head
    while (node.hasBottom()) {
      node = node.bottom
    }

    node = node.next!
    while (node.hasValue()) {
      yield node.getEntry()!
      node = node.next!
    }
  }

  *reverse(): IterableIterator<E> {
    let node = this.tail
    while (node.hasBottom()) {
      node = node.bottom
    }
    node = node.prev!
    while (node.hasValue()) {
      yield node.getEntry()!
      node = node.prev!
    }
  }

  *range(s: T, e: T): IterableIterator<E> {
    let node: Node<T, E> = this.head
    while (node.hasBottom()) {
      if (node.getKey() === s) {
        node = node.bottom
        continue
      }

      if (node.next?.hasValue() && node.next.getKey()! <= s) {
        node = node.next
        continue
      }

      node = node.bottom
    }

    while (node.getKey()! < s && node.next?.hasValue()) {
      node = node.next
    }

    while (node.getKey()! < e && node.next?.hasValue()) {
      yield node.getEntry()!
      node = node.next
    }
  }

  delete(k: T): E | undefined {
    let node: Node<T, E> | null = this.head
    let deleted: E | undefined
    while (!!node) {
      if (node.getKey() === k) {
        deleted ??= node.getEntry()
        node.prev!.next = node.next
        node.next!.prev = node.prev
        if (node.next!.isHead() && node.prev!.isTail()) {
          this.height -= 1
          node.prev.top!.bottom = node.prev.bottom
          node.next.top!.bottom = node.next.bottom
          if (node.prev.hasBottom()) {
            node.prev.bottom.top = node.prev.top
          }
          if (node.next.hasBottom()) {
            node.next.bottom.top = node.next.top
          }
        }
        node = node.bottom
        continue
      }

      if (node.next!.isTail()) {
        node = node.bottom
        continue
      }

      if (node.next!.getKey()! > k) {
        node = node.bottom
        continue
      }

      node = node.next
    }
    if (deleted) {
      this.len -= 1
    }
    return deleted
  }
}

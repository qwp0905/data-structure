interface Entry<T> {
  readonly key: T
}

class Node<T, E extends Entry<T>> {
  next: Node<T, E> | null = null
  bottom: Node<T, E> | null = null
  top: Node<T, E> | null = null
  prev: Node<T, E> | null = null
  constructor(readonly ref: Ref<T, E> | null = null) {}

  getKey() {
    return this.ref?.entry.key
  }

  getEntry() {
    return this.ref?.entry
  }

  setEntry(entry: E) {
    if (!this.ref) {
      return
    }
    const prev = this.ref.entry
    this.ref.entry = entry
    return prev
  }

  isEnd() {
    return !this.ref
  }

  isBottom() {
    return !this.bottom
  }
}

class Ref<T, E extends Entry<T>> {
  constructor(public entry: E) {}
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
    let height = 1
    while (height < this.height && Math.random() < 0.5) {
      height += 1
    }
    return height
  }

  print() {
    let node = this.head
    while (node.bottom) {
      node = node.bottom
    }

    const list: (T | undefined)[][] = []
    while (!!node) {
      for (let i = this.height - 1, c: Node<T, E> | null = node; i >= 0; i--, c = c?.top ?? null) {
        list[i] ??= []
        list[i].push(c?.getKey())
      }

      node = node.next!
    }
    console.log(list.map((e) => e.map((o) => `${o}   `.slice(0, 3)).join(" -> ")).join("\n"))
  }

  get(k: T): E | undefined {
    let node: Node<T, E> | null = this.head
    while (node) {
      if (node.getKey() === k) {
        return node.getEntry()
      }

      if (node.next!.isEnd()) {
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
    while (!node.isBottom() || !node.next?.isEnd()) {
      if (node.getKey() === entry.key) {
        return node.setEntry(entry)
      }

      if (!node.next!.isEnd() && node.next!.getKey()! <= entry.key) {
        node = node.next!
        continue
      }

      node = node.bottom!
    }
    if (node.getKey() === entry.key) {
      return node.setEntry(entry)
    }

    this.len += 1
    const height = this.randomHeight()
    let prev: Node<T, E> = node
    let next: Node<T, E> = node.next!
    let bottom: Node<T, E> | null = null
    const ref = new Ref(entry)
    for (let i = 1; i <= height; i += 1) {
      const newNode = new Node<T, E>(ref)
      newNode.prev = prev
      prev.next = newNode
      newNode.next = next
      next.prev = newNode
      newNode.bottom = bottom
      if (!!bottom) {
        bottom.top = newNode
      }

      bottom = newNode
      while (!prev.top && !prev.isEnd()) {
        prev = prev.prev!
      }
      while (!next.top && !next.isEnd()) {
        next = next.next!
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
    while (node.bottom) {
      node = node.bottom!
    }

    node = node.next!
    while (!node.isEnd()) {
      yield node.getEntry()!
      node = node.next!
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
        if (node.next!.isEnd() && node.prev!.isEnd()) {
          this.height -= 1
          node.prev!.top!.bottom = node.prev!.bottom
          node.next!.top!.bottom = node.next!.bottom
          if (node.prev!.bottom) {
            node.prev!.bottom!.top = node.prev!.top
          }
          if (node.next!.bottom) {
            node.next!.bottom!.top = node.next!.top
          }
        }
        node = node.bottom
        continue
      }

      if (node.next!.isEnd()) {
        node = node.bottom
        continue
      }

      if (node.next!.getKey()! > k) {
        node = node.bottom
        continue
      }

      node = node.next
    }
    return deleted
  }
}

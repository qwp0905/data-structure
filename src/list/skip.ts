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

  // print() {
  //   let node = this.head
  //   let h = this.height
  //   while (node) {
  //     let r = node
  //     const s = []
  //     while (r) {
  //       s.push(r.getKey() + "")
  //       r = r.next!
  //     }
  //     console.log(h--, s.join(" -> "))
  //     node = node.bottom!
  //   }
  // }

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
    const height = this.randomHeight()
    while (this.height <= height) {
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
      this.height += 1
    }

    const ref = new Ref(entry)

    let left: Node<T, E> | null = this.head.bottom
    let right: Node<T, E> | null = this.tail.bottom
    let top: Node<T, E> | null = null
    while (!!left && !!right) {
      while (!left.next!.isEnd() && left.next!.getKey()! <= ref.entry.key) {
        left = left.next!
      }

      while (!right.prev!.isEnd() && right.prev!.getKey()! >= ref.entry.key) {
        right = right.prev!
      }

      if (left.getKey() === ref.entry.key) {
        return left.setEntry(ref.entry)
      }

      if (right.getKey() === ref.entry.key) {
        return right.setEntry(ref.entry)
      }

      const newNode = new Node<T, E>(ref)
      newNode.prev = left
      left.next = newNode
      newNode.next = right
      right.prev = newNode
      newNode.top = top
      if (!!top) {
        top.bottom = newNode
      }

      top = newNode
      left = left.bottom
      right = right.bottom
    }
    this.len += 1
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
}

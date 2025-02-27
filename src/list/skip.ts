interface Entry<T> {
  readonly key: T
}

class Node<T, E extends Entry<T>> {
  next: Node<T, E> | null = null
  bottom: Node<T, E> | null = null
  top: Node<T, E> | null = null
  prev: Node<T, E> | null = null
  constructor(readonly tower: Tower<T, E> | null = null) {}

  getKey() {
    return this.tower?.entry.key
  }

  getEntry() {
    return this.tower?.entry
  }

  setEntry(entry: E) {
    if (!this.tower) {
      return
    }
    const prev = this.tower.entry
    this.tower.entry = entry
    return prev
  }

  isEnd() {
    return !this.tower
  }

  isBottom() {
    return !this.bottom
  }
}

class Tower<T, E extends Entry<T>> {
  constructor(public entry: E) {}
}

export class SkipList<T, E extends Entry<T> = Entry<T>> {
  private head = new Node<T, E>()
  private tail = new Node<T, E>()
  private height = 1
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

  insert(entry: E) {
    let node: Node<T, E> = this.head
    while (!!node.bottom || node.next!.getKey()! <= entry.key) {
      if (node.getKey() === entry.key) {
        return node.setEntry(entry)
      }

      if (!node.next!.isEnd() && node.next!.getKey()! <= entry.key) {
        node = node.next!
        continue
      }

      node = node.bottom!
    }

    const height = this.randomHeight()
    let prev: Node<T, E> = node
    let next: Node<T, E> = node.next!
    let bottom: Node<T, E> | null = null
    const tower = new Tower(entry)
    for (let i = 1; i <= height; i += 1) {
      const newNode = new Node<T, E>(tower)
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
}

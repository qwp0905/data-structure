import { LinkedList } from "./linked"

interface Entry<T> {
  readonly key: T
}

class SkipNode<T, E extends Entry<T>> {
  private next: SkipNode<T, E> | null = null
  private bottom: SkipNode<T, E> | null = null
  constructor(private entry: E | null = null) {}

  setNext(next: SkipNode<T, E> | null) {
    const prev = this.next
    this.next = next
    return prev
  }

  getKey() {
    return this.entry?.key
  }

  getEntry() {
    return this.entry ?? undefined
  }

  swapEntry(entry: E) {
    const prev = this.entry
    this.entry = entry
    return prev ?? undefined
  }

  getNext() {
    return this.next
  }

  isTail() {
    return !this.next
  }

  isHead() {
    return !this.entry
  }

  getBottom() {
    return this.bottom
  }

  setBottom(bottom: SkipNode<T, E> | null) {
    this.bottom = bottom
  }
}
export class SkipList<T, E extends Entry<T> = Entry<T>> {
  head = new SkipNode<T, E>()
  tail = new SkipNode<T, E>()
  private _height = 1
  private len = 0
  constructor(private readonly maxHeight: number = Infinity) {
    this.head.setNext(this.tail)
  }

  private randomHeight() {
    const max = Math.min(this.maxHeight, this._height)
    let height = 1
    while (height < max && Math.random() < 0.5) {
      height += 1
    }
    return height
  }

  get(k: T): E | undefined {
    let node: SkipNode<T, E> | null = this.head
    while (node) {
      if (node.getKey() === k) {
        return node.getEntry()
      }

      if (node.getNext()?.isTail()) {
        node = node.getBottom()
        continue
      }

      if (node.getNext()!.getKey()! > k) {
        node = node.getBottom()
        continue
      }

      node = node.getNext()
    }
  }

  get length(): number {
    return this.len
  }

  get height(): number {
    return this._height
  }

  insert(entry: E): E | undefined {
    const buffered = new LinkedList<SkipNode<T, E>>()
    let node: SkipNode<T, E> = this.head
    while (!!node.getBottom()) {
      if (node.getKey() === entry.key) {
        buffered.clear()
        return node.swapEntry(entry)
      }
      const next = node.getNext()!
      if (!next.isTail() && next.getKey()! <= entry.key) {
        node = next
        continue
      }

      buffered.pushBack(node)
      node = node.getBottom()!
    }

    while (!node.getNext()!.isTail() && node.getNext()!.getKey()! <= entry.key) {
      node = node.getNext()!
    }

    if (node.getKey() === entry.key) {
      buffered.clear()
      return node.swapEntry(entry)
    }

    buffered.pushBack(node)
    this.len += 1

    const height = this.randomHeight()
    while (buffered.length > height) {
      buffered.popFront()
    }

    if (height === this._height) {
      const newHead = new SkipNode<T, E>()
      const newTail = new SkipNode<T, E>()
      newHead.setNext(newTail)
      newHead.setBottom(this.head)
      newTail.setBottom(this.tail)
      this.head = newHead
      this.tail = newTail
      this._height += 1
    }

    let bottom: SkipNode<T, E> | null = null
    while (buffered.length > 0) {
      const prev = buffered.popBack()!
      const next = prev.getNext()!
      const newNode = new SkipNode<T, E>(entry)
      newNode.setNext(next)
      prev.setNext(newNode)
      newNode.setBottom(bottom)
      bottom = newNode
    }
  }

  remove(k: T): E | undefined {
    let node: SkipNode<T, E> = this.head
    let removed: E | undefined = undefined
    let bottom: SkipNode<T, E> | null = null
    while ((bottom = node.getBottom())) {
      let next = bottom.getNext()!
      while (!next.isTail() && next.getKey()! < k) {
        bottom = next
        next = next.getNext()!
      }
      if (next.getKey() !== k) {
        node = bottom
        continue
      }

      removed ??= next.getEntry()
      bottom.setNext(next.getNext())
      if (!bottom.isHead() || !next.getNext()!.isTail()) {
        node = bottom
        continue
      }

      node.setBottom(bottom.getBottom())
      node.getNext()!.setBottom(next.getNext())
      this._height -= 1
    }

    if (!removed) {
      return removed
    }

    this.len -= 1
    return removed
  }

  *entries(): IterableIterator<E> {
    let node = this.head
    let bottom: SkipNode<T, E> | null = null
    while ((bottom = node.getBottom())) {
      node = bottom
    }
    let next: SkipNode<T, E>
    while (!(next = node.getNext()!).isTail()) {
      yield next.getEntry()!
      node = next
    }
  }

  *range(s: T, e: T): IterableIterator<E> {
    let node = this.head
    let bottom: SkipNode<T, E> | null
    while ((bottom = node.getBottom())) {
      if (node.getKey() === s) {
        node = bottom
        continue
      }
      const next = node.getNext()!
      if (!next.isTail() && next.getKey()! <= s) {
        node = next
        continue
      }

      node = bottom
    }

    while (node.getKey()! < s && !node.getNext()?.isTail()) {
      node = node.getNext()!
    }

    while (node.getKey()! < e && !node.getNext()?.isTail()) {
      yield node.getEntry()!
      node = node.getNext()!
    }
  }
}

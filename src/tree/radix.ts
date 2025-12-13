const EMPTY = ""

class RadixNode<T> {
  public children: Map<string, RadixNode<T>> | null = null
  constructor(
    public key: string = EMPTY,
    public value: T | null = null
  ) {}

  shrink(): boolean {
    if (this.value !== null) {
      return false
    }
    if (this.key === EMPTY) {
      return false
    }
    if (!this.children) {
      return true
    }
    if (this.children.size > 1) {
      return false
    }

    const child = this.children.values().next().value!
    this.key += child.key
    this.children = child.children
    this.value = child.value
    return true
  }

  split(key: string) {
    this.key = this.key.slice(key.length)
    const node = new RadixNode<T>(key, null)
    node.children = new Map([[this.key[0], this]])
    return node
  }

  match(key: string, cursor: number): string {
    const min = Math.min(key.length - cursor, this.key.length)
    for (let i = 0; i < min; i += 1) {
      if (key[i + cursor] !== this.key[i]) {
        return key.slice(cursor, cursor + i)
      }
    }
    return key.slice(cursor, cursor + min)
  }

  isEmpty() {
    return this.value === null && this.children === null
  }
}

export class RadixTree<T> {
  private root: RadixNode<T> = new RadixNode<T>()
  constructor() {}

  get(key: string): T | undefined {
    let current = this.root as RadixNode<T>
    let cursor = 0
    while (cursor < key.length) {
      const prefix = key[cursor]
      const child = current.children?.get(prefix)
      if (!child || !key.startsWith(child.key, cursor)) {
        return
      }

      current = child
      cursor += child.key.length
    }

    return current.value ?? undefined
  }

  insert(key: string, value: T): T | undefined {
    let current = this.root as RadixNode<T>
    let cursor = 0
    while (cursor < key.length) {
      const prefix = key[cursor]
      const child = current.children?.get(prefix)
      if (!child) {
        current.children ??= new Map()
        current.children.set(prefix, (current = new RadixNode<T>(key.slice(cursor))))
        cursor = key.length
        continue
      }

      const match = child.match(key, cursor)
      cursor += match.length
      if (match === child.key) {
        current = child
        continue
      }

      current.children ??= new Map()
      current.children.set(prefix, (current = child.split(match)))
    }

    const prev = current.value
    current.value = value
    return prev ?? undefined
  }

  remove(key: string): T | undefined {
    let current = this.root as RadixNode<T>
    let cursor = 0
    const stack: [string, RadixNode<T>][] = []

    while (cursor < key.length) {
      const prefix = key[cursor]
      const child = current.children?.get(prefix)
      if (!child) {
        return
      }
      stack.push([prefix, current])
      current = child
      cursor += child.key.length
    }

    if (current.value === null) {
      return
    }

    const deleted = current.value
    current.value = null
    if (!current.shrink()) {
      return deleted
    }

    while (stack.length > 0) {
      const [prefix, parent] = stack.pop()!
      if (parent.children?.get(prefix)?.isEmpty()) {
        if (parent.children.delete(prefix) && parent.children.size === 0) {
          parent.children = null
        }
      }
      if (!parent.shrink()) {
        break
      }
    }

    return deleted
  }

  *entries(): Generator<[string, T]> {
    const stack: [string, RadixNode<T>][] = [[EMPTY, this.root]]
    while (stack.length > 0) {
      const [prefix, node] = stack.pop()!
      if (!node.value !== null) {
        yield [prefix, node.value!]
      }

      if (!node.children) {
        continue
      }
      for (const child of node.children.values()) {
        stack.push([prefix.concat(child.key), child])
      }
    }
  }
}

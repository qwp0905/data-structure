const EMPTY = ""

export class RadixTree<T> {
  private children: Map<string, RadixTree<T>>
  constructor(
    private key: string = "",
    private value: T | null = null,
    ...children: RadixTree<T>[]
  ) {
    this.children = new Map(children.map((c) => [c.key.at(0)!, c]))
  }

  get(key: string): T | undefined {
    let current = this as RadixTree<T>
    let remain = key
    while (remain !== EMPTY) {
      const prefix = remain.at(0)!
      const child = current.children.get(prefix)
      if (!child) {
        return
      }
      if (!remain.startsWith(child.key)) {
        return
      }

      remain = remain.slice(child.key.length)
      current = child
    }

    return current.value ?? undefined
  }

  insert(key: string, value: T): T | undefined {
    let current = this as RadixTree<T>
    let remain = key
    while (remain !== EMPTY) {
      const prefix = remain.at(0)!
      const child = current.children.get(prefix)
      if (!child) {
        current.children.set(prefix, (current = new RadixTree<T>(remain)))
        remain = EMPTY
        continue
      }

      const match = child.match(remain)
      if (match === child.key) {
        current = child
        remain = remain.slice(match.length)
        continue
      }

      current.children.set(prefix, (current = child.split(match)))
      remain = remain.slice(match.length)
    }

    const prev = current.value
    current.value = value
    return prev ?? undefined
  }

  remove(key: string): T | undefined {
    let current = this as RadixTree<T>
    let remain = key
    const stack: [string, RadixTree<T>][] = []

    while (remain !== EMPTY) {
      const prefix = remain.at(0)!
      const child = current.children.get(prefix)
      if (!child) {
        return
      }
      stack.push([prefix, current])
      current = child
      remain = remain.slice(child.key.length)
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
      if (current.children.size > 0 || current.value !== null) {
        return deleted
      }
      parent.children.delete(prefix)
      if (!parent.shrink()) {
        return deleted
      }
      current = parent
    }

    return deleted
  }

  shrink(): boolean {
    if (this.value !== null) {
      return false
    }
    if (this.children.size > 1) {
      return false
    }
    if (this.key === EMPTY) {
      return false
    }

    const [child] = Array.from(this.children.values())
    if (!child) {
      return true
    }

    this.key += child.key
    this.children = child.children
    this.value = child.value
    return true
  }

  private split(key: string) {
    this.key = this.key.slice(key.length)
    const node = new RadixTree<T>(key, null, this)
    return node
  }

  private match(key: string): string {
    const min = Math.min(key.length, this.key.length)
    for (let i = 0; i < min; i += 1) {
      if (key[i] !== this.key[i]) {
        return key.slice(0, i)
      }
    }
    return key.slice(0, min)
  }
}

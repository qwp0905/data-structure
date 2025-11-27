export class UnionFind {
  private readonly parent: number[]
  private readonly ranks: number[]
  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i)
    this.ranks = Array(size).fill(0)
  }

  find(x: number) {
    const stack: number[] = []
    let current = x
    while (current !== this.parent[current]) {
      stack.push(current)
      current = this.parent[current]
    }

    while (stack.length > 0) {
      this.parent[stack.pop()!] = current
    }

    return current
  }

  union(x: number, y: number) {
    const px = this.find(x)
    const py = this.find(y)

    if (px === py) {
      return
    }

    if (this.ranks[px] < this.ranks[py]) {
      this.parent[px] = py
      return
    }

    this.parent[py] = px
    if (this.ranks[px] > this.ranks[py]) {
      return
    }

    this.ranks[px] += 1
  }

  connected(x: number, y: number) {
    return this.find(x) === this.find(y)
  }
}

export class UnionFind {
  private readonly parent: number[]
  private readonly ranks: number[]
  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i)
    this.ranks = Array(size).fill(0)
  }

  find(x: number) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x])
    }

    return this.parent[x]
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

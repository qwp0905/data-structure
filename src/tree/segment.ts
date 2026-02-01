export class SegmentTree {
  private readonly table: number[]
  private readonly size: number
  constructor(data: number[]) {
    const size = data.length
    this.table = Array(size << 1)
    this.size = size
    for (let i = 0; i < size; i += 1) {
      this.table[size + i] = data[i]
    }
    for (let i = size - 1; i > 0; i -= 1) {
      const l = i << 1
      this.table[i] = this.table[l] + this.table[l | 1]
    }
  }

  query(a: number, b: number) {
    let s = 0
    for (let l = a + this.size, r = b + this.size; l <= r; l >>>= 1, r >>>= 1) {
      if (l & 1) {
        s += this.table[l++]
      }
      if (!(r & 1)) {
        s += this.table[r--]
      }
    }
    return s
  }

  update(i: number, v: number) {
    let c = i + this.size
    this.table[c] = v
    while (c > 1) {
      const p = c >>> 1
      this.table[p] = this.table[c] + this.table[c ^ 1]
      c = p
    }
  }
}

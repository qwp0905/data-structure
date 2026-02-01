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
      if (~r & 1) {
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

export class LazySegmentTree {
  private readonly size: number
  private readonly height: number
  private readonly table: number[]
  private readonly lazy: number[]

  constructor(data: number[]) {
    this.height = Math.ceil(Math.log2(data.length))
    this.size = 1 << this.height
    this.table = Array(this.size << 1).fill(0)
    this.lazy = Array(this.size).fill(0)

    for (let i = 0; i < this.size; i += 1) {
      this.table[this.size + i] = data[i]
    }
    for (let i = this.size - 1; i > 0; i -= 1) {
      this.pull(i)
    }
  }
  update(a: number, b: number, v: number) {
    const left = a + this.size
    const right = b + this.size
    for (let i = this.height; i > 0; i -= 1) {
      if ((left >>> i) << i !== left) {
        this.push(left >>> i, 1 << (i - 1))
      }
      if (((right + 1) >>> i) << i !== right + 1) {
        this.push(right >>> i, 1 << (i - 1))
      }
    }

    for (let l = left, r = right, k = 1; l <= r; l >>>= 1, r >>>= 1, k <<= 1) {
      if (l & 1) {
        this.apply(l++, v, k)
      }
      if (~r & 1) {
        this.apply(r--, v, k)
      }
    }

    for (let i = 1; i <= this.height; i += 1) {
      if ((left >>> i) << i !== left) {
        this.pull(left >>> i)
      }
      if (((right + 1) >>> i) << i !== right + 1) {
        this.pull(right >>> i)
      }
    }
  }
  query(a: number, b: number) {
    const left = a + this.size
    const right = b + this.size
    for (let i = this.height; i > 0; i -= 1) {
      if ((left >>> i) << i !== left) {
        this.push(left >>> i, 1 << (i - 1))
      }
      if (((right + 1) >>> i) << i !== right + 1) {
        this.push(right >>> i, 1 << (i - 1))
      }
    }

    let s = 0
    for (let l = left, r = right; l <= r; l >>>= 1, r >>>= 1) {
      if (l & 1) {
        s += this.table[l++]
      }
      if (~r & 1) {
        s += this.table[r--]
      }
    }
    return s
  }
  private apply(i: number, v: number, k: number) {
    this.table[i] += v * k
    if (i < this.size) {
      this.lazy[i] += v
    }
  }
  private push(i: number, k: number) {
    this.apply(i << 1, this.lazy[i], k)
    this.apply((i << 1) | 1, this.lazy[i], k)
    this.lazy[i] = 0
  }
  private pull(i: number) {
    this.table[i] = this.table[i << 1] + this.table[(i << 1) | 1]
  }
}

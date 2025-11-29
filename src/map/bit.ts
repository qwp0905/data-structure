const SHIFT = 5
const MAX_BIT = 1 << SHIFT
const MASK = MAX_BIT - 1

export class Bitmap {
  private readonly bits: Uint32Array
  private _size = 0

  constructor(capacity: number) {
    this.bits = new Uint32Array((capacity + MASK) >>> SHIFT)
  }

  add(bit: number) {
    const i = bit >>> SHIFT
    const b = bit & MASK
    if (i >= this.bits.length) {
      return false
    }
    const prev = this.bits[i]
    if (prev === (this.bits[i] |= 1 << b)) {
      return false
    }
    this._size += 1
    return true
  }

  has(bit: number) {
    const i = bit >>> SHIFT
    const b = bit & MASK
    if (i >= this.bits.length) {
      return false
    }
    return (this.bits[i] & (1 << b)) !== 0
  }

  del(bit: number) {
    const i = bit >>> SHIFT
    const b = bit & MASK
    if (i >= this.bits.length) {
      return false
    }
    const prev = this.bits[i]
    if (prev === (this.bits[i] &= ~(1 << b))) {
      return false
    }
    this._size -= 1
    return true
  }

  get size() {
    return this._size
  }

  *values() {
    for (let i = 0; i < this.bits.length; i += 1) {
      const shift = i << SHIFT
      let b = this.bits[i]

      while (b > 0) {
        const j = b & -b
        yield shift + MASK - Math.clz32(j)
        b = (b ^ j) >>> 0
      }
    }
  }
}

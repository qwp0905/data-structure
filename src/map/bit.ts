export class Bitmap {
  private readonly bits: Uint32Array
  private _size = 0

  constructor(capacity: number) {
    this.bits = new Uint32Array((capacity + 31) >>> 5)
  }

  private getPosition(bit: number) {
    return [bit >>> 5, bit & 31]
  }

  set(bit: number) {
    const [i, b] = this.getPosition(bit)
    if (i >= this.bits.length) {
      return false
    }
    const moved = this.bits[i] | (1 << b)
    if (moved === this.bits[i]) {
      return false
    }
    this._size += 1
    this.bits[i] = moved
    return true
  }

  has(bit: number) {
    const [i, b] = this.getPosition(bit)
    if (i >= this.bits.length) {
      return false
    }
    return (this.bits[i] & (1 << b)) !== 0
  }

  del(bit: number) {
    const [i, b] = this.getPosition(bit)
    if (i >= this.bits.length) {
      return false
    }
    const moved = this.bits[i] & ~(1 << b)
    if (moved === this.bits[i]) {
      return false
    }
    this._size -= 1
    this.bits[i] = moved
    return true
  }

  get size() {
    return this._size
  }
}

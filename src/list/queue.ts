export class Queue<T> {
  private readonly data: T[] = []
  private head = 0

  static from<T>(iterable?: Iterable<T>) {
    if (!iterable) {
      return new Queue()
    }
    const queue = new Queue()
    for (const v of iterable) {
      queue.push(v)
    }
    return queue
  }

  push = this.data.push.bind(this.data)

  pop() {
    const len = this.data.length
    if (this.head >= len) {
      this.data.length = 0
      this.head = 0
      return
    }

    const value = this.data[this.head++]
    if (len >>> 1 < this.head) {
      this.data.splice(0, this.head)
      this.head = 0
    }
    return value
  }
  get length() {
    return this.data.length - this.head
  }
  *reverse() {
    for (let i = this.data.length - 1; i >= this.head; i -= 1) {
      yield this.data[i]
    }
  }

  *values() {
    for (let i = this.head; i < this.data.length; i += 1) {
      yield this.data[i]
    }
  }
  [Symbol.iterator] = this.values
}

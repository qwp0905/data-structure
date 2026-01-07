export abstract class PriorityQueue<T> {
  private readonly heap: T[] = []
  constructor(iterable?: Iterable<T>) {
    if (!iterable) {
      return
    }

    for (const v of iterable) {
      this.push(v)
    }
  }

  get length(): number {
    return this.heap.length
  }

  protected abstract compare(a: T, b: T): number

  push(value: T): void {
    this.heap.push(value)
    let i = this.heap.length - 1
    let p: number
    while (i > 0 && this.compare(this.heap[(p = (i - 1) >>> 1)], value) < 0) {
      this.swap(i, (i = p))
    }
  }

  pop(): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }

    const last = this.heap.pop()!
    if (this.heap.length === 0) {
      return last
    }

    const root = this.heap[0]
    this.heap[0] = last
    let i = 0
    let left
    while ((left = (i << 1) + 1) < this.heap.length) {
      const right = left + 1
      let max = left
      if (right < this.heap.length && this.compare(this.heap[right], this.heap[left]) > 0) {
        max = right
      }
      if (this.compare(this.heap[i], this.heap[max]) >= 0) {
        break
      }
      this.swap(i, (i = max))
    }

    return root
  }

  peek(): T | undefined {
    return this.heap[0]
  }

  private swap(index1: number, index2: number): void {
    const temp = this.heap[index1]
    this.heap[index1] = this.heap[index2]
    this.heap[index2] = temp
  }
}

export class MinHeap extends PriorityQueue<number> {
  protected compare(a: number, b: number): number {
    return b - a
  }
}
export class MaxHeap extends PriorityQueue<number> {
  protected compare(a: number, b: number): number {
    return a - b
  }
}

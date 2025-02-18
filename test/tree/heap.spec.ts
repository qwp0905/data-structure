import { MaxHeap, MinHeap } from "../../src/tree/heap"

describe("MaxHeap", () => {
  let heap: MaxHeap
  beforeEach(() => {
    heap = new MaxHeap()
  })

  it("constructor", () => {
    heap = new MaxHeap([1, 2, 3, 4])
    expect(heap.length).toBe(4)
    expect(heap.pop()).toBe(4)
    expect(heap.pop()).toBe(3)
    expect(heap.pop()).toBe(2)
    expect(heap.pop()).toBe(1)
    expect(heap.pop()).toBeUndefined()
    expect(heap.length).toBe(0)
  })

  it("should push and pop", () => {
    heap.push(1)
    heap.push(2)
    heap.push(3)
    heap.push(4)
    expect(heap.pop()).toBe(4)
    expect(heap.pop()).toBe(3)
    expect(heap.pop()).toBe(2)
    expect(heap.pop()).toBe(1)
    expect(heap.pop()).toBeUndefined()
    expect(heap.length).toBe(0)
  })

  it("should push and pop", () => {
    heap.push(4)
    heap.push(3)
    heap.push(2)
    heap.push(1)
    expect(heap.pop()).toBe(4)
    expect(heap.pop()).toBe(3)
    expect(heap.pop()).toBe(2)
    expect(heap.pop()).toBe(1)
    expect(heap.pop()).toBeUndefined()
    expect(heap.length).toBe(0)
  })

  it("should push and pop", () => {
    for (let i = 1000; i > 0; i--) {
      heap.push(i)
    }
    expect(heap.length).toBe(1000)
    expect(heap.peek()).toBe(1000)
    for (let i = 1000; i > 0; i--) {
      expect(heap.pop()).toBe(i)
    }
  })

  it("should push and pop", () => {
    for (let i = 1; i <= 1000; i++) {
      heap.push(i)
    }
    expect(heap.length).toBe(1000)
    expect(heap.peek()).toBe(1000)
    for (let i = 1000; i > 0; i--) {
      expect(heap.pop()).toBe(i)
    }
  })
})

describe("MinHeap", () => {
  let heap: MinHeap
  beforeEach(() => {
    heap = new MinHeap()
  })

  it("should push and pop", () => {
    heap.push(1)
    heap.push(2)
    heap.push(3)
    heap.push(4)
    expect(heap.pop()).toBe(1)
    expect(heap.pop()).toBe(2)
    expect(heap.pop()).toBe(3)
    expect(heap.pop()).toBe(4)
    expect(heap.pop()).toBeUndefined()
    expect(heap.length).toBe(0)
  })

  it("should push and pop", () => {
    heap.push(4)
    heap.push(3)
    heap.push(2)
    heap.push(1)
    expect(heap.pop()).toBe(1)
    expect(heap.pop()).toBe(2)
    expect(heap.pop()).toBe(3)
    expect(heap.pop()).toBe(4)
    expect(heap.pop()).toBeUndefined()
    expect(heap.length).toBe(0)
  })

  it("should push and pop", () => {
    for (let i = 1000; i > 0; i--) {
      heap.push(i)
    }
    expect(heap.length).toBe(1000)
    expect(heap.peek()).toBe(1)
    for (let i = 1; i <= 1000; i++) {
      expect(heap.pop()).toBe(i)
    }
  })

  it("should push and pop", () => {
    for (let i = 1; i <= 1000; i++) {
      heap.push(i)
    }
    expect(heap.length).toBe(1000)
    expect(heap.peek()).toBe(1)
    for (let i = 1; i <= 1000; i++) {
      expect(heap.pop()).toBe(i)
    }
  })
})

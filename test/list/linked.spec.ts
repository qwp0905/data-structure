import { LinkedList } from "../../src/list/linked"

describe("Linked List", () => {
  let list: LinkedList<number>

  beforeEach(() => {
    list = new LinkedList()
  })

  it("should be empty when created", () => {
    expect(list.length).toBe(0)
  })

  it("should push a node to the back", () => {
    list.pushBack(1)
    expect(list.length).toBe(1)
    expect(list.peekBack()).toBe(1)
    expect(list.peekFront()).toBe(1)

    for (let i = 0; i < 10; i++) {
      list.pushBack(i)
      expect(list.length).toBe(i + 2)
      expect(list.peekBack()).toBe(i)
      expect(list.peekFront()).toBe(1)
    }
  })

  it("should pop a node from the back", () => {
    expect(list.popBack()).toBeUndefined()

    list.pushBack(1)
    expect(list.popBack()).toBe(1)
    expect(list.length).toBe(0)
    expect(list.popBack()).toBeUndefined()

    for (let i = 0; i < 10; i++) {
      list.pushBack(i)
    }

    for (let i = 9; i >= 0; i--) {
      expect(list.popBack()).toBe(i)
      expect(list.length).toBe(i)
    }
    expect(list.length).toBe(0)
  })

  it("should push a node to the front", () => {
    list.pushFront(1)
    expect(list.length).toBe(1)
    expect(list.peekBack()).toBe(1)
    expect(list.peekFront()).toBe(1)

    for (let i = 0; i < 10; i++) {
      list.pushFront(i)
      expect(list.length).toBe(i + 2)
      expect(list.peekFront()).toBe(i)
      expect(list.peekBack()).toBe(1)
    }
  })

  it("should pop a node from the front", () => {
    expect(list.popFront()).toBeUndefined()

    list.pushFront(1)
    expect(list.popFront()).toBe(1)
    expect(list.length).toBe(0)
    expect(list.popFront()).toBeUndefined()

    for (let i = 0; i < 10; i++) {
      list.pushFront(i)
    }

    for (let i = 9; i >= 0; i--) {
      expect(list.popFront()).toBe(i)
      expect(list.length).toBe(i)
    }
    expect(list.length).toBe(0)
  })

  it("should iterate through the list", () => {
    const nodes: number[] = []
    for (let i = 0; i < 10; i++) {
      nodes.push(i)
      list.pushBack(nodes[i])
    }

    let i = 0
    for (const node of list) {
      expect(node).toBe(nodes[i++])
    }
  })
})

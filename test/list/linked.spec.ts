import { LinkedList, LinkedNode } from "../../src/list/linked"

describe("Linked List", () => {
  let list: LinkedList<number>

  beforeEach(() => {
    list = new LinkedList()
  })

  it("should be empty when created", () => {
    expect(list.length).toBe(0)
  })

  it("should push a node to the back", () => {
    list.pushBack(new LinkedNode(1))
    expect(list.length).toBe(1)
    expect(list.peekBack()?.value).toBe(1)
    expect(list.peekFront()?.value).toBe(1)

    for (let i = 0; i < 10; i++) {
      list.pushBack(new LinkedNode(i))
      expect(list.length).toBe(i + 2)
      expect(list.peekBack()?.value).toBe(i)
      expect(list.peekFront()?.value).toBe(1)
    }
  })

  it("should pop a node from the back", () => {
    expect(list.popBack()).toBeUndefined()

    list.pushBack(new LinkedNode(1))
    expect(list.popBack()?.value).toBe(1)
    expect(list.length).toBe(0)
    expect(list.popBack()).toBeUndefined()

    for (let i = 0; i < 10; i++) {
      list.pushBack(new LinkedNode(i))
    }

    for (let i = 9; i >= 0; i--) {
      expect(list.popBack()?.value).toBe(i)
      expect(list.length).toBe(i)
    }
    expect(list.length).toBe(0)
  })

  it("should move a node to the back", () => {
    const node = new LinkedNode(1)
    list.pushBack(node)
    for (let i = 10; i < 20; i++) {
      list.pushBack(new LinkedNode(i))
      expect(list.peekBack()?.value).toBe(i)
    }

    list.moveBack(node)
    expect(list.peekBack()?.value).toBe(1)
    expect(list.popBack()?.value).toBe(1)
    expect(list.length).toBe(10)
    expect(list.peekBack()?.value).toBe(19)
  })

  it("should push a node to the front", () => {
    list.pushFront(new LinkedNode(1))
    expect(list.length).toBe(1)
    expect(list.peekBack()?.value).toBe(1)
    expect(list.peekFront()?.value).toBe(1)

    for (let i = 0; i < 10; i++) {
      list.pushFront(new LinkedNode(i))
      expect(list.length).toBe(i + 2)
      expect(list.peekFront()?.value).toBe(i)
      expect(list.peekBack()?.value).toBe(1)
    }
  })

  it("should pop a node from the front", () => {
    expect(list.popFront()).toBeUndefined()

    list.pushFront(new LinkedNode(1))
    expect(list.popFront()?.value).toBe(1)
    expect(list.length).toBe(0)
    expect(list.popFront()).toBeUndefined()

    for (let i = 0; i < 10; i++) {
      list.pushFront(new LinkedNode(i))
    }

    for (let i = 9; i >= 0; i--) {
      expect(list.popFront()?.value).toBe(i)
      expect(list.length).toBe(i)
    }
    expect(list.length).toBe(0)
  })

  it("should move a node to the front", () => {
    const node = new LinkedNode(1)
    list.pushFront(node)
    for (let i = 10; i < 20; i++) {
      list.pushFront(new LinkedNode(i))
      expect(list.peekFront()?.value).toBe(i)
    }

    list.moveFront(node)
    expect(list.peekFront()?.value).toBe(1)
    expect(list.popFront()?.value).toBe(1)
    expect(list.length).toBe(10)
    expect(list.peekFront()?.value).toBe(19)
  })

  it("should remove a node", () => {
    const node = new LinkedNode(1)
    list.pushFront(node)
    expect(list.length).toBe(1)
    expect(list.remove(node)).toBe(node)
    expect(list.length).toBe(0)
    expect(list.remove(node)).toBeUndefined()

    for (let i = 0; i < 10; i++) {
      list.pushFront(new LinkedNode(i))
    }

    for (let i = 0; i < 10; i++) {
      const node = list.peekFront()
      expect(list.remove(node!)).toBe(node)
      expect(list.length).toBe(9 - i)
    }
    expect(list.length).toBe(0)
  })

  it("should iterate through the list", () => {
    const nodes: LinkedNode<number>[] = []
    for (let i = 0; i < 10; i++) {
      nodes.push(new LinkedNode(i))
      list.pushBack(nodes[i])
    }

    let i = 0
    for (const node of list) {
      expect(node).toBe(nodes[i++])
    }
  })

  it("should iterate through the list when removing nodes", () => {
    const nodes: LinkedNode<number>[] = []
    for (let i = 0; i < 100; i++) {
      nodes.push(new LinkedNode(i))
      list.pushBack(nodes[i])
    }

    const removed = [1, 2, 3, 6, 39, 49]
    for (const i of removed) {
      list.remove(nodes[i])
      nodes.splice(i, 1)
    }

    for (const node of list) {
      expect(node).toBe(nodes.shift())
    }
  })
})

import { AVLTree } from "../../src/tree/avl"

describe("AVL Tree", () => {
  let tree: AVLTree<number>

  beforeEach(() => {
    tree = new AVLTree()
  })

  it("should insert elements", () => {
    tree.insert({ key: 10 })
    tree.insert({ key: 20 })
    tree.insert({ key: 30 })
    tree.insert({ key: 15 })
    tree.insert({ key: 25 })

    expect(tree.get(10)).toEqual({ key: 10 })
    expect(tree.get(20)).toEqual({ key: 20 })
    expect(tree.get(30)).toEqual({ key: 30 })
    expect(tree.get(15)).toEqual({ key: 15 })
    expect(tree.get(25)).toEqual({ key: 25 })
    expect(tree.get(5)).toBeUndefined()
    expect(tree.get(35)).toBeUndefined()
  })

  it("should delete elements", () => {
    tree.insert({ key: 10 })
    tree.insert({ key: 20 })
    tree.insert({ key: 30 })
    tree.insert({ key: 15 })
    tree.insert({ key: 25 })

    tree.remove(15)
    tree.remove(30)
    tree.remove(10)

    expect(tree.get(10)).toBeUndefined()
    expect(tree.get(20)).toEqual({ key: 20 })
    expect(tree.get(30)).toBeUndefined()
    expect(tree.get(15)).toBeUndefined()
    expect(tree.get(25)).toEqual({ key: 25 })
  })

  it("should insert and delete elements", () => {
    tree.insert({ key: 10 })
    tree.insert({ key: 20 })
    tree.insert({ key: 30 })
    tree.insert({ key: 15 })
    tree.insert({ key: 25 })

    tree.remove(15)
    tree.remove(30)
    tree.remove(10)
    tree.insert({ key: 5 })
    tree.insert({ key: 35 })

    expect(tree.get(10)).toBeUndefined()
    expect(tree.get(20)).toEqual({ key: 20 })
    expect(tree.get(30)).toBeUndefined()
    expect(tree.get(15)).toBeUndefined()
    expect(tree.get(25)).toEqual({ key: 25 })
    expect(tree.get(5)).toEqual({ key: 5 })
    expect(tree.get(35)).toEqual({ key: 35 })
  })

  it("should iterate over range", () => {
    tree.insert({ key: 10 })
    tree.insert({ key: 20 })
    tree.insert({ key: 30 })
    tree.insert({ key: 15 })
    tree.insert({ key: 25 })

    const keys = []
    for (const entry of tree.range(15, 25)) {
      keys.push(entry.key)
    }

    expect(keys).toEqual([15, 20])
  })

  it("should iterate over elements", () => {
    tree.insert({ key: 10 })
    tree.insert({ key: 20 })
    tree.insert({ key: 30 })
    tree.insert({ key: 15 })
    tree.insert({ key: 25 })

    const keys = []
    for (const entry of tree) {
      keys.push(entry.key)
    }

    expect(keys).toEqual([10, 15, 20, 25, 30])
  })

  it("should clear elements", () => {
    tree.insert({ key: 10 })
    tree.insert({ key: 20 })
    tree.insert({ key: 30 })
    tree.insert({ key: 15 })
    tree.insert({ key: 25 })

    tree.clear()

    expect(tree.get(10)).toBeUndefined()
    expect(tree.get(20)).toBeUndefined()
    expect(tree.get(30)).toBeUndefined()
    expect(tree.get(15)).toBeUndefined()
    expect(tree.get(25)).toBeUndefined()
  })

  it("should return length", () => {
    expect(tree.length).toBe(0)

    tree.insert({ key: 10 })
    tree.insert({ key: 20 })
    tree.insert({ key: 30 })
    tree.insert({ key: 15 })
    tree.insert({ key: 25 })

    expect(tree.length).toBe(5)

    tree.remove(15)
    tree.remove(30)
    tree.remove(10)

    expect(tree.length).toBe(2)

    tree.clear()

    expect(tree.length).toBe(0)
  })

  it("should return undefined when getting from empty tree", () => {
    expect(tree.get(10)).toBeUndefined()
  })

  it("should return undefined when deleting from empty tree", () => {
    expect(tree.remove(10)).toBeUndefined()
    expect(tree.remove(20)).toBeUndefined()
    expect(tree.length).toBe(0)
  })

  it("should return sorted elements", () => {
    const keys = Array.from(
      new Set(
        Array(100)
          .fill(null)
          .map(() => Math.random() * 10000)
      )
    )

    for (const key of keys) {
      tree.insert({ key })
    }

    const sorted = keys.sort((a, b) => a - b).map((key) => ({ key }))
    expect(Array.from(tree.entries())).toEqual(sorted)
  })
})

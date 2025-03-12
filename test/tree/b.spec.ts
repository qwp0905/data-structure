import { BTree, DefaultEntry } from "../../src/tree/b"

let tree: BTree<number>

function test() {
  it("should insert and get", () => {
    tree.insert(new DefaultEntry(1))
    tree.insert(new DefaultEntry(2))
    tree.insert(new DefaultEntry(3))
    expect(tree.get(1)?.key).toBe(1)
    expect(tree.get(2)?.key).toBe(2)
    expect(tree.get(3)?.key).toBe(3)
  })

  it("should delete", () => {
    tree.insert(new DefaultEntry(1))
    tree.insert(new DefaultEntry(2))
    tree.insert(new DefaultEntry(3))
    expect(tree.remove(2)?.key).toBe(2)
    expect(tree.get(2)?.key).toBeUndefined()
  })

  it("should return undefined if not found", () => {
    expect(tree.get(1)?.key).toBeUndefined()
    expect(tree.remove(1)).toBeUndefined()
  })

  it("should return true if has", () => {
    tree.insert(new DefaultEntry(1))
    expect(tree.has(1)).toBe(true)
  })

  it("should return false if not has", () => {
    expect(tree.has(1)).toBe(false)
  })

  it("should insert and split", () => {
    tree.insert(new DefaultEntry(1))
    tree.insert(new DefaultEntry(2))
    tree.insert(new DefaultEntry(3))
    tree.insert(new DefaultEntry(4))
    tree.insert(new DefaultEntry(5))
    tree.insert(new DefaultEntry(6))
    expect(tree.get(1)?.key).toBe(1)
    expect(tree.get(2)?.key).toBe(2)
    expect(tree.get(3)?.key).toBe(3)
    expect(tree.get(4)?.key).toBe(4)
    expect(tree.get(5)?.key).toBe(5)
    expect(tree.get(6)?.key).toBe(6)
  })

  it("should insert and split and delete", () => {
    tree.insert(new DefaultEntry(1))
    tree.insert(new DefaultEntry(2))
    tree.insert(new DefaultEntry(3))
    tree.insert(new DefaultEntry(4))
    tree.insert(new DefaultEntry(5))
    tree.insert(new DefaultEntry(6))
    tree.remove(3)
    tree.remove(4)
    expect(tree.get(1)?.key).toBe(1)
    expect(tree.get(2)?.key).toBe(2)
    expect(tree.get(3)?.key).toBeUndefined()
    expect(tree.get(4)?.key).toBeUndefined()
    expect(tree.get(5)?.key).toBe(5)
    expect(tree.get(6)?.key).toBe(6)
  })

  it("should insert and split and delete many times", () => {
    const tobeDelete = [1, 5, 7, 4, 8, 10, 45, 99]
    for (let i = 100; i > 0; i--) {
      tree.insert(new DefaultEntry(i))
    }

    for (const e of tobeDelete) {
      tree.remove(e)
    }

    for (let i = 1; i < 100; i++) {
      if (tobeDelete.includes(i)) {
        expect(tree.get(i)).toBeUndefined()
      } else {
        expect(tree.get(i)?.key).toBe(i)
      }
    }
  })
}

describe("BTree", () => {
  describe("degree 3", () => {
    beforeEach(() => {
      tree = new BTree<number>(3)
    })

    test()
  })

  describe("degree 4", () => {
    beforeEach(() => {
      tree = new BTree<number>(4)
    })

    test()
  })

  describe("degree 10", () => {
    beforeEach(() => {
      tree = new BTree<number>(10)
    })

    test()
  })
})

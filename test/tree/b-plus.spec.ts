import { BPlusTree, DefaultEntry } from "../../src/tree/b-plus"

let tree: BPlusTree<number>
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
    expect(tree.delete(2)?.key).toBe(2)
    expect(tree.get(2)).toBeUndefined()
  })

  it("should return undefined if not found", () => {
    expect(tree.get(1)).toBeUndefined()
    expect(tree.delete(1)).toBeUndefined()
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
    tree.delete(3)
    tree.delete(4)
    expect(tree.get(1)?.key).toBe(1)
    expect(tree.get(2)?.key).toBe(2)
    expect(tree.get(3)).toBeUndefined()
    expect(tree.get(4)).toBeUndefined()
    expect(tree.get(5)?.key).toBe(5)
    expect(tree.get(6)?.key).toBe(6)
  })

  it("should insert and split and delete and insert", () => {
    tree.insert(new DefaultEntry(1))
    tree.insert(new DefaultEntry(2))
    tree.insert(new DefaultEntry(3))
    tree.insert(new DefaultEntry(4))
    tree.insert(new DefaultEntry(5))
    tree.insert(new DefaultEntry(6))
    tree.delete(3)
    tree.delete(4)
    tree.insert(new DefaultEntry(3))
    tree.insert(new DefaultEntry(4))
    expect(tree.get(1)?.key).toBe(1)
    expect(tree.get(2)?.key).toBe(2)
    expect(tree.get(3)?.key).toBe(3)
    expect(tree.get(4)?.key).toBe(4)
    expect(tree.get(5)?.key).toBe(5)
    expect(tree.get(6)?.key).toBe(6)
  })

  it("should insert and split and delete and insert and delete", () => {
    tree.insert(new DefaultEntry(1))
    tree.insert(new DefaultEntry(2))
    tree.insert(new DefaultEntry(3))
    tree.insert(new DefaultEntry(4))
    tree.insert(new DefaultEntry(5))
    tree.insert(new DefaultEntry(6))
    tree.delete(3)
    tree.delete(4)
    tree.insert(new DefaultEntry(3))
    tree.insert(new DefaultEntry(4))
    tree.delete(3)
    tree.delete(4)
    expect(tree.get(1)?.key).toBe(1)
    expect(tree.get(2)?.key).toBe(2)
    expect(tree.get(3)).toBeUndefined()
    expect(tree.get(4)).toBeUndefined()
    expect(tree.get(5)?.key).toBe(5)
    expect(tree.get(6)?.key).toBe(6)
  })

  it("should insert and split and delete many times", () => {
    const tobeDelete = [1, 5, 7, 4, 8, 10, 45, 99]
    for (let i = 100; i > 0; i--) {
      tree.insert(new DefaultEntry(i))
    }

    for (const e of tobeDelete) {
      tree.delete(e)
    }

    for (let i = 1; i < 100; i++) {
      if (tobeDelete.includes(i)) {
        expect(tree.get(i)).toBeUndefined()
      } else {
        expect(tree.get(i)?.key).toBe(i)
      }
    }
  })

  it("should range", () => {
    tree.insert(new DefaultEntry(1))
    tree.insert(new DefaultEntry(2))
    tree.insert(new DefaultEntry(3))
    tree.insert(new DefaultEntry(4))
    tree.insert(new DefaultEntry(5))
    tree.insert(new DefaultEntry(6))
    const result = [...tree.range(3, 5)]
    expect(result).toHaveLength(2)
    expect(result[0].key).toBe(3)
    expect(result[1].key).toBe(4)
  })

  it("should iterate", () => {
    tree.insert(new DefaultEntry(1))
    tree.insert(new DefaultEntry(2))
    tree.insert(new DefaultEntry(3))
    tree.insert(new DefaultEntry(4))
    tree.insert(new DefaultEntry(5))
    tree.insert(new DefaultEntry(6))
    const result = [...tree.entries()]
    expect(result).toHaveLength(6)
    expect(result[0].key).toBe(1)
    expect(result[1].key).toBe(2)
    expect(result[2].key).toBe(3)
    expect(result[3].key).toBe(4)
    expect(result[4].key).toBe(5)
    expect(result[5].key).toBe(6)
  })

  it("should iterate in order", () => {
    tree.insert(new DefaultEntry(3))
    tree.insert(new DefaultEntry(1))
    tree.insert(new DefaultEntry(2))
    tree.insert(new DefaultEntry(6))
    tree.insert(new DefaultEntry(5))
    tree.insert(new DefaultEntry(4))
    const result = [...tree.entries()]
    expect(result).toHaveLength(6)
    expect(result[0].key).toBe(1)
    expect(result[1].key).toBe(2)
    expect(result[2].key).toBe(3)
    expect(result[3].key).toBe(4)
    expect(result[4].key).toBe(5)
    expect(result[5].key).toBe(6)
  })

  it("should iterate in order with range", () => {
    tree.insert(new DefaultEntry(3))
    tree.insert(new DefaultEntry(1))
    tree.insert(new DefaultEntry(2))
    tree.insert(new DefaultEntry(6))
    tree.insert(new DefaultEntry(5))
    tree.insert(new DefaultEntry(4))
    const result = [...tree.range(2, 5)]
    expect(result).toHaveLength(3)
    expect(result[0].key).toBe(2)
    expect(result[1].key).toBe(3)
    expect(result[2].key).toBe(4)
  })
}

describe("BPlusTree", () => {
  describe("degree 3", () => {
    beforeEach(() => {
      tree = new BPlusTree<number>()
    })

    test()
  })

  describe("degree 5", () => {
    beforeEach(() => {
      tree = new BPlusTree<number>(5)
    })

    test()
  })

  describe("degree 4", () => {
    beforeEach(() => {
      tree = new BPlusTree<number>(4)
    })

    test()
  })
})

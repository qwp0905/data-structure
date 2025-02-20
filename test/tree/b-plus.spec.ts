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

  it("should iterate in order 2", () => {
    for (let i = 100; i > 0; i -= 2) {
      tree.insert(new DefaultEntry(i))
    }

    expect(tree.delete(56)?.key).toBe(56)
    expect(tree.delete(32)?.key).toBe(32)
    expect(tree.delete(96)?.key).toBe(96)

    const result = [...tree.entries()]
    expect(result).toHaveLength(47)
    expect(result.map((e) => e.key)).toEqual([
      2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 34, 36, 38, 40, 42, 44, 46, 48, 50,
      52, 54, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94, 98, 100
    ])
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

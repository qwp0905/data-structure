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

  it("should insert and overwrite", () => {
    class E {
      constructor(
        public key: number,
        public value: string
      ) {}
    }
    tree.insert(new E(1, "a"))
    tree.insert(new E(1, "b"))
    expect(tree.get(1)).toEqual(new E(1, "b"))
  })

  it("should delete", () => {
    tree.insert(new DefaultEntry(1))
    tree.insert(new DefaultEntry(2))
    tree.insert(new DefaultEntry(3))
    expect(tree.delete(2)?.key).toBe(2)
    expect(tree.get(2)).toBeUndefined()
  })

  it("should delete and return undefined if not found", () => {
    tree.insert(new DefaultEntry(1))
    tree.insert(new DefaultEntry(2))
    tree.insert(new DefaultEntry(3))
    tree.insert(new DefaultEntry(4))
    tree.insert(new DefaultEntry(5))
    tree.insert(new DefaultEntry(6))
    tree.insert(new DefaultEntry(7))
    tree.insert(new DefaultEntry(8))
    tree.insert(new DefaultEntry(9))
    tree.insert(new DefaultEntry(10))

    expect(tree.delete(2323)).toBeUndefined()
    expect(tree.get(2323)).toBeUndefined()
    expect(tree.delete(45364)).toBeUndefined()
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

  it("should return false if not has after delete", () => {
    tree.insert(new DefaultEntry(1))
    tree.insert(new DefaultEntry(100))
    tree.insert(new DefaultEntry(50))
    tree.insert(new DefaultEntry(25))
    tree.insert(new DefaultEntry(75))
    tree.insert(new DefaultEntry(150))
    tree.insert(new DefaultEntry(125))
    tree.insert(new DefaultEntry(175))
    tree.delete(100)
    tree.delete(50)
    tree.delete(25)
    tree.delete(75)
    expect(tree.has(100)).toBe(false)
    expect(tree.has(50)).toBe(false)
    expect(tree.has(25)).toBe(false)
    expect(tree.has(75)).toBe(false)
    expect(tree.has(1)).toBe(true)
    expect(tree.has(150)).toBe(true)
    expect(tree.has(125)).toBe(true)
    expect(tree.has(175)).toBe(true)
    expect(tree.length).toBe(4)
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

  it("should borrow from left when delete", () => {
    tree.insert(new DefaultEntry(11))
    tree.insert(new DefaultEntry(10))
    tree.insert(new DefaultEntry(9))
    tree.insert(new DefaultEntry(8))
    tree.insert(new DefaultEntry(7))
    tree.insert(new DefaultEntry(6))
    tree.insert(new DefaultEntry(5))
    tree.insert(new DefaultEntry(4))
    tree.insert(new DefaultEntry(3))
    tree.insert(new DefaultEntry(2))
    tree.insert(new DefaultEntry(1))
    tree.delete(9)
    tree.delete(8)
    tree.delete(6)
    tree.delete(7)
    tree.insert(new DefaultEntry(9))
    tree.insert(new DefaultEntry(8))
    tree.delete(11)

    expect(tree.get(1)?.key).toBe(1)
    expect(tree.get(2)?.key).toBe(2)
    expect(tree.get(3)?.key).toBe(3)
    expect(tree.get(4)?.key).toBe(4)
    expect(tree.get(5)?.key).toBe(5)
    expect(tree.get(6)).toBeUndefined()
    expect(tree.get(7)).toBeUndefined()
    expect(tree.get(8)?.key).toBe(8)
    expect(tree.get(9)?.key).toBe(9)
    expect(tree.get(10)?.key).toBe(10)
    expect(tree.get(11)).toBeUndefined()
  })

  it("should borrow from right when delete", () => {
    tree.insert(new DefaultEntry(1))
    tree.insert(new DefaultEntry(2))
    tree.insert(new DefaultEntry(3))
    tree.insert(new DefaultEntry(4))
    tree.insert(new DefaultEntry(5))
    tree.insert(new DefaultEntry(6))
    tree.insert(new DefaultEntry(7))
    tree.insert(new DefaultEntry(8))
    tree.insert(new DefaultEntry(9))
    tree.insert(new DefaultEntry(10))
    tree.insert(new DefaultEntry(11))
    tree.delete(3)
    tree.delete(1)
    tree.delete(10)
    tree.delete(11)
    expect(tree.get(1)).toBeUndefined()
    expect(tree.get(2)?.key).toBe(2)
    expect(tree.get(3)).toBeUndefined()
    expect(tree.get(4)?.key).toBe(4)
    expect(tree.get(5)?.key).toBe(5)
    expect(tree.get(6)?.key).toBe(6)
    expect(tree.get(7)?.key).toBe(7)
    expect(tree.get(8)?.key).toBe(8)
    expect(tree.get(9)?.key).toBe(9)
    expect(tree.get(10)).toBeUndefined()
    expect(tree.get(11)).toBeUndefined()
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

  it("should range 2", () => {
    tree.insert(new DefaultEntry(1))
    tree.insert(new DefaultEntry(2))
    tree.insert(new DefaultEntry(3))
    tree.insert(new DefaultEntry(4))
    tree.insert(new DefaultEntry(5))
    tree.insert(new DefaultEntry(6))
    const result = [...tree.range(2, 10)]
    expect(result).toHaveLength(5)
    expect(result[0].key).toBe(2)
    expect(result[1].key).toBe(3)
    expect(result[2].key).toBe(4)
    expect(result[3].key).toBe(5)
    expect(result[4].key).toBe(6)
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

  it("should iterate in order with range 2", () => {
    for (let i = 100; i > 0; i -= 2) {
      tree.insert(new DefaultEntry(i))
    }

    expect(tree.delete(56)?.key).toBe(56)
    expect(tree.delete(32)?.key).toBe(32)
    expect(tree.delete(96)?.key).toBe(96)

    const result = [...tree.range(30, 70)]
    expect(result).toHaveLength(18)
    expect(result.map((e) => e.key)).toEqual([
      30, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 58, 60, 62, 64, 66, 68
    ])
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

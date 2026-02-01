import { SegmentTree } from "../../src/tree/segment"

describe("SegmentTree", () => {
  let tree: SegmentTree

  it("should query", () => {
    tree = new SegmentTree([1, 3, 5, 7, 9, 11])
    expect(tree.query(1, 3)).toBe(15)
    expect(tree.query(0, 5)).toBe(36)
    expect(tree.query(2, 4)).toBe(21)
  })

  it("should update", () => {
    tree = new SegmentTree([1, 3, 5, 7, 9, 11])
    tree.update(1, 10)
    expect(tree.query(1, 3)).toBe(22)
    expect(tree.query(0, 5)).toBe(43)
    tree.update(4, 0)
    expect(tree.query(0, 5)).toBe(34)
  })
})

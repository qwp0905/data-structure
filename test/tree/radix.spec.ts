import { RadixTree } from "../../src/tree/radix"

describe("RadixTree", () => {
  let tree: RadixTree<string>

  beforeEach(() => {
    tree = new RadixTree()
  })

  it("should insert and get", () => {
    tree.insert("abcbbc", "abcbbc")
    tree.insert("abcsdf", "abcsdf")
    tree.insert("accbbc", "accbbc")
    expect(tree.get("abcbbc")).toBe("abcbbc")
    expect(tree.get("abcsdf")).toBe("abcsdf")
    expect(tree.get("accbbc")).toBe("accbbc")
    expect(tree.get("abobbc")).toBeUndefined()
    expect(tree.get("abcbbcc")).toBeUndefined()
  })

  it("should insert and remove", () => {
    expect(tree.insert("abcc", "abcc")).toBeUndefined()
    expect(tree.insert("abd", "abd")).toBeUndefined()
    expect(tree.insert("acb", "acb")).toBeUndefined()

    expect(tree.remove("abcc")).toBe("abcc")
    expect(tree.get("abcc")).toBeUndefined()
    expect(tree.get("abd")).toBe("abd")
    expect(tree.get("acb")).toBe("acb")

    expect(tree.remove("abd")).toBe("abd")
    expect(tree.get("abd")).toBeUndefined()
    expect(tree.get("acb")).toBe("acb")

    expect(tree.remove("acb")).toBe("acb")
    expect(tree.get("acb")).toBeUndefined()
  })
})

import { RadixTree } from "../../src/tree/radix"

describe("RadixTree", () => {
  let tree: RadixTree<string>

  beforeEach(() => {
    tree = new RadixTree()
  })

  it("should insert and get", () => {
    expect(tree.insert("abcc", "abcc")).toBeUndefined()
    expect(tree.insert("abd", "abd")).toBeUndefined()
    expect(tree.insert("acb", "acb")).toBeUndefined()
    expect(tree.get("abcc")).toBe("abcc")
    expect(tree.get("abd")).toBe("abd")
    expect(tree.get("acb")).toBe("acb")
    expect(tree.get("ab")).toBeUndefined()
    expect(tree.get("ac")).toBeUndefined()
    expect(tree.get("abc")).toBeUndefined()
    expect(tree.get("abcd")).toBeUndefined()
    expect(tree.get("abcde")).toBeUndefined()
    expect(tree.get("abcdef")).toBeUndefined()
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

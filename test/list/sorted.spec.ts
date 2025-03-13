import { SortedList as Abstract } from "../../src/list/sorted"

class SortedList extends Abstract<number> {
  protected compare(a: number, b: number) {
    return a - b
  }
}

describe("Sorted List", () => {
  let list: SortedList

  beforeEach(() => {
    list = new SortedList()
  })

  it("should insert values in sorted order", () => {
    list.insert(1)
    list.insert(3)
    list.insert(2)
    list.insert(4)
    list.insert(1)

    expect(list.length).toBe(5)
    expect(list.get(0)).toBe(1)
    expect(list.get(1)).toBe(1)
    expect(list.get(2)).toBe(2)
    expect(list.get(3)).toBe(3)
    expect(list.get(4)).toBe(4)
  })

  it("should remove values", () => {
    list.insert(1)
    list.insert(2)
    list.insert(3)
    list.insert(4)
    list.insert(5)

    list.remove(3)
    expect(list.length).toBe(4)
    expect(list.get(0)).toBe(1)
    expect(list.get(1)).toBe(2)
    expect(list.get(2)).toBe(4)
    expect(list.get(3)).toBe(5)

    list.remove(6)
    expect(list.length).toBe(4)

    list.remove(1)
    expect(list.length).toBe(3)
    expect(list.get(0)).toBe(2)
    expect(list.get(1)).toBe(4)
    expect(list.get(2)).toBe(5)

    list.remove(5)
    expect(list.length).toBe(2)
    expect(list.get(0)).toBe(2)
    expect(list.get(1)).toBe(4)

    list.remove(2)
    list.remove(4)
    expect(list.length).toBe(0)
  })

  it("should find values", () => {
    list.insert(1)
    list.insert(2)
    list.insert(3)
    list.insert(4)
    list.insert(5)

    expect(list.indexOf(3)).toBe(2)
    expect(list.includes(3)).toBe(true)
    expect(list.indexOf(6)).toBe(-1)
    expect(list.includes(6)).toBe(false)
  })

  it("should iterate over values", () => {
    list.insert(1)
    list.insert(2)
    list.insert(3)
    list.insert(4)
    list.insert(5)

    const values = Array.from(list.values())
    expect(values).toEqual([1, 2, 3, 4, 5])
  })

  it("should insert on construction", () => {
    list = new SortedList([5, 4, 3, 2, 1])

    expect(Array.from(list.values())).toEqual([1, 2, 3, 4, 5])
  })
})

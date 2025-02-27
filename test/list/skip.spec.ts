import { SkipList } from "../../src/list/skip"

describe("SkipList", () => {
  let list: SkipList<number>

  beforeEach(() => {
    list = new SkipList()
  })

  it("should insert", () => {
    expect(list.insert({ key: 1 })).toBeUndefined()
    expect(list.insert({ key: 2 })).toBeUndefined()
    expect(list.insert({ key: 3 })).toBeUndefined()
    expect(list.insert({ key: 4 })).toBeUndefined()
    expect(list.insert({ key: 5 })).toBeUndefined()
    expect(list.insert({ key: 6 })).toBeUndefined()
    expect(list.insert({ key: 7 })).toBeUndefined()
    expect(list.insert({ key: 8 })).toBeUndefined()
    expect(list.insert({ key: 9 })).toBeUndefined()
    expect(list.insert({ key: 10 })).toBeUndefined()

    expect(list.get(1)).toEqual({ key: 1 })
    expect(list.get(2)).toEqual({ key: 2 })
    expect(list.get(3)).toEqual({ key: 3 })
    expect(list.get(4)).toEqual({ key: 4 })
    expect(list.get(5)).toEqual({ key: 5 })
    expect(list.get(6)).toEqual({ key: 6 })
    expect(list.get(7)).toEqual({ key: 7 })
    expect(list.get(8)).toEqual({ key: 8 })
    expect(list.get(9)).toEqual({ key: 9 })
    expect(list.get(10)).toEqual({ key: 10 })
    expect(list.get(11)).toBeUndefined()
    expect(list.length).toBe(10)
  })

  it("should insert at same key", () => {
    expect(list.insert({ key: 1 })).toBeUndefined()
    expect(list.insert({ key: 1 })).toEqual({ key: 1 })
    expect(list.get(1)).toEqual({ key: 1 })
    expect(list.length).toBe(1)

    expect(list.insert({ key: 1 })).toEqual({ key: 1 })
    expect(list.length).toBe(1)
    expect(list.insert({ key: 2 })).toBeUndefined()
    expect(list.length).toBe(2)
    expect(list.insert({ key: 3 })).toBeUndefined()
    expect(list.length).toBe(3)
    expect(list.insert({ key: 4 })).toBeUndefined()
    expect(list.length).toBe(4)
    expect(list.insert({ key: 5 })).toBeUndefined()
    expect(list.length).toBe(5)
    expect(list.insert({ key: 6 })).toBeUndefined()
    expect(list.length).toBe(6)
    expect(list.insert({ key: 7 })).toBeUndefined()
    expect(list.length).toBe(7)
    expect(list.insert({ key: 8 })).toBeUndefined()
    expect(list.length).toBe(8)
    expect(list.insert({ key: 9 })).toBeUndefined()
    expect(list.length).toBe(9)
    expect(list.insert({ key: 10 })).toBeUndefined()
    expect(list.length).toBe(10)
    expect(list.insert({ key: 5 })).toEqual({ key: 5 })

    expect(list.get(1)).toEqual({ key: 1 })
    expect(list.get(2)).toEqual({ key: 2 })
    expect(list.get(3)).toEqual({ key: 3 })
    expect(list.get(4)).toEqual({ key: 4 })
    expect(list.get(5)).toEqual({ key: 5 })
    expect(list.get(6)).toEqual({ key: 6 })
    expect(list.get(7)).toEqual({ key: 7 })
    expect(list.get(8)).toEqual({ key: 8 })
    expect(list.get(9)).toEqual({ key: 9 })
    expect(list.get(10)).toEqual({ key: 10 })
    expect(list.get(11)).toBeUndefined()
    expect(list.length).toBe(10)
  })

  it("should insert and delete", () => {
    expect(list.insert({ key: 1 })).toBeUndefined()
    expect(list.insert({ key: 2 })).toBeUndefined()
    expect(list.insert({ key: 3 })).toBeUndefined()
    expect(list.insert({ key: 4 })).toBeUndefined()
    expect(list.insert({ key: 5 })).toBeUndefined()
    expect(list.insert({ key: 6 })).toBeUndefined()
    expect(list.insert({ key: 7 })).toBeUndefined()
    expect(list.insert({ key: 8 })).toBeUndefined()
    expect(list.insert({ key: 9 })).toBeUndefined()
    expect(list.insert({ key: 10 })).toBeUndefined()

    expect(list.get(1)).toEqual({ key: 1 })
    expect(list.get(2)).toEqual({ key: 2 })
    expect(list.get(3)).toEqual({ key: 3 })
    expect(list.get(4)).toEqual({ key: 4 })
    expect(list.get(5)).toEqual({ key: 5 })
    expect(list.get(6)).toEqual({ key: 6 })
    expect(list.get(7)).toEqual({ key: 7 })
    expect(list.get(8)).toEqual({ key: 8 })
    expect(list.get(9)).toEqual({ key: 9 })
    expect(list.get(10)).toEqual({ key: 10 })
    expect(list.get(11)).toBeUndefined()
    expect(list.length).toBe(10)

    expect(list.delete(1)).toEqual({ key: 1 })
    expect(list.delete(2)).toEqual({ key: 2 })
    expect(list.delete(3)).toEqual({ key: 3 })
    expect(list.delete(4)).toEqual({ key: 4 })
    expect(list.delete(5)).toEqual({ key: 5 })
    expect(list.delete(6)).toEqual({ key: 6 })
    expect(list.delete(7)).toEqual({ key: 7 })
    expect(list.delete(8)).toEqual({ key: 8 })
    expect(list.delete(9)).toEqual({ key: 9 })
    expect(list.delete(10)).toEqual({ key: 10 })
    expect(list.delete(11)).toBeUndefined()
    expect(list.length).toBe(0)
  })

  it("should insert and delete at many key", () => {
    for (let i = 100; i >= 1; i--) {
      expect(list.insert({ key: i })).toBeUndefined()
    }

    for (let i = 1; i <= 100; i++) {
      expect(list.get(i)).toEqual({ key: i })
    }
    expect(list.length).toBe(100)

    const delete_list = [9, 2, 1, 5, 89, 23]
    for (const key of delete_list) {
      expect(list.delete(key)).toEqual({ key })
    }

    for (let i = 1; i <= 100; i++) {
      if (delete_list.includes(i)) {
        expect(list.get(i)).toBeUndefined()
      } else {
        expect(list.get(i)).toEqual({ key: i })
      }
    }
  })
})

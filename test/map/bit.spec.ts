import { Bitmap } from "../../src/map/bit"

describe("Bitmap", () => {
  describe("constructor", () => {
    it("should create bitmap with correct capacity", () => {
      const bitmap = new Bitmap(32)
      expect(bitmap.size).toBe(0)
    })

    it("should handle large capacity", () => {
      const bitmap = new Bitmap(1000)
      expect(bitmap.size).toBe(0)
    })
  })

  describe("set", () => {
    let bitmap: Bitmap

    beforeEach(() => {
      bitmap = new Bitmap(64)
    })

    it("should set a bit and return true", () => {
      const result = bitmap.set(5)
      expect(result).toBe(true)
      expect(bitmap.has(5)).toBe(true)
      expect(bitmap.size).toBe(1)
    })

    it("should set multiple bits", () => {
      expect(bitmap.set(0)).toBe(true)
      expect(bitmap.set(31)).toBe(true)
      expect(bitmap.set(63)).toBe(true)
      expect(bitmap.size).toBe(3)
    })

    it("should return false when setting the same bit twice", () => {
      expect(bitmap.set(10)).toBe(true)
      expect(bitmap.set(10)).toBe(false)
      expect(bitmap.size).toBe(1)
    })

    it("should return false when bit is out of range", () => {
      const result = bitmap.set(64)
      expect(result).toBe(false)
      expect(bitmap.size).toBe(0)
    })

    it("should handle bits at word boundaries", () => {
      // Test bits at 32-bit word boundaries
      expect(bitmap.set(31)).toBe(true)
      expect(bitmap.set(32)).toBe(true)
      expect(bitmap.size).toBe(2)
    })
  })

  describe("has", () => {
    let bitmap: Bitmap

    beforeEach(() => {
      bitmap = new Bitmap(64)
    })

    it("should return true for set bits", () => {
      bitmap.set(15)
      expect(bitmap.has(15)).toBe(true)
    })

    it("should return false for unset bits", () => {
      expect(bitmap.has(15)).toBe(false)
    })

    it("should return false for out of range bits", () => {
      expect(bitmap.has(64)).toBe(false)
      expect(bitmap.has(100)).toBe(false)
    })

    it("should work with bits at word boundaries", () => {
      bitmap.set(31)
      bitmap.set(32)
      expect(bitmap.has(31)).toBe(true)
      expect(bitmap.has(32)).toBe(true)
      expect(bitmap.has(30)).toBe(false)
      expect(bitmap.has(33)).toBe(false)
    })
  })

  describe("del", () => {
    let bitmap: Bitmap

    beforeEach(() => {
      bitmap = new Bitmap(64)
    })

    it("should delete a set bit and return true", () => {
      bitmap.set(20)
      expect(bitmap.size).toBe(1)

      const result = bitmap.del(20)
      expect(result).toBe(true)
      expect(bitmap.has(20)).toBe(false)
      expect(bitmap.size).toBe(0)
    })

    it("should return false when deleting unset bit", () => {
      const result = bitmap.del(20)
      expect(result).toBe(false)
      expect(bitmap.size).toBe(0)
    })

    it("should return false when bit is out of range", () => {
      const result = bitmap.del(64)
      expect(result).toBe(false)
      expect(bitmap.size).toBe(0)
    })

    it("should delete multiple bits correctly", () => {
      bitmap.set(10)
      bitmap.set(20)
      bitmap.set(30)
      expect(bitmap.size).toBe(3)

      expect(bitmap.del(20)).toBe(true)
      expect(bitmap.size).toBe(2)
      expect(bitmap.has(10)).toBe(true)
      expect(bitmap.has(20)).toBe(false)
      expect(bitmap.has(30)).toBe(true)
    })

    it("should handle bits at word boundaries", () => {
      bitmap.set(31)
      bitmap.set(32)
      expect(bitmap.size).toBe(2)

      expect(bitmap.del(31)).toBe(true)
      expect(bitmap.size).toBe(1)
      expect(bitmap.has(31)).toBe(false)
      expect(bitmap.has(32)).toBe(true)
    })
  })

  describe("size", () => {
    let bitmap: Bitmap

    beforeEach(() => {
      bitmap = new Bitmap(64)
    })

    it("should start with size 0", () => {
      expect(bitmap.size).toBe(0)
    })

    it("should increment size when setting new bits", () => {
      bitmap.set(1)
      expect(bitmap.size).toBe(1)

      bitmap.set(2)
      expect(bitmap.size).toBe(2)

      bitmap.set(3)
      expect(bitmap.size).toBe(3)
    })

    it("should not change size when setting same bit twice", () => {
      bitmap.set(5)
      expect(bitmap.size).toBe(1)

      bitmap.set(5)
      expect(bitmap.size).toBe(1)
    })

    it("should decrement size when deleting bits", () => {
      bitmap.set(10)
      bitmap.set(20)
      bitmap.set(30)
      expect(bitmap.size).toBe(3)

      bitmap.del(20)
      expect(bitmap.size).toBe(2)

      bitmap.del(10)
      expect(bitmap.size).toBe(1)

      bitmap.del(30)
      expect(bitmap.size).toBe(0)
    })

    it("should not change size when deleting unset bits", () => {
      bitmap.set(15)
      expect(bitmap.size).toBe(1)

      bitmap.del(16) // 설정되지 않은 비트
      expect(bitmap.size).toBe(1)
    })
  })

  describe("edge cases", () => {
    it("should work with small capacity", () => {
      const bitmap = new Bitmap(1)
      expect(bitmap.set(0)).toBe(true)
      expect(bitmap.set(31)).toBe(true) // 32비트 워드 내에서 유효
      expect(bitmap.set(32)).toBe(false) // out of range
      expect(bitmap.has(0)).toBe(true)
      expect(bitmap.has(31)).toBe(true)
      expect(bitmap.size).toBe(2)
    })

    it("should work with zero bit index", () => {
      const bitmap = new Bitmap(32)
      expect(bitmap.set(0)).toBe(true)
      expect(bitmap.has(0)).toBe(true)
      expect(bitmap.del(0)).toBe(true)
      expect(bitmap.has(0)).toBe(false)
    })

    it("should handle complex operations sequence", () => {
      const bitmap = new Bitmap(100)

      // Set some bits
      for (let i = 0; i < 10; i++) {
        bitmap.set(i * 10)
      }
      expect(bitmap.size).toBe(10)

      // Delete some bits
      for (let i = 0; i < 5; i++) {
        bitmap.del(i * 10)
      }
      expect(bitmap.size).toBe(5)

      // Verify remaining bits
      for (let i = 5; i < 10; i++) {
        expect(bitmap.has(i * 10)).toBe(true)
      }
      for (let i = 0; i < 5; i++) {
        expect(bitmap.has(i * 10)).toBe(false)
      }
    })
  })
})

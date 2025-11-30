export class RandomArray<T> extends Array<T> {
  sample(count: number): T[] {
    const result = this.slice(0, count)
    for (let i = count; i < this.length; i += 1) {
      const randomIndex = (Math.random() * (i + 1)) >>> 0

      if (randomIndex >= count) {
        continue
      }

      result[randomIndex] = this.at(i)!
    }
    return result
  }

  pick() {
    return this[Math.floor(Math.random() * this.length)]
  }
}

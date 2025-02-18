export class RandomArray<T> extends Array<T> {
  *sample(count: number): IterableIterator<T> {
    const result: T[] = []
    for (let i = 0; i < this.length; i++) {
      if (result.length < count) {
        result.push(this.at(i)!)
        continue
      }
      const randomIndex = Math.floor(Math.random() * (i + 1))
      if (randomIndex < count) {
        result[randomIndex] = this.at(i)!
      }
    }
    yield* result
  }

  pick() {
    return this[Math.floor(Math.random() * this.length)]
  }
}

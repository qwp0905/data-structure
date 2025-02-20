export class Trie {
  private readonly children: Trie[] = []
  constructor(
    private word: string = "",
    private isWord = false,
    ...children: Trie[]
  ) {
    this.children = children
  }

  add(word: string) {
    if (word === this.word) {
      this.isWord = true
      return
    }

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]
      let substr = ""
      const minLen = Math.min(word.length, child.word.length)
      for (let j = 0; j < minLen; j++) {
        if (word[j] !== child.word[j]) {
          break
        }

        substr += word[j]
      }

      if (substr.length <= this.word.length) {
        continue
      }
      if (substr.length === word.length) {
        this.children[i] = new Trie(substr, true, child)
        return
      }
      if (substr.length === child.word.length) {
        child.add(word)
        return
      }

      const node = new Trie(substr, false, child)
      this.children[i] = node
      node.add(word)
      return
    }

    this.children.push(new Trie(word, true))
  }

  has(word: string): boolean {
    if (this.isWord) {
      return true
    }

    for (const child of this.children) {
      if (word.startsWith(child.word)) {
        return child.has(word)
      }
    }

    return false
  }

  *search(prefix: string): IterableIterator<string> {
    if (!prefix.startsWith(this.word)) {
      return
    }
    if (prefix === this.word) {
      yield* this.collect()
      return
    }

    for (const child of this.children) {
      yield* child.search(prefix)
    }
  }

  private *collect(): IterableIterator<string> {
    if (this.isWord) {
      yield this.word
    }

    for (const child of this.children) {
      yield* child.collect()
    }
  }
}

export function mergeSort<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
  const temp: T[] = []
  for (let i = 1; i < arr.length; i <<= 1) {
    for (let left = 0; left + i < arr.length; left += i << 1) {
      const right = left + i
      const end = Math.min(right + i, arr.length)
      let begin = left
      let count = left
      let center = right

      while (begin < right && center < end) {
        if (compare(arr[begin], arr[center]) < 0) {
          temp[count++] = arr[begin++]
        } else {
          temp[count++] = arr[center++]
        }
      }

      while (begin < right) {
        temp[count++] = arr[begin++]
      }
      while (center < end) {
        temp[count++] = arr[center++]
      }

      for (let k = left; k < end; k += 1) {
        arr[k] = temp[k]
      }
    }
  }
  return arr
}

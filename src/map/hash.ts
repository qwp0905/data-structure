import { randomBytes } from "crypto"

const GROUP_SIZE = 8
const MAX_AVG_GROUP_LOAD = 7
const LO_BITS = 0x0101010101010101n
const HI_BITS = 0x8080808080808080n
const MAX_LOAD_FACTOR = MAX_AVG_GROUP_LOAD / GROUP_SIZE

const H1MASK = 0xffff_ffff_ffff_ff80n
const H2MASK = 0x0000_0000_0000_007fn
const EMPTY = -128
const TOMBSTONE = -2

function to64bit(x: bigint) {
  return x & 0xffff_ffff_ffff_ffffn
}
function to32bit(x: bigint) {
  return x & 0xffff_ffffn
}

function u8to64le(buf: Buffer, start: number, len: number) {
  let i = 0
  let out = 0n
  if (i + 3 < len) {
    out = BigInt(buf.readUint32LE(start + i))
    i += 4
  }
  if (i + 1 < len) {
    out |= BigInt(buf.readUInt16LE(start + i)) << BigInt(i * 8)
    i += 2
  }
  if (i < len) {
    out |= BigInt(buf.readUInt8(start + i)) << BigInt(i * 8)
    i += 1
  }
  return out
}

function splitHash(h: bigint) {
  return [(h & H1MASK) >> 7n, h & H2MASK]
}
function numGroups(size: number) {
  const groups = Math.ceil((size + MAX_LOAD_FACTOR - 1) / MAX_LOAD_FACTOR)
  return groups < 1 ? 1 : groups
}

const kHash = Symbol("hash")

class Metadata {
  private readonly buf = Buffer.alloc(GROUP_SIZE)
  constructor() {
    this.buf.fill(EMPTY)
  }

  cast(): bigint {
    return this.buf.readBigInt64BE()
  }

  set(i: number, v: number) {
    this.buf[i] = v
  }

  get(i: number) {
    return this.buf[i]
  }
}

class Group<K, V> {
  keys: K[] = []
  values: V[] = []
}

export class HashTable<K, V> {
  groups: Group<K, V>[]
  ctrl: Metadata[]
  resident: number = 0
  dead: number = 0
  limit: number
  constructor(capacity: number = 16) {
    const groups = numGroups(capacity)
    this.groups = Array(groups)
    this.ctrl = Array(groups)
    for (let i = 0; i < groups; i++) {
      this.groups[i] = new Group()
      this.ctrl[i] = new Metadata()
    }
    this.limit = groups * MAX_AVG_GROUP_LOAD
  }

  has(key: K) {
    const [hi, lo] = splitHash(hash(key))
    let g = probeStart(hi, this.groups.length)
    while (true) {
      let matches = metaMatchH2(this.ctrl[g], lo)
      while (matches != 0n) {
        const [m, s] = nextMatch(matches)
        matches &= m
        if (this.groups[g].keys[s] === key) {
          return true
        }
      }

      matches = metaMatchEmpty(this.ctrl[g])
      if (matches != 0n) {
        return false
      }
      g += 1
      if (g >= this.groups.length) {
        g = 0
      }
    }
  }

  get(key: K) {
    const [hi, lo] = splitHash(hash(key))
    let g = probeStart(hi, this.groups.length)
    while (true) {
      let matches = metaMatchH2(this.ctrl[g], lo)
      while (matches != 0n) {
        const [m, s] = nextMatch(matches)
        matches &= m
        if (this.groups[g].keys[s] === key) {
          return this.groups[g].values[s]
        }
      }

      matches = metaMatchEmpty(this.ctrl[g])
      if (matches != 0n) {
        return
      }
      g += 1
      if (g >= this.groups.length) {
        g = 0
      }
    }
  }

  insert(key: K, value: V) {
    if (this.resident >= this.limit) {
      this.rehash()
    }
    const [hi, lo] = splitHash(hash(key))
    let g = probeStart(hi, this.groups.length)
    while (true) {
      let matches = metaMatchH2(this.ctrl[g], lo)
      while (matches != 0n) {
        const [m, s] = nextMatch(matches)
        matches &= m
        if (this.groups[g].keys[s] === key) {
          this.groups[g].values[s] = value
          return
        }
      }

      matches = metaMatchEmpty(this.ctrl[g])
      if (matches != 0n) {
        const [, s] = nextMatch(matches)
        this.groups[g].keys[s] = key
        this.groups[g].values[s] = value
        this.ctrl[g].set(s, Number(lo))
        this.resident += 1
        return
      }
      g += 1
      if (g >= this.groups.length) {
        g = 0
      }
    }
  }

  remove(key: K) {
    const [hi, lo] = splitHash(hash(key))
    let g = probeStart(hi, this.groups.length)
    while (true) {
      let matches = metaMatchH2(this.ctrl[g], lo)
      while (matches != 0n) {
        const [m, s] = nextMatch(matches)
        matches &= m
        if (this.groups[g].keys[s] === key) {
          if (metaMatchEmpty(this.ctrl[g]) !== 0n) {
            this.ctrl[g].set(s, EMPTY)
            this.resident -= 1
          } else {
            this.ctrl[g].set(s, TOMBSTONE)
            this.dead += 1
          }
          this.groups[g].keys[s] = null as K
          this.groups[g].values[s] = null as V
          return true
        }
      }

      matches = metaMatchEmpty(this.ctrl[g])
      if (matches != 0n) {
        return false
      }
      g += 1
      if (g >= this.groups.length) {
        g = 0
      }
    }
  }

  private nextSize() {
    if (this.dead >= this.resident / 2) {
      return this.groups.length
    }

    return this.groups.length * 2
  }

  private rehash() {
    const n = this.nextSize()
    const groups = this.groups
    const ctrl = this.ctrl
    this.groups = Array(n)
    this.ctrl = Array(n)
    for (let i = 0; i < n; i++) {
      this.groups[i] = new Group()
      this.ctrl[i] = new Metadata()
    }
    this.limit = n * MAX_AVG_GROUP_LOAD
    this.resident = 0
    this.dead = 0
    for (let g = 0; g < ctrl.length; g += 1) {
      for (let s = 0; s < GROUP_SIZE; s++) {
        const c = ctrl[g].get(s)
        if (c === EMPTY) {
          continue
        }
        if (c === TOMBSTONE) {
          continue
        }
        this.insert(groups[g].keys[s], groups[g].values[s])
      }
    }
  }
}

function metaMatchH2(m: Metadata, h: bigint) {
  return hasZeroByte(m.cast() ^ (LO_BITS * h))
}
function hasZeroByte(x: bigint) {
  return (x - LO_BITS) & ~x & HI_BITS
}
function metaMatchEmpty(m: Metadata) {
  return hasZeroByte(m.cast() ^ HI_BITS)
}
function nextMatch(b: bigint): [bigint, number] {
  const s = trailingZeros(b)
  return [~(1n << BigInt(s)), s >> 3]
}
function trailingZeros(x: bigint) {
  if (x === 0n) {
    return 64
  }

  return [
    0, 1, 56, 2, 57, 49, 28, 3, 61, 58, 42, 50, 38, 29, 17, 4, 62, 47, 59, 36, 45, 43, 51, 22, 53,
    39, 33, 30, 24, 18, 12, 5, 63, 55, 48, 27, 60, 41, 37, 16, 46, 35, 44, 21, 52, 32, 23, 11, 54,
    26, 40, 15, 34, 20, 31, 10, 25, 14, 19, 9, 13, 8, 7, 6
  ][Number(to64bit((x & -x) * 0x03f79d71b4ca8b09n) >> 58n)]
}

function probeStart(hi: bigint, groups: number) {
  return Number(to64bit(to32bit(hi) * BigInt(groups)) >> 32n)
}

function hash(key: any) {
  const hasher = new Hasher()
  switch (typeof key) {
    case "string":
      hasher.write(Buffer.from(key))
      hasher.writeu8(0xff)
      break
    case "number":
      hasher.writedouble(key)
      break
    case "bigint":
      hasher.writebigint(key)
      break
    case "boolean":
      hasher.writeu8(key ? 1 : 0)
      break
    case "undefined":
      hasher.writeu8(0)
      break
    default:
      key[kHash] ??= (hasher.write(randomBytes(32)), hasher.finish())
      return key[kHash]
  }
  return hasher.finish()
}

class State {
  v0: bigint = 0n
  v1: bigint = 0n
  v2: bigint = 0n
  v3: bigint = 0n

  crounds() {
    return this.compress()
  }
  drounds() {
    for (let i = 0; i < 3; i++) {
      this.compress()
    }
  }
  private compress() {
    this.v0 = this.v0 + this.v1
    this.v2 = this.v2 + this.v3
    this.v1 <<= 13n
    this.v1 ^= this.v0
    this.v3 <<= 16n
    this.v3 ^= this.v2
    this.v0 <<= 32n

    this.v2 = this.v2 + this.v1
    this.v0 = this.v0 + this.v3
    this.v1 <<= 17n
    this.v1 ^= this.v2
    this.v3 <<= 21n
    this.v3 ^= this.v0
    this.v2 <<= 32n
  }
}

class Hasher {
  state: State
  tail = 0n
  ntail = 0
  length = 0

  constructor(
    private readonly k0: bigint = 0n,
    private readonly k1: bigint = 0n
  ) {
    this.state = new State()
    this.reset()
  }

  private reset() {
    this.length = 0
    this.ntail = 0
    this.state.v0 = this.k0 ^ 0x736f6d6570736575n
    this.state.v1 = this.k1 ^ 0x646f72616e646f6dn
    this.state.v2 = this.k0 ^ 0x6c7967656e657261n
    this.state.v3 = this.k1 ^ 0x7465646279746573n
  }

  writeu8(value: number) {
    const buf = Buffer.alloc(1)
    buf.writeUInt8(value)
    this.write(buf)
  }
  writedouble(value: number) {
    const buf = Buffer.alloc(8)
    buf.writeDoubleLE(value)
    this.write(buf)
  }
  writebigint(value: bigint) {
    const buf = Buffer.alloc(8)
    buf.writeBigInt64LE(value)
    this.write(buf)
  }

  write(key: Buffer) {
    const length = key.length
    this.length += length
    let needed = 0
    if (this.ntail !== 0) {
      needed = 8 - this.ntail
      this.tail |= u8to64le(key, 0, Math.min(length, needed)) << BigInt(this.ntail * 8)
      if (length < needed) {
        this.ntail += length
        return
      }
      this.state.v3 ^= this.tail
      this.state.crounds()
      this.state.v0 ^= this.tail
      this.ntail = 0
    }

    const len = length - needed
    const left = len & 0x7
    let i = needed
    while (i < len - left) {
      const mi = key.readBigUint64LE(i)
      this.state.v3 ^= mi
      this.state.crounds()
      this.state.v0 ^= mi
      i += 8
    }

    this.tail = u8to64le(key, i, left)
    this.ntail = left
  }

  finish() {
    const b = (BigInt(this.length & 0xff) << 56n) | this.tail
    this.state.v3 ^= b
    this.state.crounds()
    this.state.v0 ^= b

    this.state.v2 ^= 0xffn
    this.state.drounds()

    return this.state.v0 ^ this.state.v1 ^ this.state.v2 ^ this.state.v3
  }
}

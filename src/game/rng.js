// Seeded randomness so the "Daily Case" is identical for every player.

/** mulberry32: small, fast, good enough for card shuffling. */
export function createRng(seed) {
  let a = seed >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** FNV-1a 32-bit hash of a string. */
export function seedFromString(str) {
  let hash = 0x811c9dc5
  for (const ch of String(str)) {
    hash ^= ch.codePointAt(0)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export function pick(rng, list) {
  if (!list.length) throw new Error('pick: list is empty')
  return list[Math.floor(rng() * list.length)]
}

export function shuffle(rng, list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function sample(rng, list, n) {
  return shuffle(rng, list).slice(0, Math.min(n, list.length))
}

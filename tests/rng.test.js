import { describe, it, expect } from 'vitest'
import { createRng, seedFromString, pick, shuffle, sample } from '../src/game/rng.js'

describe('createRng', () => {
  it('is deterministic for the same seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it('differs for different seeds', () => {
    expect(createRng(1)()).not.toEqual(createRng(2)())
  })

  it('produces values in [0, 1)', () => {
    const rng = createRng(7)
    const values = Array.from({ length: 500 }, () => rng())
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true)
  })
})

describe('seedFromString', () => {
  it('is stable and distinguishes strings', () => {
    expect(seedFromString('daily-2026-11-12')).toBe(seedFromString('daily-2026-11-12'))
    expect(seedFromString('a')).not.toBe(seedFromString('b'))
  })

  it('returns an unsigned 32-bit integer', () => {
    const seed = seedFromString('hello')
    expect(Number.isInteger(seed)).toBe(true)
    expect(seed).toBeGreaterThanOrEqual(0)
    expect(seed).toBeLessThan(2 ** 32)
  })
})

describe('pick', () => {
  it('returns an element of the list', () => {
    const rng = createRng(3)
    const list = ['a', 'b', 'c']
    expect(list).toContain(pick(rng, list))
  })

  it('throws on an empty list', () => {
    expect(() => pick(createRng(1), [])).toThrow()
  })
})

describe('shuffle', () => {
  it('keeps the same elements and does not mutate the input', () => {
    const input = Object.freeze([1, 2, 3, 4, 5])
    const out = shuffle(createRng(9), input)
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5])
    expect(input).toEqual([1, 2, 3, 4, 5])
  })
})

describe('sample', () => {
  it('returns n distinct elements', () => {
    const out = sample(createRng(5), [1, 2, 3, 4, 5, 6], 3)
    expect(out).toHaveLength(3)
    expect(new Set(out).size).toBe(3)
  })

  it('caps at the list length', () => {
    expect(sample(createRng(5), [1, 2], 10)).toHaveLength(2)
  })
})

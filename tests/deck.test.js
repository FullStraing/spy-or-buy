import { describe, it, expect } from 'vitest'
import { buildDeck } from '../src/game/deck.js'
import { CONFIG } from '../src/config.js'
import { RED_FLAGS } from '../src/data/redFlags.js'

const allCards = (deck) => deck.flat()

describe('buildDeck', () => {
  it('creates one array per configured day with the configured card count', () => {
    const deck = buildDeck(123)
    expect(deck).toHaveLength(CONFIG.days.length)
    deck.forEach((day, i) => expect(day).toHaveLength(CONFIG.days[i].cards))
  })

  it('is deterministic for the same seed', () => {
    expect(buildDeck(99)).toEqual(buildDeck(99))
  })

  it('differs for different seeds', () => {
    expect(buildDeck(1)).not.toEqual(buildDeck(2))
  })

  it('gives every card a unique id and three facts', () => {
    const cards = allCards(buildDeck(5))
    expect(new Set(cards.map((c) => c.id)).size).toBe(cards.length)
    cards.forEach((c) => expect(c.facts).toHaveLength(3))
  })

  it('gives spies exactly one red flag with a reveal, legit buyers none', () => {
    for (let seed = 0; seed < 30; seed += 1) {
      allCards(buildDeck(seed)).forEach((card) => {
        const flags = card.facts.filter((f) => f.kind === 'flag')
        expect(flags).toHaveLength(card.spy ? 1 : 0)
        flags.forEach((f) => expect(f.reveal.en).toBeTruthy())
      })
    }
  })

  it('respects the max tier of each day', () => {
    for (let seed = 0; seed < 30; seed += 1) {
      buildDeck(seed).forEach((day, i) => {
        day.flatMap((c) => c.facts)
          .filter((f) => f.kind === 'flag')
          .forEach((f) => expect(f.tier).toBeLessThanOrEqual(CONFIG.days[i].maxTier))
      })
    }
  })

  it('does not repeat a red flag while unused eligible flags remain', () => {
    const tierOneCount = RED_FLAGS.filter((f) => f.tier === 1).length
    for (let seed = 0; seed < 30; seed += 1) {
      const flags = allCards(buildDeck(seed))
        .flatMap((c) => c.facts)
        .filter((f) => f.kind === 'flag')
        .map((f) => f.id)
      if (flags.length <= tierOneCount) expect(new Set(flags).size).toBe(flags.length)
    }
  })

  it('attaches a CEO text to every CEO-pressure card', () => {
    for (let seed = 0; seed < 20; seed += 1) {
      allCards(buildDeck(seed)).forEach((c) => {
        expect(Boolean(c.ceoText)).toBe(c.ceoPressure)
      })
    }
  })

  it('keeps the spy ratio in a sane range across many games', () => {
    const cards = Array.from({ length: 200 }, (_, s) => allCards(buildDeck(s))).flat()
    const ratio = cards.filter((c) => c.spy).length / cards.length
    expect(ratio).toBeGreaterThan(0.3)
    expect(ratio).toBeLessThan(0.7)
  })

  it('returns frozen cards', () => {
    const card = buildDeck(1)[0][0]
    expect(Object.isFrozen(card)).toBe(true)
    expect(Object.isFrozen(card.facts)).toBe(true)
  })
})

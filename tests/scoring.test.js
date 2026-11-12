import { describe, it, expect } from 'vitest'
import {
  rankFor,
  emojiFor,
  dailyNumber,
  dailySeed,
  headlineTier,
  pickHeadline,
  daySummary,
  buildShareText,
} from '../src/game/scoring.js'
import { RANKS } from '../src/data/ranks.js'

describe('rankFor', () => {
  it('returns the lowest rank for zero and the top rank for huge scores', () => {
    expect(rankFor(0)).toBe(RANKS[0])
    expect(rankFor(1e9)).toBe(RANKS[RANKS.length - 1])
  })

  it('is monotonic', () => {
    const indexes = [0, 1500, 3000, 5000, 7000, 9000].map((s) => RANKS.indexOf(rankFor(s)))
    indexes.slice(1).forEach((idx, i) => expect(idx).toBeGreaterThanOrEqual(indexes[i]))
  })
})

describe('emojiFor', () => {
  it('maps every outcome kind', () => {
    expect(emojiFor('sale')).toBe('🟩')
    expect(emojiFor('caught')).toBe('🟩')
    expect(emojiFor('leak')).toBe('🟥')
    expect(emojiFor('false-alarm')).toBe('🟨')
    expect(emojiFor('profiling')).toBe('🟪')
    expect(emojiFor('nope')).toBe('⬜')
  })
})

describe('daily helpers', () => {
  it('numbers days from the epoch starting at 1', () => {
    expect(dailyNumber(new Date('2026-11-12T10:00:00'), '2026-11-12')).toBe(1)
    expect(dailyNumber(new Date('2026-11-13T23:00:00'), '2026-11-12')).toBe(2)
  })

  it('never returns less than 1', () => {
    expect(dailyNumber(new Date('2020-01-01T00:00:00'), '2026-11-12')).toBe(1)
  })

  it('builds a local-date seed', () => {
    expect(dailySeed(new Date(2026, 10, 5))).toBe('daily-2026-11-05')
  })
})

describe('headlines', () => {
  it('picks a tier by scandal level', () => {
    expect(headlineTier(0)).toBe('low')
    expect(headlineTier(45)).toBe('mid')
    expect(headlineTier(80)).toBe('high')
  })

  it('picks a deterministic headline per day', () => {
    expect(pickHeadline(80, 2)).toEqual(pickHeadline(80, 2))
    expect(pickHeadline(80, 2).en).toBeTruthy()
  })
})

describe('daySummary', () => {
  it('counts correct decisions for a day', () => {
    const history = [
      { day: 0, kind: 'sale' },
      { day: 0, kind: 'leak' },
      { day: 1, kind: 'caught' },
    ]
    expect(daySummary(history, 0)).toEqual({ correct: 1, total: 2 })
  })
})

describe('buildShareText', () => {
  it('includes the title, grid by day, score and url', () => {
    const state = {
      score: 1234,
      status: 'won',
      history: [
        { day: 0, kind: 'sale' },
        { day: 0, kind: 'leak' },
        { day: 1, kind: 'profiling' },
      ],
    }
    const t = (key, vars) => (key === 'shareScore' ? `Score ${vars.score}` : key)
    const out = buildShareText({ state, t, label: 'Daily #3', url: 'https://x.test/' })
    expect(out).toContain('Daily #3')
    expect(out).toContain('🟩🟥\n🟪')
    expect(out).toContain('Score 1234')
    expect(out).toContain('https://x.test/')
  })
})

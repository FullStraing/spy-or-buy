import { describe, it, expect } from 'vitest'
import { createGame, currentCard, decide, startNextDay, useLobby } from '../src/game/state.js'
import { CONFIG } from '../src/config.js'

const text = (s) => ({ ru: s, en: s })
const fact = (kind) => ({
  id: `${kind}-x`,
  kind,
  text: text(kind),
  ...(kind === 'neutral' ? {} : { reveal: text(`${kind} reveal`) }),
  ...(kind === 'flag' ? { tier: 1 } : {}),
})

const makeCard = (id, { spy = false, herring = false } = {}) => ({
  id,
  spy,
  ceoPressure: false,
  ceoText: null,
  avatar: '🧑‍💼',
  name: 'Test Person',
  company: 'Test Co',
  hq: text('HQ'),
  order: text('8x GPU'),
  facts: [spy ? fact('flag') : fact('neutral'), herring ? fact('herring') : fact('neutral'), fact('neutral')],
})

const twoDayDeck = () => [
  [makeCard('a', { spy: false }), makeCard('b', { spy: true })],
  [makeCard('c', { spy: false, herring: true })],
]

const newGame = (deck = twoDayDeck()) => createGame({ seed: 1, deck })
const S = CONFIG.scoring

describe('createGame', () => {
  it('starts playing on day 0 with the configured meters', () => {
    const g = newGame()
    expect(g.status).toBe('playing')
    expect(g.dayIndex).toBe(0)
    expect(g.cardIndex).toBe(0)
    expect(g.stock).toBe(CONFIG.start.stock)
    expect(g.scandal).toBe(CONFIG.start.scandal)
    expect(g.score).toBe(0)
    expect(g.history).toEqual([])
    expect(Object.isFrozen(g)).toBe(true)
  })

  it('builds a seeded deck when none is given', () => {
    const g = createGame({ seed: 77 })
    expect(g.deck).toHaveLength(CONFIG.days.length)
    expect(currentCard(g)).not.toBeNull()
  })
})

describe('decide', () => {
  it('approving a legit buyer is a sale', () => {
    const { state, outcome } = decide(newGame(), 'approve')
    expect(outcome.kind).toBe('sale')
    expect(state.stock).toBe(CONFIG.start.stock + S.saleStock)
    expect(state.score).toBe(S.salePoints)
    expect(state.streak).toBe(1)
    expect(state.cardIndex).toBe(1)
  })

  it('flagging a spy is a catch and reveals the red flag', () => {
    const afterSale = decide(newGame(), 'approve').state
    const { state, outcome } = decide(afterSale, 'flag')
    expect(outcome.kind).toBe('caught')
    expect(outcome.fact.kind).toBe('flag')
    expect(state.scandal).toBe(0)
    expect(state.score).toBe(S.salePoints + Math.round(S.catchPoints * (1 + S.streakBonus)))
    expect(state.bestStreak).toBe(2)
  })

  it('reports the applied delta after clamping', () => {
    const afterSale = decide(newGame(), 'approve').state
    const { outcome } = decide(afterSale, 'flag')
    expect(outcome.delta.scandal).toBe(0)
    expect(outcome.delta.stock).toBe(0)
  })

  it('approving a spy is a leak', () => {
    const afterSale = decide(newGame(), 'approve').state
    const { state, outcome } = decide(afterSale, 'approve')
    expect(outcome.kind).toBe('leak')
    expect(state.scandal).toBe(S.leakScandal)
    expect(state.streak).toBe(0)
  })

  it('a timeout counts as an approval and is marked', () => {
    const afterSale = decide(newGame(), 'approve').state
    const { outcome } = decide(afterSale, 'timeout')
    expect(outcome.kind).toBe('leak')
    expect(outcome.timedOut).toBe(true)
  })

  it('a timeout on a legit buyer still sells but earns no points and breaks the streak', () => {
    const { state, outcome } = decide(newGame(), 'timeout')
    expect(outcome.kind).toBe('sale')
    expect(outcome.delta.score).toBe(0)
    expect(state.score).toBe(0)
    expect(state.streak).toBe(0)
    expect(state.stock).toBe(CONFIG.start.stock + S.saleStock)
  })

  it('flagging a legit buyer without a herring is a false alarm', () => {
    const { state, outcome } = decide(newGame(), 'flag')
    expect(outcome.kind).toBe('false-alarm')
    expect(outcome.fact).toBeNull()
    expect(state.stock).toBe(CONFIG.start.stock + S.falseAlarmStock)
  })

  it('flagging a legit buyer with a herring is profiling', () => {
    const deck = [[makeCard('h', { herring: true })]]
    const { state, outcome } = decide(newGame(deck), 'flag')
    expect(outcome.kind).toBe('profiling')
    expect(outcome.fact.kind).toBe('herring')
    expect(state.scandal).toBe(S.profilingScandal)
  })

  it('ends the day after the last card of a non-final day', () => {
    const g1 = decide(newGame(), 'approve').state
    const g2 = decide(g1, 'flag').state
    expect(g2.status).toBe('day-end')
    expect(currentCard(g2)).toBeNull()
  })

  it('wins after the final card', () => {
    const g = startNextDay(decide(decide(newGame(), 'approve').state, 'flag').state)
    const { state } = decide(g, 'approve')
    expect(state.status).toBe('won')
    expect(state.history).toHaveLength(3)
  })

  it('loses with "resigned" when the scandal hits the limit', () => {
    const spies = Array.from({ length: 6 }, (_, i) => makeCard(`s${i}`, { spy: true }))
    const final = spies.reduce((g) => (g.status === 'playing' ? decide(g, 'approve').state : g), newGame([spies]))
    expect(final.status).toBe('lost')
    expect(final.lostReason).toBe('resigned')
    expect(final.scandal).toBe(CONFIG.limits.maxScandal)
  })

  it('loses with "crashed" when the stock hits zero', () => {
    const legit = Array.from({ length: 12 }, (_, i) => makeCard(`l${i}`))
    const final = legit.reduce((g) => (g.status === 'playing' ? decide(g, 'flag').state : g), newGame([legit]))
    expect(final.status).toBe('lost')
    expect(final.lostReason).toBe('crashed')
    expect(final.stock).toBe(0)
  })

  it('does not mutate the previous state', () => {
    const g = newGame()
    const snapshot = JSON.stringify(g)
    decide(g, 'approve')
    expect(JSON.stringify(g)).toBe(snapshot)
  })

  it('rejects an unknown decision', () => {
    expect(() => decide(newGame(), 'maybe')).toThrow(/decision/i)
  })

  it('rejects decisions when not playing', () => {
    const g = decide(decide(newGame(), 'approve').state, 'flag').state
    expect(() => decide(g, 'approve')).toThrow(/not playing/i)
  })
})

describe('startNextDay', () => {
  it('moves to the next day', () => {
    const g = startNextDay(decide(decide(newGame(), 'approve').state, 'flag').state)
    expect(g.status).toBe('playing')
    expect(g.dayIndex).toBe(1)
    expect(g.cardIndex).toBe(0)
  })

  it('throws when the day has not ended', () => {
    expect(() => startNextDay(newGame())).toThrow(/day-end/i)
  })
})

describe('useLobby', () => {
  it('lowers the scandal once per game', () => {
    const leaked = decide(decide(newGame(), 'approve').state, 'approve').state
    const lobbied = useLobby(leaked)
    expect(lobbied.scandal).toBe(Math.max(0, S.leakScandal + S.lobbyScandal))
    expect(lobbied.lobbyUsed).toBe(true)
    expect(useLobby(lobbied)).toBe(lobbied)
  })

  it('does nothing once the game is over', () => {
    const won = decide(startNextDay(decide(decide(newGame(), 'approve').state, 'flag').state), 'approve').state
    expect(useLobby(won)).toBe(won)
  })
})

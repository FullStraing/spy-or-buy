// Pure game reducer. Every function returns a NEW frozen state.
import { CONFIG } from '../config.js'
import { buildDeck } from './deck.js'

const DECISIONS = Object.freeze(['approve', 'flag', 'timeout'])
const CORRECT_KINDS = Object.freeze(['sale', 'caught'])

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export function createGame({ seed, config = CONFIG, deck }) {
  return Object.freeze({
    seed,
    deck: deck ?? buildDeck(seed, config),
    dayIndex: 0,
    cardIndex: 0,
    stock: config.start.stock,
    scandal: config.start.scandal,
    score: 0,
    streak: 0,
    bestStreak: 0,
    history: Object.freeze([]),
    lobbyUsed: false,
    status: 'playing',
    lostReason: null,
  })
}

export function currentCard(state) {
  if (state.status !== 'playing') return null
  return state.deck[state.dayIndex]?.[state.cardIndex] ?? null
}

/** What kind of outcome a decision on a card produces. */
export function classify(card, decision) {
  const approved = decision !== 'flag'
  if (card.spy) return approved ? 'leak' : 'caught'
  if (approved) return 'sale'
  return card.facts.some((f) => f.kind === 'herring') ? 'profiling' : 'false-alarm'
}

function multiplier(streak, scoring) {
  return 1 + Math.min(streak, scoring.maxStreakBonus) * scoring.streakBonus
}

function deltaFor(kind, streak, scoring) {
  const mult = multiplier(streak, scoring)
  const table = {
    sale: { stock: scoring.saleStock, scandal: 0, score: Math.round(scoring.salePoints * mult) },
    caught: { stock: 0, scandal: scoring.catchScandal, score: Math.round(scoring.catchPoints * mult) },
    leak: { stock: scoring.leakStock, scandal: scoring.leakScandal, score: 0 },
    'false-alarm': { stock: scoring.falseAlarmStock, scandal: 0, score: 0 },
    profiling: { stock: scoring.falseAlarmStock, scandal: scoring.profilingScandal, score: 0 },
  }
  return table[kind]
}

function revealedFact(card, kind) {
  if (kind === 'caught' || kind === 'leak') return card.facts.find((f) => f.kind === 'flag') ?? null
  if (kind === 'profiling') return card.facts.find((f) => f.kind === 'herring') ?? null
  return null
}

function nextStatus(state, stock, scandal, config) {
  if (scandal >= config.limits.maxScandal) return { status: 'lost', lostReason: 'resigned' }
  if (stock <= config.limits.minStock) return { status: 'lost', lostReason: 'crashed' }
  const dayLength = state.deck[state.dayIndex].length
  if (state.cardIndex + 1 < dayLength) return { status: 'playing', lostReason: null }
  const isLastDay = state.dayIndex + 1 >= state.deck.length
  return { status: isLastDay ? 'won' : 'day-end', lostReason: null }
}

export function decide(state, decision, config = CONFIG) {
  if (!DECISIONS.includes(decision)) throw new Error(`Unknown decision: ${decision}`)
  const card = currentCard(state)
  if (!card) throw new Error('Game is not playing')

  const kind = classify(card, decision)
  const timedOut = decision === 'timeout'
  const nominal = deltaFor(kind, state.streak, config.scoring)
  // Letting the clock run out never earns points or extends a streak.
  const delta = timedOut ? { ...nominal, score: 0 } : nominal
  const correct = !timedOut && CORRECT_KINDS.includes(kind)
  const stock = clamp(state.stock + delta.stock, config.limits.minStock, config.limits.maxStock)
  const scandal = clamp(state.scandal + delta.scandal, 0, config.limits.maxScandal)
  const streak = correct ? state.streak + 1 : 0
  const { status, lostReason } = nextStatus(state, stock, scandal, config)
  const entry = Object.freeze({ day: state.dayIndex, cardId: card.id, decision, kind, correct })

  const next = Object.freeze({
    ...state,
    stock,
    scandal,
    score: state.score + delta.score,
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
    cardIndex: state.cardIndex + 1,
    history: Object.freeze([...state.history, entry]),
    status,
    lostReason,
  })
  // Report what was actually applied after clamping, not the nominal table values.
  const applied = Object.freeze({ stock: stock - state.stock, scandal: scandal - state.scandal, score: delta.score })
  const outcome = Object.freeze({ kind, correct, timedOut, card, fact: revealedFact(card, kind), delta: applied })
  return { state: next, outcome }
}

export function startNextDay(state) {
  if (state.status !== 'day-end') throw new Error('startNextDay requires status "day-end"')
  return Object.freeze({ ...state, dayIndex: state.dayIndex + 1, cardIndex: 0, status: 'playing' })
}

export function useLobby(state, config = CONFIG) {
  const active = state.status === 'playing' || state.status === 'day-end'
  if (state.lobbyUsed || !active) return state
  const scandal = clamp(state.scandal + config.scoring.lobbyScandal, 0, config.limits.maxScandal)
  return Object.freeze({ ...state, scandal, lobbyUsed: true })
}

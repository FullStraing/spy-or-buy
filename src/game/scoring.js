// Ranks, daily-case numbering, headlines and the Wordle-style share text.
import { CONFIG } from '../config.js'
import { RANKS } from '../data/ranks.js'
import { HEADLINES } from '../data/headlines.js'

const EMOJI = Object.freeze({
  sale: '🟩',
  caught: '🟩',
  leak: '🟥',
  'false-alarm': '🟨',
  profiling: '🟪',
})
const DAY_MS = 24 * 60 * 60 * 1000

export function rankFor(score) {
  return RANKS.reduce((best, rank) => (score >= rank.min ? rank : best), RANKS[0])
}

export function emojiFor(kind) {
  return EMOJI[kind] ?? '⬜'
}

const localMidnight = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const pad = (n) => String(n).padStart(2, '0')

/** Daily case number, 1 on the epoch day (local time). */
export function dailyNumber(date, epoch = CONFIG.dailyEpoch) {
  const [y, m, d] = epoch.split('-').map(Number)
  const diff = Math.round((localMidnight(date) - new Date(y, m - 1, d)) / DAY_MS)
  return Math.max(1, diff + 1)
}

export function dailySeed(date) {
  return `daily-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function headlineTier(scandal, tiers = CONFIG.headlineTiers) {
  if (scandal >= tiers.high) return 'high'
  if (scandal >= tiers.mid) return 'mid'
  return 'low'
}

export function pickHeadline(scandal, dayIndex) {
  const list = HEADLINES[headlineTier(scandal)]
  return list[dayIndex % list.length]
}

export function daySummary(history, dayIndex) {
  const entries = history.filter((h) => h.day === dayIndex)
  return { correct: entries.filter((h) => h.kind === 'sale' || h.kind === 'caught').length, total: entries.length }
}

function emojiGrid(history) {
  const byDay = history.reduce((acc, h) => ({ ...acc, [h.day]: `${acc[h.day] ?? ''}${emojiFor(h.kind)}` }), {})
  return Object.keys(byDay)
    .sort((a, b) => Number(a) - Number(b))
    .map((day) => byDay[day])
    .join('\n')
}

/** @param {{state, t: (key, vars) => string, label: string, url: string, rankTitle?: string}} args */
export function buildShareText({ state, t, label, url, rankTitle = '' }) {
  return [label, emojiGrid(state.history), t('shareScore', { score: state.score, rank: rankTitle }), url].join('\n')
}

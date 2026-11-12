import { CONFIG } from '../config.js'
import { createRng, pick, sample, shuffle } from './rng.js'
import { RED_FLAGS } from '../data/redFlags.js'
import { NEUTRAL_FACTS, HERRINGS } from '../data/facts.js'
import { FIRST_NAMES, LAST_NAMES, AVATARS, COMPANIES, HQS, ORDERS, CEO_TEXTS } from '../data/pools.js'

const toFlagFact = (flag) => Object.freeze({ id: flag.id, kind: 'flag', tier: flag.tier, text: flag.text, reveal: flag.reveal })
const toNeutralFact = (f) => Object.freeze({ kind: 'neutral', text: f.text })
const toHerringFact = (h) => Object.freeze({ kind: 'herring', text: h.text, reveal: h.reveal })

function chooseFlag(rng, maxTier, usedIds) {
  const eligible = RED_FLAGS.filter((f) => f.tier <= maxTier)
  const fresh = eligible.filter((f) => !usedIds.includes(f.id))
  return pick(rng, fresh.length ? fresh : eligible)
}

/** Two or three supporting facts; sometimes one of them is a red herring. */
function supportingFacts(rng, count, config) {
  const withHerring = rng() < config.herringChance
  const neutrals = sample(rng, NEUTRAL_FACTS, withHerring ? count - 1 : count).map(toNeutralFact)
  return withHerring ? [...neutrals, toHerringFact(pick(rng, HERRINGS))] : neutrals
}

function buildCard(rng, { id, maxTier, usedIds, config }) {
  const ceoPressure = rng() < config.ceoPressureChance
  const spy = rng() < (ceoPressure ? config.ceoPressureSpyChance : config.spyChance)
  const flag = spy ? chooseFlag(rng, maxTier, usedIds) : null
  const others = supportingFacts(rng, spy ? 2 : 3, config)
  const facts = shuffle(rng, flag ? [toFlagFact(flag), ...others] : others)

  return Object.freeze({
    id,
    spy,
    ceoPressure,
    ceoText: ceoPressure ? pick(rng, CEO_TEXTS) : null,
    avatar: pick(rng, AVATARS),
    name: `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`,
    company: pick(rng, COMPANIES),
    hq: pick(rng, HQS),
    order: pick(rng, ORDERS),
    facts: Object.freeze(facts),
  })
}

/** Build the full deck: one array of cards per day. Deterministic per seed. */
export function buildDeck(seed, config = CONFIG) {
  const rng = createRng(seed)
  const result = config.days.reduce(
    (acc, day, dayIndex) => {
      const dayCards = Array.from({ length: day.cards }).reduce(
        (inner, _, cardIndex) => {
          const card = buildCard(rng, {
            id: `d${dayIndex}-c${cardIndex}`,
            maxTier: day.maxTier,
            usedIds: inner.usedIds,
            config,
          })
          const flagId = card.facts.find((f) => f.kind === 'flag')?.id
          return { cards: [...inner.cards, card], usedIds: flagId ? [...inner.usedIds, flagId] : inner.usedIds }
        },
        { cards: [], usedIds: acc.usedIds },
      )
      return { days: [...acc.days, Object.freeze(dayCards.cards)], usedIds: dayCards.usedIds }
    },
    { days: [], usedIds: [] },
  )
  return Object.freeze(result.days)
}

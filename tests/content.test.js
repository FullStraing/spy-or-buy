import { describe, it, expect } from 'vitest'
import { RED_FLAGS } from '../src/data/redFlags.js'
import { NEUTRAL_FACTS, HERRINGS } from '../src/data/facts.js'
import { HQS, ORDERS, CEO_TEXTS, FIRST_NAMES, LAST_NAMES, COMPANIES, AVATARS } from '../src/data/pools.js'
import { HEADLINES } from '../src/data/headlines.js'
import { RANKS } from '../src/data/ranks.js'
import { STRINGS } from '../src/i18n/strings.js'
import { t, tx, detectLang, LANGS } from '../src/i18n/index.js'

const bilingual = (obj) => typeof obj.ru === 'string' && obj.ru.length > 0 && typeof obj.en === 'string' && obj.en.length > 0

describe('content', () => {
  it('has bilingual red flags with reveals, ids and tiers 1-3', () => {
    expect(RED_FLAGS.length).toBeGreaterThanOrEqual(15)
    RED_FLAGS.forEach((f) => {
      expect(bilingual(f.text)).toBe(true)
      expect(bilingual(f.reveal)).toBe(true)
      expect([1, 2, 3]).toContain(f.tier)
      expect(f.id).toBeTruthy()
    })
    expect(new Set(RED_FLAGS.map((f) => f.id)).size).toBe(RED_FLAGS.length)
  })

  it('has bilingual neutral facts and herrings', () => {
    NEUTRAL_FACTS.forEach((f) => expect(bilingual(f.text)).toBe(true))
    HERRINGS.forEach((f) => {
      expect(bilingual(f.text)).toBe(true)
      expect(bilingual(f.reveal)).toBe(true)
    })
  })

  it('has bilingual pools', () => {
    ;[...HQS, ...ORDERS, ...CEO_TEXTS, ...HEADLINES.low, ...HEADLINES.mid, ...HEADLINES.high].forEach((x) =>
      expect(bilingual(x)).toBe(true),
    )
    RANKS.forEach((r) => expect(bilingual(r.title)).toBe(true))
    expect(FIRST_NAMES.length).toBeGreaterThan(10)
    expect(LAST_NAMES.length).toBeGreaterThan(10)
    expect(COMPANIES.length).toBeGreaterThan(5)
    expect(AVATARS.length).toBeGreaterThan(5)
  })

  it('has the same UI string keys in every language', () => {
    const keys = LANGS.map((lang) => Object.keys(STRINGS[lang]).sort())
    keys.forEach((k) => expect(k).toEqual(keys[0]))
  })
})

describe('i18n', () => {
  it('interpolates variables', () => {
    expect(t('day', 'en', { n: 3 })).toContain('3')
  })

  it('falls back to English and then to the key', () => {
    expect(t('day', 'xx', { n: 1 })).toBe(t('day', 'en', { n: 1 }))
    expect(t('__missing__', 'ru')).toBe('__missing__')
  })

  it('translates bilingual objects with fallback', () => {
    expect(tx({ ru: 'привет', en: 'hi' }, 'ru')).toBe('привет')
    expect(tx({ en: 'hi' }, 'ru')).toBe('hi')
    expect(tx('plain', 'ru')).toBe('plain')
    expect(tx(null, 'ru')).toBe('')
  })

  it('detects the language', () => {
    expect(detectLang('ru-RU')).toBe('ru')
    expect(detectLang('uk')).toBe('ru')
    expect(detectLang('en-US')).toBe('en')
    expect(detectLang(undefined)).toBe('en')
  })
})

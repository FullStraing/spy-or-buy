import { STRINGS } from './strings.js'

export const LANGS = Object.freeze(Object.keys(STRINGS))
const FALLBACK = 'en'
const RU_FAMILY = ['ru', 'uk', 'be', 'kk', 'ky', 'uz']

/** Translate a UI key, interpolating {var} placeholders. */
export function t(key, lang, vars = {}) {
  const table = STRINGS[lang] ?? STRINGS[FALLBACK]
  const template = table[key] ?? STRINGS[FALLBACK][key] ?? key
  return template.replace(/\{(\w+)\}/g, (_, name) => (name in vars ? String(vars[name]) : `{${name}}`))
}

/** Translate a bilingual content object like { ru, en }. */
export function tx(value, lang) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  return value[lang] ?? value[FALLBACK] ?? ''
}

export function detectLang(navigatorLang) {
  const base = String(navigatorLang ?? '').toLowerCase().split('-')[0]
  return RU_FAMILY.includes(base) ? 'ru' : 'en'
}

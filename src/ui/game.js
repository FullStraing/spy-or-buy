import { h, mount, meter } from './dom.js'
import { attachSwipe } from './swipe.js'
import { createTimer } from './platform.js'
import { t, tx } from '../i18n/index.js'
import { currentCard } from '../game/state.js'
import { CONFIG } from '../config.js'

const FLY_MS = 200
const KIND_KEY = Object.freeze({
  sale: 'kindSale',
  caught: 'kindCaught',
  leak: 'kindLeak',
  'false-alarm': 'kindFalseAlarm',
  profiling: 'kindProfiling',
})

function hud(game, lang) {
  const s = (key, vars) => t(key, lang, vars)
  const mult = Math.min(game.streak, CONFIG.scoring.maxStreakBonus)
  return h(
    'header',
    { class: 'hud' },
    h(
      'div',
      { class: 'hud-top' },
      h('span', { class: 'pill', text: `${s('day', { n: game.dayIndex + 1 })} / ${game.deck.length}` }),
      mult > 0 ? h('span', { class: 'pill pill-hot', text: s('streak', { n: (1 + mult * CONFIG.scoring.streakBonus).toFixed(1) }) }) : null,
      h('span', { class: 'pill pill-score', text: `${s('score')}: ${game.score}` }),
    ),
    h(
      'div',
      { class: 'meters' },
      meter({ label: `📈 ${s('stock')}`, value: game.stock, max: CONFIG.limits.maxStock, tone: 'stock', display: `$${game.stock}` }),
      meter({ label: `🔥 ${s('scandal')}`, value: game.scandal, max: CONFIG.limits.maxScandal, tone: 'scandal', display: `${game.scandal}%` }),
    ),
  )
}

function suspectCard(card, game, lang) {
  return h(
    'article',
    { class: `card${card.ceoPressure ? ' card-pressure' : ''}`, 'aria-live': 'polite' },
    h('div', { class: 'stamp stamp-sell', 'aria-hidden': 'true', text: t('stampSell', lang) }),
    h('div', { class: 'stamp stamp-spy', 'aria-hidden': 'true', text: t('stampSpy', lang) }),
    h('div', { class: 'card-band', text: `KYC // CASE ${String(game.dayIndex + 1)}-${String(game.cardIndex + 1).padStart(2, '0')}` }),
    h(
      'div',
      { class: 'card-head' },
      h('div', { class: 'avatar', text: card.avatar }),
      h('div', {}, h('h2', { text: card.name }), h('p', { class: 'company', text: card.company })),
    ),
    h(
      'dl',
      { class: 'card-meta' },
      h('div', {}, h('dt', { text: t('hq', lang) }), h('dd', { text: tx(card.hq, lang) })),
      h('div', {}, h('dt', { text: t('order', lang) }), h('dd', { text: tx(card.order, lang) })),
    ),
    h('ul', { class: 'facts' }, card.facts.map((f) => h('li', { text: tx(f.text, lang) }))),
    card.ceoText ? h('p', { class: 'ceo-text', text: tx(card.ceoText, lang) }) : null,
  )
}

function deltaChips(delta, lang) {
  const chips = [
    delta.score ? { cls: 'up', text: `+${delta.score} ${t('score', lang)}` } : null,
    delta.stock ? { cls: delta.stock > 0 ? 'up' : 'down', text: `${delta.stock > 0 ? '+' : ''}${delta.stock} ${t('stock', lang)}` } : null,
    delta.scandal ? { cls: delta.scandal < 0 ? 'up' : 'down', text: `${delta.scandal > 0 ? '+' : ''}${delta.scandal}% ${t('scandal', lang)}` } : null,
  ].filter(Boolean)
  return h('div', { class: 'chips' }, chips.map((c) => h('span', { class: `chip chip-${c.cls}`, text: c.text })))
}

function feedbackPanel(outcome, lang, onContinue) {
  const s = (key) => t(key, lang)
  const fallback = outcome.kind === 'sale' ? s('saleMsg') : s('falseAlarmMsg')
  return h(
    'button',
    { class: `feedback feedback-${outcome.kind}`, onClick: onContinue, 'aria-live': 'assertive' },
    h('div', { class: 'feedback-title', text: s(KIND_KEY[outcome.kind]) }),
    outcome.timedOut ? h('p', { class: 'feedback-timeout', text: s('timedOut') }) : null,
    outcome.fact ? h('p', { class: 'feedback-fact', text: t('quote', lang, { text: tx(outcome.fact.text, lang) }) }) : null,
    h('p', { class: 'feedback-reveal', text: outcome.fact ? tx(outcome.fact.reveal, lang) : fallback }),
    deltaChips(outcome.delta, lang),
    h('p', { class: 'feedback-tap', text: s('tapToContinue') }),
  )
}

function controls(lang, commit, game, onLobby) {
  const s = (key) => t(key, lang)
  return h(
    'footer',
    { class: 'controls' },
    h(
      'div',
      { class: 'decide' },
      h('button', { class: 'btn btn-spy', onClick: () => commit('flag'), 'aria-keyshortcuts': 'ArrowLeft', text: `👈 ${s('flag')}` }),
      h('button', { class: 'btn btn-sell', onClick: () => commit('approve'), 'aria-keyshortcuts': 'ArrowRight', text: `${s('approve')} 👉` }),
    ),
    h('button', { class: 'btn btn-lobby', onClick: onLobby, disabled: game.lobbyUsed, text: game.lobbyUsed ? s('lobbyUsed') : s('lobby') }),
  )
}

/** Renders the playing screen. Returns a cleanup function. */
export function renderGame(root, app, actions) {
  const { game, lang, feedback } = app
  if (feedback) {
    mount(root, h('section', { class: 'screen game' }, hud(game, lang), h('main', { class: 'stage' }, feedbackPanel(feedback, lang, actions.continue))))
    return () => {}
  }

  const card = currentCard(game)
  const cardEl = suspectCard(card, game, lang)
  const fill = h('div', { class: 'timer-fill' })
  let committed = false
  let flyTimeout = 0
  let timer = { stop() {} }
  let hudEl = hud(game, lang)

  const commit = (decision) => {
    if (committed) return
    committed = true
    timer.stop()
    cardEl.classList.add(decision === 'flag' ? 'fly-left' : 'fly-right')
    flyTimeout = window.setTimeout(() => actions.decide(decision), FLY_MS)
  }

  // Lobbying patches the HUD in place so the timer and any in-flight decision survive.
  const onLobby = (e) => {
    if (committed) return
    const updated = actions.lobbyInPlace()
    const nextHud = hud(updated, lang)
    hudEl.replaceWith(nextHud)
    hudEl = nextHud
    e.currentTarget.disabled = true
    e.currentTarget.textContent = t('lobbyUsed', lang)
  }

  mount(
    root,
    h(
      'section',
      { class: 'screen game' },
      hudEl,
      h('main', { class: 'stage' }, cardEl),
      h('div', { class: 'timer', 'aria-hidden': 'true' }, fill),
      controls(lang, commit, game, onLobby),
    ),
  )

  const detachSwipe = attachSwipe(cardEl, { onDecide: commit })
  timer = createTimer({
    seconds: CONFIG.days[game.dayIndex].seconds,
    onTick: (left) => {
      fill.style.transform = `scaleX(${left})`
      fill.classList.toggle('timer-low', left < 0.3)
    },
    onExpire: () => {
      if (committed) return
      committed = true
      actions.decide('timeout')
    },
  })
  const onKey = (e) => {
    if (e.repeat) return
    if (e.key === 'ArrowLeft') commit('flag')
    if (e.key === 'ArrowRight') commit('approve')
  }
  window.addEventListener('keydown', onKey)

  return () => {
    timer.stop()
    detachSwipe()
    window.clearTimeout(flyTimeout)
    window.removeEventListener('keydown', onKey)
  }
}

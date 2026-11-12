import { h, mount, meter, linkButton } from './dom.js'
import { t, tx } from '../i18n/index.js'
import { daySummary, pickHeadline, rankFor, emojiFor } from '../game/scoring.js'
import { CONFIG } from '../config.js'

function adSlot(lang) {
  return CONFIG.monetization.adsEnabled ? h('div', { class: 'ad-slot', id: 'ad-slot', text: t('adSlot', lang) }) : null
}

export function renderDayEnd(root, app, actions) {
  const { game, lang } = app
  const s = (key, vars) => t(key, lang, vars)
  const finishedDay = game.dayIndex
  const stats = daySummary(game.history, finishedDay)

  mount(
    root,
    h(
      'section',
      { class: 'screen day-end' },
      h('h2', { class: 'screen-title', text: s('dayOver', { n: finishedDay + 1 }) }),
      h('p', { class: 'muted', text: s('dayStats', stats) }),
      h(
        'article',
        { class: 'newspaper' },
        h('div', { class: 'newspaper-mast', text: s('newspaper') }),
        h('p', { class: 'newspaper-headline', text: tx(pickHeadline(game.scandal, finishedDay), lang) }),
      ),
      h(
        'div',
        { class: 'meters' },
        meter({ label: `📈 ${s('stock')}`, value: game.stock, max: CONFIG.limits.maxStock, tone: 'stock', display: `$${game.stock}` }),
        meter({ label: `🔥 ${s('scandal')}`, value: game.scandal, max: CONFIG.limits.maxScandal, tone: 'scandal', display: `${game.scandal}%` }),
      ),
      h(
        'div',
        { class: 'stack' },
        h('button', { class: 'btn btn-primary', onClick: actions.nextDay, text: s('nextDay') }),
        h('button', { class: 'btn btn-lobby', onClick: actions.lobby, disabled: game.lobbyUsed, text: game.lobbyUsed ? s('lobbyUsed') : s('lobby') }),
      ),
      adSlot(lang),
    ),
  )
  return () => {}
}

function endingKeys(game) {
  if (game.status === 'won') return ['wonTitle', 'wonText']
  return game.lostReason === 'crashed' ? ['crashedTitle', 'crashedText'] : ['resignedTitle', 'resignedText']
}

function grid(history) {
  const rows = history.reduce((acc, entry) => {
    const row = acc[entry.day] ?? []
    return { ...acc, [entry.day]: [...row, emojiFor(entry.kind)] }
  }, {})
  return h('div', { class: 'grid', 'aria-hidden': 'true' }, Object.values(rows).map((row) => h('div', { text: row.join('') })))
}

function monetizationLinks(lang) {
  const { tipJarUrl, merchUrl } = CONFIG.monetization
  return [
    tipJarUrl ? linkButton({ href: tipJarUrl, label: t('tip', lang) }) : null,
    merchUrl ? linkButton({ href: merchUrl, label: t('merch', lang) }) : null,
  ]
}

export function renderGameOver(root, app, actions) {
  const { game, lang, shareStatus } = app
  const s = (key, vars) => t(key, lang, vars)
  const [titleKey, textKey] = endingKeys(game)
  const rank = rankFor(game.score)
  const shareLabels = { copied: s('copied'), failed: s('shareFailed') }

  mount(
    root,
    h(
      'section',
      { class: `screen over over-${game.status}` },
      h('div', { class: 'over-emoji', 'aria-hidden': 'true', text: game.status === 'won' ? '🏆' : '🧥💥' }),
      h('h2', { class: 'screen-title', text: s(titleKey) }),
      h('p', { class: 'muted', text: s(textKey) }),
      h('div', { class: 'final-score' }, h('b', { text: String(game.score) }), h('span', { text: s('score') })),
      h('p', { class: 'rank' }, h('span', { text: `${s('rank')}: ` }), h('b', { text: tx(rank.title, lang) })),
      grid(game.history),
      h('p', { class: 'legend', text: s('legend') }),
      h(
        'div',
        { class: 'stack' },
        h('button', { class: 'btn btn-primary', onClick: actions.share, text: shareLabels[shareStatus] ?? s('share') }),
        h('button', { class: 'btn btn-ghost', onClick: actions.again, text: s('again') }),
        h('button', { class: 'btn btn-ghost', onClick: actions.toMenu, text: s('menu') }),
        monetizationLinks(lang),
      ),
      adSlot(lang),
      h('p', { class: 'disclaimer', text: s('disclaimer') }),
    ),
  )
  return () => {}
}

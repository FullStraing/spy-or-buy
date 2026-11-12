import { h, mount } from './dom.js'
import { t } from '../i18n/index.js'

export function renderMenu(root, app, actions) {
  const { lang, dailyNo, dailyResult } = app
  const s = (key, vars) => t(key, lang, vars)

  const dailyButton = h(
    'button',
    { class: 'btn btn-primary', onClick: actions.startDaily },
    h('span', { text: s('daily', { n: dailyNo }) }),
    dailyResult ? h('small', { text: s('dailyDone', { score: dailyResult.score }) }) : null,
  )

  mount(
    root,
    h(
      'section',
      { class: 'screen menu' },
      h('button', { class: 'lang', onClick: actions.toggleLang, text: s('langToggle') }),
      h('div', { class: 'logo', 'aria-hidden': 'true' }, h('span', { text: '🕵️' }), h('span', { text: '🧥' }), h('span', { text: '💾' })),
      h('h1', { class: 'title', text: s('title') }),
      h('p', { class: 'tagline', text: s('tagline') }),
      h('p', { class: 'intro', text: s('intro') }),
      h('ul', { class: 'rules' }, ['rule1', 'rule2', 'rule3', 'rule4'].map((k) => h('li', { text: s(k) }))),
      h('div', { class: 'stack' }, dailyButton, h('button', { class: 'btn btn-ghost', onClick: actions.startFree, text: s('freePlay') })),
      h('p', { class: 'disclaimer', text: s('disclaimer') }),
    ),
  )
}

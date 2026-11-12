// App shell: owns the (immutable) app state and routes between screens.
import { CONFIG } from './config.js'
import { createGame, decide, startNextDay, useLobby } from './game/state.js'
import { seedFromString } from './game/rng.js'
import { buildShareText, dailyNumber, dailySeed, rankFor } from './game/scoring.js'
import { detectLang, t, tx } from './i18n/index.js'
import { loadPrefs, savePrefs, shareText, vibrate } from './ui/platform.js'
import { renderMenu } from './ui/menu.js'
import { renderGame } from './ui/game.js'
import { renderDayEnd, renderGameOver } from './ui/results.js'

const root = document.getElementById('app')
const prefs = loadPrefs(CONFIG.storageKey)
const todaySeed = () => dailySeed(new Date())
const storedDaily = () => loadPrefs(CONFIG.storageKey).daily?.[todaySeed()] ?? null

let app = Object.freeze({
  screen: 'menu',
  lang: prefs.lang === 'ru' || prefs.lang === 'en' ? prefs.lang : detectLang(navigator.language),
  dailyNo: dailyNumber(new Date()),
  dailyResult: storedDaily(),
  mode: null,
  game: null,
  feedback: null,
  shareStatus: null,
})
let cleanup = () => {}
let feedbackTimeout = 0

const SCREENS = Object.freeze({ menu: renderMenu, game: renderGame, dayEnd: renderDayEnd, over: renderGameOver })

function persist(patch) {
  const next = { ...loadPrefs(CONFIG.storageKey), ...patch }
  savePrefs(CONFIG.storageKey, next)
  return next
}

function setApp(patch) {
  app = Object.freeze({ ...app, ...patch })
  render()
}

function render() {
  cleanup()
  document.documentElement.lang = app.lang
  cleanup = SCREENS[app.screen](root, app, actions) ?? (() => {})
}

function startGame(mode) {
  // Recompute the date on every start so a tab left open past midnight gets the new case.
  const seed = mode === 'daily' ? seedFromString(todaySeed()) : seedFromString(`free-${Date.now()}-${Math.random()}`)
  setApp({ mode, dailyNo: dailyNumber(new Date()), game: createGame({ seed }), screen: 'game', feedback: null, shareStatus: null })
}

/** Wordle rules: only the FIRST daily attempt is recorded (and shown in the menu). */
function saveDailyResult(game) {
  if (app.mode !== 'daily') return null
  const existing = storedDaily()
  if (existing) return existing
  const result = { score: game.score, status: game.status }
  persist({ daily: { [todaySeed()]: result } })
  return result
}

function continueAfterFeedback() {
  window.clearTimeout(feedbackTimeout)
  if (!app.feedback) return
  const { game } = app
  if (game.status === 'playing') return setApp({ feedback: null, screen: 'game' })
  if (game.status === 'day-end') return setApp({ feedback: null, screen: 'dayEnd' })
  return setApp({ feedback: null, screen: 'over', dailyResult: saveDailyResult(game) ?? app.dailyResult })
}

function shareLabel() {
  return app.mode === 'daily' ? t('shareDaily', app.lang, { n: app.dailyNo }) : t('shareFree', app.lang)
}

const actions = Object.freeze({
  toggleLang() {
    const lang = app.lang === 'ru' ? 'en' : 'ru'
    persist({ lang })
    setApp({ lang })
  },
  startDaily: () => startGame('daily'),
  startFree: () => startGame('free'),
  decide(decision) {
    if (app.feedback || app.screen !== 'game') return
    const { state, outcome } = decide(app.game, decision)
    if (!outcome.correct) vibrate(60)
    setApp({ game: state, feedback: outcome })
    feedbackTimeout = window.setTimeout(continueAfterFeedback, CONFIG.feedbackMs + (outcome.fact ? 900 : 0))
  },
  continue: continueAfterFeedback,
  lobby() {
    setApp({ game: useLobby(app.game) })
  },
  /** Used by the playing screen, which patches its own HUD instead of re-rendering. */
  lobbyInPlace() {
    app = Object.freeze({ ...app, game: useLobby(app.game) })
    return app.game
  },
  nextDay() {
    setApp({ game: startNextDay(app.game), screen: 'game' })
  },
  async share() {
    const sharedGame = app.game
    const text = buildShareText({
      state: sharedGame,
      t: (key, vars) => t(key, app.lang, vars),
      label: shareLabel(),
      url: `${window.location.origin}${window.location.pathname}`,
      rankTitle: tx(rankFor(sharedGame.score).title, app.lang),
    })
    const status = await shareText(text)
    // The player may have left the results screen while the share sheet was open.
    if (app.screen !== 'over' || app.game !== sharedGame) return
    setApp({ shareStatus: status })
  },
  // The daily case is one attempt per day; replays continue as free play.
  again: () => startGame('free'),
  toMenu: () => setApp({ screen: 'menu', game: null, feedback: null }),
})

window.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return
  if (app.feedback) {
    e.preventDefault()
    continueAfterFeedback()
  }
})

render()

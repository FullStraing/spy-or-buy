// Browser side effects: countdown timer, safe storage, sharing.

// rAF stops in hidden tabs; capping each step means time spent away never counts.
const MAX_STEP_MS = 100

/** Countdown that effectively pauses while the tab is hidden. */
export function createTimer({ seconds, onTick, onExpire }) {
  const totalMs = seconds * 1000
  let elapsed = 0
  let last = performance.now()
  let raf = 0
  let stopped = false

  const loop = (now) => {
    if (stopped) return
    elapsed += Math.min(Math.max(0, now - last), MAX_STEP_MS)
    last = now
    const left = Math.max(0, 1 - elapsed / totalMs)
    onTick(left)
    if (left <= 0) {
      stopped = true
      onExpire()
      return
    }
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return {
    stop() {
      stopped = true
      cancelAnimationFrame(raf)
    },
  }
}

export function loadPrefs(key) {
  try {
    const raw = window.localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function savePrefs(key, prefs) {
  try {
    window.localStorage.setItem(key, JSON.stringify(prefs))
    return true
  } catch {
    return false
  }
}

/** Native share sheet on phones, clipboard elsewhere. */
export async function shareText(text) {
  try {
    if (navigator.share) {
      await navigator.share({ text })
      return 'shared'
    }
  } catch (error) {
    if (error?.name === 'AbortError') return 'cancelled'
  }
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}

export function vibrate(ms) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    // Vibration is a nicety; ignore unsupported devices.
  }
}

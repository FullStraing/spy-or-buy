// All tunable numbers live here so balance and monetization can change without touching logic.

const deepFreeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze)
    Object.freeze(value)
  }
  return value
}

export const CONFIG = deepFreeze({
  days: [
    { cards: 4, seconds: 10, maxTier: 1 },
    { cards: 5, seconds: 9, maxTier: 2 },
    { cards: 6, seconds: 8, maxTier: 2 },
    { cards: 7, seconds: 7, maxTier: 3 },
    { cards: 8, seconds: 6, maxTier: 3 },
  ],
  spyChance: 0.45,
  ceoPressureChance: 0.2,
  ceoPressureSpyChance: 0.75,
  herringChance: 0.5,
  start: { stock: 100, scandal: 0 },
  limits: { maxScandal: 100, minStock: 0, maxStock: 200 },
  scoring: {
    saleStock: 6,
    salePoints: 100,
    catchPoints: 150,
    catchScandal: -5,
    leakScandal: 25,
    leakStock: -4,
    falseAlarmStock: -12,
    profilingScandal: 10,
    streakBonus: 0.2,
    maxStreakBonus: 5,
    lobbyScandal: -30,
  },
  headlineTiers: { mid: 30, high: 60 },
  dailyEpoch: '2026-11-12',
  feedbackMs: 1700,
  storageKey: 'spy-or-buy:v1',
  // Monetization hooks. Empty string / false = hidden in the UI.
  monetization: {
    tipJarUrl: '',
    merchUrl: '',
    adsEnabled: false,
  },
})

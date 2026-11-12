# 🕵️ SPY OR BUY?

**A satirical swipe game about the great GPU-smuggling saga of 2026.**

You are the brand-new Head of Compliance at **LeatherChip**, hired the morning after the leather-jacket CEO admitted to a *"completely normal and not unusual"* relationship with a customer. Buyers line up for GPUs. Swipe right to sell. Swipe left to flag a spy.

The catch: **judge behaviour, not passports.** Spies give themselves away by asking for chips inside fake baby bumps, shipping them between live lobsters, or expensing 340 hair dryers. Flag an honest buyer because they speak Mandarin or have a cat named Dumpling, and HR fines you for profiling.

- 🗓 **Daily Case**: the same seeded deck for everyone each day, Wordle-style
- 📤 **Share grid**: 🟩 correct · 🟥 leak · 🟨 false alarm · 🟪 profiling
- ⏱ **Timer**: hesitate and the CEO approves it himself
- 🏛 **Lobby Washington**: one free −30% scandal per game
- 🌍 **RU / EN**, mobile-first, no build step, no tracking

> Parody. All characters and companies are fictional. Red flags are loosely inspired by publicly reported chip-smuggling cases (prosthetic bellies, lobster crates, hair-dryered serial labels, cardboard dummy servers, bought identities).

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests
npm run coverage   # coverage report (80% threshold)
```

## Structure

| Path | What |
|---|---|
| `src/game/` | Pure, immutable game logic: seeded RNG, deck builder, reducer, scoring/share text |
| `src/data/` | All jokes: red flags, neutral facts, herrings, headlines, ranks, name pools |
| `src/i18n/` | UI strings (RU/EN) and helpers |
| `src/ui/` | DOM rendering, swipe, timer, storage, share |
| `src/config.js` | Balance numbers and monetization switches |
| `tests/` | Vitest suites |

Adding a joke means adding an entry to `src/data/redFlags.js` with `tier`, `text` and `reveal` in both languages. The content tests make sure nothing is missing.

## Monetization hooks

Everything is off by default and controlled in `src/config.js → monetization`:

- `tipJarUrl`: "Support the author" button (Boosty / Buy Me a Coffee / Ko-fi)
- `merchUrl`: "I Approved the Lobsters" merch link
- `adsEnabled`: shows an ad slot on the day-end and game-over screens (wire up an ad network there)

## Деплой (по-русски)

Пуш в `main` автоматически деплоит игру на GitHub Pages (`.github/workflows/pages.yml`). В репозитории: Settings → Pages → Source: **GitHub Actions**.

## License

MIT

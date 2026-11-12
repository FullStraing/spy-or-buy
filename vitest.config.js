import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/game/**', 'src/data/**', 'src/i18n/**', 'src/config.js'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
})

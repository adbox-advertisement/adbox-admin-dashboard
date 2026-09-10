import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Standalone from vite.config.ts: unit tests don't need the Tailwind plugin
// or the production chunking strategy, only the React transform and the
// same "@" alias the app code relies on.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    restoreMocks: true,
    exclude: ['node_modules/**', 'dist/**', 'tests/smoke/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

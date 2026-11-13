import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep shared class-name helpers out of the on-demand chart bundle.
          framework: ['react', 'react-dom/client', 'react-router-dom', 'clsx'],
          charts: ['recharts'],
        },
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        // Set ADBOX_API_PROXY_TARGET in .env.local (for example
        // https://admin-api.adboxgh.com) to develop against a remote API. No
        // VITE_ prefix, so it stays out of the browser bundle.
        target: loadEnv(mode, __dirname, '').ADBOX_API_PROXY_TARGET?.trim() || 'http://localhost:3005',
        changeOrigin: true,
        secure: false,
        // The live-activity socket (/api/v1/socket.io) upgrades through this proxy.
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))

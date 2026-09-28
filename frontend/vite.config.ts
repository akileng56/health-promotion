import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_URL || '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['dashboards.health.go.ug', 'localhost', '127.0.0.1'],
    watch: {
      usePolling: true,
    },
  },
})

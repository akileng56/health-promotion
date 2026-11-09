import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'subpath-dev-redirect',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/health-promotions' || req.url?.startsWith('/health-promotions?')) {
            const query = req.url.slice('/health-promotions'.length)
            res.writeHead(302, { Location: `/health-promotions/${query}` })
            res.end()
            return
          }
          if (req.url?.startsWith('/assets/')) {
            req.url = `/health-promotions${req.url}`
          } else if (
            req.url &&
            req.url !== '/' &&
            !req.url.startsWith('/health-promotions/') &&
            !req.url.startsWith('/@') &&
            !req.url.startsWith('/__vite') &&
            !req.url.startsWith('/node_modules/') &&
            !req.url.startsWith('/src/')
          ) {
            res.writeHead(302, { Location: `/health-promotions${req.url}` })
            res.end()
            return
          }
          next()
        })
      },
    },
    {
      name: 'relative-asset-urls',
      apply: 'build',
      enforce: 'post',
      transformIndexHtml(html) {
        return html.replace(/(href|src)="(?:\/health-promotions\/|\.?\/)(assets\/[^"]+)"/g, '$1="$2"')
      },
    },
  ],
  base: '/health-promotions/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['dashboards.health.go.ug', 'localhost', '127.0.0.1'],
    watch: {
      usePolling: true,
    },
  },
})

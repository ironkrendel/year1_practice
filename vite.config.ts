import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from "@vitejs/plugin-vue";

const rewriteSlashToIndexHtml = () => {
  return {
    name: 'rewrite-slash-to-index-html',
    apply: 'serve',
    enforce: 'post',
    configureServer(server) {
      // rewrite / as index.html
      server.middlewares.use('/', (req, _, next) => {
        if (req.url === '/') {
          req.url = '/index.html'
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), rewriteSlashToIndexHtml()],
  appType: 'mpa',
  rollupOptions: {
    input: {
      main: resolve(__dirname, 'index.html'),
      nested: resolve(__dirname, 'index.html'),
    },
  },
  server: {
    allowedHosts: ['kasaneteto.ru'],
  },
});

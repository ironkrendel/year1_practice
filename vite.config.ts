import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

const rewriteSlashToIndexHtml = () => {
  return {
    name: "rewrite-slash-to-index-html",
    apply: "serve",
    enforce: "post",
    configureServer(server) {
      // rewrite / as index.html
      server.middlewares.use("/", (req, _, next) => {
        if (req.url === "/") {
          req.url = "/index.html";
        }
        next();
      });
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), rewriteSlashToIndexHtml(), tailwindcss()],
  appType: "mpa",
  rollupOptions: {
    input: {
      main: resolve(__dirname, "index.html"),
      nested: resolve(__dirname, "index.html"),
    },
  },
  server: {
    allowedHosts: ["kasaneteto.ru"],
    proxy: {
      '/api': {
        target: "http://dbrobo1.mf.bmstu.ru/db_api_REST/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    },
  },
});

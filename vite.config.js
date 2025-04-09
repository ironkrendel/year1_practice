import { resolve } from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import fs from "node:fs";

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

function getHtmlEntries() {
    const pagesDir = path.resolve(__dirname, "");
    const entries = {};

    // Read all files in the directory
    const files = fs.readdirSync(pagesDir);

    // Filter out HTML files
    const htmlFiles = files.filter((file) => file.endsWith(".html"));

    // Create entries for each HTML file
    htmlFiles.forEach((file) => {
        const name = path.basename(file, ".html");
        entries[name] = path.resolve(pagesDir, file);
    });

    return entries;
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), rewriteSlashToIndexHtml(), tailwindcss()],
    appType: "mpa",
    build: {
        rollupOptions: {
            input: {
              main: resolve(__dirname, "index.html"),
              teto: resolve(__dirname, "teto/index.html"),
            }
            // input: {
                // "/": "/src/main.ts",
                // "/teto/": "/teto/teto.ts",
            // },
            // input: getHtmlEntries(),
        },
    },
    rollupOptions: {
        input: {
            main: resolve(__dirname, "index.html"),
            nested: resolve(__dirname, "index.html"),
        },
        // input: getHtmlEntries(),
    },
    server: {
        allowedHosts: ["kasaneteto.ru"],
        proxy: {
            "/api": {
                target: "http://dbrobo1.mf.bmstu.ru/db_api_REST/",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
    },
});

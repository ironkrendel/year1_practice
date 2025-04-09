// // import { resolve } from "path";
// import { defineConfig, ViteDevServer, PluginOption } from "vite";
// import vue from "@vitejs/plugin-vue";
// import tailwindcss from "@tailwindcss/vite";
// import path from 'path';
// import fs from 'fs';

// function rewriteSlashToIndexHtml() {
//   const ret = {
//     name: "rewrite-slash-to-index-html",
//     apply: "serve",
//     enforce: "post",
//     configureServer(server: ViteDevServer) {
//       // rewrite / as index.html
//       server.middlewares.use("/", (req: any, _: any, next: any) => {
//         if (req.url === "/") {
//           req.url = "/index.html";
//         }
//         next();
//       });
//     },
//   };
//   return ret as PluginOption;
// }

// function getHtmlEntries() {
//   const pagesDir = path.resolve(__dirname, "/teto/");
//   const entries: Record<string, string> = {};

//   // Read all files in the directory
//   const files = fs.readdirSync(pagesDir);

//   // Filter out HTML files
//   const htmlFiles = files.filter((file) => file.endsWith(".html"));

//   // Create entries for each HTML file
//   htmlFiles.forEach((file) => {
//     const name = path.basename(file, ".html");
//     entries[name] = path.resolve(pagesDir, file);
//   });

//   return entries;
// }

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [vue(), rewriteSlashToIndexHtml(), tailwindcss()],
//   // appType: "mpa",
//   build: {
//     rollupOptions: {
//       // input: {
//       //   main: resolve(__dirname, "index.html"),
//       //   nested: resolve(__dirname, "index.html"),
//       // }
//       // input: {
//         // "/": "/src/main.ts",
//         // "/teto/": "/teto/teto.ts",
//       // }
//       input: getHtmlEntries(),
//     }
//   },
//   // worker: {
//     // rollupOptions: {
//       // input: {
//         // main: resolve(__dirname, "index.html"),
//         // nested: resolve(__dirname, "index.html"),
//       // },
//     // },
//   // },
//   server: {
//     allowedHosts: ["kasaneteto.ru"],
//     proxy: {
//       "/api": {
//         target: "http://dbrobo1.mf.bmstu.ru/db_api_REST/",
//         changeOrigin: true,
//         rewrite: (path: string) => path.replace(/^\/api/, ""),
//       },
//     },
//   },
// });

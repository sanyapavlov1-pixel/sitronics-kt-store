import devServer from "@hono/vite-dev-server"
import path from "path"
const __dirname = import.meta.dirname
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    {
      name: "kimi-preview-host",
      config(config) {
        const hosts = config.server?.allowedHosts;
        if (hosts === true || hosts?.includes("3000.proxy.internal")) return;
        return { server: { allowedHosts: ["3000.proxy.internal"] } };
      },
    },
    devServer({ entry: "api/boot.ts", exclude: [/^\/(?!api\/).*$/] }),
    inspectAttr(), react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo.svg", "icon.svg"],
      manifest: {
        name: "Sitronics KT — оборудование и системы",
        short_name: "Sitronics KT",
        description: "Каталог морского оборудования и систем автоматизации с оформлением B2B-заявки.",
        theme_color: "#181c26",
        background_color: "#f7f8fa",
        display: "standalone",
        lang: "ru",
        icons: [
          { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//, /^\/admin/],
        runtimeCaching: [{ urlPattern: /^https:\/\/sitronics-kt\.ru\/.*/i, handler: "CacheFirst", options: { cacheName: "kt-product-images", expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 } } }],
      },
    })],
  server: { port: 3000 },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./contracts"),
      "@db": path.resolve(__dirname, "./db"),
      "db": path.resolve(__dirname, "./db"),
    },
  },
  envDir: path.resolve(__dirname),
  build: { outDir: path.resolve(__dirname, "dist/public"), emptyOutDir: true },
});

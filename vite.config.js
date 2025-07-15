import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
// Removed duplicate export default

import { fileURLToPath, URL } from "node:url"
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@style": fileURLToPath(new URL("./src/styles", import.meta.url)),
      "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
      "@public": fileURLToPath(new URL("./public", import.meta.url)),
      "@assets": fileURLToPath(new URL("./assets", import.meta.url)),
      "@router": fileURLToPath(new URL("./src/router", import.meta.url))
    }
  }
})
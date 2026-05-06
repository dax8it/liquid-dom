import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const liquidGlassDomDist = fileURLToPath(
  new URL('../../packages/core/dist', import.meta.url),
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ['@liquid-dom/core'],
  },
  server: {
    watch: {
      ignored: [`!${liquidGlassDomDist}/**`],
    },
  },
})

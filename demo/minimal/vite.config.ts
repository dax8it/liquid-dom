import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const liquidGlassDomDist = fileURLToPath(
  new URL('../../packages/liquid-glass-dom/dist', import.meta.url),
)

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['liquid-glass-dom'],
  },
  server: {
    watch: {
      ignored: [`!${liquidGlassDomDist}/**`],
    },
  },
})

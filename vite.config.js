import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves this app from /personnal-intra/ — keep local dev at the root.
  base: command === 'build' ? '/personnal-intra/' : '/',
  plugins: [react(), tailwindcss()],
}))

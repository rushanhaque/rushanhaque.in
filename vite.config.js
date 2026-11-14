import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5310, strictPort: false },
  preview: { port: 5311 },
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    // the prerender reads this to preload each page's own chunk, so nothing waits on a waterfall
    manifest: true,
    modulePreload: { polyfill: false },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5300, strictPort: false },
  preview: { port: 5301 },
  // bundled into the server build, because their packages are not all clean Node modules
  ssr: { noExternal: ['gsap', '@gsap/react', 'lenis', 'react-router', 'react-router-dom'] },
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 900,
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  server: { port: 5190, strictPort: true },
  preview: { port: 5191 },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    // the server build only renders pages to HTML at build time; chunking matters for the browser
    rollupOptions: isSsrBuild ? {} : {
      output: {
        manualChunks: { gsap: ['gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', 'gsap/ScrambleTextPlugin', 'gsap/DrawSVGPlugin', 'gsap/CustomEase'], react: ['react', 'react-dom', 'react-router-dom'] },
      },
    },
  },
}))

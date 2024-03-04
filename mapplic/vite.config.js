import 'vite/modulepreload-polyfill'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  build: {
    manifest: true,
    rollupOptions: {
      input: '/path/to/main.js',
      output: {
        assetFileNames: "mapplic.[ext]",
        entryFileNames: "mapplic.js",
        chunkFileNames: "mapplic.js"
      }
    }
  },
  server: { port: 1010 },
  plugins: [react()]
})
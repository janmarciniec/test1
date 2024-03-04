import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        assetFileNames: 'admin/mapplic-admin.[ext]',
        entryFileNames: 'admin/mapplic-admin.js',
        chunkFileNames: 'admin/[name].js'
      }
    }
  },
  plugins: [react()],
  server: { port: 2020 }
})
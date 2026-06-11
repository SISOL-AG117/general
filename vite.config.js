import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/general/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: 'index.source.html',
    },
  },
})

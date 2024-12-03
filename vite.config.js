import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001, // Cambia 3001 por el puerto que prefieras
    proxy: {
      '/caja': {
        target: 'https://server-backend-bl8a.onrender.com', // Backend
        secure: false,
      }
    }
  }
})


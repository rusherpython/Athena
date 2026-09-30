import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/user': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/profile': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/chat': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/tasks': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/reminders': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/memory': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/rewards': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/wellness': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/safety': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/lifestyle': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/behavior': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces for Docker
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.DOCKER_ENV ? 'http://backend:3000' : 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})

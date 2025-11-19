import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0', // Listen on all network interfaces for Docker
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Better for Docker environments
      interval: 1000,
    },
    hmr: {
      overlay: false, // Disable error overlay that can cause delays
    },
    proxy: {
      '/api': {
        target: process.env.DOCKER_ENV ? 'http://backend:3000' : 'http://localhost:3000',
        changeOrigin: true,
        timeout: 30000, // 30 second timeout
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})

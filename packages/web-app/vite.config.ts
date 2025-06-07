import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Frontend dev server port
    // Proxy is handled by the 'proxy' field in package.json for CRA,
    // but for Vite, it's configured here if needed.
    // However, the "proxy" in package.json is a CRA feature.
    // For Vite, proxying is done in vite.config.js.
    // The backend is on port 3000 (from src/index.ts of backend)
    proxy: {
      '/api': { // Proxy requests from /api on frontend to backend
        target: 'http://localhost:3000',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '') // if backend doesn't have /api prefix
      }
    }
  }
})

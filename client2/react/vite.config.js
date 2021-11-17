import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: "10.0.0.83",
    cors: true,
    proxy: {
      "*": {
        target: "http://localhost:5000",
        secure: false,
        changeOrigin: true
      }
    }
  }
})

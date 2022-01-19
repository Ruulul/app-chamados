import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
//import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 9999,
    host: "10.0.0.5",
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

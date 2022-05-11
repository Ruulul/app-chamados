import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
//import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
import fs from 'fs'
const key = fs.readFileSync('./ssl/key.pem')
const cert = fs.readFileSync('./ssl/cert.pem')

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9999,
    host: "10.0.0.5",
    cors: true,
    https: {
      key,
      cert
    }
  },
  build: {
    target: ['es2020']
  }
})

// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',  // ✅ Flask 서버 주소
      '/upload_output_json': 'http://localhost:5000',
      '/upload_csv': 'http://localhost:5000',  // ✅ 이 줄 추가!
    }
  }
})

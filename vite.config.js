// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,             // ✅ 외부 접속 허용을 위해 추가
    port: 5173,             // 생략 가능 (기본값)
    proxy: {
      '/api': 'http://localhost:5000',
      '/upload_output_json': 'http://localhost:5000',
      '/upload_csv': 'http://localhost:5000',
    }
  }
})

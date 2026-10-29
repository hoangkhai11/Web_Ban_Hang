import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Chuyển tiếp /api sang NestJS (Back-end) khi chạy dev → không cần cấu hình CORS
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})

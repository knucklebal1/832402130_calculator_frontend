import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    // 启动开发服务器后自动打开浏览器
    open: true,
    // 开发环境把 /api 代理到后端，前端与后端同源，天然没有跨域问题
    // 注意：这里必须写 127.0.0.1 而不是 localhost。
    // 本机 localhost 会优先解析成 IPv6 的 ::1，而 Spring Boot 内置 Tomcat
    // 默认只监听 IPv4 的 0.0.0.0，用 localhost 会报 ECONNREFUSED。
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true
      }
    }
  }
})

import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 短路径 @ -> ./src
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 8080,
    // 可选：把接口请求代理到 NestJS 后端
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:1024',
        changeOrigin: true,
      },
    },
  },
});

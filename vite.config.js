import { join } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 自动导入ElementPlus
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': join(__dirname, 'src')
    }
  },
  server: {
    // host: '0.0.0.0',
    proxy: {
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  }
})

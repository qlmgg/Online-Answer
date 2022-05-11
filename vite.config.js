import { join } from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    Vue(),
    AutoImport({
      // 自动导入vue vue-router vuex 的api
      imports: ['vue', 'vue-router', 'vuex'],
      // 解决eslint错误
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true
      },
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      // 解析器
      resolvers: [
        // 自动导入element-plus组件
        ElementPlusResolver()
      ],
    }),
    // 传统浏览器支持
    legacy({
      targets: ['defaults', 'not IE 11']
    })
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
      },
      '/onlineanswer/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/onlineanswer\/api/, '')
      }
    }
  }
})

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 已在vite.config.js中配置了按需导入
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'

import './style/theme-light.css'

createApp(App).use(router).use(store).mount('#app')

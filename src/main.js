import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const app = createApp(App)
    // main.js 应该包含这段
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
const pinia = createPinia()

// 2. 将持久化插件安装到 Pinia 中
pinia.use(piniaPluginPersistedstate)


app.use(ElementPlus)
    // 3. 挂载 Pinia
app.use(pinia)
app.use(router)
app.mount('#app')
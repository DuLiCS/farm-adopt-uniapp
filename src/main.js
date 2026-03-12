import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')

// 导出 app 供 uni 插件使用
export default app
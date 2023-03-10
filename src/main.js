import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'


/* axios配置 */
// 全局base url
axios.defaults.baseURL = 'http://localhost:8080'
// 允许携带cookie
axios.defaults.withCredentials = true

const app = createApp(App)
app.use(ElementPlus)
app.use(VueAxios, axios)
app.mount('#app')

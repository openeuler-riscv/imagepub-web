import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

if (process.env.NODE_ENV !== 'development') {
    console.log = function() {};
}

createApp(App).use(router).use(pinia).use(ElementPlus).mount('#app')

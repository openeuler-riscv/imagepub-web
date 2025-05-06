import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import messages from './i18n/locales'

const i18n = createI18n({
    locale: 'zh', // 默认语言
    messages
});

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

if (process.env.NODE_ENV !== 'development') {
    console.log = function() {};
}

createApp(App).use(router).use(i18n).use(pinia).use(ElementPlus).mount('#app')

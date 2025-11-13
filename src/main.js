import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import './styles/variables.css'
import './styles/theme.css'
import { createPinia } from 'pinia';




import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { useDarkModeStore } from '@/store/darkMode'
import i18n from '@/i18n/index.js'


// 解析URL中的redirect参数
function getRedirectPath() {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('redirect');
}

// 初始化时检查是否有重定向需求
const redirectPath = getRedirectPath();
if (redirectPath) {
    // 清除URL中的redirect参数（避免刷新后再次重定向）
    history.replaceState(null, null, window.location.pathname);
    
    // 跳转到原路由（确保路由存在，否则会触发路由的404）
    router.push(redirectPath).catch(err => {
        // 若原路由不存在，跳转到首页或自定义404
        if (err.name !== 'NavigationDuplicated') {
            router.push('/');
        }
    });
}


const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App)
app.use(router)
app.use(i18n)
app.use(pinia)
app.use(ElementPlus)

// 现在可以安全地用 store
const darkModeStore = useDarkModeStore()
darkModeStore.initTheme()   // 这一步必须在 app.mount 之前








app.mount('#app')



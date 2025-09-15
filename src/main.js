import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import './styles/variables.css'
import './styles/theme.css'
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { getCookie, setCookie } from './utils/cookie'
import { useDarkModeStore } from '@/store/darkMode'

import messages from './i18n/locales'

// 检查url参数、cookie、浏览器语言
function detectLang() {
  // 1. url参数
  const urlParams = new URLSearchParams(window.location.search);
  let lang = urlParams.get('lang');
  if (lang) {
    setCookie('lang', lang);
    return lang;
  }
  // 2. cookie
  lang = getCookie('lang');
  if (lang) return lang;
  // 3. 浏览器
  lang = navigator.language || navigator.userLanguage;
  if (lang.startsWith('zh')) return 'zh_CN';
  if (lang.startsWith('en')) return 'en_US';
  // 4. 默认中文
  return 'zh_CN';
}


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

if (process.env.NODE_ENV !== 'development') {
    console.log = function() {};
}

const i18n = createI18n({
    locale: detectLang(),
    messages
});

const app = createApp(App)
app.use(router)
app.use(i18n)
app.use(pinia)
app.use(ElementPlus)

// 现在可以安全地用 store
const darkModeStore = useDarkModeStore()
darkModeStore.initTheme()   // 这一步必须在 app.mount 之前

app.mount('#app')

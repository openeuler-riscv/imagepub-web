import { createI18n } from 'vue-i18n';
import messages from './locales'
import { getCookie, setCookie } from '@/utils/cookie'

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



const i18n = createI18n({
    legacy: false,
    locale: detectLang(),
    messages
});

export default i18n

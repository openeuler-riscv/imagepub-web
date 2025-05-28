import { defineStore } from 'pinia'
import { getCookie, setCookie } from '@/utils/cookie'

export const useDarkModeStore = defineStore('darkMode', {
  state: () => ({
    isDark: localStorage.getItem('darkMode') === 'true'
  }),
  
  actions: {
    toggleDarkMode() {
      this.isDark = !this.isDark
      localStorage.setItem('darkMode', this.isDark)
      setCookie('darkMode', this.isDark)
      this.applyTheme()
    },
    
    applyTheme() {
      if (this.isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    
    initTheme() {
      // 只在首次加载时自动检测
      if (localStorage.getItem('darkMode') === null) {
        let dark = getCookie('darkMode');
        if (dark === '') {
          // 浏览器深色模式
          dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'true' : 'false';
        }
        this.isDark = dark === 'true';
        localStorage.setItem('darkMode', this.isDark);
        setCookie('darkMode', this.isDark);
      }
      this.applyTheme()
    }
  }
}) 
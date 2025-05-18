import { defineStore } from 'pinia'

export const useDarkModeStore = defineStore('darkMode', {
  state: () => ({
    isDark: localStorage.getItem('darkMode') === 'true'
  }),
  
  actions: {
    toggleDarkMode() {
      this.isDark = !this.isDark
      localStorage.setItem('darkMode', this.isDark)
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
      this.applyTheme()
    }
  }
}) 
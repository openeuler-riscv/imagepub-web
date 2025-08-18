import { defineStore } from 'pinia'

export const useProductDataStore = defineStore('productData', {
  state: () => ({
    proUrl: ''
  }),
  
  actions: {
    // 动作：修改状态的方法（推荐通过方法修改，便于维护和调试）
    // 设置单个参数
    setProUrl(url) {
      this.proUrl = url
    }
},

  // 可选：计算属性（类似 Vue 的 computed）
  getters: {
    // 示例：获取用户角色字符串
    userRoleStr() {
      return this.proUrl
    }
  }
  
}) 
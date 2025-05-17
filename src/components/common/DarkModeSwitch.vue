<template>
  <el-button
    :class="['dark-switch', { 'is-dark': isDark }]"
    @click="store.toggleDarkMode"
    circle
  >
    <el-icon v-if="isDark"><Sunny /></el-icon>
    <el-icon v-else><Moon /></el-icon>
  </el-button>
</template>

<script setup>
import { Sunny, Moon } from '@element-plus/icons-vue'
import { useDarkModeStore } from '@/stores/darkMode'
import { storeToRefs } from 'pinia'

const store = useDarkModeStore()
const { isDark } = storeToRefs(store)
</script>

<style scoped>
.dark-switch {
  padding: 8px;
  border: none;
  background: transparent;
  transition: all 0.3s;
}

.dark-switch:hover {
  transform: scale(1.1);
}

.dark-switch.is-dark {
  color: var(--el-color-primary);
}

:deep(.el-icon) {
  font-size: 18px;
}
</style> 
<template>
  <el-button class="theme-button" :class="{ 'is-dark': isDark }" @click="store.toggleDarkMode" circle>
    <el-icon v-if="isDark">
      <Sunny />
    </el-icon>
    <el-icon v-else>
      <Moon />
    </el-icon>
  </el-button>
</template>

<script setup>
import { Sunny, Moon } from '@element-plus/icons-vue'
import { useDarkModeStore } from '@/store/darkMode'
import { storeToRefs } from 'pinia'

const store = useDarkModeStore()
const { isDark } = storeToRefs(store)
</script>

<style scoped>
.theme-button {
  padding: 8px;
  border: none;
  background: transparent;
  transition: all 0.3s ease;
}

.theme-button:hover {
  transform: scale(1.1);
  background-color: var(--el-color-primary-light-9);
}

.theme-button.is-dark {
  color: var(--el-color-primary);
}

:deep(.el-icon) {
  font-size: 18px;
}
</style>
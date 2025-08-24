<template>
  <img v-if="!isDark" src="../../assets/icons/board/arrowRight.svg" alt="arrow icon"
       style="width: 24px;height: 24px;"
  />
  <img v-else src="../../assets/icons/board/arrowRightDark.svg" alt="arrow icon"
       style="width: 24px;height: 24px;"
  />
</template>

<script setup>
import { useDarkModeStore } from '@/store/darkMode'
import { storeToRefs } from 'pinia'

const store = useDarkModeStore()
const { isDark } = storeToRefs(store)
</script>


<style scoped>

</style>
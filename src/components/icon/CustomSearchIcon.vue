<template>
  <img v-if="!isDark"
      src="../../assets/icons/home/Group%202.png"
      alt=""
      style="width: 5vh;height: 5vh;margin: 8px"

  />

  <img v-else
      src="../../assets/icons/home/Group2Dark.svg"
      alt=""
      style="width: 5vh;height: 5vh;margin: 8px"

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
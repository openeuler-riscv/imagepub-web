<template>
  <img v-if="!isDark" src="../../assets/logo/Frame1@3x.svg" alt="search icon"
       style="margin: 8px"
  />
   <img v-else src="@/assets/logo/logoDark.svg" alt="OERC Logo" />
</template>

<script setup>

import { useDarkModeStore } from '@/store/darkMode'
import { storeToRefs } from 'pinia'

const store = useDarkModeStore()
const { isDark } = storeToRefs(store)


</script>


<style scoped>

</style>
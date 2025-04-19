<template>
  <div class="board-info-title-container">
    <div class="blue-block"></div>
    <div class="board-info-title-text">{{title}}</div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

// 定义 props
const props = defineProps({
  title: {
    type: String,
    default: '板卡信息'
  }
});
</script>

<style scoped>
.board-info-title-container {
  display: flex;
  align-items: center;
  margin-bottom: 0.7rem;
}

.board-info-title-text {
  font-size: 1rem;
  margin-left: 0.5rem;
}

.blue-block {
  width: 4px;
  height: 14px;
  background-color: #012fa6;
}
</style>
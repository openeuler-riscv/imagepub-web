<template>
  <el-card class="component-container">
    <template #header>
      <h2 class="title">{{ props.title }}</h2>
    </template>
    <p class="description">{{ props.description }}</p>
  </el-card>
</template>

<script setup>
import { ElCard } from 'element-plus';

const props = defineProps({
  title: String,
  description: String,
});
</script>

<style scoped>
.component-container {
  padding: 20px;
  border-radius: 8px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.description {
  font-size: 14px;
  color: #777;
}
</style>

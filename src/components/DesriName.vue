<script setup>
const props = defineProps({
  name: {
    type: String
  }
})
</script>

<template>
  <div class="titleBox">
    <div class="blueBlock"></div>
    <div class="name">{{ props.name }}</div>
  </div>
</template>

<style scoped lang="scss">
.titleBox {
  width: fit-content;
  height: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;


  .blueBlock {
    width: 4px;
    height: 14px;
    background-color: rgba(1, 47, 166);
  }

  .name {
    margin-left: 6px;
  }
}
</style>
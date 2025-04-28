<template>
  <div class="help-doc-buttons">
    <el-button type="primary" @click="helpDocVisible = true">查看帮助文档</el-button>
    <el-dialog v-model="helpDocVisible" align-center draggable lock-scroll>
      <HelpDoc :markdownURL="getMarkDownURL()" :boardDetail="boardDetail" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import HelpDoc from '@/components/helpDoc/helpDoc.vue';
const props = defineProps({
  getMarkDownInDocs: {
    type: Function,
    required: true
  },
  boardDetail: {
    type: Object,
    required: true
  }
});

const helpDocVisible = ref(false);

// 获取第一个文档URL
const getMarkDownURL = () => {
  const docs = props.getMarkDownInDocs();
  return docs[0];
};
</script>

<style scoped>
.help-doc-buttons {
  margin: 10px;
}
</style>

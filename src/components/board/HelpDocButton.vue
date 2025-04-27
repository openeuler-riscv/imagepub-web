<template>
  <div class="help-doc-buttons">
    <div v-for="(docURL, index) in getMarkDownInDocs()" :key="index">
      <el-button type="primary" @click="helpDocVisible = true">查看帮助文档</el-button>
      <el-dialog v-model="helpDocVisible" align-center draggable lock-scroll destroy-on-close>
        <HelpDoc :markdownURL="docURL" :boardDetail="boardDetail" />
      </el-dialog>
    </div>
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
</script>

<style scoped>
.help-doc-buttons {
  margin: 10px;
}
</style>

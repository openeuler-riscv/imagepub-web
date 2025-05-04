<template>
  <div class="image-container">
      <TopBackHome />
    <div>镜像下载列表</div>
      <HelpDoc v-if="markdownURL!==''" :markdownURL="markdownURL" :boardDetail="boardDetail" />
  </div>
</template>

<script setup>
import './style.scss';
import TopBackHome from "@/components/common/TopBackHome.vue";
import HelpDoc from "@/components/helpDoc/helpDoc.vue";
import { useBoardStore } from "@/store/boardStore.js";
import { ref, watch, onMounted } from "vue";

const boardStore = useBoardStore();
const boardDetail = ref(boardStore.boardDetail);
const markdownURL = ref('');

const extractDocs = (boardDetailData) => {
  return boardDetailData.value.os?.openEuler?.flatMap(osItem =>
      osItem.imagesuites.flatMap(suite => suite.docs)
  );
};

const processDocs = (docs) => {
  return Array.isArray(docs)? [...new Set(docs)] : [];
};

const updateMarkdownURL = () => {
  const docs = extractDocs(boardDetail);
  const processedDocs = processDocs(docs);
  markdownURL.value = processedDocs.length > 0? processedDocs[0] : ''; // 增加默认值处理
};

watch(boardDetail, () => {
  updateMarkdownURL();
});

onMounted(() => {
  updateMarkdownURL();
});
</script>

<style scoped>
</style>
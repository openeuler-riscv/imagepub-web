<template>
  <div class="image-container">
    <TopBackHome />
    <div v-if="currentVersionInfo">
      <h2>版本信息</h2>
      <p>版本: {{ currentVersionInfo.version }}</p>
      <p>更新日志: {{ currentVersionInfo.changelog }}</p>
    </div>
    <el-table v-if="mirrorList.length > 0" :data="mirrorList" style="width: 100%">
      <el-table-column prop="url" label="镜像文件链接" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="primary" @click="downloadFile(scope.row.url)">下载</el-button>
        </template>
      </el-table-column>
    </el-table>
    <HelpDoc v-if="markdownURL!== ''" :markdownURL="markdownURL" :boardDetail="boardDetail" />
  </div>
</template>

<script setup>
import './style.scss';
import TopBackHome from "@/components/common/TopBackHome.vue";
import HelpDoc from "@/components/helpDoc/helpDoc.vue";
import { useBoardStore } from "@/store/boardStore.js";
import { ref, watch, onMounted } from "vue";
import { ElButton, ElTable, ElTableColumn } from 'element-plus';
import { useRoute } from 'vue-router';

// 假设 boardStore.boardDetail 是传入的数据
const boardStore = useBoardStore();
const boardDetail = ref(boardStore.boardDetail);
const markdownURL = ref('');
const mirrorList = ref([]);
const route = useRoute();
const currentVersion = route.query.version;
const currentVersionInfo = ref(null);

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

const extractMirrorFiles = () => {
  const files = [];
  const openEulerList = boardDetail.value.os?.openEuler;
  if (openEulerList) {
    openEulerList.forEach(osItem => {
      const historyVersions = osItem.historyVersions;
      if (historyVersions) {
        historyVersions.forEach(his => {
          if (his.version === currentVersion) {
            currentVersionInfo.value = his;
            const imageSuites = osItem.imagesuites;
            if (imageSuites) {
              imageSuites.forEach(suite => {
                const suiteFiles = suite.files;
                if (suiteFiles) {
                  suiteFiles.forEach(file => {
                    files.push(file);
                  });
                }
              });
            }
          }
        });
      }
    });
  }
  mirrorList.value = files;
};

watch([boardDetail, route], () => {
  updateMarkdownURL();
  extractMirrorFiles();
});

onMounted(() => {
  updateMarkdownURL();
  extractMirrorFiles();
});

const downloadFile = (url) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = url.split('/').pop();
  a.click();
};
</script>

<style scoped>
</style>
<template>
  <div class="image-container">
    <TopBackHome />
    <div class="top-container">
      <div class="version-and-mirror-list-container">
        <div v-if="currentVersionInfo">
          <h2 class="version-info-title">版本信息</h2>
          <p class="version-info-item">版本: {{ currentVersionInfo.version }}</p>
          <p class="version-info-item">更新日志: {{ currentVersionInfo.changelog }}</p>
        </div>
        <el-table v-if="mirrorList.length > 0" :data="mirrorList" style="width: 100%">
          <el-table-column prop="url" label="镜像文件链接" min-width="150"/>
          <el-table-column prop="tags" label="标签" min-width="60"/>
          <el-table-column prop="hash.sha256" label="sha256" min-width="150"/>
          <el-table-column label="操作" min-width="50">
            <template #default="scope">
              <el-button type="primary" @click="downloadFile(scope.row.url)" plain>下载</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="bottom-container">
      帮助文档
      <div class="help-container">
        <HelpDoc v-if="markdownURL!== ''" :markdownURL="markdownURL" :boardDetail="boardDetail" />
      </div>
    </div>
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
.top-container {
  padding: 20px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  width: 100%;
  display: flex;
  justify-content: center;
  .version-and-mirror-list-container{
    width: 90%;
    background-color: #f9f9f9;
    border-radius: 10px;
    padding: 10px;
  }
}

.version-info-title {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.version-info-item {
  font-size: 1rem;
  margin-bottom: 5px;
}

.bottom-container{
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: center;
  .help-container{
    width: 90%;

  }
}
</style>
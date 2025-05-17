<template>
  <div class="image-container">
    <TopBackHome />
    <div class="content-wrapper">
      <div class="version-info-card">
        <h2 class="version-info-title">{{t('versionInfo')}}</h2>
        <div class="version-details">
          <BoardInfoTitle :title="t('version')"></BoardInfoTitle>
          <div class="version-text">
            {{ currentVersionInfo?.version }}
            <el-button
                @click="toggleContent"
                class="help-toggle-btn"
                :class="{ 'active': !helpVisible }"
            >
              {{ helpVisible ? t('checkImageList') : t('viewHelpDocumentation') }}
            </el-button>
          </div>
        </div>
        <div class="changelog">
          <BoardInfoTitle :title="t('changeLog')"></BoardInfoTitle>
          <div>{{ currentVersionInfo?.changelog }}</div>
        </div>
      </div>

      <!-- 镜像列表和帮助文档区域 -->
      <div class="content-toggle-area">
        <div v-if="!helpVisible && mirrorList.length > 0" class="mirror-list-card">
          <el-table
              :data="mirrorList"
              style="width: 100%"
              class="mirror-table"
          >
            <el-table-column
                prop="url"
                :label="t('imageFile')"
                min-width="150"
                label-class-name="el-table-custom-label"
            >
              <template #default="{ row }">
                {{ row.url.split('/').pop() }}
              </template>
            </el-table-column>
            <el-table-column
                prop="tags"
                :label="t('tag')"
                min-width="60"
                label-class-name="el-table-custom-label"
            />
            <el-table-column
                prop="hash.sha256"
                label="sha256"
                min-width="150"
                label-class-name="el-table-custom-label"
            />
            <el-table-column
                :label="t('operation')"
                min-width="50"
                label-class-name="el-table-custom-label"
            >
              <template #default="scope">
                <el-button
                    @click="downloadFile(scope.row.url)"
                    size="small"
                    class="download-btn"
                >
                  <i class="fa fa-download mr-1"></i>{{t('download')}}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 帮助文档 -->
        <div class="bottom-container">
          <div v-if="helpVisible" class="help-doc-card">
            <h2 class="version-info-title">{{t('documentation')}}</h2>
            <HelpDoc
                v-if="markdownURL !== ''"
                :markdownURL="markdownURL"
                :boardDetail="boardDetail"
            />
          </div>
        </div>
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
import BoardInfoTitle from "@/components/board/BoardInfoTitle.vue";
import {useI18n} from "vue-i18n";

const {t} = useI18n()
const boardStore = useBoardStore();
const boardDetail = ref(boardStore.boardDetail);
const markdownURL = ref('');
const mirrorList = ref([]);
const route = useRoute();
const currentVersion = route.query.version;
const currentVersionInfo = ref(null);
const helpVisible = ref(false); // 默认不显示帮助文档

const toggleContent = () => {
  helpVisible.value = !helpVisible.value;
}

const extractDocs = (boardDetailData) => {
  return boardDetailData.value.os?.openEuler?.flatMap(osItem =>
      osItem.imagesuites.flatMap(suite => suite.docs)
  );
};

const processDocs = (docs) => {
  return Array.isArray(docs) ? [...new Set(docs)] : [];
};

const updateMarkdownURL = () => {
  const docs = extractDocs(boardDetail);
  const processedDocs = processDocs(docs);
  markdownURL.value = processedDocs.length > 0 ? processedDocs[0] : '';
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

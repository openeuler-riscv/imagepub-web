<template>
  <div class="image-container">
    <TopBackHome :isBoard=false />
    <div class="content-wrapper">
      <div class="version-info-card">
        <h2 class="version-info-title">{{ t('versionInfo') }}</h2>
        <div class="version-details">
          <BoardInfoTitle :title="t('version')"></BoardInfoTitle>
          <div class="version-text">
            {{ currentVersionInfo?.version }}
            {{ currentVersionInfo?.date }}
            <el-button @click="toggleContent" class="active  help-toggle-btn" >
              {{ helpVisible ? t('checkImageList') : t('viewHelpDocumentation') }}
            </el-button>
          </div>
        </div>
        <div class="changelog">
          <BoardInfoTitle :title="t('changeLog')"></BoardInfoTitle>
          <div>{{ currentVersionInfo?.changelog || '无更新日志' }}</div>
        </div>
      </div>

      <!-- 镜像列表和帮助文档区域 -->
      <div class="content-toggle-area">
        <div v-if="!helpVisible && mirrorList.length > 0" class="mirror-list-card">
          <el-table :data="mirrorList" style="width: 100%" class="mirror-table">
            <el-table-column prop="url" :label="t('imageFile')" min-width="150" label-class-name="el-table-custom-label">
              <template #default="{ row }">
                {{ row.url.split('/').pop() }}
              </template>
            </el-table-column>
            <el-table-column prop="tags" :label="t('tag')" min-width="60" label-class-name="el-table-custom-label" />
            <el-table-column prop="hash.sha256" label="sha256" min-width="150" label-class-name="el-table-custom-label" />
            <el-table-column :label="t('operation')" min-width="50" label-class-name="el-table-custom-label">
              <template #default="scope">
                <el-button @click="downloadFile(scope.row.url)" size="small" class="no-border">
                  <i class="fa-solid fa-cloud-arrow-down fa-2x" style="opacity: 0.3;"></i>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 帮助文档 -->
        <div class="bottom-container">
          <div v-if="helpVisible" class="help-doc-card">
            <h2 class="version-info-title">{{ t('documentation') }}</h2>
            <HelpDoc v-if="markdownURL !== ''" :markdownURL="markdownURL" :boardDetail="boardDetail" />
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
import { ref, watch, onMounted } from "vue";
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import BoardInfoTitle from "@/components/board/BoardInfoTitle.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const boardDetail = ref({});
const markdownURL = ref('');
const mirrorList = ref([]);
const currentVersionInfo = ref(null);
const helpVisible = ref(false);

const props = defineProps({
  productUri: String,
  version1: String,
  version2: String,
  date: String
});

// 数据获取与处理
const fetchImagePageData = async () => {
  if (!props.productUri || !props.version2) {
    ElMessage.error('缺少必要参数（productUri 或 version）');
    return;
  }

  try {
    const response = await fetch(`/${props.productUri}`);
    if (!response.ok) throw new Error(`请求失败，状态码: ${response.status}`);
    const data = await response.json();
    boardDetail.value = data;
    processData(data, props.version2); // 传递版本号用于匹配
  } catch (error) {
    ElMessage.error(`获取数据失败：${error.message}`);
  }
};

const processData = (data, targetVersion) => {
  const targetOs = data.imagesuites.find(os => os.name === props.version1);
  if (!targetOs) {
    ElMessage.error('未找到操作系统镜像');
    return;
  }

  const targetRelease = targetOs.releases.find(release => release.name === targetVersion);
  if (!targetRelease) {
    ElMessage.error(`未找到版本 ${targetVersion}`);
    return;
  }

  const latestRevision = targetRelease?.imagesuites?.[0]?.revisions
      ?.filter(r => r.date === props.date)?.[0] ?? null;  currentVersionInfo.value = {
    ...latestRevision,
    version: targetVersion, // 补充显示版本号
  };

  mirrorList.value = latestRevision.files || [];
  markdownURL.value = latestRevision.docs?.[0] || '';
};

watch([route], () => {
  fetchImagePageData();
});

onMounted(() => {
  fetchImagePageData();
});

const toggleContent = () => {
  helpVisible.value = !helpVisible.value;
};

const downloadFile = (url) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = url.split('/').pop();
  a.click();
};
</script>
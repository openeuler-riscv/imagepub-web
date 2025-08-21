<template>
  <div class="image-container">
    <TopBackHome :isBoard=false />
    <div class="content-wrapper">
      <div class="version-info-card">
        <div class="version-details">
            <el-row>
              <el-col :span="8" >
                  <el-row> <BoardInfoTitle :title="t('versionInfo')" /> </el-row>
                  <el-row class="text-limit-16 text-style" style="font-size:15px;color:#333" > {{ currentVersionInfo?.version }}{{ currentVersionInfo?.date }}</el-row>
              </el-col>
              <el-col :span="16"> 
                <el-row ><BoardInfoTitle :title="t('changeLog')" /> </el-row> 
                <el-row style="color:#333" class="text-limit-32 text-style changelog-content">{{ currentVersionInfo?.changelog || '无更新日志' }}</el-row></el-col>
              
            </el-row>
        </div>
        <div class="image-list">
          <BoardInfoTitle :title="t('imageFile')" />  
            <div v-if=" mirrorList.length > 0">
              <el-table :show-header="false"  :data="mirrorList" style="width: 100%" class="mirror-table">
                <el-table-column prop="tags" :label="t('tag')" width="80" label-class-name="el-table-custom-label" >
                    <template #default="{ row }">
                      <el-tag style="color:#fff;border:none" :color="row.tags[0] == '系统' ? '#012fa6': '#ff7300'">  {{ row.tags[0] }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="url" :label="t('imageFile')" min-width="150" label-class-name="el-table-custom-label">
                  <template #default="{ row }">
                    {{ row.url.split('/').pop() }}
                  </template>
                </el-table-column>
                
                <el-table-column prop="hash.sha256" label="sha256" min-width="150" label-class-name="el-table-custom-label" >
                  
                   <template #default="{ row }">
                      {{Object.keys(row.hash)?.[0]}}
                    </template>
                </el-table-column>

                <el-table-column :label="t('operation')" min-width="50" label-class-name="el-table-custom-label">
                  <template #default="scope">
                    <el-button @click="downloadFile(scope.row.url)" size="small" class="no-border">
                      <i class="fa-solid fa-cloud-arrow-down fa-2x" style="opacity: 0.3;"></i>
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
        </div>
        </div>
      </div>

      <!-- 镜像列表和帮助文档区域 -->
      <div class="content-toggle-area">
        

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
const helpVisible = ref(true);

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

    console.log(boardDetail.value)
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
  

  //const latestRevision = targetRelease?.imagesuites?.[0]?.revisions?.filter(r => r.date === props.date)?.[0] ?? null;  
  const latestRevision = targetRelease?.imagesuites?.[0]?.revisions?.[0]
    
    
      currentVersionInfo.value = {
    ...latestRevision,
    version: targetVersion, // 补充显示版本号
  };

  console.log(targetRelease)

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
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
             <el-row 
                  v-for="(item, index) in mirrorList" 
                  :key="item.id" 
                  :gutter="10"
                  class="custom-row"
                >
                  <!-- 每行包含的列（可根据需要调整） -->
                  <el-col :span="2">
                    <div class="col-content">{{ item.tags[0] }}</div>
                  </el-col>
                  <el-col :span="18">
                    <div class="col-content">{{ item.url.split('/').pop() }}</div>
                  </el-col>
                   <el-col :span="2">
                    <div class="col-content">
                        <span class="text-content">{{ Object.keys(item.hash)?.[0] }}</span>
                        
                        
                        <el-popover
                          placement="top"
                          width="250"
                          trigger="hover"
                          popper-style="border-radius: 12px;"
                          :content="Object.values(item.hash)?.[0]"
                        >
                          
                          <template #reference>
                            <el-icon class="info-icon">
                              <WarningFilled style="color:#999" />
                            </el-icon>
                          </template>
                        </el-popover>
                    </div>
                  </el-col>
                   <el-col :span="2">
                    <div class="col-content"><el-button @click="downloadFile(item.url)" size="small" class="no-border">
                      <img src="@/assets/icons/board/download.svg" width="18" height="18" />
                    </el-button></div>
                  </el-col>
                  
                </el-row>
          
        </div>
        </div>
      </div>

      <!-- 镜像列表和帮助文档区域 -->
      <div class="content-toggle-area">
        

        <!-- 帮助文档 -->
        <div class="bottom-container">
          <div v-if="helpVisible" class="help-doc-card">
           
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
import { WarningFilled } from '@element-plus/icons-vue';


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

<style lang="scss" scoped>
.custom-row{
  height: 45px;
  background-color: #f5f5f5;
  margin-bottom: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding-left: 12px;

}

.col-content{
  display: flex;
  align-items: center;
  white-space: nowrap;      /* 强制文本在一行显示，不换行 */
  overflow: hidden;         /* 超出容器的部分隐藏 */
  text-overflow: ellipsis;
}

.no-border{
  background-color: transparent !important;
}

.text-content{
  margin-right: 8px;
}


</style>
<template>
  <div class="image-container">
    <TopBackHome :isBoard=false />
    <div class="content-wrapper">
      <div class="version-info-card">
        <div class="version-details">
            <el-row>
              <el-col :span="8" >
                  <el-row> <BoardInfoTitle :title="t('versionInfo')" /> </el-row>
                  <el-row class="text-limit-16 text-style" style="font-size:15px;" > {{ currentVersionInfo?.version }}{{ currentVersionInfo?.date }}</el-row>
              </el-col>
              <el-col :span="16"> 
                <el-row ><BoardInfoTitle :title="t('changeLog')" /> </el-row> 
                <el-row class="text-limit-32 text-style changelog-content">{{ currentVersionInfo?.changelog || '无更新日志' }}</el-row></el-col>
              
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
                    <div class="col-content" style="min-width:80px;display:block">{{ item.tags[0] }}</div>
                  </el-col>
                  <el-col :span="17">
                    <div class="col-content">{{ item.url.split('/').pop() }}</div>
                  </el-col>
                   <el-col :span="3">
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
           
            <HelpDoc v-if="markdownURL !== ''" :markdownURL="markdownURL" :docList="docList" :boardDetail="boardDetail" />
          </div>
        </div>
      </div>
    </div>

    <el-popover
    :visible="visible"
    placement="top-end"
    :title="t('imageFile')"
    :width="510"
    :append-to="customContainer"
    popper-style="border-radius:12px"
    :close-on-click="false"
    trigger="manual"
     :close-on-click-outside="false"  
    
  >
    <template #default>
        <div v-if=" mirrorList.length > 0">
             <el-row 
                  v-for="(item, index) in mirrorList" 
                  :key="item.id" 
                  :gutter="10"
                  class="custom-row"
                >
                  <!-- 每行包含的列（可根据需要调整） -->
                  <el-col :span="5">
                    <div class="col-content">{{ item.tags[0] }}</div>
                  </el-col>
                  <el-col :span="16">
                    <div class="col-content" style="max-width:300px;display:block">{{ item.url.split('/').pop() }}</div>
                  </el-col>

                   <el-col :span="2">
                    <div class="col-content"><el-button @click="downloadFile(item.url)" size="small" class="no-border">
                      <img src="@/assets/icons/board/download.svg" width="18" height="18" />
                    </el-button></div>
                  </el-col>
                  
                </el-row>
          
            </div>
      </template>
    
    <template #reference>
      <div id="show-image" class="showImage" v-show="showBackToTop"  @click="visible = !visible">
        <img
          v-if="!isDark"
          src="@/assets/icons/board/imageshow.svg"
          alt="back to top"
          class="up-arrow"
        />
         <img
          v-else
          src="@/assets/icons/board/imageshowDark.svg"
          alt="back to top"
          class="up-arrow"
        />
      </div>
    </template>
  </el-popover>

    <div class="back-to-top" v-show="showBackToTop" @click="scrollToTop">
      <img
        v-if="isDark"
        src="@/assets/icons/home/backtop.svg"
        alt="back to top"
        class="up-arrow"
      />

      <img
        v-else
        src="@/assets/icons/home/Group 109@3x.svg"
        alt="back to top"
        class="up-arrow"
      />

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

import { useDarkModeStore } from '@/store/darkMode'
import { storeToRefs } from 'pinia'

const store = useDarkModeStore()
const { isDark } = storeToRefs(store)


const { t } = useI18n();
const route = useRoute();
const boardDetail = ref({});
const markdownURL = ref('');
const mirrorList = ref([]);
const currentVersionInfo = ref(null);
const helpVisible = ref(true);
const showBackToTop = ref(false);
const docList = ref([])
const visible = ref(false)

const customContainer = ref(null);


console.log(route)

const props = defineProps({
  productUri: String,
  version1: String,
  version2: String,
  imagesuiteIndex: String
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

  const latestRevision = targetRelease?.imagesuites?.[props.imagesuiteIndex]?.revisions?.[route.query.revision]
    
  currentVersionInfo.value = {
    ...latestRevision,
    version: targetVersion, // 补充显示版本号
  };

  mirrorList.value = latestRevision.files || [];
  markdownURL.value = latestRevision.docs?.[route.query.doc] || '';
  docList.value = latestRevision.docs
};

watch([route], () => {
  fetchImagePageData();
});

/* 回到顶部 */
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};

/* 监听页面滚动 */
const handleScroll = () =>{
   showBackToTop.value = window.scrollY > 400
} 






onMounted(() => {
  fetchImagePageData();
  window.addEventListener("scroll", handleScroll);
  customContainer.value = document.getElementById('show-image');
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

.showImage{
  position: fixed;
  right: 64px;
  bottom: 155px;
  width: 72px;
  height: 72px;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 3px 2px 0 rgba(1, 47, 166, 0.02),
    0 7px 5px 0 rgba(1, 47, 166, 0.03), 0 12px 10px 0 rgba(1, 47, 166, 0.04),
    0 22px 18px 0 rgba(1, 47, 166, 0.04);
  transition: all 0.3s ease;
  z-index: 100;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 4px 8px rgba(1, 47, 166, 0.15);
  }

  .up-arrow {
    width: 40px;
    height: 40px;
    transform: none;
  }
}

.back-to-top {
  position: fixed;
  right: 64px;
  bottom: 64px;
  width: 72px;
  height: 72px;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 3px 2px 0 rgba(1, 47, 166, 0.02),
    0 7px 5px 0 rgba(1, 47, 166, 0.03), 0 12px 10px 0 rgba(1, 47, 166, 0.04),
    0 22px 18px 0 rgba(1, 47, 166, 0.04);
  transition: all 0.3s ease;
  z-index: 100;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 4px 8px rgba(1, 47, 166, 0.15);
  }

  .up-arrow {
    width: 40px;
    height: 40px;
    transform: none;
  }
}

.text-style{
  color:#333
}

html.dark{
  .text-style{color:#999};
  .custom-row{
    background-color: #000;
    color:#ccc;
    &:hover{
      background-color: #131e2c;
    }
  }

  #show-image,.back-to-top {
    background-color: #222;
  }

  :deep(.el-popper){
    background-color: #222 !important;
  }





}

</style>
<template>
  <div class="detail-container">
    <TopBackHome />

    <BoardDetail :boardDetail="boardDetail"></BoardDetail>

    <div class="drawer-btn" v-if="osList?.length>0" @click="openDrawer">
      <el-button  >
        <span>{{t('showall')}}</span>
      </el-button>
       <CustomArrowIcon style="cursor:pointer;position:absolute;right:20px;top:16px"/>
    </div>

    <div v-if="isDataLoaded" class="box-card">
      <div style="width: 100%">
        <el-tabs v-model="activeTab1" class="top-tabs dark">
          <el-tab-pane
              v-for="(osItem, osIndex) in osList"
              :key="osIndex"
              :label="osItem.name"
              :name="osItem.name"
          >
            <el-tabs v-model="activeTab2" class="sub-tabs dark" type="border-card">
              <el-tab-pane
                  v-for="(release, releaseIndex) in getReleases(osItem)"
                  :key="releaseIndex"
                  :label="release.name"
                  :name="release.name"
              >
                <BoardDescription
                    v-if="boardDetail && boardDetail.imagesuites && !isFilter"
                    :title="release.name"
                    :description="getSuiteDescription(release)"
                    
                    :historyVersions="release.imagesuites?.map((suite,index) => ({isExpanded:false,version:suite.revisions,imagesuiteIndex:index})  || []) || []" 
                    :open-image="openImage">
                </BoardDescription>

                 <BoardDescription
                    v-if="isFilter"
                    :title="release.name"
                    :description="getSuiteDescription(release)"
                    :historyVersions="filterimagesuites?.map((suite,index) => ({isExpanded:false,version:suite.revisions,imagesuiteIndex:index})  || []) || []" 
                    :open-image="openImage">
                </BoardDescription>
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
     <el-drawer
        v-model="drawerVisible"
        title="筛选"
        placement="right"
        :modal="false"
      >
       <template #default>
        <div>
          <BoardFilter
             @toggle-filter="handleFilter"
            :filters="filters"
            :kernelVersions="getKernelVersions(release)"
            :kernelOptions="getKernelOptions(release)"
            :isaMabi = "getIsaMabi(release)"
            :isaMarch = "getIsaMarch(release)"
            :otherFilters="{
            flavor: { label: t('preInstalledList'), options: getUserspaces(release) },
            installer: { label: t('bootLoader'), options: getInstallerTypes(release) }
          }"
        ></BoardFilter>

        </div>
       </template>
        
         <template #footer>
            <div style="flex: auto">
              <el-button color="#012fa6" class="drawer-footer-btn" @click="resetClick">{{t('reset')}}</el-button>
              <!-- <el-button type="primary" class="drawer-footer-cnf" @click="confirmClick">{{t('confirm')}}</el-button> -->
            </div>
          </template>
      </el-drawer>
  </div>
</template>

<script setup>
import { useRouter ,useRoute} from 'vue-router';
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import BoardDetail from "@/components/board/BoardDetail.vue";
import './style.scss';
import TopBackHome from "@/components/common/TopBackHome.vue";
import BoardFilter from "@/components/board/BoardFilter.vue";
import BoardDescription from "@/components/board/BoardDescription.vue";
import { useI18n } from "vue-i18n";
import { languageFetch } from "@/utils/languageFetch";
import CustomArrowIcon from '@/components/icon/CustomArrowIcon.vue'


const { t } = useI18n();
const isDataLoaded = ref(false);
const boardDetail = ref({});
const boardImageData = ref({});
const isFilter = ref(false)
const filterimagesuites = ref([])
const filters = ref({
  kernel: {
    selected: ref([]),
    checkAll: ref(true),
    isIndeterminate: ref(false),
    all: ['RVCK', 'VENDOR', 'TORVALDS']
  },
  kernels: {
    selected: ref([]),
    checkAll: ref(true),
    isIndeterminate: ref(false)
  },
  isaMabi: {
    selected: ref([]),
    checkAll: ref(true),
    isIndeterminate: ref(false)
  },
  isaMarch: {
    selected: ref([]),
    checkAll: ref(true),
    isIndeterminate: ref(false)
  },
  flavor: {
    selected: ref([]),
    checkAll: ref(true),
    isIndeterminate: ref(false)
  },
  installer: {
    selected: ref([]),
    checkAll: ref(true),
    isIndeterminate: ref(false),
  },
});


const activeTab1 = ref(""); // 存储一级Tab的name（如'openEuler'）
const activeTab2 = ref(""); // 存储二级Tab的name（如'24.03-LTS-SP1'）
const router = useRouter();
const route = useRoute()
const drawerVisible = ref(false);



// 接收子组件的事件，更新父组件状态
const handleFilter = (newState) => {
  isFilter.value = newState.isFilter
  const currentOs = boardDetail.value.imagesuites?.find(os => os.name === activeTab1.value);
  const currentImagesuites = currentOs?.releases?.find(release => release.name === activeTab2.value)?.imagesuites;
  console.log(222,currentImagesuites)

  


};

const resetClick = () =>{
  filters.value = {
  kernel: {
    selected: ref([]),
    checkAll: ref(true),
    isIndeterminate: ref(false),
    all: ['RVCK', 'VENDOR', 'TORVALDS']
  },
  kernels: {
    selected: ref([]),
    checkAll: ref(true),
    isIndeterminate: ref(false)
  },
  isaMabi: {
    selected: ref([]),
    checkAll: ref(true),
    isIndeterminate: ref(false)
  },
  isaMarch: {
    selected: ref([]),
    checkAll: ref(true),
    isIndeterminate: ref(false)
  },
  flavor: {
    selected: ref([]),
    checkAll: ref(true),
    isIndeterminate: ref(false)
  },
  installer: {
    selected: ref([]),
    checkAll: ref(true),
    isIndeterminate: ref(false),
  },
}
}

const confirmClick = () =>{
  drawerVisible.value = false
}

const props = defineProps({
  productUri: {
    type: String,
    default: "",
  },
  vendor:String,
  product:String
});


const openDrawer = () => {
  drawerVisible.value = true;
};

/* 进入镜像页面 */
const openImage = async (imageIndex,visionIndex) => {
  const version1 = activeTab1.value; // 一级 Tab 值
  const version2 = activeTab2.value; // 二级 Tab 值

  const currentQuery = { ...route.query };
   const newQuery = {
    revision:visionIndex,
    ...currentQuery
  };
  await router.push({
    // path: `/release/${props.productUri}/${version1}/${version2}/${row.date}`, // RESTful 路径
    path: `/release/${version1}/${version2}/${props.vendor}/${props.product}/${imageIndex}`,
    query:newQuery
  });
};

// 动态获取一级Tab列表
const osList = computed(() =>
    boardDetail.value.imagesuites?.map(osItem => ({
      name: osItem.name,
      releases: osItem.releases
    })) || []
);

// 辅助函数：获取对应OS的releases列表
const getReleases = (osItem) => {
  return osItem.releases || [];
} 

const getKernelOptions = ()=>{
  const currentOs = boardDetail.value.imagesuites?.find(os => os.name === activeTab1.value);
  const currentRelease = currentOs?.releases?.find(release => release.name === activeTab2.value);
  if (!currentRelease?.imagesuites) return [];
  return currentRelease.imagesuites
      .filter(suite => suite.kernel?.type)
      .flatMap(suite => [{ version: suite.kernel.type }]).filter((item, index, self) => self.findIndex(el => el.version === item.version) === index);
};




const getSuiteDescription = () => {
  const currentOs = boardDetail.value.imagesuites?.find(os => os.name === activeTab1.value);
  const currentRelease = currentOs?.releases?.find(release => release.name === activeTab2.value);

  return currentRelease?.imagesuites?.[0]?.description || '';
};

/* 搜索参数检索功能 */
const getKernelVersions = () => {
  const currentOs = boardDetail.value.imagesuites?.find(os => os.name === activeTab1.value);
  const currentRelease = currentOs?.releases?.find(release => release.name === activeTab2.value);
  if (!currentRelease?.imagesuites) return [];
  
  return currentRelease.imagesuites
      .filter(suite => suite.kernel?.version)
      .flatMap(suite => [{ version: suite.kernel.version }]).filter((item, index, self) => self.findIndex(el => el.version === item.version) === index)
};



const getIsaMabi = () => {
  const currentOs = boardDetail.value.imagesuites?.find(os => os.name === activeTab1.value);
  const currentRelease = currentOs?.releases?.find(release => release.name === activeTab2.value);
  if (!currentRelease?.imagesuites) return [];

  return currentRelease.imagesuites.flatMap((suite, suiteIndex) => {
    const isa = suite.isa;
    if (!isa || !isa.mabi) return [];
    return {
      id: `${suiteIndex}-${0}`,
      profile: isa.mabi
    }
  }).filter((item, index, self) => self.findIndex(el => el.profile === item.profile) === index);
}

const getIsaMarch = () => {
  const currentOs = boardDetail.value.imagesuites?.find(os => os.name === activeTab1.value);
  const currentRelease = currentOs?.releases?.find(release => release.name === activeTab2.value);
  if (!currentRelease?.imagesuites) return [];

  return currentRelease.imagesuites.flatMap((suite, suiteIndex) => {
    const isa = suite.isa;
    if (!isa || !isa.march) return [];
    return isa.march.map((march, index) => ({
      id: `${suiteIndex}-${index}`,
      profile: march
    }));
  }).filter((item, index, self) => self.findIndex(el => el.profile === item.profile) === index);
};

const getUserspaces = () => {
  const currentOs = boardDetail.value.imagesuites?.find(os => os.name === activeTab1.value);
  const currentRelease = currentOs?.releases?.find(release => release.name === activeTab2.value);
  if (!currentRelease?.imagesuites) return [];


    return currentRelease.imagesuites.flatMap((suite, index) => {
    const userSpaceList = suite.flavor;
    if (!userSpaceList) return [];

      return Array.isArray(userSpaceList)
          ? userSpaceList.map((space, spaceIndex) => ({ id: `${index}-${spaceIndex}`, flavor: space })).filter((item, index, self) => self.findIndex(el => el.flavor === item.flavor) === index)
          : [{ id: `${index}-0`, flavor: userSpaceList }];
    });

};

const getInstallerTypes = () => {
  const currentOs = boardDetail.value.imagesuites?.find(os => os.name === activeTab1.value);
  const currentRelease = currentOs?.releases?.find(release => release.name === activeTab2.value);
  if (!currentRelease?.imagesuites) return [];

  return [...new Set(
      currentRelease.imagesuites.map(s => s.loader?.[0]).filter(Boolean)
  )].filter((item, index, self) => self.findIndex(el => el === item) === index);
};


// 监听Tab变化，更新相关数据（可选：用于数据联动）
watch([activeTab1, activeTab2], ([newTab1, newTab2]) => {
  if (newTab1 && newTab2) {
    // 示例：Tab切换时重置过滤条件
    Object.keys(filters.value).forEach(key => {
      filters.value[key].selected = [];
      filters.value[key].checkAll = true;
      filters.value[key].isIndeterminate = false;
    });
  }
});



// 保持原有数据加载逻辑，仅调整初始化Tab赋值
const fetchBoardDetail = async () => {
  try {
    if (!props.productUri) {
      ElMessage.error('路由参数 productUri 为空');
      return;
    }
    const uri = `/${props.productUri}`;
    // 创建一个请求实例，保存在变量中以便后续可以多次调用
    const request = languageFetch(uri);

    // 第一次订阅处理响应
    request.then(async (response) => {
      if (!response.ok) {
        ElMessage.error(`请求失败，状态码: ${response.status}`);
        return;
      }
      const data = await response.json();
      boardDetail.value = data;
      // 初始化Tab：自动选择第一个可用的一级和二级Tab
      if (osList.value.length) {
        activeTab1.value = osList.value[0].name; // 一级Tab初始化
        const firstRelease = osList.value[0].releases[0];
        if (firstRelease) {
          activeTab2.value = firstRelease.name; // 二级Tab初始化
        }
      }
    });

    // 可以在需要的地方再次调用 request.notify() 来通知所有订阅者
    // 或者添加新的订阅者
    // 示例：request.then((response) => { /* 另一个处理函数 */ });
  } catch (error) {
    ElMessage.error('获取板子详情失败：' + error.message);
  } finally {
    isDataLoaded.value = true;
  }
};

onMounted(async () => {
  await fetchBoardDetail();
});
</script>

<style scoped>

.drawer-footer-btn{
  width:100px;
  border-radius:8px;
  border:1px solid #012fa6 !important;
  color:#012fa6 !important
}

.drawer-footer-cnf{
  width:100px;
  border-radius:8px;
  border:1px solid #012fa6 !important;
  color:#fff !important;
  background:#012fa6 !important
}

  :deep(.el-tabs__header)
  {
    background-color: transparent 
  }

  :deep(.el-tabs--border-card){
    background-color: transparent;
  }




.drawer-btn{
  width: 90%;
  height: 52px;
  border:2px solid #000;
  margin:20px auto;
  border-radius: 12px;
  position: relative;
}

.drawer-btn :deep(.el-button){
    width: 100%;
    height: 100%;
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    font-size: 20px;

    &:span{
      display: inline-flex;
      justify-content: space-between;
    }

}
:deep(.el-drawer__header){
  padding-bottom: 16px;
  border-bottom: 1px solid #d9d9d9 !important;
  margin-bottom: 16px !important;
}


/* 默认样式（浅色模式） */
:deep(.el-checkbox-button.is-checked) {
  --el-checkbox-button-checked-bg-color: #ebf4fb;
  --el-checkbox-button-checked-text-color: #333;
  --el-checkbox-button-checked-border-color: #cddff3;
}

:deep(.el-checkbox-button__inner) {
  border: none;
  box-shadow: none !important;
  border-radius: 0;
  padding: 0 16px;
  height: 32px;
  line-height: 32px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-checkbox-button:not(.is-checked) .el-checkbox-button__inner) {
  border: 1px solid #dcdfe6;
}

:deep(.el-checkbox-button.is-checked .el-checkbox-button__inner) {
  border: 1px solid #cddff3;
  box-shadow: none !important;
}

:deep(.el-checkbox-button__inner) {
  border-left-color: rgb(220, 223, 230);
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  /* padding: 4px 0; */
}

:deep(.el-checkbox-button) {
  margin: 0;
  display: flex;
}

:deep(.el-checkbox-button.is-checked .el-checkbox-button__inner) {
  box-shadow: none !important;
}

:deep(.el-input__wrapper) {
  background-color: #f0f4f8;
  border-radius: 24px;
  border: none;
}

@media screen and (max-width: 768px) {
  :deep(.el-checkbox-button__inner) {
    padding: 0 12px;
    height: 28px;
    line-height: 28px;
    font-size: 13px;
  }

  :deep(.el-checkbox-group) {
    gap: 8px;
    /* padding: 3px 0; */
  }

  :deep(.el-checkbox-button:not(.is-checked) .el-checkbox-button__inner) {
    border: 1px solid #dcdfe6;
    background-color: #fff;
  }

  :deep(.el-checkbox-button.is-checked) {
    --el-checkbox-button-checked-bg-color: #ebf4fb;
    --el-checkbox-button-checked-text-color: #333;
    --el-checkbox-button-checked-border-color: #cddff3;
  }

  :deep(.el-checkbox-button.is-checked .el-checkbox-button__inner) {
    border: 1px solid #cddff3;
    background-color: #ebf4fb;
  }
}

.description {
  font-size: 14px;
  color: #777;
  margin-bottom: 20px;
}

:deep(.el-input__suffix) {
  margin-right: 4.5vh;
}

:deep(.el-row) {
  font-size: 0.9rem;
}

.help-doc-buttons {
  margin: 10px;
}

:deep(.top-tabs .el-tabs__nav-wrap::after) {
  position: static !important;
}

:deep(.top-tabs .el-tabs__active-bar) {
  background-color: #102e9f;
  height: 3px;
}

:deep(.sub-tabs) {
  margin-top: 20px;
}

:deep(.top-tabs + .sub-tabs-container) {
  margin-top: 0;
  border-top: none !important;
}

:deep(.el-tabs__item:hover) {
  color: #102e9f;
}

:deep(.el-tabs__item.is-active) {
  color: #102e9f;
}



:deep(.el-tabs--border-card > .el-tabs__header){
  border-bottom: none ;
  height:32px
} 

:deep(.el-tabs){
  --el-tabs-header-height: 32px;
}



:deep(.el-tabs__item){
  border-radius: 6px;
  margin-right: 12px;

  margin-top: 0px !important;
  margin-left: 0px !important;
}

:deep(.el-tabs--border-card>.el-tabs__header .el-tabs__item.is-active){
  border-left: none !important;
  border-right: none !important;
}

:deep(.el-tabs--border-card>.el-tabs__header .el-tabs__item){
  border:none
}

:deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active),
:deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item:hover) {
  color: #102e9f;
}

:deep(.sub-tabs.el-tabs--border-card) {
  overflow: hidden;
  border:none;
}

.filter-title {
  font-size: 23px;
  font-weight: bold;
  color: #1a3fa6;
  margin-bottom: 16px;
  margin-top: 8px;
  letter-spacing: 1px;
  position: relative;
  display: inline-block;
  padding-left: 8px;
  padding-bottom: 6px;
}

:deep(.sub-tabs) .title {
  margin-top: 12px;
  color: #102e9f;
  font-size: 26px;
  margin-bottom: 8px;
}

:deep(.sub-tabs) .el-tabs__content {
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 0px;
  margin-top: 0;
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left:0px
}

.top-tabs :deep(.el-tabs__item:not(.sub-tabs .el-tabs__item)) {
  font-size: 18px;
  font-weight: bold;
}


:deep(.el-drawer__footer){
  text-align: left;;
}


/* 暗黑模式样式 */
html.dark {
  /* checkbox 相关 */
  --el-checkbox-button-checked-bg-color: #2e2e2e;
  --el-checkbox-button-checked-text-color: #e0e0e0;
  --el-checkbox-button-checked-border-color: #555;


  :deep(.el-drawer){
    background-color: #151515;
  }
  :deep(.el-drawer__title){
    color: #fff;
  }

  :deep(.el-drawer__close-btn){
    color:#ccc;
  }

  :deep(.el-checkbox-button__inner) {
    background-color: #1e1e1e;
    border: 1px solid #555 !important;
    color: #ccc;
  }

  :deep(.el-checkbox-button.is-checked .el-checkbox-button__inner) {
    background-color: var(--el-checkbox-button-checked-bg-color);
    border-color: var(--el-checkbox-button-checked-border-color);
    color: var(--el-checkbox-button-checked-text-color);
  }

  :deep(.el-input__wrapper) {
    background-color: #2a2a2a;
    color: #ddd;
  }

  .description {
    color: #aaa;
  }

  .filter-title {
    color: #7ca0f8;
  }

  :deep(.top-tabs .el-tabs__active-bar),
  :deep(.el-tabs__item.is-active),
  :deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active) {
    color: #006aff;
  }

    :deep(.top-tabs .el-tabs__active-bar){
      background-color: #006aff;
    }


  :deep(.el-tabs__item:hover) {
    color: #006aff;
  }


  :deep(.sub-tabs) .title {
    color: #7ca0f8;
  }

  :deep(.el-tabs__nav) {
    background-color: transparent;
  }

  :deep(.el-tabs__content) {
    background-color: transparent;
    color: #ccc;
  }

  :deep(.el-tabs--border-card) {
    .el-tabs__item {
      color: #999;
      background-color: #333;
      border:1px solid #666;

      &.is-active {
        color:#fff !important;
        background-color: #012fa6;
        border:none
      }
      &:hover{
        color:#fff
      }
    }
  }

  .drawer-footer-btn{
    border-color: #ccc !important;
    color:#ccc !important
  }
}
</style>
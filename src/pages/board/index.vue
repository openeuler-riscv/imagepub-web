<template>
  <div class="detail-container">
    <TopBackHome />

    <BoardDetail :boardDetail="boardDetail"></BoardDetail>

    <div class="drawer-btn" v-if="osList?.length>0" @click="openDrawer"  :class="{ 'active-border': isFilter}">
      <el-button  >
        <span v-if="!isFilter">{{t('showall')}}</span>
        <span v-else style="font-size:24px;color:#012fa6">*</span>
      </el-button>
       <CustomArrowIcon  :isFilter="isFilter"  style="cursor:pointer;position:absolute;right:20px;top:16px"/>
    </div>

    <div v-if="isDataLoaded" class="box-card">
      <div style="width: 100%">
        <el-tabs v-model="activeTab1" class="top-tabs dark">
          <el-tab-pane
              v-for="(osItem, osIndex) in osList"
              :key="osIndex"
              :label="osItem.name"
              :name="osItem.name"
              v-if="!isFilter"
          >
            <el-tabs v-model="activeTab2" class="sub-tabs dark" type="border-card">
              <el-tab-pane
                  v-for="(release, releaseIndex) in getReleases(osItem)"
                  :key="releaseIndex"
                  :label="release.name"
                  :name="release.id"
              >
                <BoardDescription
                    :title="release.name"
                    :description="getSuiteDescription(release)"
                    :historyVersions="release.imagesuites?.map((suite,index) => ({isExpanded:false,version:suite.revisions,imagesuiteIndex:suite.id,name:suite.name})  || []) || []" 
                    :open-image="openImage">
                </BoardDescription>
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
          <el-tab-pane
              v-for="(osItem, osfilerIndex) in filterosList"
              :key="osfilerIndex"
              :label="osItem.name"
              :name="osItem.name"
              v-else
          >
            <el-tabs v-model="activeTab2" class="sub-tabs dark" type="border-card">
              <el-tab-pane
                  v-for="(release, releaseIndex) in getReleases(osItem)"
                  :key="releaseIndex"
                  :label="release.name"
                  :name="release.id"
              >
                <BoardDescription
                    :title="release.name"
                    :description="getSuiteDescription(release)"
                    :historyVersions="release.imagesuites?.map((suite,index) => ({isExpanded:false,version:suite.revisions,imagesuiteIndex:suite.id,name:suite.name})  || []) || []" 
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
        :title="t('selected')"
        placement="right"
        :modal="true"
      >
       <template #default>
        <div>
          <BoardFilter
            :isFilter="isFilter"
             @toggle-filter="handleFilter"
            :filters="filters"
            :kernelVersions="getKernelVersions()"
            :kernelOptions="getKernelOptions()"
            :suitesForSelect = "suitesForSelect()"
            :isaMabi = "getIsaMabi()"
            :isaMarch = "getIsaMarch()"
            :flavor = "getUserspaces()"
            :installer=" getInstallerTypes()"
           
        ></BoardFilter>

        </div>
       </template>
        
         <template #footer>
            <div style="flex: auto">
              <el-button color="#012fa6" class="drawer-footer-btn" @click="resetClick">{{t('reset')}}</el-button>
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

const allImageSuites = ref([]);
const filterosList = ref([])
const { t } = useI18n();
const isDataLoaded = ref(false);
const boardDetail = ref({});
const isFilter = ref(false)
const filterimagesuites = ref([])


/* 筛选项定义 */
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

/* 过滤功能 */
const fiterTargetSuits = (filter,originSuits) => {

  const resusltSuits = originSuits.value?.filter(a=>{
    if(filter.flavor.selected.length>0 && a.flavor){

      const allOption = getUserspaces()
      const  allSelected = []
      filter.flavor.selected?.forEach(i=>{
        allSelected.push(allOption?.find(it=>it.id ===i)?.flavor)
      })
      return allSelected.includes(a?.flavor)
    }
    else return a
  }).filter(b=>{
    if(filter.installer.selected.length>0 && b.loader.length>0){
       const allOption = getInstallerTypes()
       const  allSelected = []
      filter.installer.selected?.forEach(i=>{
        allSelected.push(allOption?.find(it=>it.id ===i)?.profile)
      })
      return allSelected.includes(b?.loader?.[0])
    }
    else return b
  }).filter(c=>{
    if(filter.isaMabi.selected.length>0 && c.isa.mabi){
      return filter.isaMabi.selected.includes(c.isa.mabi)
    }
    else return c
  }).filter(d=>{
    if(filter.isaMarch.selected.length>0 && d.isa.march.length>0){
      return filter.isaMarch.selected.filter(x=>d.isa.march.includes(x))
    }
    else return d
  }).filter(e=>{
    if(filter.kernel.selected.length>0 && e.kernel.type){
      return filter.kernel.selected.includes(e.kernel.type)
    }
    else return e
  }).filter(f=>{
    if(filter.kernels.selected.length>0 && f.kernel.version){
      return filter.kernels.selected.includes(f.kernel.version)
    }
    else return f
  })

  return resusltSuits

}


// 接收子组件的事件，更新父组件状态
const handleFilter = (newState) => {
  isFilter.value = newState.isFilter
  filterimagesuites.value = fiterTargetSuits(newState.filters,allImageSuites)
  const tempList  = JSON.parse(JSON.stringify(osList.value))
  filterosList.value = tempList.filter(list=>filterimagesuites.value.some(it=>it.parentSuite === list.name))?.map(sec=>{
       
      sec.releases = sec.releases.filter(i=>filterimagesuites.value.some(it=>it.parentRelease === i.id))?.map(k=>{
        k.imagesuites = k.imagesuites.filter(n=>filterimagesuites.value.some(it=>it.id === n.id))
        return k
      })

      return sec
  })
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
    }
  }


  filterosList.value = []
  isFilter.value = false
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
    ...currentQuery,
    doc:0
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
      name: osItem.id,
      releases: osItem.releases
    })) || []
);



// 辅助函数：获取对应OS的releases列表
const getReleases = (osItem) => {
  return osItem.releases || [];
} 

const getKernelOptions = ()=>{
  const currentOs = boardDetail.value.imagesuites?.find(os => os.id === activeTab1.value);

  let AllRelease = []
  currentOs?.releases.forEach(it=>AllRelease.push(...it.imagesuites))
  if (!AllRelease?.length) return [];

 

  return AllRelease
      .filter(suite => suite.kernel?.type)
      .flatMap(suite => [{ version: suite.kernel.type,disabled:false }]).filter((item, index, self) => self.findIndex(el => el.version === item.version) === index);
};

/* 返回当前镜像suits */
const suitesForSelect = ()=>{
  const currentOs = boardDetail.value.imagesuites?.find(os => os.id === activeTab1.value);
   let AllRelease = []
  currentOs?.releases.forEach(it=>AllRelease.push(...it.imagesuites))
  if (!AllRelease?.length) return [];

  return AllRelease?.map(s=>({
    id:s?.id,
    flavor:[s.flavor],
    isaMabi:[s.isa.mabi],
    isaMarch:[...s.isa.march],
    kernel:[s.kernel.type],
    kernels:[s.kernel.version],
    installer:[...s.loader],

  }))
}


const getSuiteDescription = () => {
  const currentOs = boardDetail.value.imagesuites?.find(os => os.id === activeTab1.value);

  const currentRelease = currentOs?.releases?.find(release => release.id === activeTab2.value);

  return currentRelease?.imagesuites?.[0]?.description || '';
};

/* 搜索参数检索功能 */
const getKernelVersions = () => {
  const currentOs = boardDetail.value.imagesuites?.find(os => os.id === activeTab1.value);
  
  let AllRelease = []
  currentOs?.releases.forEach(it=>AllRelease.push(...it.imagesuites))
  if (!AllRelease?.length) return [];

   return AllRelease
      .filter(suite => suite.kernel?.version)
       .flatMap(suite => [{ version: suite.kernel.version,disabled:false }]).filter((item, index, self) => self.findIndex(el => el.version === item.version) === index)
 
};


const getIsaMabi = () => {
  const currentOs = boardDetail.value.imagesuites?.find(os => os.id === activeTab1.value);

   let AllRelease = []
  currentOs?.releases.forEach(it=>AllRelease.push(...it.imagesuites))
  if (!AllRelease?.length) return [];


  return AllRelease.flatMap((suite, suiteIndex) => {
    const isa = suite.isa;
    if (!isa || !isa.mabi) return [];
    return {
      id: `${suiteIndex}-${0}`,
      profile: isa.mabi,
      disabled:false
    }
  }).filter((item, index, self) => self.findIndex(el => el.profile === item.profile) === index);
}

const getIsaMarch = () => {
  const currentOs = boardDetail.value.imagesuites?.find(os => os.id === activeTab1.value);
  let AllRelease = []
  currentOs?.releases.forEach(it=>AllRelease.push(...it.imagesuites))
  if (!AllRelease?.length) return [];

  return AllRelease.flatMap((suite, suiteIndex) => {
    const isa = suite.isa;
    if (!isa || !isa.march) return [];
    return isa.march.map((march, index) => ({
      id: `${suiteIndex}-${index}`,
      profile: march,
      disabled:false
    }));
  }).filter((item, index, self) => self.findIndex(el => el.profile === item.profile) === index);
};

const getUserspaces = () => {
  const currentOs = boardDetail.value.imagesuites?.find(os => os.id === activeTab1.value);
  let AllRelease = []
  currentOs?.releases.forEach(it=>AllRelease.push(...it.imagesuites))
  if (!AllRelease?.length) return [];

    return [...new Set(
      AllRelease.map(s => s.flavor).filter(Boolean)
  )].filter((item, index, self) => self.findIndex(el => el === item) === index)?.map((it,index)=>({flavor:it,disabled:false,id:index+1}));


};

const getInstallerTypes = () => {
  const currentOs = boardDetail.value.imagesuites?.find(os => os.id === activeTab1.value);

  let AllRelease = []
  currentOs?.releases.forEach(it=>AllRelease.push(...it.imagesuites))
  if (!AllRelease?.length) return [];


  return [...new Set(
      AllRelease.map(s => s.loader?.[0]).filter(Boolean)
  )].filter((item, index, self) => self.findIndex(el => el === item) === index)?.map((it,index)=>({profile:it,disabled:false,id:index+1}));
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
          activeTab2.value = firstRelease.id; // 二级Tab初始化
        }
      }
      data.imagesuites.forEach(suite => {
      suite.releases.forEach(release => {
        release.imagesuites.forEach(imgSuite => {
          imgSuite.parentSuite = suite.id;
          imgSuite.parentRelease = release.id;
          allImageSuites.value.push(imgSuite);
        });
      });
    });

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
  // 初始化
  // 收集所有第三层imagesuites对象
  
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

.active-border{
  border:2px solid #012fa6 !important;
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
  background-color: #012fa6;
  height: 3px;
  border-radius: 6px;
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
  color: #012fa6;
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

:deep(.el-tabs__nav-wrap>.el-tabs__active-bar) {
  width: 30px !important; /* 自定义长度，根据需要调整 */
  /* 可选：居中显示（默认是左对齐） */
  margin-left: auto !important;
  margin-right: auto !important;
}



:deep(.el-tabs--border-card>.el-tabs__header .el-tabs__item.is-active){
  border:1px solid #012fa6
}

:deep(.el-tabs--border-card>.el-tabs__header .el-tabs__item){
  /* border:none */
  background-color: #fff;
  color:#000;
  border:1px solid #ccc
}

:deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active),
:deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item:hover) {
  color: #012fa6;
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
<template>
  <div class="filters">
    <div class="filter-row">
      <el-container style="flex-direction:column">
        <BoardInfoTitle :title="t('kernelVersion')" />
        <div :style="{ display: 'flex', flexDirection: 'column' }">
          <div class="filter-item" >
            <span class="filter-new-label" >{{ t('versionLabel') }}</span>
            <div style="display:flex;flex-wrap:wrap;margin-top:8px">
               <el-checkbox-button
                  v-model="filters.kernel.checkAll"
                  :indeterminate="filters.kernel.isIndeterminate"
                  @change="handleFilterCheckAll('kernel')"
                  style="margin-right: 10px;height:32px"
              >
                {{ t('any') }}
              </el-checkbox-button>

              <el-checkbox-group v-model="filters.kernel.selected" @change="handleFilterChange('kernel')">

                <el-checkbox-button
                    v-if="!filterBtn"
                    v-for="item in kernelOptions"
                    :key="item"
                    :value="item.version"

                   
                >
                  {{ item.version }}
                </el-checkbox-button>


                <el-checkbox-button
                    v-for="it in filterkernelOptions"
                    :key="it"
                    :value="it.version"
                    :disabled="it.disabled"
                    v-else
                >
                  {{ it.version }}
                </el-checkbox-button>

              </el-checkbox-group>
            </div>
           
          </div>
          <div class="filter-item" >
              <span class="filter-new-label">{{ t('versionNumber') }}</span>
               <div style="display:flex;flex-wrap:wrap;margin-top:8px">
                  <el-checkbox-button
                    v-model="filters.kernels.checkAll"
                    :indeterminate="filters.kernels.isIndeterminate"
                    @change="handleFilterCheckAll('kernels')"
                     style="margin-right: 10px;height:32px"
                >
                  {{ t('any') }}
                </el-checkbox-button>

                <el-checkbox-group v-model="filters.kernels.selected" @change="handleFilterChange('kernels')">
                  <el-checkbox-button
                      v-if="!filterBtn"
                      v-for="item in kernelVersions"
                      :key="item.version"
                      :value="item.version"
                  >
                    {{ item.version }}
                  </el-checkbox-button>
                  <el-checkbox-button
                      v-else
                      v-for="it in filterkernelVersions"
                      :key="it.version"
                      :value="it.version"
                      :disabled="it.disabled"
                  >
                    {{ it.version }}
                  </el-checkbox-button>
                </el-checkbox-group>
               </div>
            
          </div>
        </div>
      </el-container>
    </div>

    <!-- 下面这块就是把原来误用 filters.kernel / filters.kernels 的部分改成 filters.isa -->
    <div class="filter-row">
      <el-container style="flex-direction:column">
        <BoardInfoTitle :title="t('isaBaseline')" />
        <div :style="{ display: 'flex', flexDirection: 'column' }">
          <div class="filter-item">
            <span class="filter-new-label">{{ t('isaMabi') }}</span>
             <div style="display:flex;flex-wrap:wrap;margin-top:8px">
                 <el-checkbox-button
                  v-model="filters.isaMabi.checkAll"
                  :indeterminate="filters.isaMabi.isIndeterminate"
                  @change="handleFilterCheckAll('isaMabi')"
                  style="margin-right: 10px;height:32px"
              >
                {{ t('any') }}
              </el-checkbox-button>
              <el-checkbox-group v-model="filters.isaMabi.selected" @change="handleFilterChange('isaMabi')">
                <el-checkbox-button
                     v-if="!filterBtn"
                    v-for="item in props.isaMabi"
                    :key="item"
                    :value="item.profile"
                >
                  {{ item.profile }}
                </el-checkbox-button>
                <el-checkbox-button
                    v-else
                    v-for="it in filterisaMabi"
                    :key="it"
                    :value="it.profile"
                    :disabled="it.disabled"
                >
                  {{ it.profile }}
                </el-checkbox-button>
              </el-checkbox-group>
             </div>
          </div>

          <div>
            <span class="filter-new-label">{{ t('isaMarch') }}</span>
            <div style="display:flex;flex-wrap:wrap;margin-top:8px">
                 <el-checkbox-button
                 
                  v-model="filters.isaMarch.checkAll"
                  :indeterminate="filters.isaMarch.isIndeterminate"
                  @change="handleFilterCheckAll('isaMarch')"
                  style="margin-right: 10px;height:32px"
              >
                {{ t('any') }}
              </el-checkbox-button>
              <el-checkbox-group v-model="filters.isaMarch.selected" @change="handleFilterChange('isaMarch')">
                <el-checkbox-button
                   v-if="!filterBtn"
                    v-for="item in isaMarch"
                    :key="item.profile"
                    :value="item.profile"
                >
                  {{ item.profile }}
                </el-checkbox-button>
                 <el-checkbox-button
                    v-else
                    v-for="it in filterisaMarch"
                    :key="it.profile"
                    :value="it.profile"
                    :disabled="it.disabled"
                >
                  {{ it.profile }}
                </el-checkbox-button>
              </el-checkbox-group>
            </div>
          </div>
        </div>
      </el-container>
    </div>

    <!-- flavor -->
    <div class="filter-row" >
      <BoardInfoTitle :title="t('preInstalledList')" />
      <div :style="{ display: 'flex', flexDirection: 'column',position:'relative',bottom:'12px',height:'32px' }">
        <div class="filter-item">
           <div style="display:flex;flex-wrap:wrap;">
            <el-checkbox-button
              v-model="filters.flavor.checkAll"
              :indeterminate="filters.flavor.isIndeterminate"
              @change="handleFilterCheckAll('flavor')"
              style="margin-right: 10px;height:32px"
          >
            {{ t('any') }}
          </el-checkbox-button>
          <el-checkbox-group v-model="filters.flavor.selected" @change="handleFilterChange('flavor')">
            <el-checkbox-button
               v-if="!filterBtn"
                v-for="item in flavor"
                :key="item.id || item"
                :value="item.flavor "
            >
              {{item.flavor }}
            </el-checkbox-button>
             <el-checkbox-button
                v-else
                v-for="it in filterflavor"
                :key="it.id || item"
                :value="it.flavor "
                 :disabled="it.disabled"
            >
              {{ it.flavor }}
                </el-checkbox-button>
          </el-checkbox-group>
        </div>
        </div>      
      </div>
    </div>


      <!-- installer -->
     <div  class="filter-row">
      <BoardInfoTitle :title="t('bootLoader')" />
      <div :style="{ display: 'flex', flexDirection: 'column',position:'relative',bottom:'12px',height:'32px' }">
        <div class="filter-item">
           <div style="display:flex;flex-wrap:wrap;">
            <el-checkbox-button
              v-model="filters.installer.checkAll"
              :indeterminate="filters.installer.isIndeterminate"
              @change="handleFilterCheckAll('installer')"
              style="margin-right: 10px;height:32px"
          >
            {{ t('any') }}
          </el-checkbox-button>
          <el-checkbox-group v-model="filters.installer.selected" @change="handleFilterChange('installer')">
            <el-checkbox-button
                v-if="!filterBtn" 
                v-for="item in installer"
                :key="item"
                :value="item.profile || item"
            >
              {{ item.profile || item }}
            </el-checkbox-button>

            <el-checkbox-button
                v-else
                v-for="it in filterinstaller"
                :key="it"
                :value="it.profile || it "
                 :disabled="it.disabled"
            >
              {{ it.profile }}
                </el-checkbox-button>
          </el-checkbox-group>
        </div>
        </div>      
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { defineProps, defineEmits,ref,watch } from 'vue';
import BoardInfoTitle from "./BoardInfoTitle.vue";
const { t,locale } = useI18n();

const props = defineProps({
  filters: {
    type: Object,
    required: true,
    default: () => ({
      kernel: {},
      kernels: {},
      isaMabi:{},
      isaMarch:{},
      flavor: {},
      installer: {}
    })
  },
  kernelOptions: {
    type: Array,
    default: () => []
  },
  kernelVersions: {
    type: Array,
    default: () => []
  },
  isaMabi: {
    type: Array,
    default: () => []
  },
  isaMarch: {
    type: Array,
    default: () => []
  },
  
  flavor: {
    type: Array,
    default: () => []
  },

  installer: {
    type: Array,
    default: () => []
  },
  
  suitesForSelect:{},
  isFilter:Boolean
});

const filterBtn = ref(false)
const filterkernelOptions = ref([])
const filterkernelVersions = ref([])
const filterisaMabi = ref([])
const filterisaMarch = ref([])
const filterflavor = ref([])
const filterinstaller = ref([])



/* 当前在哪个suits集合筛选 */
const currentSuits = ref([])

/* 经过筛选后的suits集合 */
const selectedSuits = ref([])

// 定义触发给父组件的事件
const emit = defineEmits(['toggle-filter']);


const updateCheckState = (key,kind) => {
  const filter = props.filters[key];
  const allItems =
      key === 'kernel'
          ? props.kernelOptions.map(v => v.version)
          : key === 'kernels'
              ? props.kernelVersions.map(v => v.version)
              : key === 'isaMabi'
                  ? props.isaMabi.map(v => v.profile)
                  : key === 'isaMarch'
                      ? props.isaMarch.map(v => v.profile)
                        : key === 'flavor'
                        ? props.flavor.map(v=>v.flavor)
                       : key === 'installer'?
                        props.installer.map(v=>v.profile)
                      : props.otherFilters[key]?.options?.map(v => v.profile || v.flavor || v) || [];
                  
  const checkedCount = filter.selected.length;
  
  filter.checkAll = filter.selected.length > 0 ? false:true

  filter.isIndeterminate = checkedCount > 0 && checkedCount < allItems.length ? false :true


  const temp = props.filters
  const tagFilter = temp.flavor.checkAll && temp.installer.checkAll && temp.isaMabi.checkAll &&  temp.isaMarch.checkAll && temp.kernel.checkAll &&temp.kernels.checkAll

  emit('toggle-filter', {filters:props.filters,isFilter: tagFilter ?false:true } );
  if(!tagFilter){
    /* 单项点击 */
    if(kind ==2){
      /* 更新选择按钮,只在不止一个imagesuit情况下进行处理 */
      if( (!filterBtn.value && props.suitesForSelect.length >1) || (filterBtn.value && selectedSuits.value.length>1 )){
        /* 区分判断是第一次选择还是后面的多次选择 */
        if(!filterBtn.value){
          filterBtn.value = true /* 设置进行btn过滤的标志位 */
          currentSuits.value = props.suitesForSelect
        }
        else{
          currentSuits.value = selectedSuits.value
        }
        /* 更新、筛选每个选择模块的按钮 */
        
          selectedSuits.value = filter.selected.length>0? currentSuits.value?.filter(c=>hasCommonElements(filter.selected,c[key])):currentSuits.value

          filterkernelOptions.value = [...props.kernelOptions].map(it=>{
            const currentOption =  mergeArrayValues(selectedSuits.value, 'kernel')
            if(currentOption && currentOption.length>0){
              it.disabled = currentOption.includes(it.version)? false:true
            }
            return it
          })

          filterkernelVersions.value = [...props.kernelVersions].map(it=>{
            const currentOption =  mergeArrayValues(selectedSuits.value, 'kernels')
            if(currentOption && currentOption.length>0){
              it.disabled = currentOption.includes(it.version)? false:true
            }
            return it
          })

          filterisaMabi.value = [...props.isaMabi].map(it=>{
            const currentOption =  mergeArrayValues(selectedSuits.value, 'isaMabi')
            if(currentOption && currentOption.length>0){
              it.disabled = currentOption.includes(it.profile)? false:true
            }
            return it
          })


          filterisaMarch.value = [...props.isaMarch].map(it=>{
            const currentOption =  mergeArrayValues(selectedSuits.value, 'isaMarch')
            if(currentOption && currentOption.length>0){
              it.disabled = currentOption.includes(it.profile)? false:true
            }
            return it
          })
          filterflavor.value = [...props.flavor].map(it=>{
            const currentOption =  mergeArrayValues(selectedSuits.value, 'flavor')
           
            if(currentOption && currentOption.length>0){
              it.disabled = currentOption.includes(it.flavor)? false:true
            }
             console.log(currentOption,it)
            return it
          })


          filterinstaller.value =  [...props.installer].map(it=>{
            const currentOption =  mergeArrayValues(selectedSuits.value, 'installer')
            if(currentOption && currentOption.length>0){
              it.disabled = currentOption.includes(it.profile)? false:true
            }
            return it
          })

      }  
    }
    else{
          /* 全选点击 */
         Object.keys(temp)?.filter(a=>temp[a].checkAll)?.map(b=>{
          switch(b) {
            case 'kernel':
              //filterkernelOptions.value =  props.kernelOptions.map(v => v.version)
              filterkernelOptions.value =  [...props.kernelOptions]
              break; 
            case 'kernels':
              //filterkernelVersions.value = props.kernelVersions.map(v => v.version)
              filterkernelVersions.value = [...props.kernelVersions]
              break;
            case 'isaMabi': 
              //filterisaMabi.value = props.isaMabi.map(v => v.profile)
              filterisaMabi.value = [...props.isaMabi]
              break; 
            case 'isaMarch':
              //filterisaMarch.value = props.isaMarch.map(v => v.profile)
              filterisaMarch.value = [...props.isaMarch]
              break;
            case 'flavor':
              //filterotherFilters.value.flavor.options = props.otherFilters[b]?.options?.map(v => v.profile || v.flavor || v)
              //filterotherFilters.value.flavor.options = [...props.otherFilters[b]?.options]
              filterflavor.value = [...props.flavor]
              break; 
            case 'installer':
              //filterotherFilters.value.installer.options = props.otherFilters[b]?.options?.map(v => v.profile || v.flavor || v) 
              //filterotherFilters.value.installer.options = [...props.otherFilters[b]?.options]
               filterinstaller.value = [...props.installer]
              break;
            
            default:
              
          }
         })
    }
  }
  /* 所有都是全选 */
  else{
    filterBtn.value = false;
    currentSuits.value = [];
    selectedSuits.value = []
    filterkernelOptions.value = []
    filterkernelVersions.value = []
    filterisaMabi.value = []
    filterisaMarch.value =[]
    filterflavor.value = []
    filterinstaller.value = []
    // filterotherFilters.value.flavor.options = [] 
    // filterotherFilters.value.installer.options = [] 
  
  }
};

/* 数组去重 */
const mergeArrayValues = (arr, key) => {
  const valueSet = new Set();

  // 遍历数组中的每个对象
  arr.forEach(obj => {
    // 检查对象是否存在且包含指定key，且对应的值是数组
    if (obj && Array.isArray(obj[key])) {
      // 将数组中的每个元素添加到Set中（自动去重）
      obj[key].forEach(item => {
        valueSet.add(item);
      });
    }
  });

  // 将Set转换为数组并返回
  return Array.from(valueSet);
}

/* 判断两个数组相同元素 */
const hasCommonElements = (arr1, arr2) =>{
  // 将其中一个数组转换为Set以提高查找效率
  const set = new Set(arr1);
  // 检查arr2中是否有元素存在于Set中
  return arr2.some(item => set.has(item));
}


// 通用：其他 key 的全选逻辑
const handleFilterCheckAll = (key) => {
  const filter = props.filters[key];
  let allOptions = [];
  if (key === 'kernel') {
    allOptions = props.kernelOptions.map(v => v.version);
  } else if (key === 'kernels') {
    allOptions = props.kernelVersions.map(v => v.version);
  } else if (key === 'isaMabi') {
    allOptions = props.isaMabi.map(v => v.profile);
  } else if (key === 'isaMarch') {
    allOptions = props.isaMarch.map(v => v.profile);
  }
  else if(key === 'flavor'){
    allOptions = props.flavor.map(v => v.flavor);
  }
  else if(key === 'installer'){
      allOptions = props.flavor.map(v => v.profile);
  }
  
  
  // else {
  //   allOptions = props.otherFilters[key].options.map(v => v.profile || v.flavor || v);
  // }
  
  filter.selected=[]
  updateCheckState(key,1);
};

// 通用：其他 key 的单项变更时更新状态
const handleFilterChange = (key) => {
  updateCheckState(key,2);
};

watch(()=>props.isFilter, (value) => {
  if (!value) {
     filterBtn.value = false;
    currentSuits.value = [];
    selectedSuits.value = []
    filterkernelOptions.value = []
    filterkernelVersions.value = []
    filterisaMabi.value = []
    filterisaMarch.value =[]
    filterflavor.value = []
    filterinstaller.value = []
    // filterotherFilters.value.flavor.options = [] 
    // filterotherFilters.value.installer.options = [] 
  }
},{immediate:true,deep:true});


</script>


<style scoped>

/* Dark mode specific color for labels */
.dark .filter-label,
.dark .filter-label-center {
  font-size: 14px;
  /* Adjusted color for dark mode */
}



.filter-new-label{
  font-size: 14px;
  color:#333;
}

.filter-item{
  margin-bottom: 8px;
}

.filter-row {
     flex-direction: column;
    align-items: flex-start;
  }

:deep(.el-checkbox-button__inner) {
  font-size: 15px;
  font-weight: 400;
  border-radius: 5px !important;
  color: var(--theme-text) !important;
  border: clamp(1px, 0.2vw, 1px) solid #ccc;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: visible;
  padding: 8px;
  min-width: 64px;
  height: 32px;
  line-height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-checkbox-button) {
  margin-right: 12px;
  margin-bottom: 10px;
  display: inline-flex;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  /* gap: 8px; */
  align-items: center;
  padding:0px;
  flex:1
}

:deep(.el-checkbox-button.is-checked .el-checkbox-button__inner) {

  color: var(--el-color-primary) !important;
  border: clamp(1px, 0.2vw, 2px) solid var(--el-color-primary);
  box-shadow: none;
  font-weight: 500;
}

:deep(.el-checkbox-button__inner:hover) {
  border:clamp(1px, 0.2vw, 2px) solid #012fa6 !important;
}

:deep(.el-checkbox-button.is-checked .el-checkbox-button__inner){
  border-color: #012fa6 !important;
  color: #012fa6 !important;
  border:clamp(1px, 0.2vw, 2px) solid #012fa6 !important;
  background-color: #fff !important;
}


/* 禁用状态 - 移除边框并添加禁用效果 */
:deep(.el-checkbox-button.is-disabled .el-checkbox-button__inner) {
  border: none !important; /* 移除边框 */
  background-color: #f5f7fa; /* 浅灰色背景 */
  color: #c0c4cc; /* 文字变灰 */
  cursor: not-allowed;
  opacity: 0.8; /* 稍微透明 */
}

/* 禁用且选中状态 - 保持背景但无边框 */
:deep(.el-checkbox-button.is-disabled.is-checked .el-checkbox-button__inner) {
  background-color: #e6f7ff; /* 淡蓝色背景 */
  color: #8cc5ff; /* 文字颜色 */
}


@media screen and (max-width: 900px) {
  .filters {
    padding: 0 2vw;
  }

  .filter-title {
    font-size: clamp(14px, 2vw, 16px);
    margin-bottom: 6px;
  }

  .filter-row {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: clamp(10px, 2vw, 18px);
  }

  :deep(.el-checkbox-button) {
    margin: 0 !important;
    flex: 0 1 auto;
    min-width: calc(50% - 8px);
    max-width: none;
    box-sizing: border-box;
    display: flex !important;
    align-items: center;
    justify-content: center;
  }

  :deep(.el-checkbox-button__inner) {
    font-size: 15px;
    padding: 6px 12px;
    width: 100%;
    min-width: 60px;
    height: 32px;
    line-height: 20px;
    
    color: var(--theme-text) !important;
    white-space: nowrap;
    overflow: visible;
    border-radius: 7px !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  :deep(.el-checkbox-button.is-checked .el-checkbox-button__inner) {
    font-weight: 500;
  }
}

@media (min-width: 769px) {
  :deep(.el-checkbox-button__inner) {
    color: var(--theme-text) !important;
  }
}


.dark{
  .filter-new-label{
    color:#999
  }
  :deep(.el-checkbox-button__inner){
    background-color: #333 !important;
  }

  :deep(.el-checkbox-button__inner:hover) {
    background-color: #012fa6 ;
    border: 1px solid #012fa6;
  }

  :deep(.el-checkbox-button.is-checked .el-checkbox-button__inner){
    border-color: #012fa6 !important;
    color: #fff !important;
    border:clamp(1px, 0.2vw, 2px) solid #012fa6 !important;
    background-color: #012fa6 !important;
  }

   .el-checkbox-button.is-disabled .el-checkbox-button__inner {
    background-color: transparent !important;
    color: #6b7280 !important;
    border: none !important;
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  /* 深色模式下禁用且选中状态 */
  .el-checkbox-button.is-disabled.is-checked .el-checkbox-button__inner {
    background-color: rgba(22, 93, 255, 0.2) !important;
    color: #8da4f1 !important;
  }

  
}


</style>

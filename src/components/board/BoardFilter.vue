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
                    v-for="item in kernelOptions"
                    :key="item"
                    :value="item.version"
                >
                  {{ item.version }}
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
                      v-for="item in kernelVersions"
                      :key="item.version"
                      :value="item.version"
                  >
                    {{ item.version }}
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
                    v-for="item in props.isaMabi"
                    :key="item"
                    :value="item.profile"
                >
                  {{ item.profile }}
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
                    v-for="item in isaMarch"
                    :key="item.profile"
                    :value="item.profile"
                >
                  {{ item.profile }}
                </el-checkbox-button>
              </el-checkbox-group>
            </div>
          </div>
        </div>
      </el-container>
    </div>

    <!-- 其余过滤项保持原来的循环逻辑 -->
    <div class="filter-row" v-for="(filter, key) in otherFilters" :key="key">
      <BoardInfoTitle :title="filter.label" />
      <div :style="{ display: 'flex', flexDirection: 'column',position:'relative',bottom:'12px',height:'32px' }">
        <div class="filter-item">
           <div style="display:flex;flex-wrap:wrap;">
            <el-checkbox-button
              v-model="filters[key].checkAll"
              :indeterminate="filters[key].isIndeterminate"
              @change="handleFilterCheckAll(key)"
              style="margin-right: 10px;height:32px"
          >
            {{ t('any') }}
          </el-checkbox-button>
          <el-checkbox-group v-model="filters[key].selected" @change="handleFilterChange(key)">
            <el-checkbox-button
                v-for="item in filter.options"
                :key="item.id || item"
                :value="item.profile || item.flavor || item"
            >
              {{ item.profile || item.flavor || item }}
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
import { defineProps, defineEmits } from 'vue';
import BoardInfoTitle from "./BoardInfoTitle.vue";
const { t } = useI18n();
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
  otherFilters: {
    type: Object,
    default: () => ({
      isa: { label: 'ISA 基线', options: [] },
      flavor: { label: '预装列表', options: [] },
      installer: { label: '引导器', options: [] }
    })
  }
});


// 定义触发给父组件的事件
const emit = defineEmits(['toggle-filter']);


const updateCheckState = (key) => {
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
                      : props.otherFilters[key]?.options?.map(v => v.profile || v.flavor || v) || [];

  const checkedCount = filter.selected.length;
  // filter.checkAll = checkedCount === allItems.length;
  filter.checkAll = filter.selected.length > 0 ? false:true
  //filter.isIndeterminate = checkedCount > 0 && checkedCount < allItems.length;

  filter.isIndeterminate = checkedCount > 0 && checkedCount < allItems.length ? false :true
  const temp = props.filters

  emit('toggle-filter', {filters:props.filters,isFilter: temp.flavor.checkAll && temp.installer.checkAll && temp.isaMabi.checkAll &&  temp.isaMarch.checkAll && temp.kernel.checkAll &&temp.kernels.checkAll ?false:true } );

};


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
  }else {
    allOptions = props.otherFilters[key].options.map(v => v.profile || v.flavor || v);
  }
  
  //filter.selected = filter.checkAll ? allOptions : [];
  filter.selected = filter.checkAll ? []:allOptions;
  updateCheckState(key);
};

// 通用：其他 key 的单项变更时更新状态
const handleFilterChange = (key) => {
  updateCheckState(key);
};



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
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
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
    background-color: #012fa6 !important;
    border: 1px solid #012fa6 !important
  }

  :deep(.el-checkbox-button.is-checked .el-checkbox-button__inner){
    border-color: #012fa6 !important;
    color: #fff !important;
    border:clamp(1px, 0.2vw, 2px) solid #012fa6 !important;
    background-color: #012fa6 !important;
  }

  
}


</style>

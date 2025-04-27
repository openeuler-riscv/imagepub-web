<template>
  <div class="filters">
    <div class="filter-row">
      <el-container>
        <el-aside width="106px"><span class="filter-label adjusted-position">内核版本：</span></el-aside>
        <el-main :style="{ padding: '0', textAlign: 'left' }">
          <div style="display: flex; align-items: center; flex-wrap: wrap;">
            <span class="filter-label-center">版本标签</span>
            <el-checkbox-button
                v-model="filters.kernel.checkAll"
                :indeterminate="filters.kernel.isIndeterminate"
                @change="handleKernelCheckAll"
                style="margin-right: 15px;"
            >全部</el-checkbox-button>

            <el-checkbox-group
                v-model="filters.kernel.selected"
                @change="handleKernelChange"
            >
              <el-checkbox-button v-for="item in kernelOptions" :key="item" :label="item">{{ item }}</el-checkbox-button>
            </el-checkbox-group>
          </div>
          <div style="display: flex; align-items: center; flex-wrap: wrap; margin-top: 8px">
            <span class="filter-label-center">版本号</span>
            <el-checkbox-button
                v-model="filters.kernels.checkAll"
                :indeterminate="filters.kernels.isIndeterminate"
                @change="handleFilterCheckAll('kernels')"
                style="margin-right: 15px;"
            >全部</el-checkbox-button>

            <el-checkbox-group
                v-model="filters.kernels.selected"
                @change="handleFilterChange('kernels')"
            >
              <el-checkbox-button v-for="item in kernelVersions" :key="item.version" :label="item.version">{{ item.version }}</el-checkbox-button>
            </el-checkbox-group>
          </div>
        </el-main>
      </el-container>
    </div>
    <div class="filter-row" v-for="(filter, key) in otherFilters" :key="key">
      <span class="filter-label">{{ filter.label }}：</span>
      <div style="display: flex; align-items: center; flex-wrap: wrap;">
        <el-checkbox-button
            v-model="filters[key].checkAll"
            :indeterminate="filters[key].isIndeterminate"
            @change="handleFilterCheckAll(key)"
            style="margin-right: 15px;"
        >全部</el-checkbox-button>
        <el-checkbox-group
            v-model="filters[key].selected"
            @change="handleFilterChange(key)"
        >
          <el-checkbox-button
              v-for="item in filter.options"
              :key="item.id || item"
              :label="item.profile || item.userspace || item"
          >{{ item.profile || item.userspace || item }}</el-checkbox-button>
        </el-checkbox-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  filters: {
    type: Object,
    required: true,
    default: () => ({
      kernel: {},
      kernels: {},
      isa: {},
      userspace: {},
      installer: {}
    })
  },
  kernelOptions: {
    type: Array,
    default: () => ['RVCK', 'VENDOR', 'TORVALDS']
  },
  kernelVersions: {
    type: Array,
    default: () => []
  },
  otherFilters: {
    type: Object,
    default: () => ({
      isa: { label: 'ISA 基线', options: [] },
      userspace: { label: '预装列表', options: [] },
      installer: { label: '引导器', options: [] }
    })
  }
});

const updateCheckState = (key) => {
  const filter = props.filters[key];
  const allItems = key === 'kernel'
      ? props.kernelOptions
      : key === 'kernels' ? props.kernelVersions.map(v => v.version) : props.otherFilters[key].options.map(v => v.profile || v.userspace || v);

  const checkedCount = filter.selected.length;
  filter.checkAll = checkedCount === allItems.length;
  filter.isIndeterminate = checkedCount > 0 && checkedCount < allItems.length;
};

const handleKernelCheckAll = (val) => {
  props.filters.kernel.selected = val ? props.kernelOptions : [];
  props.filters.kernel.isIndeterminate = false;
};

const handleKernelChange = (value) => {
  const checkedCount = value.length;
  props.filters.kernel.checkAll = checkedCount === props.kernelOptions.length;
  props.filters.kernel.isIndeterminate = checkedCount > 0 && checkedCount < props.kernelOptions.length;
};

const handleFilterCheckAll = (key) => {
  const filter = props.filters[key];
  const allOptions = key === 'kernel'
      ? props.kernelOptions
      : key === 'kernels' ? props.kernelVersions.map(v => v.version) : props.otherFilters[key].options.map(v => v.profile || v.userspace || v);
  filter.selected = filter.checkAll ? allOptions : [];
  updateCheckState(key);
};

const handleFilterChange = (key) => {
  updateCheckState(key);
};
</script>

<style scoped>
/* 可以在这里添加 Filter 组件的样式 */
</style>
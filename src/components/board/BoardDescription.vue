<template>
  <div class="component-container">
    <h2 class="title">{{ props.title }}</h2>
    <p class="description">{{ props.description }}</p>
    <div v-if="props.historyVersions && props.historyVersions.length > 0">
      <h5>版本列表</h5>
      <el-table :data="props.historyVersions" border style="width: 100%;">
        <el-table-column prop="version" label="版本号" min-width="20" @cell-mouse-enter="handleCellMouseEnter"
          @cell-mouse-leave="handleCellMouseLeave"></el-table-column>
        <el-table-column prop="changelog" label="变更日志" min-width="60" @cell-mouse-enter="handleCellMouseEnter"
          @cell-mouse-leave="handleCellMouseLeave"></el-table-column>
        <el-table-column prop="releaseDate" label="发布时间" min-width="20" @cell-mouse-enter="handleCellMouseEnter"
          @cell-mouse-leave="handleCellMouseLeave"></el-table-column>
        <el-table-column label="操作" min-width="20" @cell-mouse-enter="handleCellMouseEnter"
          @cell-mouse-leave="handleCellMouseLeave">
          <template #default="scope">
            <el-button @click="handleActionClick(scope.row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ElTable, ElTableColumn, ElButton } from 'element-plus';

const props = defineProps({
  title: String,
  description: String,
  historyVersions: {
    type: Array,
    default: () => []
  },
  openImage: Function,
});


const handleCellMouseEnter = (row, column, cell, event) => {
  hoverRowIndex.value = rowIndex;
};

const handleCellMouseLeave = () => {
  console.log("handleCellMouseLeave");
  hoverRowIndex.value = -1;
};

const handleActionClick = async (row) => {
  await props.openImage(row);
};
</script>

<style scoped>
.component-container {
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--theme-border);
  background: var(--theme-card);
  color: var(--theme-text);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  transition: background 0.3s, color 0.3s, border-color 0.3s;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--theme-text);
}

.description {
  font-size: 14px;
  color: var(--theme-text);
  opacity: 0.7;
  margin-bottom: 20px;
}

.el-table__body tr:hover {
  background-color: var(--theme-hover) !important;
  color: var(--theme-text) !important;
  transition: background 0.3s, color 0.3s;
}

/* 表格头部、边框等也可适配 */
:deep(.el-table) {
  background: var(--theme-card) !important;
  color: var(--theme-text) !important;
  border-color: var(--theme-border) !important;
}

:deep(.el-table th) {
  background: var(--theme-card) !important;
  color: var(--theme-text) !important;
  border-color: var(--theme-border) !important;
}

:deep(.el-table td) {
  background: var(--theme-card) !important;
  color: var(--theme-text) !important;
  border-color: var(--theme-border) !important;
}
</style>
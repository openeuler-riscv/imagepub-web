<template>
  <div class="component-container">
    <h2 class="title">{{ props.title }}</h2>
    <p class="description">{{ props.description }}</p>
    <div v-if="props.historyVersions && props.historyVersions.length > 0">
      <h4>历史版本</h4>
      <el-table
          :data="props.historyVersions"
          border
          style="width: 100%;"
          @row-click="handleRowClick"
      >
        <el-table-column
            prop="version"
            label="版本号"
            min-width="200"
            @cell-mouse-enter="handleCellMouseEnter"
            @cell-mouse-leave="handleCellMouseLeave"
        ></el-table-column>
        <el-table-column
            prop="changelog"
            label="变更日志"
            min-width="600"
            @cell-mouse-enter="handleCellMouseEnter"
            @cell-mouse-leave="handleCellMouseLeave"
        ></el-table-column>
        <el-table-column
            prop="releaseDate"
            label="发布时间"
            min-width="200"
            @cell-mouse-enter="handleCellMouseEnter"
            @cell-mouse-leave="handleCellMouseLeave"
        ></el-table-column>
        <el-table-column
            label="操作"
            min-width="200"
            @cell-mouse-enter="handleCellMouseEnter"
            @cell-mouse-leave="handleCellMouseLeave"
        >
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
import { ref } from 'vue';

const props = defineProps({
  title: String,
  description: String,
  historyVersions: {
    type: Array,
    default: () => []
  },
  openImage: Function,
});

const hoverRowIndex = ref(-1);

const handleRowClick = async (row) => {
  await props.openImage(row);
};

const handleCellMouseEnter = (row, column, cell, event) => {
  console.log("handleCellMouseEnter", 1);
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
  border: 1px solid var(--el-border-color);
  box-shadow: var(--el-box-shadow-light);
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.description {
  font-size: 14px;
  color: #777;
  margin-bottom: 20px;
}

.el-table__body tr:hover {
  background-color: #f5f7fa;
  color: #333;
}
</style>
<template>
  <div class="component-container">
    <h2 class="title">{{ props.title }}</h2>
    <p class="description">{{ props.description }}</p>
    <div v-if="props.historyVersions && props.historyVersions.length > 0">
      <h4>历史版本</h4>
      <el-table :data="props.historyVersions" border style="width: 100%;" @row-click="handleRowClick">
        <el-table-column prop="version" label="版本号" min-width="200"></el-table-column>
        <el-table-column prop="releaseDate" label="发布日期" min-width="200"></el-table-column>
        <el-table-column prop="changelog" label="更新日志" min-width="500"></el-table-column>
        <el-table-column label="操作" min-width="200">
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
import {useRouter} from "vue-router";
const router = useRouter();

const openImage = async (image) => {
  await router.push({
    path: "/image",
    query: {
      productUri: image.uri,
    },
  });
  window.location.reload();
};
const props = defineProps({
  title: String,
  description: String,
  historyVersions: {
    type: Array,
    default: () => []
  }
});

const handleRowClick =async (row) => {
  await openImage(row);
};

const handleActionClick = async (row) => {
  await openImage(row);
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
</style>
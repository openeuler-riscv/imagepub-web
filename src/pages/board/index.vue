<template>
  <div class="detail-container">
    <TopBackHome />

    <BoardDetail :boardDetail="boardDetail"></BoardDetail>
    <div v-if="isDataLoaded" class="box-card">
      <div style="width: 100%">
        <el-tabs v-model="activeTab1" class="top-tabs">
          <el-tab-pane
              v-for="(osItem, osIndex) in osList"
              :key="osIndex"
              :label="osItem.name"
              :name="osItem.name"
          >
            <el-tabs v-model="activeTab2" class="sub-tabs" type="border-card">
              <el-tab-pane
                  v-for="(release, releaseIndex) in getReleases(osItem)"
                  :key="releaseIndex"
                  :label="release.name"
                  :name="release.name"
              >
                <h2 class="title">{{ release.name }}</h2>
                <p class="description">
                  {{ getSuiteDescription(release) || '' }}
                </p>
                <BoardFilter
                    :filters="filters"
                    :kernelVersions="getKernelVersions(release)"
                    :otherFilters="{
                    isa: { label: t('isaBaseline'), options: getIsaProfiles(release) },
                    userspace: { label: t('preInstalledList'), options: getUserspaces(release) },
                    installer: { label: t('bootLoader'), options: getInstallerTypes(release) }
                  }"
                ></BoardFilter>
                <BoardDescription
                    v-if="boardDetail && boardDetail.imagesuites"
                    :title="release.name"
                    :description="getSuiteDescription(release)"
                    :historyVersions="release.imagesuites[0].revisions || []"
                    :open-image="openImage"
                >
                </BoardDescription>
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import BoardDetail from "@/components/board/BoardDetail.vue";
import { getProductVersion } from '@/api/get-json';
import './style.scss';
import TopBackHome from "@/components/common/TopBackHome.vue";
import BoardFilter from "@/components/board/BoardFilter.vue";
import BoardDescription from "@/components/board/BoardDescription.vue";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const isDataLoaded = ref(false);
const boardDetail = ref({});
const boardImageData = ref({});

const filters = ref({
  kernel: {
    selected: ref([]),
    checkAll: ref(false),
    isIndeterminate: ref(true),
    all: ['RVCK', 'VENDOR', 'TORVALDS']
  },
  kernels: {
    selected: ref([]),
    checkAll: ref(false),
    isIndeterminate: ref(true)
  },
  isa: {
    selected: ref([]),
    checkAll: ref(false),
    isIndeterminate: ref(true)
  },
  userspace: {
    selected: ref([]),
    checkAll: ref(false),
    isIndeterminate: ref(true)
  },
  installer: {
    selected: ref([]),
    checkAll: ref(false),
    isIndeterminate: ref(true)
  }
});

const activeTab1 = ref(''); // 存储一级Tab的name（如'openEuler'）
const activeTab2 = ref(''); // 存储二级Tab的name（如'24.03-LTS-SP1'）
const router = useRouter();

const props = defineProps({
  productUri: {
    type: String,
    default: ''
  }
});

const openImage = async (row) => {
  const version1 = activeTab1.value; // 一级 Tab 值
  const version2 = activeTab2.value; // 二级 Tab 值
  await router.push({
    path: `/image/${props.productUri}/${version1}/${version2}/${row.date}`, // RESTful 路径
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
const getReleases = (osItem) => osItem.releases || [];

const getSuiteDescription = () => {
  const currentOs = boardDetail.value.imagesuites?.find(os => os.name === activeTab1.value);
  const currentRelease = currentOs?.releases?.find(release => release.name === activeTab2.value);
  return currentRelease?.imagesuites?.[0]?.description || '';
};

const getKernelVersions = () => {
  const currentOs = boardDetail.value.imagesuites?.find(os => os.name === activeTab1.value);
  const currentRelease = currentOs?.releases?.find(release => release.name === activeTab2.value);
  if (!currentRelease?.imagesuites) return [];

  return currentRelease.imagesuites
      .filter(suite => suite.kernel?.version)
      .flatMap(suite => [{ version: suite.kernel.version }]);
};

const getIsaProfiles = () => {
  const currentOs = boardDetail.value.imagesuites?.find(os => os.name === activeTab1.value);
  const currentRelease = currentOs?.releases?.find(release => release.name === activeTab2.value);
  if (!currentRelease?.imagesuites) return [];

  return currentRelease.imagesuites.flatMap((suite, suiteIndex) => {
    const isa = suite.isa;
    console.log("isa", isa);
    if (!isa || !isa.march) return [];
    return isa.march.map((march, index) => ({
      id: `${suiteIndex}-${index}`,
      profile: march
    }));
  });
};

const getUserspaces = () => {
  const currentOs = boardDetail.value.imagesuites?.find(os => os.name === activeTab1.value);
  const currentRelease = currentOs?.releases?.find(release => release.name === activeTab2.value);
  if (!currentRelease?.imagesuites) return [];

  return currentRelease.imagesuites.flatMap((suite, index) => {
    const userSpaceList = suite.userspace;
    if (!userSpaceList) return [];
    return Array.isArray(userSpaceList)
        ? userSpaceList.map((space, spaceIndex) => ({ id: `${index}-${spaceIndex}`, userspace: space }))
        : [{ id: `${index}-0`, userspace: userSpaceList }];
  });
};

const getInstallerTypes = () => {
  const currentOs = boardDetail.value.imagesuites?.find(os => os.name === activeTab1.value);
  const currentRelease = currentOs?.releases?.find(release => release.name === activeTab2.value);
  if (!currentRelease?.imagesuites) return [];

  return [...new Set(
      currentRelease.imagesuites.map(s => s.loader?.[0]).filter(Boolean)
  )];
};

// 监听Tab变化，更新相关数据（可选：用于数据联动）
watch([activeTab1, activeTab2], ([newTab1, newTab2]) => {
  if (newTab1 && newTab2) {
    // 示例：Tab切换时重置过滤条件
    Object.keys(filters.value).forEach(key => {
      filters.value[key].selected = [];
      filters.value[key].checkAll = false;
      filters.value[key].isIndeterminate = true;
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
    const response = await fetch(uri);
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
  } catch (error) {
    ElMessage.error('获取板子详情失败：' + error.message);
  } finally {
    isDataLoaded.value = true;
  }
};

// 保持其他逻辑不变
const fetchProductVersion = async () => {
  try {
    const response = await getProductVersion();
    if (response && response.data) {
      boardImageData.value = response.data;
    } else {
      ElMessage.error('获取产品版本失败：返回数据为空');
    }
  } catch (error) {
    console.error('获取产品版本失败:', error);
    ElMessage.error('获取产品版本失败：' + error.message);
  }
};

onMounted(async () => {
  await fetchBoardDetail();
  await fetchProductVersion();
});
</script>

<style scoped>
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
  padding: 4px 0;
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
    padding: 3px 0;
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
  border-top: 1px solid #ebedf0;
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

:deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active),
:deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item:hover) {
  color: #102e9f;
}

:deep(.sub-tabs.el-tabs--border-card) {
  border-radius: 8px !important;
  overflow: hidden;
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
}

.top-tabs :deep(.el-tabs__item:not(.sub-tabs .el-tabs__item)) {
  font-size: 18px;
  font-weight: bold;
}

/* 暗黑模式样式 */
html.dark {
  /* checkbox 相关 */
  --el-checkbox-button-checked-bg-color: #2e2e2e;
  --el-checkbox-button-checked-text-color: #e0e0e0;
  --el-checkbox-button-checked-border-color: #555;

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
    color: #7ca0f8;
    background-color: #1e1e1e;
  }

  :deep(.el-tabs__item:hover) {
    color: #7ca0f8;
  }

  :deep(.sub-tabs) {
    border-top: 1px solid #444;
  }

  :deep(.sub-tabs) .title {
    color: #7ca0f8;
  }

  :deep(.el-tabs--border-card) {
    background-color: #1a1a1a;
    border-color: #444;
  }

  :deep(.el-tabs__nav) {
    background-color: #1a1a1a;
  }

  :deep(.el-tabs__content) {
    background-color: #1a1a1a;
    color: #ccc;
  }

  :deep(.el-tabs--border-card) {
    background-color: #1a1a1a;
    border-color: #444;

    .el-tabs__header {
      background-color: #1a1a1a;
      border-bottom-color: #444;
    }

    .el-tabs__item {
      color: #999;
      border-color: #444;

      &.is-active {
        color: #fff;
        background-color: #2a2a2a;
      }
    }
  }
}


</style>
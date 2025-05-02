<template>
  <!-- 模板部分保持不变 -->
  <div class="detail-container">
    <TopBackHome/>
    <BoardDetail :boardDetail="boardDetail"></BoardDetail>
    <div v-if="isDataLoaded" class="box-card">
        <div style="width: 100%">
          <el-tabs v-model="releaseTabs" class="top-tabs"  type="border-card" >
            <el-tab-pane name="openEuler" label="openEuler">
              <el-tabs v-model="subTabs" class="sub-tabs"   type="border-card">
                <el-tab-pane v-for="distro in tabList.openEuler" :key="distro" :label="distro" :name="distro">
                  <template #label>
                    <span>
                      {{distro}}
                    </span>
                  </template>

                  <BoardFilter :filters="filters" :kernelVersions="kernelVersions" :otherFilters="{
                    isa: { label: 'ISA 基线', options: isaProfiles },
                    userspace: { label: '预装列表', options: userspaces },
                    installer: { label: '引导器', options: installerTypes }
                  }"></BoardFilter>
                  <BoardDescription :title="distro" description="openEuler 24.03 LTS SP1是基于6.6内核的24.03-LTS版本增强扩展版本（参见版本生命周期），面向服务器、云、边缘计算和嵌入式场景，持续提供更多新特性和功能扩展，给开发者和用户带来全新的体验，服务更多的领域和更多的用户。"></BoardDescription>
                  <HelpDocButton :getMarkDownInDocs="getMarkDownInDocs" :boardDetail="boardDetail"></HelpDocButton>
                </el-tab-pane>
              </el-tabs>
            </el-tab-pane>
            <el-tab-pane name="others" label="others">
              <el-tabs v-model="subTabs" class="sub-tabs"  >
                <el-tab-pane v-for="distro in tabList.others" :key="distro" :label="distro" :name="distro">
                  <BoardFilter :filters="filters" :kernelVersions="kernelVersions" :otherFilters="{
                    isa: { label: 'ISA 基线', options: isaProfiles },
                    userspace: { label: '预装列表', options: userspaces },
                    installer: { label: '引导器', options: installerTypes }
                  }"></BoardFilter>
                  <BoardDescription></BoardDescription>
                  <HelpDocButton :getMarkDownInDocs="getMarkDownInDocs" :boardDetail="boardDetail"></HelpDocButton>
                </el-tab-pane>
              </el-tabs>
            </el-tab-pane>
          </el-tabs>
        </div>
    </div>
  </div>
</template>

<script setup>
// 脚本部分保持不变
import { useRoute } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import BoardDetail from "@/components/board/BoardDetail.vue";
import { getProductVersion } from '@/api/get-json';
import './style.scss';
import TopBackHome from "@/components/common/TopBackHome.vue";
import BoardFilter from "@/components/board/BoardFilter.vue";
import BoardDescription from "@/components/board/BoardDescription.vue";
import HelpDocButton from "@/components/board/HelpDocButton.vue";
const releaseTabs = ref('openEuler');
const subTabs = ref('');
const tabList = ref({ openEuler: [], others: [] });
const isDataLoaded = ref(false);
const route = useRoute();
const boardDetail = ref({});
const os = ref('openEuler');
const version = ref('');
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

const kernelVersions = computed(() =>
    boardImageData.value?.os?.[os.value]?.find(v => v.name === version.value)
        ?.imagesuites.flatMap(suite => suite.kernel?.versions.map(version => ({ version }))) || []
);

const isaProfiles = computed(() =>
    boardImageData.value?.os?.[os.value]?.find(v => v.name === version.value)
        ?.imagesuites.flatMap((suite, index) => {
      const isaList = suite.isa;
      return Array.isArray(isaList)
          ? isaList.map((isa, isaIndex) => ({ id: `${index}-${isaIndex}`, profile: isa.profile }))
          : [{ id: `${index}-0`, profile: isaList.profile }];
    }) || []
);

const userspaces = computed(() =>
    boardImageData.value?.os?.[os.value]?.find(v => v.name === version.value)
        ?.imagesuites.flatMap((suite, index) => {
      const userSpaceList = suite.userspace;
      return Array.isArray(userSpaceList)
          ? userSpaceList.map((space, spaceIndex) => ({ id: `${index}-${spaceIndex}`, userspace: space }))
          : [{ id: `${index}-0`, userspace: userSpaceList }];
    }) || []
);

const installerTypes = computed(() =>
    [...new Set(boardImageData.value?.os?.[os.value]?.find(v => v.name === version.value)
        ?.imagesuites.map(s => s.type).filter(Boolean) || [])]
);

const imageSuites = computed(() =>
    boardImageData.value?.os?.[os.value]?.find(v => v.name === version.value)?.imagesuites || []
);

const groupedFiles = computed(() => {
  let filteredSuites = imageSuites.value;
  filteredSuites = filteredSuites
      .filter(s => !filters.value.kernels.selected.length || s.kernel?.version === filters.value.kernels.selected[0])
      .filter(s => !filters.value.isa.selected.length || s.isa?.profile === filters.value.isa.selected[0])
      .filter(s => !filters.value.userspace.selected.length || s.userspace === filters.value.userspace.selected[0])
      .filter(s => !filters.value.installer.selected.length || s.type === filters.value.installer.selected[0]);

  return filteredSuites.flatMap(suite =>
      suite.files.map(file => ({ name: file.group, items: [{ link: file.url, lists: file.lists || [] }] }))
  );
});

const getMarkDownInDocs = () => {
  const docs = boardDetail.value.os?.openEuler?.flatMap(osItem =>
      osItem.imagesuites.flatMap(suite => suite.docs)
  );
  return Array.isArray(docs) ? [...new Set(docs)] : [];
};

const updateCheckState = (key) => {
  const filter = filters.value[key];
  const allItems = key === 'kernel'
      ? filter.all
      : key === 'kernels' ? kernelVersions.value : key === 'isa' ? isaProfiles.value : key === 'userspace' ? userspaces.value : installerTypes.value;

  const checkedCount = filter.selected.length;
  filter.checkAll = checkedCount === allItems.length;
  filter.isIndeterminate = checkedCount > 0 && checkedCount < allItems.length;
};

const handleKernelCheckAll = (val) => {
  filters.value.kernel.selected = val ? filters.value.kernel.all : [];
  filters.value.kernel.isIndeterminate = false;
};

const handleKernelChange = (value) => {
  const checkedCount = value.length;
  filters.value.kernel.checkAll = checkedCount === filters.value.kernel.all.length;
  filters.value.kernel.isIndeterminate = checkedCount > 0 && checkedCount < filters.value.kernel.all.length;
};

const handleFilterCheckAll = (key) => {
  const filter = filters.value[key];
  filter.selected = filter.checkAll
      ? (key === 'kernel' ? filter.all : key === 'kernels' ? kernelVersions.value.map(v => v.version) : key === 'isa' ? isaProfiles.value.map(v => v.profile) : key === 'userspace' ? userspaces.value.map(v => v.userspace) : installerTypes.value)
      : [];
  updateCheckState(key);
};

const handleFilterChange = (key) => {
  updateCheckState(key);
};

const fetchBoardDetail = async () => {
  try {
    const productUri = route.query.productUri;
    if (!productUri) {
      ElMessage.error('路由参数 productUri 为空');
      return;
    }
    const uri = `/${productUri}`;
    const response = await fetch(uri);
    if (!response.ok) {
      ElMessage.error(`请求失败，状态码: ${response.status}`);
      return;
    }
    const data = await response.json();
    tabList.value.openEuler = data.os?.openEuler.map(o => o.name) || [];
    tabList.value.others = data.os?.others?.map(o => o.name) || [];
    subTabs.value = tabList.value.openEuler.length ? tabList.value.openEuler[0] : '';
    boardDetail.value = data;
  } catch (error) {
    ElMessage.error('获取板子详情失败：' + error.message);
  } finally {
    isDataLoaded.value = true;
  }
};

const fetchProductVersion = async () => {
  try {
    const response = await getProductVersion();
    if (response && response.data) {
      boardImageData.value = response.data;
      if (boardImageData.value?.os?.[os.value]?.length) {
        version.value = boardImageData.value.os[os.value][0].name;
      }
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

:deep(.el-checkbox-button.is-checked) {
  --el-checkbox-button-checked-bg-color: #ebf4fb;
  --el-checkbox-button-checked-text-color: #333;
  --el-checkbox-button-checked-border-color: #cddff3;
  --el-border-radius-base: 0,
}

:deep(.el-checkbox-button:first-child) {
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}

:deep(.el-checkbox-button__inner){
  border-left-color: rgb(220, 223, 230);
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.el-checkbox-button.is-checked .el-checkbox-button__inner) {
  box-shadow: none!important;
}

:deep(.el-input__wrapper) {
  background-color: #f0f4f8;
  border-radius: 24px;
  border: none;
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
:deep(.sub-tabs) {
  margin-top: 20px;
  border-top: 1px solid #ebedf0;
}
:deep(.top-tabs + .sub-tabs-container) {
  margin-top: 0;
  border-top: none !important;
}
:deep(.sub-tabs) {
  margin-top: 0 !important;
  border: none !important;
}
:deep(.sub-tabs .el-tabs__header) {
  border-bottom: none !important;
}
:deep(.el-tabs__item.is-active),
:deep(.el-tabs__item:hover) {
  color: #333;
  background-color: #cddff3;
  font-family: PingFang SC-Regular;
}
:deep(.el-tabs--border-card>.el-tabs__header .el-tabs__item.is-active ),
:deep(.el-tabs--border-card>.el-tabs__header .el-tabs__item:hover ){
  color: #333;
  background-color: #cddff3;
  font-family: PingFang SC-Regular;
}
</style>
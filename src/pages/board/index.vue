<template>
  <div class="detail-container">
    <div class="main-container">
      <div class="top-bar-container">
        <div class="input-wrapper">
          <CustomLogoIcon class="prefix-icon" />
          <div class="back-home-container">
            <el-button
              @click="goHome"
              class="home-button"
            >
              <CustomBackHomeIcon />
              <span style="font-size: 1.25rem; font-family: PingFang SC-Regular"
                >回首页</span
              >
            </el-button>
          </div>
          <div class="spacer"></div>
          <div class="detail-search-container">
            <el-input
              class="input-container"
              placeholder="板卡信息"
              size="large"
            ></el-input>
            <CustomSearchIcon />
          </div>
        </div>
      </div>
    </div>
    <div class="board-container">
      <div
        class="product-container"
        v-if="boardDetail"
      >
        <div class="board-info">
          <div class="board-image-container">
            <div class="board-image">
              <el-image
                :src="currentImageSrc"
                style="width: 25vh; height: 25vh"
              />
            </div>
            <div class="thumbnail-container">
              <el-image
                v-for="(pic, index) in boardDetail?.pictures || []"
                :key="index"
                :src="pic"
                style="
                  width: 60px;
                  height: 45px;
                  margin-right: 10px;
                  cursor: pointer;
                  border: saddlebrown 1px solid;
                "
                @click="changeMainImage(index)"
              />
            </div>
          </div>
          <div class="info-list">
            <div class="info-item">
              <BoardInfoTitle title="板卡信息" />
              <el-row>厂商名称: {{ boardDetail?.vendor?.name }}</el-row>
              <el-row>Soc型号: {{ boardDetail?.soc?.name }}</el-row>
              <el-row>板卡类型: {{ boardDetail?.type }}</el-row>
            </div>
            <div class="info-item">
              <BoardInfoTitle title="RAM配置" />
              <el-row>{{ getRamConfig() }}</el-row>
            </div>
            <div class="info-item">
              <BoardInfoTitle title="存储接口" />
              <el-row>
                <el-col
                  v-for="(item, index) in getStorageInterfaces()"
                  :key="index"
                  :span="24"
                >
                  {{ item.type }}, {{ item.capacity ? item.capacity : "NC" }}
                </el-col>
              </el-row>
            </div>
            <div class="info-item">
              <BoardInfoTitle title="高速接口" />
              <el-row>
                <el-col
                  v-for="(item, index) in getHighSpeedInterfaces()"
                  :key="index"
                  :span="24"
                >
                  {{ item.type }} {{ item.nums ? `x${item.nums}` : "" }}
                </el-col>
              </el-row>
            </div>
            <div class="info-item">
              <BoardInfoTitle title="低速接口" />
              <el-row>
                <el-col
                  v-for="(item, index) in getLowSpeedInterfaces()"
                  :key="index"
                  :span="24"
                >
                  {{ item.type }} {{ item.nums ? `x${item.nums}` : "" }}
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <p>暂无板卡详情信息，请稍后重试。</p>
      </div>
    </div>

    <el-card class="box-card">
    <!-- 顶部操作系统与版本 -->
    <div class="top-selects">
      <el-select v-model="os" placeholder="选择系统" class="select-box">
        <el-option label="openEuler" value="openEuler" />
      </el-select>
      <el-select v-model="version" placeholder="选择版本" class="select-box">
        <el-option
          v-for="ver in boardImageData?.os?.[os] || []"
          :key="ver.name"
          :label="`openEuler ${ver.name}`"
          :value="ver.name"
        />
      </el-select>
    </div>

    <!-- 条件筛选栏 -->
    <div class="filters">
      <div class="filter-row">
        <span class="filter-label">内核版本：</span>
      <div style="display: flex; align-items: center; flex-wrap: wrap;">
        <el-checkbox
          v-model="KernelscheckAll"
          :indeterminate="KernelsisIndeterminate"
          @change="KernelshandleCheckAllChange"
          style="margin-right: 15px;"
        >全部</el-checkbox>
        <el-checkbox-group 
          v-model="selectedKernels"
          @change="handleCheckedKernelsChange"
        >
          <el-checkbox 
           v-for="kernel in kernelVersions" 
            :key="kernel.version"
            :label="kernel.version"
          >
            {{ kernel.version }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      </div>

      <div class="filter-row">
        <span class="filter-label">ISA基线：</span>
        <div style="display: flex; align-items: center; flex-wrap: wrap;">
        <el-checkbox
          v-model="isacheckAll"
          :indeterminate="isaisIndeterminate"
          @change="isahandleCheckAllChange"
          style="margin-right: 15px;"
        >全部</el-checkbox>
        <el-checkbox-group 
          v-model="selectedISAs"
          @change="handleCheckedisaChange"
        >
          <el-checkbox 
            v-for="isa in isaProfiles" 
            :key="isa.id"
            :label="isa.profile"
          >
            {{ isa.profile }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
        
      </div>

      <div class="filter-row">
        <span class="filter-label">预装列表：</span>
        <div style="display: flex; align-items: center; flex-wrap: wrap;">
        <el-checkbox
          v-model="userspacescheckAll"
          :indeterminate="userspacesisIndeterminate"
          @change="userspaceshandleCheckAllChange"
          style="margin-right: 15px;"
        >全部</el-checkbox>
        <el-checkbox-group 
          v-model="selectedUserspaces"
          @change="handleCheckeduserspacesChange"
        >
        <el-checkbox 
          v-for="space in userspaces" 
          :key="space.id"
          :label="space.userspace"
        >
          {{ space.userspace }}
        </el-checkbox>
      </el-checkbox-group>
      </div>
      </div>

      <div class="filter-row">
        <span class="filter-label">引导器：</span>
        <div style="display: flex; align-items: center; flex-wrap: wrap;">
        <el-checkbox
          v-model="installercheckAll"
          :indeterminate="installerisIndeterminate"
          @change="installerhandleCheckAllChange"
          style="margin-right: 15px;"
        >全部</el-checkbox>
        <el-checkbox-group 
          v-model="selectedInstallers"
          @change="handleCheckedinstallerChange"
        >
        <el-checkbox 
          v-for="type in installerTypes" 
          :key="type"
          :label="type"
        >
          {{ type }}
        </el-checkbox>
      </el-checkbox-group>
      </div>
      </div>

      <div class="filter-row">
        <span class="filter-label">仅看最新版：</span>
        <el-radio-group v-model="onlyLatest">
          <el-radio :value=true >是</el-radio>
          <el-radio :value=false >否</el-radio>
        </el-radio-group>
      </div>
    </div>


      <!-- 镜像文件列表 -->
      <div class="file-list">
        <div
          class="file-item"
          v-for="(file, index) in filteredFiles"
          :key="index"
        >
          <span>{{ file.name }}</span>
          <el-link
            type="primary"
            :href="file.link"
            target="_blank"
            >下载</el-link
          >
        </div>
      </div>

      <!-- 查看帮助文档 -->
      <div class="help-doc-buttons">
        <div
          v-for="(docURL, index) in getMarkDownInDocs()"
          :key="index"
        >
          <el-button
            type="primary"
            @click="helpDocVisible = true"
          >
            查看帮助文档
          </el-button>
          <el-dialog v-model="helpDocVisible" align-center draggable lock-scroll destroy-on-close>
            <HelpDoc :markdownURL="docURL" :boardDetail="boardDetail" />
          </el-dialog>
        </div>
      </div>
    </el-card>

  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { ref, computed, onMounted, nextTick } from 'vue';
import { ElMessage, ElButton, ElImage } from 'element-plus';
import CustomSearchIcon from '@/components/icon/CustomSearchIcon.vue';
import CustomLogoIcon from '@/components/icon/CustomLogoIcon.vue';
import CustomBackHomeIcon from '@/components/icon/CustomBackHomeIcon.vue';
import BoardInfoTitle from "@/components/board/BoardInfoTitle.vue";
import { useRouter } from 'vue-router';
import { getProductVersion } from '@/api/get-json';
import './style.scss'

import HelpDoc from "@/components/helpDoc/helpDoc.vue";
const route = useRoute();
const router = useRouter();
const boardDetail = ref({});
const currentImageSrc = ref('');
const onlyLatest = ref(true);

const os = ref("openEuler");
const version = ref("");
const boardImageData = ref({});
const selectedKernel = ref("");
const selectedISA = ref("");
const selectedUserspace = ref("");
const selectedInstaller = ref("");

const fetchBoardDetail = async () => {
  try {
    const productUri = route.query.productUri;
    if (!productUri) {
      ElMessage.error("路由参数 productUri 为空");
      return;
    }
    const uri = `/${productUri}`;
    const response = await fetch(uri);
    if (!response.ok) {
      ElMessage.error(`请求失败，状态码: ${response.status}`);
      return;
    }
    const data = await response.json();

    // 检查数据是否有效
    if (typeof data === "object" && data !== null) {
      boardDetail.value = data;
      if (boardDetail.value.pictures && boardDetail.value.pictures.length > 0) {
        currentImageSrc.value = boardDetail.value.pictures[0];
      }
    } else {
      ElMessage.error("返回的数据不是有效的对象");
      return;
    }

    await nextTick();
  } catch (error) {
    ElMessage.error("获取板子详情失败：" + error.message);
  }
};

// 帮助文档
const helpDocVisible = ref(false);
const getMarkDownInDocs = () => {
  const getDocs = () => {
    const os = boardDetail.value.os;
    if (!os) {
      return [];
    }
    if (os["openEuler"]) {
      return os["openEuler"];
    } else {
      return [];
    }
  };
  const doc = getDocs();
  const markdownDocs = [];
  if (Array.isArray(doc)) {
    for (const docItem of doc) {
      if (docItem.imagesuites && Array.isArray(docItem.imagesuites)) {
        for (const imageSuite of docItem.imagesuites) {
          if (imageSuite.docs && Array.isArray(imageSuite.docs)) {
            for (const docContent of imageSuite.docs) {
              if (docContent) {
                markdownDocs.push(docContent);
              }
            }
          }
        }
      }
    }
  } else if (doc && typeof doc === "object") {
    if (doc.imagesuites && Array.isArray(doc.imagesuites)) {
      for (const doc2 of doc.imagesuites) {
        if (doc2 && doc2.docs && Array.isArray(doc2.docs)) {
          for (const doc3 of doc2.docs) {
            if (doc3) {
              markdownDocs.push(doc3);
            }
          }
        }
      }
    }
  }

  // 使用 Set 进行去重，然后转换回数组
  return [...new Set(markdownDocs)];
};

const goHome = () => {
  router.push("/home");
};

const getRamConfig = () => {
  const hardware = boardDetail.value.hardware;
  const ram = hardware && hardware.ram;
  if (!ram) return "NC";
  const capacities = ram.capacity.join("/");
  return `${ram.type}, ${capacities}`;
};

const getStorageInterfaces = () => {
  return boardDetail.value.hardware?.storage || [];
};

const getHighSpeedInterfaces = () => {
  return (
    boardDetail.value.hardware?.connectivity?.filter((item) => {
      const highSpeedTypes = [
        "USB-A",
        "Ethernet",
        "HDMI",
        "MIPI-CSI",
        "MIPI-DSI",
      ];
      return highSpeedTypes.includes(item.type);
    }) || []
  );
};

const getLowSpeedInterfaces = () => {
  return (
    boardDetail.value.hardware?.connectivity?.filter((item) => {
      const lowSpeedTypes = ["USB-C", "WiFi", "Bluetooth"];
      return lowSpeedTypes.includes(item.type);
    }) || []
  );
};

const changeMainImage = (index) => {
  if (boardDetail.value.pictures && boardDetail.value.pictures.length > index) {
    currentImageSrc.value = boardDetail.value.pictures[index];
  }
};
// 获取接口数据
const fetchProductVersion = async () => {
  try {
    const response = await getProductVersion();
    if (response && response.data) {
      boardImageData.value = response.data;
      // 默认设置版本
      if (boardImageData.value?.os?.[os.value]?.length) {
        version.value = boardImageData.value.os[os.value][0].name;
      }
    } else {
      ElMessage.error("获取产品版本失败：返回数据为空");
    }
  } catch (error) {
    console.error("获取产品版本失败:", error);
    ElMessage.error("获取产品版本失败：" + error.message);
  }
};

// 当前版本对应的镜像集
const imageSuites = computed(() => {
  return (
    boardImageData.value?.os?.[os.value]?.find((v) => v.name === version.value)
      ?.imagesuites || []
  );
});

const selectedKernels = ref([]);
const selectedISAs = ref([]);
const selectedUserspaces = ref([]);
const selectedInstallers = ref([]);

const KernelscheckAll = ref(false)
const KernelsisIndeterminate = ref(true)
const isacheckAll = ref(false)
const isaisIndeterminate = ref(true)
const userspacescheckAll = ref(false)
const userspacesisIndeterminate = ref(true)
const installercheckAll = ref(false)
const installerisIndeterminate = ref(true)

const KernelshandleCheckAllChange = (val) => {
  selectedKernels.value = val ? kernelVersions.value.map(k => k.version) : [];
  KernelsisIndeterminate.value = false;
}

const handleCheckedKernelsChange = (value) => {
  const checkedCount = value.length
  KernelscheckAll.value = checkedCount === kernelVersions.length
  KernelsisIndeterminate.value = checkedCount > 0 && checkedCount < kernelVersions.length
}

const isahandleCheckAllChange = (val) => {
  selectedISAs.value = val ? isaProfiles.value.map(k => k.profile) : [];
  isaisIndeterminate.value = false;
}

const handleCheckedisaChange = (value) => {
  const checkedCount = value.length
  isacheckAll.value = checkedCount === isaProfiles.length
  isaisIndeterminate.value = checkedCount > 0 && checkedCount < isaProfiles.length
}

const userspaceshandleCheckAllChange = (val) => {
  selectedUserspaces.value = val ? userspaces.value.map(k => k.userspace) : [];
  userspacesisIndeterminate.value = false;
}

const handleCheckeduserspacesChange = (value) => {
  const checkedCount = value.length
  userspacescheckAll.value = checkedCount === userspaces.length
  userspacesisIndeterminate.value = checkedCount > 0 && checkedCount < userspaces.length
}

const installerhandleCheckAllChange = (val) => {
  selectedInstallers.value = val ? installerTypes.value : [];
  installerisIndeterminate.value = false;
}

const handleCheckedinstallerChange = (value) => {
  const checkedCount = value.length
  installercheckAll.value = checkedCount === installerTypes.length
  installerisIndeterminate.value = checkedCount > 0 && checkedCount < installerTypes.length
}

// 提取所有筛选项数据
const kernelVersions = computed(() => {
  return imageSuites.value.flatMap(suite => {
    const versions = suite.kernel?.versions;
    if (versions) {
      return [...new Set(versions.map(version => ({ version }))).filter(Boolean)]
    }
    return [];
  });
});

const isaProfiles = computed(() => {
  return imageSuites.value.flatMap((suite, index) => {
    const isaList = suite.isa;
    if (Array.isArray(isaList)) {
      return isaList.map((isa, isaIndex) => ({
        id: `${index}-${isaIndex}`,
        profile: isa.profile,
        extensions: isa.extensions
      }));
    } else if (isaList && typeof isaList === 'object') {
      return [...new Set([{
        id: `${index}-0`,
        profile: isaList.profile,
        extensions: isaList.extensions
      }])];
    }
    return [];
  });
});


const userspaces = computed(() => {
  return imageSuites.value.flatMap((suite, index) => {
    const userSpaceList = suite.userspace;
    if (Array.isArray(userSpaceList)) {
      return userSpaceList.map((space, spaceIndex) => ({
        id: `${index}-${spaceIndex}`,
        userspace: space
      }));
    } else if (userSpaceList) {
      return [...new Set([{
        id: `${index}-0`,
        userspace: userSpaceList
      }])];
    }
    return [];
  });
});

const installerTypes = computed(() =>
  [...new Set(imageSuites.value.map(s => s.type).filter(Boolean))]
);

// 过滤后的文件列表
const filteredFiles = computed(() => {
  let filteredSuites = imageSuites.value;

  if (selectedKernel.value) {
    filteredSuites = filteredSuites.filter(
      (s) => s.kernel?.version === selectedKernel.value
    );
  }
  if (selectedISA.value) {
    filteredSuites = filteredSuites.filter(
      (s) => s.isa?.profile === selectedISA.value
    );
  }
  if (selectedUserspace.value) {
    filteredSuites = filteredSuites.filter(
      (s) => s.userspace === selectedUserspace.value
    );
  }
  if (selectedInstaller.value) {
    filteredSuites = filteredSuites.filter(
      (s) => s.type === selectedInstaller.value
    );
  }

  // 合并所有符合条件的文件
  return filteredSuites.flatMap((s) =>
    s.files.map((f) => ({
      name: f.url.split("/").pop(),
      link: f.url,
    }))
  );
});

onMounted(async () => {
  await fetchBoardDetail();
  await fetchProductVersion();
  nextTick();
});
</script>

<style scoped>
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
.help-doc-buttons{
  margin: 10px;
}
</style>

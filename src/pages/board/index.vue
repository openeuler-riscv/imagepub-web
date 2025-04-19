<template>
  <div class="detail-container">
    <div class="main-container">
      <div class="top-bar-container">
        <div class="input-wrapper">
          <CustomLogoIcon class="prefix-icon"/>
          <div class="back-home-container">
            <el-button @click="goHome" class="home-button">
              <CustomBackHomeIcon/>
              <span style="font-size: 1.25rem;font-family: PingFang SC-Regular;">回首页</span>
            </el-button>
          </div>
          <div class="spacer"></div>
          <div class="detail-search-container">
            <el-input
                class="input-container"
                placeholder="板卡信息"
                size="large"
            ></el-input>
            <CustomSearchIcon/>
          </div>
        </div>
      </div>

    </div>
    <div class="board-container">
      <div class="product-container" v-if="boardDetail">
        <div class="board-info">
          <div class="board-image-container">
            <div class="board-image">
              <el-image :src="currentImageSrc" style="width: 25vh; height: 25vh;"/>
            </div>
            <div class="thumbnail-container">
              <el-image
                  v-for="(pic, index) in boardDetail?.pictures || []"
                  :key="index"
                  :src="pic"
                  style="width: 60px; height: 45px; margin-right: 10px; cursor: pointer; border: saddlebrown 1px solid "
                  @click="changeMainImage(index)"
              />
            </div>
          </div>
          <div class="info-list">
            <div class="info-item">
              <BoardInfoTitle title="板卡信息"/>
              <el-row>厂商名称: {{ boardDetail?.vendor?.name }}</el-row>
              <el-row>Soc型号: {{ boardDetail?.soc?.name }}</el-row>
              <el-row>板卡类型: {{ boardDetail?.type }}</el-row>
            </div>
            <div class="info-item">
              <BoardInfoTitle title="RAM配置"/>
              <el-row>{{ getRamConfig() }}</el-row>
            </div>
            <div class="info-item">
              <BoardInfoTitle title="存储接口"/>
              <el-row>
                <el-col v-for="(item, index) in getStorageInterfaces()" :key="index" :span="24">
                  {{ item.type }}, {{ item.capacity ? item.capacity : 'NC' }}
                </el-col>
              </el-row>
            </div>
            <div class="info-item">
              <BoardInfoTitle title="高速接口"/>
              <el-row>
                <el-col v-for="(item, index) in getHighSpeedInterfaces()" :key="index" :span="24">
                  {{ item.type }} {{ item.nums ? `x${item.nums}` : '' }}
                </el-col>
              </el-row>
            </div>
            <div class="info-item">
              <BoardInfoTitle title="低速接口"/>
              <el-row>
                <el-col v-for="(item, index) in getLowSpeedInterfaces()" :key="index" :span="24">
                  {{ item.type }} {{ item.nums ? `x${item.nums}` : '' }}
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
      <el-select v-model="os" placeholder="选择系统">
        <el-option label="openEuler" value="openEuler" />
      </el-select>
      <el-select v-model="version" placeholder="选择版本">
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
        <span>内核版本：</span>
        <el-link :type="!selectedKernel ? 'primary' : ''" @click="selectedKernel = ''">全部</el-link>
        <el-link
          v-for="kernel in kernelVersions"
          :key="kernel"
          :type="selectedKernel === kernel ? 'primary' : ''"
          @click="selectedKernel = kernel"
        >{{ kernel }}</el-link>
      </div>

      <div class="filter-row">
        <span>ISA基线：</span>
        <el-link :type="!selectedISA ? 'primary' : ''" @click="selectedISA = ''">全部</el-link>
        <el-link
          v-for="isa in isaProfiles"
          :key="isa"
          :type="selectedISA === isa ? 'primary' : ''"
          @click="selectedISA = isa"
        >{{ isa }}</el-link>
      </div>

      <div class="filter-row">
        <span>预装列表：</span>
        <el-link :type="!selectedUserspace ? 'primary' : ''" @click="selectedUserspace = ''">全部</el-link>
        <el-link
          v-for="space in userspaces"
          :key="space"
          :type="selectedUserspace === space ? 'primary' : ''"
          @click="selectedUserspace = space"
        >{{ space }}</el-link>
      </div>

      <div class="filter-row">
        <span>引导器：</span>
        <el-link :type="!selectedInstaller ? 'primary' : ''" @click="selectedInstaller = ''">全部</el-link>
        <el-link
          v-for="type in installerTypes"
          :key="type"
          :type="selectedInstaller === type ? 'primary' : ''"
          @click="selectedInstaller = type"
        >{{ type }}</el-link>
      </div>
    </div>

    <!-- 镜像文件列表 -->
    <div class="file-list">
      <div class="file-item" v-for="(file, index) in filteredFiles" :key="index">
        <span>{{ file.name }}</span>
        <el-link type="primary" :href="file.link" target="_blank">下载</el-link>
      </div>
    </div>
  </el-card>

  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { ref, computed, onMounted, nextTick } from 'vue';
import { ElMessage, ElButton, ElTable, ElTableColumn, ElImage } from 'element-plus';
import CustomSearchIcon from '@/components/icon/CustomSearchIcon.vue';
import CustomLogoIcon from '@/components/icon/CustomLogoIcon.vue';
import CustomBackHomeIcon from '@/components/icon/CustomBackHomeIcon.vue';
import BoardInfoTitle from "@/components/board/BoardInfoTitle.vue";
import { useRouter } from 'vue-router';
import { getProductVersion } from '@/api/get-json';

const route = useRoute();
const router = useRouter();
const boardDetail = ref({});
const currentImageSrc = ref('');

const os = ref('openEuler');
const version = ref('');
const boardImageData = ref({});
const selectedKernel = ref('');
const selectedISA = ref('');
const selectedUserspace = ref('');
const selectedInstaller = ref('');

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

    // 检查数据是否有效
    if (typeof data === 'object' && data !== null) {
      boardDetail.value = data;
      if (boardDetail.value.pictures && boardDetail.value.pictures.length > 0) {
        currentImageSrc.value = boardDetail.value.pictures[0];
      }
    } else {
      ElMessage.error('返回的数据不是有效的对象');
      return;
    }

    await nextTick();
  } catch (error) {
    ElMessage.error('获取板子详情失败：' + error.message);
  }
};

const goHome = () => {
  router.push('/home');
};

const getRamConfig = () => {
  const hardware = boardDetail.value.hardware;
  const ram = hardware && hardware.ram;
  if (!ram) return 'NC';
  const capacities = ram.capacity.join('/');
  return `${ram.type}, ${capacities}`;
};

const getStorageInterfaces = () => {
  return boardDetail.value.hardware?.storage || [];
};

const getHighSpeedInterfaces = () => {
  return boardDetail.value.hardware?.connectivity?.filter(item => {
    const highSpeedTypes = ['USB-A', 'Ethernet', 'HDMI', 'MIPI-CSI', 'MIPI-DSI'];
    return highSpeedTypes.includes(item.type);
  }) || [];
};

const getLowSpeedInterfaces = () => {
  return boardDetail.value.hardware?.connectivity?.filter(item => {
    const lowSpeedTypes = ['USB-C', 'WiFi', 'Bluetooth'];
    return lowSpeedTypes.includes(item.type);
  }) || [];
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
      ElMessage.error('获取产品版本失败：返回数据为空');
    }
  } catch (error) {
    console.error('获取产品版本失败:', error);
    ElMessage.error('获取产品版本失败：' + error.message);
  }
};

// 当前版本对应的镜像集
const imageSuites = computed(() => {
  return (
    boardImageData.value?.os?.[os.value]?.find(v => v.name === version.value)
      ?.imagesuites || []
  );
});

// 提取所有筛选项数据
const kernelVersions = computed(() =>
  [...new Set(imageSuites.value.map(s => s.kernel?.version).filter(Boolean))]
);
const isaProfiles = computed(() =>
  [...new Set(imageSuites.value.map(s => s.isa?.profile).filter(Boolean))]
);
const userspaces = computed(() =>
  [...new Set(imageSuites.value.map(s => s.userspace).filter(Boolean))]
);
const installerTypes = computed(() =>
  [...new Set(imageSuites.value.map(s => s.type).filter(Boolean))]
);

// 过滤后的文件列表
const filteredFiles = computed(() => {
  let filteredSuites = imageSuites.value;

  if (selectedKernel.value) {
    filteredSuites = filteredSuites.filter(
      s => s.kernel?.version === selectedKernel.value
    );
  }
  if (selectedISA.value) {
    filteredSuites = filteredSuites.filter(
      s => s.isa?.profile === selectedISA.value
    );
  }
  if (selectedUserspace.value) {
    filteredSuites = filteredSuites.filter(
      s => s.userspace === selectedUserspace.value
    );
  }
  if (selectedInstaller.value) {
    filteredSuites = filteredSuites.filter(
      s => s.type === selectedInstaller.value
    );
  }

  // 合并所有符合条件的文件
  return filteredSuites.flatMap(s =>
    s.files.map(f => ({
      name: f.url.split('/').pop(),
      link: f.url
    }))
  );
});


onMounted(async () => {
  await fetchBoardDetail();
  await fetchProductVersion();

});
</script>

<style scoped>
.detail-container {
  width: 100%;
  height: 100%;

  .main-container {
    display: flex;
    justify-content: center;
  }
}

.top-bar-container {
  width: 90%;
  height: 7vh;
  margin-top: 2vh;
  border: 1px solid #f1faff;
  border-radius: 24px;
  background-color: #ffffff;
  display: flex;
  justify-content: center;

  .detail-search-container {
    width: 50vw;
    display: flex;
    justify-content: center;

    .input-container {
      width: 80%;
    }
  }

  .back-home-container {
    background: rgba(74, 119, 202, .05);
    color: #4a77ca;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
  }

  .back-home-container:hover {
    color: #012fa6;
    background: rgba(1, 47, 166, 1);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px #012fa61a;
  }
}

.input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 10px;
  justify-content: space-between;
}

.prefix-icon {
  margin-right: 10px;
}

.home-button {
  background-color: transparent;
  border: none;
  font-weight: 500;
  font-size: 16px;
  color: #4a77ca;
  transition: all 0.3s;
}

.home-button:hover {
  color: #012fa6;
  background: rgba(1, 47, 166, 0.1);
  border-radius: 12px;
  transform: translateY(-2px);
}

.detail-search-container {
  flex-grow: 1;
  display: flex;
  align-items: center;
  position: relative;
}

.input-container {
  width: 100%;
}

:deep(.el-input__wrapper) {
  background-color: #f0f4f8;
  border-radius: 24px;
  border: none;
}

:deep(.el-input__suffix) {
  margin-right: 4.5vh;
}

.product-container {
  width: 90%;
  visibility: visible;
  opacity: 1;
  display: flex;
  flex-wrap: wrap;
  padding: 20px;
}

.board-info {
  margin-top: 20px;
  display: flex;
  width: 100%;
  border-radius: 20px;
  box-shadow: 0 3px 2px #012fa605, 0 7px 5px #012fa608, 0 12px 10px #012fa60a, 0 22px 18px #012fa60a;
}

.board-image {
  margin-right: 20px;
}

.thumbnail-container {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  gap: 8px;
}

.info-list {
  display: flex;
  flex-wrap: wrap;
  width: calc(100% - 320px);
}

.info-item {
  width: 33%;
  margin-bottom: 10px;
}

.board-container{
  display: flex;
  justify-content: center;
  font-family: PingFang SC-Regular;
}


.info-item h4 {
  margin: 0 0 6px;
  color: #333;
  font-weight: 600;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 5px;
  color: #555;
}

.ram-config {
  font-weight: 500;
  color: #666;
}

.board-container {
  display: flex;
  justify-content: center;
}

.box-card {
  width: 90%;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 12px;

}
.top-selects {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.filters {
  margin-bottom: 20px;
}
.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #444;
}
.file-list {
  margin-top: 20px;
}
.file-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e5e5e5;
}
.file-item span {
  font-weight: 500;
  color: #333;
}

:deep(.el-row) {
  font-size: 0.9rem;
}

</style>
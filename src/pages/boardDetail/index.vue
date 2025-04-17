<template>
  <div class="detail-container">
    <div class="main-container">
      <div class="top-bar-container">
        <div class="input-wrapper">
          <CustomLogoIcon class="prefix-icon"/>
          <div class="back-home-container">
            <el-button @click="goHome" class="home-button">
              <CustomBackHomeIcon/>
              回首页
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
              <el-image :src="currentImageSrc" style="width: 13vw; height: 15vw;"/>
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
              <h4>板卡信息</h4>
              <p>厂商名称: {{ boardDetail?.vendor?.name }}</p>
              <p>Soc型号: {{ boardDetail?.soc?.name }}</p>
              <p>板卡类型: {{ boardDetail?.type }}</p>
            </div>
            <div class="info-item">
              <h4>RAM配置</h4>
              <p>{{ getRamConfig() }}</p>
            </div>
            <div class="info-item">
              <h4>存储接口</h4>
              <ul>
                <li v-for="(item, index) in getStorageInterfaces()" :key="index">{{ item.type }},
                  {{ item.capacity ? item.capacity : 'NC' }}
                </li>
              </ul>
            </div>
            <div class="info-item">
              <h4>高速接口</h4>
              <ul>
                <li v-for="(item, index) in getHighSpeedInterfaces()" :key="index">{{ item.type }}
                  {{ item.nums ? `x${item.nums}` : '' }}
                </li>
              </ul>
            </div>
            <div class="info-item">
              <h4>低速接口</h4>
              <ul>
                <li v-for="(item, index) in getLowSpeedInterfaces()" :key="index">{{ item.type }}
                  {{ item.nums ? `x${item.nums}` : '' }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 展示操作系统信息 -->
        <!--      <div class="os-info">-->
        <!--        <h3>操作系统信息</h3>-->
        <!--        <el-table :data="boardDetail?.os?.openEuler?.flatMap(item => item.imagesuites) || []">-->
        <!--          <el-table-column label="名称" :formatter="(row) => row?.name"></el-table-column>-->
        <!--          <el-table-column label="镜像套件名称" :formatter="(row) => row?.name"></el-table-column>-->
        <!--          <el-table-column label="内核类型" :formatter="(row) => row?.kernel?.type"></el-table-column>-->
        <!--          <el-table-column label="内核分支" :formatter="(row) => row?.kernel?.branch"></el-table-column>-->
        <!--          <el-table-column label="内核版本" :formatter="(row) => row?.kernel?.version"></el-table-column>-->
        <!--          <el-table-column label="用户空间" :formatter="(row) => row?.userspace"></el-table-column>-->
        <!--          <el-table-column label="类型" :formatter="(row) => row?.type"></el-table-column>-->
        <!--        </el-table>-->
        <!--      </div>-->
      </div>
      <div v-else>
        <p>暂无板卡详情信息，请稍后重试。</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import {useRoute} from 'vue-router';
import {ref, onMounted, nextTick} from 'vue';
import {ElMessage, ElButton, ElTable, ElTableColumn, ElImage} from 'element-plus';
import CustomSearchIcon from '@/components/icon/CustomSearchIcon.vue';
import CustomLogoIcon from '@/components/icon/CustomLogoIcon.vue';
import CustomBackHomeIcon from '@/components/icon/CustomBackHomeIcon.vue';
import {useRouter} from 'vue-router';

const route = useRoute();
const router = useRouter();
const boardDetail = ref({});
const currentImageSrc = ref('');

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
  return ram ? `${ram.type} ${ram.capacity.join(', ')}` : 'NC';
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

onMounted(async () => {
  await fetchBoardDetail();
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
    font-size: 24px;
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
  margin-right: 10px;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.spacer {
  flex-grow: 1;
}

:deep(.el-input__wrapper) {
  background-color: #ffffff;
  border-radius: 24px;
  border: none;
  padding: 0;
}

:deep(.el-input__suffix) {
  margin-right: 4.5vh;
}

.product-container {
  width: 90%;
  background-color: #ffffff;
  overflow-y: auto;
  /* 确保元素可见 */
  visibility: visible;
  opacity: 1;
  display: flex;
  flex-wrap: wrap;
  padding: 20px;
}

.board-info {
  display: flex;
  width: 100%;
  margin-bottom: 20px;
}

.board-image {
  margin-right: 20px;
}

.thumbnail-container {
  display: flex;
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

.os-info {
  width: 100%;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 5px;
}

.board-container{
  display: flex;
  justify-content: center;
}
</style>
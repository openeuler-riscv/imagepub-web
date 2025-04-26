<template>
  <div class="board-container">
    <div class="product-container" v-if="boardDetail">
      <div class="board-info">
        <div class="board-image-container">
          <div class="board-image">
            <el-image :src="currentImageSrc" style="width: 25vh; height: 25vh" />
          </div>
          <div class="thumbnail-container">
            <el-image
                v-for="(pic, index) in boardDetail?.pictures || []"
                :key="index"
                :src="pic"
                style="width: 60px; height: 45px; margin-right: 10px; cursor: pointer; border: saddlebrown 1px solid;"
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
              <el-col v-for="(item, index) in getStorageInterfaces()" :key="index" :span="24">
                {{ item.type }}, {{ item.capacity || "NC" }}
              </el-col>
            </el-row>
          </div>
          <div class="info-item">
            <BoardInfoTitle title="高速接口" />
            <el-row>
              <el-col v-for="(item, index) in getHighSpeedInterfaces()" :key="index" :span="24">
                {{ item.type }} {{ item.nums ? `x${item.nums}` : "" }}
              </el-col>
            </el-row>
          </div>
          <div class="info-item">
            <BoardInfoTitle title="低速接口" />
            <el-row>
              <el-col v-for="(item, index) in getLowSpeedInterfaces()" :key="index" :span="24">
                {{ item.type }} {{ item.nums ? `x${item.nums}` : "" }}
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-data提示">
      <p>暂无板卡详情信息，请稍后重试。</p>
    </div>
  </div>
</template>

<script setup>
import BoardInfoTitle from "./BoardInfoTitle.vue";
import { ref, watch } from "vue";

const currentImageSrc = ref('');
const props = defineProps({ boardDetail: {} });

watch(
    () => props.boardDetail,
    (newValue) => {
      newValue?.pictures?.length > 0 && (currentImageSrc.value = newValue.pictures[0]);
    },
    { immediate: true }
);

const getRamConfig = () =>
    props.boardDetail.hardware?.ram
        ? `${props.boardDetail.hardware.ram.type}, ${props.boardDetail.hardware.ram.capacity.join('/')}`
        : 'NC';

const getStorageInterfaces = () =>
    props.boardDetail.hardware?.storage || [];

const getHighSpeedInterfaces = () =>
    props.boardDetail.hardware?.connectivity?.filter(item =>
        ['USB-A', 'Ethernet', 'HDMI', 'MIPI-CSI', 'MIPI-DSI'].includes(item.type)
    ) || [];

const getLowSpeedInterfaces = () =>
    props.boardDetail.hardware?.connectivity?.filter(item =>
        ['USB-C', 'WiFi', 'Bluetooth'].includes(item.type)
    ) || [];

const changeMainImage = (index) => {
  currentImageSrc.value = props.boardDetail.pictures?.[index] || '';
};
</script>

<style scoped>
.board-container {
  display: flex;
  justify-content: center;
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

.info-list {
  display: flex;
  flex-wrap: wrap;
  margin-left: 5vw;
  width: calc(100% - 320px);
}

.info-item {
  width: 33%;
  margin-bottom: 10px;
}

.thumbnail-container {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  gap: 8px;
}

.no-data提示 {
  padding: 20px;
  color: #666;
}
</style>
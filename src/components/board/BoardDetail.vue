<template>
  <div class="board-container">
    <div class="product-container" v-if="boardDetail">
      <div class="board-info">
        <div class="board-image-container">
          <div class="board-image">
            <el-image :src="currentImageSrc" style="width: 23vh; height: 23vh" />
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
            <BoardInfoTitle :title="t('boardInfo')" />
            <el-row>{{ t('vendorName') }}: {{ boardDetail?.vendor?.name }}</el-row>
            <el-row>{{ t('socModel') }}: {{ boardDetail?.soc?.name }}</el-row>
            <el-row>{{ t('boardType') }}: {{ boardDetail?.type }}</el-row>
          </div>
          <div class="info-item">
            <BoardInfoTitle :title="t('ramConfig')" />
            <el-row>{{ getRamConfig() }}</el-row>
          </div>
          <div class="info-item">
            <BoardInfoTitle :title="t('storageInterface')" />
            <el-row>
              <el-col v-for="(item, index) in getStorageInterfaces()" :key="index" :span="24">
                {{ item.type }}, {{ item.capacity || t('notConfigured') }}
              </el-col>
            </el-row>
          </div>
          <div class="info-item">
            <BoardInfoTitle :title="t('highSpeedInterface')" />
            <el-row>
              <el-col v-for="(item, index) in getHighSpeedInterfaces()" :key="index" :span="24">
                {{ item.type }} {{ item.nums ? `x${item.nums}` : "" }}
              </el-col>
            </el-row>
          </div>
          <div class="info-item">
            <BoardInfoTitle :title="t('lowSpeedInterface')" />
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
      <p>{{ t('noBoardDetailInfo') }}</p>
    </div>
  </div>
</template>

<script setup>
import BoardInfoTitle from "./BoardInfoTitle.vue";
import { ref, watch } from "vue";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
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
        : t('notConfigured');

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
/* 主容器，居中显示 */
.board-container {
  display: flex;
  justify-content: center;
}

/* 产品信息外层容器，PC端为横向排列 */
.product-container {
  width: 90%;
  visibility: visible;
  opacity: 1;
  display: flex;
  flex-wrap: wrap;
}

/* 板卡信息主区域，PC端为横向排列 */
.board-info {
  margin-top: 20px;
  display: flex;
  padding: 20px;
  width: 100%;
  border-radius: 20px;
  box-shadow: 0 3px 2px #012fa605, 0 7px 5px #012fa608, 0 12px 10px #012fa60a, 0 22px 18px #012fa60a;
}

/* 板卡主图，PC端右侧有间距 */
.board-image {
  margin-right: 20px;
}

/* 信息列表，PC端为多列布局 */
.info-list {
  display: flex;
  flex-wrap: wrap;
  margin-left: 5vw;
  width: calc(100% - 320px);
}

/* 单个信息块，PC端为三列 */
.info-item {
  width: 33%;
  margin-bottom: 10px;
}

/* 缩略图容器 */
.thumbnail-container {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  gap: 8px;
}

/* 无数据提示 */
.no-data提示 {
  padding: 20px;
  color: #666;
}

/* ------------------ 移动端适配 ------------------ */
@media screen and (max-width: 768px) {
  /* 产品信息外层容器，移动端纵向排列 */
  .product-container {
    flex-direction: column;
    padding: 10px 2vw;
    width: 100%;
  }
  /* 板卡信息主区域，移动端纵向排列 */
  .board-info {
    flex-direction: column;
    margin-top: 10px;
    box-shadow: none;
    border-radius: 10px;
    width: 100%;
    align-items: center;
    padding: 0;
  }
  /* 板卡主图，移动端居中显示并自适应宽度 */
  .board-image {
    margin: 0 auto 12px auto;
    width: 90vw;
    max-width: 320px;
    display: flex;
    justify-content: center;
  }
  /* 主图自适应，最大宽高限制 */
  .board-image :deep(.el-image) {
    width: 100% !important;
    height: auto !important;
    max-width: 320px;
    max-height: 200px;
    object-fit: contain;
  }
  /* 缩略图居中显示 */
  .thumbnail-container {
    justify-content: center;
    gap: 6px;
    margin-top: 8px;
  }
  /* 信息列表，移动端纵向排列 */
  .info-list {
    width: 100%;
    margin-left: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  /* 单个信息块，移动端一行一块，卡片化 */
  .info-item {
    width: 100%;
    margin-bottom: 8px;
    font-size: 15px;
    line-height: 1.6;
    word-break: break-all;
    background: #f7f9fa;
    border-radius: 8px;
    padding: 10px 8px;
    box-sizing: border-box;
  }
  /* 信息行，字体适中，自动换行 */
  .info-item .el-row {
    margin-bottom: 4px;
    font-size: 15px;
    line-height: 1.5;
    word-break: break-all;
  }
  /* 最后一行无下边距 */
  .info-item .el-row:last-child {
    margin-bottom: 0;
  }
}
</style>
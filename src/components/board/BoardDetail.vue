<template>
  <div class="board-container">
    <div class="product-container" v-if="boardDetail">
      <div class="board-info">
        <div class="board-image-container">
          <div class="board-image">
            <el-image :src="getImageSrc(currentImageSrc)" style="width: 32vh; height: 42vh;border-radius:8px" />
          </div>
          <div class="thumbnail-container">
            <el-image
                v-for="(pic, index) in boardDetail?.pictures || []"
                :key="index"
                :src="getImageSrc(pic)"
                style="width: 60px; height: 45px; margin-right: 10px; cursor: pointer; border: saddlebrown 1px solid;"
                @click="changeMainImage(index)"
            />
          </div>
        </div>

        <div class="info-list">
          <div class="info-item">
            <BoardInfoTitle :title="t('boardInfo')" />
            <el-row>
              <el-col :span="8" >
                  <el-row style="margin-bottom:8px">{{ t('vendorName') }}: </el-row>
                  <el-row class="text-limit-16 text-style" >{{ boardDetail?.vendor?.name }}</el-row>
              </el-col>
              <el-col :span="8"> 
                <el-row style="margin-bottom:8px">{{ t('socModel') }}:</el-row> 
                <el-row class="text-limit-32 text-style">{{ boardDetail?.soc?.name }}</el-row></el-col>
              <el-col :span="8"><el-row style="margin-bottom:8px">{{ t('boardType') }}:</el-row> 
                <el-row class="text-style">{{ boardDetail?.type }}</el-row></el-col>
            </el-row>
            
          </div>
          <div class="info-item">
            <BoardInfoTitle :title="t('ramConfig')" />
            <el-row class="text-style">{{ getRamConfig() }}</el-row>
          </div>
          <div class="info-item">
            <el-row>
            <el-col :span="8">
            <BoardInfoTitle :title="t('storageInterface')" />
            <el-row>
              <el-col v-for="(item, index) in getStorageInterfaces()" :key="index" :span="24">
                <li>{{ item.type }}, {{ item.capacity || t('notConfigured') }}</li>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="8">
            <BoardInfoTitle :title="t('highSpeedInterface')" />
            <el-row>
              <el-col v-for="(item, index) in getHighSpeedInterfaces()" :key="index" :span="24">
                 <li>{{ item.type }} {{ item.nums ? `x${item.nums}` : "" }}</li>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="8">
            <BoardInfoTitle :title="t('lowSpeedInterface')" />
            <el-row>
              <el-col v-for="(item, index) in getLowSpeedInterfaces()" :key="index" :span="24">
                <li>{{ item.type }} {{ item.nums ? `x${item.nums}` : "" }}</li>
              </el-col>
            </el-row>
          </el-col>
          </el-row>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-data-notify">
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

const getImageSrc = (path) => {
  return `${import.meta.env.VITE_IMAGE_BASE_URL}${path}`;
};

const getRamConfig = () => {
  const ramList = props.boardDetail?.hw_info?.ram;
  if (!Array.isArray(ramList) || ramList.length === 0) {
    return t('notConfigured');
  }

  const firstRam = ramList[0];
  const type = firstRam.type || 'Unknown';
  const capacity = Array.isArray(firstRam.capacity)
      ? firstRam.capacity.join('/')
      : 'Unknown';

  return `${type}, ${capacity}`;
};

const getStorageInterfaces = () =>
    props.boardDetail.hw_info?.storage || [];

const getHighSpeedInterfaces = () =>
    props.boardDetail.hw_info?.connectivity?.filter(item =>
        ['USB-A', 'Ethernet', 'HDMI', 'MIPI-CSI', 'MIPI-DSI'].includes(item.type)
    ) || [];

const getLowSpeedInterfaces = () =>
    props.boardDetail.hw_info?.connectivity?.filter(item =>
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
}

.board-info {
  margin-top: 20px;
  display: flex;
  padding: 20px;
  width: 100%;
  border-radius: 20px;
  background: var(--theme-card);
  color: var(--theme-text);
  border: 1px solid var(--theme-border);
  box-shadow: 0 3px 12px 0 rgba(0,0,0,0.08);
  transition: background 0.3s, color 0.3s, border-color 0.3s;
}



/* 板卡主图 */
.board-image {
  margin-right: 20px;
}

.info-list {
  display: flex;
  flex-wrap: wrap;
  margin-left: 1vw;
  width: calc(100% - 320px);
  flex-direction: column;
}

.info-item {
  /* width: 33%; */
  margin-bottom: 10px;
  background: var(--theme-card);
  color: var(--theme-text);
  padding: 10px 8px;
  box-sizing: border-box;
  transition: background 0.3s, color 0.3s, border-color 0.3s;
}

.thumbnail-container {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  gap: 8px;
}

.no-data-notify {
  padding: 20px;
  color: var(--theme-text);
  background: var(--theme-card);
  border-radius: 10px;
  border: 1px solid var(--theme-border);
  text-align: center;
  transition: background 0.3s, color 0.3s, border-color 0.3s;
}


.text-limit-16 {
  /* 限制宽度为16个字符宽度 */
  max-width: 16ch;
  /* 强制单行显示 */
  white-space: nowrap;
  /* 隐藏超出部分 */
  overflow: hidden;
  /* 超出时显示省略号 */
  text-overflow: ellipsis;
}

.text-limit-32{
  /* 限制宽度为16个字符宽度 */
  max-width: 32ch;
  /* 强制单行显示 */
  white-space: nowrap;
  /* 隐藏超出部分 */
  overflow: hidden;
  /* 超出时显示省略号 */
  text-overflow: ellipsis;
}
.interface-list{
  display: flex;
}


/* ------------------ 移动端适配 ------------------ */
@media screen and (max-width: 768px) {
  .product-container {
    flex-direction: column;
    padding: 10px 2vw;
    width: 100%;
  }
  .board-info {
    flex-direction: column;
    margin-top: 10px;
    box-shadow: none;
    border-radius: 10px;
    width: 100%;
    align-items: center;
    padding: 0;
    background: var(--theme-card);
    color: var(--theme-text);
    border: 1px solid var(--theme-border);
  }
  .board-image {
    margin: 0 auto 12px auto;
    width: 90vw;
    max-width: 320px;
    display: flex;
    justify-content: center;
  }
  .board-image :deep(.el-image) {
    width: 100% !important;
    height: auto !important;
    max-width: 320px;
    max-height: 200px;
    object-fit: contain;
  }
  .thumbnail-container {
    justify-content: center;
    gap: 6px;
    margin-top: 8px;
  }
  .info-list {
    width: 100%;
    margin-left: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .info-item {
    width: 100%;
    margin-bottom: 8px;
    font-size: 15px;
    line-height: 1.6;
    word-break: break-all;
    background: var(--theme-card);
    color: var(--theme-text);
    border-radius: 8px;
    border: 1px solid var(--theme-border);
    padding: 10px 8px;
    box-sizing: border-box;
  }
  .info-item .el-row {
    margin-bottom: 4px;
    font-size: 15px;
    line-height: 1.5;
    word-break: break-all;
  }
  .info-item .el-row:last-child {
    margin-bottom: 0;
  }
}
</style>
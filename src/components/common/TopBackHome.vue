<template>
  <div class="main-container">
    <div class="top-bar-container">
      <div class="input-wrapper">
        <CustomLogoIcon class="prefix-icon" />
        <div>
          <el-button @click="goHome" :icon="Back" round dark class="no-border-button">
            <span style="font-size: 1.25rem; font-family: PingFang SC-Regular">回首页</span>
          </el-button>
        </div>
        <div class="spacer"></div>
        <div class="detail-search-container">
          <el-input class="input-container" placeholder="板卡信息" size="large" />
          <CustomSearchIcon />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>

import {Back} from "@element-plus/icons-vue";
import CustomLogoIcon from "@/components/icon/CustomLogoIcon.vue";
import CustomSearchIcon from "@/components/icon/CustomSearchIcon.vue";
import {useRouter} from "vue-router";

const router = useRouter();
const goHome = () => router.push('/home');

</script>
<style scoped>
.main-container {
  display: flex;
  justify-content: center;
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
    flex-grow: 0.95;
    display: flex;
    align-items: center;
    position: relative;
  }
  .no-border-button {
    border: none !important;
  }

  .no-border-button:hover {
    color: #012fa6 !important;
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

:deep(.el-input__wrapper) {
  background-color: #f0f4f8;
  border-radius: 24px;
  border: none;
}

:deep(.el-input__suffix) {
  margin-right: 4.5vh;
}

</style>
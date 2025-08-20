<template>
  <div class="main-container">
    <div class="top-bar-container">
      <div class="input-wrapper">
        <div class="left-section">
          <CustomLogoIcon class="prefix-icon" />
          <el-button v-if="isBoard" @click="goHome" :icon="Back" round dark class="no-border-button">
            <span style="font-size: 1.75rem; font-family: PingFang SC-Regular">{{ t('backToHome') }}</span>
          </el-button>

          <el-button v-if="!isBoard" @click="goBack" :icon="Back" round dark class="no-border-button">
            <span style="font-size: 1.75rem; font-family: PingFang SC-Regular">{{ t('backToPreviousPage') }}</span>
          </el-button>
        </div>
        <div class="detail-search-container">
          <div class="search-box">
            <el-input class="input-container" :placeholder="t('searchPlaceholder')" size="large" />
            <CustomSearchIcon class="search-icon" />
          </div>
        </div>
        <div class="right-section">
          <DarkModeButton />
          <el-button round @click="handleLanguageChange">{{ t('toggleLanguage') }}</el-button>
        </div>
      </div>
    </div>
    <!-- 添加一个关键属性，当routeVersion变化时，整个组件会重新渲染 -->
    <router-view :key="routeVersion" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Back } from "@element-plus/icons-vue";
import CustomLogoIcon from "@/components/icon/CustomLogoIcon.vue";
import CustomSearchIcon from "@/components/icon/CustomSearchIcon.vue";
import DarkModeButton from "@/components/common/DarkModeButton.vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from 'vue-i18n';
import { setCookie } from '@/utils/cookie';
import { defineEmits } from 'vue';
import {useDarkModeStore} from "@/store/darkMode.js";
import emitter from '@/utils/eventBus.js';
const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const emits = defineEmits(['language-change']);

const props = defineProps({
  isBoard: {
    type: Boolean,
    default: true
  }
});

// 初始化主题
const darkModeStore = useDarkModeStore();
darkModeStore.initTheme();

const routeVersion = ref(0);

const goHome = () => router.push('/');
const goBack = () => router.back();

watch(() => [route.path, route.query.lang], () => {
  routeVersion.value += 1;
}, { immediate: true });

const handleLanguageChange = () => {
  const newLang = locale.value === 'zh_CN' ? 'en_US' : 'zh_CN';
  locale.value = newLang;
  setCookie('lang', newLang);

  let i18nPath = route.path;

  if(i18nPath.includes('zh_CN')){
    i18nPath = i18nPath.replace('zh_CN', 'en_US');
  }else if(i18nPath.includes('en_US')){
    i18nPath = i18nPath.replace('en_US', 'zh_CN');
  }
  router.push({
    path: i18nPath,
    query: {
      ...route.query,
      lang: newLang
    }
  });
  emitter.emit('languageChanged', newLang);
};
</script>


<style scoped>
/* 主容器样式 */
.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.top-bar-container {
  width: 90%;
  /* height: 7vh; */
  margin-top: 2vh;
  /* border: 1px solid #f1faff; */
  border-radius: 24px;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  box-shadow: 0 3px 2px 0 rgba(1, 47, 166, 0.02), 0 7px 5px 0 rgba(1, 47, 166, 0.03), 0 12px 10px 0 rgba(1, 47, 166, 0.04), 0 22px 18px 0 rgba(1, 47, 166, 0.04);
    height: 96px;
}

/* 左侧区域样式 */
.left-section {
  display: flex;
  align-items: center;
  gap: 5px;
  width: 500px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 20px;
  gap: 20px;
}

/* Logo图标样式 */
.prefix-icon {
  margin-right: 0;
}

/* 搜索区域容器样式 */
.detail-search-container {
  flex-grow: 1;
  width: 500px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.search-box {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;

  .input-container {
    width: 100%;
    :deep(.el-input__wrapper) {
      border-radius: 20px;
      padding-right: 40px;
      box-shadow: 0 0 0 1px #e4e7ed;

      &:hover {
        box-shadow: 0 0 0 1px #a8b4cc;
      }

      &.is-focus {
        box-shadow: 0 0 0 1px #409eff;
      }
    }
  }
  .no-border-button {
    border: none !important;
    
    
  }
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 36%;
  transform: translateY(-50%);
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: #606266;

  &:hover {
    color: #409eff;
  }
}

.no-border-button {
  border: none !important;
  
}

.no-border-button :deep(.el-icon){
      color:#000 !important;
      font-size: 24px !important;
    }

.no-border-button:hover {
  color: #012fa6 !important;
}

/* 移动端适配样式 */
@media screen and (max-width: 1068px) {
  .top-bar-container {
    width: 95%;
    height: auto;
    padding: 10px 0;
    margin-top: 1vh;

    .detail-search-container {
      width: 100%;
      padding: 0 15px;
      box-sizing: border-box;
    }

    .search-box {
      width: 100%;

      .input-container {
        :deep(.el-input__wrapper) {
          padding-right: 35px;
        }
      }
    }

    .search-icon {
      right: 10px;
      width: 44px;
      height: 44px;
    }
  }

  .input-wrapper {
    flex-direction: column;
    gap: 12px;
    padding: 8px;
  }

  .left-section {
    width: 100%;
    justify-content: center;
  }

  .spacer {
    display: none;
  }

  :deep(.el-button) {
    padding: 8px 15px;

    span {
      font-size: 1rem !important;
    }
  }
}

:deep(.el-input__wrapper) {
  background-color: #f0f4f8;
  border-radius: 24px;
  border: none;
}

:deep(.el-input__suffix) {
  margin-right: 4.5vh;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 使用主题变量 */
.top-bar-container {
  background-color: var(--theme-card);
  border-color: var(--theme-border);
  color: var(--theme-text);
}

.search-box .input-container :deep(.el-input__wrapper) {
  background-color: #f5f5f5;
  box-shadow: 0 0 0 1px var(--theme-border);
  border-radius: 16px;
  height:60px;
  font-size: 16px;
}

.search-box .input-container :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--theme-hover);
}

.search-box .input-container :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary);
}

.search-icon {
  color: var(--theme-text);
}

.search-icon:hover {
  color: var(--el-color-primary);
}
</style>
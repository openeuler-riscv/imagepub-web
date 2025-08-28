<template>
  <div class="main-container">
    <div class="top-bar-container">
      <div class="input-wrapper">
        <div class="left-section">
          <CustomLogoIcon class="prefix-icon" dark @click="goHome" />
          <el-button v-if="isBoard" @click="goHome" :icon="Back"  round dark class="no-border-button">
            <span style="font-size: 1.75rem; font-family: PingFang SC-Regular">{{ t('backToHome') }}</span>
          </el-button>

          <el-button v-if="!isBoard" @click="goBack" :icon="Back" round dark class="no-border-button">
            <span style="font-size: 1.75rem; font-family: PingFang SC-Regular">{{ t('backToPreviousPage') }}</span>
          </el-button>
        </div>

      <div id="searchDetail">
        <input
          type="text"
          class="search-input"
          v-model="searchKeyword"
          @input="handleSearchInput"
          @keyup.enter="handleSearch"
           :placeholder="randomPlaceholder"
          @blur="handleInputBlur"
          ref="searchInputRef"
    
        />
        <div
          :class="['search-img', { 'search-button': searchKeyword }]"
          @click="searchKeyword ? handleSearch() : handleSearchIconClick()"
        >
          
          <button v-if="searchKeyword" class="search-text" type="button">搜 索</button>
          <img
            v-else-if="!isDark"
            src="@/assets/icons/home/Group 2.png"
            alt=""
          />
          <img
            v-else
            src="@/assets/logo/Group2Dark.svg"
            alt=""
          />

        </div>

        <div
          v-if="showSuggestions && searchSuggestions.length > 0"
          class="search-suggestions"
        >
          <div
            v-for="item in searchSuggestions"
            :key="item.id"
            class="suggestion-item"
            @click="handleSuggestionClick(item)"
          >
            <div class="suggestion-content">
              <div class="suggestion-name">{{ item.displayName }}</div>
            </div>
          </div>
        </div>
      </div>

        <div class="right-section" >
          <DarkModeButton />
          <el-button  @click="handleLanguageChange" dark class="no-border-button" > 
            <EN v-if="route.query.lang === 'zh_CN'"/>
            <ZH v-else />
            </el-button>
        </div>
      </div>
    </div>
    <!-- 添加一个关键属性，当routeVersion变化时，整个组件会重新渲染 -->
    <router-view :key="routeVersion" />
  </div>
</template>

<script setup>
import { ref, watch,computed,onMounted, nextTick,onUnmounted } from 'vue';
import { Back } from "@element-plus/icons-vue";
import CustomLogoIcon from "@/components/icon/CustomLogoIcon.vue";
import DarkModeButton from "@/components/common/DarkModeButton.vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from 'vue-i18n';
import { setCookie } from '@/utils/cookie';
import { defineEmits } from 'vue';
import {useDarkModeStore} from "@/store/darkMode.js";
import ZH from '@/components/icon/CustomZH.vue'
import EN from '@/components/icon/CustomEN.vue'
import emitter from '@/utils/eventBus.js';
import { getProductList } from "@/api/get-json";
import { storeToRefs } from 'pinia'

const store = useDarkModeStore()
const { isDark } = storeToRefs(store)

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const emits = defineEmits(['language-change']);

const searchKeyword = ref("");
const searchQuery = ref("");
const showSuggestions = ref(false);
const isSearched = ref(false);
const searchInputRef = ref(null);
const selectedOptions = ref({});
const showOptions = ref({});
const showSearchInput = ref(false);
const productList = ref([]);
const randomPlaceholder = ref("");
const placeholderTimer = ref(null);
const lastPlaceholder = ref("");



onMounted(async () => {
  await fetchProductList();
  startRandomPlaceholder();
  document.addEventListener("click", closeAllOptions);
  document.addEventListener("click", closeSearchSuggestions);  

});


const startRandomPlaceholder = () => {
  randomPlaceholder.value = getRandomProduct();
  placeholderTimer.value = setInterval(() => {
    randomPlaceholder.value = getRandomProduct();
  }, 5000);
};

const getRandomProduct = () => {
  if (!productList.value || productList.value.length === 0) {
    return "";
  }

  let newPlaceholder;
  do {
    const randomIndex = Math.floor(Math.random() * productList.value.length);
    newPlaceholder = productList.value[randomIndex].name;
  } while (
    newPlaceholder === lastPlaceholder.value &&
    productList.value.length > 1
  );

  lastPlaceholder.value = newPlaceholder;
  return newPlaceholder;
};



const props = defineProps({
  isBoard: {
    type: Boolean,
    default: true
  }
});

const closeAllOptions = () => {
  showOptions.value = {};
};


const closeSearchSuggestions = e => {
  if (!e.target.closest(".search-container")) {
    showSuggestions.value = false;
  }
};

const fetchProductList = async () => {
  try {
    const response = await getProductList();
    productList.value = response.data;
    await nextTick();
  } catch (error) {
    console.error("获取产品列表失败:", error);
  }
};

// 初始化主题
const darkModeStore = useDarkModeStore();
darkModeStore.initTheme();

const routeVersion = ref(0);

const goHome = () => router.push('/');
const goBack = () => {
  router.push({
    path: `/board/${route.params.vendor}/${route.params.product}`,
    query:{
      lang:route.query.lang
    }
  })
};


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



const searchSuggestions = computed(() => {
  if (!searchKeyword.value) return [];
  
  const addedSuggestions = new Set();
  const suggestions = [];

  productList.value.forEach(item => {
    const keyword = searchKeyword.value.toLowerCase();
    let suggestion = null;

    if (item.soc && 
        item.soc.name && 
        item.soc.name.toLowerCase().includes(keyword)) {
      const socSuggestion = `${item.soc.vendor} ${item.soc.name}`;
      if (!addedSuggestions.has(socSuggestion)) {
        suggestion = {
          ...item,
          displayName: socSuggestion,
          type: 'soc'
        };
        addedSuggestions.add(socSuggestion);
      }
    }

    else if (item.name.toLowerCase().includes(keyword)) {
      const nameSuggestion = `${item.vendor.name} ${item.name}`;
      if (!addedSuggestions.has(nameSuggestion)) {
        suggestion = {
          ...item,
          displayName: nameSuggestion,
          type: 'product'
        };
        addedSuggestions.add(nameSuggestion);
      }
    }

    else if (item.vendor.name.toLowerCase().includes(keyword)) {
      if (!addedSuggestions.has(item.vendor.name)) {
        suggestion = {
          ...item,
          displayName: item.vendor.name,
          type: 'vendor'
        };
        addedSuggestions.add(item.vendor.name);
      }
    }

    if (suggestion) {
      suggestions.push(suggestion);
    }
  });

  return suggestions.slice(0, 5);
});


const handleSearch = () => {
  if (searchKeyword.value) {
    showSuggestions.value = false;
    isSearched.value = true;
    searchQuery.value = searchKeyword.value;
  }
  debouncedSync(searchKeyword.value)
};

// 防抖函数
const debounce = (func, delay) => {
  let timer = null
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}


// 同步搜索关键词到URL
const syncToUrl = (value) => {
   router.push({
    path: `/`,
    query:{
      lang:route.query.lang,
      kw: value || undefined
    }
  });
}

// 防抖处理的同步函数
const debouncedSync = debounce(syncToUrl, 300)

const handleSearchIconClick = () => {
  if (!searchKeyword.value) {
    showSearchInput.value = true;
      nextTick(() => {
      searchInputRef.value.placeholder = randomPlaceholder.value;
    });
  }
};

const handleInputBlur = () => {
    setTimeout(() => {
      showSuggestions.value = false;
      if (!searchKeyword.value) {
        const searchInput = document.querySelector("#searchDetail");
        showSearchInput.value = false;
      }
    }, 200);
};

const handleSuggestionClick = item => {
  if (item.type === 'soc') {
    searchKeyword.value = item.soc.name;
  } else if (item.type === 'vendor') {
    searchKeyword.value = item.vendor.name;
  } else {
    searchKeyword.value = item.name;
  }
  showSuggestions.value = false;
};

const handleMenuClick = (menuId, event) => {
  event.stopPropagation();
  showOptions.value[menuId] = !showOptions.value[menuId];
  Object.keys(showOptions.value).forEach(key => {
    if (Number(key) !== menuId) {
      showOptions.value[key] = false;
    }
  });
};

const handleOptionSelect = (menuId, option, event) => {
  event.stopPropagation();
  selectedOptions.value[menuId] = option;
  showOptions.value[menuId] = false;
};


const handleSearchInput = e => {
  searchKeyword.value = e.target.value;
  if (!searchKeyword.value) {
    isSearched.value = false;
    searchQuery.value = "";
    router.replace({
      ...route,
      query: {
        ...route.query,
        kw: undefined
      }
    })
  }
  showSuggestions.value = true;
};

onUnmounted(() => {
  if (placeholderTimer.value) {
    clearInterval(placeholderTimer.value);
  }
});


</script>


<style scoped lang="scss">

@use "sass:color" as color;
$primary-blue: #012fa6;
$secondary-blue: #4a77ca;
$light-blue: #789edb;
$border-color: #f1faff;

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
  cursor: pointer;
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


.no-border-button {
  border: none !important;
  
}

.no-border-button :deep(.el-icon){
      /* color:#000 ; */
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
  /* gap: 12px; */
}

/* 使用主题变量 */
.top-bar-container {
  background-color: var(--theme-card);
  border-color: var(--theme-border);
  color: var(--theme-text);
}



#searchDetail {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 72px;
  border-radius: 16px;
  box-sizing: border-box;
  background-color: #f5f5f5;
  transition: background-color 0.3s ease;

  &.active {
    background-color: #f0f0f0;
  }

  .search-input {
    font-family: PingFang SC-Regular;
    color: $light-blue;
    width: 100%;
    border: none;
    font-size: 20px;
    outline: none;
    padding: 0 16px;
    box-sizing: border-box;
    background-color: #f5f5f5;
    &::placeholder {
      color: $light-blue;
      opacity: 0.8;
      font-size: 20px;
    }
  }

  .search-img {
    width: 56px;
    height: 56px;
    padding: 8px 20px 8px 0;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &.search-button {
      background: $primary-blue;
      border-radius: 12px;
      margin-right: 16px;
      padding: 0;
      box-sizing: border-box;
      cursor: pointer;
      width: 95px;
      height: 43px;
      font-size: 20px;
      text-align: center;

      &:hover {
        background: color.scale($primary-blue, $lightness: -5%);
      }

      .search-text {
        width: 100%;
        height: 100%;
        color: #ffffff;
        background: none;
        border: none;
        cursor: pointer;
        font-family: PingFang SC-Regular;
        white-space: nowrap;
        font-size: inherit;

        &:focus {
          outline: none;
        }
      }
    }
  }
  
  .search-suggestions {
      width: 100%;
      position: absolute;
      top: 85%;
      left: 0;
      margin-top: 16px;
      background-color: #fff;
      z-index: 1001;
      padding: 8px;
      border-radius: 0px 0px 20px 20px;
      box-shadow: 0 3px 2px 0 rgba(1, 47, 166, 0.02),
        0 7px 5px 0 rgba(1, 47, 166, 0.03),
        0 12px 10px 0 rgba(1, 47, 166, 0.04),
        0 22px 18px 0 rgba(1, 47, 166, 0.04);
      box-sizing: border-box;
          .suggestion-item {
      display: flex;
      align-items: center;
      height: 38px;
      padding: 0 24px;
      box-sizing: border-box;
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 12px;

      &:hover {
        background: rgba(1, 47, 166, 0.1);
      }

      .suggestion-content {
        flex: 1;
        white-space: nowrap;

        .suggestion-name {
          font-size: 20px;
          text-overflow: ellipsis;
          max-width: 1100px;
          overflow: hidden;
        }
      }

      &.selected {
        background: rgba(1, 47, 166, 0.1);
        border-radius: 10px;
      }
    }


    }

}


html.dark{
  #searchDetail {
    height: 80px;
    background-color: #333;
    .search-input{
      background-color: #333;
      color:#999
    }

    .search-suggestions{
      background-color: #333;
      margin-top: -8px;
    }
  }
}

</style>
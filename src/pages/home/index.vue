<script setup>
import ProductItem from "@/components/ProductItem.vue";
import { ref, computed, onMounted, nextTick, onUnmounted, watch } from "vue";
import { useRoute,useRouter } from "vue-router";
import { getProductList } from "@/api/get-json";
import ZH from '@/components/icon/CustomZH.vue'
import EN from '@/components/icon/CustomEN.vue'
import DarkModeButton from "@/components/common/DarkModeButton.vue";
import { useI18n } from 'vue-i18n';
import { setCookie } from '@/utils/cookie';
import emitter from '@/utils/eventBus.js';
import './style.scss';
import { useDarkModeStore } from '@/store/darkMode'
import { storeToRefs } from 'pinia'
import { throttle } from 'lodash-es'; // 推荐使用es模块版本

defineOptions({
  name: "home"
});

// 路由相关

const router = useRouter()
const route = useRoute();
const store = useDarkModeStore()
const { isDark } = storeToRefs(store)


const searchKeyword = ref("");
const searchQuery = ref("");
const showSuggestions = ref(false);
const isSearched = ref(false);
const searchInputRef = ref(null);
const selectedOptions = ref({});
const showOptions = ref({});
const isSticky = ref(false);
const showSearchInput = ref(false);
const showBackToTop = ref(false);
const productList = ref([]);
const randomPlaceholder = ref("");
const placeholderTimer = ref(null);
const lastPlaceholder = ref("");

const { t, locale } = useI18n();

const nameMapping = {
  soc: "SoC型号",
  isa: "指令集特性",
  kernel: "内核版本",
  features: "镜像特性",
  status: "支持状态"
};

const dropMenu = computed(() => {
  const keys = ["soc", "isa", "kernel", "features", "status"];
  return keys.map((key, index) => {
    let items;
    if (key === "soc") {
      items = Array.from(
        new Map(
          productList.value
            .filter(board => board[key])
            .map(board => [
              board[key].name,
              board[key]
            ])
        ).values()
      );
    } else {
      items = [
        ...new Set(
          productList.value
            .map(board => {
              if (Array.isArray(board[key])) {
                return board[key];
              }
              return [board[key]];
            })
            .flat()
            .filter(item => item)
        )
      ];
    }

    return {
      id: index + 1,
      name: nameMapping[key],
      item: items
    };
  });
});

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

const getFilteredByOptions = computed(() => {
  if (Object.keys(selectedOptions.value).length === 0) {
    return productList.value;
  }

  return productList.value.filter(product => {
    return Object.entries(selectedOptions.value).every(
      ([menuId, selectedValue]) => {
        const key = Object.keys(nameMapping).find(
          k =>
            nameMapping[k] ===
            dropMenu.value.find(item => item.id === Number(menuId))?.name
        );
        if (!key) return true;

        const productValue = product[key];
        if (key === 'soc') {
          return productValue.name === selectedValue.name;
        }
        if (Array.isArray(productValue)) {
          return productValue.includes(selectedValue);
        }
        return productValue === selectedValue;
      }
    );
  });
});

const filteredProductList = computed(() => {
  let filtered = getFilteredByOptions.value;

  if (isSearched.value) {
    if (!searchQuery.value) {
      return [];
    }
    const keyword = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      product =>
        product.name.toLowerCase().includes(keyword) ||
        product.vendor.name.toLowerCase().includes(keyword) ||
        (product.soc &&
          product.soc.name &&
          product.soc.name.toLowerCase().includes(keyword))
    );
  }

  return filtered;
});

const getMenuTitle = computed(() => menuId => {
  if (selectedOptions.value[menuId]) {
    if (
      typeof selectedOptions.value[menuId] === "object" &&
      selectedOptions.value[menuId].vendor.name
    ) {
      return `${selectedOptions.value[menuId].vendor.name} ${selectedOptions.value[menuId].name}`;
    }
    return selectedOptions.value[menuId];
  }
  return dropMenu.value.find(item => item.id === menuId)?.name;
});
/* 切换语言 */
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
  fetchProductList()
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
  // 保留当前路由的其他参数
  router.replace({
    ...route,
    query: {
      ...route.query,
      kw: value || undefined
    }
  })
}

// 防抖处理的同步函数
const debouncedSync = debounce(syncToUrl, 300)


// 监听路由变化，从URL同步到搜索框
watch(() => route.query, (newQuery) => {
  // 只有当值不同时才更新，避免循环触发
  if (newQuery.kw !== searchKeyword.value) {
    searchKeyword.value = newQuery.kw || ''
    searchQuery.value = newQuery.kw || ''
  }



}, { immediate: true }) // 初始化时立即执行



const handleSearch = () => {
  if (searchKeyword.value) {
    showSuggestions.value = false;
    isSearched.value = true;
    searchQuery.value = searchKeyword.value;
    const searchInput = document.querySelector("#search");
    searchInput.style.backgroundColor = "transparent";
    isSticky.value = false;
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
  debouncedSync(searchKeyword.value)
};

const handleSearchIconClick = () => {
  if (isSticky.value && !searchKeyword.value) {
    showSearchInput.value = true;
    nextTick(() => {
      const searchInput = document.querySelector("#search");
      searchInput.style.backgroundColor = "#f0f0f0";
      searchInputRef.value.focus();
      searchInputRef.value.placeholder = randomPlaceholder.value;
    });
  }
};

const handleInputBlur = () => {
  if (isSticky.value) {
    setTimeout(() => {
      showSuggestions.value = false;
      if (!searchKeyword.value) {
        const searchInput = document.querySelector("#search");
        showSearchInput.value = false;
        searchInput.style.backgroundColor = "transparent";
      }
    }, 200);
  }
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

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};

const closeAllOptions = () => {
  showOptions.value = {};
};

const closeSearchSuggestions = e => {
  if (!e.target.closest(".search-container")) {
    showSuggestions.value = false;
  }
};

const handleResetOption = (menuId, event) => {
  event.stopPropagation();
  delete selectedOptions.value[menuId];
  showOptions.value[menuId] = false;
};

const viewportWidth = ref(0);
const isdummy = ref(false);
const changeViewportWidth = () => {
  viewportWidth.value = document.body.scrollWidth;
  changeIsDummy(viewportWidth.value);
};

onUnmounted(() => {
  window.removeEventListener("resize", changeViewportWidth);
  window.removeEventListener('scroll', throttledScroll)
  if (placeholderTimer.value) {
    clearInterval(placeholderTimer.value);
  }
});
watch(viewportWidth, newValue => {
  changeIsDummy(newValue);
});
watch(filteredProductList, newValue => {
  changeIsDummy(viewportWidth.value);
});


const changeIsDummy = value => {
  if (Math.floor((value + 16) / 256) > filteredProductList.value.length) {
    isdummy.value = false;
    let elements = document.querySelectorAll(".dummy-wrapper");
    elements.forEach(function (element) {
      element.style.display = "none";
    });
 
  } else {
    isdummy.value = true;
   
    let elements = document.querySelectorAll(".dummy-wrapper");
    elements.forEach(function (element) {
      element.style.display = "block";
    });
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

const startRandomPlaceholder = () => {
  randomPlaceholder.value = getRandomProduct();
  placeholderTimer.value = setInterval(() => {
    randomPlaceholder.value = getRandomProduct();
  }, 5000);
};



/* 监听页面滚动 */
const handleScroll = () => {
   const searchContainer = document.querySelector(".search-container");
  const searchInput = document.querySelector(".search-input");
  const originalPlaceholder = searchInput.placeholder;

    showBackToTop.value = window.scrollY > 400;

    if (window.scrollY > 385) {
      isSticky.value = true;
      searchInput.placeholder = "";
      showSearchInput.value = false;
      if (searchKeyword.value) {
        const searchInputDiv = document.querySelector("#search");
        searchInputDiv.style.backgroundColor = "#f0f0f0";
        showSearchInput.value = true;
      } else {
        const searchInputDiv = document.querySelector("#search");
        searchInputDiv.style.backgroundColor = "transparent";
      }
      searchContainer.classList.add("sticky");
    } 
    else if (
      window.scrollY < 285  && searchContainer.classList.contains("sticky")
    ) {
      isSticky.value = false;
      const searchInputDiv = document.querySelector("#search");
      searchInputDiv.style.backgroundColor = "transparent";
      searchInput.placeholder = originalPlaceholder;
      showSearchInput.value = true;
      searchContainer.classList.remove("sticky");
    }
  };

  // 节流处理：每100ms最多执行一次
const throttledScroll = throttle(handleScroll, 100);


onMounted(async () => {

  await fetchProductList();
  startRandomPlaceholder();
  changeViewportWidth();
  window.addEventListener("resize", changeViewportWidth);
  document.addEventListener("click", closeAllOptions);
  document.addEventListener("click", closeSearchSuggestions);  
  window.addEventListener("scroll", throttledScroll);

  const keyword = route.query.kw;
  if (keyword) {
    searchKeyword.value = keyword;
    searchQuery.value = keyword;
    isSearched.value = true;
    handleSearch();
  }
});
</script>

<template>
  <div class="page-container">
    <div v-if="!isSticky" class="setting">
      <div class="right-section" >
      <div class="setting-icon">
        <DarkModeButton />
      </div>
      <div class="setting-icon">
          <el-button  @click="handleLanguageChange" round dark class="no-border-button" > 
          <EN v-if="route.query.lang === 'zh_CN'"/>
          <ZH v-else />
          </el-button>
      </div>
      </div>
  </div>
  <div class="logo">
    <img v-if="!isDark" src="@/assets/logo/Frame1@3x.svg" alt="OERC Logo" />
    <img v-else src="@/assets/logo/logoDark.svg" alt="OERC Logo" />
  </div>
  <div class="search-container">
    <div class="search-bar">
      <div class="circle-img">
        <img v-if="isSticky && !isDark" src="@/assets/logo/Frame1@3x.svg"  alt="logo" />
         <img v-else-if="isSticky && isDark" src="@/assets/logo/frame3Dark.png"  alt="logo" />
        <img v-else src="@/assets/icons/home/Group 4.png" style="position:relative;bottom:6px" alt="search icon" />
      </div>
      <div id="search">
        <!-- <input
          type="text"
          class="search-input"
          v-model="searchKeyword"
          @input="handleSearchInput"
          @keyup.enter="handleSearch"
          :placeholder="randomPlaceholder"
          @blur="handleInputBlur"
          ref="searchInputRef"
          v-show="!isSticky || (isSticky && showSearchInput)"
          
        /> -->
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
        <div v-if="isSticky" class="setting" style="top:0">
          <div class="right-section" >
            <div class="setting-icon">
              <DarkModeButton />
            </div>
            <div class="setting-icon">
                <el-button  @click="handleLanguageChange" dark class="no-border-button" > 
                <EN v-if="route.query.lang === 'zh_CN'"/>
                <ZH v-else />
                </el-button>
            </div>
            </div>
        </div>
    </div>
  </div>

  <div class="product-area">
    <!-- <div class="sum">
      <template v-if="isSearched || Object.keys(selectedOptions).length > 0">
        <span v-if="filteredProductList.length > 0">
          筛选后共{{ filteredProductList.length }}个产品
        </span>
        <span v-else> 未找到相关产品 </span>
      </template>
      <span v-else>共{{ productList.length }}个产品</span>
    </div> -->
    <div class="product-list">
      <ProductItem
        v-for="item in filteredProductList"
        :key="item.name"
        :info="item"
      />
      <div v-for="item in 14" :key="item" class="dummy-wrapper">
        <div id="product-dummy" v-if="isdummy"></div>
      </div>
    </div>
  </div>
  <div class="back-to-top" v-show="showBackToTop" @click="scrollToTop">
    <img
        v-if="isDark"
        src="@/assets/icons/home/backtop.svg"
        alt="back to top"
        class="up-arrow"
      />

      <img
        v-else
        src="@/assets/icons/home/Group 109@3x.svg"
        alt="back to top"
        class="up-arrow"
      />
  </div>
  </div>
  
</template>

<style scoped lang="scss">


</style>

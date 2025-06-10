<template>
  <div class="home-container">
    <div class="home-search-container">
      <div class="logo-container">
        <el-image class="el-image-logo" :src="logo" />
      </div>
      <div class="search-container">
        <div class="input-container">
          <el-autocomplete v-model="searchCondition.searchValue" :fetch-suggestions="querySearch"
            :placeholder="t('boardInfo')" size="large" @keyup.enter="handleSearch" @select="handleSelect"
            @click.suffix="handleSearch" @clear="handleClear" style="width: 100%; height: 100%"
            :prefix-icon="CustomPrefixIcon">
            <template #suffix>
              <el-icon class="custom-search-icon" @click="handleSearch">
                <component :is="CustomSearchIcon" />
              </el-icon>
            </template>
          </el-autocomplete>
        </div>
      </div>
      <div class="toggle-container">
        <DarkModeButton />
        <el-button round @click="handleLanguageChange">{{ t('toggleLanguage') }}</el-button>
      </div>
    </div>
    <div class="bottom-container">
      <div class="product-container">
        <el-card v-for="(product, index) in productList" :key="index" class="product-card"
          @click="openProduct(product)">
          <div class="product-image-container">
            <el-image :src="product.thumbnail" :lazy="true" fit="contain" class="product-image"
              @error="handleImageError" />
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-vendor">{{ product.vendor }}</p>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick, reactive } from "vue";
import logo from "@/assets/logo/Frame1@3x.svg";
import CustomPrefixIcon from "@/components/icon/CustomPrefixIcon.vue";
import CustomSearchIcon from "@/components/icon/CustomSearchIcon.vue";
import { ElMessage } from "element-plus";
import { useRouter, useRoute } from "vue-router";
import "./style.scss";
import { watch } from "vue";
import { getCookie } from "@/utils/cookie.js";
import { useI18n } from "vue-i18n";
import DarkModeButton from "@/components/common/DarkModeButton.vue";
import { setCookie } from '@/utils/cookie';
import emitter from '@/utils/eventBus.js';
import { languageFetch } from "@/utils/languageFetch";
const { t, locale } = useI18n();
const productList = ref([]);
const allProducts = ref([]);
const router = useRouter();
const route = useRoute();
const searchCondition = reactive({
  searchValue: "",
  socSearch: "",
  systemSearch: "",
});

const fetchProductList = async () => {
  try {
    let lang = getCookie("lang");
    if (!lang) {
      lang = "zh_CN"; //默认中文
    }

    const uri = `/v2/${lang}/boards.json`;
    const request = languageFetch(uri);

    request.then(async (response) => {
      if (!response.ok) {
        ElMessage.error(`请求失败，状态码: ${response.status}`);
        return;
      }
      const data = await response.json();
      productList.value = data;
      allProducts.value = data;
      await nextTick();
    });
  } catch (error) {
    ElMessage.error("获取产品列表失败: " + error.message);
  }
};

const openProduct = async (product) => {
  let lang = getCookie("lang");
  if (lang === undefined || lang === "") {
    lang = "zn_CN";
  }
  const fixUrl = product.url.replace(".json", "");
  await router.push({
    path: `/board/${fixUrl}`, // RESTful 路径
  });
};
const handleImageError = (event) => {
  ElMessage.error("主板信息加载失败！", event.message);
};

const handleSearch = () => {
  const searchValue = searchCondition.searchValue.toLowerCase().trim();
  if (!searchValue) {
    productList.value = [...allProducts.value];
    return;
  }
  productList.value = allProducts.value.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchValue) ||
      product.vendor.toLowerCase().includes(searchValue) ||
      (product.soc &&
        product.soc.name &&
        product.soc.name.toLowerCase().includes(searchValue))
    );
  });
};

const querySearch = (queryString, callback) => {
  if (!queryString.trim()) {
    callback([]);
    return;
  }

  const suggestions = [];
  const keyword = queryString.toLowerCase().trim();

  allProducts.value.forEach((product) => {
    if (
      product.name.toLowerCase().includes(keyword) &&
      !suggestions.some((s) => s.value === product.name)
    ) {
      suggestions.push({
        value: product.name,
        type: "name",
        product,
      });
    }

    if (
      product.vendor.toLowerCase().includes(keyword) &&
      !suggestions.some((s) => s.value === product.vendor)
    ) {
      suggestions.push({
        value: product.vendor,
        type: "vendor",
        product,
      });
    }

    if (
      product.soc.name.toLowerCase().includes(keyword) &&
      !suggestions.some((s) => s.value === product.soc.name)
    ) {
      suggestions.push({
        value: product.soc.name,
        type: "soc",
        product,
      });
    }
  });
  //最多推荐5条数据
  callback(suggestions.slice(0, 5));
};

const handleSelect = (item) => {
  searchCondition.searchValue = item.value;
  handleSearch();
};

const handleClear = () => {
  searchCondition.searchValue = "";
  productList.value = [...allProducts.value];
};

watch(
  () => searchCondition.searchValue,
  (newVal) => {
    if (!newVal.trim()) {
      productList.value = [...allProducts.value];
    }
  }
);

const handleLanguageChange = () => {
  const newLang = locale.value === 'zh_CN' ? 'en_US' : 'zh_CN';
  locale.value = newLang;
  setCookie('lang', newLang);

  // 更新路由，保持在首页
  router.push({
    path: '/home',
    query: {
      lang: newLang
    }
  });

  // 触发语言变更事件
  emitter.emit('languageChanged', newLang);

  // 重新获取产品列表
  fetchProductList();
};

onMounted(async () => {
  await fetchProductList();
});
</script>

<style scoped lang="scss">
:deep(.custom-search-icon) {
  cursor: pointer;
  margin-left: 8px;
}

:deep(.el-input__prefix) {
  margin-left: 15px;
}

:deep(.el-input__suffix) {
  margin-right: 15px;
}

:deep(.el-input__wrapper) {
  background-color: transparent;
  border-radius: 24px;
  border: none;
  box-shadow: none;
  padding: 0 12px;
  height: 100%; // 确保输入框包装器填满容器高度
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
}

:deep(.el-dropdown-menu__item) {
  padding: 8px 20px;
}

html.dark {
  .home-container {
    background: #121212 !important;
  }

  .product-card {
    background-color: #1e1e1e !important;
    border-color: #444 !important;

    &:hover {
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
    }
  }

  .product-name {
    color: #e0e0e0 !important;
  }

  .product-vendor {
    color: #aaa !important;
  }

  .dropdown-item .filter-button {
    background-color: #2a2a2a !important;
    color: #e0e0e0 !important;
    border-color: #555 !important;
  }

  .el-dropdown-menu {
    background-color: #2a2a2a !important;
    border-color: #555 !important;
    box-shadow: none !important;
  }

  .el-dropdown-menu__item {
    background-color: #2a2a2a !important;
    color: #e0e0e0 !important;

    &:hover {
      background-color: #3a3a3a !important;
      color: #ffffff !important;
    }

    &:focus {
      background-color: #3a3a3a !important;
      color: #ffffff !important;
      outline: none !important;
      box-shadow: none !important;
    }
  }

  .el-input__wrapper {
    background-color: #2a2a2a !important;
  }

  .el-input__inner {
    color: #e0e0e0 !important;

    &::placeholder {
      color: #888 !important;
    }
  }

  .el-popper.is-light {
    background-color: #2a2a2a !important;
    border-color: #555 !important;
    box-shadow: none !important;
  }

  .el-popper.is-light>.el-popper__arrow::before {
    background-color: #2a2a2a !important;
    border-color: #555 !important;
  }
}

:deep(.el-autocomplete-suggestion) {
  .name {
    color: var(--el-color-primary);
  }

  .vendor {
    color: var(--el-color-success);
  }

  .soc {
    color: var(--el-color-warning);
  }
}
</style>

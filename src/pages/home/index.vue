<template>
  <div class="home-container">
    <div class="home-search-container">
      <div class="logo-container">
        <el-image :src="logo" />
      </div>
      <div class="search-container">
        <div class="input-container">
          <el-autocomplete
              v-model="searchCondition.searchValue"
              :fetch-suggestions="querySearch"
              placeholder="板卡信息"
              size="large"
              @keyup.enter="handleSearch"
              @select="handleSelect"
              style="width: 100%; height: 100%"
              :prefix-icon="CustomPrefixIcon"
              :suffix-icon="CustomSearchIcon"
          />
        </div>
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
import { onMounted, ref, nextTick, computed, reactive } from "vue";
import logo from "@/assets/logo/Frame1@3x.svg";
import CustomPrefixIcon from "@/components/icon/CustomPrefixIcon.vue";
import CustomSearchIcon from "@/components/icon/CustomSearchIcon.vue";
import { getProductList } from "@/api/get-json";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import './style.scss'
import {getCookie} from "@/utils/cookie.js";

const productList = ref([]);
const allProducts = ref([]);
const router = useRouter();
const searchCondition = reactive({
  searchValue: "",
  socSearch: "",
  systemSearch: "",
});

const fetchProductList = async () => {
  try {
    const response = await getProductList();
    productList.value = response.data;
    allProducts.value = response.data;
    await nextTick();
  } catch (error) {
    ElMessage.error("获取产品列表失败: " + error.message);
  }
};
const openProduct = async (product) => {
  let lang = getCookie("lang");
  if(lang === undefined || lang === "") {
    lang = "zn_CN";
  }
  await router.push({
    path: `/board/${product.url}`, // RESTful 路径
    query: {lang: lang}
  });
};
const handleImageError = (event) => {
  ElMessage.error("主板信息加载失败！", event.message);
};

const handleSearch = (event) => {
  const searchValue = searchCondition.searchValue.toLowerCase().trim();

  if (!searchValue) {
    productList.value = [...allProducts.value];
    return;
  }

  productList.value = allProducts.value.filter(product => {
    return (
        product.name.toLowerCase().includes(searchValue) ||
        product.vendor.toLowerCase().includes(searchValue) ||
        (product.soc && product.soc.name && product.soc.name.toLowerCase().includes(searchValue))
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

  allProducts.value.forEach(product => {
    if (product.name.toLowerCase().includes(keyword) &&
        !suggestions.some(s => s.value === product.name)) {
      suggestions.push({
        value: product.name,
        type: "name",
        product
      });
    }

    if (product.vendor.toLowerCase().includes(keyword) &&
        !suggestions.some(s => s.value === product.vendor)) {
      suggestions.push({
        value: product.vendor,
        type: "vendor",
        product
      });
    }

    if (product.soc.name.toLowerCase().includes(keyword) &&
        !suggestions.some(s => s.value === product.soc.name)) {
      suggestions.push({
        value: product.soc.name,
        type: "soc",
        product
      });
    }
  });

  callback(suggestions.slice(0, 3));
};

const handleSelect = (item) => {
  searchCondition.searchValue = item.value;
  handleSearch();
};


onMounted(async () => {
  await fetchProductList();
});
</script>

<style scoped lang="scss">
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

  .el-popper.is-light > .el-popper__arrow::before {
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
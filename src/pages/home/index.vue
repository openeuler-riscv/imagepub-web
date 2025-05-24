<template>
  <div class="home-container">
    <div class="home-search-container">
      <div class="logo-container">
        <el-image :src="logo" />
      </div>
      <div class="search-container">
        <div class="input-container">
          <el-input v-model="searchCondition.searchValue" placeholder="板卡信息" size="large"
            style="width: 100%; height: 100%" :prefix-icon="CustomPrefixIcon" :suffix-icon="CustomSearchIcon">
          </el-input>
        </div>
      </div>
    </div>

    <div class="dropdown-list-container">
      <el-dropdown size="large" class="dropdown-item" trigger="click" @command="socSearch">
        <el-button class="filter-button">
          {{ socSearchText }}
          <el-icon class="el-icon--right">
            <CustomDropIcon />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="SpacemiT K1/M1/X1">SpacemiT K1/M1/X1</el-dropdown-item>
            <el-dropdown-item command="SOPHGO SG2042">SOPHGO SG2042</el-dropdown-item>
            <el-dropdown-item command="ESWin EIC7700X">ESWin EIC7700X</el-dropdown-item>
            <el-dropdown-item command="Qemu virt">Qemu virt</el-dropdown-item>
            <el-dropdown-item command="T-HEAD TH1520">T-HEAD TH1520</el-dropdown-item>
            <el-dropdown-item>StarFive JH7110</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-dropdown size="large" class="dropdown-item" trigger="click" @command="systemSearch">
        <el-button class="filter-button">
          {{ systemSearchText }}
          <el-icon class="el-icon--right">
            <CustomDropIcon />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="系统特性1">系统特性1</el-dropdown-item>
            <el-dropdown-item command="系统特性2">系统特性2</el-dropdown-item>
            <el-dropdown-item command="系统特性3">系统特性3</el-dropdown-item>
            <el-dropdown-item command="系统特性4">系统特性4</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
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
import CustomDropIcon from "@/components/icon/CustomDropIcon.vue";
import { useRouter } from "vue-router";
import './style.scss'
import TopBackHome from "@/components/common/TopBackHome.vue";
const searchCondition = reactive({
  searchValue: "",
  socSearch: "",
  systemSearch: "",
  instructionSetFeature: "",
  kernelVersion: "",
  imageFeature: "",
  supportStatus: ""
});

const productList = ref([]);
const router = useRouter();
const socSearch = (command) => {
  searchCondition.socSearch = command;
};
const systemSearch = (command) => {
  searchCondition.systemSearch = command;
}
const socSearchText = computed(() => {
  return searchCondition.socSearch || "SoC型号";
});

const systemSearchText = computed(() => {
  return searchCondition.systemSearch || "系统特性";
});
const fetchProductList = async () => {
  try {
    const response = await getProductList();
    productList.value = response.data;
    await nextTick();
  } catch (error) {
    ElMessage.error("获取产品列表失败: " + error.message);
  }
};
const openProduct = async (product) => {
  await router.push({
    path: "/board",
    query: {
      productUri: product.uri,
    },
  });
  window.location.reload();
};
const clearFilter = (filterType) => {
  searchCondition[filterType] = "";
  if (filterType === 'socSearch') {
    searchCondition.searchValue = "";
  }
};

const handleImageError = (event) => {
  ElMessage.error("主板信息加载失败！", event.message);
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

  &:hover {
    background-color: #f5f7fa;
  }
}
/* 暗黑模式样式 */
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

  /* Element Plus组件暗黑样式 */
  :deep(.el-input__wrapper) {
    background-color: #2a2a2a !important;
    color: #e0e0e0 !important;
  }

  :deep(.el-dropdown-menu) {
    background-color: #2a2a2a !important;
    border-color: #555 !important;
  }

  :deep(.el-dropdown-menu__item) {
    color: #e0e0e0 !important;
    
    &:hover {
      background-color: #3a3a3a !important;
    }
  }

  :deep(.el-input__inner) {
    color: #e0e0e0 !important;
    &::placeholder {
      color: #888 !important;
    }
  }
  
}
</style>

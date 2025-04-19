<template>
  <div class="home-container">
    <div class="home-search-container">
      <div class="logo-container">
        <el-image :src="logo"/>
      </div>
      <div class="search-container">
        <div class="input-container">
          <el-input v-model="searchCondition.searchValue"
                    placeholder="板卡信息"
                    size="large"
                    style="width: 100%;height: 100%;"
                    :prefix-icon="CustomPrefixIcon"
                    :suffix-icon="CustomSearchIcon"
          >
          </el-input>
        </div>
      </div>
    </div>

<!--    <div class="filter-tags" v-if="searchCondition.socSearch || searchCondition.systemSearch">-->
<!--      <el-tag v-if="searchCondition.socSearch" closable @close="clearSocSearch">-->
<!--        {{ searchCondition.socSearch }}-->
<!--      </el-tag>-->
<!--      <el-tag v-if="searchCondition.systemSearch" closable @close="clearSystemSearch">-->
<!--        {{ searchCondition.systemSearch }}-->
<!--      </el-tag>-->
<!--    </div>-->
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
           {{systemSearchText}}
          <el-icon class="el-icon--right">
            <CustomDropIcon />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="系统特性 1">系统特性 1</el-dropdown-item>
            <el-dropdown-item command="系统特性 2">系统特性 2</el-dropdown-item>
            <el-dropdown-item command="系统特性 3">系统特性 3</el-dropdown-item>
            <el-dropdown-item command="系统特性 4">系统特性 4</el-dropdown-item>
            <el-dropdown-item command="系统特性 5">系统特性 5</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div class="bottom-container">
      <div class="product-container">
        <el-card v-for="(product, index) in productList" :key="index" class="product-card"
                 @click="openProduct(product)">
          <div class="product-image-container">
            <el-image :src="product.thumbnail" fit="cover" class="product-image" @error="handleImageError" />
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
import {onMounted, ref, nextTick, computed , reactive} from 'vue'
import logo from '@/assets/logo/Frame1@3x.svg';
import CustomPrefixIcon from "@/components/icon/CustomPrefixIcon.vue";
import CustomSearchIcon from "@/components/icon/CustomSearchIcon.vue";
import {getProductList} from "@/api/get-json";
import {ElMessage} from 'element-plus'
import CustomDropIcon from "@/components/icon/CustomDropIcon.vue";
import {useRouter} from "vue-router";
import './style.scss'
const searchCondition = reactive({
  searchValue: "",
  socSearch: "",
  systemSearch: "",
})

const productList = ref([]);
const router = useRouter();
const socSearch = (command) => {
  searchCondition.socSearch = command;
}
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
    console.log(productList.value);
    // 检查数据格式
    productList.value.forEach(product => {
      console.log('Product:', product);
    });
    await nextTick();
  } catch (error) {
    ElMessage.error('获取产品列表失败: ' + error.message);
  }
};
const openProduct = (product) => {
  router.push({
    path: '/board', query: {
      productUri: product.uri
    }
  });
};
const clearSocSearch = () => {
  searchCondition.socSearch = "";
  searchCondition.searchValue = "";
}

const clearSystemSearch = () => {
  searchCondition.systemSearch = "";
}
const handleImageError = (event) => {
  console.error('图片加载失败:', event);
};
onMounted(async () => {
  await fetchProductList();
})
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

</style>
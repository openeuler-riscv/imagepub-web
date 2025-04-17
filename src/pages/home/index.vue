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
      <div>
        <span>{{ searchCondition.socSearch }}</span>
        <span>{{ searchCondition.systemSearch }}</span>
      </div>
      <div class="dropdown-list-container">
        <el-dropdown size="large" class="dropdown-item" trigger="click" @command="socSearch">
          <el-button style="width: 90%">
            SoC型号
            <el-icon class="el-icon--right">
              <CustomDropIcon/>
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="SpacemiT K1/M1/X1">SpacemiT K1/M1/X1</el-dropdown-item>
              <el-dropdown-item command="SOPHGO SG2042">SOPHGO SG2042</el-dropdown-item>
              <el-dropdown-item command="ESWin EIC7700X">ESWin EIC7700X</el-dropdown-item>
              <el-dropdown-item command="Qemu virt">Qemu virt</el-dropdown-item>
              <el-dropdown-item command=">T-HEAD TH1520">T-HEAD TH1520</el-dropdown-item>
              <el-dropdown-item>StarFive JH7110</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown size="large" class="dropdown-item" trigger="click" @command="systemSearch">
          <el-button style="width: 90%">
            系统特性
            <el-icon class="el-icon--right">
              <CustomDropIcon/>
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
            <template #header>{{ product.name }} {{ product.vendor }}</template>
            <el-image :src="product.thumbnail" fit="cover"/>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref, nextTick, getCurrentInstance} from 'vue'
import logo from '@/assets/logo/Frame1@3x.svg';
import CustomPrefixIcon from "@/components/icon/CustomPrefixIcon.vue";
import CustomSearchIcon from "@/components/icon/CustomSearchIcon.vue";
import {getProductList} from "@/api/get-json";
import {ElMessage} from 'element-plus'
import CustomDropIcon from "@/components/icon/CustomDropIcon.vue";
import {useRouter} from "vue-router";

const searchCondition = {
  searchValue: "",
  socSearch: "",
  systemSearch: "",
}

const productList = ref([]);
const router = useRouter();
const socSearch = (command) => {
  searchCondition.searchValue = command;
}
const systemSearch = (command) => {
  searchCondition.systemSearch = command;
}
const fetchProductList = async () => {
  try {
    const response = await getProductList();
    productList.value = response.data;
    await nextTick();
  } catch (error) {
    ElMessage('获取产品列表失败:', error.message);
  }
};
const openProduct = (product) => {
  router.push({
    path: '/board', query: {
      productUri: product.uri
    }
  });
};
onMounted(async () => {
  await fetchProductList();
})
</script>

<style scoped lang="scss">
.home-container {
  width: 100%;
  height: 100%;

  .home-search-container {
    font-size: 20px;
    margin-top: 15vh;
    height: 100%;

    .logo-container {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .search-container {
      width: 100%;
      display: flex;
      height: 10vh;
      justify-content: center;
      align-items: center;

      .input-container {
        width: 65%;
        height: 5vh;
        border: 4px solid #012fa6;
        border-radius: 24px;
      }
    }
  }
}

.bottom-container {
  display: flex;
  justify-content: center;
  align-items: center;

  .product-container {
    width: 85vw;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    .product-card {
      border-radius: 10px;
    }
  }
}

.el-card {
  width: calc(16.666% - 10px);
  margin: 5px;
  box-sizing: border-box;
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
}

.dropdown-list-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 10vh;

  .dropdown-item {
    width: 10vw;
  }
}
</style>

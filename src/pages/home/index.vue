<template>
  <div class="home-container">
    <div class="home-search-container">
      <div class="logo-container">
        <el-image :src="logo" class="logo-image" />
      </div>
      <div class="search-container">
        <div class="input-container">
          <el-input v-model="searchCondition.searchValue" placeholder="板卡信息" size="large" class="search-input"
            :prefix-icon="CustomPrefixIcon" :suffix-icon="CustomSearchIcon">
          </el-input>
        </div>
      </div>
      <div class="filter-tags" v-if="searchCondition.socSearch || searchCondition.systemSearch">
        <el-tag v-if="searchCondition.socSearch" closable @close="clearSocSearch">
          {{ searchCondition.socSearch }}
        </el-tag>
        <el-tag v-if="searchCondition.systemSearch" closable @close="clearSystemSearch">
          {{ searchCondition.systemSearch }}
        </el-tag>
      </div>
      <div class="dropdown-list-container">
        <el-dropdown size="large" class="dropdown-item" trigger="click" @command="socSearch">
          <el-button class="filter-button">
            SoC型号
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
            系统特性
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
            <div class="card-content">
              <el-image :src="product.thumbnail" fit="cover" class="product-image" />
              <div class="product-info">
                <h3 class="product-name">{{ product.name }}</h3>
                <p class="product-vendor">{{ product.vendor }}</p>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick, getCurrentInstance } from 'vue'
import logo from '@/assets/logo/Frame1@3x.svg';
import CustomPrefixIcon from "@/components/icon/CustomPrefixIcon.vue";
import CustomSearchIcon from "@/components/icon/CustomSearchIcon.vue";
import { getProductList } from "@/api/get-json";
import { ElMessage } from 'element-plus'
import CustomDropIcon from "@/components/icon/CustomDropIcon.vue";
import { useRouter } from "vue-router";

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
    console.log(response)
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
const clearSocSearch = () => {
  searchCondition.socSearch = "";
  searchCondition.searchValue = "";
}

const clearSystemSearch = () => {
  searchCondition.systemSearch = "";
}
onMounted(async () => {
  await fetchProductList();
})
</script>

<style scoped lang="scss">
.home-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 40px 0;

  .home-search-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 25px;

    .logo-container {
      margin-bottom: 35px;

      .logo-image {
        width: 280px;
        height: auto;
      }
    }

    .search-container {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-bottom: 35px;

      .input-container {
        width: 800px;

        .search-input {
          :deep(.el-input__wrapper) {
            background-color: #ffffff;
            border-radius: 36px;
            border: 3px solid #012fa6;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
            padding: 0 25px;
            height: 72px;
            font-size: 18px;

            &:hover,
            &:focus {
              border-color: #012fa6;
              box-shadow: 0 4px 16px rgba(1, 47, 166, 0.2);
            }

            :deep(.el-input__prefix-inner),
            :deep(.el-input__suffix-inner) {
              font-size: 24px;
            }
          }
        }
      }
    }

    .filter-tags {
      display: flex;
      gap: 12px;
      margin: 12px 0;

      :deep(.el-tag) {
        padding: 10px 20px;
        font-size: 16px;
        height: auto;
      }
    }

    .dropdown-list-container {
      display: flex;
      gap: 20px;
      margin: 20px 0 35px;

      .dropdown-item {
        .filter-button {
          width: 160px;
          height: 48px;
          border-radius: 24px;
          font-size: 16px;
          background: #fff;
          border: 1px solid #e0e0e0;
          color: #333;

          &:hover {
            border-color: #012fa6;
            color: #012fa6;
          }

          .el-icon {
            font-size: 16px;
          }
        }
      }
    }
  }
}

.bottom-container {
  width: 100%;
  padding: 0;

  .product-container {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 15px;
    width: 90%;
    margin: 0 auto;
    padding: 0;
    box-sizing: border-box;

    .product-card {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      border: none;
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      .card-content {
        padding: 12px;

        .product-image {
          width: 100%;
          height: 110px;
          object-fit: contain;
          background-color: #fff;
          margin-bottom: 10px;
        }

        .product-info {
          padding: 0;
          background-color: #fff;
          text-align: center;

          .product-name {
            margin: 0;
            font-size: 14px;
            font-weight: 500;
            color: #000;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.2;
          }

          .product-vendor {
            margin: 4px 0 0 0;
            font-size: 12px;
            color: #666;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.2;
          }
        }
      }
    }
  }
}
</style>

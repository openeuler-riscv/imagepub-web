<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import DesriName from "@/components/DesriName.vue";
import SystemSelect from "@/components/SystemSelect.vue";
import defaultImage from "@/assets/images/product_default.png";
import { getProductList } from "@/api/get-json";

defineOptions({
  name: "boardPage"
});

const router = useRouter();
const route = useRoute();

const goToHome = () => {
  router.push("/home");
};
const boardDetail = ref(null);
const fetchBoardDetail = async () => {
  try {
    const uri = `/${route.query.uri}`;
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    boardDetail.value = await response.json();
  } catch (error) {
    console.error("获取板子详情失败：", error);
  }
};

const searchKeyword = ref("");
const showSuggestions = ref(false);
const isSearched = ref(false);
const searchInputRef = ref(null);
const productList = ref([]);

const searchSuggestions = computed(() => {
  if (!searchKeyword.value) return [];
  return productList.value
    .filter(
      item =>
        item.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        item.vendor.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
    .slice(0, 5);
});

const handleSearchInput = e => {
  searchKeyword.value = e.target.value;
  showSuggestions.value = true;
};

const handleSuggestionClick = item => {
  searchKeyword.value = item.name;
  showSuggestions.value = false;
};

const handleSearch = () => {
  if (searchKeyword.value) {
    showSuggestions.value = false;
    router.push({
      path: "/home",
      query: { keyword: searchKeyword.value }
    });
  }
};

const handleSearchIconClick = () => {
  if (!isSearched.value) {
    isSearched.value = true;
    nextTick(() => {
      searchInputRef.value.focus();
    });
  }
};

const handleInputBlur = () => {
  setTimeout(() => {
    if (!searchKeyword.value) {
      showSuggestions.value = false;
      isSearched.value = false;
      searchInputRef.value = "";
    }
  }, 200);
};

const activeTab = ref(null);
const currentIndex = ref(0);
const showOptions = ref({});

const systemTabs = computed(() => {
  if (!boardDetail.value?.os) return [];
  return Object.entries(boardDetail.value.os).map(([key]) => key);
});

const currentSystemVersions = computed(() => {
  if (!boardDetail.value?.os || !activeTab.value) return [];
  return boardDetail.value.os[activeTab.value] || [];
});

const currentVersion = computed(() => {
  if (!currentSystemVersions.value.length) return null;
  return (
    currentSystemVersions.value[currentIndex.value] ||
    currentSystemVersions.value[0]
  );
});

const currentPictureIndex = ref(0);

const processedPictures = computed(() => {
  if (!boardDetail.value?.pictures || boardDetail.value.pictures.length === 0) {
    return [defaultImage];
  }

  return boardDetail.value.pictures.map(pic => {
    if (!pic) return defaultImage;
    try {
      return pic.startsWith("/") ? pic : `/${pic}`;
    } catch (error) {
      console.error("图片路径处理错误：", error);
      return defaultImage;
    }
  });
});

const handleThumbnailClick = index => {
  currentPictureIndex.value = index;
};

const handleUpdateIndex = newIndex => {
  if (newIndex >= 0 && newIndex < currentSystemVersions.value.length) {
    currentIndex.value = newIndex;
  }
};

const closeSearchSuggestions = e => {
  if (!searchKeyword.value && !e.target.closest(".top-wrapper")) {
    showSuggestions.value = false;
  }
};

const closeAllOptions = () => {
  showOptions.value = {};
};

const randomPlaceholder = ref("");
const lastPlaceholder = ref("");
const placeholderTimer = ref(null);

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

onMounted(async () => {
  try {
    const response = await getProductList("../../../public");
    productList.value = response.data;
    startRandomPlaceholder();
  } catch (error) {
    console.error("获取产品列表失败:", error);
  }

  console.log("组件已挂载");
  fetchBoardDetail();
  document.addEventListener("click", closeAllOptions);
  document.addEventListener("click", closeSearchSuggestions);
});

onUnmounted(() => {
  if (placeholderTimer.value) {
    clearInterval(placeholderTimer.value);
  }
  document.removeEventListener("click", closeAllOptions);
  document.removeEventListener("click", closeSearchSuggestions);
});

watch(
  () => route.query.uri,
  newUri => {
    if (newUri) {
      fetchBoardDetail();
    }
  },
  { immediate: true }
);

watch(
  () => boardDetail.value?.os,
  newOs => {
    if (newOs && Object.keys(newOs).length > 0) {
      activeTab.value = Object.keys(newOs)[0];
    } else {
      activeTab.value = null;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="top-wrapper">
    <div class="top-bar">
      <div class="circle-img">
        <img src="@/assets/logo/Frame 1@3x.svg" alt="logo" />
      </div>
      <div class="back-to-home" v-show="!isSearched" @click="goToHome">
        <div class="back">
          <img src="@/assets/icons/board/Frame.png" alt="" />
        </div>
        <div>回首页</div>
      </div>
      <div id="search" :class="{ active: isSearched }">
        <input
          type="text"
          class="search-input"
          v-model="searchKeyword"
          @input="handleSearchInput"
          :placeholder="randomPlaceholder"
          @blur="handleInputBlur"
          ref="searchInputRef"
          v-show="isSearched"
        />
        <div
          :class="['search-img', { 'search-button': searchKeyword }]"
          @click="searchKeyword ? handleSearch() : handleSearchIconClick()"
        >
          <img
            v-if="!searchKeyword"
            src="@/assets/icons/home/Group 2.png"
            alt=""
          />
          <button v-else class="search-text" type="button">搜 索</button>
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
              <div class="suggestion-name">{{ item.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="info">
    <!-- 左侧图像 -->
    <div class="picture">
      <!-- 大图 -->
      <div class="screen">
        <img :src="processedPictures[currentPictureIndex]" alt="产品图片" />
      </div>
      <!-- 小图预览 -->
      <div class="preview">
        <div
          class="pre-item"
          v-for="(pic, index) in processedPictures"
          :key="index"
          :class="{ active: currentPictureIndex === index }"
          @click="handleThumbnailClick(index)"
        >
          <img :src="pic" alt="产品图片" />
        </div>
      </div>
    </div>
    <!-- 右侧描述 -->
    <div class="descri">
      <!-- 板卡信息 -->
      <div class="board-info">
        <DesriName name="板卡信息"></DesriName>
        <div class="info-detail">
          <div id="board-block">
            <div id="title">厂商名称：</div>
            <div id="content">{{ boardDetail?.vendor?.name }}</div>
          </div>
          <div id="board-block">
            <div id="title">Soc型号称：</div>
            <div id="content">{{ boardDetail?.soc?.name }}</div>
          </div>
          <div id="board-block">
            <div id="title">板卡类型:</div>
            <div id="content">{{ boardDetail?.type }}</div>
          </div>
        </div>
      </div>
      <!-- ram配置 -->
      <div class="ram" v-if="boardDetail?.hardware?.ram">
        <DesriName name="RAM配置"></DesriName>
        <div id="content">
          {{ boardDetail.hardware.ram?.type }} ,
          {{ String(boardDetail.hardware.ram.capacity).replace(/,/g, "/") }}
        </div>
      </div>
      <!-- 接口 -->
      <div class="port">
        <div id="board-block">
          <DesriName name="存储接口"></DesriName>
          <ul id="content" class="port-list">
            <li v-for="item in boardDetail?.hardware?.storage" :key="item.type">
              ￮ {{ item.type
              }}{{ item.capacity ? " , " + item.capacity.join("/") : "" }}
            </li>
          </ul>
        </div>
        <div id="board-block">
          <DesriName name="高速接口"></DesriName>
          <ul id="content" class="port-list">
            <li
              v-for="item in boardDetail?.hardware?.connectivity"
              :key="item.type"
            >
              ￮ {{ item.type }} {{ item.revision }}
              {{ item.nums ? `x${item.nums}` : "" }}
            </li>
          </ul>
        </div>

        <div id="board-block">
          <DesriName name="低速接口"></DesriName>
          <ul id="content" class="port-list">
            <li></li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- tab 栏 -->
  <div v-if="activeTab" class="system-tabs">
    <div
      class="tab-item"
      v-for="tab in systemTabs"
      :key="tab"
      :class="{ active: activeTab === tab }"
      @click="activeTab = tab"
    >
      {{ tab }}
    </div>
  </div>

  <SystemSelect
    v-if="currentVersion && currentSystemVersions.length"
    :item="currentVersion"
    :itemList="currentSystemVersions"
    @update-index="handleUpdateIndex"
    :activeTab="activeTab"
  >
  </SystemSelect>
</template>

<style scoped lang="scss">
@use "sass:color" as color;

$primary-blue: #012fa6;
$secondary-blue: #4a77ca;
$light-blue: #789edb;
$border-color: #f1faff;

.top-wrapper {
  display: flex;
  justify-content: center;
  position: relative;
  width: 100%;
  .top-bar {
    margin: 25px 0 auto;
    width: 90%;
    height: 96px;
    border-radius: 24px;
    border-color: #f5fbfe;
    border: 1px solid #f1faff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #ffffff;
    transition: all 0.3s ease;
    position: relative;
    box-sizing: border-box;
    z-index: 1000;
    padding-right: 10px;
    box-sizing: border-box;
    box-shadow: 0 3px 2px 0 rgba(1, 47, 166, 0.02),
      0 7px 5px 0 rgba(1, 47, 166, 0.03), 0 12px 10px 0 rgba(1, 47, 166, 0.04),
      0 22px 18px 0 rgba(1, 47, 166, 0.04);

    .circle-img {
      width: 224px;
      height: 63px;
      display: flex;
      align-items: center;
      padding: 8px 0 8px 16px;
      box-sizing: border-box;
      img {
        width: 160px;
        height: 48px;
        object-fit: contain;
        margin-left: 16px;
      }
    }

    .back-to-home {
      display: flex;
      align-items: center;
      font-size: 24px;
      width: 110px;
      justify-content: space-between;
      margin-right: auto;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: $secondary-blue;
      background: rgba(74, 119, 202, 0.05);

      .back {
        display: flex;
        align-items: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        img {
          width: 24px;
          height: 24px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      }

      &:hover {
        color: $primary-blue;
        background: rgba(1, 47, 166, 0.1);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(1, 47, 166, 0.1);

        .back {
          transform: translateX(-4px);

          img {
            transform: scale(1.1);
          }
        }
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(1, 47, 166, 0.1);
      }
    }

    #search {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: transparent;
      transition: all 0.3s ease;
      width: 615px;
      height: 64px;
      border-radius: 21px;
      padding: 0 16px;
      box-sizing: border-box;
      position: relative;

      &.active {
        background-color: #f0f0f0 !important;
      }

      .back-to-home {
        display: flex;
        align-items: center;
        gap: 16px;
        cursor: pointer;
        color: $light-blue;
        font-size: 20px;
        font-family: PingFang SC-Regular;
        margin-left: 32px;

        &:hover {
          color: $primary-blue;
        }
      }

      &:focus-within {
        width: 615px;

        .search-input {
          pointer-events: none;

          &::placeholder {
            color: $light-blue;
            content: "";
          }

          &:focus {
            pointer-events: auto;
          }
        }
      }

      .search-input {
        font-family: PingFang SC-Regular;
        color: $light-blue;
        width: 100%;
        border: none;
        font-size: 20px;
        outline: none;
        padding: 0 8px;
        background-color: transparent;
        box-sizing: border-box;

        &::placeholder {
          color: transparent;
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
        margin-left: auto;

        &.search-button {
          background: $primary-blue;
          border-radius: 12px;
          margin-right: 16px;
          padding: 0;
          cursor: pointer;
          width: 95px;
          min-width: 95px;
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
        position: absolute;
        top: 85%;
        left: 0;
        width: 100%;
        margin-top: 16px;
        background: #ffffff;
        border-radius: 20px;
        box-shadow: 0 3px 2px 0 rgba(1, 47, 166, 0.02),
          0 7px 5px 0 rgba(1, 47, 166, 0.03),
          0 12px 10px 0 rgba(1, 47, 166, 0.04),
          0 22px 18px 0 rgba(1, 47, 166, 0.04);
        padding: 16px;
        box-sizing: border-box;
        border: 4px solid #cccccc;
        z-index: 1001;

        .suggestion-item {
          display: flex;
          align-items: center;
          height: 38px;
          padding: 0 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 12px;
          box-sizing: border-box;

          &:hover {
            background: rgba(1, 47, 166, 0.1);
          }

          .suggestion-content {
            flex: 1;
            white-space: nowrap;

            .suggestion-name {
              font-size: 20px;
              text-overflow: ellipsis;
            }
          }

          &.selected {
            background: rgba(1, 47, 166, 0.1);
            border-radius: 10px;
          }
        }
      }
    }
  }
}

.info {
  width: 90%;
  display: flex;

  margin-top: 20px;
  margin-bottom: 40px;
  background-color: #fff;
  box-shadow: 0 3px 2px 0 rgba(1, 47, 166, 0.02),
    0 7px 5px 0 rgba(1, 47, 166, 0.03), 0 12px 10px 0 rgba(1, 47, 166, 0.04),
    0 22px 18px 0 rgba(1, 47, 166, 0.04);
  border-radius: 20px;
  border: 1px solid #f1faff;
  .picture {
    flex: 2;
    width: 320px;
    padding: 20px 0 20px 20px;
    box-sizing: border-box;
    .screen {
      width: 292px;
      height: 385px;

      img {
        border-radius: 6px;
      }
    }

    .preview {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 14px;

      .pre-item {
        width: 54px;
        height: 33px;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.3s ease;

        &.active {
          border-color: $primary-blue;
        }

        &:hover {
          border-color: $secondary-blue;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      }
    }
  }

  .descri {
    flex: 8;
    padding: 20px;
    height: 100%;
    box-sizing: border-box;

    .board-info {
      margin-top: 24px;
      .info-detail {
        display: flex;
        margin-top: 12px;
      }
    }
    .ram {
      margin-top: 24px;
    }
    .port {
      margin-top: 24px;
      display: flex;
      flex-wrap: wrap;
    }
  }
}

#title {
  font-size: 14px;
  color: rgba(102, 102, 102, 1);
}

#content {
  font-size: 15px;
  margin-top: 4px;
  color: #333;

  li {
    margin-top: 10px;
  }
}

#board-block {
  width: 33%;
}

.system-tabs {
  display: flex;
  gap: 40px;
  margin-right: auto;
  width: 90%;
  margin: 0 auto;
  .tab-item {
    padding-bottom: 8px;
    font-size: 18px;
    color: #666;
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease;
    box-sizing: border-box;
    &.active {
      color: $primary-blue;
      font-weight: 500;

      &::after {
        content: "";
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 64px;
        height: 2px;
        background: $primary-blue;
      }
    }

    &:hover {
      color: $primary-blue;
    }
  }
}
</style>

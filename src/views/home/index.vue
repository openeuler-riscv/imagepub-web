<script setup>
import ProductItem from "@/components/ProductItem.vue";
import { ref, computed, onMounted, nextTick, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { getProductList } from "@/api/get-json";

defineOptions({
  name: "homePage"
});

const route = useRoute();
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
    const items = [
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

    return {
      id: index + 1,
      name: nameMapping[key],
      item: items
    };
  });
});

const searchSuggestions = computed(() => {
  if (!searchKeyword.value) return [];
  return productList.value
    .filter(
      item =>
        item.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        item.vendor.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        (item.soc &&
          item.soc.name &&
          item.soc.name
            .toLowerCase()
            .includes(searchKeyword.value.toLowerCase()))
    )
    .slice(0, 5);
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
        product.vendor.toLowerCase().includes(keyword) ||
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
      selectedOptions.value[menuId].vendor
    ) {
      return `${selectedOptions.value[menuId].vendor} ${selectedOptions.value[menuId].name}`;
    }
    return selectedOptions.value[menuId];
  }
  return dropMenu.value.find(item => item.id === menuId)?.name;
});

const getTruncatedTitle = computed(() => menuId => {
  const title = getMenuTitle.value(menuId);
  const span = document.createElement("span");
  span.style.font = "500 24px PingFang SC-Regular";
  document.body.appendChild(span);
  span.textContent = title;
  const fullWidth = span.offsetWidth;
  if (fullWidth <= 120) {
    document.body.removeChild(span);
    return title;
  }
  span.textContent = "...";
  let truncatedText = title;
  while (truncatedText.length > 0) {
    span.textContent = truncatedText + "...";
    if (span.offsetWidth <= 120) {
      document.body.removeChild(span);
      return truncatedText + "...";
    }
    truncatedText = truncatedText.slice(0, -1);
  }

  document.body.removeChild(span);
  return "...";
});

const handleSearchInput = e => {
  searchKeyword.value = e.target.value;
  if (!searchKeyword.value) {
    isSearched.value = false;
    searchQuery.value = "";
  }
  showSuggestions.value = true;
};

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
  if (
    item.soc &&
    item.soc.name &&
    item.soc.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  ) {
    searchKeyword.value = item.soc.name;
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
  if (placeholderTimer.value) {
    clearInterval(placeholderTimer.value);
  }
});
watch(viewportWidth, newValue => {
  console.log(newValue, "viewportWidth变化了");
  changeIsDummy(newValue);
});
watch(filteredProductList, newValue => {
  console.log(newValue.length, "我是筛选数目");
  changeIsDummy(viewportWidth.value);
});
const changeIsDummy = value => {
  if (Math.floor((value + 16) / 256) > filteredProductList.value.length) {
    isdummy.value = false;
    let elements = document.querySelectorAll(".dummy-wrapper");
    elements.forEach(function (element) {
      element.style.display = "none";
    });
    console.log(isdummy.value, "我是dummy");
  } else {
    isdummy.value = true;
    console.log(isdummy.value, "我是dummy");
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

onMounted(async () => {
  await fetchProductList();
  startRandomPlaceholder();
  changeViewportWidth();
  window.addEventListener("resize", changeViewportWidth);
  document.addEventListener("click", closeAllOptions);
  document.addEventListener("click", closeSearchSuggestions);
  const searchContainer = document.querySelector(".search-container");
  const searchInput = document.querySelector(".search-input");
  const originalPlaceholder = searchInput.placeholder;

  const handleScroll = () => {
    console.log("handleScroll", window.scrollY);

    showBackToTop.value = window.scrollY > 500;

    if (window.scrollY > 375) {
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
    } else if (
      window.scrollY < 300 &&
      searchContainer.classList.contains("sticky")
    ) {
      isSticky.value = false;
      const searchInputDiv = document.querySelector("#search");
      searchInputDiv.style.backgroundColor = "transparent";
      searchInput.placeholder = originalPlaceholder;
      showSearchInput.value = true;
      searchContainer.classList.remove("sticky");
    }
  };

  window.addEventListener("scroll", handleScroll);

  const keyword = route.query.keyword;
  if (keyword) {
    searchKeyword.value = keyword;
    searchQuery.value = keyword;
    isSearched.value = true;
    handleSearch();
  }
});
</script>

<template>
  <div class="logo">
    <img src="@/assets/logo/Frame 1@3x.svg" alt="OERC Logo" />
  </div>
  <div class="search-container">
    <div class="search-bar">
      <div class="circle-img">
        <img v-if="isSticky" src="@/assets/logo/Frame 1@3x.svg" alt="logo" />
        <img v-else src="@/assets/icons/home/Group 4.png" alt="search icon" />
      </div>
      <div id="search">
        <input
          type="text"
          class="search-input"
          v-model="searchKeyword"
          @input="handleSearchInput"
          :placeholder="randomPlaceholder"
          @blur="handleInputBlur"
          ref="searchInputRef"
          v-show="!isSticky || (isSticky && showSearchInput)"
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
              <div class="suggestion-name">
                {{
                  item.soc &&
                  item.soc.name &&
                  item.soc.name
                    .toLowerCase()
                    .includes(searchKeyword.toLowerCase())
                    ? item.soc.name
                    : item.name
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="drop-menu">
    <ul v-for="item in dropMenu" :key="item.id">
      <div class="menu-item" @click="handleMenuClick(item.id, $event)">
        <li
          class="menu-title"
          :class="{
            'selected-title': selectedOptions[item.id],
            active: showOptions[item.id]
          }"
        >
          <span class="menu-text">{{ getTruncatedTitle(item.id) }}</span>
          <div class="menu-img" :class="{ rotate: showOptions[item.id] }">
            <img src="@/assets/icons/home/Group 5.png" alt="" />
          </div>
        </li>
      </div>
      <div class="options" v-if="item.item.length > 0 && showOptions[item.id]">
        <li
          class="option-item reset-option"
          @click="handleResetOption(item.id, $event)"
        >
          <span class="reset-icon">↺</span>
          重置
        </li>
        <li
          v-for="(option, idx) in item.item"
          :key="idx"
          class="option-item"
          :class="{ selected: selectedOptions[item.id] === option }"
          @click="handleOptionSelect(item.id, option, $event)"
        >
          <span class="selector"></span>
          <span id="option-name">{{
            option.vendor ? option.vendor + " " + option.name : option
          }}</span>
        </li>
      </div>
    </ul>
  </div>

  <div class="product-area">
    <div class="sum">
      <template v-if="isSearched || Object.keys(selectedOptions).length > 0">
        <span v-if="filteredProductList.length > 0">
          筛选后共{{ filteredProductList.length }}个产品
        </span>
        <span v-else> 未找到相关产品 </span>
      </template>
      <span v-else>共{{ productList.length }}个产品</span>
    </div>
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
      src="@/assets/icons/home/Group 109@3x.svg"
      alt="back to top"
      class="up-arrow"
    />
  </div>
</template>

<style scoped lang="scss">
@use "sass:color" as color;
$primary-blue: #012fa6;
$secondary-blue: #4a77ca;
$light-blue: #789edb;
$border-color: #f1faff;

.logo {
  margin: 217px 625px 0;
  height: 65px;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    height: 100%;
    width: auto;
    object-fit: contain;
  }
}

.search-container {
  box-sizing: border-box;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  width: 100%;
  .search-bar {
    margin: 48px auto;
    width: 65%;
    height: 72px;
    border-radius: 24px;
    border: 4px solid $primary-blue;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #ffffff;
    transition: all 0.3s ease;
    box-sizing: border-box;
    position: relative;
    #search {
      position: static !important;
      .search-suggestions {
        position: absolute;
        width: 100%;
        top: -4px;
        right: -4px;
        background: #ffffff;
        border-radius: 24px;
        box-shadow: 0 3px 2px 0 rgba(1, 47, 166, 0.02),
          0 7px 5px 0 rgba(1, 47, 166, 0.03),
          0 12px 10px 0 rgba(1, 47, 166, 0.04),
          0 22px 18px 0 rgba(1, 47, 166, 0.04);
        padding: 80px 0 16px 0;
        box-sizing: border-box;
        z-index: -1;

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
            }
          }

          &.selected {
            background: rgba(1, 47, 166, 0.1);
            border-radius: 10px;
          }
        }
      }
    }

    .circle-img {
      width: 56px;
      height: 56px;
      padding: 8px 0 8px 16px;
      box-sizing: border-box;
    }

    #search {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 72px;
      border-radius: 24px;
      box-sizing: border-box;
      background-color: transparent;
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
        padding: 0 8px;
        box-sizing: border-box;
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
    }
  }

  &.sticky {
    padding: 25px 0 0;
    box-sizing: border-box;
    .search-bar {
      position: relative;
      width: 90%;
      height: 96px;
      margin: 0;
      border-color: $border-color;
      padding-right: 11px;
      box-shadow: 0 3px 2px 0 rgba(1, 47, 166, 0.02),
        0 7px 5px 0 rgba(1, 47, 166, 0.03), 0 12px 10px 0 rgba(1, 47, 166, 0.04),
        0 22px 18px 0 rgba(1, 47, 166, 0.04);
      box-sizing: border-box;
      .circle-img {
        padding: 8px 0 8px 16px;
        width: 224px;
        height: 63px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        img {
          width: 160px;
          height: 48px;
          object-fit: contain;
          margin-left: 16px;
        }
      }

      #search {
        background-color: transparent;
        transition: all 0.3s ease;
        width: 615px;
        position: relative !important;
        &:focus-within {
          background-color: #f0f0f0;
          .search-input {
            pointer-events: none;

            &::placeholder {
              color: $light-blue;
              content: v-bind(randomPlaceholder);
            }

            &:focus {
              pointer-events: auto;
            }
          }
        }

        .search-input {
          background-color: transparent;

          &::placeholder {
            color: transparent;
          }
        }

        .search-img {
          margin-left: auto;
        }
        .search-suggestions {
          width: 100%;
          position: absolute;
          top: 85%;
          left: 0;
          margin-top: 16px;
          border: 4px solid #cccccc;
          z-index: 1001;
          padding: 16px;
          border-radius: 20px;
          box-shadow: 0 3px 2px 0 rgba(1, 47, 166, 0.02),
            0 7px 5px 0 rgba(1, 47, 166, 0.03),
            0 12px 10px 0 rgba(1, 47, 166, 0.04),
            0 22px 18px 0 rgba(1, 47, 166, 0.04);
          box-sizing: border-box;
        }
      }
    }
  }
}

.drop-menu {
  margin-top: 24px;
  display: flex;
  margin: 0 auto;
  justify-content: center;
  width: 80%;
  ul {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: auto;
    height: 48px;
    flex: 1;
    position: relative;
    .menu-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 24px;
      font-weight: 500;
      color: $secondary-blue;
      cursor: pointer;
      font-family: PingFang SC-Regular;
      transition: all 0.3s ease;
      .menu-text {
        max-width: 120px;
        white-space: nowrap;
        text-overflow: ellipsis;
        display: inline-block;
      }

      &.selected-title {
        color: $primary-blue;
        font-weight: 500;
      }

      &.active {
        color: $primary-blue;
      }
    }

    .menu-img {
      height: 20px;
      width: 20px;
      transition: transform 0.3s ease;
      margin-left: 8px;

      &.rotate {
        transform: rotate(180deg);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
    .options {
      position: absolute;
      top: 100%;
      min-width: 16em;
      height: auto;
      padding: 16px 0;
      box-sizing: border-box;
      box-shadow: 0 20px 20px 10px rgba(0, 18, 99, 0.2);
      border-radius: 20px;
      background: #ffffff;
      z-index: 10;
      margin-top: 10px;

      .option-item {
        display: flex;
        align-items: flex-start;
        padding: 16px 24px;
        box-sizing: border-box;
        gap: 16px;
        font-size: 20px;
        color: #666666;
        transition: all 0.3s ease;
        white-space: nowrap;

        #option-name {
          flex: 0 1 auto;
          white-space: nowrap;
          overflow: visible;
        }

        .selector {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          position: relative;
          border: 1px solid #666666;
          border-radius: 50%;

          &::after {
            content: "";
            position: absolute;
            width: 16px;
            height: 16px;
            background: transparent;
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }

        &:hover {
          background: rgba(1, 47, 166, 0.1);
          color: $primary-blue;
        }

        &.selected {
          color: $primary-blue;
          background: rgba(1, 47, 166, 0.1);

          .selector {
            border-color: $primary-blue;

            &::after {
              background: $primary-blue;
            }
          }
        }
      }

      .reset-option {
        border-bottom: 1px solid #eee;
        margin-bottom: 8px;
        padding-bottom: 12px;
        color: $secondary-blue;
        display: flex;
        align-items: center;
        gap: 8px;

        .reset-icon {
          font-size: 18px;
          font-weight: bold;
        }

        &:hover {
          color: $primary-blue;
        }
      }
    }
  }
}

.product-area {
  box-sizing: border-box;
  margin: 87px 0;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  .sum {
    font-size: 18px;
    width: 240px;
    color: $light-blue;
    margin-right: auto;
    margin-left: 7%;
  }

  .product-list {
    box-sizing: border-box;
    overflow: hidden;
    width: 100%;
    display: flex;
    justify-content: center;
    padding-bottom: 20px;
    gap: 16px;
    flex-wrap: wrap;
    padding: 0 119px;
    min-height: 330px;
    .dummy-wrapper {
      #product-dummy {
        width: 240px;
        height: 1px;
        background-color: transparent;
        display: block;
      }
    }
  }
}

.back-to-top {
  position: fixed;
  right: 64px;
  bottom: 64px;
  width: 72px;
  height: 72px;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 3px 2px 0 rgba(1, 47, 166, 0.02),
    0 7px 5px 0 rgba(1, 47, 166, 0.03), 0 12px 10px 0 rgba(1, 47, 166, 0.04),
    0 22px 18px 0 rgba(1, 47, 166, 0.04);
  transition: all 0.3s ease;
  z-index: 100;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 4px 8px rgba(1, 47, 166, 0.15);
  }

  .up-arrow {
    width: 40px;
    height: 40px;
    transform: none;
  }
}
</style>

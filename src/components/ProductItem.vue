<template>
  <div class="product-item" @click="handleClick" :style="perProductStyle">
    <div class="product-item-img">
      <img :src="productImage" alt="product image"  height="100%" width="auto" style="max-width: 100%;" />
      <div class="product-item-tag" v-if="isKernel">内核同源</div>
    </div>
    <div class="product-item-info">
      <div class="product-item-name">{{ info.name }}</div>
      <div class="product-item-desc">{{ info.vendor.name }}</div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useProductDataStore } from '@/store/productData'


const router = useRouter();
const handleClick = () => {
  router.push({
    path: `/board/${props.info.vendor.id}/${props.info.id}`
  });
  productStore.setProUrl(props.info.url)
};

const props = defineProps({
  info: {
    type: Object,
    required: true
  }
});




const productStore = useProductDataStore()

const isKernel = computed(() => {
  return String(props.info.kernel).includes("RVCK-") ? true : false;
});

import defaultImage from "../assets/images/product_default.png";
const productImage = computed(() => {
  if (!props.info.thumbnail) return defaultImage;
  return `${import.meta.env.VITE_IMAGE_BASE_URL}${props.info.thumbnail}`;
});

const perProductStyle = computed(() => {
  if (props.info.available !== true) return { "opacity": 0.4 };
  return {};
});

</script>

<style scoped lang="scss">
.product-item {
  width: 240px;
  height: 279px;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  transform: translateY(0);
  cursor: pointer;
  margin-top: 20px;
  box-sizing: border-box;
  &:hover {
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.15);
    transform: translateY(-8px);
  }

  &-img {
    height: 180.16px;
    width: 100%;
    position: relative;
  }

  &-tag {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    right: 0;
    width: 90px;
    color: white;
    font-size: 16px;
    height: 34px;
    background: rgba(1, 47, 166, 0.8);
    border-radius: 0 20.16px 0 20px;
  }

  &-info {
    padding: 16px 16px 0 16px;
    box-sizing: border-box;
  }

  &-name {
    font-size: 16px;
    color: #000000;
    margin-bottom: 8px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &-desc {
    margin-top: 5px;
    font-size: 14px;
    color: #666666;
    font-weight: 400;
    line-height: 16px;

  white-space: nowrap;
  
  overflow: hidden;
  text-overflow: ellipsis;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;
  line-height: 20px;
  }
}

html.dark{
  .product-item{
    background-color: #212121;
    .product-item-name{
      color:#ccc;
    }
    .product-item-desc{
      color:#999
    }
  }
}

</style>

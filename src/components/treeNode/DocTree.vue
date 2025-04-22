<template>
  <div class="doc-tree">
    <div class="tree-header">目录</div>
    <div class="search-box">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="搜索目录..." 
        class="search-input"
      />
    </div>
    <div class="tree-container">
      <ul class="tree-list" v-if="filteredItems.length > 0">
        <doc-tree-item 
          v-for="item in filteredItems" 
          :key="item.id" 
          :item="item" 
          :onClick="onClick"
          :currentItem="currentItem"
        />
      </ul>
      <div class="no-results" v-else>
        没有找到匹配的目录项
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import DocTreeItem from './DocTreeItem.vue';

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  onClick: {
    type: Function,
    required: true
  },
  currentItem: {
    type: Object,
    default: null
  }
});
//这里是加个搜索功能，还是用的递归搜索
const searchQuery = ref('');

const filteredItems = computed(() => {
  if (!searchQuery.value) return props.items;
  return filterItemsByQuery(props.items, searchQuery.value.toLowerCase());
});

const filterItemsByQuery = (items, query) => {
  if (!items) return [];
  return items
    .map(item => {
      const isMatch = item.text.toLowerCase().includes(query);
      const filteredChildren = filterItemsByQuery(item.children, query);
      if (isMatch) {
        return {...item, children: item.children}; 
      } else if (filteredChildren.length > 0) {
        return {...item, children: filteredChildren}; 
      } else {
        return null; 
      }
    })
    .filter(Boolean);
};
</script>

<style scoped lang="scss">
.doc-tree {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  .tree-header {
    font-size: 18px;
    font-weight: 600;
    color: #012fa6;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e5e5e5;
  }

  .search-box {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 15px;

    .search-input {
      padding: 8px 30px 8px 10px;
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;

      &:focus {
        border-color: #012fa6;
      }
    }

    .search-icon {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #999;
      font-size: 14px;
      pointer-events: none;
    }

    .clear-icon {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #999;
      font-size: 14px;
      cursor: pointer;

      &:hover {
        color: #012fa6;
      }
    }
  }

  .tree-container {
    flex: 1;
    overflow-y: auto;
    padding-right: 5px;

    &::-webkit-scrollbar {
      width: 4px;
      background: transparent;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #e5e5e5;
      border-radius: 3px;
    }

    .tree-list {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }

    .no-results {
      padding: 15px 0;
      color: #999;
      text-align: center;
      font-size: 14px;
    }
  }
}
</style> 
<template>
  <div class="doc-tree">
    <div class="tree-header">目录</div>
    <div class="search-box">
      <input type="text" v-model="searchQuery" placeholder="搜索目录..." class="search-input" />
      <!-- Assuming you might want icons later, keeping placeholders -->
      <!-- <i class="fa fa-search search-icon"></i> -->
      <!-- <i v-if="searchQuery" class="fa fa-times-circle clear-icon" @click="searchQuery = ''"></i> -->
    </div>
    <div class="tree-container">
      <ul class="tree-list" v-if="filteredItems.length > 0">
        <doc-tree-item v-for="item in filteredItems" :key="item.id" :item="item" :onClick="onClick"
          :currentItem="currentItem" />
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
        return { ...item, children: item.children };
      } else if (filteredChildren.length > 0) {
        return { ...item, children: filteredChildren };
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
  background-color: var(--theme-card);
  color: var(--theme-text);
  transition: background-color 0.3s, color 0.3s;

  .tree-header {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-color-primary);
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--theme-border);
    transition: color 0.3s, border-color 0.3s;
  }

  .search-box {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 15px;

    .search-input {
      padding: 8px 30px 8px 10px;
      border: 1px solid var(--theme-border);
      border-radius: 4px;
      font-size: 14px;
      outline: none;
      background-color: var(--theme-input);
      color: var(--theme-text);
      transition: border-color 0.3s, background-color 0.3s, color 0.3s;

      &:focus {
        border-color: var(--el-color-primary);
      }

      &::placeholder {
        color: var(--theme-text-secondary);
      }
    }

    .search-icon,
    .clear-icon {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--theme-text-secondary);
      font-size: 14px;
      pointer-events: none; /* Make icon non-interactive */
      transition: color 0.3s;
    }

    .clear-icon {
      pointer-events: auto; /* Make clear icon interactive */
      cursor: pointer;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  .tree-container {
    flex: 1;
    overflow-y: auto;
    padding-right: 5px;

    /* Scrollbar styles */
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--theme-scrollbar);
      border-radius: 3px;
      transition: background 0.3s;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: var(--theme-scrollbar-hover);
    }

    /* Firefox scrollbar */
    scrollbar-width: thin;
    scrollbar-color: var(--theme-scrollbar) transparent;

    .tree-list {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }

    .no-results {
      padding: 15px 0;
      color: var(--theme-text-secondary);
      text-align: center;
      font-size: 14px;
      transition: color 0.3s;
    }
  }
}
</style>
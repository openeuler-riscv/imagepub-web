<template>
  <li class="tree-item">
    <div class="item-content" :class="[
      `level-${item.level}`,
      {
        'has-children': hasChildren,
        active: isActive,
      },
    ]" @click="handleClick(item)">
      <div class="item-toggle" v-if="hasChildren" @click.stop="toggleExpand">
        <span class="toggle-icon" :class="{ expanded: isExpanded }">
          {{ isExpanded ? "▼" : "▶" }}
        </span>
      </div>
      <div class="item-text">{{ item.text }}</div>
    </div>

    <transition name="fade">
      <div v-if="hasChildren && isExpanded" class="subtree-list">
        <doc-tree-item v-for="child in item.children" :key="child.id" :item="child" :onClick="onClick"
          :currentItem="currentItem" />
      </div>
    </transition>
  </li>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  onClick: {
    type: Function,
    required: true,
  },
  currentItem: {
    type: Object,
    default: null,
  },
});

const isExpanded = ref(false);
const hasChildren = computed(
  () => props.item.children && props.item.children.length > 0
);

const isActive = computed(() => {
  // 修复active状态判断，这里不知道为什么会传两次，会传一个其他的，但是id一样，推测是前面的id没生成好，所以检测一下text即可，完美修复
  const active = props.currentItem && props.item.id === props.currentItem.id && props.item.text === props.currentItem.text;
  if (active) {
    console.log(props.currentItem, props.item, "我是当前项");
    return true;
  }
  return false;
});

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const handleClick = (item) => {
  props.onClick(item);
};

// 如果currentItem变化，就去看有没有子级，有的话应该让他展开
watch(
  () => props.currentItem,
  (newVal) => {
    if (newVal && hasChildren.value) {
      const hasActiveChild = findActiveChild(props.item.children, newVal.id);
      if (hasActiveChild) {
        isExpanded.value = true;
      }
    }
  },
  { deep: true }
);

// 默认展开第一季目录和被选中的目录
onMounted(() => {
  if (
    props.item.level === 0 ||
    props.item.level === 1 ||
    props.item.isSection
  ) {
    isExpanded.value = true;
  }
  if (props.currentItem && hasChildren.value) {
    const hasActiveChild = findActiveChild(
      props.item.children,
      props.currentItem.id
    );
    if (hasActiveChild) {
      isExpanded.value = true;
    }
  }
});

const findActiveChild = (children, activeId) => {
  if (!children || !activeId) return false;

  for (const child of children) {
    if (child.id === activeId) {
      return true;
    }
    if (child.children && child.children.length > 0) {
      const found = findActiveChild(child.children, activeId);
      if (found) return true;
    }
  }
  return false;
};
</script>

<style scoped lang="scss">
.tree-item {
  margin: 0;
  padding: 0;
  list-style-type: none;

  .item-content {
    display: flex;
    align-items: center;
    padding: 8px 4px;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 4px;
    color: #333;
    margin: 2px 0;

    &:hover {
      background-color: #e8f2ff;
    }

    &.active {
      background-color: #e8f2ff;
      color: #012fa6;
      font-weight: 600;
      border-left: 3px solid #012fa6;
      padding-left: 5px;
    }

    .item-toggle {
      width: 16px;
      text-align: center;
      margin-right: 4px;
      user-select: none;
      color: #012fa6;
      cursor: pointer;

      .toggle-icon {
        font-size: 10px;
        transition: transform 0.2s;
        display: inline-block;

        &.expanded {
          color: #4a77ca;
        }
      }
    }

    .item-text {
      flex: 1;
      font-size: 14px;
      padding-left: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .subtree-list {
    padding-left: 16px;
    margin: 0;
    list-style-type: none;
    border-left: 1px dashed #e5e5e5;
  }
}

/* 根据层级应用不同样式 */
.level-0 {
  font-weight: 600;
  font-size: 16px;
}

.level-1 {
  font-weight: 600;
  font-size: 15px;

  .item-text {
    font-size: 15px;
  }
}

.level-2 .item-text {
  font-size: 14px;
  font-weight: 500;
}

.level-3,
.level-4,
.level-5,
.level-6 {
  .item-text {
    font-size: 13px;
    font-weight: normal;
  }
}

/* 添加展开/收起动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.18s ease-in-out;
  max-height: 1000px;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>

<template>
  <div class="document-list-container" :class="{ sidebar: !isMobile }">
    <!-- 桌面端目录 -->
    <div v-if="!isMobile" class="desktop-container">
      <!-- 桌面端相关文档列表 -->
      <div class="related-list desktop-related-list">
        <BoardInfoTitle title="相关文档"></BoardInfoTitle>
        <div class="related-list-item">文档1</div>
        <div class="related-list-item">文档2</div>
        <div class="related-list-item">文档3</div>
      </div>

      <div class="doc-directory-wrapper">
        <div class="doc-directory" :class="{ 'directory-fixed': isDirectoryFixed }">
          <DocTree :items="tocItems" :onClick="handleDocItemClick" :currentItem="currentDocItem" />
        </div>
      </div>
    </div>

    <!-- 移动端按钮 -->
    <div class="mobile-button-container" v-if="isMobile">
      <button class="sidebar-toggle" :class="{ 'fixed': isButtonFixed }" @click="toggleMobileSidebar">
        <i class="fa fa-bars"></i>
      </button>
    </div>

    <!-- 右侧的抽屉 -->
    <el-drawer modal="false" v-model="mobileDocShow" :with-header="false" direction="rtl" size="80%">
      <div>
        <!-- 移动端相关文档列表 -->
        <div class="related-list mobile-related-list">
          <BoardInfoTitle title="相关文档"></BoardInfoTitle>
          <div class="related-list-item">文档1</div>
          <div class="related-list-item">文档2</div>
          <div class="related-list-item">文档3</div>
        </div>

        <DocTree :items="tocItems" :onClick="handleDocItemClick" :currentItem="currentDocItem" />
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from "vue";
import DocTree from "@/components/treeNode/DocTree.vue";
import BoardInfoTitle from "@/components/board/BoardInfoTitle.vue";
const props = defineProps({
  markdownContent: {
    type: String,
    required: true,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
});

// 用于存储目录结构
const tocItems = ref([]);
// 当前选中的文档项目
const currentDocItem = ref(null);

// 处理点击文档项目的事件
const handleDocItemClick = (item) => {
  currentDocItem.value = item;
  // 如果是移动端，点击后关闭抽屉
  if (props.isMobile) {
    mobileDocShow.value = false;
  }

  if (item.id) {
    const element = document.getElementById(item.id);
    if (element) {
      window.removeEventListener("scroll", handleDocScroll);
      // 滚动到目标元素
      element.scrollIntoView({ behavior: "smooth" });
      console.log("elemtne" + element);

      // 等待滚动完成后再添加监听
      setTimeout(() => {
        window.addEventListener("scroll", handleDocScroll);
      }, 500);
    }
  }
};

// 处理文档滚动事件
const handleDocScroll = () => {
  // 获取文档区域元素
  const markdownBody = document.querySelector(".markdown-body");
  if (!markdownBody || !tocItems.value || tocItems.value.length === 0) return;

  // 获取所有文档中的标题元素
  const headings = [...markdownBody.querySelectorAll('[id^="doc-title-"]')];
  if (headings.length === 0) return;

  // 计算每个标题到视口顶部的距离
  const scrollTop = window.scrollY;
  const viewportHeight = window.innerHeight;
  let closestHeading = null;
  let closestDistance = Infinity;

  // 找到在视口中最接近顶部的标题
  headings.forEach((heading) => {
    // 获取标题相对于文档顶部的位置
    const rect = heading.getBoundingClientRect();
    const headingTop = rect.top + scrollTop;

    // 计算标题到视口中心的距离（使用视口中心更符合视觉焦点）
    const distance = Math.abs(headingTop - scrollTop - viewportHeight / 2);

    // 只考虑在视口内或接近视口顶部的标题
    if (rect.top <= viewportHeight * 0.6 && distance < closestDistance) {
      closestDistance = distance;
      closestHeading = heading;
    }
  });

  if (closestHeading) {
    const headingId = closestHeading.id;
    // 递归搜索匹配的目录项
    const findMatchingTocItem = (items) => {
      for (const item of items) {
        if (item.id === headingId) {
          return item;
        }
        if (item.children && item.children.length > 0) {
          const found = findMatchingTocItem(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    const matchingItem = findMatchingTocItem(tocItems.value);
    if (matchingItem && matchingItem !== currentDocItem.value) {
      currentDocItem.value = matchingItem;
    }
  }
};

// 解析 Markdown 文档，生成目录结构
const parseTocFromMarkdown = (markdown) => {
  // 识别标题和分割线
  const lines = markdown.split("\n");
  const items = [];
  let currentSection = null;
  const titleCounts = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // 检测标题
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();

      // 为每个级别的标题计数
      titleCounts[level] = (titleCounts[level] || 0) + 1;

      // 生成唯一ID
      let id;
      if (level === 1) {
        id = `doc-title-${titleCounts[level]}`;
      } else {
        const parentLevel = level - 1;
        const parentCount = titleCounts[parentLevel] || 0;
        id = `doc-title-${level}-${titleCounts[level]}`;
      }

      const item = {
        level,
        text,
        id,
        children: [],
      };

      // 如果是大标题（一级标题）后面紧跟着分割线，则创建新的章节
      if (
        level === 1 &&
        i + 1 < lines.length &&
        lines[i + 1].trim().match(/^-{3,}$/)
      ) {
        currentSection = {
          level: 0,
          text,
          id,
          children: [],
          isSection: true,
        };
        items.push(currentSection);
        // 跳过分割线
        i++;
      } else if (currentSection && level > 1) {
        // 如果当前有章节且是二级以下标题，则添加到当前章节
        currentSection.children.push(item);
      } else {
        // 其他情况直接添加到顶层
        items.push(item);
      }
    }
  }

  // 对于没有章节的孤立标题，构建它们的层次结构
  const buildSubtree = (items) => {
    if (!items || items.length === 0) return [];

    const root = { level: 0, children: [] };
    const stack = [root];

    items.forEach((item) => {
      // 如果项目本身就是完整的章节，直接添加
      if (item.isSection) {
        root.children.push(item);
        return;
      }

      // 否则按照层级关系构建树
      while (stack[stack.length - 1].level >= item.level) {
        stack.pop();
      }

      const parent = stack[stack.length - 1];
      parent.children.push(item);
      stack.push(item);
    });

    return root.children;
  };

  // 递归处理每个章节的子项目
  if (currentSection) {
    // 为章节内的标题构建子树
    currentSection.children = buildSubtree(currentSection.children);
  }

  return buildSubtree(items);
};
const mobileDocShow = ref(false);
// 监听 markdownContent 的变化，更新目录结构
watch(
  () => props.markdownContent,
  (newContent) => {
    if (newContent) {
      tocItems.value = parseTocFromMarkdown(newContent);

      // 内容变化后，重新设置滚动监听
      nextTick(() => {
        setupScrollListener();
      });
    }
  },
  { immediate: true }
);
// 监听isMobile的变化
watch(
  () => props.isMobile,
  (newValue, oldValue) => {
    console.log("移动端状态已变更:", newValue);
  }
);
// 设置滚动监听
const setupScrollListener = () => {
  // const markdownBody = document.querySelector(".markdown-body");
  // if (markdownBody) {
  //   // 先移除可能已存在的监听器，避免重复
  //   markdownBody.removeEventListener("scroll", handleDocScroll);
  //   // 添加滚动监听
  //   markdownBody.addEventListener("scroll", handleDocScroll);
  // }

  window.addEventListener("scroll", handleDocScroll);
};
const toggleMobileSidebar = () => {
  mobileDocShow.value = !mobileDocShow.value;
};

const isButtonFixed = ref(false);

// 添加滚动监听来控制按钮固定
const handleButtonScroll = () => {
  const docElement = document.querySelector('.markdown-body');
  if (docElement) {
    const docRect = docElement.getBoundingClientRect();
    isButtonFixed.value = docRect.top <= 70;
  }
};

const isDirectoryFixed = ref(false);

// 添加滚动监听来控制目录固定
const handleDirectoryScroll = () => {
  if (!props.isMobile) {
    const directoryElement = document.querySelector('.doc-directory');
    const relatedList = document.querySelector('.desktop-related-list');
    if (directoryElement && relatedList) {
      const relatedListRect = relatedList.getBoundingClientRect();
      const relatedListBottom = relatedListRect.bottom;
      // 当相关文档列表完全滚出视图时才固定目录
      isDirectoryFixed.value = relatedListBottom < 0;
    }
  }
};

// 组件挂载时，解析 markdown 内容并设置滚动监听
onMounted(() => {
  if (props.markdownContent) {
    tocItems.value = parseTocFromMarkdown(props.markdownContent);
  }

  // 等待DOM更新后设置滚动监听
  nextTick(() => {
    setupScrollListener();
    // 添加按钮滚动监听
    window.addEventListener('scroll', handleButtonScroll);
    window.addEventListener('scroll', handleDirectoryScroll);
  });
});

// 组件卸载时，移除滚动监听
onUnmounted(() => {
  // const markdownBody = document.querySelector(".markdown-body");
  // if (markdownBody) {
  //   markdownBody.removeEventListener("scroll", handleDocScroll);
  // }
  window.removeEventListener("scroll", handleDocScroll);
  // 移除按钮滚动监听
  window.removeEventListener('scroll', handleButtonScroll);
  window.removeEventListener('scroll', handleDirectoryScroll);
});
</script>

<style scoped>
.sidebar {
  max-width: 240px;
  width: 15%;
  background-color: var(--theme-card);
  padding: 10px;
  margin: 10px;
}

.doc-directory {
  width: 100%;
  height: calc(100vh - 200px);
  overflow-y: auto;
  margin-top: 20px;
  position: relative;
  /* 只保留opacity的过渡效果 */
  transition: opacity 0.2s ease;
}

.directory-fixed {
  position: fixed;
  top: 10px;
  width: calc(15% - 20px);
  max-width: 220px;
}

/* 为了防止固定定位时的跳动，添加一个占位元素 */
.directory-fixed+.directory-placeholder {
  height: 100%;
  visibility: hidden;
}

.document-list-container {
  background-color: var(--theme-card);
  border-radius: 10px;
  color: var(--theme-text);
  transition: background 0.3s, color 0.3s;
}

.related-list {
  padding: 20px 14px;
  background: var(--theme-card);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
  color: var(--theme-text);
  transition: background 0.3s, color 0.3s;
}

.desktop-related-list {
  margin-bottom: 20px;
}

.related-list-item {
  padding: 10px;
  border-radius: 5px;
  background-color: var(--theme-hover);
  margin: 10px;
  color: var(--theme-text);
  transition: background 0.3s, color 0.3s;
}

.markdown-body {
  position: relative;
}

.mobile-button-container {
  position: absolute;
  right: -5px;
  top: -40px;
}

.sidebar-toggle {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background-color: var(--el-color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 999;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.sidebar-toggle.fixed {
  position: fixed;
  right: 20px;
  top: 30px;
}

.mobile-related-list {
  margin-bottom: 20px;
  padding: 20px 14px;
  border-bottom: 1px solid var(--theme-border);
}

.desktop-container {
  position: relative;
  width: 100%;
}

.doc-directory-wrapper {
  position: relative;
  width: 100%;
}

/* 隐藏滚动条但保持功能 */
.doc-directory::-webkit-scrollbar {
  width: 6px;
}

.doc-directory::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.doc-directory::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>

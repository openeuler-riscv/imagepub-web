<template>
  <div class="document-list-container">
    <div class="related-list">
      <BoardInfoTitle title="相关文档"></BoardInfoTitle>
      <div v-if="mdFiles.length=0">11</div>
      <div v-else-if="mdFiles.length>0" class="related-list-item" v-for="file in mdFiles">{{file[0].text}}</div>
    </div>
    <div class="doc-directory">
      <DocTree :items="tocItems" :onClick="handleDocItemClick" :currentItem="currentDocItem" />
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from "vue";
import DocTree from "@/components/treeNode/DocTree.vue";
import BoardInfoTitle from "@/components/board/BoardInfoTitle.vue";
import request from "@/utils/request";
const props = defineProps({
  markdownContent: {
    type: String,
    required: true,
  },
  docList:Array
});
const List = ref([])
const mdFiles = ref([]);
const isLoading = ref(true);
// 用于存储目录结构
const tocItems = ref([]);
// 当前选中的文档项目
const currentDocItem = ref(null);

// 处理点击文档项目的事件
const handleDocItemClick = (item) => {
  currentDocItem.value = item;
  if (item.id) {
    const element = document.getElementById(item.id);
    if (element) {
      // 先移除滚动监听，避免滚动过程中触发handleDocScroll
      const markdownBody = document.querySelector(".markdown-body");
      if (markdownBody) {
        markdownBody.removeEventListener("scroll", handleDocScroll);
      }

      // 滚动到目标元素
      element.scrollIntoView({ behavior: "smooth" });
      console.log('elemtne' + element);

      // 等待滚动完成后再添加监听
      setTimeout(() => {
        if (markdownBody) {
          markdownBody.addEventListener("scroll", handleDocScroll);
        }
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
  const scrollTop = markdownBody.scrollTop;
  let closestHeading = null;
  let closestDistance = Infinity;

  // 找到距离顶部最近的标题
  headings.forEach((heading) => {
    const distance = Math.abs(heading.offsetTop - scrollTop);
    if (distance < closestDistance) {
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

// 监听 markdownContent 的变化，更新目录结构
watch(
  () => props.markdownContent,

  (newContent) => {
    if (newContent) {
      tocItems.value = parseTocFromMarkdown(newContent)

      // 内容变化后，重新设置滚动监听
      nextTick(() => {
        setupScrollListener();
      });
    }
  },
  { immediate: true }
);

// 2. 存储结果的 Proxy 数组



// 4. 核心：循环异步获取 md 文件（处理 Proxy 数组）
const fetchAllMdFiles = async (arr) => {
      mdFiles.value = []
       if(arr){
        for (const url of arr) {
        
          // 异步获取 md 文件
          const content = await request.get(`/${url}`);
          // 添加到结果数组（Proxy 数组会自动响应式更新）
          mdFiles.value.push( parseTocFromMarkdown(content.data));
        }
        isLoading.value = false
      }
}

 console.log(List)

watch(
  ()=>props.docList,
  (arr)=>{
  arr && fetchAllMdFiles(arr)

  },{ immediate: true,deep: true  }
)

// 设置滚动监听
const setupScrollListener = () => {
  const markdownBody = document.querySelector(".markdown-body");
  if (markdownBody) {
    // 先移除可能已存在的监听器，避免重复
    markdownBody.removeEventListener("scroll", handleDocScroll);
    // 添加滚动监听
    markdownBody.addEventListener("scroll", handleDocScroll);
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
  });
});

// 组件卸载时，移除滚动监听
onUnmounted(() => {
  const markdownBody = document.querySelector(".markdown-body");
  if (markdownBody) {
    markdownBody.removeEventListener("scroll", handleDocScroll);
  }
});


</script>

<style scoped>
.doc-directory {
  width: auto;
  height: 100%;
  overflow: hidden;
}

.document-list-container {
  background-color: var(--theme-card);
  border-radius: 10px;
  padding: 10px;
  color: var(--theme-text);
  transition: background 0.3s, color 0.3s;
}

.related-list {
  background: var(--theme-card);

  color: var(--theme-text);
  transition: background 0.3s, color 0.3s;
}

.related-list-item {
  padding: 10px;
  border-radius: 5px;
  background-color: #f5f5f5;
  margin: 10px;
  color: var(--theme-text);
  transition: background 0.3s, color 0.3s;
}
</style>

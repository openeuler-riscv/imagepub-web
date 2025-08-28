<template>
  <div class="document-list-container">
    <div class="related-list"  v-if="mdFiles?.length>0" >
      <BoardInfoTitle title="相关文档"></BoardInfoTitle>
      <el-tooltip
        v-for="(it,index) in mdFiles"
        class="box-item"
        effect="dark"
        :content="it[0]?.text"
        placement="top"
      >
         <div @click="showMarkDown(index)" class="related-list-item" >{{it[0]?.text}}</div>
      </el-tooltip>
     
    </div>
    <div class="doc-directory">
      <DocTree :items="tocItems" :onClick="handleDocItemClick" :currentItem="currentDocItem" />
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, nextTick,computed } from "vue";
import DocTree from "@/components/treeNode/DocTree.vue";
import BoardInfoTitle from "@/components/board/BoardInfoTitle.vue";
const props = defineProps({
  markdownContent: {
    type: String,
    required: true,
  },
  docContent:Array
});
const emit = defineEmits(['change-markdown'])

const showMarkDown = (index) =>{
  emit('change-markdown', index)
}


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




/* 监听传入markdown文件列表内容 */
watch(props.docContent, (content)=>{
  if (!content) return;
   if (content && content.length>0) {
      mdFiles.value = content?.map(i=>parseTocFromMarkdown(i)) 
    }
},
  { deep: true, // 若异步数据是对象/数组，需开启深度监听
    immediate: true // 不立即执行（等异步数据返回后再处理）})
  })
  

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
    white-space: nowrap;
  /* 隐藏超出部分 */
  overflow: hidden;
  /* 超出时显示省略号 */
  text-overflow: ellipsis;
  cursor: pointer;
  &:hover {
    background-color: var(--theme-hover); /* Hover background */
  }
}

html.dark{
  .related-list-item {
    background-color: #000;
  }
}
</style>

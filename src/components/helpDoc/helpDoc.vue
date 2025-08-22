<template>
  <div class="help-doc">
    <div class="sidebar" :class="{ 'hidden': isMobile }">
      <helpDocDirectory :markdownContent="markdownContent" />
    </div>

    <!-- 移动端目录按钮 -->
    <button class="sidebar-toggle" v-show="isMobile" @click="toggleMobileSidebar">
      <i class="fa fa-bars"></i>
    </button>

    <!-- 移动端侧边栏 -->
    <div class="sidebar-mobile sidebar-overlay" v-show="isMobile && showMobileSidebar"
      @click="showMobileSidebar = false">
      <helpDocDirectory :markdownContent="markdownContent" />
    </div>

    <div class="markdown-body">
      <div class="board-info-2">
        <BoardInfoTitle name="板卡信息"></BoardInfoTitle>
        <div class="info-detail">
          <div id="board-block">
            <div id="title">厂商名称：</div>
            <div id="content">{{ boardDetail?.vendor?.name }}</div>
          </div>
          <div id="board-block">
            <div id="title">Soc型号：</div>
            <div id="content">{{ boardDetail?.soc?.name }}</div>
          </div>
          <div id="board-block">
            <div id="title">板卡类型:</div>
            <div id="content">{{ boardDetail?.type }}</div>
          </div>
        </div>
      </div>
      <div v-html="parsedMarkdown"></div>
      源文件：{{ markdownURL }}
    </div>
  </div>
</template>

<script setup>
import request from "@/utils/request";
import { ref, onMounted } from "vue";
import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import DOMPurify from "dompurify";
import "github-markdown-css/github-markdown.css";
import "highlight.js/styles/github.css";
import path from "path-browserify";
import helpDocDirectory from "@/components/helpDoc/helpDocDirectory.vue";
import BoardInfoTitle from "@/components/board/BoardInfoTitle.vue";

const baseUrl = ref("");
// 配置marked插件
marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);
marked.setOptions({
  sanitize: true,
  breaks: true,
});

const renderer = new marked.Renderer({
  text(text) {
    console.log(text, "text");
    return he.decode(text);
  },
});

const titleCounts = {};

renderer.heading = function ({ text, depth }) {
  titleCounts[depth] = (titleCounts[depth] || 0) + 1;
  // 生成唯一ID
  let id;
  if (depth === 1) {
    id = `doc-title-${titleCounts[depth]}`;
  } else {
    const parentLevel = depth - 1;
    const parentCount = titleCounts[parentLevel] || 0;
    id = `doc-title-${depth}-${titleCounts[depth]}`;
  }
  return `<h${depth} id=${id} >${text}</h${depth}>`;
};

renderer.image = function (href, title, text) {
  // 处理href可能是对象的情况
  let imageHref = "";
  if (typeof href === "string") {
    imageHref = href;
  } else if (href && typeof href === "object" && href.href) {
    imageHref = href.href;
  } else {
    console.warn("无效的图片链接", href);
    return `<span>[无效的图片链接]</span>`;
  }

  const newHref = path.join(baseUrl.value, imageHref);
  return `<img src="${newHref}" alt="${text}" ${title ? `title="${title}"` : ""}>`;
};

renderer.code = function (code) {
  function htmlUnescape(escapedStr) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`${escapedStr}`, "text/html");
    return doc.body.firstChild.textContent;
  }
  function trimCodeBlock(codestr) {
    const startIndex = codestr.indexOf("\n") + 1;
    const endIndex = codestr.lastIndexOf("\n");
    return codestr.substring(startIndex, endIndex);
  }
  const code2 = htmlUnescape(code.raw).replace("&quot", '"');
  const trimStr = trimCodeBlock(code2);
  return `<pre><code class="language-shell">${trimStr}</code></pre>`;
};

// 设置自定义渲染器
marked.setOptions({
  renderer: renderer,
});

const props = defineProps({
  markdownURL: {
    type: String,
    required: true,
  },
  boardDetail: {
    type: Object,
    required: true,
  },
});
const markdownContent = ref("");
const parsedMarkdown = ref("");

const parseMarkdown = () => {
  if (markdownContent.value) {
    // 重置标题计数器
    for (const key in titleCounts) {
      delete titleCounts[key];
    }

    const htmlContent = marked(markdownContent.value);
    parsedMarkdown.value = DOMPurify.sanitize(htmlContent);
  }
};

const fetchData = async () => {
  try {
    const markdown = await request.get(`/${props.markdownURL}`);
    markdownContent.value = markdown.data;
    parseMarkdown();
  } catch (error) {
    console.error("获取Markdown文件", error);
    markdownContent.value = "无法加载Markdown内容";
    parsedMarkdown.value = "无法加载Markdown内容";
  }
};

onMounted(() => {
  baseUrl.value = path.dirname(`/${props.markdownURL}`);
  fetchData();
});

// 响应式状态
const showMobileSidebar = ref(false);
const isMobile = ref(false);

// 检测屏幕尺寸
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
  if (!isMobile.value) {
    showMobileSidebar.value = false;
  }
};

// 切换移动端侧边栏显示状态
const toggleMobileSidebar = () => {
  showMobileSidebar.value = !showMobileSidebar.value;
};

// 初始化和监听窗口大小变化
onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

</script>

<style scoped>
.help-doc {
  display: flex;
  position: relative;
  background: var(--theme-bg);
  color: var(--theme-text);
  min-height: 100vh;
  transition: background 0.3s, color 0.3s;
}

.sidebar {
  width: 15%;
  min-width: 200px;
  background-color: var(--theme-card);
  padding: 16px;
  border-right: 1px solid var(--theme-border);
  color: var(--theme-text);
  transition: background 0.3s, color 0.3s, border-color 0.3s;
}

.markdown-body {
  flex: 1;
  overflow: auto;
  padding: 16px;
  max-height: 90vh;
  background: var(--theme-card);
  color: var(--theme-text);
  border-radius: 8px;
  transition: background 0.3s, color 0.3s;
}

/* 板卡信息区 */
.board-info-2 {
  margin-top: 24px;
  background: var(--theme-card);
  color: var(--theme-text);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  /* box-shadow: 0 2px 12px 0 var(--theme-shadow); */
}

.info-detail {
  display: flex;
  margin-top: 16px;
}

#title {
  font-size: 14px;
  color: var(--theme-text);
  opacity: 0.7;
}

#content {
  font-size: 15px;
  margin-top: 4px;
  color: var(--theme-text);
}

#board-block {
  width: 33%;
}

/* 滚动条适配主题 */
.markdown-body::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.markdown-body::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}
.markdown-body::-webkit-scrollbar-thumb {
  background: var(--theme-border);
  border-radius: 3px;
}
.markdown-body::-webkit-scrollbar-thumb:hover {
  background: var(--theme-hover);
}

/* Firefox 支持 */
.markdown-body {
  scrollbar-width: thin;
  scrollbar-color: var(--theme-border) transparent;
}

/* IE/Edge 支持 */
.markdown-body {
  -ms-overflow-style: -ms-autohiding-scrollbar;
}

.sidebar-mobile {
  position: absolute;
  right: 0px;
  border-left: 1px solid var(--theme-border);
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  width: 250px;
  z-index: 20;
  transform: translateX(100%);
  animation: slideIn 0.3s forwards;
  background: var(--theme-card);
  color: var(--theme-text);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.sidebar-toggle {
  position: absolute;
  top: -45px;
  right: 20px;
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
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s;
}

.sidebar-toggle:active {
  background-color: var(--el-color-primary-dark);
}

.hidden {
  display: none;
}

@media (max-width: 768px) {
  .sidebar-desktop {
    display: none;
  }
  .content-area {
    padding: 24px;
    padding-top: 80px;
  }
  .markdown-body {
    width: 90vw;
  }
  .help-document {
    flex-direction: column;
  }
}

/* Markdown 内容区域的代码块适配暗黑模式 */
.markdown-body :deep(pre) {
  background-color: var(--theme-code-bg) !important;
  color: var(--theme-code-text) !important;
}

.markdown-body :deep(code) {
  background-color: var(--theme-code-bg) !important; /* Ensure inline code also has dark background if needed */
  color: var(--theme-code-text) !important;
}

/* Adjust specific highlight.js elements if necessary */
.markdown-body :deep(.hljs) {
  background: var(--theme-code-bg) !important;
  color: var(--theme-code-text) !important;
}

.markdown-body :deep(.hljs-addition),
.markdown-body :deep(.hljs-deletion),
.markdown-body :deep(.hljs-doctag),
.markdown-body :deep(.hljs-meta),
.markdown-body :deep(.hljs-selector-attr),
.markdown-body :deep(.hljs-selector-class),
.markdown-body :deep(.hljs-selector-id),
.markdown-body :deep(.hljs-selector-pseudo),
.markdown-body :deep(.hljs-string) {
    color: var(--theme-text-secondary) !important; /* Example: adjust string color */
}

/* You might need to add more rules here for other highlight.js token types
   based on the specific highlighting theme and desired appearance. */
</style>
<template>
  <div class="help-doc">
    <div class="markdown-body">
      <!-- 板卡信息 -->
      <div class="board-info-2">
        <DesriName name="板卡信息"></DesriName>
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

   
      <!-- 这里复用一下我在其他地方的组件 -->
      <!-- 让我封装进去使用 -->
      <helpDocDirectory :markdownContent="markdownContent" />
 
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
import DesriName from "@/components/DesriName.vue";
import helpDocDirectory from "@/components/helpDoc/helpDocDirectory.vue";

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

// 创建一个新的渲染器，继承默认渲染器的所有方法
const renderer = new marked.Renderer({
  text(text) {
    console.log(text, "text");
      return he.decode(text);
    },
});

// 标题计数器，用于生成唯一ID
const titleCounts = {};


renderer.heading = function ({text, depth}) {
 // 为每个级别的标题计数
  titleCounts[depth] = (titleCounts[depth] || 0) + 1;
  // 生成唯一ID
  let id;
  if (depth === 1) {
    id = `doc-title-${titleCounts[depth]}`;
  } else {
    const parentLevel = depth - 1;
    const parentCount = titleCounts[parentLevel] || 0;
    id = `doc-title-${parentCount}-${titleCounts[depth]}`;
  }
  return `<h${depth} id=${id} >${text}</h${depth}>`;
};

// 只覆盖image方法
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
  return `<img src="${newHref}" alt="${text}" ${
    title ? `title="${title}"` : ""
  }>`;
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
const markdownContent=ref("");
const parsedMarkdown = ref("");

const parseMarkdown = () => {
  if (markdownContent.value) {
    // 重置标题计数器
    for (const key in titleCounts) {
      delete titleCounts[key];
    }
    
    const htmlContent = marked(markdownContent.value);
    parsedMarkdown.value = DOMPurify.sanitize(htmlContent).replace('&amp;','&');
  }
};

const fetchData = async () => {
  try {
    const markdown = await request.get(`/public/${props.markdownURL}`);
    markdownContent.value = markdown.data;
    parseMarkdown();
  } catch (error) {
    console.error("获取Markdown文件失败:", error);
    markdownContent.value = "无法加载Markdown内容";
    parsedMarkdown.value = "无法加载Markdown内容";
  }
};

onMounted(() => {
  baseUrl.value = path.dirname(`/public/${props.markdownURL}`);
  fetchData();
});
</script>

<style scoped>
.help-doc {
  position: relative;
}
.markdown-body {
  overflow: auto;
  padding: 16px;
  max-height: 90vh;
}



/* 办卡信息 */
.board-info-2 {

  margin-top: 24px;
  .info-detail {
    display: flex;
    margin-top: 16px;
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
</style>

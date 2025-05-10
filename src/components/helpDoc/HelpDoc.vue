<template>
  <div class="help-doc">
    <div class="sidebar">
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
    const markdown = await request.get(`/public/${props.markdownURL}`);
    markdownContent.value = markdown.data;
    parseMarkdown();
  } catch (error) {
    console.error("获取Markdown文件", error);
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
  display: flex;
  position: relative;
}

.sidebar {
  width: 15%;
  min-width: 200px;
  background-color: #f5f7fa;
  padding: 16px;
  border-right: 1px solid #e6e9ed;
}

.markdown-body {
  flex: 1;
  overflow: auto;
  padding: 16px;
  max-height: 90vh;
}

.board-info-2 {
  margin-top: 24px;
}

.info-detail {
  display: flex;
  margin-top: 16px;
}

#title {
  font-size: 14px;
  color: rgba(102, 102, 102, 1);
}

#content {
  font-size: 15px;
  margin-top: 4px;
  color: #333;
}

#board-block {
  width: 33%;
}

/* 自定义滚动条样式 - 兼容多种浏览器 */
.markdown-body::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.markdown-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.markdown-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.markdown-body::-webkit-scrollbar-thumb:hover {
  background: #e0e0e0;
}

/* Firefox 支持 */
.markdown-body {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

/* IE/Edge 支持 */
.markdown-body {
  -ms-overflow-style: -ms-autohiding-scrollbar;
}
</style>
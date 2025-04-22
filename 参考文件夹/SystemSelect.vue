<script setup>
import "github-markdown-css";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import DocTree from "@/components/DocTree.vue";
const marked = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code) {
      return hljs.highlightAuto(code).value;
      // const language = "plaintext";
      // return hljs.highlight(code, { language }).value;
    },
  })
);

import {
  ref,
  computed,
  defineComponent,
  onMounted,
  watch,
  onUnmounted,
  nextTick,
} from "vue";
import DesriName from "@/components/DesriName.vue";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  itemList: {
    type: Array,
    required: true,
  },
  activeTab: {
    type: String,
  },
});
const emit = defineEmits(["update-index"]);

const currentIndex = computed(() => {
  return props.itemList.findIndex(
    (listItem) => listItem.name === props.item.name
  );
});

const pageIndicator = computed(() => {
  return `${currentIndex.value + 1}/${props.itemList.length}`;
});

const handlePrevClick = () => {
  const newIndex = currentIndex.value - 1;
  if (newIndex >= 0) {
    emit("update-index", newIndex);
  }
};

const handleNextClick = () => {
  const newIndex = currentIndex.value + 1;
  if (newIndex < props.itemList.length) {
    emit("update-index", newIndex);
  }
};
watch(
  () => props.item,
  (newVal) => {
    if (newVal) {
      loadDocs();
      selectedKernel.value = kernelOptions.value[0]?.value || "";
      selectedPackage.value = packageOptions.value[0]?.value || "";
    }
  },
  { deep: true }
);

const selectedItem = ref(null);
const currentImageSuite = computed(() => {
  if (!props.item?.imagesuites) return null;

  return props.item.imagesuites.find((suite) => {
    const kernelMatch =
      `${suite.kernel.type}-${suite.kernel.branch}` === selectedKernel.value;
    const packageMatch =
      String(suite.features).split(",").join(" + ") === selectedPackage.value;
    return kernelMatch && packageMatch;
  });
});

const currentFiles = computed(() => {
  return currentImageSuite.value?.files || [];
});

const handleFileClick = async (index) => {
  selectedItem.value = index;
  // const fileUrl = currentFiles.value[index].url
  // try {
  //     const response = await fetch(fileUrl, { method: 'HEAD' })
  //     if (response.ok) {
  //         return response.headers.get('Content-Length')
  //     }
  //     return null
  // } catch (error) {
  //     console.error('HEAD请求出错：', error)
  //     return null
  // }
};

const handleDownload = async (index) => {
  try {
    const fileUrl = currentFiles.value[index].url;
    if (!fileUrl) {
      console.error("下载链接不存在");
      return;
    }
    const fileName = fileUrl.split("/").pop();
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName || "download";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("下载文件失败：", error);
  }
};

const kernelOptions = computed(() => {
  const allImageSuites = props.item.imagesuites;
  const allKernels = allImageSuites.map((suite) => ({
    value: `${suite.kernel.type}-${suite.kernel.branch}`,
    label: `${suite.kernel.type}-${suite.kernel.branch}`,
    version: suite.kernel.version,
    hasKernelSource: suite.kernel.type === "RVCK",
  }));
  return Array.from(
    allKernels
      .reduce((map, item) => {
        if (!map.has(item.label)) map.set(item.label, item);
        return map;
      }, new Map())
      .values()
  );
});

const packageOptions = computed(() => {
  if (!props.item) return [];
  const allImageSuites = props.item.imagesuites;
  return Array.from(
    new Set(
      allImageSuites.map((suite) =>
        JSON.stringify({
          value: String(suite.features).split(",").join(" + "),
          label: String(suite.features).split(",").join(" + "),
        })
      )
    )
  ).map((str) => JSON.parse(str));
});

const selectedKernel = ref(kernelOptions.value[0]?.value || "");
const selectedPackage = ref(packageOptions.value[0]?.value || "");
const isDropdownOpen = ref(false);
const isPackageDropdownOpen = ref(false);
const currentHoverItem = ref(null);
const currentPackageHoverItem = ref(null);

const handleSelect = (option) => {
  selectedKernel.value = option.value;
  currentHoverItem.value = null;
  isDropdownOpen.value = false;
  selectedItem.value = null;
  loadDocs();
};

const handlePackageSelect = (option) => {
  selectedPackage.value = option.value;
  currentPackageHoverItem.value = null;
  isPackageDropdownOpen.value = false;
  selectedItem.value = null;
  loadDocs();
};

const toggleDropdown = (dropdownType) => {
  if (dropdownType === "kernel") {
    isPackageDropdownOpen.value = false;
    isDropdownOpen.value = !isDropdownOpen.value;
  } else {
    isDropdownOpen.value = false;
    isPackageDropdownOpen.value = !isPackageDropdownOpen.value;
  }
};

const showHelpDialog = ref(false);
const helpMd = ref(null);
const parsedMarkdown = ref("");

const handleHelpClick = () => {
  showHelpDialog.value = true;
};

const handleCloseDialog = () => {
  showHelpDialog.value = false;
};

// 这个是用来存储目录的
const tocItems = ref([]);
const currentDocItem = ref(null); // 代表选中的doc，后面用来作为跟随文档滑动而选中

const handleDocItemClick = (item) => {
  currentDocItem.value = item;
  if (item.id) {
    const element = document.getElementById(item.id);
    if (element) {
      // 先移除滚动监听，不然会展开中间的所有选项
      const dialogContent = document.querySelector(".dialog-wrapper");
      if (dialogContent) {
        dialogContent.removeEventListener("scroll", handleDocScroll);
      }
      element.scrollIntoView({ behavior: "smooth" });
      //这里等待500ms，滚动完成之后再去重新添加监听
      setTimeout(() => {
        if (dialogContent) {
          dialogContent.addEventListener("scroll", handleDocScroll);
        }
      }, 500);
    }
  }
};

const handleDocScroll = () => {
  // 获取文档区域元素，待会儿用他去计算，现在到底滑动到哪个标题了
  const dialogContent = document.querySelector(".dialog-wrapper");
  if (!dialogContent || !tocItems.value || tocItems.value.length === 0) return;

  // 获取所有文档中的标题元素，这里的[id^="doc-title-"]是之前生成的id
  const headings = [...dialogContent.querySelectorAll('[id^="doc-title-"]')];
  if (headings.length === 0) return;

  // 计算每个标题到视口顶部的距离
  const scrollTop = dialogContent.scrollTop;
  let closestHeading = null;
  let closestDistance = Infinity;

  // 找到距离顶部最佳的标题
  headings.forEach((heading) => {
    const distance = Math.abs(heading.offsetTop - scrollTop);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestHeading = heading;
    }
  });
  if (closestHeading) {
    const headingId = closestHeading.id;
    // 这个函数是用来递归搜索的
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

const loadDocs = async () => {
  const currentSuite = currentImageSuite.value;
  const docs = currentSuite?.docs;
  if (docs && docs.length > 0) {
    try {
      const docPath = `/${docs[0]}`;
      const response = await fetch(docPath);
      if (!response.ok) {
        throw new Error("md文档获取失败");
      }
      let markdown = await response.text();

      markdown = markdown.replace(
        /!\[([^\]]*)\]\(\.\/([^)]+)\)/g,
        (match, alt, imgPath) => {
          const basePath = docPath.substring(0, docPath.lastIndexOf("/"));
          return `![${alt}](${basePath}/${imgPath})`;
        }
      );

      // 解析目录
      tocItems.value = parseTocFromMarkdown(markdown);
      // 处理markdown中的标题，添加id属性以便跳转
      markdown = markdown.replace(
        /^(#{1,6})\s+(.+)$/gm,
        (match, hashes, title, offset, originalText) => {
          // 获取标题层级
          const level = hashes.length;
          // 计算该标题在文档中的位置，用于生成ID
          const titlesBefore =
            originalText.slice(0, offset).match(/^#{1,6}\s+.+$/gm) || [];
          // 找到当前层级之前的标题计数
          const titleCountsPerLevel = titlesBefore.reduce((counts, title) => {
            const headLevel = (title.match(/^(#+)/) || [])[1].length;
            counts[headLevel] = (counts[headLevel] || 0) + 1;
            return counts;
          }, {});

          // 计算标题序号
          const currentLevelCount = (titleCountsPerLevel[level] || 0) + 1;
          // 处理父级序号
          const parentLevel = level === 1 ? null : level - 1;
          const parentCount = parentLevel
            ? titleCountsPerLevel[parentLevel] || 0
            : null;

          // 生成ID
          let id;
          if (level === 1) {
            id = `doc-title-${currentLevelCount}`;
          } else {
            id = `doc-title-${parentCount}-${currentLevelCount}`;
          }
          return `${hashes} <span id="${id}">${title}</span>`;
        }
      );

      parsedMarkdown.value = marked.parse(markdown);
      helpMd.value = true;
    } catch (error) {
      console.error("加载文档失败：", error);
      helpMd.value = null;
      parsedMarkdown.value = "";
    }
  } else {
    helpMd.value = null;
  }
};

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
      titleCounts[level] = (titleCounts[level] || 0) + 1;
      // 标题的id是doc-title-level-count，，这里其实应该直接用计数法来生成id的，当时想着子级嵌套，导致后面某些部分处理过程比较复杂
      let id;
      if (level === 1) {
        id = `doc-title-${titleCounts[level]}`;
      } else {
        const parentLevel = level - 1;
        const parentCount = titleCounts[parentLevel] || 0;
        id = `doc-title-${parentCount}-${titleCounts[level]}`;
      }

      const item = {
        level,
        text,
        id,
        children: [],
      };

      // 如果是大标题（即一级标题）后面紧跟着分割线，则创建新的层级
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
        //跳过下面的分割线
        i++;
      } else if (currentSection && level > 1) {
        currentSection.children.push(item);
      } else {
        items.push(item);
      }
    }
  }

  // 对于没有章节的孤立标题，构建它们的层次结构
  const buildSubtree = (items) => {
    //看有没有子标题（后面递归回调到这里）
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

watch(currentIndex, () => {
  loadDocs();
});

const closeDropdowns = (e) => {
  if (!e.target.closest(".select-wrapper")) {
    isDropdownOpen.value = false;
    isPackageDropdownOpen.value = false;
  }
};

onMounted(() => {
  loadDocs();
  document.addEventListener("click", closeDropdowns);
  console.log(packageOptions.value, "我是选项");

  // 等文档加载完成后添加滚动监听
  nextTick(() => {
    const dialogContent = document.querySelector(".dialog-wrapper");
    if (dialogContent) {
      dialogContent.addEventListener("scroll", handleDocScroll);
    }
  });
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdowns);

  // 移除滚动监听
  const dialogContent = document.querySelector(".dialog-wrapper");
  if (dialogContent) {
    dialogContent.removeEventListener("scroll", handleDocScroll);
  }
});

watch(showHelpDialog, (newVal) => {
  nextTick(() => {
    if (newVal) {
      // 对话框打开，添加滚动监听
      const dialogContent = document.querySelector(".dialog-wrapper");
      if (dialogContent) {
        dialogContent.addEventListener("scroll", handleDocScroll);
      }
    } else {
      // 对话框关闭，移除滚动监听
      const dialogContent = document.querySelector(".dialog-wrapper");
      if (dialogContent) {
        dialogContent.removeEventListener("scroll", handleDocScroll);
      }
    }
  });
});

defineComponent({
  helpMd,
});
const getFileName = (url) => {
  return url.split("/").pop();
};
</script>

<template>
  <div class="system-select">
    <div class="sys-wrapper">
      <div class="select-title">
        <div class="title-text">
          {{ props.activeTab }} {{ props.item.name }}
        </div>
      </div>
      <div class="select-content">
        <div class="select-drop">
          <div class="select-row">
            <div class="select-label">内核版本:</div>
            <div class="select-box">
              <div class="select-wrapper">
                <div
                  class="custom-select"
                  @click.stop="toggleDropdown('kernel')"
                >
                  <div class="selected-value">
                    {{
                      kernelOptions.find((opt) => opt.value === selectedKernel)
                        ?.label || kernelOptions[0].label
                    }}
                    <span
                      v-if="
                        kernelOptions.find(
                          (opt) => opt.value === selectedKernel
                        )?.hasKernelSource
                      "
                      class="kernel-source-tag"
                      >内核同源</span
                    >
                  </div>
                  <img
                    src="../assets/icons/board/Group 85@3x.svg"
                    alt="dropdown"
                    class="dropdown-icon"
                    :class="{ rotated: isDropdownOpen }"
                  />
                </div>
                <div
                  v-show="isDropdownOpen"
                  class="dropdown-menu"
                >
                  <div
                    v-for="option in kernelOptions"
                    :key="option.value"
                    class="dropdown-item"
                    :class="{ selected: option.value === currentHoverItem }"
                    @mouseenter="currentHoverItem = option.value"
                    @mouseleave="currentHoverItem = null"
                    @click="handleSelect(option)"
                  >
                    <div class="option-content">
                      <span class="option-label">{{ option.label }}</span>

                      <span
                        v-if="option.hasKernelSource"
                        class="kernel-source-tag"
                        >内核同源</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="select-row"
            v-show="packageOptions[0].value !== ''"
          >
            <div class="select-label">镜像特性:</div>
            <div class="select-box">
              <div class="select-wrapper">
                <div
                  class="custom-select"
                  @click.stop="toggleDropdown('package')"
                >
                  <div class="selected-value">
                    {{
                      packageOptions.find(
                        (opt) => opt.value === selectedPackage
                      )?.label || packageOptions[0].label
                    }}
                  </div>
                  <img
                    src="../assets/icons/board/Group 85@3x.svg"
                    alt="dropdown"
                    class="dropdown-icon"
                    :class="{ rotated: isPackageDropdownOpen }"
                  />
                </div>
                <div
                  v-show="isPackageDropdownOpen"
                  class="dropdown-menu"
                >
                  <div
                    v-for="option in packageOptions"
                    :key="option.value"
                    class="dropdown-item"
                    :class="{
                      selected: option.value === currentPackageHoverItem,
                    }"
                    @mouseenter="currentPackageHoverItem = option.value"
                    @mouseleave="currentPackageHoverItem = null"
                    @click="handlePackageSelect(option)"
                  >
                    <div class="option-content">
                      <span class="option-label">{{ option.label }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="file-list">
          <a
            class="file-item"
            v-for="(item, index) in currentFiles"
            :key="index"
            :class="{ active: selectedItem === index }"
            @click="handleFileClick(index)"
            :href="item.url"
          >
            <div class="file-name">{{ getFileName(item.url) }}</div>
            <div class="file-info">
              <span class="file-size"></span>
              <span
                class="download-btn"
                @click.stop="handleDownload(index)"
              >
                点击下载
              </span>
            </div>
          </a>
        </div>

        <div class="button-area">
          <div class="help-btn">
            <div
              class="btn-border"
              @click="handleHelpClick"
            >
              查看帮助文档
            </div>
          </div>
          <div class="pagination">
            <span class="page-indicator">{{ pageIndicator }}</span>
            <button
              class="prev-btn"
              @click="handlePrevClick"
            >
              ←
            </button>

            <button
              class="next-btn"
              @click="handleNextClick"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    class="help-dialog"
    v-if="showHelpDialog"
    @click.self="handleCloseDialog"
  >
    <div
      class="dialog-content"
      style="
        padding: 12px 0 12px 12px;
        width: 15em;
        height: auto;
        margin-right: 1em;
        align-self: flex-start;
        margin-top: 5vh;
      "
    >
      <!-- 这里是文档的目录显示，写内联样式是为了替换掉dialog-content的样式和复用动画 -->
      <DocTree
        :items="tocItems"
        :onClick="handleDocItemClick"
        :currentItem="currentDocItem"
      />
    </div>

    <div class="dialog-content">
      <div class="dialog-wrapper">
        <DesriName :name="props.activeTab + ' ' + props.item.name" />
        <div class="selectedGroup">
          <div class="version">
            <div class="label">内核版本：</div>
            <div class="value">{{ selectedKernel }}</div>
          </div>
          <div class="package">
            <div class="label">镜像特性：</div>
            <div class="value">{{ selectedPackage }}</div>
          </div>
        </div>
        <div id="file-list">
          <a
            class="file-item"
            v-for="(item, index) in currentFiles"
            :key="index"
            @click="handleFileClick(index)"
            :href="item.url"
          >
            <div class="file-name">{{ getFileName(item.url) }}</div>
            <div class="file-info">
              <span
                class="download-btn"
                @click.stop="handleDownload(index)"
              >
                点击下载
              </span>
            </div>
          </a>
        </div>
        <div class="upload-area">
          <div
            class="upload-text"
            v-if="helpMd"
          >
            <div
              class="markdown-body"
              v-html="parsedMarkdown"
            ></div>
          </div>
          <div v-else>暂无文档</div>
        </div>

        <div class="description">
          <div class="desc-title">板卡说明：</div>
          <div class="desc-content">
            {{
              props.item.imagesuites[currentIndex.value]?.comment
                ? props.item.imagesuites[currentIndex.value].comment
                : "暂无说明"
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$primary-blue: #012fa6;
$secondary-blue: #4a77ca;
$light-blue: #789edb;
$border-color: #f1faff;

.system-select {
  width: 90%;
  margin: 20px auto;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #f1faff;
  padding: 32px 0 32px 32px;

  .sys-wrapper {
    overflow-y: auto;
    padding-right: 16px;
    box-sizing: border-box;
    &::-webkit-scrollbar {
      width: 12px;
      background: transparent;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #e5e5e5;
      border-radius: 4px;
      border: 2px solid #ffffff;
      background-clip: padding-box;
    }
    .select-title {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      .title-text {
        font-size: 20px;
        color: #333;
        font-weight: 500;
        margin-right: 16px;
      }

      .title-line {
        flex: 1;
        height: 1px;
        background: #e5e5e5;
      }
    }

    .select-content {
      .select-drop {
        display: flex;
        gap: 16px;

        .select-row {
          display: flex;
          flex-direction: column;

          .select-label {
            min-width: 128px;
            font-size: 16px;
            color: #666;
          }

          .select-box {
            position: relative;
            display: flex;
            align-items: center;
            margin-top: 10px;

            .select-wrapper {
              position: relative;
              display: flex;
              align-items: center;

              .kernel-source-tag {
                display: inline-block;
                padding: 3px 10px;
                background-color: #3459b8;
                color: #ffffff;
                border-radius: 6px;
                font-size: 13px;
                margin-left: 10px;
              }
            }

            select {
              min-width: 224px;
              width: auto;
              height: 33px;
              border: 1px solid #e5e5e5;
              border-radius: 8px;
              padding: 0 64px 0 16px;
              font-size: 16px;
              color: #333;
              outline: none;
              appearance: none;
              -webkit-appearance: none;
              -moz-appearance: none;
              background: transparent;
              box-sizing: border-box;
              cursor: pointer;

              &:focus {
                border-color: $secondary-blue;
              }

              option {
                padding: 16px;
                background: #ffffff;

                &:checked {
                  background: #e6f7ff;
                  color: #333;
                }

                &:hover {
                  background: #e6f7ff;
                }
              }
            }

            .dropdown-icon {
              position: absolute;
              right: 16px;
              top: 50%;
              transform: translateY(-50%);
              width: 19px;
              height: 19px;
              pointer-events: none;
              transition: transform 0.3s ease;

              &.rotated {
                transform: translateY(-50%) rotate(180deg);
              }
            }
          }
        }
      }
      #file-list {
        margin-top: 16px;
        padding-right: 16px;
        a {
          text-decoration: none;
        }

        .file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #f5f5f5;
          margin-top: 6px;
          border-radius: 6px;
          padding: 13px 19px;
          box-sizing: border-box;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:first-child {
            margin-top: 0;
          }

          .file-name {
            font-size: 16px;
            color: #333;
            flex: 1;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .file-size {
            font-size: 16px;
            color: #666;
            margin-left: 32px;
          }

          .file-info {
            display: flex;
            align-items: center;
            gap: 16px;

            .download-btn {
              display: none;
              color: white;
              font-size: 16px;
              cursor: pointer;
              white-space: nowrap;
            }
          }

          &:hover {
            background-color: #466edb;
            color: white;

            .file-name,
            .file-size {
              color: white;
            }

            .download-btn {
              display: inline-block;
            }
          }
        }
      }
      .button-area {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 24px;

        .pagination {
          display: flex;
          justify-content: flex-end;
          align-items: flex-end;
          gap: 16px;

          button {
            width: 56px;
            height: 40px;
            border: 2px solid $primary-blue;
            border-radius: 8px;
            background: #ffffff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6px;
            color: $primary-blue;
            font-size: 32px;
            font-weight: 600;

            &:hover {
              border-color: $secondary-blue;
              color: $secondary-blue;
            }
          }

          .page-indicator {
            font-size: 16px;
            color: #666;

            min-width: 32px;
            text-align: right;
            height: 32px;
            line-height: 32px;
          }
        }

        .help-btn {
          margin-top: 3px;

          .btn-border {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 180px;
            height: 40px;
            border: 2px solid $primary-blue;
            border-radius: 10px;
            color: $primary-blue;
            font-size: 20px;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background: rgba(1, 47, 166, 0.1);
            }
          }
        }
      }
    }
  }
}

select:focus {
  option {
    padding: 16px;

    &:checked {
      background: #e6f7ff;
      color: #333;
    }
  }
}

.help-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .dialog-content {
    width: 60em;
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 4.16px 8px rgba(0, 0, 0, 0.15);
    position: relative;
    animation: dialogFadeIn 0.3s ease;
    padding: 24px 0 24px 48px;
    .dialog-wrapper {
      max-height: 90vh;
      overflow-y: auto;
      padding-right: 48px;
      box-sizing: border-box;
      scrollbar-width: thin;
      scrollbar-color: #e5e5e5 transparent;
      &::-webkit-scrollbar {
        background: transparent;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
        margin: 20px 0;
      }

      &::-webkit-scrollbar-thumb {
        background: #e5e5e5;
        border-radius: 4px;
        border: 2px solid #ffffff;
        background-clip: padding-box;
      }
      #file-list {
        margin-top: 16px;
        padding-right: 16px;
        max-height: 213px;
        overflow-y: auto;
        a {
          text-decoration: none;
        }
        &::-webkit-scrollbar {
          width: 8px;
          border-radius: 20px;
        }

        &::-webkit-scrollbar-track {
          background: transparent;
        }

        &::-webkit-scrollbar-thumb {
          background: #e5e5e5;
          border-radius: 4px;
        }

        .file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #f5f5f5;
          margin-top: 6px;
          border-radius: 6px;
          padding: 13px 19px;
          box-sizing: border-box;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:first-child {
            margin-top: 0;
          }

          .file-name {
            font-size: 16px;
            color: #333;
            flex: 1;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .file-size {
            font-size: 16px;
            color: #666;
            margin-left: 32px;
          }

          .file-info {
            display: flex;
            align-items: center;
            gap: 16px;

            .download-btn {
              display: none;
              color: white;
              font-size: 16px;
              cursor: pointer;
              white-space: nowrap;
            }
          }

          &:hover {
            background-color: #466edb;
            color: white;

            .file-name,
            .file-size {
              color: white;
            }

            .download-btn {
              display: inline-block;
            }
          }
        }
      }

      .selectedGroup {
        display: flex;
        gap: 64px;
        margin-top: 32px;

        .version,
        .package {
          display: flex;

          flex-direction: column;
          justify-content: flex-start;

          .label {
            font-size: 16px;
            color: #666666;
          }

          .value {
            font-size: 16px;
            color: #333333;
            margin-top: 6px;
          }
        }
      }

      .help-file-list {
        margin-top: 32px;

        .file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #f5f5f5;
          margin-top: 6px;
          border-radius: 6px;
          padding: 13px 19px;
          box-sizing: border-box;
          font-size: 16px;

          .file-name {
            font-size: 16px;
            color: #333333;
            flex: 1;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .file-size {
            font-size: 16px;
            color: #666666;
            margin-left: 32px;
          }
        }
      }

      .upload-area {
        width: 100%;
        min-height: 50vh;
        background: #f5f5f5;
        margin-top: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;

        .upload-text {
          max-height: 100%;
          width: 100%;
        }
      }

      .description {
        margin-top: 24px;

        .desc-title {
          font-size: 16px;
          color: #666666;
          margin-bottom: 16px;
        }

        .desc-content {
          font-size: 16px;
          color: #333333;
        }
      }
    }
  }
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: translateY(-32px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-select {
  min-width: 224px;
  width: auto;
  height: 33px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 0 64px 0 16px;
  font-size: 16px;
  color: #333;
  background-color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
  box-sizing: border-box;

  .selected-value {
    display: flex;
    align-items: center;
  }

  &:hover {
    border-color: $primary-blue;
  }
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  margin-top: 6px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 6px;
  box-sizing: border-box;
}

.dropdown-item {
  padding: 10px;
  cursor: pointer;
  box-sizing: border-box;

  &:hover {
    background: #e8f2ff;
    border-radius: 10px;
  }

  &.selected {
    background: #e8f2ff;
  }

  .option-content {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .option-label {
    font-size: 16px;
    color: #333;
  }
}

.markdown-body {
  font-size: 15px !important;
  padding: 20px 0 0 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

:deep(.markdown-body) {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 32px;
    margin-bottom: 16px;
    font-size: 16px;
  }

  p {
    margin: 16px 0;
  }

  code {
    background-color: #f6f8fa;
    padding: 6px 13px;
    border-radius: 3px;
  }

  pre {
    background-color: #f6f8fa;
    padding: 32px;
    border-radius: 6px;
    overflow-x: auto;
  }
  ul {
    list-style-type: disc;
  }
}
</style>

<template>
  <div class="component-container">
    <div v-if="childImageData && childImageData.length > 0" class="version-list">
        <div v-for="(v, index) in childImageData" :key="index" class="version-card" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
          <div class="version-des">{{ props.title }}</div>
          <div class="vs-first" @click="handleActionClick(v.imagesuiteIndex,0)">
            <div class="vs-label">
              <div class="vs-title">
                <img v-if="isDark"  src="@/assets/icons/board/versiondark.svg" style="margin-right:4px" />
                <img v-else src="@/assets/icons/board/version.svg" style="margin-right:4px"/>
                <span>{{t('version')}}</span>
              </div>
              <div class="version-number">{{  props.title + '  '+ v.version[0].date }}</div>
            </div>
            <div class="vs-label">
              <div class="vs-title">
                 <img v-if="isDark"  src="@/assets/icons/board/logdark.svg" style="margin-right:4px" />
                <img v-else src="@/assets/icons/board/log.svg" style="margin-right:4px"/>
                <span>{{t('changeLog')}}</span>
              </div>
              <div class="version-number changelog-content">  {{ v.version[0].changelog || '无变更说明' }}</div>
            </div>
          </div>

          <div class="vs-more"  @click="toggleArrow(index)">
            <img 
              width="10"
              height="10"
              style="margin-right:4px"
              :src="v.isExpanded ? isDark ?upArrowDark :upArrow : isDark?downArrowDark : downArrow" 
              alt="箭头图标" 
              class="arrow-icon"
            >
            <div>{{t('allversion')}}</div>
          </div>

          <div v-if="v.isExpanded">
            <SingleTable :jump-image="handleActionClick" :imagesuiteIndex="v.imagesuiteIndex" :tabledata="v?.version?.map((k,i)=>({...k,index:i}))" :title="props.title" >

            </SingleTable>
          </div>
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { ref, watch } from 'vue';
import upArrow from '@/assets/icons/board/up.svg'
import upArrowDark from '@/assets/icons/board/upDark.svg'
import downArrow from '@/assets/icons/board/down.svg'
import downArrowDark from '@/assets/icons/board/downDark.svg'

import SingleTable from '@/components/board/SingleTable.vue'
import { useDarkModeStore } from '@/store/darkMode'
import { storeToRefs } from 'pinia'

const store = useDarkModeStore()
const { isDark } = storeToRefs(store)

const { t } = useI18n()
// 子组件内部维护一份独立的数据（深拷贝）
const childImageData = ref([]);

const props = defineProps({
  title: String,
  description: String,
  historyVersions: {
    type: Array,
    default: () => []
  },
  openImage: Function,
});


const toggleArrow = (Index) =>{
  childImageData.value[Index].isExpanded = !childImageData.value[Index].isExpanded
}


// 初始化时深拷贝父组件数据
watch(
  () => props.historyVersions,
  (newVal) => {
    // 深拷贝确保引用彻底断开
    childImageData.value = JSON.parse(JSON.stringify(newVal));
  },
  { immediate: true } // 立即执行一次
);

/* 点击跳转镜像页面 */
const handleActionClick = async (imageIndex,visionIndex) => {
  console.log(imageIndex,visionIndex)
  await props.openImage(imageIndex,visionIndex);
}

</script>

<style scoped lang="scss">
/* 添加暗黑模式变量 */
:root {
  --theme-border: #e9ecef;
  --theme-card: #ffffff;
  --theme-text: #333333;
  --theme-text-secondary: #777777;
  --theme-hover-bg: rgba(1, 47, 166, 0.1);
  --theme-hover-color: #012fa6;
  --theme-gradient-end-color: var(--theme-card); // 渐变结束颜色与卡片背景一致
}

.version-des{
  color:#000;
  font-size: 16px;
}

.vs-first{
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-top: 16px;
  padding:16px;
  &:hover{
    background-color: #e6eaf6;
  }
}

.vs-more{
  display: flex;
  align-items: center;
  justify-content: center;
  color:#012fa6;
  font-size: 14px;
  margin:12px auto
}

.vs-title{
  font-size: 14px;
  color:#666;
  width:100px;
  display: flex;
  align-items: center;
  font-weight: 400;
}

.vs-label{
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.version-number{
  font-size: 14px;
  color:#333
}

/* 暗黑模式变量 */
html.dark {
  --theme-border: #4c4d4f;
  --theme-card: #2b2b2b;
  --theme-text: #e5eaf3;
  --theme-text-secondary: #a8abb2;
  --theme-hover-bg: rgba(64, 158, 255, 0.1);
  --theme-hover-color: #409eff;
  --theme-gradient-end-color: var(--theme-card); // 渐变结束颜色与卡片背景一致
}

.component-container {
  padding: 20px 0px;
  border-radius: 8px;
}

.version-list {
  display: grid;
  grid-template-columns: 1fr;
  align-items: start;
  gap: 16px;
  transition: box-shadow 0.3s ease;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1440px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (min-width: 2400px) {
    grid-template-columns: repeat(5, 1fr);
  }
}

.version-card {
  background-color: var(--theme-card);
  border-radius: 20px;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 -1px 2px rgba(0, 0, 0, 0.05);
  padding: 16px;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  cursor: pointer;
  border: 1px solid var(--theme-border);
  font-weight: 400;
  display: inline-block;

  &:hover {
    box-shadow:
      0 4px 8px rgba(0, 0, 0, 0.15),
      0 -1px 2px rgba(0, 0, 0, 0.05);
    transform: translateY(-4px);
  }

  .title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
    color: var(--theme-text);
  }

  .changelog-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--theme-text);
    margin-bottom: 6px;
  }

  .changelog-content {
    font-size: 14px;
    font-weight: 400;
    white-space: normal;
  /* 限制最大高度为两行文字高度 (根据实际行高调整) */
      max-height: 2.4em; /* 假设行高是 1.2em */
      /* 隐藏超出部分 */
      overflow: hidden;
      /* 显示省略号 */
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2; /* 显示 2 行 */
      -webkit-box-orient: vertical;
    }

  .description {
    font-size: 14px;
    color: var(--theme-text-secondary);
    opacity: 0.7;
    margin-bottom: 20px;
  }

  /* 在容器末尾添加渐变遮罩和省略号 */
  /* .changelog-content::after {
    content: "...";
    position: absolute;
    bottom: 0;
    right: 0;
    padding-left: 40px;
    background: linear-gradient(to right, transparent, var(--theme-gradient-end-color) 70%);
    pointer-events: none;
  } */
}

:deep(.el-table__body tr:hover) {
  background-color: var(--theme-hover-bg) !important;
  color: var(--theme-text) !important;
  transition: background 0.3s, color 0.3s;
}

/* 表格头部、边框等也可适配 */
:deep(.el-table) {
  background: var(--theme-card) !important;
  color: var(--theme-text) !important;
  border-color: var(--theme-border) !important;
}

:deep(.el-table th) {
  background: var(--theme-card) !important;
  color: var(--theme-text) !important;
  border-color: var(--theme-border) !important;
}

:deep(.el-table td) {
  background: var(--theme-card) !important;
  color: var(--theme-text) !important;
  border-color: var(--theme-border) !important;
}
</style>
<template>
  <div class="component-container">
    <div v-if="props.historyVersions && props.historyVersions.length > 0" class="version-list">
      <div v-for="(version, index) in props.historyVersions" :key="index" class="version-card"
           @click="handleActionClick(version)" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
        <div class="version-header">
          <div class="version-number">v{{ version.version }}</div>
          <div class="release-date">{{ version.releaseDate }}</div>
        </div>

        <div class="changelog-title">{{t('changeLog')}}</div>
        <div class="changelog-content">
          {{ version.changelog || '无变更说明' }}
        </div>
      </div>
    </div>

  </div>
</template>


<script setup>
import {useI18n} from "vue-i18n";

const {t} = useI18n()
const props = defineProps({
  title: String,
  description: String,
  historyVersions: {
    type: Array,
    default: () => []
  },
  openImage: Function,
});

const handleActionClick = async (row) => {
  await props.openImage(row);
};

</script>

<style scoped lang="scss">
.component-container {
  padding: 20px;
  border-radius: 8px;
}

.version-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  border: 1px solid var(--theme-border);
  background: var(--theme-card);
  color: var(--theme-text);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  transition: background 0.3s, color 0.3s, border-color 0.3s;

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
  border-radius: 8px;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 -1px 2px rgba(0, 0, 0, 0.05);
  padding: 16px;
  transition: box-shadow 0.3s ease;
  cursor: pointer;
  border: 1px solid white;

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

  .version-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 13px 5px;
    height: 40px;
    border-bottom: 2px solid var(--theme-border);
    position: relative;

    .version-number {
      font-size: 18px;
      font-weight: 600;
      color: var(--theme-text);
    }

    .release-date {
      font-size: 11px;
      color: var(--theme-text);
      position: absolute;
      bottom: 3px;
      right: 8px;
    }
  }

  .changelog-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--theme-text);
    margin-bottom: 6px;
  }

  .changelog-content {
    font-size: 13px;
    color: var(--theme-text);
    padding: 0 5px;
    font-weight: 400;
    height: 150px;
    overflow: hidden;
    position: relative;

    /* 允许文本换行 */
    white-space: pre-wrap;
    word-break: break-word;
  }

  .description {
    font-size: 14px;
    color: var(--theme-text);
    opacity: 0.7;
    margin-bottom: 20px;
  }

  /* 在容器末尾添加渐变遮罩和省略号 */
  .changelog-content::after {
    content: "...";
    position: absolute;
    bottom: 0;
    right: 0;
    padding-left: 40px;
    background: linear-gradient(to right, transparent, var(--theme-card) 70%);
    pointer-events: none;
  }
}

.el-table__body tr:hover {
  background-color: var(--theme-hover) !important;
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
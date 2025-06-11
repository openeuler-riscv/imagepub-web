<template>
  <div class="empty-content" :style="customStyle">
    <el-icon class="empty-icon">
      <DocumentRemove />
    </el-icon>
    <slot>{{ i18nKey ? t(i18nKey) : '暂无相关内容' }}</slot>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import { DocumentRemove } from '@element-plus/icons-vue';

const props = defineProps({
  customStyle: {
    type: String,
    default: 'text-align:center;padding:40px 0;color:#999;font-size:18px;'
  },
  i18nKey: {
    type: String,
    default: ''
  }
});
const { t } = useI18n();
</script>

<style scoped>
.empty-content {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.empty-icon {
  font-size: 24px;
  color: #c0c4cc;
}
</style>
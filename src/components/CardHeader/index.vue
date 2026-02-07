<template>
  <div class="card-header-wrapper">
    <div class="title-section">
      <span class="decorator-line"></span>
      <span class="title-text">{{ displayTitle }}</span>
    </div>
    
    <div class="action-section">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    default: ''
  }
})

const route = useRoute()
onMounted(() => {
    // 💡 打印当前页面捕获到的路由元信息
    console.log('🔍 CardHeader 捕获到的当前路由 meta:', route.meta)
    console.log('🚩 最终显示的标题将是:', props.title || route.meta.title)
})
// 逻辑：如果组件标签上没写 title="xxx"，就自动去路由表里找当前菜单的名字
const displayTitle = computed(() => {
  return props.title || route.meta.title || '模块标题'
})
</script>

<style scoped>
.card-header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* 这里的边距根据 el-card 的 padding 进行了微调，确保对齐 */
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f2f5; /* 增加一条浅浅的分割线，更有质感 */
  margin-bottom: 18px;
}

.title-section {
  display: flex;
  align-items: center;
}

.decorator-line {
  width: 4px;
  height: 16px;
  background-color: #409eff;
  border-radius: 2px;
  margin-right: 8px;
}

.title-text {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.action-section {
  display: flex;
  gap: 10px; /* 按钮之间的间距 */
}
</style>
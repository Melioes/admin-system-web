<template>
  <el-aside :width="isCollapse ? '64px' : '230px'" class="aside-container">
    <div class="logo">
      <div class="logo-box">
        <span class="logo-text">{{ isCollapse ? 'M' : 'MEMBER SYSTEM' }}</span>
      </div>
    </div>

    <el-menu
      :default-active="$route.path"
      router
      :collapse="isCollapse"
      class="sidebar-menu"
      :collapse-transition="false"
      unique-opened
    >
      <template v-for="item in userStore.menuList" :key="item.id">
        
        <el-sub-menu v-if="item.children && item.children.length > 0" :index="String(item.id)">
          <template #title>
            <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </template>

          <el-menu-item 
            v-for="child in item.children" 
            :key="child.id" 
            :index="child.path"
          >
            <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
            <span>{{ child.title }}</span>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item v-else :index="item.path">
          <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>

      </template>
    </el-menu>
  </el-aside>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/user'

const isCollapse = ref(false)
const userStore = useUserStore()
</script>

<style scoped>
/* 容器布局：改用纯白色底色 */
.aside-container {
  background-color: #ffffff;
  height: 100vh;
  border-right: 1px solid #f0f0f0;
  transition: width 0.3s cubic-bezier(.645, .045, .355, 1);
  display: flex;
  flex-direction: column;
}

/* Logo 样式：文字渐变效果，更有科技感 */
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #f5f5f5;
}
.logo-box {
  background: linear-gradient(135deg, #409EFF 0%, #0056b3 100%);
  padding: 4px 12px;
  border-radius: 6px;
}
.logo-text {
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1px;
  white-space: nowrap;
}

/* 菜单基础样式 */
.sidebar-menu {
  border-right: none;
  background-color: transparent;
  padding-top: 10px;
}

/* 菜单项基础样式：深灰文字，圆角间距 */
:deep(.el-menu-item), :deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
  margin: 4px 12px !important;
  border-radius: 8px;
  color: #606266 !important; /* 中性灰 */
}

/* 悬浮状态：浅蓝背景 */
:deep(.el-menu-item:hover), :deep(.el-sub-menu__title:hover) {
  color: #409EFF !important;
  background-color: #f5f7fa !important;
}

/* 💡 激活（选中）态样式：呼吸感背景 + 右侧微点缀 */
:deep(.el-menu-item.is-active) {
  color: #409EFF !important;
  background-color: #ecf5ff !important;
  font-weight: 600;
}

/* 子菜单展开后的背景色（淡雅区分） */
:deep(.el-menu--inline) {
  background-color: #fafafa !important;
}

/* 图标颜色调整 */
.el-icon {
  font-size: 18px;
  margin-right: 10px;
  transition: transform 0.3s;
}

/* 选中时图标稍微放大一点点，增加动感 */
:deep(.el-menu-item.is-active .el-icon) {
  transform: scale(1.1);
}
</style>
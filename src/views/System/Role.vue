<script setup>
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const handleAction = () => {
  // 直接通过 userStore.token 访问
  console.log('当前的 Token 是:', userStore.token)
  
  if (!userStore.token) {
    console.warn('当前未登录，请先登录')
  }
}
</script>

<template>
  <div>
    <p>我的令牌: {{ userStore.token }}</p>
    <el-button @click="handleAction">打印Token</el-button>
    <h1>角色管理页面</h1>
  </div>
</template>
<template>
  <el-header class="header">
    <div class="header-content">
      <span class="title">用户管理后台</span>
      <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
    </div>
  </el-header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  userStore.removeToken()
  router.push('/login')
}
</script>
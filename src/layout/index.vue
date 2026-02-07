<template>
  <el-container class="app-wrapper">
    <Sidebar />

    <el-container direction="vertical">
      <Header />

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import Sidebar from '@/components/Sidebar/index.vue'
import Header from '@/components/Header/index.vue'
</script>

<style scoped>
.app-wrapper {
  height: 100vh;
  width: 100%;
}
</style>
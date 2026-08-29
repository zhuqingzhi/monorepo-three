<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <el-container class="layout">
    <el-header class="header">
      <div class="brand">Vue3 + Three.js Monorepo</div>
      <el-menu mode="horizontal" router :default-active="route.path" class="menu">
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/demo">Three.js Demo</el-menu-item>
      </el-menu>
    </el-header>
    <el-main class="main">
      <router-view />
    </el-main>
  </el-container>
</template>

<style scoped>
.layout {
  height: 100%;
}

.header {
  display: flex;
  align-items: center;
  gap: 24px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.brand {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.menu {
  flex: 1;
  border-bottom: none;
}

.main {
  padding: 0;
}
</style>

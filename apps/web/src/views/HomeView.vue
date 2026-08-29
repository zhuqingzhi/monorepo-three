<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import { useCounterStore } from '@/stores/counter';

const router = useRouter();
const counter = useCounterStore();
const { count, doubleCount } = storeToRefs(counter);

const techStack = [
  'Vue 3',
  'TypeScript',
  'Vite 7',
  'Pinia',
  'Vue Router',
  'Element Plus',
  'Three.js',
];

function goDemo() {
  router.push('/demo');
}
</script>

<template>
  <div class="home">
    <el-card class="card">
      <template #header>
        <span>项目说明</span>
      </template>
      <p>
        这是一个 pnpm monorepo 项目：前端为 Vue3 + Three.js 应用（端口 8080）， 后端为 NestJS
        服务（端口 1024，连接 MySQL / Redis / MinIO）。
      </p>
      <el-space wrap>
        <el-tag v-for="item in techStack" :key="item" type="info">{{ item }}</el-tag>
      </el-space>
      <div class="actions">
        <el-button type="primary" @click="goDemo">进入 Three.js Demo（旋转方块）</el-button>
        <el-button @click="counter.increment()">
          Pinia 计数器：{{ count }}（x2 = {{ doubleCount }}）
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.home {
  padding: 24px;
}

.card {
  max-width: 720px;
}

.actions {
  margin-top: 16px;
}
</style>

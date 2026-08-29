<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as THREE from 'three';

import type { AnimationHandle } from '@/types/demo';

const containerRef = ref<HTMLDivElement | null>(null);
const rotationSpeed = ref(1);
const cubeColor = ref('#409eff');

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let cube: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> | null = null;
let resizeObserver: ResizeObserver | null = null;
const animation: AnimationHandle = { frameId: null };

function initScene() {
  const container = containerRef.value;
  if (!container) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color('#0f172a');

  camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / Math.max(container.clientHeight, 1),
    0.1,
    100,
  );
  camera.position.set(3.2, 2.6, 4.2);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // 灯光
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const directional = new THREE.DirectionalLight(0xffffff, 2);
  directional.position.set(5, 6, 4);
  scene.add(directional);

  // 旋转方块
  cube = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.6, 1.6),
    new THREE.MeshStandardMaterial({
      color: cubeColor.value,
      metalness: 0.35,
      roughness: 0.3,
    }),
  );
  scene.add(cube);

  // 地面网格辅助线
  const grid = new THREE.GridHelper(12, 12, 0x334155, 0x1e293b);
  grid.position.y = -1;
  scene.add(grid);

  animate();
}

function animate() {
  animation.frameId = requestAnimationFrame(animate);
  if (!cube || !renderer || !scene || !camera) return;
  cube.rotation.x += 0.01 * rotationSpeed.value;
  cube.rotation.y += 0.014 * rotationSpeed.value;
  renderer.render(scene, camera);
}

function handleResize() {
  const container = containerRef.value;
  if (!container || !renderer || !camera) return;
  const width = container.clientWidth;
  const height = Math.max(container.clientHeight, 1);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

watch(cubeColor, (value) => {
  cube?.material.color.set(value);
});

onMounted(() => {
  initScene();
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  if (animation.frameId !== null) cancelAnimationFrame(animation.frameId);
  animation.frameId = null;
  resizeObserver?.disconnect();
  resizeObserver = null;
  if (cube) {
    cube.geometry.dispose();
    cube.material.dispose();
    cube = null;
  }
  renderer?.dispose();
  renderer?.domElement.remove();
  renderer = null;
  scene = null;
});
</script>

<template>
  <div class="demo">
    <div ref="containerRef" class="canvas-wrap"></div>
    <el-card class="panel" shadow="always">
      <template #header>
        <span>控制面板</span>
      </template>
      <div class="row">
        <span class="label">旋转速度</span>
        <el-slider v-model="rotationSpeed" :min="0" :max="5" :step="0.1" class="slider" />
      </div>
      <div class="row">
        <span class="label">方块颜色</span>
        <el-color-picker v-model="cubeColor" />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.demo {
  position: relative;
  width: 100%;
  height: 100%;
}

.canvas-wrap {
  position: absolute;
  inset: 0;
}

.panel {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 10;
  width: 280px;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
}

.label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.slider {
  flex: 1;
}
</style>

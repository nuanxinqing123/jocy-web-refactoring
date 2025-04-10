<script setup>
import { onMounted } from 'vue';
import Layout from './layout/index.vue';
import { useCommonStore } from './stores/commonStore';

const commonStore = useCommonStore();

onMounted(() => {
  // 检测设备类型
  commonStore.checkIsMobile();
});
</script>

<template>
  <Layout />
</template>

<style scoped>
/* 全局样式可以在style.css中定义 */
</style>

<template>
  <div class="min-h-screen bg-white">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';

// 初始化認證狀態
const authStore = useAuthStore();

// 僅在客戶端運行時初始化認證狀態
onMounted(async () => {
  await authStore.initAuth();
});
</script>

<style>
html, body {
  @apply antialiased;
}
</style>
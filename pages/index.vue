<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">歡迎使用 Home Assistant Hub</h1>
    
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
      <p class="text-gray-700 dark:text-gray-300 mb-4">
        Home Assistant Hub 是一個簡單的工具，幫助您管理和監控多個 Home Assistant 實例。
      </p>
      
      <div class="mt-6">
        <NuxtLink 
          to="/dashboard" 
          class="btn btn-primary mr-4"
        >
          前往儀表板
        </NuxtLink>
        <NuxtLink 
          to="/settings" 
          class="btn btn-secondary"
        >
          管理連接
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
definePageMeta({
  layout: 'default'
});
</script>
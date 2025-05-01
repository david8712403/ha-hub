<template>
  <footer class="bg-white dark:bg-gray-800 shadow-inner py-4">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          &copy; {{ currentYear }} Home Assistant Hub
        </div>
        <div class="mt-2 md:mt-0 text-sm text-gray-600 dark:text-gray-400">
          <span>
            <a href="https://home-assistant.io" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary-dark">
              Home Assistant
            </a> 是一個開源的智能家居平台
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 計算當前年份
const currentYear = ref(new Date().getFullYear());
</script>
<template>
  <a-layout class="min-h-screen">
    <!-- Navigation Header -->
    <layout-navigation-header />
    
    <!-- Main Content -->
    <a-layout-content class="p-6 bg-gray-50">
      <div class="container mx-auto">
        <slot />
      </div>
    </a-layout-content>
    
    <!-- Footer -->
    <layout-app-footer />
  </a-layout>
</template>

<script setup lang="ts">
import LayoutNavigationHeader from '../components/layout/NavigationHeader.vue';
import LayoutAppFooter from '../components/layout/AppFooter.vue';
</script>

<style scoped>
.container {
  max-width: 1280px;
}
</style>
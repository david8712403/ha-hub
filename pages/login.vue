<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full bg-white shadow rounded-lg p-8">
      <LoginForm @login-success="handleLoginSuccess" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { message } from 'ant-design-vue';
import LoginForm from '@/components/auth/LoginForm.vue';
import { onMounted } from 'vue';
import { navigateTo } from 'nuxt/app';

const authStore = useAuthStore();

function handleLoginSuccess() {
  message.success('登入成功！');
}

// 如果用戶已登入，直接跳轉到儀表板
onMounted(async () => {
  await authStore.initAuth();
  if (authStore.isAuthenticated) {
    return navigateTo('/dashboard');
  }
});

// @ts-ignore
definePageMeta({
  layout: 'auth',
  middleware: ['guest']
});
</script>
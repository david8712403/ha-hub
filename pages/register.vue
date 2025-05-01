<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full bg-white shadow rounded-lg p-8">
      <RegisterForm @register-success="handleRegisterSuccess" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { message } from 'ant-design-vue';
import RegisterForm from '@/components/auth/RegisterForm.vue';
import { onMounted } from 'vue';
import { navigateTo } from 'nuxt/app';

const authStore = useAuthStore();

function handleRegisterSuccess() {
  message.success('註冊成功！請使用您的電子郵件和密碼登入。');
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

<style scoped>
/* 註冊頁樣式 */
</style>
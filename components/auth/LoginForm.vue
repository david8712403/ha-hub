<template>
  <div class="login-form">
    <h2 class="text-2xl font-bold mb-6">登入系統</h2>

    <a-alert v-if="errorMessage" type="error" :message="errorMessage" class="mb-4" show-icon />

    <a-form :model="formState" @finish="handleSubmit" layout="vertical">
      <a-form-item label="電子郵件" name="email"
        :rules="[{ required: true, message: '請輸入電子郵件' }, { type: 'email', message: '請輸入有效的電子郵件' }]">
        <a-input v-model:value="formState.email" placeholder="請輸入您的電子郵件" size="large">
          <template #prefix>
            <user-outlined />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item label="密碼" name="password" :rules="[{ required: true, message: '請輸入密碼' }]">
        <a-input-password v-model:value="formState.password" placeholder="請輸入您的密碼" size="large">
          <template #prefix>
            <lock-outlined />
          </template>
        </a-input-password>
      </a-form-item>

      <div class="flex items-center justify-between mb-4">
        <a-checkbox v-model:checked="formState.remember">記住我</a-checkbox>
        <a class="text-primary hover:text-primary-dark">忘記密碼?</a>
      </div>

      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="isLoading" class="w-full" size="large">
          {{ isLoading ? '登入中...' : '登入' }}
        </a-button>
      </a-form-item>
    </a-form>

    <div class="mt-4 text-center">
      <p class="text-sm text-gray-600">
        還沒有帳號？
        <NuxtLink to="/register" class="text-primary hover:underline">
          立即註冊
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { useAuthStore } from '~/stores/auth';

const emit = defineEmits(['login-success']);
const authStore = useAuthStore();

const isLoading = ref(false);
const errorMessage = ref('');

const formState = reactive({
  email: '',
  password: '',
  remember: false
});

async function handleSubmit() {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const result = await authStore.login(formState.email, formState.password);

    if (result.success) {
      emit('login-success');

      // 重定向到儀表板
      navigateTo('/dashboard');
    } else {
      errorMessage.value = result.error || '登入失敗，請檢查您的信箱和密碼';
    }
  } catch (error: any) {
    console.error('登入錯誤:', error);
    errorMessage.value = '登入過程中發生錯誤，請稍後再試';
  } finally {
    isLoading.value = false;
  }
}
</script>
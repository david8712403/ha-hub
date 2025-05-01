<template>
  <div class="register-form">
    <h2 class="text-2xl font-bold mb-6">註冊帳號</h2>

    <a-alert v-if="errorMsg" type="error" :message="errorMsg" class="mb-4" show-icon />


    <a-form :model="formState" @finish="handleSubmit" layout="vertical" :rules="rules">
      <a-form-item label="姓名 (選填)" name="name">
        <a-input v-model:value="formState.name" placeholder="請輸入您的姓名" size="large">
          <template #prefix>
            <user-outlined />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item label="電子郵件" name="email" :rules="[
        { required: true, message: '請輸入電子郵件' },
        { type: 'email', message: '請輸入有效的電子郵件' }
      ]">
        <a-input v-model:value="formState.email" placeholder="請輸入您的電子郵件" size="large">
          <template #prefix>
            <mail-outlined />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item label="密碼" name="password" :rules="[
        { required: true, message: '請輸入密碼' },
        { min: 8, message: '密碼長度不得少於8個字符' }
      ]">
        <a-input-password v-model:value="formState.password" placeholder="請設定您的密碼" size="large">
          <template #prefix>
            <lock-outlined />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item label="確認密碼" name="confirmPassword" :rules="[
        { required: true, message: '請再次輸入密碼' },
        { validator: validateConfirmPassword }
      ]">
        <a-input-password v-model:value="formState.confirmPassword" placeholder="請再次輸入密碼" size="large">
          <template #prefix>
            <lock-outlined />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="isSubmitting" class="w-full" size="large">
          {{ isSubmitting ? '註冊中...' : '註冊' }}
        </a-button>
      </a-form-item>
    </a-form>


    <div class="mt-4 text-center">
      <p class="text-sm text-gray-600">
        已有帳號？
        <NuxtLink to="/login" class="text-primary hover:underline">
          登入
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons-vue';
import { useAuthStore } from '~/stores/auth';

const emit = defineEmits(['register-success']);
const authStore = useAuthStore();

const isSubmitting = ref(false);
const errorMsg = ref('');

// 表單數據
const formState = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

// 驗證確認密碼
const validateConfirmPassword = async (rule, value) => {
  if (value === '') {
    return Promise.reject('請再次輸入密碼');
  }

  if (value !== formState.password) {
    return Promise.reject('兩次輸入的密碼不一致');
  }

  return Promise.resolve();
};

// 表單驗證規則
const rules = {
  name: [],
  email: [
    { required: true, message: '請輸入電子郵件' },
    { type: 'email', message: '請輸入有效的電子郵件' }
  ],
  password: [
    { required: true, message: '請輸入密碼' },
    { min: 8, message: '密碼長度不得少於8個字符' }
  ],
  confirmPassword: [
    { required: true, message: '請再次輸入密碼' },
    { validator: validateConfirmPassword }
  ]
};

// 註冊提交處理
async function handleSubmit() {
  errorMsg.value = '';
  isSubmitting.value = true;

  try {
    // 使用 authStore 的 register 方法
    const result = await authStore.register(
      formState.name,
      formState.email,
      formState.password
    );

    if (result.success) {
      // 註冊成功並已自動登入
      emit('register-success');

      // 重定向到儀表板
      navigateTo('/dashboard');
    } else {
      // 處理註冊失敗
      errorMsg.value = result.error || '註冊失敗，請稍後再試';
    }
  } catch (error: any) {
    // 處理錯誤
    console.error('註冊錯誤:', error);
    errorMsg.value = '註冊過程中發生錯誤，請稍後再試';
  } finally {
    isSubmitting.value = false;
  }
}
</script>
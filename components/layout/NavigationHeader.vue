<template>
  <a-layout-header class="header bg-blue-900 shadow-md">
    <div class="flex justify-between items-center">
      <!-- Logo Area -->
      <div class="logo flex items-center">
        <a-typography-title :level="4" :style="{ margin: 0, color: 'white' }">
          Home Assistant Hub
        </a-typography-title>
      </div>
      
      <!-- Navigation Menu -->
      <a-menu
        v-model:selectedKeys="selectedKeys"
        mode="horizontal"
        theme="dark"
        :style="{ lineHeight: '64px', flex: 1, justifyContent: 'center', backgroundColor: 'transparent' }"
      >
        <a-menu-item key="dashboard">
          <template #icon><dashboard-outlined /></template>
          <NuxtLink to="/dashboard" class="text-white">儀表板</NuxtLink>
        </a-menu-item>
        <a-menu-item key="settings">
          <template #icon><setting-outlined /></template>
          <NuxtLink to="/settings" class="text-white">設定</NuxtLink>
        </a-menu-item>
      </a-menu>
      
      <!-- User Profile Menu -->
      <div class="user-actions">
        <a-dropdown v-if="isLoggedIn">
          <a class="ant-dropdown-link flex items-center text-white" @click.prevent>
            <a-avatar :style="{ backgroundColor: '#87d068' }" icon="user" class="mr-2" />
            {{ user?.name || 'User' }}
            <down-outlined />
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item key="profile">
                <template #icon><user-outlined /></template>
                個人資料
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item key="logout" @click="logout">
                <template #icon><logout-outlined /></template>
                登出
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
        <a-space v-else>
          <NuxtLink to="/login">
            <a-button type="link" class="text-white">登入</a-button>
          </NuxtLink>
          <NuxtLink to="/register">
            <a-button type="primary">註冊</a-button>
          </NuxtLink>
        </a-space>
      </div>
    </div>
  </a-layout-header>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { 
  DashboardOutlined, 
  SettingOutlined, 
  UserOutlined, 
  LogoutOutlined,
  DownOutlined
} from '@ant-design/icons-vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// 獲取當前登錄狀態和用戶信息
const isLoggedIn = computed(() => authStore.isLoggedIn);
const user = computed(() => authStore.user);

// 設置選中的菜單項
const selectedKeys = ref<string[]>([]);

// 監聽路由變化，更新選中的菜單項
watch(() => route.path, (path) => {
  const routePath = path.split('/')[1] || 'dashboard';
  selectedKeys.value = [routePath];
}, { immediate: true });

// 登出功能
async function logout() {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('登出失敗:', error);
  }
}
</script>

<style scoped>
.header {
  padding: 0 20px;
}

.logo {
  height: 64px;
}

:deep(.ant-menu-horizontal) {
  border-bottom: none;
}

:deep(.ant-menu-dark.ant-menu-horizontal > .ant-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.ant-menu-dark.ant-menu-horizontal > .ant-menu-item-selected) {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
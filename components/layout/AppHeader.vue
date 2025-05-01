<template>
  <header class="bg-white dark:bg-gray-800 shadow">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <div class="flex items-center">
        <NuxtLink to="/" class="flex items-center">
          <span class="text-xl font-bold text-primary">Home Assistant Hub</span>
        </NuxtLink>
      </div>
      
      <div class="flex items-center space-x-4">
        <div v-if="currentUser" class="relative group">
          <button 
            @click="toggleUserMenu" 
            class="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light"
          >
            <span class="mr-2">{{ currentUser.name || currentUser.email }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <div 
            v-if="isUserMenuOpen" 
            class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10"
          >
            <NuxtLink 
              to="/settings" 
              class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              @click="isUserMenuOpen = false"
            >
              帳號設定
            </NuxtLink>
            <button 
              @click="logout" 
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              登出
            </button>
          </div>
        </div>
        
        <NuxtLink 
          v-else 
          to="/login" 
          class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light"
        >
          登入
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// 模擬當前用戶資料，在實際應用中可從 Pinia store 獲取
const currentUser = ref({
  name: '測試用戶',
  email: 'test@example.com'
});

const isUserMenuOpen = ref(false);
const router = useRouter();

function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value;
}

async function logout() {
  // 在實際應用中，這裡會調用登出 API 並清除 token
  try {
    await $fetch('/api/auth/logout', { method: 'POST' });
    // 清除本地狀態並重定向到登入頁面
    router.push('/login');
  } catch (error) {
    console.error('登出失敗:', error);
  } finally {
    isUserMenuOpen.value = false;
  }
}

// 點擊外部區域關閉下拉選單
onClickOutside(isUserMenuOpen);

function onClickOutside(ref) {
  if (process.client) {
    window.addEventListener('click', (e) => {
      if (ref.value && !e.target.closest('.relative.group')) {
        ref.value = false;
      }
    });
  }
}
</script>
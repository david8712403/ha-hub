import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  // 跳過登入和註冊頁面的認證檢查
  if (to.path === '/login' || to.path === '/register') {
    return;
  }
  
  // 如果在客戶端運行，檢查是否已認證
  if (process.client) {
    const authStore = useAuthStore();
    
    if (!authStore.isAuthenticated) {
      // 用戶未登入，重定向到登入頁面
      return navigateTo('/login');
    }
  }
});
import { useAuthStore } from "@/stores/auth";
import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  
  // 初始化認證狀態
  await authStore.initAuth();
  
  // 如果用戶已登入，則重定向到儀表板
  if (authStore.isAuthenticated) {
    return navigateTo('/dashboard');
  }
});
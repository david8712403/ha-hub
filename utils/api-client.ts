import { FetchOptions } from 'ofetch';

/**
 * 創建具有認證功能的 API 客戶端
 */
export function createApiClient() {
  // 在客戶端創建一個能夠附加認證頭的 fetch 包裝器
  
  const fetchWithAuth = async (url: string, options: FetchOptions = {}) => {
    // 獲取存儲在 localStorage 中的令牌
    const token = process.client ? localStorage.getItem('auth_token') : null;
    
    // 創建新的 options 對象，避免修改原始對象
    const fetchOptions: FetchOptions = { ...options };
    
    // 如果存在令牌，添加到請求頭
    if (token) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${token}`
      };
    }
    
    try {
      // 使用 Nuxt 的 $fetch 函數發送請求
      return await $fetch(url, fetchOptions);
    } catch (error: any) {
      // 處理 401 錯誤（未授權）
      if (error.response?.status === 401) {
        // 清除過期的令牌
        if (process.client) {
          localStorage.removeItem('auth_token');
        }
        
        // 如果在客戶端，重定向到登入頁面
        if (process.client && window.location.pathname !== '/login') {
          navigateTo('/login');
        }
      }
      
      throw error;
    }
  };
  
  return {
    // GET 請求
    get: (url: string, options: FetchOptions = {}) => 
      fetchWithAuth(url, { ...options, method: 'GET' }),
    
    // POST 請求
    post: (url: string, data?: any, options: FetchOptions = {}) => 
      fetchWithAuth(url, { ...options, method: 'POST', body: data }),
    
    // PUT 請求
    put: (url: string, data?: any, options: FetchOptions = {}) => 
      fetchWithAuth(url, { ...options, method: 'PUT', body: data }),
    
    // DELETE 請求
    delete: (url: string, options: FetchOptions = {}) => 
      fetchWithAuth(url, { ...options, method: 'DELETE' })
  };
}

// 導出一個預設的 API 客戶端實例
export const api = createApiClient();
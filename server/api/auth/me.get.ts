import { defineEventHandler } from 'h3';
import { verifyAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // 使用 verifyAuth 函數來驗證用戶身份並獲取用戶資料
    const user = await verifyAuth(event);
    
    return {
      user
    };
  } catch (error) {
    // verifyAuth 函數會在驗證失敗時自動拋出適當的錯誤
    // 這些錯誤會被 Nuxt 的錯誤處理器捕獲並返回適當的響應
    throw error;
  }
});
import { defineEventHandler, setCookie, getCookie } from 'h3';
import jwt from 'jsonwebtoken';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler((event) => {
  // 這裡我們使用 Nuxt 3 的 H3 伺服器 API 而非 Express 中間件
  // 讀取 cookie 中的 token
  const token = getCookie(event, 'auth_token');
  
  // 如果有 token，可以在這裡進行驗證
  if (token) {
    try {
      const config = useRuntimeConfig();
      // 驗證 token
      const decoded = jwt.verify(token, config.private.jwtSecret);
      // 將解碼後的資訊附加到事件中，供後續處理使用
      event.context.auth = { user: decoded, isAuthenticated: true };
    } catch (error) {
      console.error('Invalid token:', error);
      // token 無效，清除 cookie
      setCookie(event, 'auth_token', '', {
        httpOnly: true,
        maxAge: 0,
        path: '/'
      });
      event.context.auth = { isAuthenticated: false };
    }
  } else {
    event.context.auth = { isAuthenticated: false };
  }
});
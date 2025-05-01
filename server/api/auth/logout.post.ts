import { defineEventHandler, setCookie } from 'h3';

export default defineEventHandler(async (event) => {
  // 通過設置過期的 cookie 來清除 auth_token
  setCookie(event, 'auth_token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0, // 立即過期
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  return {
    success: true,
    message: '已成功登出'
  };
});
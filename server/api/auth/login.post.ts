import { defineEventHandler, readBody, createError, setCookie } from 'h3';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { useRuntimeConfig } from '#imports';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const { email, password } = await readBody(event);

    // 驗證輸入
    if (!email || !password) {
      return createError({
        statusCode: 400,
        message: '電子郵件和密碼為必填項'
      });
    }

    // 查找用戶
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // 用戶不存在或密碼不匹配
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return createError({
        statusCode: 401,
        message: '電子郵件或密碼不正確'
      });
    }

    // 創建 JWT token
    const token = jwt.sign(
      { userId: user.id },
      config.private.jwtSecret,
      { expiresIn: '7d' }
    );

    // 設置 cookie
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 天
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    // 返回用戶信息（不包含密碼）
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  } catch (error) {
    console.error('登入錯誤:', error);
    return createError({
      statusCode: 500,
      message: '登入過程中發生錯誤'
    });
  }
});
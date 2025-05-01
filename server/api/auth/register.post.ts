import { defineEventHandler, readBody, createError, setCookie } from 'h3';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { useRuntimeConfig } from '#imports';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const { name, email, password } = await readBody(event);

    // 驗證輸入
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: '電子郵件和密碼為必填項'
      });
    }

    // 檢查電子郵件是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: '此電子郵件已被註冊'
      });
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    // 創建新用戶
    const newUser = await prisma.user.create({
      data: {
        name: name || email.split('@')[0], // 如果沒有提供姓名，使用電子郵件前綴
        email,
        password: hashedPassword
      }
    });

    // 創建 JWT token
    const token = jwt.sign(
      { userId: newUser.id },
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
    const { password: _, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      token
    };
  } catch (error) {
    console.error('註冊錯誤:', error);
    throw error;
  }
});
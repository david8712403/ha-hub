import { H3Event, getCookie, getRequestHeader, createError } from 'h3';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { useRuntimeConfig } from '#imports';

const prisma = new PrismaClient();

/**
 * 從請求中驗證用戶並返回用戶資料
 */
export async function verifyAuth(event: H3Event) {
  const config = useRuntimeConfig();
  
  // 從 cookie 獲取令牌
  const token = getCookie(event, 'auth_token');
  
  // 如果沒有 cookie 令牌，則從 Authorization 頭獲取令牌
  const authHeader = getRequestHeader(event, 'authorization');
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;
  
  const finalToken = token || bearerToken;
  
  if (!finalToken) {
    throw createError({
      statusCode: 401,
      message: '未提供認證令牌'
    });
  }
  
  try {
    // 驗證令牌
    const decoded = jwt.verify(finalToken, config.private.jwtSecret) as { userId: number };
    
    if (!decoded || !decoded.userId) {
      throw createError({
        statusCode: 401,
        message: '無效的認證令牌'
      });
    }
    
    // 獲取用戶資料
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      throw createError({
        statusCode: 401,
        message: '用戶不存在'
      });
    }
    
    // 不要返回密碼
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Authentication error:', error);
    throw createError({
      statusCode: 401,
      message: '認證失敗'
    });
  }
}

/**
 * 獲取當前認證用戶 (提供與 verifyAuth 相同的功能，但更清晰的命名)
 */
export async function getAuthUser(event: H3Event) {
  return verifyAuth(event);
}
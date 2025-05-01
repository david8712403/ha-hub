import { defineEventHandler, createError } from 'h3';
import prisma from '../../utils/prisma';
import { getAuthUser } from '../../utils/auth';

// 獲取默認的 Home Assistant 連接
export default defineEventHandler(async (event) => {
  try {
    // 獲取當前認證用戶
    const user = await getAuthUser(event);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: '未授權訪問'
      });
    }
    
    // 查找用戶的默認連接
    const defaultConnection = await prisma.haConnection.findFirst({
      where: {
        userId: user.id,
        isDefault: true
      }
    });
    
    // 如果沒有默認連接，嘗試返回用戶的第一個連接
    if (!defaultConnection) {
      const firstConnection = await prisma.haConnection.findFirst({
        where: {
          userId: user.id
        }
      });
      return firstConnection; // 可能為 null，如果沒有任何連接
    }
    
    return defaultConnection;
  } catch (error) {
    console.error('獲取默認 Home Assistant 連接失敗:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '獲取默認 Home Assistant 連接時發生錯誤'
    });
  }
});
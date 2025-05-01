import { defineEventHandler, readBody, createError } from 'h3';
import prisma from '../../utils/prisma';
import { getAuthUser } from '../../utils/auth';

// 獲取所有 Home Assistant 連接
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

    // 只獲取當前用戶的連接
    const connections = await prisma.haConnection.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        isDefault: 'desc'
      }
    });
    
    return connections;
  } catch (error) {
    console.error('獲取 Home Assistant 連接失敗:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '獲取 Home Assistant 連接時發生錯誤'
    });
  }
});
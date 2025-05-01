import { defineEventHandler, createError, getRouterParam } from 'h3';
import prisma from '../../utils/prisma';
import { getAuthUser } from '../../utils/auth';

// 刪除 Home Assistant 連接
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
    
    const id = Number(getRouterParam(event, 'id'));
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少連接 ID'
      });
    }
    
    // 檢查連接是否存在，並且屬於當前用戶
    const existingConnection = await prisma.haConnection.findFirst({
      where: { 
        id,
        userId: user.id
      }
    });
    
    if (!existingConnection) {
      throw createError({
        statusCode: 404,
        statusMessage: '找不到指定的連接'
      });
    }
    
    // 如果是刪除默認連接，找一個其他連接設為默認
    if (existingConnection.isDefault) {
      const otherConnection = await prisma.haConnection.findFirst({
        where: {
          userId: user.id,
          id: { not: id }
        }
      });
      
      if (otherConnection) {
        await prisma.haConnection.update({
          where: { id: otherConnection.id },
          data: { isDefault: true }
        });
      }
    }
    
    // 刪除連接
    await prisma.haConnection.delete({
      where: { id }
    });
    
    return { success: true };
  } catch (error) {
    console.error('刪除 Home Assistant 連接失敗:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '刪除 Home Assistant 連接時發生錯誤'
    });
  }
});
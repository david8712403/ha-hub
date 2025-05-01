import { defineEventHandler, createError, getRouterParam } from 'h3';
import prisma from '../../../utils/prisma';
import { getAuthUser } from '../../../utils/auth';

// 將指定的連接設為默認
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
    
    // 將用戶的所有連接設為非默認
    await prisma.haConnection.updateMany({
      where: {
        userId: user.id,
        isDefault: true
      },
      data: {
        isDefault: false
      }
    });
    
    // 將指定連接設為默認
    const updatedConnection = await prisma.haConnection.update({
      where: { id },
      data: {
        isDefault: true
      }
    });
    
    return updatedConnection;
  } catch (error) {
    console.error('設置默認 Home Assistant 連接失敗:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '設置默認 Home Assistant 連接時發生錯誤'
    });
  }
});
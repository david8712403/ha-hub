import { defineEventHandler, readBody, createError, getRouterParam } from 'h3';
import prisma from '../../utils/prisma';
import { getAuthUser } from '../../utils/auth';

// 更新 Home Assistant 連接
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
    const body = await readBody(event);
    
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
    
    // 如果設為默認連接，則重置其他連接的默認狀態
    if (body.isDefault) {
      await prisma.haConnection.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
          id: { not: id }
        },
        data: {
          isDefault: false
        }
      });
    }
    
    // 更新連接
    const updatedConnection = await prisma.haConnection.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : existingConnection.name,
        url: body.url !== undefined ? body.url : existingConnection.url,
        token: body.token !== undefined ? body.token : existingConnection.token,
        isDefault: body.isDefault !== undefined ? body.isDefault : existingConnection.isDefault
      }
    });
    
    return updatedConnection;
  } catch (error) {
    console.error('更新 Home Assistant 連接失敗:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '更新 Home Assistant 連接時發生錯誤'
    });
  }
});
import { defineEventHandler, readBody, createError } from 'h3';
import prisma from '../../utils/prisma';
import { getAuthUser } from '../../utils/auth';

// 創建新的 Home Assistant 連接
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
    
    const body = await readBody(event);
    
    // 驗證必要欄位
    if (!body.name || !body.url || !body.token) {
      throw createError({
        statusCode: 400,
        statusMessage: '名稱、URL 和令牌是必填欄位'
      });
    }
    
    // 如果設為默認連接，則重置當前用戶的其他連接的默認狀態
    if (body.isDefault) {
      await prisma.haConnection.updateMany({
        where: {
          userId: user.id,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      });
    }
    
    // 創建新連接，關聯到當前用戶
    const connection = await prisma.haConnection.create({
      data: {
        name: body.name,
        url: body.url,
        token: body.token,
        isDefault: body.isDefault || false,
        userId: user.id
      }
    });
    
    return connection;
  } catch (error) {
    console.error('創建 Home Assistant 連接失敗:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '創建 Home Assistant 連接時發生錯誤'
    });
  }
});
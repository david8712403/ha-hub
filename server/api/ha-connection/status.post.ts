import { defineEventHandler, readBody, createError } from 'h3';
import prisma from '../../utils/prisma';
import { getAuthUser } from '../../utils/auth';
import axios from 'axios';

// 檢查 Home Assistant 連接狀態
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
    
    if (!body.connectionId) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少連接 ID'
      });
    }
    
    // 獲取連接信息，確保只能訪問自己的連接
    const connection = await prisma.haConnection.findFirst({
      where: {
        id: body.connectionId,
        userId: user.id
      }
    });
    
    if (!connection) {
      throw createError({
        statusCode: 404,
        statusMessage: '找不到指定的連接'
      });
    }
    
    // 檢查 Home Assistant 連接
    try {
      const response = await axios.get(`${connection.url}/api/`, {
        headers: {
          Authorization: `Bearer ${connection.token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5秒超時
      });
      
      return {
        available: true,
        version: response.data?.version || 'Unknown'
      };
    } catch (error) {
      console.error('Home Assistant 連接檢查失敗:', error);
      return {
        available: false,
        version: null,
        error: '無法連接到 Home Assistant'
      };
    }
  } catch (error) {
    console.error('檢查 Home Assistant 連接狀態失敗:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '檢查 Home Assistant 連接狀態時發生錯誤'
    });
  }
});
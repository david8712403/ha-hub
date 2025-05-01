import { PrismaClient } from '@prisma/client';

// 創建一個全局的 Prisma 客戶端實例
const prisma = new PrismaClient();

// 根據 ID 獲取連接
export async function getConnectionById(id: number) {
  return prisma.haConnection.findUnique({
    where: {
      id: id
    }
  });
}

// 其他數據庫操作函數可以添加在這裡

export default prisma;
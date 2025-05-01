# 🏠 Home Assistant Hub

> 🚀 一個現代化、功能豐富的 Home Assistant 管理後台，基於 Nuxt.js 構建

![正在開發中](https://img.shields.io/badge/狀態-開發中-blue)
![版本](https://img.shields.io/badge/版本-0.1.0-orange)
![授權](https://img.shields.io/badge/授權-MIT-green)

## 📖 專案簡介

Home Assistant Hub 是一個專為智能家居愛好者設計的管理平台，讓您能夠更方便地管理和監控您的 Home Assistant 實例。透過直觀的使用者介面和強大的功能，使智能家居管理變得更加簡單。

### ✨ 主要特點

- 🔐 完整的用戶認證系統
- 🔄 簡易的 Home Assistant 連接配置
- 📊 美觀的儀表板和數據視覺化
- 🔔 即時通知系統
- 📱 響應式設計，支援各種設備
- 🌐 多語言支援

## 🚀 快速開始

### 前置需求

- Node.js 18+ 
- Docker & Docker Compose
- 一個運行中的 Home Assistant 實例

### 安裝與運行

```bash
# 克隆儲存庫
git clone https://github.com/david8712403/ha-hub
cd ha-hub

# 安裝依賴
yarn install

# 啟動開發服務器
yarn dev

# 使用 Docker 啟動
docker-compose up -d
```

## 🛣️ 專案 Roadmap

### 🏗️ 階段 1: 專案設置與基礎架構 (完成)
- ✅ 使用 Yarn 搭建 Nuxt 3 專案
- ✅ 設定 TypeScript 支援
- ✅ 配置開發環境和生產環境
- ✅ 實作基本目錄結構與模組分層
- ✅ 整合 UI 框架 (Ant Design Vue & Tailwind CSS)

### 💾 階段 2: 資料庫設計與 ORM 實作 (進行中)
- ✅ 設置 PostgreSQL 資料庫 
- ✅ 整合 Prisma ORM
- ✅ 設計資料庫 schema
  - 用戶表 (users)
  - Home Assistant 連線配置表 (ha_connections)
  - 使用者設定表 (settings)
- ⏳ 實作資料庫遷移和種子資料

### 🔐 階段 3: 使用者認證系統 (進行中)
- ✅ 實作註冊功能
- ✅ 實作登入/登出功能
- ⏳ 權限管理系統
- ⏳ 密碼重置流程
- ✅ JWT 身份驗證

### 🔌 階段 4: Home Assistant 連接功能
- ⏳ 實作 Home Assistant API 客戶端
- ⏳ 連接配置介面
- ⏳ 儲存與管理多個 Home Assistant 實例
- ⏳ 連接狀態監控
- ⏳ 安全的 API 金鑰管理

### 📺 階段 5: Home Assistant 嵌入功能
- ⏳ 整合 Home Assistant 前端頁面
- ⏳ iframe 與安全配置
- ⏳ 提供原生 UI 交互選項
- ⏳ 適應性佈局，支援不同設備尺寸

### 📊 階段 6: 儀表板與數據顯示
- ⏳ 設計自定義儀表板
- ⏳ 顯示來自 Home Assistant 的重要數據
- ⏳ 圖表與數據視覺化
- ⏳ 自定義小工具與卡片

### 🔔 階段 7: 通知系統
- ⏳ 與 Home Assistant 事件系統整合
- ⏳ 推送通知
- ⏳ 郵件提醒
- ⏳ 通知歷史記錄

### 🧪 階段 8: 優化與測試
- ⏳ 單元測試
- ⏳ 集成測試
- ⏳ 性能優化
- ⏳ 安全性審查
- ⏳ 跨瀏覽器兼容性測試

### 🚢 階段 9: 部署與維護
- ✅ Docker 容器化配置
- ⏳ CI/CD 流程設計
- ⏳ 監控與日誌系統
- ⏳ 備份和恢復策略
- ⏳ 系統更新流程

### 📚 階段 10: 文檔與社區
- ⏳ 用戶文檔
- ⏳ API 文檔
- ⏳ 開發者指南
- ⏳ 貢獻指南

## 🛠️ 技術堆疊

### 前端
- **框架**: Nuxt 3, Vue 3
- **語言**: TypeScript
- **UI 庫**: Ant Design Vue
- **樣式**: Tailwind CSS

### 後端
- **API**: Nuxt 3 Server API
- **資料庫**: PostgreSQL
- **ORM**: Prisma
- **認證**: JWT

### 開發工具
- **包管理**: Yarn
- **容器化**: Docker & Docker Compose
- **版本控制**: Git
- **代碼風格**: ESLint, Prettier


## 📄 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 文件。

## 📧 聯絡方式

David Chen - [david87124@email.com](mailto:david87124@email.com)

項目連結: [https://github.com/david8712403/ha-hub](https://github.com/david8712403/ha-hub)
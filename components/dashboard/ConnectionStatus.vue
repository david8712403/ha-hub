<template>
  <a-card class="mb-6">
    <template #title>
      <div class="flex justify-between items-center">
        <span>Home Assistant 連接狀態</span>
        <a-button 
          v-if="connection"
          type="primary" 
          :loading="isRefreshing" 
          @click="refreshConnection"
        >
          <template #icon><sync-outlined /></template>
          重新檢查連接
        </a-button>
      </div>
    </template>
    
    <a-descriptions v-if="connection" bordered :column="{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }">
      <a-descriptions-item label="連接名稱">
        {{ connection.name }}
      </a-descriptions-item>
      <a-descriptions-item label="網址">
        <a-typography-text copyable>{{ connection.url }}</a-typography-text>
      </a-descriptions-item>
      <a-descriptions-item label="連接狀態">
        <a-badge 
          :status="isConnected ? 'success' : 'error'" 
          :text="isConnected ? '已連接' : '連接失敗'" 
        />
      </a-descriptions-item>
      <a-descriptions-item label="版本">
        {{ haConnectionStore.connectionStatus.version || '未知' }}
      </a-descriptions-item>
      <a-descriptions-item label="API 狀態">
        {{ isConnected ? '可用' : '不可用' }}
      </a-descriptions-item>
      <a-descriptions-item label="上次檢查">
        {{ lastCheckedFormatted }}
      </a-descriptions-item>
    </a-descriptions>
    
    <a-empty v-else description="尚未連接到任何 Home Assistant 實例" />
    
    <!-- 連接故障詳情 -->
    <a-alert
      v-if="!isConnected && connection && haConnectionStore.connectionError"
      type="error"
      :message="haConnectionStore.connectionError"
      class="mt-4"
      show-icon
    />
    
    <!-- 連接診斷工具 -->
    <div v-if="!isConnected && connection" class="mt-4">
      <a-collapse>
        <a-collapse-panel key="1" header="連接診斷工具">
          <a-typography-title :level="5">連接診斷檢查清單</a-typography-title>
          <a-list>
            <a-list-item>
              <a-typography-text>確認 Home Assistant 實例 URL 是否正確</a-typography-text>
              <a-typography-text code>{{ connection.url }}</a-typography-text>
            </a-list-item>
            <a-list-item>檢查 Home Assistant 是否已在運行並可從此網絡訪問</a-list-item>
            <a-list-item>檢查 Home Assistant 的 CORS 設置 (在 configuration.yaml 中)</a-list-item>
            <a-list-item>確認 Home Assistant 開啟 HTTP 整合及外部訪問功能</a-list-item>
            <a-list-item>確認長期訪問令牌是否有效且具有適當權限</a-list-item>
            <a-list-item>檢查 DNS 解析是否正確</a-list-item>
          </a-list>
          
          <a-divider />
          
          <a-typography-title :level="5">手動檢查連接</a-typography-title>
          <a-typography-paragraph>
            在瀏覽器新標籤中直接訪問：
            <a-button type="link" @click="openInNewTab(connection.url)">
              {{ connection.url }}
              <template #icon><export-outlined /></template>
            </a-button>
          </a-typography-paragraph>
          <a-typography-paragraph>
            如果 URL 無法訪問，請檢查網路連接或防火牆設置。
          </a-typography-paragraph>
        </a-collapse-panel>
      </a-collapse>
    </div>
    
    <a-divider />
    
    <a-space>
      <NuxtLink to="/settings">
        <a-button type="primary">
          管理連接設定
        </a-button>
      </NuxtLink>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useHaConnectionStore } from '../../stores/ha-connection';
import { message } from 'ant-design-vue';
import { SyncOutlined, ExportOutlined } from '@ant-design/icons-vue';

// 使用 Pinia store
const haConnectionStore = useHaConnectionStore();
const isRefreshing = ref(false);

// 從 store 獲取連接資訊
const connection = computed(() => haConnectionStore.activeConnection);
const isConnected = computed(() => haConnectionStore.isConnected);
const lastCheckedFormatted = computed(() => {
  const lastChecked = haConnectionStore.connectionStatus.lastChecked;
  if (!lastChecked) return '從未檢查';
  return new Date(lastChecked).toLocaleString();
});

onMounted(async () => {
  if (!connection.value) {
    await haConnectionStore.fetchActiveConnection();
  }
  
  // 如果還是沒有連接，可能需要顯示一些信息
  if (!connection.value && !haConnectionStore.isLoading) {
    console.log('沒有找到活躍的 Home Assistant 連接');
  }
});

// 在新標籤中打開鏈接
function openInNewTab(url: string) {
  if (!url) return;
  window.open(url, '_blank');
}

async function refreshConnection() {
  isRefreshing.value = true;
  
  try {
    if (connection.value) {
      await haConnectionStore.checkConnectionStatus(connection.value.id);
      
      if (haConnectionStore.isConnected) {
        message.success('連接狀態已更新，連接成功');
      } else {
        message.warning('連接狀態已更新，但連接失敗');
      }
    } else {
      message.warning('沒有活躍的連接可以檢查');
    }
  } catch (error) {
    console.error('刷新連接失敗:', error);
    message.error('刷新連接狀態失敗');
  } finally {
    isRefreshing.value = false;
  }
}
</script>
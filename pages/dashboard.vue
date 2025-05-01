<template>
  <div>
    <div class="container mx-auto px-4 py-6">
      <!-- Page Header with Instance Selection -->
      <a-page-header 
        title="儀表板" 
        class="p-0 mb-6"
      >
        <template #extra>
          <div class="flex items-center">
            <!-- Connection Selector -->
            <a-select
              v-if="haConnectionStore.connections.length > 0"
              v-model:value="selectedConnectionId"
              style="width: 200px; margin-right: 16px;"
              placeholder="選擇 Home Assistant 實例"
              :loading="haConnectionStore.isLoading"
              @change="handleConnectionChange"
            >
              <a-select-option 
                v-for="conn in haConnectionStore.connections" 
                :key="conn.id" 
                :value="conn.id"
              >
                {{ conn.name }}
                <a-tag v-if="conn.isDefault" color="blue" size="small" class="ml-1">預設</a-tag>
              </a-select-option>
            </a-select>

            <!-- Refresh Button -->
            <a-button 
              v-if="activeConnection"
              type="primary" 
              :loading="isRefreshing" 
              @click="refreshData"
            >
              <template #icon><reload-outlined /></template>
              刷新資料
            </a-button>
          </div>
        </template>
      </a-page-header>

      <!-- Home Assistant 連接狀態 -->
      <dashboard-connection-status />

      <!-- Home Assistant 嵌入區域 -->
      <a-spin :spinning="isLoading" tip="載入中...">
        <div v-if="activeConnection" class="mt-6">
          <dashboard-h-a-embed 
            :connection="activeConnection" 
            ref="haEmbedRef"
          />
        </div>
        <div v-else class="mt-6">
          <a-result
            status="info"
            title="尚未連接到 Home Assistant"
            sub-title="請先設置連接以查看儀表板資料"
          >
            <template #extra>
              <NuxtLink to="/settings">
                <a-button type="primary">
                  前往設定
                </a-button>
              </NuxtLink>
            </template>
          </a-result>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useHaConnectionStore } from '../stores/ha-connection';
import { message } from 'ant-design-vue';
import { ReloadOutlined } from '@ant-design/icons-vue';
import DashboardConnectionStatus from '../components/dashboard/ConnectionStatus.vue';
import DashboardHAEmbed from '../components/dashboard/HAEmbed.vue';

// 使用 Pinia store
const haConnectionStore = useHaConnectionStore();
const isLoading = ref(false);
const isRefreshing = ref(false);
const haEmbedRef = ref<InstanceType<typeof DashboardHAEmbed> | null>(null);
const selectedConnectionId = ref<number | null>(null);

// 從 store 中獲取活躍連接
const activeConnection = computed(() => haConnectionStore.activeConnection);

// 當活躍連接變化時，更新所選連接ID
watch(() => haConnectionStore.activeConnection, (newConnection) => {
  if (newConnection) {
    selectedConnectionId.value = newConnection.id;
  } else {
    selectedConnectionId.value = null;
  }
}, { immediate: true });

// 切換連接處理
async function handleConnectionChange(connectionId: number) {
  isLoading.value = true;
  try {
    const result = await haConnectionStore.switchConnection(connectionId);
    if (result.success) {
      message.success('成功切換 Home Assistant 連接');
    } else {
      message.error('無法切換連接');
    }
  } catch (error) {
    console.error('切換連接時發生錯誤:', error);
    message.error('切換連接時發生錯誤');
  } finally {
    isLoading.value = false;
  }
}

// 刷新資料函數
const refreshData = async () => {
  if (!haEmbedRef.value) return;
  
  isRefreshing.value = true;
  try {
    await haEmbedRef.value.fetchHaData();
    message.success('資料已成功刷新');
  } catch (error) {
    message.error('刷新資料時發生錯誤');
  } finally {
    isRefreshing.value = false;
  }
};

onMounted(async () => {
  isLoading.value = true;
  try {
    // 獲取所有連接列表
    await haConnectionStore.fetchConnections();
    
    // 使用 store 的方法獲取默認連接
    await haConnectionStore.fetchActiveConnection();
    
    if (!activeConnection.value) {
      message.info('尚未設置默認的 Home Assistant 連接，請前往設定頁面添加連接。');
    }
  } catch (error) {
    console.error('無法獲取 Home Assistant 連接:', error);
    message.error('獲取 Home Assistant 連接時發生錯誤');
  } finally {
    isLoading.value = false;
  }
});
</script>
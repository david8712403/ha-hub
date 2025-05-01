<template>
  <div>
    <!-- Header with Refresh Button -->
    <a-card class="mb-6">
      <template #title>
        <div class="flex justify-between items-center">
          <span>Home Assistant 資訊面板</span>
          <a-button 
            type="primary" 
            :loading="isLoading" 
            @click="fetchHaData"
          >
            <template #icon><reload-outlined /></template>
            刷新資料
          </a-button>
        </div>
      </template>

      <!-- Connection Error Alert -->
      <a-alert 
        v-if="connectionError" 
        type="error" 
        :message="connectionError" 
        banner 
        class="mb-4" 
        show-icon
      />

      <!-- Loading Spinner -->
      <a-empty v-if="isLoading && !haData" description="載入 Home Assistant 資料中...">
        <template #image>
          <a-spin size="large" />
        </template>
      </a-empty>

      <!-- Connection Error Troubleshooting -->
      <div v-else-if="connectionError || !haData" class="w-full flex items-center justify-center flex-col p-4">
        <a-typography-text type="secondary" class="mb-4">無法從 Home Assistant 獲取資料</a-typography-text>
        <a-collapse class="w-full max-w-2xl mb-4">
          <a-collapse-panel key="1" header="疑難排解檢查清單">
            <a-list>
              <a-list-item>確認 Home Assistant 實例 URL 是否正確 (目前: {{ connection?.url || '未設置' }})</a-list-item>
              <a-list-item>確認 Home Assistant 是否已在 <a-typography-text code>configuration.yaml</a-typography-text> 中啟用 HTTP 整合</a-list-item>
              <a-list-item>檢查 Home Assistant 的 CORS 設置是否允許此網站連接</a-list-item>
              <a-list-item>確認長期訪問令牌是否有效且具有適當權限</a-list-item>
              <a-list-item>檢查您的網路連接和防火牆設置</a-list-item>
            </a-list>
          </a-collapse-panel>
        </a-collapse>

        <a-button type="primary" @click="fetchHaData">重試連接</a-button>
      </div>

      <!-- HA System Info -->
      <div v-else>
        <a-descriptions v-if="haData?.info" bordered :column="{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 2, xs: 1 }">
          <a-descriptions-item label="版本">
            {{ haData.info.version || '未知' }}
          </a-descriptions-item>
          <a-descriptions-item label="安裝類型">
            {{ haData.info.installation_type || '未知' }}
          </a-descriptions-item>
          <a-descriptions-item v-if="haData.info.installation_date" label="安裝日期">
            {{ new Date(haData.info.installation_date).toLocaleDateString() }}
          </a-descriptions-item>
          <a-descriptions-item label="實體數量">
            {{ haData.entities?.length || 0 }}
          </a-descriptions-item>
        </a-descriptions>
        <a-empty v-else description="未連接到Home Assistant" />
      </div>
    </a-card>

    <!-- Only display the rest if we have data -->
    <div v-if="haData">
      <!-- Entity Statistics Cards -->
      <a-card title="實體統計" class="mb-6">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-statistic title="實體總數" :value="haData.entities?.length || 0" />
          </a-col>
          <a-col :span="6">
            <a-statistic title="狀態實體" :value="countEntitiesByDomain('sensor')" />
          </a-col>
          <a-col :span="6">
            <a-statistic title="開關設備" :value="countEntitiesByDomain('switch')" />
          </a-col>
          <a-col :span="6">
            <a-statistic title="燈光設備" :value="countEntitiesByDomain('light')" />
          </a-col>
        </a-row>
      </a-card>

      <!-- All Entities Table with Filtering and Sorting -->
      <a-card title="所有實體" class="mb-6">
        <a-table
          :columns="columns"
          :data-source="haData.entities"
          :row-key="(record: HaEntity) => record.entity_id"
          :pagination="{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] }"
          :loading="isLoading"
        >
          <template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
            <div style="padding: 8px">
              <a-input
                :value="selectedKeys[0]"
                :placeholder="`搜尋${column.title}`"
                style="width: 188px; margin-bottom: 8px; display: block;"
                @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                @pressEnter="() => confirm()"
              />
              <a-button
                type="primary"
                size="small"
                style="width: 90px; margin-right: 8px"
                @click="() => confirm()"
              >
                <template #icon><search-outlined /></template>
                搜尋
              </a-button>
              <a-button
                size="small"
                style="width: 90px"
                @click="() => clearFilters()"
              >
                重置
              </a-button>
            </div>
          </template>
          
          <template #customFilterIcon="filtered">
            <search-outlined :style="{ color: filtered ? '#1890ff' : undefined }" />
          </template>

          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'state'">
              <a-tag :color="getStateColor(record)">{{ record.state }}</a-tag>
            </template>
            <template v-if="column.dataIndex === 'last_updated'">
              {{ formatDate(record.last_updated) }}
            </template>
          </template>
        </a-table>
      </a-card>
      
      <!-- Recently Updated Entities -->
      <a-card title="最近更新的實體" class="mb-6">
        <a-table
          :columns="columns"
          :data-source="recentlyUpdatedEntities"
          :row-key="(record: HaEntity) => record.entity_id"
          :pagination="{ pageSize: 5 }"
          :loading="isLoading"
        >
          <template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
            <div style="padding: 8px">
              <a-input
                :value="selectedKeys[0]"
                :placeholder="`搜尋${column.title}`"
                style="width: 188px; margin-bottom: 8px; display: block;"
                @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                @pressEnter="() => confirm()"
              />
              <a-button
                type="primary"
                size="small"
                style="width: 90px; margin-right: 8px"
                @click="() => confirm()"
              >
                <template #icon><search-outlined /></template>
                搜尋
              </a-button>
              <a-button
                size="small"
                style="width: 90px"
                @click="() => clearFilters()"
              >
                重置
              </a-button>
            </div>
          </template>
          
          <template #customFilterIcon="filtered">
            <search-outlined :style="{ color: filtered ? '#1890ff' : undefined }" />
          </template>

          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'state'">
              <a-tag :color="getStateColor(record)">{{ record.state }}</a-tag>
            </template>
            <template v-if="column.dataIndex === 'last_updated'">
              {{ formatDate(record.last_updated) }}
            </template>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons-vue';

interface HaEntity {
  entity_id: string;
  state: string;
  last_updated: string;
  domain: string;
  attributes: {
    friendly_name?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface HaData {
  info: {
    version: string;
    installation_type: string;
    installation_date?: string;
    [key: string]: any;
  };
  entities: HaEntity[];
  services: Record<string, Record<string, any>>;
  [key: string]: any;
}

const props = defineProps({
  connection: Object
});

const connectionError = ref('');
const isLoading = ref(false);
const haData = ref<HaData | null>(null);

// Table columns definition with filtering and sorting
const columns = reactive([
  {
    title: '實體 ID',
    dataIndex: 'entity_id',
    key: 'entity_id',
    sorter: (a: HaEntity, b: HaEntity) => a.entity_id.localeCompare(b.entity_id),
    customFilterDropdown: true,
    onFilter: (value: string, record: HaEntity) => 
      record.entity_id.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '名稱',
    dataIndex: 'attributes.friendly_name',
    key: 'friendly_name',
    sorter: (a: HaEntity, b: HaEntity) => (a.attributes?.friendly_name || '').localeCompare(b.attributes?.friendly_name || ''),
    render: (_: any, record: HaEntity) => record.attributes?.friendly_name || record.entity_id,
    customFilterDropdown: true,
    onFilter: (value: string, record: HaEntity) => 
      (record.attributes?.friendly_name || '').toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '類型',
    dataIndex: 'domain',
    key: 'domain',
    sorter: (a: HaEntity, b: HaEntity) => a.domain.localeCompare(b.domain),
    render: (_: any, record: HaEntity) => record.entity_id.split('.')[0],
    customFilterDropdown: true,
    onFilter: (value: string, record: HaEntity) => 
      record.entity_id.split('.')[0].toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '狀態',
    dataIndex: 'state',
    key: 'state',
    customFilterDropdown: true,
    onFilter: (value: string, record: HaEntity) => 
      record.state.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '最後更新',
    dataIndex: 'last_updated',
    key: 'last_updated',
    sorter: (a: HaEntity, b: HaEntity) => new Date(a.last_updated).getTime() - new Date(b.last_updated).getTime(),
  },
]);

// 格式化日期函數
function formatDate(dateString: string): string {
  if (!dateString) return '未知';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (e) {
    return dateString;
  }
}

// 計算最近更新的實體
const recentlyUpdatedEntities = computed(() => {
  if (!haData.value?.entities) return [];
  
  return [...haData.value.entities]
    .sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime())
    .slice(0, 10);
});

// 添加 domain 屬性到實體用於過濾
const processEntities = (entities: any[]): HaEntity[] => {
  if (!entities) return [];
  return entities.map(entity => ({
    ...entity,
    domain: entity.entity_id.split('.')[0]
  }));
};

// 按領域計算實體數量
function countEntitiesByDomain(domain: string): number {
  if (!haData.value?.entities) return 0;
  return haData.value.entities.filter(entity => entity.entity_id.startsWith(domain + '.')).length;
}

// Get color based on entity state
function getStateColor(entity: HaEntity): string {
  const domain = entity.entity_id.split('.')[0];
  const state = entity.state;
  
  if (state === 'unavailable' || state === 'unknown') return 'gray';
  if (domain === 'binary_sensor' || domain === 'switch' || domain === 'light') {
    return state === 'on' ? 'green' : 'red';
  }
  return 'blue';
}

// 使用 Proxy API 調用 Home Assistant API
async function callHaApiProxy(endpoint = '') {
  if (!props.connection) {
    throw new Error('未設置 Home Assistant 連接');
  }
  
  try {
    const response = await fetch('/api/ha-connection/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        connectionId: props.connection.id,
        endpoint
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API 響應狀態: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    connectionError.value = `無法連接到 Home Assistant: ${error instanceof Error ? error.message : '未知錯誤'}`;
    throw error;
  }
}

// 從Home Assistant API獲取資料
async function fetchHaData() {
  if (!props.connection) {
    connectionError.value = '未設置 Home Assistant 連接';
    return;
  }
  
  isLoading.value = true;
  connectionError.value = '';
  
  try {
    // 獲取配置資訊
    const configData = await callHaApiProxy('config');
    
    // 獲取狀態
    const statesData = await callHaApiProxy('states');
    
    // 獲取服務
    const servicesData = await callHaApiProxy('services');
    
    // 所有資料整合到一起
    haData.value = {
      info: configData,
      entities: processEntities(statesData),
      services: servicesData
    };
    
    message.success('成功從 Home Assistant 獲取資料');
  } catch (error) {
    console.error('獲取 Home Assistant 資料時發生錯誤:', error);
    connectionError.value = `無法獲取 Home Assistant 資料: ${error instanceof Error ? error.message : '未知錯誤'}`;
    message.error('獲取 Home Assistant 資料失敗');
  } finally {
    isLoading.value = false;
  }
}

// 在組件掛載後載入資料
onMounted(() => {
  if (props.connection) {
    fetchHaData();
  }
});

// Expose methods to parent components
defineExpose({
  fetchHaData
});
</script>
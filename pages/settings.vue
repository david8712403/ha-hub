<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">設定</h1>

    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Home Assistant 連接</h2>

      <!-- 顯示載入狀態 -->
      <a-spin :spinning="haConnectionStore.isLoading" tip="載入中...">
        <!-- 現有連接列表 -->
        <div v-if="connections.length > 0" class="mb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-3">已儲存的連接</h3>
          <div class="space-y-4">
            <div v-for="connection in connections" :key="connection.id"
              class="border rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-medium text-gray-900">{{ connection.name }}</h4>
                  <p class="text-sm text-gray-600">{{ connection.url }}</p>
                  <div class="mt-2 flex items-center">
                    <span v-if="connection.isDefault"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      預設連接
                    </span>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <a-button v-if="!connection.isDefault" @click="setAsDefault(connection.id)"
                    type="link" size="small">
                    設為預設
                  </a-button>
                  <a-button @click="editConnection(connection)"
                    type="link" size="small">
                    編輯
                  </a-button>
                  <a-button @click="deleteConnection(connection.id)"
                    type="link" danger size="small">
                    刪除
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="mb-6 text-gray-500">
          尚未添加任何 Home Assistant 連接。
        </div>
      </a-spin>

      <!-- 添加/編輯連接表單 -->
      <a-form :model="formData" @finish="saveConnection" layout="vertical">
        <h3 class="text-lg font-medium text-gray-900 mb-4">{{ editingConnection ? '編輯連接' : '添加新連接' }}</h3>

        <a-form-item label="名稱" name="name" :rules="[{ required: true, message: '請輸入連接名稱' }]">
          <a-input v-model:value="formData.name" placeholder="例如：家裡的 Home Assistant" />
        </a-form-item>

        <a-form-item label="URL" name="url" :rules="[{ required: true, message: '請輸入 URL' }]">
          <a-input v-model:value="formData.url" placeholder="例如：http://homeassistant.local:8123" />
        </a-form-item>

        <a-form-item label="長期訪問令牌" name="token" :rules="[{ required: true, message: '請輸入訪問令牌' }]">
          <a-input-password v-model:value="formData.token" />
          <p class="mt-1 text-xs text-gray-500">
            您可以在 Home Assistant 的個人資料設定中創建長期訪問令牌。
          </p>
        </a-form-item>

        <a-form-item>
          <a-checkbox v-model:checked="formData.isDefault">設為預設連接</a-checkbox>
        </a-form-item>

        <a-form-item>
          <div class="flex justify-between">
            <a-button v-if="editingConnection" @click="cancelEdit">
              取消
            </a-button>
            <a-button type="primary" html-type="submit" :loading="isSaving">
              {{ isSaving ? '儲存中...' : (editingConnection ? '更新連接' : '添加連接') }}
            </a-button>
          </div>
        </a-form-item>
      </a-form>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">帳號設定</h2>

      <!-- 用戶設定表單 -->
      <a-form :model="userSettings" @finish="saveUserSettings" layout="vertical">
        <a-form-item label="顯示名稱" name="name">
          <a-input v-model:value="userSettings.name" />
        </a-form-item>

        <a-form-item label="主題" name="theme">
          <a-select v-model:value="userSettings.theme">
            <a-select-option value="light">淺色</a-select-option>
            <a-select-option value="dark">深色</a-select-option>
            <a-select-option value="system">跟隨系統</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="語言" name="language">
          <a-select v-model:value="userSettings.language">
            <a-select-option value="en">English</a-select-option>
            <a-select-option value="zh-tw">繁體中文</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="isUserSettingsSaving">
            {{ isUserSettingsSaving ? '儲存中...' : '儲存設定' }}
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useHaConnectionStore } from '../stores/ha-connection';
import { useAuthStore } from '../stores/auth';
import { api } from '../utils/api-client';

// 使用 store
const haConnectionStore = useHaConnectionStore();
const authStore = useAuthStore();

// 連接列表
const connections = ref<{ id: number; name: string; url: string; token: string; isDefault: boolean }[]>([]);
const isSaving = ref(false);
const editingConnection = ref(null);

// 連接表單數據
const formData = reactive({
  id: null,
  name: '',
  url: '',
  token: '',
  isDefault: false
});

// 獲取所有連接
async function fetchConnections() {
  try {
    await haConnectionStore.fetchConnections();
    // 確保返回的數據有效，防止顯示莫名其妙的數據
    const validConnections = haConnectionStore.connections.filter(conn => 
      typeof conn === 'object' && 
      conn !== null && 
      conn.id && 
      typeof conn.name === 'string' && 
      typeof conn.url === 'string'
    );
    
    connections.value = validConnections;
    console.log('Valid connections:', validConnections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    connections.value = []; // 出現錯誤時清空連接列表
  }
}

// 添加或更新連接
async function saveConnection() {
  isSaving.value = true;
  try {
    if (editingConnection.value) {
      // 更新現有連接
      const result = await haConnectionStore.updateConnection(formData.id, formData);
      if (!result.success) {
        console.error('更新連接失敗:', result.error);
      }
    } else {
      // 添加新連接
      const result = await haConnectionStore.addConnection(formData);
      if (!result.success) {
        console.error('添加連接失敗:', result.error);
      }
    }
    resetForm();
    await fetchConnections();
  } catch (error) {
    console.error('Error saving connection:', error);
  } finally {
    isSaving.value = false;
  }
}

// 編輯連接
function editConnection(connection) {
  editingConnection.value = connection;
  formData.id = connection.id;
  formData.name = connection.name;
  formData.url = connection.url;
  formData.token = connection.token;
  formData.isDefault = connection.isDefault;
}

// 取消編輯
function cancelEdit() {
  editingConnection.value = null;
  resetForm();
}

// 重置表單
function resetForm() {
  formData.id = null;
  formData.name = '';
  formData.url = '';
  formData.token = '';
  formData.isDefault = false;
  editingConnection.value = null;
}

// 刪除連接
async function deleteConnection(id) {
  if (!confirm('確定要刪除這個連接嗎？')) return;

  try {
    const result = await haConnectionStore.deleteConnection(id);
    if (!result.success) {
      console.error('刪除連接失敗:', result.error);
    }
  } catch (error) {
    console.error('Error deleting connection:', error);
  }
}

// 設為預設連接
async function setAsDefault(id) {
  try {
    const result = await haConnectionStore.setDefaultConnection(id);
    if (!result.success) {
      console.error('設置默認連接失敗:', result.error);
    }
  } catch (error) {
    console.error('Error setting default connection:', error);
  }
}

// 用戶設定
const userSettings = reactive({
  name: '',
  theme: 'system',
  language: 'zh-tw'
});
const isUserSettingsSaving = ref(false);

// 獲取用戶設定
async function fetchUserSettings() {
  try {
    const response = await api.get('/api/settings');
    if (response) {
      userSettings.name = response.name || '';
      userSettings.theme = response.theme || 'system';
      userSettings.language = response.language || 'zh-tw';
    }
  } catch (error) {
    console.error('Error fetching user settings:', error);
  }
}

// 保存用戶設定
async function saveUserSettings() {
  isUserSettingsSaving.value = true;
  try {
    await api.put('/api/settings', userSettings);
  } catch (error) {
    console.error('Error saving user settings:', error);
  } finally {
    isUserSettingsSaving.value = false;
  }
}

// 添加檢查連接有效性的 debounce 函數
let checkTimer = null;
async function checkAndCleanConnections() {
  if (checkTimer) clearTimeout(checkTimer);
  
  checkTimer = setTimeout(() => {
    if (connections.value.length > 0) {
      // 過濾掉無效連接
      connections.value = connections.value.filter(conn => 
        conn && typeof conn === 'object' && conn.id && conn.name && conn.url
      );
    }
  }, 500);
}

onMounted(async () => {
  // 確保用戶已登入
  if (!authStore.isAuthenticated) {
    await authStore.initAuth();
  }

  await fetchConnections();
  await fetchUserSettings();
  checkAndCleanConnections(); // 額外檢查連接有效性
});
</script>
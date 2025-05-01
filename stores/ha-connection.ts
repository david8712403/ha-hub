import { defineStore } from 'pinia';
import { api } from '~/utils/api-client';

export interface HaConnection {
  id: number;
  name: string;
  url: string;
  token: string;
  isDefault: boolean;
}

export interface ConnectionStatus {
  available: boolean;
  version: string | null;
  lastChecked: Date | null;
}

export interface HaConnectionState {
  connections: HaConnection[];
  activeConnection: HaConnection | null;
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  connectionError: string | null;
}

export const useHaConnectionStore = defineStore('haConnection', {
  state: (): HaConnectionState => ({
    connections: [],
    activeConnection: null,
    connectionStatus: {
      available: false,
      version: null,
      lastChecked: null
    },
    isLoading: false,
    connectionError: null,
  }),
  
  getters: {
    getConnections: (state) => state.connections,
    getActiveConnection: (state) => state.activeConnection,
    getConnectionStatus: (state) => state.connectionStatus,
    isConnected: (state) => state.connectionStatus.available
  },
  
  actions: {
    // 獲取所有連接
    async fetchConnections() {
      this.isLoading = true;
      try {
        const response = await api.get('/api/ha-connection');
        this.connections = response;
      } catch (error) {
        console.error('獲取連接失敗:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    // 獲取默認或活躍連接
    async fetchActiveConnection() {
      this.isLoading = true;
      try {
        const response = await api.get('/api/ha-connection/default');
        this.activeConnection = response;
        if (response) {
          await this.checkConnectionStatus(response.id);
        }
      } catch (error) {
        console.error('獲取活躍連接失敗:', error);
        this.connectionError = error.message || '獲取活躍連接失敗';
      } finally {
        this.isLoading = false;
      }
    },
    
    // 檢查連接狀態
    async checkConnectionStatus(connectionId: number) {
      this.connectionError = null;
      try {
        const status = await api.post('/api/ha-connection/status', { connectionId });
        
        this.connectionStatus = {
          available: status.available,
          version: status.version,
          lastChecked: new Date()
        };
        
        if (!status.available) {
          this.connectionError = status.error || '無法連接到 Home Assistant';
        }
      } catch (error) {
        console.error('檢查連接狀態失敗:', error);
        this.connectionStatus = {
          available: false,
          version: null,
          lastChecked: new Date()
        };
        this.connectionError = error.message || '檢查連接狀態時發生錯誤';
      }
    },
    
    // 添加新連接
    async addConnection(connection: Omit<HaConnection, 'id'>) {
      this.isLoading = true;
      try {
        const response = await api.post('/api/ha-connection', connection);
        
        await this.fetchConnections();
        
        // 如果添加的是默認連接或還沒有活躍連接，則設置它為活躍連接
        if (connection.isDefault || !this.activeConnection) {
          await this.fetchActiveConnection();
        }
        
        return { success: true, connection: response };
      } catch (error) {
        console.error('添加連接失敗:', error);
        this.connectionError = error.message || '添加連接失敗';
        return { success: false, error };
      } finally {
        this.isLoading = false;
      }
    },
    
    // 更新連接
    async updateConnection(id: number, connection: Partial<HaConnection>) {
      this.isLoading = true;
      try {
        const response = await api.put(`/api/ha-connection/${id}`, connection);
        
        await this.fetchConnections();
        
        // 如果更新的是當前活躍連接或設為默認連接，則刷新活躍連接
        if ((this.activeConnection && this.activeConnection.id === id) || connection.isDefault) {
          await this.fetchActiveConnection();
        }
        
        return { success: true, connection: response };
      } catch (error) {
        console.error('更新連接失敗:', error);
        this.connectionError = error.message || '更新連接失敗';
        return { success: false, error };
      } finally {
        this.isLoading = false;
      }
    },
    
    // 刪除連接
    async deleteConnection(id: number) {
      this.isLoading = true;
      try {
        await api.delete(`/api/ha-connection/${id}`);
        
        // 如果刪除的是當前活躍連接，則需要刷新活躍連接
        if (this.activeConnection && this.activeConnection.id === id) {
          this.activeConnection = null;
          this.connectionStatus = {
            available: false,
            version: null,
            lastChecked: null
          };
          await this.fetchActiveConnection();
        }
        
        await this.fetchConnections();
        
        return { success: true };
      } catch (error) {
        console.error('刪除連接失敗:', error);
        this.connectionError = error.message || '刪除連接失敗';
        return { success: false, error };
      } finally {
        this.isLoading = false;
      }
    },
    
    // 設置默認連接
    async setDefaultConnection(id: number) {
      this.isLoading = true;
      try {
        await api.put(`/api/ha-connection/${id}/default`, {});
        
        await this.fetchConnections();
        await this.fetchActiveConnection();
        
        return { success: true };
      } catch (error) {
        console.error('設置默認連接失敗:', error);
        this.connectionError = error.message || '設置默認連接失敗';
        return { success: false, error };
      } finally {
        this.isLoading = false;
      }
    },
    
    // 切换活跃连接
    async switchConnection(id: number) {
      this.isLoading = true;
      try {
        // 从已经加载的连接中查找
        const connection = this.connections.find(conn => conn.id === id);
        if (!connection) {
          throw new Error('找不到指定的连接');
        }
        
        this.activeConnection = connection;
        
        // 检查新选择的连接状态
        await this.checkConnectionStatus(id);
        
        return { success: true };
      } catch (error) {
        console.error('切换连接失败:', error);
        this.connectionError = error.message || '切换连接失败';
        return { success: false, error };
      } finally {
        this.isLoading = false;
      }
    }
  }
});
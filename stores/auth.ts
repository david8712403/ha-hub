import { defineStore } from 'pinia';

export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false
  }),
  
  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    isLoggedIn: (state) => state.isAuthenticated
  },
  
  actions: {
    setUser(user: User | null) {
      this.user = user;
    },
    
    setToken(token: string | null) {
      this.token = token;
      // 如果在瀏覽器環境下，可以儲存token到localStorage
      if (process.client && token) {
        localStorage.setItem('auth_token', token);
      } else if (process.client) {
        localStorage.removeItem('auth_token');
      }
    },
    
    setAuth({ user, token }: { user: User; token: string }) {
      this.setUser(user);
      this.setToken(token);
      this.isAuthenticated = true;
    },
    
    clearAuth() {
      this.user = null;
      this.setToken(null);
      this.isAuthenticated = false;
    },
    
    // 初始化檢查是否已經登入
    async initAuth() {
      if (process.client) {
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          try {
            // 驗證token並獲取用戶資料
            const response = await $fetch('/api/auth/me', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            if (response && response.user) {
              this.setAuth({
                user: response.user,
                token
              });
              return true;
            } else {
              this.clearAuth();
              return false;
            }
          } catch (error) {
            console.error('Token驗證失敗:', error);
            this.clearAuth();
            return false;
          }
        }
        return false;
      }
      return false;
    },
    
    // 登入操作
    async login(email: string, password: string) {
      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { email, password }
        });
        
        this.setAuth({
          user: response.user,
          token: response.token
        });
        
        return { success: true };
      } catch (error: any) {
        console.error('登入失敗:', error);
        return { 
          success: false, 
          error: error?.data?.message || '登入失敗，請檢查您的電子郵件和密碼'
        };
      }
    },
    
    // 註冊操作
    async register(name: string, email: string, password: string) {
      try {
        const response = await $fetch('/api/auth/register', {
          method: 'POST',
          body: { name, email, password }
        });
        
        // 註冊成功後自動登入
        this.setAuth({
          user: response.user,
          token: response.token
        });
        
        return { 
          success: true,
          user: response.user
        };
      } catch (error: any) {
        console.error('註冊失敗:', error);
        return { 
          success: false, 
          error: error?.data?.message || '註冊失敗，請稍後再試'
        };
      }
    },
    
    // 登出操作
    async logout() {
      try {
        // 呼叫登出API
        await $fetch('/api/auth/logout', {
          method: 'POST'
        });
      } catch (error) {
        console.error('登出API調用失敗:', error);
      } finally {
        this.clearAuth();
      }
    }
  }
});
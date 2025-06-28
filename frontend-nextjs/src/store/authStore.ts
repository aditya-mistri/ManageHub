import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Admin, AuthState } from '@/types';
import apiClient from '@/lib/api';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyToken: () => Promise<void>;
  setUser: (user: Admin) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.loginWithEmail(email, password);
          if (response.success && response.token) {
            apiClient.setToken(response.token);
            await get().verifyToken();
          } else {
            throw new Error('Login failed');
          }
        } catch (error: any) {
          const message = error.response?.data?.msg || 'Login failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.register(name, email, password);
          if (response.success && response.token) {
            apiClient.setToken(response.token);
            await get().verifyToken();
          } else {
            throw new Error('Registration failed');
          }
        } catch (error: any) {
          const message = error.response?.data?.msg || 'Registration failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await apiClient.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
          set({ user: null, isAuthenticated: false, error: null });
        }
      },

      verifyToken: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        if (!token) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await apiClient.verifyToken(token);
          if (response.success) {
            const userResponse = await apiClient.getCurrentUser();
            set({ 
              user: userResponse.user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
          } else {
            throw new Error('Token verification failed');
          }
        } catch (error) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
          set({ user: null, isAuthenticated: false, isLoading: false, error: null });
        }
      },

      setUser: (user: Admin) => {
        set({ user, isAuthenticated: true });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
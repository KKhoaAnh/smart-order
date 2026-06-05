import { create } from 'zustand';
import { RoleName } from 'shared-types';

// ============================================================
// Auth Store — Quản lý xác thực & phân quyền
// ============================================================

export interface AuthUser {
  id: number;
  username: string;
  full_name: string;
  phone?: string;
  store_id: number;
  roles: RoleName[];
  is_active: boolean;
}

interface AuthState {
  // State
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  hasRole: (role: RoleName) => boolean;
  hasAnyRole: (roles: RoleName[]) => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state — rehydrate from localStorage
  user: (() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('pos_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),

  accessToken: (() => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('pos_token');
    } catch {
      return null;
    }
  })(),

  isAuthenticated: (() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('pos_token');
  })(),

  isLoading: false,

  // Actions
  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pos_user', JSON.stringify(user));
      localStorage.setItem('pos_token', token);
    }
    set({ user, accessToken: token, isAuthenticated: true });
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pos_user');
      localStorage.removeItem('pos_token');
    }
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  hasRole: (role) => {
    const { user } = get();
    return user?.roles?.includes(role) ?? false;
  },

  hasAnyRole: (roles) => {
    const { user } = get();
    return roles.some((role) => user?.roles?.includes(role)) ?? false;
  },

  isAdmin: () => {
    const { user } = get();
    return user?.roles?.includes(RoleName.ADMIN) ?? false;
  },
}));

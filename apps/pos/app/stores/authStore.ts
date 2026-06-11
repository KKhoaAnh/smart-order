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
  _hydrated: boolean;

  // Actions
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => void;
  hasRole: (role: RoleName) => boolean;
  hasAnyRole: (roles: RoleName[]) => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Server-safe defaults — hydrate() will populate from localStorage after mount
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  _hydrated: false,

  // Hydrate from localStorage — call in useEffect after mount
  hydrate: () => {
    if (get()._hydrated) return;
    if (typeof window === 'undefined') return;
    try {
      const storedUser = localStorage.getItem('pos_user');
      const storedToken = localStorage.getItem('pos_token');
      set({
        user: storedUser ? JSON.parse(storedUser) : null,
        accessToken: storedToken,
        isAuthenticated: !!storedToken,
        _hydrated: true,
      });
    } catch {
      set({ _hydrated: true });
    }
  },

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

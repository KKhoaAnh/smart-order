import { create } from 'zustand';

// ============================================================
// UI Store — Quản lý trạng thái giao diện
// ============================================================

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  closeMobileMenu: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: (() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('pos_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  })(),

  mobileMenuOpen: false,

  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarCollapsed;
      if (typeof window !== 'undefined') {
        localStorage.setItem('pos_sidebar_collapsed', String(next));
      }
      return { sidebarCollapsed: next };
    }),

  setSidebarCollapsed: (collapsed) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pos_sidebar_collapsed', String(collapsed));
    }
    set({ sidebarCollapsed: collapsed });
  },

  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

  closeMobileMenu: () => set({ mobileMenuOpen: false }),
}));

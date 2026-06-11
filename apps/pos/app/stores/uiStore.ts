import { create } from 'zustand';

// ============================================================
// UI Store — Quản lý trạng thái giao diện
// ============================================================

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  _hydrated: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  closeMobileMenu: () => void;
  hydrate: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Server-safe defaults
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  _hydrated: false,

  // Hydrate from localStorage — call in useEffect after mount
  hydrate: () => {
    if (get()._hydrated) return;
    if (typeof window === 'undefined') return;
    try {
      const collapsed = localStorage.getItem('pos_sidebar_collapsed') === 'true';
      set({ sidebarCollapsed: collapsed, _hydrated: true });
    } catch {
      set({ _hydrated: true });
    }
  },

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

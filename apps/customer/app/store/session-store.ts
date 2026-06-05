'use client';

import { create } from 'zustand';

// ============================================================
// Session Store — Quản lý phiên đặt món của khách hàng
// ============================================================

export interface StoreInfo {
  id: number;
  name: string;
  logo_url?: string;
  address: string;
  phone: string;
}

export interface TableInfo {
  id: number;
  table_number: string;
  area?: string;
}

export interface SessionData {
  session_token: string;
  store: StoreInfo;
  table: TableInfo;
}

interface SessionState {
  // State
  sessionToken: string | null;
  storeInfo: StoreInfo | null;
  tableInfo: TableInfo | null;
  storeSlug: string | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSession: (data: SessionData) => void;
  setStoreSlug: (slug: string) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  // Initial state
  sessionToken: null,
  storeInfo: null,
  tableInfo: null,
  storeSlug: null,
  isInitialized: false,
  isLoading: false,
  error: null,

  // Actions
  setSession: (data) =>
    set({
      sessionToken: data.session_token,
      storeInfo: data.store,
      tableInfo: data.table,
      isInitialized: true,
      isLoading: false,
      error: null,
    }),

  setStoreSlug: (slug) =>
    set({ storeSlug: slug }),

  clearSession: () =>
    set({
      sessionToken: null,
      storeInfo: null,
      tableInfo: null,
      storeSlug: null,
      isInitialized: false,
      isLoading: false,
      error: null,
    }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setError: (error) =>
    set({ error, isLoading: false }),
}));

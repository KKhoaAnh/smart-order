'use client';

import { create } from 'zustand';

export interface CustomerUser {
  id: number;
  phone: string;
  name: string;
  avatar_url?: string;
}

interface CustomerAuthState {
  customer: CustomerUser | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (customer: CustomerUser, token: string) => void;
  clearAuth: () => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>((set) => ({
  customer: (() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('customer_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  })(),

  token: (() => {
    if (typeof window === 'undefined') return null;
    try { return localStorage.getItem('customer_token'); }
    catch { return null; }
  })(),

  isAuthenticated: (() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('customer_token');
  })(),

  setAuth: (customer, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('customer_user', JSON.stringify(customer));
      localStorage.setItem('customer_token', token);
    }
    set({ customer, token, isAuthenticated: true });
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customer_user');
      localStorage.removeItem('customer_token');
    }
    set({ customer: null, token: null, isAuthenticated: false });
  },
}));

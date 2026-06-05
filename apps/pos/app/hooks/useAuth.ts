'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/stores/authStore';
import { login as apiLogin, getProfile } from '@/app/lib/api';
import { disconnectSocket } from '@/app/lib/socket';
import toast from 'react-hot-toast';

export function useAuth() {
  const router = useRouter();
  const { setAuth, clearAuth, user, isAuthenticated, hasRole, isAdmin } =
    useAuthStore();

  const login = async (username: string, password: string) => {
    const data = await apiLogin(username, password);
    setAuth(data.user as any, data.access_token);
    router.push('/dashboard/orders');
    toast.success('Đăng nhập thành công');
  };

  const logout = () => {
    clearAuth();
    disconnectSocket();
    router.push('/login');
    toast.success('Đã đăng xuất');
  };

  const checkAuth = async () => {
    try {
      await getProfile();
    } catch {
      clearAuth();
    }
  };

  return {
    login,
    logout,
    checkAuth,
    user,
    isAuthenticated,
    hasRole,
    isAdmin: isAdmin(),
    isCashier: hasRole('Cashier' as any),
    isKitchen: hasRole('Kitchen' as any),
  };
}

export default useAuth;

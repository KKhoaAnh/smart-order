'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/stores/authStore';
import { authApi } from '@/app/lib/api';
import toast from 'react-hot-toast';

export function useAuth() {
  const router = useRouter();
  const { accessToken, user, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password);
      const { access_token, user: userData } = response;
      setAuth(userData, access_token);
      toast.success(`Xin chào, ${userData.username}!`);
      router.replace('/dashboard/orders');
      return true;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Đăng nhập thất bại';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    clearAuth();
    toast.success('Đã đăng xuất');
    // Use replace to prevent back-button returning to dashboard after logout
    router.replace('/login');
  };

  /**
   * Case-insensitive role check.
   * Backend returns roles as ["Admin", "Cashier", "Kitchen", "Waiter"]
   */
  const hasRole = (roleName: string): boolean => {
    if (!user?.roles) return false;
    const target = roleName.toLowerCase();
    return user.roles.some((r: string) => r.toLowerCase() === target);
  };

  const isAdmin = hasRole('admin');
  const isCashier = hasRole('cashier');
  const isKitchen = hasRole('kitchen');
  const isWaiter = hasRole('waiter');

  /**
   * Check if user can manage (CRUD) resources — only Admin
   */
  const canManage = isAdmin;
  const canUpdateTableStatus = isAdmin || isCashier || isWaiter;
  const canViewReports = isAdmin;

  return {
    token: accessToken,
    user,
    isAuthenticated,
    isAdmin,
    isCashier,
    isKitchen,
    isWaiter,
    hasRole,
    canManage,
    canUpdateTableStatus,
    canViewReports,
    login,
    logout,
  };
}

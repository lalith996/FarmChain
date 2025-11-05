import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';

export const useAuth = (requireAuth = false) => {
  const router = useRouter();
  const { user, token, isAuthenticated, setUser, logout } = useAuthStore();

  useEffect(() => {
    // If authentication is required but user is not authenticated, redirect to login
    if (requireAuth && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [requireAuth, isAuthenticated, router]);

  const checkAuth = async () => {
    if (!token) {
      return false;
    }

    try {
      const response = await authAPI.getMe();
      setUser(response.data);
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
      return false;
    }
  };

  const requireRole = (allowedRoles: string[]) => {
    if (!user) {
      router.push('/auth/login');
      return false;
    }

    if (!allowedRoles.includes(user.role)) {
      router.push('/dashboard');
      return false;
    }

    return true;
  };

  return {
    user,
    token,
    isAuthenticated,
    checkAuth,
    logout,
    requireRole,
  };
};

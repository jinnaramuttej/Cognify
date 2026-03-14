/**
 * useBypassAuth Hook
 * Provides easy access to bypass/demo authentication
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDemoModeStore, getBypassUser, isBypassActive } from '@/lib/demo-mode';
import { useAuth } from '@/contexts/AuthContext';

export function useBypassAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDemoMode, demoUser, enableDemoMode } = useDemoModeStore();
  const { user } = useAuth();

  // Auto-enable demo mode for direct dashboard access
  useEffect(() => {
    // If user is trying to access protected routes without auth
    const protectedRoutes = ['/dashboard', '/admin', '/notes', '/videos', '/batches'];
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isProtectedRoute && !user && !isDemoMode) {
      console.log('🔓 Auto-enabling demo mode for protected route:', pathname);
      enableDemoMode();
    }
  }, [pathname, user, isDemoMode, enableDemoMode]);

  const bypassLogin = (role: 'student' | 'teacher' | 'admin' = 'student') => {
    if (!isDemoMode) {
      enableDemoMode();
      useDemoModeStore.getState().setDemoRole(role);
    }
    router.push('/dashboard');
  };

  const isBypassEnabled = isDemoMode || isBypassActive();
  const bypassUser = demoUser || getBypassUser();

  return {
    isBypassEnabled,
    bypassUser,
    bypassLogin,
    enableDemoMode: () => {
      enableDemoMode();
      router.push('/dashboard');
    },
  };
}

export default useBypassAuth;

'use client';

/**
 * RoleProtectedRoute Component
 * 
 * Wrapper to protect routes based on user role
 * Redirects unauthorized users to appropriate pages
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasRouteAccess, getRedirectForRole } from '@/lib/role-utils';
import { Loader2 } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('student' | 'teacher' | 'admin')[];
  fallback?: React.ReactNode;
}

export default function RoleProtectedRoute({
  children,
  allowedRoles,
  fallback,
}: RoleProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Not authenticated
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Check role-based access
    if (allowedRoles && !allowedRoles.includes(user?.role || 'student')) {
      const redirectPath = getRedirectForRole(user?.role);
      router.push(redirectPath);
      return;
    }

    // Check route access using pathname
    if (!hasRouteAccess(pathname, user?.role)) {
      const redirectPath = getRedirectForRole(user?.role);
      router.push(redirectPath);
    }
  }, [loading, isAuthenticated, user, router, pathname, allowedRoles]);

  // Show loading state
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Check role access
  if (allowedRoles && !allowedRoles.includes(user?.role || 'student')) {
    return null;
  }

  // Check route access
  if (!hasRouteAccess(pathname, user?.role)) {
    return null;
  }

  return <>{children}</>;
}

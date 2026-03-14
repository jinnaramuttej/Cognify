'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  fallback,
}: ProtectedRouteProps) {
  const { user, isLoading, isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();

  // Show loading skeleton while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a1a]">
        <div className="max-w-7xl mx-auto p-6">
          <Skeleton className="h-16 w-full mb-4 bg-[#0a0a0a] rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 w-full bg-[#0a0a0a] rounded-lg" />
            <Skeleton className="h-64 w-full bg-[#ia1a1a1a1a] rounded-lg" />
            <Skeleton className="h-64 w-full bg-[#0a0a0a] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to auth
  if (!isAuthenticated) {
    router.push('/auth');
    return null;
  }

  // Admin route but not admin
  if (requireAdmin && !isAdmin) {
    router.push('/dashboard');
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-[#D4AF37] mb-4">Access Denied</h1>
          <p className="text-[#606060]">You don't have permission to access this page.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 px-6 py-2 bg-[#D4AF37] text-black hover:bg-[#aa8c2d]"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Authenticated - render children
  return <>{children}</>;
}

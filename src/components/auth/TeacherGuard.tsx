'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Route guard for teacher-only pages.
 * Checks user.role === 'teacher' | 'admin' OR user.isAdmin.
 * Redirects unauthenticated users to /auth/login, non-teachers to /dashboard.
 */
export default function TeacherGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const isTeacher =
    user?.role === 'teacher' || user?.role === 'admin' || user?.isAdmin === true;

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace('/auth/login');
    } else if (!isTeacher) {
      router.replace('/dashboard');
    }
  }, [loading, isAuthenticated, isTeacher, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !isTeacher) return null;

  return <>{children}</>;
}

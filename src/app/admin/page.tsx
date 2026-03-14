'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Old admin dashboard removed. Teachers/admins redirected to /teacher.
export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.isAdmin || user?.role === 'teacher' || user?.role === 'admin') {
      router.replace('/teacher');
    } else {
      router.replace('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}

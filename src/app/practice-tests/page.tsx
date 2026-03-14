'use client';

/**
 * Practice Tests Page (Renamed from Practice Quizzes)
 * 
 * Redirects to /tests with practice mode
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PracticeTestsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to tests page
    router.push('/tests?mode=practice');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to Practice Tests...</p>
      </div>
    </div>
  );
}

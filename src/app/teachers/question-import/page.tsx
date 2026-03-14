'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect old /teachers/question-import -> /teacher/upload
export default function OldQuestionImport() {
  const router = useRouter();
  useEffect(() => { router.replace('/teacher/upload'); }, [router]);
  return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Redirecting...</p></div>;
}

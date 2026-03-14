'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect old /teachers/question-bank -> /teacher/questions
export default function OldQuestionBank() {
  const router = useRouter();
  useEffect(() => { router.replace('/teacher/questions'); }, [router]);
  return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Redirecting...</p></div>;
}

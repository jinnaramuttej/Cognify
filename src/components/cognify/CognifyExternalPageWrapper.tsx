'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface CognifyExternalPageWrapperProps {
  children: React.ReactNode;
}

const EXTERNAL_PAGES = {
  notes: 'notes.html',
  videos: 'videos.html',
  quizzes: 'quizzes.html',
  formulas: 'formulas.html',
  profile: 'profile.html',
} as const;

export default function CognifyExternalPageWrapper({
  children,
}: CognifyExternalPageWrapperProps) {
  const pathname = usePathname();
  const externalPage = pathname?.split('/').pop();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!externalPage || !EXTERNAL_PAGES[externalPage as keyof typeof EXTERNAL_PAGES]) {
      return;
    }
    setLoading(true);
    const pageFile = EXTERNAL_PAGES[externalPage as keyof typeof EXTERNAL_PAGES];
    fetch(`/external/${pageFile}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${externalPage}`);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load page');
        setLoading(false);
      });
  }, [externalPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Page</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button onClick={() => setError(null)} className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg">Dismiss</button>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-slate-50">{children}</div>;
}

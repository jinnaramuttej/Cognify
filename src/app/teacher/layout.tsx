'use client';

import TeacherGuard from '@/components/auth/TeacherGuard';
import TeacherSidebar from '@/components/teacher/TeacherSidebar';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <TeacherGuard>
      <div className="flex min-h-screen bg-[var(--background)]">
        <TeacherSidebar />
        <div className="flex-1 transition-all duration-300 ease-in-out">
          <main className="p-4 md:p-8 pt-24 md:pt-24 max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </TeacherGuard>
  );
}

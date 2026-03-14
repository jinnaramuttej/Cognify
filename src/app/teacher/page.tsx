'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useIngestionStore } from '@/lib/ingestion-store';
import { supabase } from '@/lib/supabase';
import {
  getTeacherStats,
  getQuestionDistribution,
  getActiveBatches,
  getRecentTests,
  type TeacherStats,
  type SubjectDistribution,
  type BatchInfo,
  type RecentTest,
} from '@/lib/teacher-service';
import TeacherDashboardHeader from './components/TeacherDashboardHeader';
import TeacherQuickActions from './components/TeacherQuickActions';
import TeacherStatsCards from './components/TeacherStatsCards';
import RecentPDFImports from './components/RecentPDFImports';
import QuestionBankOverview from './components/QuestionBankOverview';
import ActiveBatchesPanel from './components/ActiveBatchesPanel';
import RecentTestsPanel from './components/RecentTestsPanel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const ingestionLogs = useIngestionStore((s) => s.logs);

  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [distribution, setDistribution] = useState<SubjectDistribution[]>([]);
  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const [loading, setLoading] = useState(true);

  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [batchDesc, setBatchDesc] = useState('');
  const [creatingBatch, setCreatingBatch] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    const [statsRes, distRes, batchRes, testsRes] = await Promise.all([
      getTeacherStats(user.id),
      getQuestionDistribution(),
      getActiveBatches(user.id),
      getRecentTests(user.id),
    ]);

    if (statsRes.data) setStats(statsRes.data);
    setDistribution(distRes.data);
    setBatches(batchRes.data);
    setRecentTests(testsRes.data);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateBatch = async () => {
    if (!batchName.trim() || !user?.id) return;
    setCreatingBatch(true);

    const inviteCode = crypto.randomUUID().slice(0, 8).toUpperCase();
    const { error } = await supabase.from('squads').insert({
      name: batchName.trim(),
      description: batchDesc.trim() || null,
      created_by: user.id,
      invite_code: inviteCode,
    });

    if (!error) {
      setBatchModalOpen(false);
      setBatchName('');
      setBatchDesc('');
      loadData();
    }
    setCreatingBatch(false);
  };

  const teacherName = user?.full_name || user?.name || 'Teacher';
  const examFocus = user?.class === '12' ? 'JEE Main' : user?.class === '11' ? 'Foundation' : 'JEE Main';

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <TeacherDashboardHeader teacherName={teacherName} examFocus={examFocus} />
          <TeacherQuickActions onAddBatch={() => setBatchModalOpen(true)} />
          <TeacherStatsCards stats={stats} loading={loading} />
          <RecentPDFImports logs={ingestionLogs} loading={false} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuestionBankOverview distribution={distribution} loading={loading} />
            <div className="grid grid-cols-1 gap-6">
              <ActiveBatchesPanel batches={batches} loading={loading} />
              <RecentTestsPanel tests={recentTests} loading={loading} />
            </div>
          </div>
        </motion.div>
      </div>

      <Dialog open={batchModalOpen} onOpenChange={setBatchModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Batch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="batch-name">Batch Name</Label>
              <Input
                id="batch-name"
                placeholder="e.g. JEE 2026 Batch"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch-desc">Description (optional)</Label>
              <Textarea
                id="batch-desc"
                placeholder="Brief description of this batch"
                value={batchDesc}
                onChange={(e) => setBatchDesc(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBatchModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBatch} disabled={!batchName.trim() || creatingBatch}>
                {creatingBatch ? 'Creating...' : 'Create Batch'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

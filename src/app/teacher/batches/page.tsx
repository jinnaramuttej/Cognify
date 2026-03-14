'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  getAllBatches,
  getBatchDetails,
  updateBatch,
  deleteBatch,
  type BatchInfo,
  type BatchDetail,
} from '@/lib/teacher-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Plus,
  Copy,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Clock,
  Mail,
  ArrowLeft,
} from 'lucide-react';

export default function BatchManagementPage() {
  const { user } = useAuth();

  const [batches, setBatches] = useState<(BatchInfo & { invite_code: string; description: string | null })[]>([]);
  const [loading, setLoading] = useState(true);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editBatch, setEditBatch] = useState<{ id: string; name: string; description: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Detail view
  const [viewBatch, setViewBatch] = useState<BatchDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadBatches = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await getAllBatches(user.id);
    setBatches(data);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  const handleCreate = async () => {
    if (!newName.trim() || !user?.id) return;
    setCreating(true);
    const inviteCode = crypto.randomUUID().slice(0, 8).toUpperCase();
    const { error } = await supabase.from('squads').insert({
      name: newName.trim(),
      description: newDesc.trim() || null,
      created_by: user.id,
      invite_code: inviteCode,
    });
    if (!error) {
      setCreateOpen(false);
      setNewName('');
      setNewDesc('');
      loadBatches();
    }
    setCreating(false);
  };

  const handleEdit = async () => {
    if (!editBatch) return;
    setSaving(true);
    const { error } = await updateBatch(editBatch.id, { name: editBatch.name, description: editBatch.description });
    if (!error) {
      setEditOpen(false);
      setEditBatch(null);
      loadBatches();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await deleteBatch(id);
    if (!error) {
      setBatches((prev) => prev.filter((b) => b.id !== id));
      if (viewBatch?.id === id) setViewBatch(null);
    }
    setDeletingId(null);
  };

  const handleViewDetails = async (id: string) => {
    setLoadingDetail(true);
    const { data } = await getBatchDetails(id);
    setViewBatch(data);
    setLoadingDetail(false);
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Batch Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{batches.length} batches</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />New Batch
          </Button>
        </motion.div>

        <AnimatePresence mode="wait">
          {viewBatch ? (
            /* Detail View */
            <motion.div key="detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <Button variant="ghost" onClick={() => setViewBatch(null)}>
                <ArrowLeft className="h-4 w-4 mr-2" />Back to all batches
              </Button>

              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{viewBatch.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono gap-1">
                        Code: {viewBatch.invite_code}
                        <button onClick={() => copyInviteCode(viewBatch.invite_code)}>
                          <Copy className="h-3 w-3" />
                        </button>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {viewBatch.description && (
                    <p className="text-sm text-muted-foreground mb-4">{viewBatch.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground mb-4">
                    Created {formatDate(viewBatch.created_at)} · {viewBatch.members.length} members
                  </p>

                  {viewBatch.members.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p>No students have joined yet</p>
                      <p className="text-xs mt-1">Share the invite code: <span className="font-mono font-bold">{viewBatch.invite_code}</span></p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewBatch.members.map((m) => (
                          <TableRow key={m.user_id}>
                            <TableCell className="font-medium">{m.full_name}</TableCell>
                            <TableCell className="text-muted-foreground">{m.email}</TableCell>
                            <TableCell><Badge variant="outline" className="capitalize">{m.role}</Badge></TableCell>
                            <TableCell className="text-muted-foreground">{formatDate(m.joined_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* List View */
            <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : batches.length === 0 ? (
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-20">
                    <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="text-foreground font-medium">No batches yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Create your first batch to organize students</p>
                    <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />Create Batch
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {batches.map((batch) => (
                    <motion.div key={batch.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                        <CardContent className="pt-5 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-foreground truncate">{batch.name}</h3>
                              {batch.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{batch.description}</p>
                              )}
                            </div>
                            <Badge variant="secondary" className="ml-2 whitespace-nowrap">
                              {batch.studentCount} students
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Created {formatDate(batch.lastActivity)}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <Badge variant="outline" className="font-mono text-xs gap-1">
                              {batch.invite_code}
                              <button onClick={() => copyInviteCode(batch.invite_code)}>
                                <Copy className="h-2.5 w-2.5" />
                              </button>
                            </Badge>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleViewDetails(batch.id)}>
                                {loadingDetail ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditBatch({ id: batch.id, name: batch.name, description: batch.description || '' }); setEditOpen(true); }}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" disabled={deletingId === batch.id} onClick={() => handleDelete(batch.id)}>
                                {deletingId === batch.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Modal */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Create New Batch</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Batch Name *</Label>
                <Input placeholder="e.g. JEE 2026 Batch A" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea placeholder="Brief description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={!newName.trim() || creating}>
                  {creating ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={editOpen} onOpenChange={(open) => { if (!open) { setEditOpen(false); setEditBatch(null); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Edit Batch</DialogTitle></DialogHeader>
            {editBatch && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Batch Name</Label>
                  <Input value={editBatch.name} onChange={(e) => setEditBatch({ ...editBatch, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={editBatch.description} onChange={(e) => setEditBatch({ ...editBatch, description: e.target.value })} rows={3} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setEditOpen(false); setEditBatch(null); }}>Cancel</Button>
                  <Button onClick={handleEdit} disabled={!editBatch.name.trim() || saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

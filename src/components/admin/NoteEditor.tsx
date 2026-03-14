'use client'

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function NoteEditor({ open, onClose, initial, onSaved }: any) {
  const { register, handleSubmit, setValue, reset } = useForm({ defaultValues: initial || {} });
  const [attachments, setAttachments] = useState<string[]>(initial?.attachments || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    reset(initial || {});
    setAttachments(initial?.attachments || []);
  }, [initial, reset]);

  async function uploadFile(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('owner', localStorage.getItem('cognify-auth-id') || '');
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const js = await res.json();
    if (js?.url) return js.url;
    throw new Error('Upload failed');
  }

  const onAttach = async (e: any) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      setLoading(true);
      const url = await uploadFile(f);
      setAttachments((s) => [url, ...s]);
    } catch (err) {
      alert('Upload failed');
    } finally { setLoading(false); }
  };

  const onRemove = (idx: number) => {
    setAttachments((s) => s.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const payload = { ...data, attachments };
      let res;
      if (initial?.id) {
        res = await fetch(`/api/admin/notes/${initial.id}`, { method: 'PATCH', body: JSON.stringify(payload), headers: { 'content-type': 'application/json' } });
      } else {
        res = await fetch('/api/admin/notes', { method: 'POST', body: JSON.stringify(payload), headers: { 'content-type': 'application/json' } });
      }
      const js = await res.json();
      if (js?.data) {
        onSaved(js.data);
        onClose();
      } else {
        alert('Save failed');
      }
    } catch (e) {
      alert('Error: ' + String(e));
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial?.id ? 'Edit Note' : 'Create Note'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-2">
          <div className="grid grid-cols-2 gap-2">
            <Input {...register('title', { required: true })} placeholder="Title" />
            <select {...register('class')} className="input">
              <option value="11">11th</option>
              <option value="12">12th</option>
              <option value="Dropper">Dropper</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input {...register('subject')} className="input" placeholder="Subject" />
            <select {...register('stream')} className="input">
              <option>PCM</option>
              <option>BiPC</option>
              <option>Commerce</option>
              <option>Arts</option>
            </select>
          </div>

          <Textarea {...register('content')} placeholder="Content (short summary)" />

          <div>
            <div className="flex items-center gap-2">
              <label className="btn btn-ghost cursor-pointer">
                <input type="file" className="hidden" onChange={onAttach} />
                Attach file
              </label>
              {loading && <span className="text-sm text-[var(--muted)]">Uploading...</span>}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {attachments.map((a, i) => (
                <div key={a} className="border rounded p-2 text-xs">
                  {a.match(/\.(jpg|jpeg|png|gif)$/i) ? <img src={a} className="w-full h-24 object-cover" alt="att" /> : <div className="text-[var(--muted)]">{a.split('/').pop()}</div>}
                  <div className="mt-2 flex justify-between items-center">
                    <a href={a} target="_blank" rel="noreferrer" className="text-xs underline">View</a>
                    <button type="button" className="text-xs text-red-400" onClick={() => onRemove(i)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{initial?.id ? 'Save Changes' : 'Create Note'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

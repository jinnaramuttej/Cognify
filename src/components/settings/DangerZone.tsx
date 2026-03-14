'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function DangerZone() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const onDelete = () => {
    // TODO: implement deletion flow (3-step confirmation + server)
    alert('Account deletion requested (stub)');
  };

  return (
    <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
      <h4 className="font-semibold text-[var(--danger)]">Danger Zone</h4>
      <p className="text-xs text-[var(--muted)]">Delete or transfer your account. Actions are irreversible.</p>
      <div className="mt-3">
        <Button variant="destructive" onClick={() => setOpen(true)}>Delete Account</Button>
      </div>

      <ConfirmModal open={open} onClose={() => setOpen(false)} title="Delete Account" description="Type DELETE MY ACCOUNT to confirm" confirmInputLabel={'Type "DELETE MY ACCOUNT"'} onConfirm={() => { onDelete(); setOpen(false); }} />
    </div>
  );
}


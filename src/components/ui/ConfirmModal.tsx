'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from 'react';

export default function ConfirmModal({ open, onClose, title, description, onConfirm, confirmInputLabel }: any) {
  const [text, setText] = useState('');
  const canConfirm = !confirmInputLabel || text.trim() === 'DELETE MY ACCOUNT' || text.trim().length > 0;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {confirmInputLabel && (
          <div className="grid gap-2 py-4">
            <Label htmlFor="confirm-input">{confirmInputLabel}</Label>
            <Input
              id="confirm-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='Type "DELETE MY ACCOUNT" to confirm'
            />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => { onConfirm(); onClose(); }}
            disabled={!canConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

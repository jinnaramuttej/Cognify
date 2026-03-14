'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import DangerZone from '../DangerZone';
import { supabase } from '@/lib/supabaseClient';

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (pw.length > 12) score++;
  if (score <= 1) return 'Weak';
  if (score <= 3) return 'Medium';
  return 'Strong';
}

export default function SecurityTab() {
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [twofa, setTwofa] = useState(false);
  const [devices] = useState([{
    id: 'laptop', name: 'Chrome - Laptop', last: '2 hours ago', location: 'Hyderabad, IN'
  }]);

  const onPassword = async (data: any) => {
    if (data.new !== data.confirm) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.new });
      if (error) throw error;

      toast.success('Password updated successfully');
      reset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-semibold text-lg">Password Management</h3>
        <form onSubmit={handleSubmit(onPassword)} className="mt-4 space-y-4 max-w-md">
          <div className="grid gap-2">
            <Label htmlFor="new">New Password</Label>
            <Input
              id="new"
              type="password"
              placeholder="Enter new password"
              {...register('new', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message: 'Password must contain uppercase, lowercase, number and special char'
                }
              })}
            />
            {errors.new && <p className="text-xs text-red-500">{errors.new.message as string}</p>}
            <p className="text-xs text-muted-foreground">
              Strength: <strong className={
                passwordStrength(watch('new') || '') === 'Strong' ? 'text-green-600' :
                  passwordStrength(watch('new') || '') === 'Medium' ? 'text-yellow-600' : 'text-red-600'
              }>{passwordStrength(watch('new') || '')}</strong>
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm">Confirm New Password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Confirm new password"
              {...register('confirm', {
                required: 'Please confirm your password',
                validate: (val: string) => {
                  if (watch('new') !== val) {
                    return "Passwords do not match";
                  }
                }
              })}
            />
            {errors.confirm && <p className="text-xs text-red-500">{errors.confirm.message as string}</p>}
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Change Password'}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p className="font-medium">Password Requirements:</p>
            <ul className="list-disc list-inside space-y-0.5 pl-2">
              <li>At least 8 characters</li>
              <li>One uppercase letter (A-Z)</li>
              <li>One lowercase letter (a-z)</li>
              <li>One number (0-9)</li>
              <li>One special character (@$!%*?&)</li>
            </ul>
          </div>
        </form>
      </section>

      <section>
        <h3 className="font-semibold text-lg">Two-Factor Authentication (2FA)</h3>
        <p className="text-sm text-[var(--muted)]">Status: {twofa ? 'ON' : 'OFF'}</p>
        <div className="mt-3 flex items-center gap-3">
          <label className="flex items-center gap-2"><input type="checkbox" checked={twofa} onChange={(e) => setTwofa(e.target.checked)} /> Enable 2FA</label>
          <Button variant="ghost">Setup (QR)</Button>
          <Button variant="outline">View backup codes</Button>
        </div>

        <div className="mt-4">
          <h4 className="font-medium">Active Sessions</h4>
          <ul className="mt-2 space-y-2">
            {devices.map((d) => (
              <li key={d.id} className="flex items-center justify-between bg-[var(--card)] p-3 rounded-lg border border-[var(--border)]">
                <div>
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-sm text-[var(--muted)]">Last active: {d.last} • {d.location}</div>
                </div>
                <div>
                  <Button variant="ghost">Log out</Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <Button variant="destructive">Log out from all devices</Button>
          </div>
        </div>
      </section>

      <section className="pt-6 border-t border-[var(--border)]">
        <h3 className="font-semibold text-lg text-red-600 mb-4">Danger Zone</h3>
        <DangerZone />
      </section>
    </div>
  );
}


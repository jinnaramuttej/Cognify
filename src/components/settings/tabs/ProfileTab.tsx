import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import AvatarUploader from '@/components/ui/AvatarUploader';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type FormData = {
  fullName: string;
  class: '11' | '12';
  stream: string;
  avatar_url?: string;
};

export default function ProfileTab() {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      fullName: user?.full_name || '',
      class: (user?.class as any) || '12',
      stream: user?.stream || 'PCM',
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.full_name || '',
        class: (user.class as any) || '12',
        stream: user.stream || 'PCM',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await updateUserProfile({
        full_name: data.fullName,
        class: data.class,
        stream: data.stream,
      });
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpdate = (url: string) => {
    updateUserProfile({ avatar_url: url });
  };

  if (!user) return <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin" /></div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex flex-col items-center gap-4">
          <AvatarUploader
            initialUrl={user.avatar_url}
            userId={user.id}
            onUploadComplete={handleAvatarUpdate}
          />
        </div>

        <div className="flex-1 w-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--muted)]">Full Name</label>
              <input {...register('fullName')} className="input w-full" placeholder="Your full name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--muted)]">Email Address (Read-only)</label>
              <input value={user.email} disabled className="input w-full bg-secondary/30 cursor-not-allowed opacity-70" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--muted)]">Class</label>
              <select {...register('class')} className="input w-full">
                <option value="11">Class 11th</option>
                <option value="12">Class 12th</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--muted)]">Stream / Subject Group</label>
              <select {...register('stream')} className="input w-full">
                <option value="PCM">PCM (Physics, Chemistry, Maths)</option>
                <option value="PCB">PCB (Physics, Chemistry, Biology)</option>
                <option value="Commerce">Commerce</option>
                <option value="Arts">Arts / Humanities</option>
              </select>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full md:w-auto px-10">
            {loading ? <><Loader2 className="mr-2 h-4 animate-spin" /> Saving...</> : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}


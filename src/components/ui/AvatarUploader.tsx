'use client'

import { useState, useRef, useEffect } from 'react';
import { User, Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface AvatarUploaderProps {
  initialUrl?: string;
  userId: string;
  onUploadComplete: (url: string) => void;
}

export default function AvatarUploader({ initialUrl, userId, onUploadComplete }: AvatarUploaderProps) {
  const [preview, setPreview] = useState<string | null>(initialUrl || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialUrl) setPreview(initialUrl);
  }, [initialUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File too large (Max 2MB)');
      return;
    }

    // Set preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload to Supabase Storage
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);
    } catch (error: any) {
      console.error('Error uploading avatar:', error.message);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-dashed border-blue-500/40 flex items-center justify-center cursor-pointer overflow-hidden bg-secondary/30 hover:border-blue-500 transition-all relative shadow-xl"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        {preview ? (
          <img src={preview} className="w-full h-full object-cover" alt="Profile" />
        ) : (
          <User className="w-16 h-16 text-blue-500/50" />
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-full z-20">
            <Loader2 className="animate-spin text-blue-500 w-8 h-8 mb-2" />
            <span className="text-[10px] text-white font-bold">UPLOADING</span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full z-10 scale-110 group-hover:scale-100 duration-300">
          <div className="bg-blue-600 p-4 rounded-full shadow-lg">
            <Camera className="text-white w-8 h-8" strokeWidth={2.5} />
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center">
        <p className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Tap to Change Profile Photo</p>
        <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Recommended: Square JPG or PNG, max 2MB</p>
      </div>
    </div>
  );
}

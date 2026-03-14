import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file') as File;
    const userId = String(form.get('userId'));

    if (!file || !(file instanceof File)) return NextResponse.json({ error: 'File missing' }, { status: 400 });
    if (!userId) return NextResponse.json({ error: 'userId missing' }, { status: 400 });

    const name = `${userId}/${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();
    const { data, error } = await supabaseServer.storage.from('avatars').upload(name, Buffer.from(buffer), { upsert: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const { data: urlData } = supabaseServer.storage.from('avatars').getPublicUrl(name);

    // Update profile
    await supabaseServer.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', userId);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
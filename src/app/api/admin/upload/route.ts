import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file') as File;
    const owner = String(form.get('owner'));

    if (!file || !(file instanceof File)) return NextResponse.json({ error: 'File missing' }, { status: 400 });
    if (!owner) return NextResponse.json({ error: 'owner missing' }, { status: 400 });

    const name = `${owner}/${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabaseServer.storage.from('notes').upload(name, Buffer.from(buffer), { upsert: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const { data: urlData } = supabaseServer.storage.from('notes').getPublicUrl(name);

    // record metadata
    await supabaseServer.from('uploads').insert([{ owner, bucket: 'notes', path: name, public_url: urlData.publicUrl }]);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, description } = await request.json();

        if (!name?.trim()) {
            return NextResponse.json({ error: 'Squad name is required' }, { status: 400 });
        }

        // 1. Generate unique 6-char invite code
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // 2. Insert new squad
        const { data: squad, error: insertError } = await supabase
            .from('squads')
            .insert({
                name,
                description,
                created_by: session.user.id,
                invite_code: inviteCode
            })
            .select('id')
            .single();

        if (insertError) throw insertError;

        // 3. Add creator as admin
        const { error: adminError } = await supabase
            .from('squad_members')
            .insert({
                squad_id: squad.id,
                user_id: session.user.id,
                role: 'admin'
            });

        if (adminError) throw adminError;

        return NextResponse.json({ success: true, squad_id: squad.id, invite_code: inviteCode });

    } catch (error: any) {
        console.error('Error creating squad:', error);
        return NextResponse.json({ error: 'Failed to create squad' }, { status: 500 });
    }
}

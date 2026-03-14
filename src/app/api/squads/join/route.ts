import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { inviteCode } = await request.json();

        if (!inviteCode) {
            return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
        }

        // 1. Find the squad
        const { data: squad, error: squadError } = await supabase
            .from('squads')
            .select('id')
            .eq('invite_code', inviteCode)
            .single();

        if (squadError || !squad) {
            return NextResponse.json({ error: 'Invalid invite code or squad not found' }, { status: 404 });
        }

        // 2. Check if already a member
        const { data: existingMember } = await supabase
            .from('squad_members')
            .select('squad_id')
            .eq('squad_id', squad.id)
            .eq('user_id', session.user.id)
            .single();

        if (existingMember) {
            return NextResponse.json({ message: 'Already a member' }, { status: 200 });
        }

        // 3. Join the squad
        const { error: joinError } = await supabase
            .from('squad_members')
            .insert({
                squad_id: squad.id,
                user_id: session.user.id,
                role: 'member'
            });

        if (joinError) throw joinError;

        return NextResponse.json({ success: true, squad_id: squad.id });

    } catch (error: any) {
        console.error('Error joining squad:', error);
        return NextResponse.json({ error: 'Failed to join squad' }, { status: 500 });
    }
}

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { test_id, score } = await request.json();

        if (!test_id) {
            return NextResponse.json({ error: 'Missing test_id' }, { status: 400 });
        }

        // 1. Call the database function to update the user's daily streak
        const { error: streakError } = await supabase.rpc('update_streak');
        if (streakError) {
            console.error('Streak update failed:', streakError);
            // Non-fatal, we continue
        }

        // 2. Fetch active challenges the user is part of (global or squad-based)
        // We update their highest_score if necessary

        // We can do this in the background, but for simplicity here we do a direct insert/update
        // if the user is in an active global challenge
        const { data: activeChallenges } = await supabase
            .from('challenges')
            .select('id')
            .lte('start_date', new Date().toISOString())
            .gte('end_date', new Date().toISOString());

        if (activeChallenges && activeChallenges.length > 0) {
            for (const challenge of activeChallenges) {
                // Instead of complex logic here, we just upsert the score if it's higher
                const { data: currentRecord } = await supabase
                    .from('challenge_participants')
                    .select('highest_score, id')
                    .eq('challenge_id', challenge.id)
                    .eq('user_id', session.user.id)
                    .single();

                if (!currentRecord) {
                    await supabase.from('challenge_participants').insert({
                        challenge_id: challenge.id,
                        user_id: session.user.id,
                        highest_score: score,
                        tests_completed: 1
                    });
                    // Trigger percentile recalc
                    await supabase.rpc('calculate_percentiles_for_challenge', { v_challenge_id: challenge.id });
                } else if (score > (currentRecord.highest_score || 0)) {
                    await supabase.from('challenge_participants').update({
                        highest_score: score,
                        tests_completed: supabase.rpc('increment', { row_id: currentRecord.id }) // Mock rpc or direct update
                    }).eq('id', currentRecord.id);
                    // Trigger percentile recalc
                    await supabase.rpc('calculate_percentiles_for_challenge', { v_challenge_id: challenge.id });
                }
            }
        }

        return NextResponse.json({ success: true, streak_updated: true });

    } catch (error: any) {
        console.error('Error tracking test completion:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

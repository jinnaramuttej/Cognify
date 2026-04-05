/**
 * System Configuration Status API
 * 
 * GET /api/system/config-status
 * 
 * Returns environment configuration status (without exposing keys)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const config = [
      {
        name: 'Featherless API Key',
        key: 'FEATHERLESS_API_KEY',
        status: (process.env.FEATHERLESS_API_KEY || process.env.STITCH_API_KEY || process.env.AI_API_KEY) ? 'configured' : 'missing',
        required: true,
        description: 'Required for AI-powered features (Cogni tutor, notes conversion, question parsing). STITCH_API_KEY is accepted as an alias.',
        setupLink: 'https://featherless.ai',
      },
      {
        name: 'Supabase URL',
        key: 'NEXT_PUBLIC_SUPABASE_URL',
        status: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        required: true,
        description: 'Database connection URL',
        setupLink: 'https://supabase.com/dashboard',
      },
      {
        name: 'Supabase Anon Key',
        key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        status: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
        required: true,
        description: 'Public API key for Supabase',
      },
    ];

    const missingRequired = config.filter(c => c.required && c.status === 'missing');

    return NextResponse.json({
      config,
      allConfigured: missingRequired.length === 0,
      missingRequired: missingRequired.map(c => c.name),
    });

  } catch (error) {
    console.error('Config check error:', error);
    return NextResponse.json({ error: 'Failed to check configuration' }, { status: 500 });
  }
}

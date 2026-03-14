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
        name: 'GROQ API Key',
        key: 'GROQ_API_KEY',
        status: process.env.GROQ_API_KEY ? 'configured' : 'missing',
        required: true,
        description: 'Required for AI-powered features (Cogni tutor, notes conversion, question parsing)',
        setupLink: 'https://console.groq.com/keys',
      },
      {
        name: 'Gemini API Key',
        key: 'GEMINI_API_KEY',
        status: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
        required: false,
        description: 'Alternative AI provider for enhanced features',
        setupLink: 'https://makersuite.google.com/app/apikey',
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

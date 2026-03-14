/**
 * POST /api/adaptive/seed
 * Seeds the database with sample items for testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { seedAdaptiveItems } from '@/lib/adaptive/seed';

export async function POST(request: NextRequest) {
  try {
    const result = await seedAdaptiveItems();
    
    return NextResponse.json({
      success: true,
      message: `Seeded ${result.total} items (${result.created} created, ${result.updated} updated)`,
      ...result,
    });
    
  } catch (error) {
    console.error('[Seed] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to seed items',
    }, { status: 500 });
  }
}

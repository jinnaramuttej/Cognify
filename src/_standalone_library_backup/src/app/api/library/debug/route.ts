import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get actual model names from Prisma
    const prismaKeys = Object.keys(db)
    
    // Test actual queries
    let subjectCount = 0
    let chapterCount = 0
    let resourceCount = 0
    
    try {
      subjectCount = await db.subject.count()
    } catch (e) {
      // ignore
    }
    
    try {
      chapterCount = await db.chapter.count()
    } catch (e) {
      // ignore
    }
    
    try {
      resourceCount = await db.libraryResource.count()
    } catch (e) {
      // ignore
    }
    
    return NextResponse.json({
      prismaKeys: prismaKeys.filter(k => !k.startsWith('_') && !k.startsWith('$')),
      counts: {
        subject: subjectCount,
        chapter: chapterCount,
        libraryResource: resourceCount
      },
      hasSubject: 'subject' in db,
      hasChapter: 'chapter' in db,
      hasLibraryResource: 'libraryResource' in db,
      subjectType: typeof (db as Record<string, unknown>).subject,
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

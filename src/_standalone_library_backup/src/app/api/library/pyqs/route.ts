import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'
    const year = searchParams.get('year')
    const exam = searchParams.get('exam')
    const subject = searchParams.get('subject')
    const difficulty = searchParams.get('difficulty')

    // For now, return mock PYQs since we don't have a dedicated PYQ table
    // In production, this would fetch from a PYQ table
    const resources = await db.libraryResource.findMany({
      where: {
        resourceType: 'PYQ',
        ...(year && { year: parseInt(year) }),
        ...(exam && { exam }),
        ...(difficulty && { difficulty }),
      },
      include: {
        chapter: {
          include: { subject: true }
        }
      },
      take: 50
    })

    // Get bookmarks
    const bookmarks = await db.libraryBookmark.findMany({
      where: { userId },
      select: { resourceId: true }
    })
    const bookmarkedIds = new Set(bookmarks.map(b => b.resourceId))

    // Transform to PYQ format
    const pyqs = resources.map(r => ({
      id: r.id,
      question: r.title,
      solution: r.content || null,
      subject: r.chapter?.subject?.name || 'Unknown',
      chapter: r.chapter?.name || 'Unknown',
      year: r.year || 2023,
      exam: r.exam,
      difficulty: r.difficulty,
      marks: 4,
      topic: r.description || '',
      isBookmarked: bookmarkedIds.has(r.id),
      attemptCount: Math.floor(Math.random() * 50),
      correctRate: Math.floor(50 + Math.random() * 40),
      createdAt: r.createdAt.toISOString()
    }))

    return NextResponse.json({ pyqs })
  } catch (error) {
    console.error('Error fetching PYQs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch PYQs' },
      { status: 500 }
    )
  }
}

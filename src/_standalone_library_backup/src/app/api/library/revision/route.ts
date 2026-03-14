import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'

    // Get revision schedule with resource details
    const revisions = await db.revisionSchedule.findMany({
      where: { userId },
      include: {
        resource: {
          include: {
            chapter: {
              include: { subject: true }
            }
          }
        }
      },
      orderBy: { nextRevisionAt: 'asc' }
    })

    const now = new Date()

    // Transform and add computed fields
    const transformedRevisions = revisions.map((r) => {
      const nextDate = new Date(r.nextRevisionAt)
      const isOverdue = nextDate < now

      // Calculate priority based on overdue status and confidence
      let priority: 'high' | 'medium' | 'low' = 'medium'
      if (isOverdue) priority = 'high'
      else if (r.confidence >= 80) priority = 'low'

      return {
        id: r.id,
        resourceId: r.resourceId,
        resource: r.resource ? {
          id: r.resource.id,
          title: r.resource.title,
          subject: r.resource.chapter?.subject?.name || '',
          chapter: r.resource.chapter?.name || '',
          readingTime: r.resource.readingTime
        } : undefined,
        lastRevisedAt: r.lastRevisedAt?.toISOString() || null,
        nextRevisionAt: r.nextRevisionAt.toISOString(),
        revisionCount: r.revisionCount,
        confidence: r.confidence,
        isOverdue,
        priority
      }
    })

    return NextResponse.json({ revisions: transformedRevisions })
  } catch (error) {
    console.error('Error fetching revisions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revision schedule' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { revisionId, action } = body

    if (action === 'complete') {
      // Get current revision
      const revision = await db.revisionSchedule.findUnique({
        where: { id: revisionId }
      })

      if (!revision) {
        return NextResponse.json({ error: 'Revision not found' }, { status: 404 })
      }

      // Calculate next revision date using spaced repetition
      const intervals = [1, 3, 7, 14, 30, 60] // Days
      const nextInterval = intervals[Math.min(revision.revisionCount, intervals.length - 1)]
      const nextRevisionAt = new Date()
      nextRevisionAt.setDate(nextRevisionAt.getDate() + nextInterval)

      // Update revision
      const updated = await db.revisionSchedule.update({
        where: { id: revisionId },
        data: {
          lastRevisedAt: new Date(),
          nextRevisionAt,
          revisionCount: { increment: 1 },
          confidence: Math.min(revision.confidence + 10, 100)
        }
      })

      return NextResponse.json({ success: true, revision: updated })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating revision:', error)
    return NextResponse.json(
      { error: 'Failed to update revision' },
      { status: 500 }
    )
  }
}

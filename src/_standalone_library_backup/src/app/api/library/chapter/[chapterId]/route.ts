import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function parseTags(tagsJson: string | null): string[] {
  if (!tagsJson) return []
  try {
    return JSON.parse(tagsJson)
  } catch {
    return []
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params
    const userId = request.nextUrl.searchParams.get('userId') || 'demo-user'

    // Get chapter with resources
    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
      include: {
        subject: true,
        resources: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    // Get user views for this chapter's resources
    const views = await db.libraryView.findMany({
      where: {
        userId,
        resource: { chapterId }
      }
    })

    // Get bookmarks
    const bookmarks = await db.libraryBookmark.findMany({
      where: { userId },
      select: { resourceId: true }
    })
    const bookmarkedIds = new Set(bookmarks.map(b => b.resourceId))

    // Check if weak topic
    const weakTopic = await db.weakTopic.findFirst({
      where: { userId, chapterId }
    })

    // Calculate progress
    const resourceIds = new Set(chapter.resources.map(r => r.id))
    const viewedResources = new Set(views.map(v => v.resourceId))
    const progress = resourceIds.size > 0
      ? Math.round((viewedResources.size / resourceIds.size) * 100)
      : 0

    // Get insights (mock for now - would be from actual test results)
    const insights = {
      accuracy: Math.round(60 + Math.random() * 30),
      lastTestScore: Math.random() > 0.5 ? Math.round(70 + Math.random() * 25) : null,
      totalTests: Math.floor(Math.random() * 10),
      timeSpent: Math.floor(30 + Math.random() * 90)
    }

    // Transform resources
    const resources = chapter.resources.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      subject: chapter.subject.name,
      subjectId: r.subjectId,
      chapter: chapter.name,
      chapterId: r.chapterId,
      grade: r.grade,
      exam: r.exam,
      difficulty: r.difficulty,
      resourceType: r.resourceType,
      fileUrl: r.fileUrl || '',
      thumbnailUrl: r.thumbnailUrl,
      content: r.content,
      tags: parseTags(r.tags),
      viewCount: r.viewCount,
      readingTime: r.readingTime,
      isBookmarked: bookmarkedIds.has(r.id),
      isTrending: r.isTrending,
      year: r.year,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString()
    }))

    return NextResponse.json({
      id: chapter.id,
      name: chapter.name,
      number: chapter.number,
      description: chapter.description || '',
      weightage: chapter.weightage || 0,
      difficulty: chapter.difficulty || 'Intermediate',
      subject: {
        id: chapter.subject.id,
        name: chapter.subject.name,
        code: chapter.subject.code,
        color: chapter.subject.color || '#2563EB'
      },
      userProgress: progress,
      isWeakTopic: !!weakTopic,
      resources,
      insights
    })
  } catch (error) {
    console.error('Error fetching chapter:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chapter data' },
      { status: 500 }
    )
  }
}

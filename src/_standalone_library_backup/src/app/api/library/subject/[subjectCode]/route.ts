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
  { params }: { params: Promise<{ subjectCode: string }> }
) {
  try {
    const { subjectCode } = await params
    const userId = request.nextUrl.searchParams.get('userId') || 'demo-user'

    // Find subject by code
    const subject = await db.subject.findFirst({
      where: {
        OR: [
          { code: { equals: subjectCode, mode: 'insensitive' } },
          { name: { equals: subjectCode, mode: 'insensitive' } }
        ]
      },
      include: {
        chapters: {
          orderBy: { number: 'asc' },
          include: {
            resources: true
          }
        }
      }
    })

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    // Get user views for progress calculation
    const views = await db.libraryView.findMany({
      where: { userId },
      include: {
        resource: {
          include: { chapter: true }
        }
      }
    })

    // Get weak topics
    const weakTopics = await db.weakTopic.findMany({
      where: { userId, subjectId: subject.id }
    })
    const weakChapterIds = new Set(weakTopics.map(wt => wt.chapterId))

    // Calculate chapter progress
    const chapterProgress = new Map<string, number>()
    views.forEach(v => {
      if (v.resource.chapterId) {
        chapterProgress.set(
          v.resource.chapterId,
          (chapterProgress.get(v.resource.chapterId) || 0) + 1
        )
      }
    })

    // Get bookmarks
    const bookmarks = await db.libraryBookmark.findMany({
      where: { userId },
      select: { resourceId: true }
    })
    const bookmarkedIds = new Set(bookmarks.map(b => b.resourceId))

    // Transform chapters data
    const chapters = subject.chapters.map(chapter => {
      const totalResources = chapter.resources.length
      const viewedCount = chapterProgress.get(chapter.id) || 0
      const progress = totalResources > 0 ? Math.min(Math.round((viewedCount / totalResources) * 100), 100) : 0

      return {
        id: chapter.id,
        subjectId: chapter.subjectId,
        name: chapter.name,
        number: chapter.number,
        description: chapter.description || '',
        weightage: chapter.weightage || 0,
        difficulty: chapter.difficulty || 'Intermediate',
        commonMistakeRate: chapter.commonMistakeRate || 0,
        totalResources,
        userProgress: progress,
        isWeakTopic: weakChapterIds.has(chapter.id),
        lastStudiedAt: null,
        resources: chapter.resources.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          subject: subject.name,
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
      }
    })

    const totalResources = chapters.reduce((acc, c) => acc + c.totalResources, 0)
    const overallProgress = chapters.length > 0
      ? Math.round(chapters.reduce((acc, c) => acc + c.userProgress, 0) / chapters.length)
      : 0

    return NextResponse.json({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      exam: subject.exam,
      color: subject.color || '#2563EB',
      icon: subject.icon || 'BookOpen',
      chapters,
      progress: overallProgress,
      totalResources
    })
  } catch (error) {
    console.error('Error fetching subject:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subject data' },
      { status: 500 }
    )
  }
}

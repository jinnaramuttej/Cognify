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
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    const { resourceId } = await params
    const userId = request.nextUrl.searchParams.get('userId') || 'demo-user'

    // Get resource with chapter and subject
    const resource = await db.libraryResource.findUnique({
      where: { id: resourceId },
      include: {
        chapter: {
          include: { subject: true }
        }
      }
    })

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Check if bookmarked
    const bookmark = await db.libraryBookmark.findFirst({
      where: { userId, resourceId }
    })

    // Get user views for chapter progress
    const chapterViews = await db.libraryView.findMany({
      where: {
        userId,
        resource: { chapterId: resource.chapterId }
      }
    })

    const chapterResourceCount = await db.libraryResource.count({
      where: { chapterId: resource.chapterId }
    })

    const chapterProgress = chapterResourceCount > 0
      ? Math.round((new Set(chapterViews.map(v => v.resourceId)).size / chapterResourceCount) * 100)
      : 0

    // Get related resources
    const relatedResources = await db.libraryResource.findMany({
      where: {
        chapterId: resource.chapterId,
        id: { not: resourceId }
      },
      take: 5
    })

    // Record view
    await db.libraryView.create({
      data: {
        userId,
        resourceId,
        duration: 0,
        scrollProgress: 0
      }
    })

    // Update view count
    await db.libraryResource.update({
      where: { id: resourceId },
      data: { viewCount: { increment: 1 } }
    })

    return NextResponse.json({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      subject: {
        id: resource.chapter?.subject?.id || '',
        name: resource.chapter?.subject?.name || '',
        code: resource.chapter?.subject?.code || '',
        color: resource.chapter?.subject?.color || '#2563EB'
      },
      subjectId: resource.subjectId,
      chapter: {
        id: resource.chapterId,
        name: resource.chapter?.name || '',
        number: resource.chapter?.number || 0,
        userProgress: chapterProgress
      },
      chapterId: resource.chapterId,
      grade: resource.grade,
      exam: resource.exam,
      difficulty: resource.difficulty,
      resourceType: resource.resourceType,
      fileUrl: resource.fileUrl || '',
      thumbnailUrl: resource.thumbnailUrl,
      content: resource.content,
      tags: parseTags(resource.tags),
      viewCount: resource.viewCount + 1,
      readingTime: resource.readingTime,
      isBookmarked: !!bookmark,
      isTrending: resource.isTrending,
      allowDownload: resource.allowDownload,
      year: resource.year,
      createdAt: resource.createdAt.toISOString(),
      updatedAt: resource.updatedAt.toISOString(),
      relatedResources: relatedResources.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        subject: resource.chapter?.subject?.name || '',
        subjectId: r.subjectId,
        chapter: resource.chapter?.name || '',
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
        isBookmarked: false,
        isTrending: r.isTrending,
        year: r.year,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Error fetching resource:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resource data' },
      { status: 500 }
    )
  }
}

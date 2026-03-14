import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Subject, LibraryResource } from '@/modules/library/types'

function parseTags(tagsJson: string | null): string[] {
  if (!tagsJson) return []
  try {
    return JSON.parse(tagsJson)
  } catch {
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'
    const grade = searchParams.get('grade') || '12'
    const exam = searchParams.get('exam') || 'JEE'

    // Get all subjects with their stats
    const subjectsData = await db.subject.findMany({
      include: {
        chapters: {
          include: {
            resources: true
          }
        }
      }
    })

    // Get user bookmarks
    const bookmarks = await db.libraryBookmark.findMany({
      where: { userId },
      select: { resourceId: true }
    })
    const bookmarkedIds = new Set(bookmarks.map(b => b.resourceId))

    // Get user views for progress calculation
    const views = await db.libraryView.findMany({
      where: { userId },
      include: {
        resource: {
          include: {
            chapter: true
          }
        }
      },
      orderBy: { viewedAt: 'desc' },
      take: 20
    })

    // Calculate progress per subject
    const subjectProgress = new Map<string, number>()
    views.forEach(v => {
      const subjectId = v.resource.chapter?.subjectId
      if (subjectId) {
        subjectProgress.set(subjectId, (subjectProgress.get(subjectId) || 0) + 1)
      }
    })

    // Get weak topics count per subject
    const weakTopics = await db.weakTopic.findMany({
      where: { userId }
    })
    const weakTopicCounts = new Map<string, number>()
    weakTopics.forEach(wt => {
      weakTopicCounts.set(wt.subjectId, (weakTopicCounts.get(wt.subjectId) || 0) + 1)
    })

    // Transform subjects data
    const subjects: Subject[] = subjectsData.map(s => {
      const totalResources = s.chapters.reduce((acc, c) => acc + c.resources.length, 0)
      const totalChapters = s.chapters.length
      const progress = totalResources > 0 
        ? Math.round(((subjectProgress.get(s.id) || 0) / totalResources) * 100) 
        : 0

      return {
        id: s.id,
        name: s.name,
        code: s.code,
        exam: s.exam as 'JEE' | 'NEET' | 'Both',
        totalChapters,
        totalResources,
        userProgress: Math.min(progress, 100),
        weakTopicCount: weakTopicCounts.get(s.id) || 0,
        icon: s.icon || 'BookOpen',
        color: s.color || '#2563EB'
      }
    })

    // Get recently viewed resources
    const recentViews = await db.libraryView.findMany({
      where: { userId },
      include: {
        resource: {
          include: {
            chapter: {
              include: {
                subject: true
              }
            }
          }
        }
      },
      orderBy: { viewedAt: 'desc' },
      take: 5
    })

    const recentlyViewed: LibraryResource[] = recentViews.map(v => ({
      id: v.resource.id,
      title: v.resource.title,
      description: v.resource.description,
      subject: v.resource.chapter?.subject?.name || '',
      subjectId: v.resource.subjectId,
      chapter: v.resource.chapter?.name || '',
      chapterId: v.resource.chapterId,
      grade: v.resource.grade as '11' | '12',
      exam: v.resource.exam as 'JEE' | 'NEET',
      difficulty: v.resource.difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
      resourceType: v.resource.resourceType as 'Notes' | 'PYQ' | 'Concept Sheet' | 'Diagram' | 'Formula List' | 'Video',
      fileUrl: v.resource.fileUrl || '',
      thumbnailUrl: v.resource.thumbnailUrl,
      content: v.resource.content,
      tags: parseTags(v.resource.tags),
      viewCount: v.resource.viewCount,
      readingTime: v.resource.readingTime,
      isBookmarked: bookmarkedIds.has(v.resource.id),
      isTrending: v.resource.isTrending,
      year: v.resource.year,
      createdAt: v.resource.createdAt.toISOString(),
      updatedAt: v.resource.updatedAt.toISOString()
    }))

    // Get continue studying (last resource with partial progress)
    const lastView = recentViews[0]
    let continueStudying: LibraryResource | null = null
    
    if (lastView && lastView.scrollProgress < 90) {
      continueStudying = {
        id: lastView.resource.id,
        title: lastView.resource.title,
        description: lastView.resource.description,
        subject: lastView.resource.chapter?.subject?.name || '',
        subjectId: lastView.resource.subjectId,
        chapter: lastView.resource.chapter?.name || '',
        chapterId: lastView.resource.chapterId,
        grade: lastView.resource.grade as '11' | '12',
        exam: lastView.resource.exam as 'JEE' | 'NEET',
        difficulty: lastView.resource.difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
        resourceType: lastView.resource.resourceType as 'Notes' | 'PYQ' | 'Concept Sheet' | 'Diagram' | 'Formula List' | 'Video',
        fileUrl: lastView.resource.fileUrl || '',
        thumbnailUrl: lastView.resource.thumbnailUrl,
        content: lastView.resource.content,
        tags: parseTags(lastView.resource.tags),
        viewCount: lastView.resource.viewCount,
        readingTime: lastView.resource.readingTime,
        isBookmarked: bookmarkedIds.has(lastView.resource.id),
        isTrending: lastView.resource.isTrending,
        year: lastView.resource.year,
        createdAt: lastView.resource.createdAt.toISOString(),
        updatedAt: lastView.resource.updatedAt.toISOString()
      }
    }

    // Count due for revision
    const now = new Date()
    const dueForRevision = await db.revisionSchedule.count({
      where: {
        userId,
        nextRevisionAt: { lte: now }
      }
    })

    return NextResponse.json({
      subjects,
      recentlyViewed,
      continueStudying,
      dueForRevision
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch library home data' },
      { status: 500 }
    )
  }
}

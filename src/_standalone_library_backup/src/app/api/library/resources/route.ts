import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { LibraryResource, Subject, Chapter } from '@/modules/library/types'

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
    
    // Extract filter parameters
    const grade = searchParams.get('grade')
    const exam = searchParams.get('exam')
    const subject = searchParams.get('subject')
    const chapter = searchParams.get('chapter')
    const resourceType = searchParams.get('resourceType')
    const difficulty = searchParams.get('difficulty')
    const year = searchParams.get('year')
    const recentlyAdded = searchParams.get('recentlyAdded') === 'true'
    const trending = searchParams.get('trending') === 'true'
    const searchQuery = searchParams.get('search') || ''
    const sort = searchParams.get('sort') || 'newest'
    const userId = searchParams.get('userId') || 'demo-user'

    // Build where clause
    const where: Record<string, unknown> = {}

    if (grade) where.grade = grade
    if (exam) where.exam = exam
    if (resourceType) where.resourceType = resourceType
    if (difficulty) where.difficulty = difficulty
    if (year) where.year = parseInt(year)
    if (trending) where.isTrending = true

    // Date filter for recently added
    if (recentlyAdded) {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      where.createdAt = { gte: sevenDaysAgo }
    }

    // Search filter
    if (searchQuery.trim()) {
      const searchTerms = searchQuery.trim().split(/\s+/)
      where.OR = searchTerms.map(term => ({
        OR: [
          { title: { contains: term } },
          { description: { contains: term } },
          { tags: { contains: term } }
        ]
      }))
    }

    // Fetch resources with relations
    const resources = await db.libraryResource.findMany({
      where,
      include: {
        chapter: {
          include: {
            subject: true
          }
        },
        bookmarks: {
          where: { userId }
        }
      },
      orderBy: getOrderBy(sort)
    })

    // Get user bookmarks
    const bookmarks = await db.libraryBookmark.findMany({
      where: { userId },
      select: { resourceId: true }
    })
    const bookmarkedIds = new Set(bookmarks.map(b => b.resourceId))

    // Transform to frontend type
    const transformedResources: LibraryResource[] = resources.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      subject: r.chapter.subject.name,
      subjectId: r.subjectId,
      chapter: r.chapter.name,
      chapterId: r.chapterId,
      grade: r.grade as '11' | '12',
      exam: r.exam as 'JEE' | 'NEET',
      difficulty: r.difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
      resourceType: r.resourceType as 'Notes' | 'PYQ' | 'Concept Sheet' | 'Diagram' | 'Formula List' | 'Video',
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
      resources: transformedResources,
      total: transformedResources.length,
      page: 1,
      pageSize: 50
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

function getOrderBy(sort: string): Record<string, 'asc' | 'desc'> {
  switch (sort) {
    case 'newest':
      return { createdAt: 'desc' }
    case 'oldest':
      return { createdAt: 'asc' }
    case 'most_viewed':
      return { viewCount: 'desc' }
    case 'title_asc':
      return { title: 'asc' }
    case 'title_desc':
      return { title: 'desc' }
    default:
      return { createdAt: 'desc' }
  }
}

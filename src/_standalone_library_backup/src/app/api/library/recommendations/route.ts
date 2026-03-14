import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { RecommendationItem } from '@/modules/library/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'

    // Get user's recent views and bookmarks to understand preferences
    const [recentViews, bookmarks] = await Promise.all([
      db.libraryView.findMany({
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
        take: 20
      }),
      db.libraryBookmark.findMany({
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
        }
      })
    ])

    // Extract subjects and chapters from user's activity
    const viewedSubjects = new Map<string, number>()
    const viewedChapters = new Map<string, number>()

    recentViews.forEach(v => {
      const subject = v.resource.chapter?.subject?.name
      const chapter = v.resource.chapter?.name
      if (subject && chapter) {
        viewedSubjects.set(subject, (viewedSubjects.get(subject) || 0) + 1)
        viewedChapters.set(`${subject}:${chapter}`, (viewedChapters.get(`${subject}:${chapter}`) || 0) + 1)
      }
    })

    // Find weak topics (viewed but not bookmarked, or viewed multiple times)
    const weakTopics: string[] = []
    recentViews.forEach(v => {
      const subject = v.resource.chapter?.subject?.name
      const chapter = v.resource.chapter?.name
      if (!subject || !chapter) return
      
      const key = `${subject}:${chapter}`
      const isBookmarked = bookmarks.some(b => b.resourceId === v.resourceId)
      const viewCount = viewedChapters.get(key) || 0
      
      if (!isBookmarked && viewCount >= 1) {
        weakTopics.push(chapter)
      }
    })

    // Get trending resources
    const trending = await db.libraryResource.findMany({
      where: { isTrending: true },
      include: {
        chapter: {
          include: {
            subject: true
          }
        }
      },
      take: 5
    })

    // Get resources in weak topics
    const weakChapterResources = weakTopics.length > 0 
      ? await db.libraryResource.findMany({
          where: {
            chapter: { 
              name: { in: [...new Set(weakTopics)] }
            }
          },
          include: {
            chapter: {
              include: {
                subject: true
              }
            }
          },
          take: 5
        })
      : []

    // Get popular resources by subject
    const popularSubjects = [...viewedSubjects.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([subject]) => subject)

    const popularResources = popularSubjects.length > 0
      ? await db.libraryResource.findMany({
          where: {
            chapter: {
              subject: {
                name: { in: popularSubjects }
              }
            }
          },
          include: {
            chapter: {
              include: {
                subject: true
              }
            }
          },
          orderBy: { viewCount: 'desc' },
          take: 5
        })
      : []

    // Build recommendations
    const recommendations: RecommendationItem[] = []

    // Add trending resources
    trending.forEach(r => {
      recommendations.push({
        id: r.id,
        title: r.title,
        reason: 'Trending this week',
        subject: r.chapter?.subject?.name || '',
        chapter: r.chapter?.name || '',
        matchScore: 95,
        type: 'trending'
      })
    })

    // Add weak topic resources
    weakChapterResources.forEach(r => {
      recommendations.push({
        id: r.id,
        title: r.title,
        reason: 'Based on your weak topics',
        subject: r.chapter?.subject?.name || '',
        chapter: r.chapter?.name || '',
        matchScore: 85,
        type: 'weak_topic'
      })
    })

    // Add popular resources
    popularResources.forEach(r => {
      recommendations.push({
        id: r.id,
        title: r.title,
        reason: 'Popular in your subjects',
        subject: r.chapter?.subject?.name || '',
        chapter: r.chapter?.name || '',
        matchScore: 80,
        type: 'next_chapter'
      })
    })

    // Remove duplicates and limit
    const uniqueRecommendations = recommendations
      .filter((r, index, self) => self.findIndex(x => x.id === r.id) === index)
      .slice(0, 10)

    return NextResponse.json({
      recommendations: uniqueRecommendations,
      weakTopics: [...new Set(weakTopics)].slice(0, 5)
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}

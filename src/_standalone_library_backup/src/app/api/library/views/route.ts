import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, resourceId } = body

    if (!userId || !resourceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Record the view
    await db.libraryView.create({
      data: { userId, resourceId }
    })

    // Increment view count on resource
    await db.libraryResource.update({
      where: { id: resourceId },
      data: { viewCount: { increment: 1 } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to record view' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const resourceId = searchParams.get('resourceId')

    if (resourceId) {
      // Get view stats for a specific resource
      const views = await db.libraryView.count({
        where: { resourceId }
      })

      return NextResponse.json({ viewCount: views })
    }

    if (userId) {
      // Get recent views for a user
      const views = await db.libraryView.findMany({
        where: { userId },
        include: { resource: true },
        orderBy: { viewedAt: 'desc' },
        take: 20
      })

      return NextResponse.json({
        views: views.map(v => ({
          id: v.id,
          resourceId: v.resourceId,
          viewedAt: v.viewedAt.toISOString(),
          resource: {
            id: v.resource.id,
            title: v.resource.title,
            subject: v.resource.subject,
            chapter: v.resource.chapter,
            thumbnailUrl: v.resource.thumbnailUrl
          }
        }))
      })
    }

    return NextResponse.json(
      { error: 'Missing userId or resourceId' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch views' },
      { status: 500 }
    )
  }
}

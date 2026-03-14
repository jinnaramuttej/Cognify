import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, resourceId, action } = body

    if (!userId || !resourceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (action === 'add') {
      // Check if bookmark already exists
      const existing = await db.libraryBookmark.findUnique({
        where: {
          userId_resourceId: { userId, resourceId }
        }
      })

      if (existing) {
        return NextResponse.json({ success: true, bookmarked: true })
      }

      await db.libraryBookmark.create({
        data: { userId, resourceId }
      })

      return NextResponse.json({ success: true, bookmarked: true })
    } 
    
    if (action === 'remove') {
      await db.libraryBookmark.deleteMany({
        where: { userId, resourceId }
      })

      return NextResponse.json({ success: true, bookmarked: false })
    }

    // Toggle action
    const existing = await db.libraryBookmark.findUnique({
      where: {
        userId_resourceId: { userId, resourceId }
      }
    })

    if (existing) {
      await db.libraryBookmark.delete({
        where: { id: existing.id }
      })
      return NextResponse.json({ success: true, bookmarked: false })
    } else {
      await db.libraryBookmark.create({
        data: { userId, resourceId }
      })
      return NextResponse.json({ success: true, bookmarked: true })
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update bookmark' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    const bookmarks = await db.libraryBookmark.findMany({
      where: { userId },
      include: {
        resource: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      bookmarks: bookmarks.map(b => ({
        id: b.id,
        resourceId: b.resourceId,
        createdAt: b.createdAt.toISOString(),
        resource: {
          id: b.resource.id,
          title: b.resource.title,
          subject: b.resource.subject,
          chapter: b.resource.chapter,
          thumbnailUrl: b.resource.thumbnailUrl
        }
      }))
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    )
  }
}

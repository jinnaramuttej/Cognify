import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/library/highlights - Get highlights for a resource
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const resourceId = searchParams.get('resourceId')
    const userId = searchParams.get('userId') || 'demo-user'

    if (!resourceId) {
      return NextResponse.json({ error: 'resourceId required' }, { status: 400 })
    }

    const highlights = await db.highlight.findMany({
      where: {
        userId,
        resourceId
      },
      orderBy: { startPosition: 'asc' }
    })

    const formattedHighlights = highlights.map(h => ({
      id: h.id,
      userId: h.userId,
      resourceId: h.resourceId,
      startPosition: h.startPosition,
      endPosition: h.endPosition,
      text: h.text,
      color: h.color,
      note: h.note,
      tags: [],
      createdAt: h.createdAt.toISOString(),
      updatedAt: h.updatedAt.toISOString()
    }))

    return NextResponse.json({ highlights: formattedHighlights })
  } catch (error) {
    console.error('Error fetching highlights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch highlights' },
      { status: 500 }
    )
  }
}

// POST /api/library/highlights - Create a highlight
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      resourceId,
      startPosition,
      endPosition,
      text,
      color = 'yellow',
      note,
      userId = 'demo-user'
    } = body

    const highlight = await db.highlight.create({
      data: {
        userId,
        resourceId,
        startPosition,
        endPosition,
        text,
        color,
        note
      }
    })

    return NextResponse.json({
      highlight: {
        id: highlight.id,
        userId: highlight.userId,
        resourceId: highlight.resourceId,
        startPosition: highlight.startPosition,
        endPosition: highlight.endPosition,
        text: highlight.text,
        color: highlight.color,
        note: highlight.note,
        tags: [],
        createdAt: highlight.createdAt.toISOString(),
        updatedAt: highlight.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Error creating highlight:', error)
    return NextResponse.json(
      { error: 'Failed to create highlight' },
      { status: 500 }
    )
  }
}

// DELETE /api/library/highlights - Delete a highlight
export async function DELETE(request: NextRequest) {
  try {
    const { id, userId = 'demo-user' } = await request.json()

    await db.highlight.deleteMany({
      where: { id, userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting highlight:', error)
    return NextResponse.json(
      { error: 'Failed to delete highlight' },
      { status: 500 }
    )
  }
}

// PATCH /api/library/highlights - Update a highlight
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, color, note, userId = 'demo-user' } = body

    const highlight = await db.highlight.updateMany({
      where: { id, userId },
      data: { color, note }
    })

    return NextResponse.json({ success: true, updated: highlight.count })
  } catch (error) {
    console.error('Error updating highlight:', error)
    return NextResponse.json(
      { error: 'Failed to update highlight' },
      { status: 500 }
    )
  }
}

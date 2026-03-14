import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/library/flashcards - Get flashcard decks
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const deckId = searchParams.get('deckId')
    const chapterId = searchParams.get('chapterId')
    const userId = searchParams.get('userId') || 'demo-user'
    const dueOnly = searchParams.get('dueOnly') === 'true'

    if (deckId) {
      // Get specific deck with cards
      const deck = await db.flashcardDeck.findUnique({
        where: { id: deckId },
        include: {
          flashcards: {
            orderBy: { order: 'asc' },
            include: {
              progresses: {
                where: { userId }
              }
            }
          }
        }
      })

      if (!deck) {
        return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
      }

      const now = new Date()
      const formattedDeck = {
        id: deck.id,
        name: deck.name,
        description: deck.description,
        chapterId: deck.chapterId,
        resourceId: deck.resourceId,
        cardCount: deck.cardCount,
        isPublic: deck.isPublic,
        dueCount: deck.flashcards.filter(f => {
          const progress = f.progresses[0]
          return !progress || new Date(progress.nextReviewAt) <= now
        }).length,
        progress: deck.flashcards.length > 0
          ? Math.round((deck.flashcards.filter(f => {
              const progress = f.progresses[0]
              return progress && progress.repetitions >= 3
            }).length / deck.flashcards.length) * 100)
          : 0,
        flashcards: deck.flashcards.map(card => ({
          id: card.id,
          deckId: card.deckId,
          front: card.front,
          back: card.back,
          hint: card.hint,
          imageUrl: card.imageUrl,
          tags: card.tags ? JSON.parse(card.tags) : [],
          order: card.order,
          progress: card.progresses[0] ? {
            id: card.progresses[0].id,
            cardId: card.progresses[0].cardId,
            easeFactor: card.progresses[0].easeFactor,
            interval: card.progresses[0].interval,
            repetitions: card.progresses[0].repetitions,
            nextReviewAt: card.progresses[0].nextReviewAt.toISOString(),
            lastReviewAt: card.progresses[0].lastReviewAt?.toISOString() || null
          } : undefined
        })),
        createdAt: deck.createdAt.toISOString()
      }

      return NextResponse.json({ deck: formattedDeck })
    }

    // Get all decks
    const where: Record<string, unknown> = {}
    if (chapterId) where.chapterId = chapterId

    const decks = await db.flashcardDeck.findMany({
      where,
      include: {
        flashcards: {
          include: {
            progresses: {
              where: { userId }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const now = new Date()
    const formattedDecks = decks.map(deck => ({
      id: deck.id,
      name: deck.name,
      description: deck.description,
      chapterId: deck.chapterId,
      resourceId: deck.resourceId,
      cardCount: deck.cardCount,
      isPublic: deck.isPublic,
      dueCount: deck.flashcards.filter(f => {
        const progress = f.progresses[0]
        return !progress || new Date(progress.nextReviewAt) <= now
      }).length,
      progress: deck.flashcards.length > 0
        ? Math.round((deck.flashcards.filter(f => {
            const progress = f.progresses[0]
            return progress && progress.repetitions >= 3
          }).length / deck.flashcards.length) * 100)
        : 0,
      createdAt: deck.createdAt.toISOString()
    }))

    return NextResponse.json({ decks: formattedDecks })
  } catch (error) {
    console.error('Error fetching flashcards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch flashcards' },
      { status: 500 }
    )
  }
}

// POST /api/library/flashcards - Rate a flashcard (SM-2 algorithm)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cardId, rating, userId = 'demo-user' } = body

    const card = await db.flashcard.findUnique({
      where: { id: cardId },
      include: { progresses: { where: { userId } } }
    })

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    const existingProgress = card.progresses[0]
    let easeFactor = existingProgress?.easeFactor || 2.5
    let interval = existingProgress?.interval || 0
    let repetitions = existingProgress?.repetitions || 0

    // SM-2 Algorithm
    if (rating === 'again') {
      repetitions = 0
      interval = 1
    } else if (rating === 'hard') {
      if (repetitions === 0) {
        interval = 1
      } else {
        interval = Math.round(interval * 1.2)
      }
      easeFactor = Math.max(1.3, easeFactor - 0.15)
      repetitions += 1
    } else if (rating === 'good') {
      if (repetitions === 0) {
        interval = 1
      } else if (repetitions === 1) {
        interval = 6
      } else {
        interval = Math.round(interval * easeFactor)
      }
      easeFactor = Math.max(1.3, easeFactor - 0.02)
      repetitions += 1
    } else if (rating === 'easy') {
      if (repetitions === 0) {
        interval = 4
      } else if (repetitions === 1) {
        interval = 10
      } else {
        interval = Math.round(interval * easeFactor * 1.3)
      }
      easeFactor = easeFactor + 0.1
      repetitions += 1
    }

    const now = new Date()
    const nextReviewAt = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000)

    const progress = await db.flashcardProgress.upsert({
      where: {
        userId_cardId: { userId, cardId }
      },
      update: {
        easeFactor,
        interval,
        repetitions,
        nextReviewAt,
        lastReviewAt: now,
        deckId: card.deckId
      },
      create: {
        userId,
        cardId,
        deckId: card.deckId,
        easeFactor,
        interval,
        repetitions,
        nextReviewAt,
        lastReviewAt: now
      }
    })

    return NextResponse.json({
      progress: {
        ...progress,
        nextReviewAt: progress.nextReviewAt.toISOString(),
        lastReviewAt: progress.lastReviewAt?.toISOString() || null
      }
    })
  } catch (error) {
    console.error('Error rating flashcard:', error)
    return NextResponse.json(
      { error: 'Failed to rate flashcard' },
      { status: 500 }
    )
  }
}

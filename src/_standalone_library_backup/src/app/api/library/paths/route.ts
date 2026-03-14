import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/library/paths - Get all learning paths
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const subjectId = searchParams.get('subjectId')
    const userId = searchParams.get('userId') || 'demo-user'

    const where: Record<string, unknown> = { isActive: true }
    if (subjectId) where.subjectId = subjectId

    const paths = await db.learningPath.findMany({
      where,
      include: {
        stages: {
          orderBy: { order: 'asc' },
          include: {
            resources: {
              include: {
                resource: {
                  include: {
                    chapter: { include: { subject: true } }
                  }
                }
              },
              orderBy: { order: 'asc' }
            }
          }
        },
        enrollments: {
          where: { userId }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedPaths = paths.map(path => {
      const enrollment = path.enrollments[0]
      const completedStages = path.stages.filter(stage => 
        enrollment?.completions?.some((c: { stageId: string }) => c.stageId === stage.id)
      ).length
      const totalStages = path.stages.length
      const progress = totalStages > 0 ? (completedStages / totalStages) * 100 : 0

      return {
        id: path.id,
        name: path.name,
        description: path.description,
        subjectId: path.subjectId,
        difficulty: path.difficulty,
        totalStages,
        estimatedHours: path.estimatedHours,
        icon: path.icon,
        color: path.color,
        isActive: path.isActive,
        progress: Math.round(progress),
        currentStage: enrollment?.currentStage || 1,
        isEnrolled: !!enrollment,
        stages: path.stages.map(stage => {
          const isCompleted = enrollment?.completions?.some(
            (c: { stageId: string }) => c.stageId === stage.id
          )
          const previousStage = path.stages.find(s => s.order === stage.order - 1)
          const isLocked = stage.order > 1 && previousStage && 
            !enrollment?.completions?.some((c: { stageId: string }) => c.stageId === previousStage.id)

          return {
            id: stage.id,
            pathId: stage.pathId,
            name: stage.name,
            description: stage.description,
            order: stage.order,
            estimatedMinutes: stage.estimatedMinutes,
            prerequisiteStageId: stage.prerequisiteStageId,
            progress: isCompleted ? 100 : 0,
            isCompleted: !!isCompleted,
            isLocked: !!isLocked,
            resources: stage.resources.map(sr => ({
              id: sr.id,
              resourceId: sr.resourceId,
              resource: {
                id: sr.resource.id,
                title: sr.resource.title,
                description: sr.resource.description,
                subject: sr.resource.chapter.subject.name,
                chapter: sr.resource.chapter.name,
                resourceType: sr.resource.resourceType,
                readingTime: sr.resource.readingTime,
                thumbnailUrl: sr.resource.thumbnailUrl
              },
              order: sr.order,
              isRequired: sr.isRequired
            }))
          }
        }),
        createdAt: path.createdAt.toISOString()
      }
    })

    return NextResponse.json({ paths: formattedPaths })
  } catch (error) {
    console.error('Error fetching learning paths:', error)
    return NextResponse.json(
      { error: 'Failed to fetch learning paths' },
      { status: 500 }
    )
  }
}

// POST /api/library/paths - Enroll in a learning path
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pathId, userId = 'demo-user' } = body

    // Check if already enrolled
    const existing = await db.learningPathEnrollment.findUnique({
      where: {
        userId_pathId: { userId, pathId }
      }
    })

    if (existing) {
      return NextResponse.json({ enrollment: existing, alreadyEnrolled: true })
    }

    const enrollment = await db.learningPathEnrollment.create({
      data: {
        userId,
        pathId,
        currentStage: 1,
        progress: 0
      }
    })

    return NextResponse.json({ enrollment, alreadyEnrolled: false })
  } catch (error) {
    console.error('Error enrolling in path:', error)
    return NextResponse.json(
      { error: 'Failed to enroll in learning path' },
      { status: 500 }
    )
  }
}

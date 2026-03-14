import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface WeakTopicRecommendation {
  id: string
  topic: string
  chapter: string
  subject: string
  subjectId: string
  chapterId: string
  accuracy: number
  urgency: 'high' | 'medium' | 'low'
  trend: 'declining' | 'stable' | 'improving'
  recommendedResources: RecommendedResource[]
  suggestedAction: string
}

interface RecommendedResource {
  id: string
  title: string
  description: string
  resourceType: string
  difficulty: string
  estimatedTime: number
  masteryWeight: number
  matchScore: number
  reason: string
}

interface MasteryProfile {
  overallMastery: number
  subjectMastery: { [subject: string]: number }
  chapterMastery: { [chapter: string]: number }
  weakestChapters: string[]
  strongestChapters: string[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'
    const grade = searchParams.get('grade')
    const exam = searchParams.get('exam')
    const includeResources = searchParams.get('includeResources') === 'true'

    // Get user's test results for weak topic analysis
    const testResults = await db.testResult.findMany({
      where: { userId },
      include: {
        topicResults: true
      },
      orderBy: { takenAt: 'desc' },
      take: 20
    })

    // Get user's resource mastery
    const masteryRecords = await db.resourceMastery.findMany({
      where: { userId },
      include: {
        resource: {
          include: {
            chapter: {
              include: { subject: true }
            }
          }
        }
      }
    })

    // Get user's recent views
    const recentViews = await db.libraryView.findMany({
      where: { userId },
      include: {
        resource: {
          include: {
            chapter: {
              include: { subject: true }
            }
          }
        }
      },
      orderBy: { viewedAt: 'desc' },
      take: 50
    })

    // Get user's bookmarks
    const bookmarks = await db.libraryBookmark.findMany({
      where: { userId },
      select: { resourceId: true }
    })
    const bookmarkedIds = new Set(bookmarks.map(b => b.resourceId))

    // Analyze weak topics from test results
    const topicAnalysis = analyzeTopicPerformance(testResults)

    // Calculate mastery profile
    const masteryProfile = calculateMasteryProfile(masteryRecords, recentViews)

    // Get weak topic recommendations
    const weakTopicRecommendations = await getWeakTopicRecommendations(
      topicAnalysis,
      masteryProfile,
      userId,
      grade,
      exam,
      includeResources
    )

    // Get continue learning items
    const continueLearning = await getContinueLearningItems(
      recentViews,
      masteryRecords,
      bookmarkedIds
    )

    // Get mastery-aware resource recommendations
    const masteryAwareRecommendations = await getMasteryAwareRecommendations(
      masteryProfile,
      userId,
      grade,
      exam,
      bookmarkedIds
    )

    // Get smart search suggestions
    const searchSuggestions = await getSearchSuggestions(userId, recentViews)

    return NextResponse.json({
      weakTopics: weakTopicRecommendations,
      continueLearning,
      masteryAwareRecommendations,
      masteryProfile,
      searchSuggestions,
      insights: {
        totalStudyTime: masteryRecords.reduce((sum, m) => sum + m.timeSpent, 0),
        averageMastery: masteryProfile.overallMastery,
        resourcesCompleted: masteryRecords.filter(m => m.completionPercentage >= 100).length,
        topicsNeedingReview: weakTopicRecommendations.filter(t => t.urgency === 'high').length
      }
    })
  } catch (error) {
    console.error('Intelligence API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate intelligence data' },
      { status: 500 }
    )
  }
}

// Analyze topic performance from test results
function analyzeTopicPerformance(testResults: any[]) {
  const topicMap = new Map<string, {
    accuracies: number[]
    times: Date[]
    subjectId?: string
    chapterId?: string
  }>()

  testResults.forEach(result => {
    result.topicResults?.forEach((topic: any) => {
      const existing = topicMap.get(topic.topic) || { accuracies: [], times: [] }
      existing.accuracies.push(topic.accuracy)
      existing.times.push(result.takenAt)
      existing.subjectId = result.subjectId || existing.subjectId
      existing.chapterId = result.chapterId || existing.chapterId
      topicMap.set(topic.topic, existing)
    })
  })

  const analysis: any[] = []
  topicMap.forEach((data, topic) => {
    const avgAccuracy = data.accuracies.reduce((a, b) => a + b, 0) / data.accuracies.length
    const recentAccuracy = data.accuracies.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, data.accuracies.length)
    const olderAccuracy = data.accuracies.length > 3 
      ? data.accuracies.slice(3).reduce((a, b) => a + b, 0) / (data.accuracies.length - 3)
      : recentAccuracy

    const trend = recentAccuracy < olderAccuracy - 5 ? 'declining' 
      : recentAccuracy > olderAccuracy + 5 ? 'improving' 
      : 'stable'

    analysis.push({
      topic,
      subjectId: data.subjectId,
      chapterId: data.chapterId,
      accuracy: avgAccuracy,
      recentAccuracy,
      trend,
      attemptCount: data.accuracies.length,
      urgency: avgAccuracy < 40 ? 'high' : avgAccuracy < 60 ? 'medium' : 'low'
    })
  })

  return analysis.sort((a, b) => a.accuracy - b.accuracy)
}

// Calculate mastery profile
function calculateMasteryProfile(masteryRecords: any[], recentViews: any[]): MasteryProfile {
  const subjectMastery: { [key: string]: number[] } = {}
  const chapterMastery: { [key: string]: number[] } = {}

  masteryRecords.forEach(record => {
    const subject = record.resource?.chapter?.subject?.name
    const chapter = record.resource?.chapter?.name

    if (subject) {
      if (!subjectMastery[subject]) subjectMastery[subject] = []
      subjectMastery[subject].push(record.masteryLevel)
    }
    if (chapter) {
      if (!chapterMastery[chapter]) chapterMastery[chapter] = []
      chapterMastery[chapter].push(record.masteryLevel)
    }
  })

  const subjectAvg: { [key: string]: number } = {}
  Object.entries(subjectMastery).forEach(([subject, levels]) => {
    subjectAvg[subject] = levels.reduce((a, b) => a + b, 0) / levels.length
  })

  const chapterAvg: { [key: string]: number } = {}
  Object.entries(chapterMastery).forEach(([chapter, levels]) => {
    chapterAvg[chapter] = levels.reduce((a, b) => a + b, 0) / levels.length
  })

  const allMastery = masteryRecords.map(r => r.masteryLevel)
  const overallMastery = allMastery.length > 0 
    ? allMastery.reduce((a, b) => a + b, 0) / allMastery.length 
    : 0

  const sortedChapters = Object.entries(chapterAvg)
    .sort(([, a], [, b]) => a - b)

  return {
    overallMastery,
    subjectMastery: subjectAvg,
    chapterMastery: chapterAvg,
    weakestChapters: sortedChapters.slice(0, 5).map(([chapter]) => chapter),
    strongestChapters: sortedChapters.slice(-5).map(([chapter]) => chapter)
  }
}

// Get weak topic recommendations
async function getWeakTopicRecommendations(
  topicAnalysis: any[],
  masteryProfile: MasteryProfile,
  userId: string,
  grade: string | null,
  exam: string | null,
  includeResources: boolean
): Promise<WeakTopicRecommendation[]> {
  const recommendations: WeakTopicRecommendation[] = []

  // Get chapters with details
  const chapters = await db.chapter.findMany({
    include: { subject: true }
  })
  const chapterMap = new Map(chapters.map(c => [c.id, c]))

  for (const topic of topicAnalysis.slice(0, 5)) {
    const chapter = topic.chapterId ? chapterMap.get(topic.chapterId) : null
    const subject = chapter?.subject

    const recommendation: WeakTopicRecommendation = {
      id: `weak-${topic.topic}`,
      topic: topic.topic,
      chapter: chapter?.name || 'Unknown',
      subject: subject?.name || 'Unknown',
      subjectId: topic.subjectId || subject?.id || '',
      chapterId: topic.chapterId || chapter?.id || '',
      accuracy: topic.accuracy,
      urgency: topic.urgency,
      trend: topic.trend,
      recommendedResources: [],
      suggestedAction: generateSuggestedAction(topic.accuracy, topic.trend)
    }

    if (includeResources) {
      // Get resources for this topic/chapter
      const whereClause: any = {}
      if (topic.chapterId) whereClause.chapterId = topic.chapterId
      if (grade) whereClause.grade = grade
      if (exam) whereClause.exam = exam

      const resources = await db.libraryResource.findMany({
        where: whereClause,
        include: {
          chapter: { include: { subject: true } }
        },
        take: 5
      })

      recommendation.recommendedResources = resources.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        resourceType: r.resourceType,
        difficulty: r.difficulty,
        estimatedTime: r.estimatedTime,
        masteryWeight: r.masteryWeight,
        matchScore: calculateMatchScore(r, topic.accuracy, masteryProfile.overallMastery),
        reason: getResourceReason(r, topic.accuracy)
      })).sort((a, b) => b.matchScore - a.matchScore)
    }

    recommendations.push(recommendation)
  }

  return recommendations
}

// Get continue learning items
async function getContinueLearningItems(
  recentViews: any[],
  masteryRecords: any[],
  bookmarkedIds: Set<string | null>
) {
  const continueItems: any[] = []
  const masteryMap = new Map(masteryRecords.map(m => [m.resourceId, m]))

  // Get incomplete resources from recent views
  const incompleteResources = recentViews
    .filter(view => {
      const mastery = masteryMap.get(view.resourceId)
      return !mastery || mastery.completionPercentage < 100
    })
    .slice(0, 5)

  for (const view of incompleteResources) {
    const mastery = masteryMap.get(view.resourceId)
    continueItems.push({
      resourceId: view.resourceId,
      title: view.resource?.title,
      subject: view.resource?.chapter?.subject?.name,
      chapter: view.resource?.chapter?.name,
      progress: mastery?.completionPercentage || view.scrollProgress || 0,
      currentPage: mastery?.currentPage || 1,
      totalPages: mastery?.totalPages || 1,
      lastViewed: view.viewedAt,
      timeSpent: view.duration,
      isBookmarked: bookmarkedIds?.has(view.resourceId) || false
    })
  }

  return continueItems
}

// Get mastery-aware recommendations
async function getMasteryAwareRecommendations(
  masteryProfile: MasteryProfile,
  userId: string,
  grade: string | null,
  exam: string | null,
  bookmarkedIds: Set<string | null>
) {
  const whereClause: any = {}
  if (grade) whereClause.grade = grade
  if (exam) whereClause.exam = exam

  // Determine optimal difficulty based on mastery
  let targetDifficulty = 'Intermediate'
  if (masteryProfile.overallMastery < 40) {
    targetDifficulty = 'Beginner'
  } else if (masteryProfile.overallMastery > 80) {
    targetDifficulty = 'Advanced'
  }

  // Get resources matching the target difficulty
  const resources = await db.libraryResource.findMany({
    where: {
      ...whereClause,
      difficulty: targetDifficulty
    },
    include: {
      chapter: { include: { subject: true } }
    },
    orderBy: [
      { masteryWeight: 'desc' },
      { viewCount: 'desc' }
    ],
    take: 10
  })

  // Calculate recommendation scores
  return resources
    .filter(r => !bookmarkedIds?.has(r.id))
    .map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      subject: r.chapter?.subject?.name,
      chapter: r.chapter?.name,
      resourceType: r.resourceType,
      difficulty: r.difficulty,
      estimatedTime: r.estimatedTime,
      recommendationScore: calculateMatchScore(r, 100 - masteryProfile.overallMastery, masteryProfile.overallMastery),
      reason: `Optimal for your current mastery level (${Math.round(masteryProfile.overallMastery)}%)`
    }))
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
}

// Get search suggestions based on history and context
async function getSearchSuggestions(userId: string, recentViews: any[]) {
  // Get recent search history
  const searchHistory = await db.searchHistory.findMany({
    where: { userId },
    orderBy: { searchedAt: 'desc' },
    take: 10
  })

  // Extract topics from recent views
  const recentTopics = recentViews
    .slice(0, 10)
    .map(v => v.resource?.chapter?.name)
    .filter(Boolean)

  // Get trending topics
  const trendingResources = await db.libraryResource.findMany({
    where: { isTrending: true },
    include: { chapter: { include: { subject: true } } },
    take: 5
  })

  return {
    recentSearches: searchHistory.map(s => s.query),
    suggestedTopics: [...new Set(recentTopics)].slice(0, 5),
    trendingTopics: trendingResources.map(r => ({
      topic: r.chapter?.name,
      subject: r.chapter?.subject?.name,
      resourceCount: 1
    }))
  }
}

// Helper: Generate suggested action
function generateSuggestedAction(accuracy: number, trend: string): string {
  if (accuracy < 30) {
    return 'Start with fundamentals. Review basic concepts before attempting problems.'
  } else if (accuracy < 50) {
    return 'Focus on understanding core principles. Try visual learning resources.'
  } else if (accuracy < 70) {
    return 'Practice more problems. Identify and work on specific weak areas.'
  } else {
    return 'Review and reinforce. Take practice tests to solidify knowledge.'
  }
}

// Helper: Calculate match score
function calculateMatchScore(
  resource: any, 
  topicAccuracy: number, 
  overallMastery: number
): number {
  let score = 50

  // Adjust for difficulty appropriateness
  if (resource.difficulty === 'Beginner' && topicAccuracy < 50) score += 20
  if (resource.difficulty === 'Intermediate' && topicAccuracy >= 50 && topicAccuracy < 70) score += 15
  if (resource.difficulty === 'Advanced' && topicAccuracy >= 70) score += 15

  // Adjust for mastery weight
  score += (resource.masteryWeight || 1) * 10

  // Adjust for estimated time (prefer shorter resources for weak topics)
  if (topicAccuracy < 50 && resource.estimatedTime <= 15) score += 10

  // Cap at 100
  return Math.min(100, Math.max(0, score))
}

// Helper: Get resource reason
function getResourceReason(resource: any, accuracy: number): string {
  if (accuracy < 40) {
    if (resource.difficulty === 'Beginner') {
      return 'Perfect starting point for building fundamentals'
    }
    return 'Simplifies complex concepts for better understanding'
  } else if (accuracy < 60) {
    if (resource.resourceType === 'PYQ') {
      return 'Practice with previous year questions'
    }
    return 'Strengthens your understanding with practice problems'
  } else {
    if (resource.difficulty === 'Advanced') {
      return 'Challenge yourself with advanced concepts'
    }
    return 'Reinforces and extends your current knowledge'
  }
}

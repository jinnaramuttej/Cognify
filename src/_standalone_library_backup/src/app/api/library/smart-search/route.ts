import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface SearchIntent {
  subjects: string[]
  chapters: string[]
  grades: string[]
  exams: string[]
  difficulties: string[]
  resourceTypes: string[]
  years: number[]
  keywords: string[]
}

interface SearchResult {
  id: string
  title: string
  description: string
  subject: string
  chapter: string
  grade: string
  exam: string
  difficulty: string
  resourceType: string
  estimatedTime: number
  viewCount: number
  isTrending: boolean
  matchScore: number
  matchReasons: string[]
}

// Subject aliases for natural language processing
const SUBJECT_ALIASES: { [key: string]: string } = {
  'physics': 'Physics',
  'phy': 'Physics',
  'p': 'Physics',
  'chemistry': 'Chemistry',
  'chem': 'Chemistry',
  'c': 'Chemistry',
  'math': 'Mathematics',
  'maths': 'Mathematics',
  'mathematics': 'Mathematics',
  'm': 'Mathematics',
  'biology': 'Biology',
  'bio': 'Biology',
  'botany': 'Biology',
  'zoology': 'Biology',
}

// Chapter/topic keywords mapping
const TOPIC_KEYWORDS: { [key: string]: string[] } = {
  'mechanics': ['Kinematics', 'Laws of Motion', 'Work Energy Power', 'Rotational Motion'],
  'thermodynamics': ['Thermodynamics', 'Kinetic Theory', 'Heat'],
  'electromagnetism': ['Electrostatics', 'Current Electricity', 'Magnetism', 'EMI', 'Electromagnetic Waves'],
  'optics': ['Ray Optics', 'Wave Optics'],
  'modern': ['Modern Physics', 'Dual Nature', 'Atoms Nuclei', 'Semiconductors'],
  'organic': ['Organic Chemistry', 'Hydrocarbons', 'Halides', 'Alcohols', 'Aldehydes'],
  'inorganic': ['Inorganic Chemistry', 'Periodic Table', 'Coordination Compounds'],
  'physical': ['Physical Chemistry', 'Mole Concept', 'Equilibrium', 'Electrochemistry'],
  'calculus': ['Limits Derivatives', 'Integrals', 'Applications of Derivatives', 'Differential Equations'],
  'algebra': ['Complex Numbers', 'Matrices Determinants', 'Permutations Combinations', 'Sequences Series'],
  'geometry': ['Coordinate Geometry', 'Straight Lines', 'Circles', 'Conic Sections'],
  'trigonometry': ['Trigonometric Functions', 'Trigonometric Equations'],
}

// Exam aliases
const EXAM_ALIASES: { [key: string]: string } = {
  'jee': 'JEE',
  'jee main': 'JEE',
  'jee advanced': 'JEE',
  'iit': 'JEE',
  'neet': 'NEET',
  'aiims': 'NEET',
  'medical': 'NEET',
  'boards': 'Boards',
  'cbse': 'Boards',
  'board': 'Boards',
}

// Difficulty aliases
const DIFFICULTY_ALIASES: { [key: string]: string } = {
  'easy': 'Beginner',
  'basic': 'Beginner',
  'beginner': 'Beginner',
  'medium': 'Intermediate',
  'intermediate': 'Intermediate',
  'moderate': 'Intermediate',
  'hard': 'Advanced',
  'advanced': 'Advanced',
  'difficult': 'Advanced',
  'tough': 'Advanced',
}

// Resource type aliases
const RESOURCE_TYPE_ALIASES: { [key: string]: string } = {
  'notes': 'Notes',
  'note': 'Notes',
  'pyq': 'PYQ',
  'pyqs': 'PYQ',
  'previous year': 'PYQ',
  'question': 'PYQ',
  'questions': 'PYQ',
  'concept': 'Concept Sheet',
  'concepts': 'Concept Sheet',
  'formula': 'Formula List',
  'formulas': 'Formula List',
  'video': 'Video',
  'videos': 'Video',
  'lecture': 'Video',
  'diagram': 'Diagram',
  'diagrams': 'Diagram',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const userId = searchParams.get('userId') || 'demo-user'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query.trim()) {
      return NextResponse.json({
        results: [],
        intent: null,
        suggestions: [],
        total: 0
      })
    }

    // Parse search intent from natural language
    const intent = parseSearchIntent(query.toLowerCase())

    // Build database query
    const whereClause = buildWhereClause(intent)

    // Execute search
    const resources = await db.libraryResource.findMany({
      where: whereClause,
      include: {
        chapter: {
          include: { subject: true }
        },
        bookmarks: {
          where: { userId }
        }
      },
      take: limit,
      skip: offset
    })

    // Calculate match scores and build results
    const results: SearchResult[] = resources.map(r => {
      const matchResult = calculateMatchScore(r, intent, query.toLowerCase())
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        subject: r.chapter?.subject?.name || '',
        chapter: r.chapter?.name || '',
        grade: r.grade,
        exam: r.exam,
        difficulty: r.difficulty,
        resourceType: r.resourceType,
        estimatedTime: r.estimatedTime,
        viewCount: r.viewCount,
        isTrending: r.isTrending,
        matchScore: matchResult.score,
        matchReasons: matchResult.reasons
      }
    })

    // Sort by match score
    results.sort((a, b) => b.matchScore - a.matchScore)

    // Get suggestions for refinement
    const suggestions = await getSearchSuggestions(intent, query)

    // Record search history
    await db.searchHistory.create({
      data: {
        userId,
        query,
        filters: JSON.stringify(intent),
        resultsCount: results.length
      }
    }).catch(() => {}) // Silent fail

    return NextResponse.json({
      results,
      intent: {
        detected: {
          subjects: intent.subjects,
          chapters: intent.chapters,
          grades: intent.grades,
          exams: intent.exams,
          difficulties: intent.difficulties,
          resourceTypes: intent.resourceTypes,
        },
        query: query
      },
      suggestions,
      total: results.length
    })
  } catch (error) {
    console.error('Smart search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

// Parse natural language search intent
function parseSearchIntent(query: string): SearchIntent {
  const tokens = query.toLowerCase().split(/\s+/)
  const intent: SearchIntent = {
    subjects: [],
    chapters: [],
    grades: [],
    exams: [],
    difficulties: [],
    resourceTypes: [],
    years: [],
    keywords: []
  }

  // Extract numbers for year/grade detection
  const numbers = query.match(/\d+/g) || []

  tokens.forEach(token => {
    // Check for subject
    if (SUBJECT_ALIASES[token] && !intent.subjects.includes(SUBJECT_ALIASES[token])) {
      intent.subjects.push(SUBJECT_ALIASES[token])
      return
    }

    // Check for exam
    if (EXAM_ALIASES[token] && !intent.exams.includes(EXAM_ALIASES[token])) {
      intent.exams.push(EXAM_ALIASES[token])
      return
    }

    // Check for difficulty
    if (DIFFICULTY_ALIASES[token] && !intent.difficulties.includes(DIFFICULTY_ALIASES[token])) {
      intent.difficulties.push(DIFFICULTY_ALIASES[token])
      return
    }

    // Check for resource type
    if (RESOURCE_TYPE_ALIASES[token] && !intent.resourceTypes.includes(RESOURCE_TYPE_ALIASES[token])) {
      intent.resourceTypes.push(RESOURCE_TYPE_ALIASES[token])
      return
    }

    // Check for topic keywords
    if (TOPIC_KEYWORDS[token]) {
      TOPIC_KEYWORDS[token].forEach(chapter => {
        if (!intent.chapters.includes(chapter)) {
          intent.chapters.push(chapter)
        }
      })
      return
    }

    // Add as keyword if no match
    if (token.length > 2) {
      intent.keywords.push(token)
    }
  })

  // Extract years (4 digit numbers)
  numbers.forEach(num => {
    const n = parseInt(num)
    if (n >= 2015 && n <= 2025) {
      intent.years.push(n)
    } else if (n === 11 || n === 12) {
      if (!intent.grades.includes(num)) {
        intent.grades.push(num)
      }
    }
  })

  return intent
}

// Build Prisma where clause from intent
function buildWhereClause(intent: SearchIntent): any {
  const conditions: any[] = []

  // Subject filter
  if (intent.subjects.length > 0) {
    conditions.push({
      chapter: {
        subject: {
          name: { in: intent.subjects }
        }
      }
    })
  }

  // Chapter filter
  if (intent.chapters.length > 0) {
    conditions.push({
      chapter: {
        name: { in: intent.chapters }
      }
    })
  }

  // Grade filter
  if (intent.grades.length > 0) {
    conditions.push({ grade: { in: intent.grades } })
  }

  // Exam filter
  if (intent.exams.length > 0) {
    conditions.push({ 
      OR: intent.exams.map(e => ({
        exam: { contains: e }
      }))
    })
  }

  // Difficulty filter
  if (intent.difficulties.length > 0) {
    conditions.push({ difficulty: { in: intent.difficulties } })
  }

  // Resource type filter
  if (intent.resourceTypes.length > 0) {
    conditions.push({ resourceType: { in: intent.resourceTypes } })
  }

  // Year filter
  if (intent.years.length > 0) {
    conditions.push({ year: { in: intent.years } })
  }

  // Keyword search
  if (intent.keywords.length > 0) {
    const keywordConditions = intent.keywords.map(keyword => ({
      OR: [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
        { tags: { contains: keyword } },
        { searchKeywords: { contains: keyword } }
      ]
    }))
    conditions.push(...keywordConditions)
  }

  // Combine conditions with AND
  if (conditions.length === 0) {
    // If no specific intent, do a broad search on the query
    return {}
  }

  return { AND: conditions }
}

// Calculate match score for a resource
function calculateMatchScore(
  resource: any,
  intent: SearchIntent,
  query: string
): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // Title exact match bonus
  if (resource.title.toLowerCase().includes(query)) {
    score += 30
    reasons.push('Title matches search')
  }

  // Subject match
  if (intent.subjects.includes(resource.chapter?.subject?.name)) {
    score += 20
    reasons.push(`Matches subject: ${resource.chapter?.subject?.name}`)
  }

  // Chapter match
  if (intent.chapters.some(c => resource.chapter?.name?.includes(c))) {
    score += 15
    reasons.push(`Matches topic: ${resource.chapter?.name}`)
  }

  // Difficulty match
  if (intent.difficulties.includes(resource.difficulty)) {
    score += 10
    reasons.push(`Matches difficulty: ${resource.difficulty}`)
  }

  // Resource type match
  if (intent.resourceTypes.includes(resource.resourceType)) {
    score += 10
    reasons.push(`Matches type: ${resource.resourceType}`)
  }

  // Year match
  if (intent.years.includes(resource.year)) {
    score += 15
    reasons.push(`Matches year: ${resource.year}`)
  }

  // Trending bonus
  if (resource.isTrending) {
    score += 5
    reasons.push('Trending resource')
  }

  // High view count bonus
  if (resource.viewCount > 100) {
    score += 5
  }

  // Mastery weight bonus
  score += Math.min(10, (resource.masteryWeight || 1) * 5)

  return { score: Math.min(100, score), reasons }
}

// Get search suggestions for refinement
async function getSearchSuggestions(intent: SearchIntent, query: string): Promise<string[]> {
  const suggestions: string[] = []

  // If no subject detected, suggest popular subjects
  if (intent.subjects.length === 0 && intent.keywords.length > 0) {
    suggestions.push(`${query} physics`)
    suggestions.push(`${query} chemistry`)
    suggestions.push(`${query} mathematics`)
  }

  // If no resource type detected, suggest types
  if (intent.resourceTypes.length === 0) {
    suggestions.push(`${query} notes`)
    suggestions.push(`${query} pyq`)
  }

  // If no difficulty detected, suggest based on keywords
  if (intent.difficulties.length === 0 && query.includes('basic')) {
    suggestions.push(query.replace('basic', 'beginner'))
  }

  // Add year suggestions for PYQ queries
  if (intent.resourceTypes.includes('PYQ') && intent.years.length === 0) {
    suggestions.push(`${query} 2024`)
    suggestions.push(`${query} 2023`)
  }

  return [...new Set(suggestions)].slice(0, 5)
}

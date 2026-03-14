import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Create a fresh PrismaClient instance
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

const SUBJECTS_DATA = [
  {
    name: 'Physics',
    code: 'PHY',
    exam: 'Both',
    icon: 'Atom',
    color: '#3B82F6',
    chapters: [
      { name: 'Mechanics', number: 1, weightage: 15, description: 'Motion, forces, energy, and momentum' },
      { name: 'Thermodynamics', number: 2, weightage: 10, description: 'Heat, temperature, and thermal systems' },
      { name: 'Waves & Oscillations', number: 3, weightage: 8, description: 'Wave motion and simple harmonic motion' },
      { name: 'Electrostatics', number: 4, weightage: 12, description: 'Electric charges, fields, and potential' },
      { name: 'Current Electricity', number: 5, weightage: 10, description: 'Electric circuits and current flow' },
      { name: 'Magnetism', number: 6, weightage: 10, description: 'Magnetic fields and electromagnetic induction' },
      { name: 'Optics', number: 7, weightage: 8, description: 'Light, reflection, refraction, and wave optics' },
      { name: 'Modern Physics', number: 8, weightage: 12, description: 'Quantum mechanics, atoms, and nuclei' },
    ]
  },
  {
    name: 'Chemistry',
    code: 'CHEM',
    exam: 'Both',
    icon: 'FlaskConical',
    color: '#10B981',
    chapters: [
      { name: 'Atomic Structure', number: 1, weightage: 8, description: 'Structure of atoms and quantum numbers' },
      { name: 'Chemical Bonding', number: 2, weightage: 10, description: 'Ionic, covalent, and metallic bonds' },
      { name: 'States of Matter', number: 3, weightage: 6, description: 'Solid, liquid, and gaseous states' },
      { name: 'Thermodynamics', number: 4, weightage: 8, description: 'Energy changes in chemical reactions' },
      { name: 'Chemical Equilibrium', number: 5, weightage: 10, description: 'Dynamic equilibrium and Le Chatelier principle' },
      { name: 'Electrochemistry', number: 6, weightage: 8, description: 'Electrochemical cells and electrolysis' },
      { name: 'Organic Chemistry', number: 7, weightage: 15, description: 'Carbon compounds and reactions' },
      { name: 'Coordination Compounds', number: 8, weightage: 8, description: 'Complex compounds and ligands' },
    ]
  },
  {
    name: 'Mathematics',
    code: 'MATH',
    exam: 'JEE',
    icon: 'Calculator',
    color: '#8B5CF6',
    chapters: [
      { name: 'Algebra', number: 1, weightage: 12, description: 'Polynomials, sequences, and series' },
      { name: 'Trigonometry', number: 2, weightage: 8, description: 'Trigonometric functions and identities' },
      { name: 'Coordinate Geometry', number: 3, weightage: 15, description: 'Lines, circles, and conic sections' },
      { name: 'Calculus', number: 4, weightage: 20, description: 'Limits, derivatives, and integrals' },
      { name: 'Vectors', number: 5, weightage: 8, description: 'Vector algebra and 3D geometry' },
      { name: 'Probability', number: 6, weightage: 10, description: 'Probability and statistics' },
      { name: 'Matrices', number: 7, weightage: 8, description: 'Matrix operations and determinants' },
      { name: 'Complex Numbers', number: 8, weightage: 6, description: 'Complex algebra and geometry' },
    ]
  },
  {
    name: 'Biology',
    code: 'BIO',
    exam: 'NEET',
    icon: 'Leaf',
    color: '#F59E0B',
    chapters: [
      { name: 'Cell Biology', number: 1, weightage: 12, description: 'Cell structure and function' },
      { name: 'Genetics', number: 2, weightage: 15, description: 'Heredity and variation' },
      { name: 'Human Physiology', number: 3, weightage: 18, description: 'Human body systems' },
      { name: 'Plant Physiology', number: 4, weightage: 10, description: 'Plant functions and processes' },
      { name: 'Ecology', number: 5, weightage: 8, description: 'Ecosystems and environment' },
      { name: 'Evolution', number: 6, weightage: 6, description: 'Origin and evolution of life' },
      { name: 'Biotechnology', number: 7, weightage: 8, description: 'Genetic engineering and applications' },
      { name: 'Reproduction', number: 8, weightage: 10, description: 'Reproductive systems and processes' },
    ]
  }
]

const RESOURCE_TYPES = ['Notes', 'PYQ', 'Concept Sheet', 'Diagram', 'Formula List'] as const
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const
const GRADES = ['11', '12'] as const

function generateTags(subject: string, chapter: string, resourceType: string): string {
  const baseTags = [subject.toLowerCase(), chapter.toLowerCase().replace(/\s+/g, '-')]
  const additionalTags = ['jee', 'neet', 'important', 'exam-focused', 'conceptual', 'practice', 'revision']
  const selectedTags = baseTags.concat(
    additionalTags.sort(() => Math.random() - 0.5).slice(0, 3)
  )
  return JSON.stringify([...new Set(selectedTags)])
}

function generateDescription(title: string, chapter: string): string {
  const templates = [
    `Comprehensive study material covering all key concepts of ${chapter}.`,
    `Detailed notes for ${chapter} with solved examples and practice problems.`,
    `Complete resource for ${chapter} as per latest JEE/NEET syllabus.`,
    `Essential concepts and formulas for ${chapter} - perfect for quick revision.`,
    `In-depth analysis of ${chapter} with previous year questions and solutions.`
  ]
  return templates[Math.floor(Math.random() * templates.length)]
}

export async function GET() {
  try {
    // Check available models
    const modelKeys = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'))
    
    // Check if data already exists
    const existingSubjects = await prisma.subject.findMany()
    if (existingSubjects.length > 0) {
      return NextResponse.json({ 
        message: 'Database already seeded',
        count: existingSubjects.length,
        models: modelKeys
      })
    }

    // Create sample user
    const user = await prisma.user.upsert({
      where: { email: 'demo@cognify.com' },
      update: {},
      create: {
        email: 'demo@cognify.com',
        name: 'Demo Student',
        grade: '12',
        targetExam: 'JEE'
      }
    })

    // Create subjects and chapters
    for (const subjectData of SUBJECTS_DATA) {
      const subject = await prisma.subject.create({
        data: {
          name: subjectData.name,
          code: subjectData.code,
          exam: subjectData.exam,
          icon: subjectData.icon,
          color: subjectData.color
        }
      })

      // Create chapters for this subject
      for (const chapterData of subjectData.chapters) {
        const chapter = await prisma.chapter.create({
          data: {
            subjectId: subject.id,
            name: chapterData.name,
            number: chapterData.number,
            description: chapterData.description,
            weightage: chapterData.weightage,
            difficulty: DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)],
            commonMistakeRate: Math.random() * 30
          }
        })

        // Create resources for this chapter
        const numResources = Math.floor(Math.random() * 3) + 2 // 2-4 resources per chapter
        
        for (let i = 0; i < numResources; i++) {
          const resourceType = RESOURCE_TYPES[i % RESOURCE_TYPES.length]
          const grade = GRADES[Math.floor(Math.random() * GRADES.length)]
          const exam = subjectData.exam === 'Both' 
            ? (Math.random() > 0.5 ? 'JEE' : 'NEET')
            : subjectData.exam

          const title = `${chapterData.name} - ${resourceType}`
          
          await prisma.libraryResource.create({
            data: {
              title,
              description: generateDescription(title, chapterData.name),
              subjectId: subject.id,
              chapterId: chapter.id,
              grade,
              exam,
              difficulty: DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)],
              resourceType,
              fileUrl: `/resources/${subject.code.toLowerCase()}/${chapterData.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
              thumbnailUrl: null,
              content: null,
              tags: generateTags(subjectData.name, chapterData.name, resourceType),
              viewCount: Math.floor(Math.random() * 500) + 50,
              readingTime: Math.floor(Math.random() * 20) + 5,
              isTrending: Math.random() > 0.85,
              allowDownload: Math.random() > 0.2,
              year: resourceType === 'PYQ' ? 2020 + Math.floor(Math.random() * 4) : null
            }
          })
        }
      }
    }

    // Create some PYQs
    const physicsSubject = await prisma.subject.findFirst({ where: { name: 'Physics' } })
    if (physicsSubject) {
      const physicsChapters = await prisma.chapter.findMany({ where: { subjectId: physicsSubject.id } })

      for (const chapter of physicsChapters.slice(0, 4)) {
        for (let year = 2020; year <= 2023; year++) {
          await prisma.pYQ.create({
            data: {
              question: `Sample JEE/NEET ${year} question from ${chapter.name}. This is a practice question for competitive exam preparation.`,
              solution: `Detailed solution for the ${chapter.name} question. The answer involves applying fundamental concepts...`,
              subjectId: physicsSubject.id,
              chapterId: chapter.id,
              year,
              exam: Math.random() > 0.5 ? 'JEE' : 'NEET',
              difficulty: DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)],
              marks: Math.random() > 0.5 ? 4 : 1,
              topic: chapter.name,
              attemptCount: Math.floor(Math.random() * 100),
              correctRate: 40 + Math.random() * 40
            }
          })
        }
      }
    }

    // Create weak topics for user
    const mathSubject = await prisma.subject.findFirst({ where: { name: 'Mathematics' } })
    if (mathSubject) {
      const mathChapters = await prisma.chapter.findMany({ where: { subjectId: mathSubject.id } })

      for (const chapter of mathChapters.slice(0, 3)) {
        await prisma.weakTopic.create({
          data: {
            userId: user.id,
            subjectId: mathSubject.id,
            chapterId: chapter.id,
            topic: chapter.name,
            accuracy: 30 + Math.random() * 30,
            suggestedAction: 'Practice more problems and review concepts'
          }
        })
      }
    }

    // Create achievements
    const achievements = [
      { key: 'bookworm', name: 'Bookworm', description: 'Read for 10 hours total', icon: 'book', category: 'content', requirement: JSON.stringify({ type: 'reading', value: 600 }), xpReward: 100 },
      { key: 'video_master', name: 'Video Master', description: 'Watch 50 video lessons', icon: 'video', category: 'content', requirement: JSON.stringify({ type: 'video', value: 50 }), xpReward: 250 },
      { key: 'streak_7', name: '7-Day Streak', description: 'Maintain a 7-day learning streak', icon: 'flame', category: 'streak', requirement: JSON.stringify({ type: 'streak', value: 7 }), xpReward: 100 },
      { key: 'streak_30', name: '30-Day Streak', description: 'Maintain a 30-day learning streak', icon: 'flame', category: 'streak', requirement: JSON.stringify({ type: 'streak', value: 30 }), xpReward: 500 },
      { key: 'quiz_champion', name: 'Quiz Champion', description: 'Score 100% on 10 quizzes', icon: 'target', category: 'quiz', requirement: JSON.stringify({ type: 'quiz_perfect', value: 10 }), xpReward: 200 },
      { key: 'xp_1000', name: 'Rising Star', description: 'Earn 1,000 XP', icon: 'star', category: 'achievement', requirement: JSON.stringify({ type: 'xp', value: 1000 }), xpReward: 50 },
      { key: 'xp_5000', name: 'Scholar', description: 'Earn 5,000 XP', icon: 'award', category: 'achievement', requirement: JSON.stringify({ type: 'xp', value: 5000 }), xpReward: 200 },
      { key: 'early_bird', name: 'Early Bird', description: 'Study before 7 AM for 5 days', icon: 'sun', category: 'achievement', requirement: JSON.stringify({ type: 'early', value: 5 }), xpReward: 150 },
      { key: 'night_owl', name: 'Night Owl', description: 'Study after 10 PM for 5 days', icon: 'moon', category: 'achievement', requirement: JSON.stringify({ type: 'night', value: 5 }), xpReward: 150 },
      { key: 'perfectionist', name: 'Perfectionist', description: 'Complete 20 resources with 100% accuracy', icon: 'check', category: 'mastery', requirement: JSON.stringify({ type: 'perfect', value: 20 }), xpReward: 400 },
      { key: 'speed_reader', name: 'Speed Reader', description: 'Read 500 pages in a week', icon: 'zap', category: 'content', requirement: JSON.stringify({ type: 'pages', value: 500 }), xpReward: 150 },
      { key: 'interactive_learner', name: 'Interactive Learner', description: 'Complete 25 interactive exercises', icon: 'brain', category: 'content', requirement: JSON.stringify({ type: 'interactive', value: 25 }), xpReward: 200 },
      { key: 'top_learner', name: 'Top Learner', description: 'Reach #1 on the leaderboard', icon: 'crown', category: 'achievement', requirement: JSON.stringify({ type: 'rank', value: 1 }), xpReward: 1000 },
      { key: 'knowledge_seeker', name: 'Knowledge Seeker', description: 'Access 100 different resources', icon: 'search', category: 'content', requirement: JSON.stringify({ type: 'resources', value: 100 }), xpReward: 300 },
      { key: 'flashcard_pro', name: 'Flashcard Pro', description: 'Review 500 flashcards', icon: 'layers', category: 'flashcard', requirement: JSON.stringify({ type: 'flashcards', value: 500 }), xpReward: 150 },
    ]

    for (const achievement of achievements) {
      await prisma.achievement.upsert({
        where: { key: achievement.key },
        update: achievement,
        create: achievement
      })
    }

    // Create study streak for user
    await prisma.studyStreak.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        currentStreak: 12,
        longestStreak: 18,
        totalXP: 1250,
        level: 5,
        lastStudyAt: new Date()
      }
    })

    // Create some study day logs
    const now = new Date()
    const streakRecord = await prisma.studyStreak.findUnique({ where: { userId: user.id } })
    if (streakRecord) {
      for (let i = 0; i < 7; i++) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        date.setHours(0, 0, 0, 0)
        
        await prisma.studyDayLog.create({
          data: {
            streakId: streakRecord.id,
            date,
            resourcesViewed: Math.floor(Math.random() * 5) + 1,
            quizzesCompleted: Math.floor(Math.random() * 2),
            flashcardsReviewed: Math.floor(Math.random() * 10),
            xpEarned: Math.floor(Math.random() * 100) + 20,
            studyMinutes: Math.floor(Math.random() * 60) + 20,
            goalMet: Math.random() > 0.3
          }
        })
      }
    }

    return NextResponse.json({ 
      message: 'Database seeded successfully',
      userId: user.id,
      models: modelKeys
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to seed database', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

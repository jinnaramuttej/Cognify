// Library Module Types - Enhanced for Intelligent Knowledge System

// Design System Colors (for reference)
// Primary: #2563EB, Hover: #1D4ED8, Light Panels: #F3F6FB
// Borders: #E5E7EB, Success: #10B981, Warning: #DC2626

export type Grade = '11' | '12'
export type Exam = 'JEE' | 'NEET'
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'
export type ResourceType = 'Notes' | 'PYQ' | 'Concept Sheet' | 'Diagram' | 'Formula List' | 'Video' | 'Audio' | 'PDF' | 'Interactive' | 'Quiz' | 'Flashcards'
export type MediaType = 'video' | 'audio' | 'pdf' | 'text' | 'interactive'

// ==================== Core Types ====================

export interface Subject {
  id: string
  name: string
  code: string
  exam: Exam | 'Both'
  totalChapters: number
  totalResources: number
  userProgress: number
  weakTopicCount: number
  icon: string
  color: string
}

export interface Chapter {
  id: string
  subjectId: string
  name: string
  number: number
  description: string
  weightage: number // Percentage weightage in exam
  difficulty: Difficulty
  commonMistakeRate: number
  totalResources: number
  userProgress: number
  isWeakTopic: boolean
  lastStudiedAt: string | null
}

export interface LibraryResource {
  id: string
  title: string
  description: string
  subject: string
  subjectId: string
  chapter: string
  chapterId: string
  grade: Grade
  exam: Exam
  difficulty: Difficulty
  resourceType: ResourceType
  fileUrl: string
  thumbnailUrl: string | null
  content: string | null // For rich text content
  tags: string[]
  viewCount: number
  readingTime: number // in minutes
  isBookmarked: boolean
  isTrending: boolean
  year: number | null // For PYQs
  createdAt: string
  updatedAt: string
}

export interface PYQ {
  id: string
  question: string
  solution: string | null
  subject: string
  chapter: string
  year: number
  exam: Exam
  difficulty: Difficulty
  marks: number
  topic: string
  isBookmarked: boolean
  attemptCount: number
  correctRate: number
  createdAt: string
}

// ==================== User Tracking Types ====================

export interface LibraryBookmark {
  id: string
  userId: string
  resourceId: string | null
  pyqId: string | null
  sectionTitle: string | null
  createdAt: string
}

export interface LibraryView {
  id: string
  userId: string
  resourceId: string
  duration: number // Reading time in seconds
  scrollProgress: number // 0-100
  viewedAt: string
}

export interface RevisionSchedule {
  id: string
  userId: string
  resourceId: string
  lastRevisedAt: string
  nextRevisionAt: string
  revisionCount: number
  interval: number // Days between revisions (spaced repetition)
  confidence: number // 0-100 user confidence level
}

export interface WeakTopic {
  id: string
  userId: string
  subjectId: string
  chapterId: string
  topic: string
  accuracy: number
  lastAttemptAt: string
  suggestedAction: string
}

// ==================== Filter & Search Types ====================

export interface LibraryFilters {
  grade: Grade | null
  exam: Exam | null
  subject: string | null
  chapter: string | null
  resourceType: ResourceType | null
  difficulty: Difficulty | null
  year: number | null
  recentlyAdded: boolean
  trending: boolean
  searchQuery: string
}

export interface PYQFilters {
  year: number | null
  exam: Exam | null
  subject: string | null
  chapter: string | null
  difficulty: Difficulty | null
  marks: number | null
}

// ==================== Insight Types ====================

export interface ChapterInsights {
  chapterId: string
  accuracy: number
  lastTestScore: number | null
  totalTests: number
  mistakeTypes: MistakeType[]
  recommendedNextChapter: string | null
  suggestedRevisionDate: string | null
  timeSpent: number // Total minutes
}

export interface MistakeType {
  type: string
  count: number
  examples: string[]
}

export interface ResourceInsight {
  resourceId: string
  avgReadingTime: number
  completionRate: number
  bookmarkRate: number
  difficultyRating: number
  userRating: number | null
}

// ==================== Recommendation Types ====================

export interface RecommendationItem {
  id: string
  title: string
  reason: string
  subject: string
  chapter: string
  matchScore: number
  type: 'weak_topic' | 'trending' | 'revision' | 'next_chapter'
}

// ==================== API Response Types ====================

export interface LibraryHomeResponse {
  subjects: Subject[]
  recentlyViewed: LibraryResource[]
  continueStudying: LibraryResource | null
  dueForRevision: number
}

export interface LibraryResourcesResponse {
  resources: LibraryResource[]
  total: number
  page: number
  pageSize: number
}

export interface ChapterResourcesResponse {
  chapter: Chapter
  resources: LibraryResource[]
  insights: ChapterInsights
}

// ==================== Sort & View Types ====================

export type SortOption = 'newest' | 'oldest' | 'most_viewed' | 'title_asc' | 'title_desc' | 'relevance'

export type ViewMode = 'grid' | 'list'

// ==================== UI State Types ====================

export interface FilterOption {
  value: string
  label: string
  count?: number
}

export interface SubjectChapter {
  subject: string
  chapters: string[]
}

// ==================== Multimedia Types ====================

export interface VideoChapter {
  time: number // seconds
  title: string
}

export interface TranscriptSegment {
  time: number
  text: string
}

export interface MultimediaResource extends LibraryResource {
  mediaType: MediaType
  duration: number | null // seconds
  videoChapters: VideoChapter[] | null
  transcript: string | null
  hasQuiz: boolean
  hasFlashcards: boolean
}

// ==================== Learning Path Types ====================

export interface LearningPath {
  id: string
  name: string
  description: string | null
  subjectId: string
  subject: string
  difficulty: Difficulty
  totalStages: number
  estimatedHours: number
  icon: string | null
  color: string | null
  isActive: boolean
  progress: number // 0-100
  currentStage: number
  isEnrolled: boolean
  createdAt: string
}

export interface LearningPathStage {
  id: string
  pathId: string
  name: string
  description: string | null
  order: number
  estimatedMinutes: number
  prerequisiteStageId: string | null
  resources: StageResource[]
  progress: number // 0-100
  isCompleted: boolean
  isLocked: boolean
}

export interface StageResource {
  id: string
  resourceId: string
  resource: LibraryResource
  order: number
  isRequired: boolean
}

export interface LearningPathEnrollment {
  id: string
  pathId: string
  currentStage: number
  progress: number
  enrolledAt: string
  completedAt: string | null
}

// ==================== Flashcard Types ====================

export interface FlashcardDeck {
  id: string
  name: string
  description: string | null
  chapterId: string
  resourceId: string | null
  cardCount: number
  isPublic: boolean
  dueCount: number
  progress: number
  createdAt: string
}

export interface Flashcard {
  id: string
  deckId: string
  front: string
  back: string
  hint: string | null
  imageUrl: string | null
  tags: string[]
  order: number
  progress?: FlashcardProgress
}

export interface FlashcardProgress {
  id: string
  cardId: string
  easeFactor: number
  interval: number // days
  repetitions: number
  nextReviewAt: string
  lastReviewAt: string | null
}

export type FlashcardRating = 'again' | 'hard' | 'good' | 'easy'

// ==================== Annotation Types ====================

export type HighlightColor = 'yellow' | 'green' | 'pink' | 'blue' | 'orange'

export interface Highlight {
  id: string
  userId: string
  resourceId: string
  startPosition: number
  endPosition: number
  text: string
  color: HighlightColor
  note: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

// ==================== Gamification Types ====================

export interface StudyStreak {
  id: string
  userId: string
  currentStreak: number
  longestStreak: number
  lastStudyAt: string | null
  totalXP: number
  level: number
  todayProgress: number
  todayGoal: number
}

export interface StudyDayLog {
  id: string
  date: string
  resourcesViewed: number
  quizzesCompleted: number
  flashcardsReviewed: number
  xpEarned: number
  studyMinutes: number
  goalMet: boolean
}

export interface Achievement {
  id: string
  key: string
  name: string
  description: string
  icon: string
  category: 'streak' | 'content' | 'quiz' | 'flashcard' | 'path'
  requirement: {
    type: string
    value: number
  }
  xpReward: number
  progress: number // 0-100
  isUnlocked: boolean
  unlockedAt?: string
}

export interface UserAchievement {
  id: string
  achievementId: string
  achievement: Achievement
  unlockedAt: string
}

// ==================== Concept Map Types ====================

export interface ConceptNode {
  id: string
  name: string
  description: string | null
  chapterId: string
  subjectId: string
  importance: number // 0-100
  resourceIds: string[]
}

export interface ConceptEdge {
  id: string
  fromNodeId: string
  toNodeId: string
  relationship: 'prerequisite' | 'related' | 'applies' | 'example'
}

export interface ConceptMap {
  nodes: ConceptNode[]
  edges: ConceptEdge[]
}

// ==================== Quick Actions Types ====================

export type QuickAction = 
  | 'open' 
  | 'bookmark' 
  | 'revision' 
  | 'flashcards' 
  | 'quiz' 
  | 'ask_cogni' 
  | 'share' 
  | 'download'
  | 'add_to_path'

export interface QuickActionItem {
  id: QuickAction
  label: string
  icon: string
  shortcut?: string
  category: 'primary' | 'secondary' | 'destructive'
}

// ==================== Intelligence Layer Types ====================

export interface WeakTopicRecommendation {
  id: string
  topic: string
  chapter: string
  subject: string
  subjectId: string
  chapterId: string
  accuracy: number
  urgency: 'high' | 'medium' | 'low'
  trend: 'declining' | 'stable' | 'improving'
  recommendedResources: IntelligenceResource[]
  suggestedAction: string
}

export interface IntelligenceResource {
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

export interface MasteryProfile {
  overallMastery: number
  subjectMastery: { [subject: string]: number }
  chapterMastery: { [chapter: string]: number }
  weakestChapters: string[]
  strongestChapters: string[]
}

export interface ContinueLearningItem {
  resourceId: string
  title: string
  subject: string
  chapter: string
  progress: number
  currentPage: number
  totalPages: number
  lastViewed: string
  timeSpent: number
  isBookmarked: boolean
}

export interface IntelligenceInsights {
  totalStudyTime: number
  averageMastery: number
  resourcesCompleted: number
  topicsNeedingReview: number
}

export interface IntelligenceResponse {
  weakTopics: WeakTopicRecommendation[]
  continueLearning: ContinueLearningItem[]
  masteryAwareRecommendations: IntelligenceResource[]
  masteryProfile: MasteryProfile
  searchSuggestions: {
    recentSearches: string[]
    suggestedTopics: string[]
    trendingTopics: { topic: string; subject: string; resourceCount: number }[]
  }
  insights: IntelligenceInsights
}

export interface SmartSearchResult {
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

export interface SmartSearchResponse {
  results: SmartSearchResult[]
  intent: {
    detected: {
      subjects: string[]
      chapters: string[]
      grades: string[]
      exams: string[]
      difficulties: string[]
      resourceTypes: string[]
    }
    query: string
  }
  suggestions: string[]
  total: number
}

// ==================== Enhanced Resource Types ====================

export interface EnhancedLibraryResource extends LibraryResource {
  masteryWeight: number
  estimatedTime: number
  completionRate: number
  averageRating: number
  recommendationScore: number
  prerequisiteIds: string[]
  relatedResourceIds: string[]
  curriculumCode: string | null
  weightageInExam: number
}

export interface ResourceMasteryProgress {
  id: string
  userId: string
  resourceId: string
  masteryLevel: number
  timeSpent: number
  lastAccessedAt: string
  revisionCount: number
  scrollPosition: number
  currentPage: number
  totalPages: number
  completionPercentage: number
  lastStudyDuration: number
  recallStrength: number
  nextReviewDue: string | null
  confidenceLevel: number
}

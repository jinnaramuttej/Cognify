// Cognify Test Engine Types - Blue & White Theme

// ============================================
// THEME COLORS
// ============================================

export const THEME = {
  primary: '#2563EB',      // Academic Blue
  primaryHover: '#1D4ED8', // Darker Blue on hover
  primaryLight: '#DBEAFE', // Light blue background
  secondary: '#F3F6FB',    // Light background panels
  border: '#E5E7EB',       // Subtle borders
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Amber
  error: '#EF4444',        // Red
  text: {
    primary: '#111827',    // Main text
    secondary: '#6B7280',  // Secondary text
    muted: '#9CA3AF'       // Muted text
  }
} as const

// ============================================
// ENUMS
// ============================================

export type TestStatus = 'draft' | 'upcoming' | 'active' | 'closed'
export type TestType = 'practice' | 'exam' | 'adaptive' | 'pyq'
export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed'
export type SubjectName = 'physics' | 'chemistry' | 'math' | 'biology'
export type Grade = '11th' | '12th'
export type TargetExam = 'JEE' | 'NEET' | 'Boards'
export type QuestionStatus = 'unattempted' | 'attempted' | 'marked_for_review' | 'current' | 'doubtful'
export type MistakeType = 'conceptual' | 'calculation' | 'time_pressure' | 'silly'
export type FocusLevel = 'strong' | 'moderate' | 'needs_attention'

// ============================================
// DATABASE MODELS
// ============================================

export interface Subject {
  id: string
  name: string
  code: string
  icon?: string
  color: string
  order: number
  chapters: Chapter[]
}

export interface Chapter {
  id: string
  subjectId: string
  name: string
  slug: string
  description?: string
  weightage: number
  order: number
  grade: string
  isActive: boolean
  questionCount?: number
}

export interface Question {
  id: string
  subjectId: string
  chapterId: string
  text: string
  imageUrl?: string
  passage?: string
  options: QuestionOption[]
  correctAnswer: string
  difficulty: Difficulty
  questionType: 'single' | 'multiple' | 'integer' | 'numerical'
  marks: number
  negativeMarks: number
  isPYQ: boolean
  pyqYear?: number
  pyqExam?: string
  isConceptual: boolean
  explanation: string
  solutionImageUrl?: string
  videoSolutionUrl?: string
  timesAttempted: number
  timesCorrect: number
  avgTimeSpent: number
}

export interface QuestionOption {
  id: string
  label: 'A' | 'B' | 'C' | 'D'
  text: string
  imageUrl?: string
}

export interface Test {
  id: string
  name: string
  description?: string
  instructions?: string
  testType: TestType
  subjectId?: string
  grade: Grade
  targetExam?: TargetExam
  timeLimit: number
  difficulty: Difficulty
  totalMarks: number
  passingMarks?: number
  questionCount: number
  chapters: string[]
  subjectDistribution: Record<string, number>
  isPublic: boolean
  isInstitutional: boolean
  institutionId?: string
  accessCode?: string
  status: TestStatus
  startsAt?: Date
  endsAt?: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
  questions?: Question[]
}

export interface TestAttempt {
  id: string
  userId: string
  testId: string
  status: 'in_progress' | 'submitted' | 'auto_submitted' | 'abandoned'
  currentQuestion: number
  startedAt: Date
  submittedAt?: Date
  timeSpent: number
  pausedDuration: number
  score: number
  totalMarks: number
  percentage: number
  percentile?: number
  rank?: number
  totalAttempts?: number
  accuracy: number
  correctCount: number
  incorrectCount: number
  unattemptedCount: number
  subjectBreakdown: SubjectBreakdownItem[]
  chapterBreakdown: ChapterBreakdownItem[]
  timeAnalysis: TimeAnalysis
  mistakeAnalysis: MistakeAnalysis
}

export interface AttemptAnswer {
  id: string
  attemptId: string
  questionId: string
  selectedAnswer: string | null
  isCorrect: boolean | null
  marksAwarded: number
  isMarkedForReview: boolean
  isDoubtful: boolean
  isBookmarked: boolean
  timeSpent: number
  visitCount: number
  mistakeType?: MistakeType
}

// ============================================
// ANALYSIS TYPES
// ============================================

export interface SubjectBreakdownItem {
  subjectId: string
  subjectName: string
  correct: number
  incorrect: number
  total: number
  accuracy: number
  timeSpent: number
  color: string
}

export interface ChapterBreakdownItem {
  chapterId: string
  chapterName: string
  subjectId: string
  subjectName: string
  correct: number
  incorrect: number
  total: number
  accuracy: number
  focusLevel: FocusLevel
  timeSpent: number
}

export interface TimeAnalysis {
  totalTime: number
  avgTimePerQuestion: number
  timeDistribution: {
    easy: number
    medium: number
    hard: number
  }
  timeWasters: string[] // Question IDs where too much time spent
}

export interface MistakeAnalysis {
  conceptual: number
  calculation: number
  timePressure: number
  silly: number
  total: number
}

export interface TestRecommendation {
  chaptersToRevise: string[]
  suggestedDifficulty: Difficulty
  suggestedTestLength: number
  suggestedNextTest: string
  recommendedStudyHours: number
  weakAreas: string[]
  strongAreas: string[]
  improvementPlan: ImprovementItem[]
}

export interface ImprovementItem {
  chapter: string
  subject: string
  currentAccuracy: number
  targetAccuracy: number
  priority: number
  estimatedHours: number
}

// ============================================
// UI STATE TYPES
// ============================================

export interface QuestionState {
  questionId: string
  selectedAnswer: string | null
  isMarkedForReview: boolean
  isDoubtful: boolean
  status: QuestionStatus
  timeSpent: number
  visitCount: number
}

export interface TestSession {
  testId: string
  test: Test
  questions: Question[]
  answers: Map<string, QuestionState>
  currentQuestionIndex: number
  timeRemaining: number
  startedAt: Date
  isPaused: boolean
  pauseCount: number
}

// ============================================
// PERFORMANCE STATS
// ============================================

export interface PerformanceSnapshot {
  overallAccuracy: number
  testsAttempted: number
  totalQuestions: number
  strongestSubject: string
  strongestSubjectAccuracy: number
  weakestSubject: string
  weakestSubjectAccuracy: number
  averageTimePerQuestion: number
  improvementTrend: 'up' | 'down' | 'stable'
  recentScores: number[]
  recommendedAction: string
}

export interface SubjectPerformance {
  subjectId: string
  subjectName: string
  totalAttempts: number
  totalCorrect: number
  totalIncorrect: number
  totalQuestions: number
  accuracy: number
  avgTimePerQ: number
  trendDirection?: 'up' | 'down' | 'stable'
}

// ============================================
// TEST GENERATION REQUEST
// ============================================

export interface CreateTestRequest {
  name?: string
  grade: Grade
  targetExam: TargetExam
  subjectIds: string[]
  chapterIds: string[]
  difficulty: Difficulty
  questionCount: number
  timeLimit: number
  includePYQ: boolean
  includeConceptual: boolean
  testType: TestType
  subjectDistribution?: Record<string, number>
  isAutoBalanced: boolean
}

export interface TestGenerationPreview {
  estimatedDifficulty: number
  estimatedTime: number
  coverageBreakdown: {
    subject: string
    chapters: number
    questions: number
    percentage: number
  }[]
  availableQuestions: number
  warnings: string[]
}

// ============================================
// CHART DATA
// ============================================

export interface ChartData {
  name: string
  value: number
  color?: string
}

export interface TimeSeriesData {
  date: string
  score: number
  accuracy: number
}

// ============================================
// IRT & ADAPTIVE TESTING
// ============================================

export interface IRTParameters {
  a: number // Discrimination parameter (typically 0.5 - 2.5)
  b: number // Difficulty parameter (typically -3 to +3)
  c: number // Guessing parameter (typically 0 - 0.35)
}

export interface ItemStats {
  questionId: string
  pValue: number // Proportion correct
  discriminationIndex: number // Point-biserial correlation
  avgTimeSeconds: number
  medianTimeSeconds: number
  skipRate: number
  guessRate: number
  irtParameters?: IRTParameters
  qualityScore: number
  isFlagged: boolean
  flagReason?: string
  usageCount: number
}

export interface AdaptiveSession {
  id: string
  attemptId: string
  thetaCurrent: number // Current ability estimate (-3 to +3)
  thetaHistory: ThetaRecord[]
  standardError: number
  selectedItems: string[]
  currentItem: number
  knowledgeState: Record<string, number> // topicId -> mastery (0-1)
  isComplete: boolean
  terminationReason?: string
}

export interface ThetaRecord {
  theta: number
  standardError: number
  questionId: string
  isCorrect: boolean
  timestamp: Date
}

// ============================================
// ITEM LIFECYCLE
// ============================================

export type ItemStatus = 'draft' | 'review' | 'staged' | 'live'
export type ItemQuality = 'standard' | 'premium' | 'verified'
export type CognitiveLevel = 'recall' | 'understand' | 'apply' | 'analyze'

export interface ItemReview {
  id: string
  questionId: string
  reviewerId: string
  score: number // 1-5
  accuracyScore?: number
  clarityScore?: number
  relevanceScore?: number
  comments?: string
  status: 'pending' | 'approved' | 'rejected' | 'revision_needed'
  createdAt: Date
}

export interface ItemVersion {
  id: string
  questionId: string
  versionNumber: number
  contentSnapshot: string // JSON
  changeSummary?: string
  changedBy: string
  changeType: 'create' | 'edit' | 'correction' | 'distractor_update'
  createdAt: Date
}

export interface DistractorGeneration {
  id: string
  questionId: string
  distractorText: string
  distractorLabel: string
  generatedBy: string // LLM model
  promptUsed?: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewedAt?: Date
  reviewNotes?: string
}

// ============================================
// PROCTORING
// ============================================

export type ProctorEventType = 
  | 'tab_switch' 
  | 'webcam_snapshot' 
  | 'audio_flag' 
  | 'copy_attempt' 
  | 'paste_attempt' 
  | 'window_blur' 
  | 'fullscreen_exit' 
  | 'ip_change'

export type ProctorSeverity = 'info' | 'warning' | 'critical'
export type ProctorMode = 'none' | 'lightweight' | 'full' | 'third_party'

export interface ProctorLog {
  id: string
  attemptId: string
  eventType: ProctorEventType
  eventTimestamp: Date
  eventData?: Record<string, unknown>
  deviceFingerprint?: string
  ipAddress?: string
  userAgent?: string
  screenResolution?: string
  snapshotUrl?: string
  audioUrl?: string
  severity: ProctorSeverity
  isReviewed: boolean
  reviewedBy?: string
  reviewNotes?: string
}

export interface ProctorSession {
  id: string
  attemptId: string
  proctorMode: ProctorMode
  requireWebcam: boolean
  requireAudio: boolean
  restrictTab: boolean
  restrictCopy: boolean
  sessionStarted: boolean
  webcamActive: boolean
  audioActive: boolean
  tabSwitchCount: number
  warningCount: number
  criticalCount: number
  consentGiven: boolean
  consentAt?: Date
  externalSessionId?: string
  provider?: string
}

// ============================================
// INSTITUTIONS & COHORTS
// ============================================

export type InstitutionType = 'school' | 'coaching' | 'college'
export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise'

export interface Institution {
  id: string
  name: string
  code: string
  type: InstitutionType
  email?: string
  phone?: string
  address?: string
  branding?: {
    primaryColor?: string
    secondaryColor?: string
    logoUrl?: string
  }
  features: Record<string, boolean>
  plan: SubscriptionPlan
  maxTeachers: number
  maxStudents: number
  cohorts: Cohort[]
  teachers: InstitutionTeacher[]
  students: InstitutionStudent[]
}

export interface Cohort {
  id: string
  institutionId: string
  name: string
  description?: string
  grade?: string
  targetExam?: string
  academicYear?: string
  section?: string
  studentCount: number
  members: CohortMember[]
  scheduledTests: ScheduledTest[]
}

export interface CohortMember {
  id: string
  cohortId: string
  userId: string
  role: 'student' | 'mentor'
  joinedAt: Date
}

export interface InstitutionTeacher {
  id: string
  institutionId: string
  userId: string
  role: 'teacher' | 'admin' | 'owner'
  canCreateTests: boolean
  canViewAnalytics: boolean
  canManageStudents: boolean
  joinedAt: Date
}

export interface InstitutionStudent {
  id: string
  institutionId: string
  userId: string
  enrollmentId?: string
  batch?: string
  joinedAt: Date
}

export interface ScheduledTest {
  id: string
  testId: string
  cohortId: string
  scheduledStart: Date
  scheduledEnd: Date
  timezone: string
  accessCode?: string
  allowLateEntry: boolean
  lateEntryMinutes?: number
  proctorMode: ProctorMode
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  attemptCount: number
  avgScore?: number
}

// ============================================
// CONTENT PIPELINE
// ============================================

export type ContentGapPriority = 'low' | 'medium' | 'high' | 'critical'
export type ContentGapStatus = 'identified' | 'sourcing' | 'in_progress' | 'resolved'

export interface ContentGap {
  id: string
  chapterId: string
  totalItems: number
  requiredItems: number
  gapScore: number // 0-1
  priority: ContentGapPriority
  actionStatus: ContentGapStatus
  assignedTo?: string
  dueDate?: Date
  identifiedAt: Date
  resolvedAt?: Date
}

export interface ContentImportJob {
  id: string
  sourceType: 'csv' | 'pdf' | 'api'
  sourceUrl?: string
  fileName?: string
  mapping: Record<string, string>
  targetSubjectId?: string
  targetChapterId?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalRows: number
  processedRows: number
  importedCount: number
  errorCount: number
  errors?: string[]
  initiatedBy: string
  startedAt?: Date
  completedAt?: Date
}

// ============================================
// REMEDIATION
// ============================================

export type RemediationPlanType = 'topic_weakness' | 'post_test' | 'custom'
export type RemediationStatus = 'active' | 'completed' | 'abandoned'

export interface RemediationPlan {
  id: string
  userId: string
  chapterId?: string
  planType: RemediationPlanType
  targetScore?: number
  deadline?: Date
  microLessons: string[]
  practiceItems: string[]
  miniTest?: string
  progress: number
  status: RemediationStatus
  sourceAttemptId?: string
  createdAt: Date
  completedAt?: Date
}

export interface StudyStreak {
  id: string
  userId: string
  currentStreak: number
  longestStreak: number
  lastActivityAt?: Date
  weeklyMinutes: number
  weeklyQuestions: number
  weekStartDate?: Date
}

// ============================================
// SOCIAL & COLLABORATIVE
// ============================================

export type QuestionFlagType = 'error' | 'unclear' | 'too_hard' | 'too_easy' | 'duplicate' | 'other'

export interface QuestionFlag {
  id: string
  questionId: string
  userId: string
  flagType: QuestionFlagType
  description?: string
  status: 'open' | 'resolved' | 'dismissed'
  resolvedBy?: string
  resolution?: string
  createdAt: Date
  resolvedAt?: Date
}

export interface SquadCompetition {
  id: string
  name: string
  description?: string
  testId?: string
  subjectIds: string[]
  questionCount: number
  timeLimit: number
  teamSize: number
  maxTeams: number
  startsAt: Date
  endsAt: Date
  status: 'upcoming' | 'active' | 'completed'
  teams: SquadTeam[]
}

export interface SquadTeam {
  id: string
  competitionId: string
  name: string
  memberIds: string[]
  leaderId: string
  totalScore: number
  rank?: number
}

// ============================================
// CERTIFICATES
// ============================================

export interface ResultCertificate {
  id: string
  attemptId: string
  certificateCode: string
  issuedAt: Date
  studentName: string
  testName: string
  score: number
  percentile?: number
  rank?: number
  masteryBreakdown?: Record<string, number>
  verificationHash: string
  isValid: boolean
  pdfUrl?: string
}

// ============================================
// FEATURE FLAGS & EXPERIMENTS
// ============================================

export interface FeatureFlag {
  id: string
  key: string
  name: string
  description?: string
  isEnabled: boolean
  rolloutPercent: number
  targetUsers?: string[]
  targetCohorts?: string[]
  variants?: FeatureFlagVariant[]
}

export interface FeatureFlagVariant {
  id: string
  name: string
  weight: number
  config: Record<string, unknown>
}

export interface ExperimentEvent {
  id: string
  experimentKey: string
  userId: string
  eventType: 'exposure' | 'conversion' | 'engagement'
  variant: string
  eventData?: Record<string, unknown>
  createdAt: Date
}

// ============================================
// TEST COMPOSER TYPES
// ============================================

export interface TestComposerConfig {
  name: string
  grade: Grade
  targetExam: TargetExam
  selectedSubjects: string[]
  selectedChapters: string[]
  chapterWeights: Record<string, number>
  difficulty: Difficulty
  questionCount: number
  timeLimit: number
  includePYQ: boolean
  includeConceptual: boolean
  testType: TestType
  isAutoBalanced: boolean
  proctorMode: ProctorMode
}

export interface TestComposerPreview {
  estimatedDifficulty: number // 0-100
  estimatedTime: number // minutes
  coverageScore: number // 0-100
  availableQuestions: number
  subjectDistribution: {
    subjectId: string
    subjectName: string
    questionCount: number
    percentage: number
    color: string
  }[]
  chapterDistribution: {
    chapterId: string
    chapterName: string
    subjectName: string
    questionCount: number
    availableCount: number
  }[]
  warnings: string[]
  recommendations: string[]
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface AnalyticsFilter {
  dateRange?: {
    start: Date
    end: Date
  }
  subjectIds?: string[]
  chapterIds?: string[]
  testTypes?: TestType[]
  difficulty?: Difficulty[]
  userIds?: string[]
  cohortIds?: string[]
  institutionId?: string
}

export interface TestAnalytics {
  testId: string
  testName: string
  totalAttempts: number
  avgScore: number
  avgAccuracy: number
  avgTimeSpent: number
  difficultyRating: number
  itemAnalysis: ItemAnalytics[]
}

export interface ItemAnalytics {
  questionId: string
  questionText: string
  pValue: number
  discriminationIndex: number
  avgTimeSeconds: number
  optionDistribution: {
    option: string
    count: number
    percentage: number
  }[]
  correctAnswer: string
}

export interface UserAnalytics {
  userId: string
  userName: string
  totalTests: number
  avgScore: number
  avgAccuracy: number
  strongestSubject: string
  weakestSubject: string
  improvementTrend: number
  timeSpentTotal: number
  streak: number
}

export interface CohortAnalytics {
  cohortId: string
  cohortName: string
  totalStudents: number
  avgScore: number
  avgAccuracy: number
  subjectBreakdown: {
    subjectName: string
    avgAccuracy: number
    studentCount: number
  }[]
  topPerformers: {
    userId: string
    userName: string
    score: number
  }[]
  improvementNeeded: {
    userId: string
    userName: string
    weakAreas: string[]
  }[]
}

// ============================================
// PERSONALIZATION TYPES
// ============================================

export interface UserBehaviorTracking {
  id: string
  userId: string
  subjectId?: string
  chapterId?: string
  topicId?: string
  timeSpentSeconds: number
  sessionCount: number
  lastAccessAt: Date
  wordsRead: number
  avgReadingSpeed?: number
  scrollDepth?: number
  bookmarkCount: number
  noteCount: number
  highlightCount: number
  deviceType?: 'desktop' | 'mobile' | 'tablet'
  platform?: string
}

export interface TopicMastery {
  id: string
  userId: string
  subjectId: string
  chapterId: string
  topicId?: string
  masteryScore: number // 0-100
  confidenceLevel: number // 0-1
  questionsAttempted: number
  questionsCorrect: number
  avgTimePerQuestion: number
  easeFactor: number
  interval: number // days
  nextReviewAt?: Date
  reviewsCount: number
  status: 'learning' | 'reviewing' | 'mastered'
  lastPracticedAt?: Date
}

export interface UserRecommendation {
  id: string
  userId: string
  type: 'practice' | 'review' | 'video' | 'reading' | 'test' | 'boost'
  priority: number
  subjectId?: string
  chapterId?: string
  questionId?: string
  testId?: string
  resourceId?: string
  title: string
  description?: string
  reason: string
  basedOnPerformance: boolean
  basedOnWeakness: boolean
  basedOnTrend: boolean
  clusterId?: string
  estimatedMinutes?: number
  status: 'pending' | 'started' | 'completed' | 'dismissed'
  createdAt: Date
  completedAt?: Date
  expiresAt?: Date
}

export interface StudyPlan {
  id: string
  userId: string
  name: string
  description?: string
  targetExam?: string
  targetDate?: Date
  dailyMinutes: number
  weeklyOffDays: number[]
  preferredTime?: 'morning' | 'afternoon' | 'evening' | 'night'
  subjects: SubjectPriority[]
  totalItems: number
  completedItems: number
  streakDays: number
  status: 'active' | 'paused' | 'completed'
  items: StudyPlanItem[]
}

export interface SubjectPriority {
  subjectId: string
  priority: number
  weeklyMinutes: number
}

export interface StudyPlanItem {
  id: string
  planId: string
  type: 'chapter' | 'test' | 'practice' | 'review' | 'break'
  subjectId?: string
  chapterId?: string
  testId?: string
  scheduledDate?: Date
  scheduledTime?: string
  estimatedMinutes: number
  actualMinutes?: number
  orderIndex: number
  isRepetition: boolean
  parentItemId?: string
  nextRepetitionAt?: Date
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  startedAt?: Date
  completedAt?: Date
}

export interface ResourceSummary {
  id: string
  resourceType: 'chapter' | 'question' | 'test' | 'video' | 'article'
  resourceId: string
  summary: string
  keyPoints: string[]
  concepts: string[]
  wordCount: number
  readingTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  generatedBy: string
  generatedAt: Date
  isVerified: boolean
}

export interface TrendingResource {
  id: string
  resourceType: 'question' | 'chapter' | 'test' | 'note'
  resourceId: string
  viewCount: number
  attemptCount: number
  bookmarkCount: number
  shareCount: number
  periodStart: Date
  periodEnd: Date
  trendScore: number
  growthRate: number
  targetExam?: string
  targetGrade?: string
}

export interface CollaborativeTag {
  id: string
  resourceType: string
  resourceId: string
  tag: string
  tagCategory?: 'difficulty' | 'importance' | 'exam_type'
  addedBy: string
  upvotes: number
  downvotes: number
  isVerified: boolean
  isOfficial: boolean
}

export interface TeacherSuggestion {
  id: string
  teacherId: string
  cohortId?: string
  resourceType: 'test' | 'chapter' | 'question'
  resourceId: string
  title: string
  description?: string
  priority: number
  dueDate?: Date
  targetStudentIds: string[]
  targetCriteria?: {
    accuracyBelow?: number
    topic?: string
    grade?: string
  }
  status: 'active' | 'completed' | 'archived'
}

export interface DailyStudyBoost {
  id: string
  userId: string
  boostDate: Date
  items: BoostItem[]
  totalItems: number
  completedItems: number
  timeSpent: number
  rating?: number
  feedback?: string
}

export interface BoostItem {
  type: 'practice' | 'review' | 'video' | 'reading' | 'test'
  resourceId: string
  reason: string
  completed: boolean
  timeSpent?: number
}

// UI Types for Personalization
export interface InsightPanelData {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'stable'
  icon?: React.ReactNode
  color?: string
}

export interface HeatmapCell {
  subjectId: string
  chapterId: string
  topicId?: string
  name: string
  mastery: number // 0-100
  timeSpent: number
  lastAccessed?: Date
  status: 'learning' | 'reviewing' | 'mastered'
}

export interface RecommendationCluster {
  id: string
  title: string
  description: string
  type: 'weakness' | 'trend' | 'performance' | 'daily'
  items: UserRecommendation[]
  priority: number
}

export interface AIAssistMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isLoading?: boolean
}

export interface StudyScheduleDay {
  date: Date
  isToday: boolean
  items: StudyPlanItem[]
  totalMinutes: number
  completedMinutes: number
}

export interface ReadingSpeedData {
  date: Date
  wordsRead: number
  timeSpent: number
  speed: number
}

export interface WeeklyStudyPattern {
  day: string
  minutes: number
  sessions: number
  avgSpeed: number
}

export interface PeerComparison {
  metric: string
  userValue: number
  peerAverage: number
  peerTop: number
  percentile: number
}

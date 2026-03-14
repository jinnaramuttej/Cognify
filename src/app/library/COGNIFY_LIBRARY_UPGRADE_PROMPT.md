# Cognify Library Module - Premium Upgrade Implementation Prompt

## Overview
Transform the Cognify Library into a **modern academic multimedia knowledge hub** with cutting-edge features inspired by top learning platforms (Coursera, RemNote, Anki, Khan Academy, Quizlet, Readwise, Panopto).

---

## 🎨 Design System

### Colors
- **Primary Blue**: `#2563EB` - CTAs, progress bars, active states
- **Primary Hover**: `#1D4ED8` - Hover states
- **Light Panels**: `#F3F6FB` - Card backgrounds, sidebars
- **Borders**: `#E5E7EB` - Dividers, borders
- **Success**: `#10B981` - Completed, positive states
- **Warning**: `#F59E0B` - Pending, attention
- **Error**: `#EF4444` - Errors, difficult topics
- **Background Gradient**: `linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #F0F9FF 100%)`

### Resource Type Color Coding
```typescript
const resourceTypeColors = {
  'Video': { bg: 'from-red-500 to-rose-600', icon: PlayCircle, badge: 'bg-red-50 text-red-700' },
  'Audio': { bg: 'from-purple-500 to-violet-600', icon: Headphones, badge: 'bg-purple-50 text-purple-700' },
  'Notes': { bg: 'from-blue-500 to-indigo-600', icon: FileText, badge: 'bg-blue-50 text-blue-700' },
  'PDF': { bg: 'from-orange-500 to-amber-600', icon: FileDown, badge: 'bg-orange-50 text-orange-700' },
  'Interactive': { bg: 'from-emerald-500 to-teal-600', icon: Puzzle, badge: 'bg-emerald-50 text-emerald-700' },
  'Quiz': { bg: 'from-pink-500 to-fuchsia-600', icon: Brain, badge: 'bg-pink-50 text-pink-700' },
  'Flashcards': { bg: 'from-cyan-500 to-sky-600', icon: Layers, badge: 'bg-cyan-50 text-cyan-700' },
  'ConceptMap': { bg: 'from-indigo-500 to-violet-600', icon: GitBranch, badge: 'bg-indigo-50 text-indigo-700' },
}
```

### Typography
- Headings: `font-semibold tracking-tight`
- Body: `font-normal leading-relaxed`
- Monospace (code): `font-mono bg-gray-100 px-1.5 py-0.5 rounded`

---

## 🆕 NEW FEATURES (Not in Current Implementation)

### 1. Multimedia Resource Support

#### Video Player Enhancement
```
┌─────────────────────────────────────────────────────────────┐
│  Video Title - Chapter Name                          ⚙️ ⛶  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    [Video Content]                          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ▶️ ━━━━━━━━━━━━━━━●━━━━━━━━━━━━ 1:45 / 15:30    🔊  CC   │
├─────────────────────────────────────────────────────────────┤
│ 📑 CHAPTERS                                    📝 TRANSCRIPT │
│ ├─ 0:00 Introduction                        ┌──────────────┐ │
│ ├─ 2:15 Core Concept                        │ [Search...]  │ │
│ ├─ 5:30 Examples                            │              │ │
│ └─ 10:45 Summary                            │ "The         │ │
│                                              │ fundamental  │ │
│ 📎 RELATED RESOURCES                         │ principle..."│ │
│ • Concept Sheet: Quick Review               │              │ │
│ • Practice Quiz: 10 Questions               │ └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Timestamped chapter markers (clickable)
- Searchable auto-generated transcript
- Playback speed control (0.5x - 2x)
- Video quality selector
- Picture-in-picture mode
- "Continue watching" resume indicator
- Keyboard shortcuts (J/K for backward/forward, Space for pause)

#### Audio Player (Podcasts/Lectures)
```
┌─────────────────────────────────────────────────────────────┐
│  🎧 Lecture Audio: Organic Chemistry Basics                 │
│                                                             │
│     ▶️ ━━━━━━━━━━━━━━━●━━━━━━━━━━━━ 5:30 / 45:00           │
│                                                             │
│  ⏮️ ⏪ ▶️ ⏩ ⏭️                           🔊 ━━━━●━━━      │
│                                                             │
│  📝 Show Notes:                                             │
│  • Introduction to carbon compounds                         │
│  • Functional groups overview                               │
│  • Naming conventions                                       │
│                                                             │
│  [📋 Copy Notes] [⬇️ Download Audio] [➕ Add to Revision]   │
└─────────────────────────────────────────────────────────────┘
```

#### Interactive PDF Viewer
- Page-by-page navigation
- Zoom controls
- Text selection & highlighting
- Sticky notes on specific sections
- Table of contents sidebar
- Full-text search within PDF
- Page thumbnails view

---

### 2. Structured Learning Paths

```
┌─────────────────────────────────────────────────────────────┐
│  🛤️ Learning Path: JEE Physics Mastery                      │
│                                                             │
│  ⏱️ Estimated Time: 45 hours  |  📊 Progress: 32%          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ STAGE 1: Foundations (Beginner)                     │   │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% ✓    │   │
│  │                                                     │   │
│  │ ✓ Units & Measurements        📄 Notes  🎥 Video   │   │
│  │ ✓ Motion in One Dimension     📄 Notes  📝 Quiz    │   │
│  │ ✓ Vectors                     📄 Notes  🃏 Cards   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ STAGE 2: Mechanics (Intermediate)      🔓 UNLOCKED  │   │
│  │ ━━━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━ 45%           │   │
│  │                                                     │   │
│  │ ✓ Newton's Laws               📄 Notes  🎥 Video   │   │
│  │ → Work, Energy & Power        📄 Notes  📝 Quiz    │   │
│  │ ○ Rotational Motion           🔒 Complete above    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ STAGE 3: Advanced Topics    🔒 Complete Stage 2     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🏆 BADGES EARNED: ⭐ Foundation Master ⚡ Quick Learner    │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Progressive difficulty stages (Beginner → Intermediate → Advanced)
- Prerequisite unlocking system
- Time estimates per stage
- Badges for stage completion
- Overall progress dashboard
- Recommended daily goals

---

### 3. Interactive Content Modules

#### Flashcards with Spaced Repetition
```
┌─────────────────────────────────────────────────────────────┐
│  🃏 Flashcard Deck: Organic Chemistry Reactions             │
│                                                             │
│  ━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━  Card 15 of 48        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │     Q: What is the product of aldol                 │   │
│  │        condensation of acetaldehyde?                │   │
│  │                                                     │   │
│  │     [Tap to reveal answer]                          │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [🔄 Flip Card]                                             │
│                                                             │
│  After flipping:                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ A: 3-Hydroxybutanal (aldol product)                 │   │
│  │                                                     │   │
│  │ 📖 Related: Chapter 12, Page 234                    │   │
│  │ 🎥 Video: 5:30 - Aldol Reactions Explained          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  How well did you know this?                                │
│  [😕 Again] [😐 Hard] [🙂 Good] [😎 Easy]                   │
│                                                             │
│  Next review: In 3 days (Spaced Repetition)                │
└─────────────────────────────────────────────────────────────┘
```

**Spaced Repetition Algorithm (SM-2):**
- Again → Reset interval to 1 day
- Hard → Increase by 1.2x
- Good → Increase by 2.5x
- Easy → Increase by 4x

#### In-Content Quizzes (No Page Reload)
```
┌─────────────────────────────────────────────────────────────┐
│  Chapter: Electromagnetic Induction                         │
│  ...content...                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🧠 QUICK CHECK                                      │   │
│  │                                                     │   │
│  │ What is Lenz's Law?                                 │   │
│  │                                                     │   │
│  │ ○ A) Induced current opposes change in flux         │   │
│  │ ○ B) Current flows in direction of field            │   │
│  │ ○ C) EMF is proportional to resistance              │   │
│  │ ○ D) Flux is always constant                        │   │
│  │                                                     │   │
│  │ [Check Answer]                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ...content continues...                                    │
└─────────────────────────────────────────────────────────────┘
```

#### Concept Map (Visual Knowledge Graph)
```
┌─────────────────────────────────────────────────────────────┐
│  🔗 Concept Map: Thermodynamics                             │
│                                                             │
│         ┌──────────┐                                        │
│         │  First   │                                        │
│         │  Law     │                                        │
│         └────┬─────┘                                        │
│              │                                              │
│    ┌─────────┼─────────┐                                   │
│    ▼         ▼         ▼                                    │
│ ┌──────┐ ┌──────┐ ┌──────┐                                 │
│ │Heat  │ │Work  │ │Intern│                                 │
│ │      │ │      │ │Energy│                                 │
│ └──┬───┘ └──┬───┘ └──┬───┘                                 │
│    │        │        │                                      │
│    └────────┼────────┘                                      │
│             ▼                                               │
│       ┌──────────┐                                          │
│       │ Enthalpy │ ←── Click to see resources               │
│       └──────────┘                                          │
│                                                             │
│  [🔍 Search Concepts] [➕ Add Connection] [📷 Export PNG]   │
└─────────────────────────────────────────────────────────────┘
```

---

### 4. Annotation & Note-Taking System

```
┌─────────────────────────────────────────────────────────────┐
│  Resource Viewer                              📝 Notes Panel │
│  ─────────────────────────────────────────────────────────  │
│  The fundamental principle of                              │
│  electromagnetic induction states that ████████████████   │
│  when a conductor moves through a magnetic                 │
│  field, an EMF is induced...                               │
│       ↑                                                    │
│  ┌──────────────────────┐                                  │
│  │ 📌 Highlighted Text  │                                  │
│  │ "conductor moves     │                                  │
│  │  through a magnetic  │                                  │
│  │  field"              │                                  │
│  │                      │                                  │
│  │ 💬 Your Note:        │                                  │
│  │ "Important concept - │                                  │
│  │  appears in PYQs     │                                  │
│  │  frequently!"        │                                  │
│  │                      │                                  │
│  │ 🏷️ Tags:            │                                  │
│  │ [Important] [PYQ]    │                                  │
│  │                      │                                  │
│  │ [Edit] [Delete]      │                                  │
│  └──────────────────────┘                                  │
│                                                             │
│  YOUR HIGHLIGHTS (12):                                      │
│  • Yellow: Important concepts (8)                           │
│  • Green: Formulas to memorize (3)                          │
│  • Pink: Need clarification (1)                             │
│                                                             │
│  [📤 Export All Notes] [🔄 Sync to Flashcards]              │
└─────────────────────────────────────────────────────────────┘
```

**Highlight Colors:**
- Yellow: Important concepts
- Green: Formulas/Key facts
- Pink: Questions/Confusion
- Blue: Examples/Analogies
- Orange: Connections to other topics

---

### 5. Study Streaks & Gamification

```
┌─────────────────────────────────────────────────────────────┐
│  🔥 Study Streak: 12 Days                                   │
│                                                             │
│  ┌───┬───┬───┬───┬───┬───┬───┐                             │
│  │ M │ T │ W │ T │ F │ S │ S │  This Week                 │
│  ├───┼───┼───┼───┼───┼───┼───┤                             │
│  │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │ ○ │  6/7 Days                  │
│  └───┴───┴───┴───┴───┴───┴───┘                             │
│                                                             │
│  📊 Today's Goal: Study 3 resources                         │
│  ━━━━━━━━━━━━━━━━━━━━━●━━━━━━━━  2/3 Complete              │
│                                                             │
│  🏆 ACHIEVEMENTS                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ⭐ First Steps     - Complete your first resource    │  │
│  │ 🔥 Week Warrior    - 7-day study streak              │  │
│  │ 📚 Bookworm        - Read 50 resources               │  │
│  │ 🎯 Sharpshooter    - 90% quiz accuracy               │  │
│  │ 🧠 Memory Master   - Review 100 flashcards           │  │
│  │ ⚡ Speed Reader    - Finish resource in <5 min       │  │
│  │ 🎓 Subject Expert  - Complete a learning path        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  📈 XP: 1,250 / 2,000 (Level 5)                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                             │
│  🎁 Next Reward: Unlock custom theme at Level 6            │
└─────────────────────────────────────────────────────────────┘
```

**XP System:**
- View resource: +5 XP
- Complete quiz: +10 XP
- Review flashcards: +3 XP per card
- Study streak bonus: +20 XP per day
- Complete learning path stage: +100 XP

---

### 6. Dynamic Preview System

```
┌─────────────────────────────────────────────────────────────┐
│  Hover Preview Card                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🎥 Video - Electromagnetic Induction                │   │
│  │                                                     │   │
│  │ 📊 Difficulty: Intermediate                        │   │
│  │ ⏱️ Duration: 15:30                                 │   │
│  │ 📚 Chapter: EM Induction                           │   │
│  │ 👁️ 1.2K views                                      │   │
│  │                                                     │   │
│  │ 📝 Description:                                    │   │
│  │ "Comprehensive coverage of Faraday's laws,         │   │
│  │  Lenz's law, and applications..."                  │   │
│  │                                                     │   │
│  │ ━━━━━━━━━━━━━●━━━━━━━━  Resume at 5:30             │   │
│  │                                                     │   │
│  │ [👁️ Open] [🔖 Bookmark] [📅 Revision] [🤖 Ask Cogni]│   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

### 7. Smart Search with AI Autocomplete

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Search resources, chapters, concepts...                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                             │
│  Suggestions as you type:                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔍 electromagnetic induction                        │   │
│  │ 📄 Electromagnetic Induction - Chapter Notes        │   │
│  │ 🎥 Video: Faraday's Law Explained                   │   │
│  │ 🧠 Concept: Lenz's Law                              │   │
│  │ 📝 PYQ: JEE 2023 - EM Induction                     │   │
│  │ 🃏 Flashcards: EM Induction Formulas                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  AI-Powered: "I'm looking for..."                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🤖 "I'm looking for practice problems on            │   │
│  │     electromagnetic induction for JEE"              │   │
│  │                                                     │   │
│  │   Found 23 matching resources:                      │   │
│  │   • EM Induction Problem Set (Advanced)             │   │
│  │   • JEE Previous Year Questions                     │   │
│  │   • Practice Quiz: 20 Questions                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

### 8. Quick Actions Menu

```
┌─────────────────────────────────────────────────────────────┐
│  Resource Card                            [⋯] More Options  │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Quick Actions (Right-click or ⋯ menu):                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 👁️ Open Resource                                   │   │
│  │ 🔖 Add to Bookmarks                                │   │
│  │ 📅 Schedule Revision                                │   │
│  │ 🃏 Generate Flashcards                              │   │
│  │ 📝 Generate Quiz                                    │   │
│  │ 🤖 Ask Cogni About This                             │   │
│  │ 📤 Share                                            │   │
│  │ ⬇️ Download (if allowed)                            │   │
│  │ ➕ Add to Learning Path                             │   │
│  │ 🔗 Copy Link                                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Prisma Schema Additions

```prisma
// New models to add

model LearningPath {
  id          String   @id @default(cuid())
  name        String
  description String
  subjectId   String
  difficulty  String   // "Beginner", "Intermediate", "Advanced"
  totalStages Int
  estimatedHours Int
  icon        String?
  color       String?
  createdAt   DateTime @default(now())
  
  stages      LearningPathStage[]
  enrollments LearningPathEnrollment[]
}

model LearningPathStage {
  id           String   @id @default(cuid())
  pathId       String
  name         String
  description  String
  order        Int
  estimatedMinutes Int
  prerequisiteStageId String?
  
  path         LearningPath        @relation(fields: [pathId], references: [id], onDelete: Cascade)
  resources    StageResource[]
  completions  StageCompletion[]
}

model StageResource {
  id         String @id @default(cuid())
  stageId    String
  resourceId String
  order      Int
  isRequired Boolean @default(true)
  
  stage      LearningPathStage @relation(fields: [stageId], references: [id], onDelete: Cascade)
  resource   LibraryResource   @relation(fields: [resourceId], references: [id], onDelete: Cascade)
}

model LearningPathEnrollment {
  id           String   @id @default(cuid())
  userId       String
  pathId       String
  currentStage Int      @default(1)
  progress     Float    @default(0)
  enrolledAt   DateTime @default(now())
  completedAt  DateTime?
  
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  path         LearningPath @relation(fields: [pathId], references: [id], onDelete: Cascade)
  completions  StageCompletion[]
  
  @@unique([userId, pathId])
}

model StageCompletion {
  id           String   @id @default(cuid())
  enrollmentId String
  stageId      String
  completedAt  DateTime @default(now())
  timeSpent    Int      @default(0) // seconds
  
  enrollment   LearningPathEnrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  stage        LearningPathStage      @relation(fields: [stageId], references: [id], onDelete: Cascade)
  
  @@unique([enrollmentId, stageId])
}

model FlashcardDeck {
  id          String   @id @default(cuid())
  name        String
  description String?
  chapterId   String
  resourceId  String?
  cardCount   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  flashcards  Flashcard[]
  progresses  FlashcardProgress[]
}

model Flashcard {
  id         String   @id @default(cuid())
  deckId     String
  front      String
  back       String
  hint       String?
  imageUrl   String?
  tags       String   // JSON array
  order      Int
  createdAt  DateTime @default(now())
  
  deck       FlashcardDeck @relation(fields: [deckId], references: [id], onDelete: Cascade)
  progresses FlashcardProgress[]
}

model FlashcardProgress {
  id             String   @id @default(cuid())
  userId         String
  cardId         String
  easeFactor     Float    @default(2.5)
  interval       Int      @default(0) // days
  repetitions    Int      @default(0)
  nextReviewAt   DateTime @default(now())
  lastReviewAt   DateTime?
  
  user           User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  card           Flashcard  @relation(fields: [cardId], references: [id], onDelete: Cascade)
  
  @@unique([userId, cardId])
  @@index([nextReviewAt])
}

model Highlight {
  id           String   @id @default(cuid())
  userId       String
  resourceId   String
  startPosition Int     // Character position
  endPosition   Int
  text         String   // Highlighted text
  color        String   // "yellow", "green", "pink", "blue", "orange"
  note         String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  user         User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  resource     LibraryResource  @relation(fields: [resourceId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([resourceId])
}

model StudyStreak {
  id           String   @id @default(cuid())
  userId       String   @unique
  currentStreak Int     @default(0)
  longestStreak Int     @default(0)
  lastStudyAt  DateTime?
  totalXP      Int      @default(0)
  level        Int      @default(1)
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  dailyLogs    StudyDayLog[]
}

model StudyDayLog {
  id           String   @id @default(cuid())
  streakId     String
  date         DateTime @db.Date
  resourcesViewed Int   @default(0)
  quizzesCompleted Int  @default(0)
  flashcardsReviewed Int @default(0)
  xpEarned     Int      @default(0)
  studyMinutes Int      @default(0)
  
  streak       StudyStreak @relation(fields: [streakId], references: [id], onDelete: Cascade)
  
  @@unique([streakId, date])
}

model Achievement {
  id          String   @id @default(cuid())
  key         String   @unique
  name        String
  description String
  icon        String
  category    String   // "streak", "content", "quiz", "flashcard"
  requirement Json     // e.g., {"type": "streak", "value": 7}
  xpReward    Int
  createdAt   DateTime @default(now())
  
  unlocks     UserAchievement[]
}

model UserAchievement {
  id           String   @id @default(cuid())
  userId       String
  achievementId String
  unlockedAt   DateTime @default(now())
  
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement  Achievement  @relation(fields: [achievementId], references: [id], onDelete: Cascade)
  
  @@unique([userId, achievementId])
}

model ConceptNode {
  id          String   @id @default(cuid())
  name        String
  description String?
  chapterId   String
  subjectId   String
  importance  Int      @default(50) // 0-100
  
  outgoing    ConceptEdge[] @relation("FromConcept")
  incoming    ConceptEdge[] @relation("ToConcept")
}

model ConceptEdge {
  id           String @id @default(cuid())
  fromNodeId   String
  toNodeId     String
  relationship String // "prerequisite", "related", "applies", "example"
  
  fromConcept  ConceptNode @relation("FromConcept", fields: [fromNodeId], references: [id], onDelete: Cascade)
  toConcept    ConceptNode @relation("ToConcept", fields: [toNodeId], references: [id], onDelete: Cascade)
}

// Update LibraryResource model
model LibraryResource {
  // ... existing fields ...
  mediaType     String?  // "video", "audio", "pdf", "text", "interactive"
  duration      Int?     // seconds for video/audio
  videoChapters String?  // JSON array of {time, title}
  transcript    String?  // Full transcript for video/audio
  hasQuiz       Boolean  @default(false)
  hasFlashcards Boolean  @default(false)
  conceptMapId  String?
  
  // Relations
  highlights    Highlight[]
  flashcardDecks FlashcardDeck[]
  stageResources StageResource[]
}
```

---

## 📦 Components to Build

### New UI Components

1. **MediaPreviewCard** - Hover preview with quick actions
2. **VideoPlayer** - Custom video player with chapters, transcript
3. **AudioPlayer** - Audio player with waveform visualization
4. **PDFViewer** - Interactive PDF with highlighting
5. **LearningPathCard** - Progress visualization for paths
6. **LearningPathViewer** - Full path view with stages
7. **FlashcardDeck** - Swipeable flashcard interface
8. **FlashcardReviewer** - Spaced repetition review mode
9. **Highlighter** - Text selection & highlighting
10. **AnnotationSidebar** - Notes panel
11. **ConceptMapViewer** - Interactive graph visualization
12. **StudyStreakWidget** - Streak display
13. **AchievementsPanel** - Badges display
14. **QuickActionsMenu** - Context menu
15. **SmartSearchBar** - AI-powered search
16. **StudyTimer** - Focus mode timer
17. **DailyGoalProgress** - Goal tracking

---

## 🎯 Implementation Priority

### Phase 1: Core Multimedia (Week 1)
- Video player with chapters
- Audio player
- PDF viewer basics
- Media preview cards

### Phase 2: Learning Paths (Week 1-2)
- Path creation & enrollment
- Stage progression
- Progress tracking
- Badges

### Phase 3: Interactive Content (Week 2)
- Flashcard system with SM-2
- In-content quizzes
- Highlighting & annotations

### Phase 4: Gamification (Week 2-3)
- Study streaks
- XP & levels
- Achievements
- Daily goals

### Phase 5: Advanced Features (Week 3)
- Concept maps
- Smart search
- Quick actions
- Study timer

---

## 🎨 Animation Guidelines

### Hover Effects
- Cards: `lift 4px, shadow-lg`
- Buttons: `scale 1.02`
- Icons: `rotate 5deg`

### Transitions
- Page changes: `fade + slide up 16px`
- Modals: `scale from 0.95 + fade`
- Lists: `stagger children 50ms`

### Progress Animations
- Progress bars: `stroke-dashoffset transition 1s ease-out`
- Counters: `count-up animation 0.5s`
- Streak flames: `pulse animation`

### Micro-interactions
- Bookmark: `heart beat`
- Complete: `confetti burst`
- Level up: `scale bounce + glow`

---

## ✅ Success Metrics

1. **Engagement**: Time spent in library up 40%
2. **Retention**: 30-day retention up 25%
3. **Completion**: Resource completion rate up 35%
4. **Streaks**: Average study streak length > 5 days
5. **Flashcards**: Daily card reviews per user > 20

---

## 🚀 Get Started

Begin implementation with:
1. Update Prisma schema
2. Create base UI components
3. Build video player first (highest impact)
4. Add learning paths
5. Integrate flashcards
6. Add gamification layer

This upgrade will transform Cognify Library into a world-class learning platform!

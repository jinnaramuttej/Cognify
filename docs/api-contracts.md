# Cognify API Contracts

> **⚠️ AI RULE**: All API endpoints must follow these contracts. Do not invent request/response formats.

---

## Tests Module

### POST `/api/tests/create`

Create a new test session.

**Request:**
```json
{
  "title": "JEE Main Physics Mock",
  "exam_id": "uuid",
  "subject_id": "uuid",
  "question_count": 30,
  "difficulty": "Mixed",
  "chapter_ids": ["uuid", "uuid"],
  "type": "practice",
  "duration_minutes": 60,
  "negative_marking": true
}
```

**Response:**
```json
{
  "test_id": "uuid",
  "status": "in_progress",
  "questions": [
    {
      "id": "uuid",
      "question_text": "...",
      "options": [{"label": "A", "text": "..."}, ...],
      "question_type": "single_correct",
      "marks": 4,
      "negative_marks": 1,
      "order_index": 0
    }
  ]
}
```

---

### GET `/api/tests/[testId]`

Fetch test with all questions.

**Response:**
```json
{
  "id": "uuid",
  "title": "...",
  "status": "in_progress | completed",
  "score": 120,
  "total_questions": 30,
  "time_spent_seconds": 3600,
  "questions": [...]
}
```

---

### POST `/api/tests/[testId]/analysis`

Get detailed test analysis.

**Response:**
```json
{
  "score": 120,
  "total_marks": 180,
  "accuracy": 0.73,
  "time_analysis": {
    "avg_time_per_question": 45,
    "fastest_question": 5,
    "slowest_question": 180
  },
  "difficulty_breakdown": {
    "Easy": {"correct": 10, "total": 12},
    "Medium": {"correct": 8, "total": 12},
    "Hard": {"correct": 4, "total": 6}
  },
  "topic_performance": [
    {"topic": "Kinematics", "correct": 3, "total": 5}
  ]
}
```

---

### POST `/api/tests/track-completion`

Mark test as completed and calculate score.

**Request:**
```json
{
  "test_id": "uuid",
  "time_spent_seconds": 3600
}
```

**Response:**
```json
{
  "status": "completed",
  "score": 120,
  "total_marks": 180
}
```

---

## AI / Cogni Module

### POST `/api/cogni/analyze-mistakes`

Analyze student mistakes using AI.

**Request:**
```json
{
  "user_id": "uuid",
  "test_id": "uuid"
}
```

**Response:**
```json
{
  "insights": [
    {
      "pattern": "time_pressure",
      "severity": "high",
      "description": "...",
      "recommendation": "..."
    }
  ]
}
```

---

### POST `/api/ai/chat`

Cogni AI tutor chat.

**Request:**
```json
{
  "message": "Explain Newton's Third Law",
  "context": {
    "user_id": "uuid",
    "topic": "Laws of Motion"
  }
}
```

**Response:** Server-Sent Events (streaming)
```
data: {"content": "Newton's Third Law states..."}
data: {"content": " that for every action..."}
data: [DONE]
```

---

## Auth Module

### POST `/api/auth/login`

**Request:**
```json
{
  "email": "student@example.com",
  "password": "..."
}
```

**Response:**
```json
{
  "user": {"id": "uuid", "email": "..."},
  "session": {"access_token": "..."}
}
```

---

### POST `/api/auth/register`

**Request:**
```json
{
  "email": "...",
  "password": "...",
  "full_name": "...",
  "class": "12",
  "stream": "Science",
  "target_exam": "JEE Main"
}
```

---

## User Module

### GET `/api/user/profile`

**Response:**
```json
{
  "id": "uuid",
  "full_name": "...",
  "email": "...",
  "class": "12",
  "target_exam": "JEE Main",
  "total_xp": 1500,
  "streak": 7,
  "avatar_url": "..."
}
```

---

## Social Module

### POST `/api/squads/create`

**Request:**
```json
{
  "name": "Physics Warriors",
  "description": "Study group for JEE Physics"
}
```

**Response:**
```json
{
  "id": "uuid",
  "invite_code": "ABC123"
}
```

### POST `/api/squads/join`

**Request:**
```json
{
  "invite_code": "ABC123"
}
```

---

## Analytics Module

### GET `/api/analytics/performance?user_id=uuid`

**Response:**
```json
{
  "overall_accuracy": 73,
  "tests_completed": 24,
  "streak": 7,
  "subject_performance": [
    {"subject": "Physics", "accuracy": 68, "tests": 10},
    {"subject": "Chemistry", "accuracy": 75, "tests": 8}
  ],
  "weekly_trend": [65, 70, 68, 73, 75, 72, 78]
}
```

---

*Last updated: 2026-03-08*

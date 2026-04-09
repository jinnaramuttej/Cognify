import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// ─── Mock subjects data (matches Supabase schema) ─────────────────────────────
const MOCK_SUBJECTS = [
  {
    id: 'subj_physics',
    name: 'Physics',
    exam_id: 'jee_main',
    icon: '⚡',
    color: 'blue',
    chaptersCount: 24,
    completedChapters: 8,
    chapters: [
      {
        id: 'ch_kinematics',
        subject_id: 'subj_physics',
        name: 'Kinematics',
        topicsCount: 6,
        completedTopics: 4,
        difficulty: 'Medium',
        estimatedTime: '2h 30m',
        hasVideo: true,
        hasPYQ: true,
        accuracy: 78,
      },
      {
        id: 'ch_laws_of_motion',
        subject_id: 'subj_physics',
        name: 'Laws of Motion',
        topicsCount: 5,
        completedTopics: 5,
        difficulty: 'Medium',
        estimatedTime: '2h',
        hasVideo: true,
        hasPYQ: true,
        accuracy: 85,
      },
      {
        id: 'ch_thermodynamics',
        subject_id: 'subj_physics',
        name: 'Thermodynamics',
        topicsCount: 7,
        completedTopics: 2,
        difficulty: 'Hard',
        estimatedTime: '3h',
        hasVideo: true,
        hasPYQ: true,
        accuracy: 65,
      },
      {
        id: 'ch_electricity',
        subject_id: 'subj_physics',
        name: 'Electricity & Magnetism',
        topicsCount: 9,
        completedTopics: 1,
        difficulty: 'Hard',
        estimatedTime: '4h',
        hasVideo: true,
        hasPYQ: true,
        accuracy: 73,
      },
    ],
  },
  {
    id: 'subj_chemistry',
    name: 'Chemistry',
    exam_id: 'jee_main',
    icon: '🧪',
    color: 'emerald',
    chaptersCount: 28,
    completedChapters: 12,
    chapters: [
      {
        id: 'ch_organic',
        subject_id: 'subj_chemistry',
        name: 'Organic Chemistry',
        topicsCount: 10,
        completedTopics: 7,
        difficulty: 'Hard',
        estimatedTime: '5h',
        hasVideo: true,
        hasPYQ: true,
        accuracy: 85,
      },
      {
        id: 'ch_inorganic',
        subject_id: 'subj_chemistry',
        name: 'Inorganic Chemistry',
        topicsCount: 8,
        completedTopics: 5,
        difficulty: 'Medium',
        estimatedTime: '3h',
        hasVideo: false,
        hasPYQ: true,
        accuracy: 76,
      },
      {
        id: 'ch_physical',
        subject_id: 'subj_chemistry',
        name: 'Physical Chemistry',
        topicsCount: 9,
        completedTopics: 4,
        difficulty: 'Medium',
        estimatedTime: '4h',
        hasVideo: true,
        hasPYQ: true,
        accuracy: 82,
      },
    ],
  },
  {
    id: 'subj_mathematics',
    name: 'Mathematics',
    exam_id: 'jee_main',
    icon: '∑',
    color: 'purple',
    chaptersCount: 22,
    completedChapters: 15,
    chapters: [
      {
        id: 'ch_calculus',
        subject_id: 'subj_mathematics',
        name: 'Calculus',
        topicsCount: 8,
        completedTopics: 8,
        difficulty: 'Hard',
        estimatedTime: '4h',
        hasVideo: true,
        hasPYQ: true,
        accuracy: 92,
      },
      {
        id: 'ch_algebra',
        subject_id: 'subj_mathematics',
        name: 'Algebra',
        topicsCount: 7,
        completedTopics: 5,
        difficulty: 'Medium',
        estimatedTime: '3h',
        hasVideo: true,
        hasPYQ: true,
        accuracy: 88,
      },
      {
        id: 'ch_geometry',
        subject_id: 'subj_mathematics',
        name: 'Coordinate Geometry',
        topicsCount: 6,
        completedTopics: 4,
        difficulty: 'Medium',
        estimatedTime: '2h 30m',
        hasVideo: false,
        hasPYQ: true,
        accuracy: 87,
      },
    ],
  },
  {
    id: 'subj_biology',
    name: 'Biology',
    exam_id: 'neet',
    icon: '🧬',
    color: 'rose',
    chaptersCount: 32,
    completedChapters: 10,
    chapters: [
      {
        id: 'ch_zoology',
        subject_id: 'subj_biology',
        name: 'Zoology',
        topicsCount: 12,
        completedTopics: 5,
        difficulty: 'Medium',
        estimatedTime: '3h 30m',
        hasVideo: true,
        hasPYQ: true,
        accuracy: 82,
      },
      {
        id: 'ch_botany',
        subject_id: 'subj_biology',
        name: 'Botany',
        topicsCount: 10,
        completedTopics: 5,
        difficulty: 'Medium',
        estimatedTime: '3h',
        hasVideo: true,
        hasPYQ: true,
        accuracy: 88,
      },
    ],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const chapter = searchParams.get('chapter');

    // Return specific chapter detail
    if (subject && chapter) {
      const subjectData = MOCK_SUBJECTS.find(
        (s) => s.name.toLowerCase() === subject.toLowerCase() || s.id === subject
      );
      const chapterData = subjectData?.chapters.find(
        (c) => c.name.toLowerCase().replace(/\s+/g, '-') === chapter.toLowerCase() || c.id === chapter
      );

      if (!chapterData) {
        return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          ...chapterData,
          subject: subjectData?.name,
          topics: [
            { id: 't1', name: 'Core Concepts', completed: true, estimatedTime: '30m' },
            { id: 't2', name: 'Worked Examples', completed: true, estimatedTime: '45m' },
            { id: 't3', name: 'Practice Problems', completed: false, estimatedTime: '1h' },
            { id: 't4', name: 'Previous Year Questions', completed: false, estimatedTime: '45m' },
          ],
          content: {
            notes: `Core concept notes for ${chapterData.name}. Key principles and formulas covered in this chapter.`,
            videos: chapterData.hasVideo
              ? [
                  { title: `${chapterData.name} — Introduction`, duration: '22m', instructor: 'Prof. Miguel Santos' },
                  { title: `${chapterData.name} — Advanced Concepts`, duration: '18m', instructor: 'Dr. Rina Shah' },
                ]
              : [],
            pyqs: chapterData.hasPYQ
              ? [
                  { year: 2025, question: `Calculate the value related to ${chapterData.name}`, marks: 4 },
                  { year: 2024, question: `Interpret changes in ${chapterData.name}`, marks: 4 },
                ]
              : [],
          },
        },
      });
    }

    // Return chapters for a subject
    if (subject) {
      const subjectData = MOCK_SUBJECTS.find(
        (s) => s.name.toLowerCase() === subject.toLowerCase() || s.id === subject
      );

      if (!subjectData) {
        return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: subjectData });
    }

    // Try Supabase first, fall back to mock
    try {
      const supabase = createRouteHandlerClient({ cookies });
      const { data: subjects, error } = await supabase
        .from('subjects')
        .select('*, chapters(id, name)')
        .order('name');

      if (!error && subjects && subjects.length > 0) {
        return NextResponse.json({ success: true, data: subjects, source: 'live' });
      }
    } catch {
      // Supabase unreachable
    }

    // Return mock subjects list
    return NextResponse.json({
      success: true,
      data: MOCK_SUBJECTS.map(({ chapters: _, ...s }) => ({
        ...s,
        chaptersCount: s.chaptersCount,
      })),
      source: 'mock',
    });

  } catch (error) {
    console.error('/api/library error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

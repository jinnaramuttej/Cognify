/**
 * GET /api/curriculum/tree
 * 
 * Returns the curriculum tree structure with:
 * - NCERT board syllabi
 * - Subject/chapter/topic hierarchy
 * - Coverage percentages
 * - Resource counts
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// Mock Curriculum Data (In production, this would come from database)
// ============================================================

const MOCK_CURRICULUM_TREE = [
  {
    id: 'ncert-12',
    parentId: null,
    level: 1,
    code: 'NCERT-12',
    name: 'Class 12',
    nameEn: 'Class 12',
    nameHi: 'कक्षा 12',
    board: 'NCERT',
    coveragePercent: 78,
    totalResources: 245,
    children: [
      {
        id: 'ncert-12-phys',
        parentId: 'ncert-12',
        level: 2,
        code: 'NCERT-12-PHYS',
        name: 'Physics',
        nameEn: 'Physics',
        nameHi: 'भौतिकी',
        board: 'NCERT',
        grade: '12',
        subject: 'Physics',
        coveragePercent: 82,
        totalResources: 85,
        children: [
          {
            id: 'ncert-12-phys-01',
            parentId: 'ncert-12-phys',
            level: 3,
            code: 'NCERT-12-PHYS-01',
            name: 'Electric Charges and Fields',
            nameEn: 'Electric Charges and Fields',
            nameHi: 'वैद्युत आवेश एवं क्षेत्र',
            board: 'NCERT',
            grade: '12',
            subject: 'Physics',
            coveragePercent: 95,
            totalResources: 24,
          },
          {
            id: 'ncert-12-phys-02',
            parentId: 'ncert-12-phys',
            level: 3,
            code: 'NCERT-12-PHYS-02',
            name: 'Electrostatic Potential and Capacitance',
            nameEn: 'Electrostatic Potential and Capacitance',
            nameHi: 'स्थिरवैद्युत विभव तथा धारिता',
            board: 'NCERT',
            grade: '12',
            subject: 'Physics',
            coveragePercent: 75,
            totalResources: 18,
          },
          {
            id: 'ncert-12-phys-03',
            parentId: 'ncert-12-phys',
            level: 3,
            code: 'NCERT-12-PHYS-03',
            name: 'Current Electricity',
            nameEn: 'Current Electricity',
            nameHi: 'विद्युत धारा',
            board: 'NCERT',
            grade: '12',
            subject: 'Physics',
            coveragePercent: 88,
            totalResources: 22,
          },
        ],
      },
      {
        id: 'ncert-12-chem',
        parentId: 'ncert-12',
        level: 2,
        code: 'NCERT-12-CHEM',
        name: 'Chemistry',
        nameEn: 'Chemistry',
        nameHi: 'रसायन विज्ञान',
        board: 'NCERT',
        grade: '12',
        subject: 'Chemistry',
        coveragePercent: 70,
        totalResources: 90,
        children: [
          {
            id: 'ncert-12-chem-01',
            parentId: 'ncert-12-chem',
            level: 3,
            code: 'NCERT-12-CHEM-01',
            name: 'Solutions',
            nameEn: 'Solutions',
            nameHi: 'विलयन',
            board: 'NCERT',
            grade: '12',
            subject: 'Chemistry',
            coveragePercent: 65,
            totalResources: 15,
          },
        ],
      },
      {
        id: 'ncert-12-math',
        parentId: 'ncert-12',
        level: 2,
        code: 'NCERT-12-MATH',
        name: 'Mathematics',
        nameEn: 'Mathematics',
        nameHi: 'गणित',
        board: 'NCERT',
        grade: '12',
        subject: 'Math',
        coveragePercent: 85,
        totalResources: 70,
      },
    ],
  },
];

// ============================================================
// Types
// ============================================================

interface CurriculumTreeResponse {
  success: boolean;
  tree?: any[];
  error?: string;
}

// ============================================================
// GET Handler
// ============================================================

export async function GET(
  request: NextRequest
): Promise<NextResponse<CurriculumTreeResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const board = searchParams.get('board') || 'NCERT';
    const grade = searchParams.get('grade');
    const subject = searchParams.get('subject');
    
    // In production, filter from database
    let tree = MOCK_CURRICULUM_TREE;
    
    // Apply filters if specified
    if (grade) {
      tree = tree.filter(node => node.code.includes(grade));
    }
    
    return NextResponse.json({
      success: true,
      tree,
    });
    
  } catch (error) {
    console.error('[Curriculum Tree] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch curriculum tree',
    }, { status: 500 });
  }
}

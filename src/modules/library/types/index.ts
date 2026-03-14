/**
 * Library Module — Types
 */

export interface SyllabusExam {
    id: string;
    name: string;
    description?: string;
}

export interface SyllabusSubject {
    id: string;
    exam_id: string;
    name: string;
    display_order?: number;
}

export interface SyllabusUnit {
    id: string;
    subject_id: string;
    name: string;
    display_order?: number;
}

export interface SyllabusChapter {
    id: string;
    unit_id: string;
    name: string;
    display_order?: number;
}

export interface SyllabusConcept {
    id: string;
    chapter_id: string;
    name: string;
    description?: string;
}

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

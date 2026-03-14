/**
 * Knowledge Graph — Concept Relationship System
 * 
 * Maps prerequisite relationships between syllabus concepts.
 * Used by the Cogni AI tutor to recommend topics in optimal learning order.
 * 
 * Uses: syllabus tables (syllabus_chapters, syllabus_concepts) + topics table
 */

import { supabase } from '@/lib/supabaseClient';

export interface ConceptNode {
    id: string;
    name: string;
    chapter?: string;
    subject?: string;
    difficulty_level?: number;
}

export interface ConceptEdge {
    from: string;  // prerequisite concept name
    to: string;    // dependent concept name
    strength: number; // 0–1 how strongly related
}

/**
 * Built-in prerequisite graph for JEE/NEET Physics topics.
 * This encodes "concept A should be learned before concept B".
 * 
 * In production this could be stored in a separate table or loaded from a config file.
 */
const PHYSICS_PREREQUISITES: ConceptEdge[] = [
    // Mechanics chain
    { from: 'Units and Measurements', to: 'Kinematics', strength: 0.9 },
    { from: 'Kinematics', to: 'Laws of Motion', strength: 0.95 },
    { from: 'Laws of Motion', to: 'Friction', strength: 0.8 },
    { from: 'Laws of Motion', to: 'Circular Motion', strength: 0.85 },
    { from: 'Laws of Motion', to: 'Work Energy Power', strength: 0.9 },
    { from: 'Work Energy Power', to: 'Rotational Motion', strength: 0.7 },
    { from: 'Kinematics', to: 'Gravitation', strength: 0.6 },
    // Thermodynamics
    { from: 'Kinetic Theory of Gases', to: 'Thermodynamics', strength: 0.8 },
    // Electromagnetism chain
    { from: 'Electric Charges and Fields', to: 'Electrostatic Potential and Capacitance', strength: 0.9 },
    { from: 'Electrostatic Potential and Capacitance', to: 'Current Electricity', strength: 0.85 },
    { from: 'Current Electricity', to: 'Moving Charges and Magnetism', strength: 0.9 },
    { from: 'Moving Charges and Magnetism', to: 'Electromagnetic Induction', strength: 0.85 },
    { from: 'Electromagnetic Induction', to: 'Alternating Current', strength: 0.8 },
    // Optics
    { from: 'Ray Optics', to: 'Wave Optics', strength: 0.7 },
    // Modern Physics
    { from: 'Wave Optics', to: 'Dual Nature of Matter', strength: 0.6 },
    { from: 'Dual Nature of Matter', to: 'Atoms and Nuclei', strength: 0.8 },
];

const CHEMISTRY_PREREQUISITES: ConceptEdge[] = [
    { from: 'Some Basic Concepts of Chemistry', to: 'Atomic Structure', strength: 0.9 },
    { from: 'Atomic Structure', to: 'Periodic Table', strength: 0.9 },
    { from: 'Periodic Table', to: 'Chemical Bonding', strength: 0.85 },
    { from: 'Chemical Bonding', to: 'States of Matter', strength: 0.6 },
    { from: 'States of Matter', to: 'Thermodynamics', strength: 0.7 },
    { from: 'Thermodynamics', to: 'Equilibrium', strength: 0.8 },
    { from: 'Equilibrium', to: 'Electrochemistry', strength: 0.7 },
    { from: 'Periodic Table', to: 's-Block Elements', strength: 0.8 },
    { from: 's-Block Elements', to: 'p-Block Elements (11)', strength: 0.7 },
    { from: 'Basic Principles of Organic Chemistry', to: 'Hydrocarbons', strength: 0.9 },
    { from: 'Hydrocarbons', to: 'Haloalkanes and Haloarenes', strength: 0.85 },
    { from: 'Haloalkanes and Haloarenes', to: 'Alcohols Phenols Ethers', strength: 0.8 },
];

const MATH_PREREQUISITES: ConceptEdge[] = [
    { from: 'Sets Relations Functions', to: 'Complex Numbers', strength: 0.5 },
    { from: 'Quadratic Equations', to: 'Sequences and Series', strength: 0.6 },
    { from: 'Limits and Derivatives (Intro)', to: 'Continuity and Differentiability', strength: 0.95 },
    { from: 'Continuity and Differentiability', to: 'Applications of Derivatives', strength: 0.9 },
    { from: 'Applications of Derivatives', to: 'Indefinite Integrals', strength: 0.8 },
    { from: 'Indefinite Integrals', to: 'Definite Integrals', strength: 0.9 },
    { from: 'Definite Integrals', to: 'Differential Equations', strength: 0.7 },
    { from: 'Definite Integrals', to: 'Area Under Curve', strength: 0.85 },
    { from: 'Trigonometric Functions', to: 'Inverse Trigonometric Functions', strength: 0.8 },
    { from: 'Straight Lines', to: 'Circle', strength: 0.7 },
    { from: 'Circle', to: 'Conic Sections', strength: 0.8 },
    { from: 'Matrices', to: 'Determinants', strength: 0.9 },
];

// Combined graph
const ALL_EDGES: ConceptEdge[] = [
    ...PHYSICS_PREREQUISITES,
    ...CHEMISTRY_PREREQUISITES,
    ...MATH_PREREQUISITES,
];

/**
 * Get all prerequisite concepts for a given concept.
 */
export function getPrerequisites(conceptName: string): ConceptEdge[] {
    return ALL_EDGES.filter(e => e.to.toLowerCase() === conceptName.toLowerCase());
}

/**
 * Get all concepts that depend on a given concept.
 */
export function getDependents(conceptName: string): ConceptEdge[] {
    return ALL_EDGES.filter(e => e.from.toLowerCase() === conceptName.toLowerCase());
}

/**
 * Find the optimal learning order for a set of topics.
 * Uses topological sort on the prerequisite graph.
 */
export function getOptimalOrder(topicNames: string[]): string[] {
    const nameSet = new Set(topicNames.map(t => t.toLowerCase()));
    const graph = new Map<string, string[]>(); // from → [to]
    const inDegree = new Map<string, number>();

    // Initialize
    for (const name of topicNames) {
        const lower = name.toLowerCase();
        graph.set(lower, []);
        inDegree.set(lower, 0);
    }

    // Build edges (only within the requested set)
    for (const edge of ALL_EDGES) {
        const from = edge.from.toLowerCase();
        const to = edge.to.toLowerCase();
        if (nameSet.has(from) && nameSet.has(to)) {
            graph.get(from)!.push(to);
            inDegree.set(to, (inDegree.get(to) || 0) + 1);
        }
    }

    // Topological sort (Kahn's algorithm)
    const queue: string[] = [];
    for (const [node, degree] of inDegree) {
        if (degree === 0) queue.push(node);
    }

    const sorted: string[] = [];
    while (queue.length > 0) {
        const current = queue.shift()!;
        sorted.push(current);

        for (const neighbor of graph.get(current) || []) {
            const newDegree = (inDegree.get(neighbor) || 1) - 1;
            inDegree.set(neighbor, newDegree);
            if (newDegree === 0) queue.push(neighbor);
        }
    }

    // Map back to original case
    const lowerToOriginal = new Map(topicNames.map(t => [t.toLowerCase(), t]));
    return sorted.map(s => lowerToOriginal.get(s) || s);
}

/**
 * Recommend the next topics based on what the student has mastered.
 */
export function recommendNextTopics(
    masteredTopics: string[],
    allTopics: string[],
    maxRecommendations = 3
): string[] {
    const masteredSet = new Set(masteredTopics.map(t => t.toLowerCase()));
    const recommendations: { topic: string; priority: number }[] = [];

    for (const topic of allTopics) {
        if (masteredSet.has(topic.toLowerCase())) continue;

        // Check if all prerequisites are mastered
        const prereqs = getPrerequisites(topic);
        const allPrereqsMet = prereqs.length === 0 || prereqs.every(p =>
            masteredSet.has(p.from.toLowerCase())
        );

        if (allPrereqsMet) {
            // Priority based on how many dependents this unlocks
            const dependents = getDependents(topic);
            recommendations.push({
                topic,
                priority: dependents.length + (prereqs.length > 0 ? prereqs.reduce((s, p) => s + p.strength, 0) : 0),
            });
        }
    }

    return recommendations
        .sort((a, b) => b.priority - a.priority)
        .slice(0, maxRecommendations)
        .map(r => r.topic);
}

/**
 * Load all concept names from the database for a given exam.
 */
export async function loadConceptsForExam(examName: string): Promise<string[]> {
    const { data } = await supabase
        .from('syllabus_chapters')
        .select(`
      name,
      unit:syllabus_units!inner(
        subject:syllabus_subjects!inner(
          exam:syllabus_exams!inner(name)
        )
      )
    `)
        .eq('unit.subject.exam.name', examName);

    return data?.map(c => c.name) || [];
}

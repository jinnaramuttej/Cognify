/**
 * Cogni Core - Seed Data for Adaptive Tutoring
 * 
 * Creates sample items across multiple subjects and topics
 * with realistic IRT parameters for demonstration and testing
 */

import { db } from '@/lib/db';

// ============================================================
// Sample Item Bank
// ============================================================

interface SeedItem {
  externalId: string;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subject: string;
  topic: string;
  skillId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  // IRT Parameters
  discrimination: number; // a: 0.5 - 2.5
  difficultyParam: number; // b: -3 to +3
  guessing: number; // c: 0 - 0.35
  timeLimit: number;
}

const PHYSICS_ITEMS: SeedItem[] = [
  // Mechanics - Easy
  {
    externalId: 'PHY-MECH-001',
    content: 'A car travels 100 meters in 5 seconds. What is its average speed?',
    options: ['10 m/s', '20 m/s', '50 m/s', '500 m/s'],
    correctAnswer: 'B',
    explanation: 'Average speed = distance/time = 100m/5s = 20 m/s',
    subject: 'Physics',
    topic: 'Mechanics',
    skillId: 'kinematics_speed',
    difficulty: 'easy',
    discrimination: 1.2,
    difficultyParam: -1.5,
    guessing: 0.25,
    timeLimit: 60,
  },
  {
    externalId: 'PHY-MECH-002',
    content: 'Which of Newton\'s laws states that F = ma?',
    options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravitation'],
    correctAnswer: 'B',
    explanation: 'Newton\'s Second Law states that Force equals mass times acceleration.',
    subject: 'Physics',
    topic: 'Mechanics',
    skillId: 'newtons_laws',
    difficulty: 'easy',
    discrimination: 1.0,
    difficultyParam: -1.2,
    guessing: 0.25,
    timeLimit: 45,
  },
  // Mechanics - Medium
  {
    externalId: 'PHY-MECH-003',
    content: 'A 2 kg object is thrown upward with initial velocity 20 m/s. What is its maximum height? (g = 10 m/s²)',
    options: ['10 m', '20 m', '40 m', '80 m'],
    correctAnswer: 'B',
    explanation: 'Using v² = u² - 2gh, at max height v=0: 0 = 400 - 2×10×h, h = 20m',
    subject: 'Physics',
    topic: 'Mechanics',
    skillId: 'kinematics_projectile',
    difficulty: 'medium',
    discrimination: 1.4,
    difficultyParam: 0.2,
    guessing: 0.25,
    timeLimit: 90,
  },
  {
    externalId: 'PHY-MECH-004',
    content: 'A block slides down a frictionless incline of angle 30°. What is its acceleration? (g = 10 m/s²)',
    options: ['5 m/s²', '8.66 m/s²', '10 m/s²', '3.33 m/s²'],
    correctAnswer: 'A',
    explanation: 'Acceleration = g × sin(30°) = 10 × 0.5 = 5 m/s²',
    subject: 'Physics',
    topic: 'Mechanics',
    skillId: 'inclined_plane',
    difficulty: 'medium',
    discrimination: 1.3,
    difficultyParam: 0.5,
    guessing: 0.25,
    timeLimit: 90,
  },
  // Mechanics - Hard
  {
    externalId: 'PHY-MECH-005',
    content: 'Two blocks of mass 3 kg and 2 kg are connected by a string over a frictionless pulley. Find the acceleration of the system.',
    options: ['1 m/s²', '2 m/s²', '5 m/s²', '0.5 m/s²'],
    correctAnswer: 'B',
    explanation: 'a = (m₁-m₂)g/(m₁+m₂) = (3-2)×10/(3+2) = 2 m/s²',
    subject: 'Physics',
    topic: 'Mechanics',
    skillId: 'pulley_systems',
    difficulty: 'hard',
    discrimination: 1.5,
    difficultyParam: 1.5,
    guessing: 0.25,
    timeLimit: 120,
  },
  // Electromagnetism - Medium
  {
    externalId: 'PHY-ELEC-001',
    content: 'What is the electric field at a distance r from a point charge Q?',
    options: ['kQ/r', 'kQ/r²', 'kQ²/r²', 'Q/r²'],
    correctAnswer: 'B',
    explanation: 'Electric field E = kQ/r², where k is Coulomb\'s constant.',
    subject: 'Physics',
    topic: 'Electromagnetism',
    skillId: 'electric_field',
    difficulty: 'medium',
    discrimination: 1.1,
    difficultyParam: 0.0,
    guessing: 0.25,
    timeLimit: 60,
  },
  {
    externalId: 'PHY-ELEC-002',
    content: 'A wire of resistance R is stretched to twice its length. What is its new resistance?',
    options: ['R', '2R', '4R', 'R/2'],
    correctAnswer: 'C',
    explanation: 'When length doubles, cross-section halves. R = ρL/A, so R becomes 4R.',
    subject: 'Physics',
    topic: 'Electromagnetism',
    skillId: 'resistance',
    difficulty: 'medium',
    discrimination: 1.4,
    difficultyParam: 0.8,
    guessing: 0.25,
    timeLimit: 90,
  },
  // Thermodynamics
  {
    externalId: 'PHY-THERM-001',
    content: 'In an isothermal process for an ideal gas, which quantity remains constant?',
    options: ['Pressure', 'Volume', 'Internal Energy', 'Entropy'],
    correctAnswer: 'C',
    explanation: 'For ideal gas, internal energy depends only on temperature, which is constant in isothermal process.',
    subject: 'Physics',
    topic: 'Thermodynamics',
    skillId: 'thermo_processes',
    difficulty: 'medium',
    discrimination: 1.2,
    difficultyParam: 0.3,
    guessing: 0.25,
    timeLimit: 60,
  },
];

const CHEMISTRY_ITEMS: SeedItem[] = [
  // Organic Chemistry
  {
    externalId: 'CHEM-ORG-001',
    content: 'Which functional group is present in aldehydes?',
    options: ['-OH', '-CHO', '-COOH', '-CO-'],
    correctAnswer: 'B',
    explanation: 'Aldehydes contain the -CHO (formyl) functional group.',
    subject: 'Chemistry',
    topic: 'Organic Chemistry',
    skillId: 'functional_groups',
    difficulty: 'easy',
    discrimination: 1.0,
    difficultyParam: -1.0,
    guessing: 0.25,
    timeLimit: 45,
  },
  {
    externalId: 'CHEM-ORG-002',
    content: 'Which reaction converts an alkene to an alkane?',
    options: ['Oxidation', 'Reduction (Hydrogenation)', 'Hydrolysis', 'Dehydration'],
    correctAnswer: 'B',
    explanation: 'Hydrogenation (addition of H₂) converts C=C to C-C, making an alkane.',
    subject: 'Chemistry',
    topic: 'Organic Chemistry',
    skillId: 'organic_reactions',
    difficulty: 'medium',
    discrimination: 1.3,
    difficultyParam: 0.2,
    guessing: 0.25,
    timeLimit: 60,
  },
  // Physical Chemistry
  {
    externalId: 'CHEM-PHY-001',
    content: 'For a first-order reaction, what is the unit of rate constant k?',
    options: ['s⁻¹', 'mol·L⁻¹·s⁻¹', 'L·mol⁻¹·s⁻¹', 's'],
    correctAnswer: 'A',
    explanation: 'For first-order: rate = k[A], so k has units of s⁻¹ (or time⁻¹).',
    subject: 'Chemistry',
    topic: 'Physical Chemistry',
    skillId: 'chemical_kinetics',
    difficulty: 'medium',
    discrimination: 1.2,
    difficultyParam: 0.4,
    guessing: 0.25,
    timeLimit: 60,
  },
  {
    externalId: 'CHEM-PHY-002',
    content: 'What is the pH of a 0.01 M HCl solution?',
    options: ['1', '2', '12', '13'],
    correctAnswer: 'B',
    explanation: '[H⁺] = 0.01 M = 10⁻² M, pH = -log(10⁻²) = 2',
    subject: 'Chemistry',
    topic: 'Physical Chemistry',
    skillId: 'ph_calculations',
    difficulty: 'easy',
    discrimination: 1.1,
    difficultyParam: -0.8,
    guessing: 0.25,
    timeLimit: 60,
  },
  // Inorganic Chemistry
  {
    externalId: 'CHEM-INO-001',
    content: 'What is the oxidation state of Mn in KMnO₄?',
    options: ['+2', '+4', '+6', '+7'],
    correctAnswer: 'D',
    explanation: 'K(+1) + Mn(x) + 4×O(-2) = 0, x = +7',
    subject: 'Chemistry',
    topic: 'Inorganic Chemistry',
    skillId: 'oxidation_states',
    difficulty: 'medium',
    discrimination: 1.3,
    difficultyParam: 0.1,
    guessing: 0.25,
    timeLimit: 60,
  },
];

const MATHEMATICS_ITEMS: SeedItem[] = [
  // Calculus
  {
    externalId: 'MATH-CALC-001',
    content: 'What is the derivative of x³?',
    options: ['x²', '3x²', '3x', 'x³'],
    correctAnswer: 'B',
    explanation: 'Using power rule: d/dx(xⁿ) = nxⁿ⁻¹, so d/dx(x³) = 3x²',
    subject: 'Mathematics',
    topic: 'Calculus',
    skillId: 'derivatives_basic',
    difficulty: 'easy',
    discrimination: 1.1,
    difficultyParam: -1.5,
    guessing: 0.25,
    timeLimit: 45,
  },
  {
    externalId: 'MATH-CALC-002',
    content: 'What is ∫(2x + 3)dx?',
    options: ['x² + 3x + C', '2x² + 3x + C', 'x² + 3 + C', '2 + C'],
    correctAnswer: 'A',
    explanation: '∫(2x + 3)dx = 2(x²/2) + 3x + C = x² + 3x + C',
    subject: 'Mathematics',
    topic: 'Calculus',
    skillId: 'integration_basic',
    difficulty: 'easy',
    discrimination: 1.2,
    difficultyParam: -1.2,
    guessing: 0.25,
    timeLimit: 60,
  },
  {
    externalId: 'MATH-CALC-003',
    content: 'Find the maximum value of f(x) = -x² + 4x + 5',
    options: ['5', '9', '7', '11'],
    correctAnswer: 'B',
    explanation: 'At x = -b/2a = -4/-2 = 2, f(2) = -4 + 8 + 5 = 9',
    subject: 'Mathematics',
    topic: 'Calculus',
    skillId: 'optimization',
    difficulty: 'medium',
    discrimination: 1.3,
    difficultyParam: 0.3,
    guessing: 0.25,
    timeLimit: 90,
  },
  // Algebra
  {
    externalId: 'MATH-ALG-001',
    content: 'Solve: 2x + 5 = 13',
    options: ['x = 4', 'x = 5', 'x = 6', 'x = 9'],
    correctAnswer: 'A',
    explanation: '2x = 13 - 5 = 8, x = 4',
    subject: 'Mathematics',
    topic: 'Algebra',
    skillId: 'linear_equations',
    difficulty: 'easy',
    discrimination: 0.9,
    difficultyParam: -2.0,
    guessing: 0.25,
    timeLimit: 30,
  },
  {
    externalId: 'MATH-ALG-002',
    content: 'If log₂(x) = 5, what is x?',
    options: ['10', '25', '32', '64'],
    correctAnswer: 'C',
    explanation: 'log₂(x) = 5 means 2⁵ = x, so x = 32',
    subject: 'Mathematics',
    topic: 'Algebra',
    skillId: 'logarithms',
    difficulty: 'medium',
    discrimination: 1.2,
    difficultyParam: 0.0,
    guessing: 0.25,
    timeLimit: 60,
  },
  // Probability
  {
    externalId: 'MATH-PROB-001',
    content: 'A fair coin is tossed 3 times. What is the probability of getting exactly 2 heads?',
    options: ['1/8', '1/4', '3/8', '1/2'],
    correctAnswer: 'C',
    explanation: 'P(X=2) = C(3,2) × (1/2)³ = 3/8',
    subject: 'Mathematics',
    topic: 'Probability',
    skillId: 'binomial_probability',
    difficulty: 'medium',
    discrimination: 1.4,
    difficultyParam: 0.5,
    guessing: 0.25,
    timeLimit: 90,
  },
  // Trigonometry
  {
    externalId: 'MATH-TRIG-001',
    content: 'What is sin(30°)?',
    options: ['1/2', '√2/2', '√3/2', '1'],
    correctAnswer: 'A',
    explanation: 'sin(30°) = 1/2',
    subject: 'Mathematics',
    topic: 'Trigonometry',
    skillId: 'trig_values',
    difficulty: 'easy',
    discrimination: 1.0,
    difficultyParam: -1.8,
    guessing: 0.25,
    timeLimit: 30,
  },
  {
    externalId: 'MATH-TRIG-002',
    content: 'What is the period of sin(3x)?',
    options: ['π/3', '2π/3', 'π', '2π'],
    correctAnswer: 'B',
    explanation: 'Period of sin(kx) = 2π/k, so period of sin(3x) = 2π/3',
    subject: 'Mathematics',
    topic: 'Trigonometry',
    skillId: 'trig_period',
    difficulty: 'medium',
    discrimination: 1.2,
    difficultyParam: 0.2,
    guessing: 0.25,
    timeLimit: 60,
  },
];

const ALL_ITEMS = [...PHYSICS_ITEMS, ...CHEMISTRY_ITEMS, ...MATHEMATICS_ITEMS];

// ============================================================
// Seed Function
// ============================================================

export async function seedAdaptiveItems() {
  console.log(`[Seed] Seeding ${ALL_ITEMS.length} adaptive items...`);
  
  let created = 0;
  let updated = 0;
  
  for (const item of ALL_ITEMS) {
    try {
      // Check if item exists
      const existing = await db.adaptiveItem.findUnique({
        where: { externalId: item.externalId },
      });
      
      if (existing) {
        // Update existing item
        await db.adaptiveItem.update({
          where: { externalId: item.externalId },
          data: {
            content: item.content,
            options: JSON.stringify(item.options),
            correctAnswer: item.correctAnswer,
            explanation: item.explanation,
            subject: item.subject,
            topic: item.topic,
            skillId: item.skillId,
            difficulty: item.difficulty,
            discrimination: item.discrimination,
            difficultyParam: item.difficultyParam,
            guessing: item.guessing,
            timeLimit: item.timeLimit,
          },
        });
        updated++;
      } else {
        // Create new item
        await db.adaptiveItem.create({
          data: {
            externalId: item.externalId,
            content: item.content,
            options: JSON.stringify(item.options),
            correctAnswer: item.correctAnswer,
            explanation: item.explanation,
            subject: item.subject,
            topic: item.topic,
            skillId: item.skillId,
            difficulty: item.difficulty,
            discrimination: item.discrimination,
            difficultyParam: item.difficultyParam,
            guessing: item.guessing,
            timeLimit: item.timeLimit,
            isPublished: true,
          },
        });
        created++;
      }
    } catch (error) {
      console.error(`[Seed] Error seeding item ${item.externalId}:`, error);
    }
  }
  
  // Create item stats for all items
  const items = await db.adaptiveItem.findMany();
  
  for (const item of items) {
    try {
      await db.itemStats.upsert({
        where: { itemId: item.id },
        create: {
          itemId: item.id,
          pValue: 0.5,
          pointBiserial: 0.3,
          sampleSize: 0,
        },
        update: {},
      });
    } catch {
      // Ignore
    }
  }
  
  console.log(`[Seed] Created ${created} items, updated ${updated} items`);
  
  return { created, updated, total: ALL_ITEMS.length };
}

// Export for direct execution
export { ALL_ITEMS };

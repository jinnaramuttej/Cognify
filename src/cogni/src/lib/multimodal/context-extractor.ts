/**
 * Cogni Multimodal - Context Extractor
 * 
 * Extracts entities, problem type, and context from parsed text
 */

// ============================================================
// Types
// ============================================================

export interface ExtractedContext {
  problemType: 'solve' | 'prove' | 'simplify' | 'evaluate' | 'derive' | 'find' | 'unknown';
  subject: 'math' | 'physics' | 'chemistry' | 'unknown';
  variables: string[];
  concepts: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  keywords: string[];
}

export interface MathExpression {
  latex: string;
  type: 'equation' | 'inequality' | 'expression' | 'function' | 'integral' | 'derivative' | 'limit' | 'matrix';
  variables: string[];
  functions: string[];
}

// ============================================================
// Regex Patterns
// ============================================================

const PROBLEM_TYPE_PATTERNS: Record<string, RegExp> = {
  solve: /solve|find the value|find x|determine|calculate/i,
  prove: /prove|show that|demonstrate|verify/i,
  simplify: /simplify|reduce|express in simplest/i,
  evaluate: /evaluate|compute|find the value of/i,
  derive: /derive|differentiate|find the derivative/i,
  find: /find|determine|what is/i,
};

const SUBJECT_PATTERNS: Record<string, RegExp> = {
  math: /integral|derivative|limit|matrix|polynomial|equation|function|theorem|proof|algebra|calculus|geometry|trigonometry|logarithm|exponential/i,
  physics: /velocity|acceleration|force|energy|momentum|mass|newton|joule|meter|gravity|friction|kinetic|potential|wave|frequency/i,
  chemistry: /molecule|atom|reaction|compound|element|bond|electron|proton|neutron|ph|acid|base|oxidation|reduction|mole/i,
};

const VARIABLE_PATTERN = /\b([a-zA-Z])(?:\s*[=<>]|\s*[²³]|\s*[′″]|\s*_\{[^}]+\})?\b/g;

const MATH_CONCEPTS = [
  'derivative', 'integral', 'limit', 'continuity', 'differentiability',
  'polynomial', 'rational', 'exponential', 'logarithmic', 'trigonometric',
  'sine', 'cosine', 'tangent', 'secant', 'cosecant', 'cotangent',
  'matrix', 'determinant', 'eigenvalue', 'eigenvector', 'vector',
  'probability', 'statistics', 'variance', 'mean', 'standard deviation',
  'permutation', 'combination', 'binomial', 'arithmetic', 'geometric',
  'quadratic', 'cubic', 'linear', 'nonlinear',
  'area', 'volume', 'perimeter', 'circumference', 'surface area',
  'pythagorean', 'theorem', 'identity', 'equation', 'inequality',
  'factorization', 'expansion', 'simplification', 'rationalization',
];

const LATEX_PATTERNS: Record<string, RegExp> = {
  integral: /\\int|∫/i,
  derivative: /\\frac\{d\{|\\partial|d\/dx|f'|∂/i,
  limit: /\\lim|lim_/i,
  matrix: /\\begin\{[bv]?matrix\}|\\left\[/i,
  summation: /\\sum|∑/i,
  product: /\\prod|∏/i,
  fraction: /\\frac\{|⁄/i,
  sqrt: /\\sqrt|√/i,
  exponent: /\^|\^{[^}]+}|²|³|ⁿ/i,
  subscript: /_|_{[^}]+}/i,
  greek: /\\alpha|\\beta|\\gamma|\\delta|\\theta|\\lambda|\\mu|\\pi|\\sigma|\\omega|α|β|γ|δ|θ|λ|μ|π|σ|ω/i,
};

// ============================================================
// Context Extraction Functions
// ============================================================

/**
 * Determine problem type from text
 */
export function extractProblemType(text: string): ExtractedContext['problemType'] {
  for (const [type, pattern] of Object.entries(PROBLEM_TYPE_PATTERNS)) {
    if (pattern.test(text)) {
      return type as ExtractedContext['problemType'];
    }
  }
  return 'unknown';
}

/**
 * Determine subject from text
 */
export function extractSubject(text: string): ExtractedContext['subject'] {
  const scores: Record<string, number> = { math: 0, physics: 0, chemistry: 0 };
  
  for (const [subject, pattern] of Object.entries(SUBJECT_PATTERNS)) {
    const matches = text.match(pattern);
    if (matches) {
      scores[subject] = matches.length;
    }
  }
  
  const maxSubject = Object.entries(scores).reduce(
    (max, [subject, score]) => (score > max.score ? { subject, score } : max),
    { subject: 'unknown', score: 0 }
  );
  
  return maxSubject.score > 0 ? maxSubject.subject as ExtractedContext['subject'] : 'unknown';
}

/**
 * Extract variables from text
 */
export function extractVariables(text: string): string[] {
  const variables = new Set<string>();
  
  // Single letter variables
  const singleLetterMatches = text.match(/[a-zA-Z](?=[^a-zA-Z]|$)/g);
  if (singleLetterMatches) {
    singleLetterMatches.forEach(v => {
      if (v.length === 1 && !['a', 'an', 'the', 'is', 'of', 'in', 'to', 'for', 'and', 'or', 'if'].includes(v.toLowerCase())) {
        variables.add(v);
      }
    });
  }
  
  // Variables with subscripts
  const subscriptMatches = text.match(/[a-zA-Z]_\{[^}]+\}/g);
  if (subscriptMatches) {
    subscriptMatches.forEach(v => variables.add(v));
  }
  
  // Variables in equations (x =, y =, etc.)
  const equationMatches = text.match(/([a-zA-Z])\s*=/g);
  if (equationMatches) {
    equationMatches.forEach(m => {
      const v = m.charAt(0);
      variables.add(v);
    });
  }
  
  return Array.from(variables);
}

/**
 * Extract mathematical concepts from text
 */
export function extractConcepts(text: string): string[] {
  const concepts: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const concept of MATH_CONCEPTS) {
    if (lowerText.includes(concept)) {
      concepts.push(concept);
    }
  }
  
  return [...new Set(concepts)];
}

/**
 * Analyze LaTeX expression type
 */
export function analyzeLatexExpression(latex: string): MathExpression['type'] {
  for (const [type, pattern] of Object.entries(LATEX_PATTERNS)) {
    if (pattern.test(latex)) {
      if (['integral', 'derivative', 'limit', 'matrix'].includes(type)) {
        return type as MathExpression['type'];
      }
    }
  }
  
  // Check for equality
  if (latex.includes('=') && !latex.includes('<') && !latex.includes('>')) {
    return 'equation';
  }
  
  // Check for inequality
  if (/[<>≤≥]/.test(latex)) {
    return 'inequality';
  }
  
  // Check for function definition
  if (/f\s*\(|\\rightarrow|→/.test(latex)) {
    return 'function';
  }
  
  return 'expression';
}

/**
 * Estimate difficulty from expression complexity
 */
export function estimateDifficulty(
  text: string,
  latex: string,
  concepts: string[]
): 'easy' | 'medium' | 'hard' {
  let score = 0;
  
  // Concept-based scoring
  const hardConcepts = ['integral', 'derivative', 'limit', 'matrix', 'eigenvalue', 'differential'];
  const mediumConcepts = ['polynomial', 'trigonometric', 'logarithmic', 'exponential', 'quadratic'];
  
  for (const concept of concepts) {
    if (hardConcepts.some(c => concept.includes(c))) score += 2;
    else if (mediumConcepts.some(c => concept.includes(c))) score += 1;
  }
  
  // LaTeX complexity scoring
  if (latex) {
    const latexLength = latex.length;
    if (latexLength > 100) score += 2;
    else if (latexLength > 50) score += 1;
    
    // Nested fractions
    const nestedFractions = (latex.match(/\\frac\{/g) || []).length;
    score += Math.min(nestedFractions, 3);
    
    // Multiple integrals/derivatives
    if (/\\int.*\\int|\\frac\{d\{[^}]*\}\{d[a-z]\}.*\\frac\{d\{/i.test(latex)) {
      score += 2;
    }
  }
  
  // Text complexity
  if (text.length > 200) score += 1;
  
  // Score thresholds
  if (score >= 5) return 'hard';
  if (score >= 2) return 'medium';
  return 'easy';
}

/**
 * Extract keywords for search/indexing
 */
export function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
    'from', 'as', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'under', 'again', 'further', 'then',
    'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
    'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and',
    'but', 'if', 'or', 'because', 'until', 'while', 'this', 'that',
    'these', 'those', 'what', 'which', 'who', 'whom', 'whose',
  ]);
  
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  // Count word frequencies
  const wordCounts: Record<string, number> = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Return top keywords by frequency
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Main extraction function
 */
export function extractContext(text: string, latex?: string): ExtractedContext {
  const problemType = extractProblemType(text);
  const subject = extractSubject(text);
  const variables = extractVariables(text + (latex || ''));
  const concepts = extractConcepts(text);
  const difficulty = estimateDifficulty(text, latex || '', concepts);
  const keywords = extractKeywords(text);
  
  return {
    problemType,
    subject,
    variables,
    concepts,
    difficulty,
    keywords,
  };
}

// ============================================================
// Export
// ============================================================

export const ContextExtractor = {
  extractProblemType,
  extractSubject,
  extractVariables,
  extractConcepts,
  analyzeLatexExpression,
  estimateDifficulty,
  extractKeywords,
  extractContext,
};

export default ContextExtractor;

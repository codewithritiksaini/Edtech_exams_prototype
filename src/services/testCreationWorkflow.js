// =============================================================================
// TEST CREATION WORKFLOW — 6-PHASE CANONICAL ARCHITECTURE
// Consolidates the original 12 underlying test construction capabilities into a
// streamlined 6-phase user-facing wizard for both Admin and Faculty workflows.
//
// 12 Capabilities -> 6 User-Facing Creation Stages:
//   1. Foundation (Exam + Test Information)
//   2. Structure (Sections / Blocks / Phases + Configuration)
//   3. Content (Question Types + Question Bank)
//   4. Rules (Blueprint + Scoring + Timing + Navigation)
//   5. Generate / Build (Assemble Test: Manual / Blueprint)
//   6. Review & Publish (Validate + Preview + Publish + Test Window)
//
// Post-Creation Capabilities:
//   - Advanced Test Types (adaptive testing, OSCE)
//   - Analytics & Versioning (psychometrics, item analysis, version snapshots)
// =============================================================================

export const TEST_CREATION_PHASES = [
  {
    id: 'foundation',
    number: 1,
    phaseNumber: 1,
    label: 'Foundation',
    title: 'Foundation',
    shortLabel: 'Foundation',
    shortDesc: 'Exam + Test Information',
    desc: 'Define the Exam and basic Test information.',
    description: 'Define the Exam and basic Test information.',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    capabilities: [
      'Exam Association',
      'Test Identity & Code',
      'Scope & Target Duration',
      'Language & Pre-Test Instructions'
    ],
    subCapabilities: [
      'Exam Association',
      'Test Identity & Code',
      'Scope & Target Duration',
      'Language & Pre-Test Instructions'
    ]
  },
  {
    id: 'structure',
    number: 2,
    phaseNumber: 2,
    label: 'Structure',
    title: 'Structure',
    shortLabel: 'Structure',
    shortDesc: 'Exam Pattern + Curriculum + Test Structure',
    desc: 'Exam Pattern + Curriculum + Test Structure',
    description: 'Exam Pattern + Curriculum + Test Structure',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    capabilities: [
      'Exam Pattern / Stage Selection',
      'Curriculum Scope Selection (Subjects & Chapters)',
      'Test Structure Builder (Phases, Sections & Blocks)',
      'Curriculum Mapping & Delivery Configuration'
    ],
    subCapabilities: [
      'Exam Pattern / Stage Selection',
      'Curriculum Scope Selection (Subjects & Chapters)',
      'Test Structure Builder (Phases, Sections & Blocks)',
      'Curriculum Mapping & Delivery Configuration'
    ]
  },
  {
    id: 'content',
    number: 3,
    phaseNumber: 3,
    label: 'Content',
    title: 'Content',
    shortLabel: 'Content',
    shortDesc: 'Question Types + Question Bank',
    desc: 'Configure question types and select questions for the Test.',
    description: 'Configure question types and select questions for the Test.',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    capabilities: [
      'Question Type System (Permitted Clinical Formats)',
      'Section Question Type Inheritance',
      'Question Bank (Scope by Exam/Subject/System)',
      'Item Metadata & Clinical Rationale Review'
    ],
    subCapabilities: [
      'Question Type System (Permitted Clinical Formats)',
      'Section Question Type Inheritance',
      'Question Bank (Scope by Exam/Subject/System)',
      'Item Metadata & Clinical Rationale Review'
    ]
  },
  {
    id: 'rules',
    number: 4,
    phaseNumber: 4,
    label: 'Rules',
    title: 'Rules',
    shortLabel: 'Rules',
    shortDesc: 'Blueprint + Scoring + Timing + Navigation',
    desc: 'Configure blueprint rules, scoring, timing, and candidate navigation.',
    description: 'Configure blueprint rules, scoring, timing, and candidate navigation.',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    capabilities: [
      'Question Blueprint & Difficulty Distributions',
      'Scoring, Negative Marking & Cutoff Thresholds',
      'Timing Modes (Per-Section vs Overall) & Break Rules',
      'Navigation Restrictions (Linear vs Free Jump)'
    ],
    subCapabilities: [
      'Question Blueprint & Difficulty Distributions',
      'Scoring, Negative Marking & Cutoff Thresholds',
      'Timing Modes (Per-Section vs Overall) & Break Rules',
      'Navigation Restrictions (Linear vs Free Jump)'
    ]
  },
  {
    id: 'generate',
    number: 5,
    phaseNumber: 5,
    label: 'Generate / Build',
    title: 'Generate / Build',
    shortLabel: 'Generate / Build',
    shortDesc: 'Assemble Test (Manual / Blueprint)',
    desc: 'Generate or assemble the final question set.',
    description: 'Generate or assemble the final question set.',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    capabilities: [
      'Manual Question Assembly (Upload PDF/DOCX or Author Manually)',
      'Blueprint-Driven Auto-Generation',
      'Deficit Resolution & Gap Fulfillment',
      'Question Roster Ordering & Management'
    ],
    subCapabilities: [
      'Manual Question Assembly (Upload PDF/DOCX or Author Manually)',
      'Blueprint-Driven Auto-Generation',
      'Deficit Resolution & Gap Fulfillment',
      'Question Roster Ordering & Management'
    ]
  },
  {
    id: 'review-publish',
    number: 6,
    phaseNumber: 6,
    label: 'Review & Publish',
    title: 'Review & Publish',
    shortLabel: 'Review & Publish',
    shortDesc: 'Validate + Preview + Publish + Test Window',
    desc: 'Validate completeness, preview student experience, and publish.',
    description: 'Validate completeness, preview student experience, and publish.',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    capabilities: [
      'Pre-Flight Validation & Error Check',
      'Student Experience Interactive Preview',
      'Scheduled Window & Timezone Settings',
      'Access Controls & Cohort Enrollment'
    ],
    subCapabilities: [
      'Pre-Flight Validation & Error Check',
      'Student Experience Interactive Preview',
      'Scheduled Window & Timezone Settings',
      'Access Controls & Cohort Enrollment'
    ]
  }
];

/**
 * Backward compatibility mapping from legacy 12 phases to new 6 phases.
 * Phases 11 & 12 are post-creation capabilities (not part of the creation wizard).
 */
// Backward compatibility alias for legacy 12-phase references
export const TEST_CONSTRUCTION_PHASES = TEST_CREATION_PHASES;

export const OLD_PHASE_TO_NEW_PHASE = {
  1: 'foundation',
  2: 'structure',
  3: 'structure',
  4: 'content',
  5: 'content',
  6: 'rules',
  7: 'rules',
  8: 'generate',
  9: 'review-publish',
  10: 'review-publish',
  11: null, // Advanced Test Types (post-creation capability)
  12: null  // Analytics & Versioning (post-creation capability)
};

/**
 * Post-creation / management capabilities (accessed after publish or from management area).
 */
export const POST_CREATION_CAPABILITIES = [
  {
    id: 'advanced-test-types',
    legacyId: 'advanced-types',
    oldPhaseNumber: 11,
    title: 'Advanced Test Types',
    desc: 'Computerized Adaptive Testing (CAT), multi-stage testing, and OSCE clinical stations.',
    description: 'Computerized Adaptive Testing (CAT), multi-stage testing, and OSCE clinical stations.'
  },
  {
    id: 'analytics-versioning',
    oldPhaseNumber: 12,
    title: 'Analytics & Versioning',
    desc: 'Item discrimination indices, psychometrics, cohort scorecards, and immutable version snapshots.',
    description: 'Item discrimination indices, psychometrics, cohort scorecards, and immutable version snapshots.'
  }
];

/**
 * Helper to retrieve phase definition by ID.
 * @param {string} phaseId
 * @returns {object|null}
 */
export function getCreationPhaseById(phaseId) {
  if (!phaseId) return null;
  const clean = String(phaseId).toLowerCase().trim();
  return TEST_CREATION_PHASES.find(p => p.id === clean) || null;
}

/**
 * Helper to retrieve phase definition by number (1 to 6).
 * @param {number} phaseNumber
 * @returns {object|null}
 */
export function getCreationPhaseByNumber(phaseNumber) {
  const num = Number(phaseNumber);
  return TEST_CREATION_PHASES.find(p => p.number === num) || null;
}

/**
 * Translates an old phase number (1 to 12) to the new 6-phase definition.
 * @param {number} oldPhaseNumber
 * @returns {object|null}
 */
export function mapOldPhaseToNew(oldPhaseNumber) {
  const newId = OLD_PHASE_TO_NEW_PHASE[oldPhaseNumber];
  return newId ? getCreationPhaseById(newId) : null;
}

/**
 * Resolves standard route for a phase given role and testId.
 * @param {string|number} phase
 * @param {string} testId
 * @param {'admin'|'faculty'} role
 * @returns {string|null}
 */
export function getPhaseRoute(phase, testId, role = 'admin') {
  if (!testId) return null;
  const base = role === 'faculty' ? `/faculty/tests/${testId}` : `/admin/tests/${testId}`;
  
  let phaseId = typeof phase === 'number' 
    ? (getCreationPhaseByNumber(phase)?.id || mapOldPhaseToNew(phase)?.id)
    : phase;

  switch (phaseId) {
    case 'foundation':
      return base;
    case 'structure':
      return `${base}/structure`;
    case 'content':
      return `${base}/content`;
    case 'rules':
      return `${base}/rules`;
    case 'generate':
      return `${base}/generate`;
    case 'review-publish':
      return `${base}/review`;
    default:
      return base;
  }
}

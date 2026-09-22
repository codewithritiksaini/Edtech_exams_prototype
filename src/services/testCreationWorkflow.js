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
    id: 'rules',
    number: 3,
    phaseNumber: 3,
    label: 'Rules',
    title: 'Rules',
    shortLabel: 'Rules',
    shortDesc: 'Blueprint + Scoring + Timing + Navigation',
    desc: 'Configure blueprint rules, scoring, timing, and candidate navigation.',
    description: 'Configure blueprint rules, scoring, timing, and candidate navigation.',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    capabilities: [
      'Question Blueprint & Subject Quotas',
      'Scoring, Negative Marking & Cutoff Thresholds',
      'Timing Modes (Per-Section vs Overall) & Break Rules',
      'Navigation Restrictions (Linear vs Free Jump)'
    ],
    subCapabilities: [
      'Question Blueprint & Subject Quotas',
      'Scoring, Negative Marking & Cutoff Thresholds',
      'Timing Modes (Per-Section vs Overall) & Break Rules',
      'Navigation Restrictions (Linear vs Free Jump)'
    ]
  },
  {
    id: 'build',
    number: 4,
    phaseNumber: 4,
    label: 'Content & Build',
    title: 'Content & Build',
    shortLabel: 'Content & Build',
    shortDesc: 'Manual Build + Upload + Blueprint Generation',
    desc: 'Author, upload, or generate the test question roster.',
    description: 'Author, upload, or generate the test question roster.',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    capabilities: [
      'Manual Question Authoring (Embedded Question Type)',
      'Document Upload (PDF / DOCX)',
      'Rules-Driven Blueprint Auto-Generation',
      'Unified Test Question Roster Management'
    ],
    subCapabilities: [
      'Manual Question Authoring (Embedded Question Type)',
      'Document Upload (PDF / DOCX)',
      'Rules-Driven Blueprint Auto-Generation',
      'Unified Test Question Roster Management'
    ]
  },
  {
    id: 'review-publish',
    number: 5,
    phaseNumber: 5,
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
  4: 'rules',
  5: 'rules',
  6: 'rules',
  7: 'rules',
  8: 'build',
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
 * Helper to retrieve phase definition by number (1 to 5).
 * @param {number} phaseNumber
 * @returns {object|null}
 */
export function getCreationPhaseByNumber(phaseNumber) {
  const num = Number(phaseNumber);
  return TEST_CREATION_PHASES.find(p => p.number === num) || null;
}

/**
 * Translates an old phase number to the new 5-phase definition.
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
    case 'rules':
      return `${base}/rules`;
    case 'build':
    case 'content':
    case 'generate':
      return `${base}/build`;
    case 'review-publish':
    case 'review':
      return `${base}/review`;
    default:
      return base;
  }
}

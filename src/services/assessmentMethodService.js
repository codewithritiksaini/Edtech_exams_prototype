// =============================================================================
// ASSESSMENT METHOD SERVICE — CANONICAL REGISTRY & VALIDATION
// Provides centralized constants, metadata, and validation helpers for the
// Phase 1 Foundation Assessment Method attribute across Admin & Faculty tests.
// =============================================================================

export const ASSESSMENT_METHODS = {
  THEORETICAL: 'THEORETICAL',
  ANALYTICAL: 'ANALYTICAL',
  CLINICAL: 'CLINICAL',
  CASE_SCENARIO: 'CASE_SCENARIO',
  INTERVIEW: 'INTERVIEW'
};

export const ASSESSMENT_METHOD_LIST = [
  {
    id: 'THEORETICAL',
    value: 'THEORETICAL',
    label: 'Theoretical Examination',
    shortLabel: 'Theoretical',
    description: 'Knowledge assessment evaluating theoretical concepts, foundational medical sciences, and core recall.',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    id: 'ANALYTICAL',
    value: 'ANALYTICAL',
    label: 'Analytical Examination',
    shortLabel: 'Analytical',
    description: 'Critical analysis examining diagnostic deductions, pathological correlations, and investigative data.',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    id: 'CLINICAL',
    value: 'CLINICAL',
    label: 'Clinical Examination',
    shortLabel: 'Clinical',
    description: 'Bedside and simulated patient management testing clinical judgment, triage, and therapeutic choices.',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    id: 'CASE_SCENARIO',
    value: 'CASE_SCENARIO',
    label: 'Case Scenario Examination',
    shortLabel: 'Case Scenario',
    description: 'Complex multi-step clinical vignette investigations evaluating longitudinal patient decision pathways.',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    id: 'INTERVIEW',
    value: 'INTERVIEW',
    label: 'Interview Examination',
    shortLabel: 'Interview',
    description: 'Structured viva voce, oral examination, and interactive panel evaluation of clinical competencies.',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200'
  }
];

export const VALID_ASSESSMENT_METHOD_IDS = Object.freeze(
  ASSESSMENT_METHOD_LIST.map(m => m.id)
);

/**
 * Returns the human-readable display label for an assessment method ID.
 * @param {string} methodId
 * @returns {string|null}
 */
export function getAssessmentMethodLabel(methodId) {
  if (!methodId) return null;
  const found = ASSESSMENT_METHOD_LIST.find(m => m.id === methodId || m.value === methodId);
  return found ? found.label : methodId;
}

/**
 * Returns the badge styling classes for an assessment method.
 * @param {string} methodId
 * @returns {string}
 */
export function getAssessmentMethodBadgeClass(methodId) {
  if (!methodId) return 'bg-slate-100 text-slate-700 border-slate-200';
  const found = ASSESSMENT_METHOD_LIST.find(m => m.id === methodId || m.value === methodId);
  return found?.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200';
}

/**
 * Validates whether a value is one of the 5 canonical assessment methods.
 * @param {string} methodId
 * @returns {boolean}
 */
export function isValidAssessmentMethod(methodId) {
  return VALID_ASSESSMENT_METHOD_IDS.includes(methodId);
}

/**
 * Formal validation returning error descriptors matching MedPrep Pro standards.
 * @param {string|null|undefined} methodId
 * @param {{ required?: boolean }} [options]
 * @returns {{ valid: boolean, errors: Array<{ field: string, code: string, message: string }> }}
 */
export function validateAssessmentMethod(methodId, { required = false } = {}) {
  const errors = [];

  if (!methodId || (typeof methodId === 'string' && !methodId.trim())) {
    if (required) {
      errors.push({
        field: 'assessmentMethod',
        code: 'REQUIRED_ASSESSMENT_METHOD',
        message: 'Select a valid assessment method.'
      });
      return { valid: false, errors };
    }
    return { valid: true, errors: [] };
  }

  if (!isValidAssessmentMethod(methodId)) {
    errors.push({
      field: 'assessmentMethod',
      code: 'INVALID_ASSESSMENT_METHOD',
      message: 'Select a valid assessment method.'
    });
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

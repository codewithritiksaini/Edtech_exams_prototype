// =============================================================================
// EXAM VALIDATION UTILITY — LIGHTWEIGHT PROTOTYPE VALIDATION
// Provides non-blocking, forgiving validation and duplicate ID detection.
// =============================================================================

/**
 * Validates an Assessment object structure.
 * @param {object} assessment
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateAssessment(assessment) {
  const errors = [];
  if (!assessment || typeof assessment !== 'object') {
    return { isValid: false, errors: ['Assessment must be a non-null object.'] };
  }
  if (!assessment.id || typeof assessment.id !== 'string') {
    errors.push('Assessment "id" is required and must be a string.');
  }
  if (!assessment.title || typeof assessment.title !== 'string') {
    errors.push('Assessment "title" is required and must be a non-empty string.');
  }
  if (typeof assessment.version !== 'number') {
    errors.push('Assessment "version" is required and must be a number.');
  }
  if (!assessment.activeVersionId || typeof assessment.activeVersionId !== 'string') {
    errors.push('Assessment "activeVersionId" is required and must be a string.');
  }
  if (assessment.versions && !Array.isArray(assessment.versions)) {
    errors.push('Assessment "versions" must be an array if defined.');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates an AssessmentVersion object structure.
 * @param {object} version
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateAssessmentVersion(version) {
  const errors = [];
  if (!version || typeof version !== 'object') {
    return { isValid: false, errors: ['AssessmentVersion must be a non-null object.'] };
  }
  if (!version.id || typeof version.id !== 'string') {
    errors.push('AssessmentVersion "id" is required and must be a string.');
  }
  if (!version.assessmentId || typeof version.assessmentId !== 'string') {
    errors.push('AssessmentVersion "assessmentId" is required and must be a string.');
  }
  if (typeof version.version !== 'number') {
    errors.push('AssessmentVersion "version" must be a number.');
  }
  if (!Array.isArray(version.sections)) {
    errors.push('AssessmentVersion "sections" is required and must be an array.');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates a Section object structure.
 * @param {object} section
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateSection(section) {
  const errors = [];
  if (!section || typeof section !== 'object') {
    return { isValid: false, errors: ['Section must be a non-null object.'] };
  }
  if (!section.id || typeof section.id !== 'string') {
    errors.push('Section "id" is required and must be a string.');
  }
  if (!section.title || typeof section.title !== 'string') {
    errors.push('Section "title" is required and must be a string.');
  }
  if (!Array.isArray(section.items)) {
    errors.push('Section "items" is required and must be an array.');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates a Question object structure.
 * @param {object} question
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateQuestion(question) {
  const errors = [];
  if (!question || typeof question !== 'object') {
    return { isValid: false, errors: ['Question must be a non-null object.'] };
  }
  if (!question.id) {
    errors.push('Question "id" is required.');
  }
  if (!question.type || typeof question.type !== 'string') {
    errors.push('Question "type" is required and must be a string.');
  }
  if (!question.content || typeof question.content !== 'object') {
    errors.push('Question "content" must be an object containing prompt text.');
  }
  if (!question.scoring || typeof question.scoring !== 'object') {
    errors.push('Question "scoring" must be an object containing marks.');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates a QuestionGroup object structure.
 * @param {object} group
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateQuestionGroup(group) {
  const errors = [];
  if (!group || typeof group !== 'object') {
    return { isValid: false, errors: ['QuestionGroup must be a non-null object.'] };
  }
  if (!group.id || typeof group.id !== 'string') {
    errors.push('QuestionGroup "id" is required and must be a string.');
  }
  if (!group.stimulusId || typeof group.stimulusId !== 'string') {
    errors.push('QuestionGroup "stimulusId" is required and must be a string.');
  }
  if (!Array.isArray(group.questionIds)) {
    errors.push('QuestionGroup "questionIds" is required and must be an array.');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates a Stimulus object structure.
 * @param {object} stimulus
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateStimulus(stimulus) {
  const errors = [];
  if (!stimulus || typeof stimulus !== 'object') {
    return { isValid: false, errors: ['Stimulus must be a non-null object.'] };
  }
  if (!stimulus.id || typeof stimulus.id !== 'string') {
    errors.push('Stimulus "id" is required and must be a string.');
  }
  if (!stimulus.type || typeof stimulus.type !== 'string') {
    errors.push('Stimulus "type" is required and must be a string.');
  }
  if (!stimulus.content || typeof stimulus.content !== 'object') {
    errors.push('Stimulus "content" is required and must be an object.');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Checks an array of items for duplicate IDs and logs developer warnings.
 * @param {Array<{id: string|number}>} items
 * @param {string} collectionName
 * @returns {string[]} List of duplicate IDs found
 */
export function detectDuplicateIds(items = [], collectionName = 'items') {
  if (!Array.isArray(items)) return [];
  const seen = new Set();
  const duplicates = new Set();

  for (const item of items) {
    if (item && item.id !== undefined && item.id !== null) {
      const key = String(item.id);
      if (seen.has(key)) {
        duplicates.add(key);
      } else {
        seen.add(key);
      }
    }
  }

  const dupList = Array.from(duplicates);
  if (dupList.length > 0) {
    console.warn(`[examValidation] Duplicate IDs detected in ${collectionName}:`, dupList);
  }
  return dupList;
}

// =============================================================================
// TEST READINESS SERVICE — PHASE 6 PRE-FLIGHT VALIDATION ENGINE
// Multi-layer validation combining Foundation, Structure, Content, Rules, and Build.
// Clearly separates blocking ERRORS (prevent publishing) from non-blocking WARNINGS.
// Provides direct actionable fix links for rapid resolution.
// =============================================================================

import { catalogService } from './catalogService.js';
import { questionTypeService, DEFAULT_TEST_ALLOWED_QUESTION_TYPES } from './questionTypeService.js';
import { questionService } from './questionService.js';

export const VALIDATION_PHASES = {
  FOUNDATION: 'foundation',
  STRUCTURE: 'structure',
  CONTENT: 'content',
  RULES: 'rules',
  BUILD: 'build'
};

export const READINESS_STATUS = {
  READY: 'READY',
  NOT_READY: 'NOT_READY'
};

class TestReadinessService {
  /**
   * Run comprehensive pre-flight validation across all 5 creation layers.
   * 
   * @param {object} test - Test entity to validate
   * @param {object|null} exam - Associated exam entity (optional, will resolve if not passed)
   * @param {object} options - Optional context { role: 'admin' | 'faculty' }
   * @returns {object} Structured validation result
   */
  validateTestForPublish(test, exam = null, options = {}) {
    if (!test) {
      return {
        ready: false,
        errorCount: 1,
        warningCount: 0,
        errors: [{
          code: 'TEST_NOT_FOUND',
          message: 'Test entity is null or undefined.',
          phase: VALIDATION_PHASES.FOUNDATION,
          link: '/admin/tests'
        }],
        warnings: [],
        sections: {
          foundation: { ready: false, errors: ['Test entity is null or undefined.'], warnings: [] },
          structure: { ready: false, errors: [], warnings: [] },
          content: { ready: false, errors: [], warnings: [] },
          rules: { ready: false, errors: [], warnings: [] },
          build: { ready: false, errors: [], warnings: [] }
        }
      };
    }

    const role = options.role || (test.facultyId ? 'faculty' : 'admin');
    const basePath = role === 'faculty' ? `/faculty/tests/${test.id}` : `/admin/tests/${test.id}`;

    // Resolve associated exam if not provided
    const resolvedExam = exam || (test.examId ? catalogService.getExamById(test.examId) : null);

    const errors = [];
    const warnings = [];

    const sectionResults = {
      foundation: { ready: true, errors: [], warnings: [] },
      structure: { ready: true, errors: [], warnings: [] },
      content: { ready: true, errors: [], warnings: [] },
      rules: { ready: true, errors: [], warnings: [] },
      build: { ready: true, errors: [], warnings: [] }
    };

    const addError = (phase, code, message, link) => {
      const errObj = { phase, code, message, link };
      errors.push(errObj);
      sectionResults[phase].errors.push(message);
      sectionResults[phase].ready = false;
    };

    const addWarning = (phase, code, message, link) => {
      const warnObj = { phase, code, message, link };
      warnings.push(warnObj);
      sectionResults[phase].warnings.push(message);
    };

    // =========================================================================
    // LAYER 1: FOUNDATION VALIDATION
    // =========================================================================
    // 1.1 Exam association
    if (!test.examId) {
      addError(
        VALIDATION_PHASES.FOUNDATION,
        'MISSING_EXAM_ID',
        'Test is not associated with an Exam track.',
        `${basePath}`
      );
    } else if (!resolvedExam) {
      addError(
        VALIDATION_PHASES.FOUNDATION,
        'INVALID_EXAM',
        `Associated Exam track "${test.examId}" was not found in the Exam Catalog.`,
        `${basePath}`
      );
    }

    // 1.2 Test Name
    if (!test.name || typeof test.name !== 'string' || !test.name.trim()) {
      addError(
        VALIDATION_PHASES.FOUNDATION,
        'MISSING_TEST_NAME',
        'Test name / title is required.',
        `${basePath}`
      );
    }

    // 1.3 Test Code
    if (!test.code || typeof test.code !== 'string' || !test.code.trim()) {
      addError(
        VALIDATION_PHASES.FOUNDATION,
        'MISSING_TEST_CODE',
        'Test code identifier is required.',
        `${basePath}`
      );
    }

    // 1.4 Test Type
    if (!test.testType) {
      addError(
        VALIDATION_PHASES.FOUNDATION,
        'MISSING_TEST_TYPE',
        'Test type (e.g., Full Mock, Subject Test) must be configured.',
        `${basePath}`
      );
    }

    // 1.5 Duration
    const duration = Number(test.durationMinutes || test.targetDuration || (test.scheduling?.durationMinutes) || 0);
    if (isNaN(duration) || duration <= 0) {
      addError(
        VALIDATION_PHASES.FOUNDATION,
        'INVALID_DURATION',
        'Test duration must be greater than 0 minutes.',
        `${basePath}`
      );
    }

    // 1.6 Warnings (Non-blocking)
    if (!test.description || !test.description.trim()) {
      addWarning(
        VALIDATION_PHASES.FOUNDATION,
        'EMPTY_DESCRIPTION',
        'Test description is empty. Providing a description improves student clarity.',
        `${basePath}`
      );
    }
    if (!test.instructions || (typeof test.instructions === 'string' && !test.instructions.trim())) {
      addWarning(
        VALIDATION_PHASES.FOUNDATION,
        'EMPTY_INSTRUCTIONS',
        'Pre-test candidate instructions are not defined.',
        `${basePath}`
      );
    }

    // =========================================================================
    // LAYER 2: STRUCTURE VALIDATION (Stage + Curriculum Scope + Test Structure)
    // =========================================================================
    // 2.1 Exam Pattern / Stage Selection (Step 1)
    if (!test.examPattern || !test.examPattern.stageId) {
      addError(
        VALIDATION_PHASES.STRUCTURE,
        'MISSING_STAGE',
        'Exam Stage / Pattern has not been selected in Step 1.',
        `${basePath}/structure`
      );
    }

    // 2.2 Curriculum Scope Selection (Step 2)
    const scopeSubjects = test.curriculumScope?.subjects;
    if (!Array.isArray(scopeSubjects) || scopeSubjects.length === 0) {
      addError(
        VALIDATION_PHASES.STRUCTURE,
        'MISSING_CURRICULUM_SCOPE',
        'Curriculum Scope (at least one Subject) must be defined in Step 2.',
        `${basePath}/structure`
      );
    }

    // 2.3 Structure Hierarchy (Step 3)
    const structure = test.structure;
    if (!structure) {
      addError(
        VALIDATION_PHASES.STRUCTURE,
        'MISSING_STRUCTURE',
        'Test structure has not been initialized in Step 3.',
        `${basePath}/structure`
      );
    } else {
      const sections = Array.isArray(structure.sections) ? structure.sections : [];
      const units = Array.isArray(structure.units) ? structure.units : [];
      if (sections.length === 0 && units.length === 0) {
        addError(
          VALIDATION_PHASES.STRUCTURE,
          'NO_SECTIONS_DEFINED',
          'At least one section must be configured in the test structure.',
          `${basePath}/structure`
        );
      } else {
        const itemsToValidate = sections.length > 0 ? sections : units;
        itemsToValidate.forEach((item, idx) => {
          if (!item.id) {
            addError(
              VALIDATION_PHASES.STRUCTURE,
              'INVALID_STRUCTURE_ID',
              `Structure item at position ${idx + 1} has an invalid or missing ID.`,
              `${basePath}/structure`
            );
          }
          if (!item.name && !item.title) {
            addError(
              VALIDATION_PHASES.STRUCTURE,
              'MISSING_STRUCTURE_NAME',
              `Structure item "${item.id || idx + 1}" is missing a descriptive name.`,
              `${basePath}/structure`
            );
          }
        });
      }
    }

    // =========================================================================
    // LAYER 3: RULES VALIDATION
    // =========================================================================
    const rules = test.rules || {};
    if (!rules.savedAt && !test.scoringAndTiming) {
      addWarning(
        VALIDATION_PHASES.RULES,
        'DEFAULT_RULES_IN_USE',
        'Test is using default scoring, timing, and navigation rules without explicit review.',
        `${basePath}/rules`
      );
    }

    // 3.1 Scoring rules
    const scoring = rules.scoring || { marksPerCorrect: test.marksPerCorrect || 4, marksPerIncorrect: test.marksPerIncorrect !== undefined ? test.marksPerIncorrect : -1 };
    const marksCorrect = scoring.marksPerCorrect ?? scoring.correct;
    if (marksCorrect !== undefined && Number(marksCorrect) <= 0) {
      addError(
        VALIDATION_PHASES.RULES,
        'INVALID_SCORING_MARKS',
        'Marks awarded for correct answers must be greater than 0.',
        `${basePath}/rules`
      );
    }
    const marksIncorrect = scoring.marksPerIncorrect ?? scoring.incorrect;
    if (marksIncorrect !== undefined && Number(marksIncorrect) > 0) {
      addWarning(
        VALIDATION_PHASES.RULES,
        'POSITIVE_NEGATIVE_MARK',
        'Negative marking is configured with a positive penalty value.',
        `${basePath}/rules`
      );
    }

    // 3.2 Navigation rules
    const navigation = rules.navigation;
    if (navigation && navigation.mode && !['FREE', 'LINEAR'].includes(navigation.mode)) {
      addError(
        VALIDATION_PHASES.RULES,
        'INVALID_NAVIGATION_MODE',
        `Unrecognized candidate navigation mode "${navigation.mode}".`,
        `${basePath}/rules`
      );
    }

    // =========================================================================
    // LAYER 4: CONTENT & BUILD VALIDATION
    // =========================================================================
    const questionIds = test.content?.questionIds || test.questionIds || [];
    const build = test.build || {};
    const actualCount = questionIds.length;

    if (!Array.isArray(questionIds) || actualCount === 0) {
      addError(
        VALIDATION_PHASES.BUILD,
        'NO_QUESTIONS_ATTACHED',
        'Test has no questions attached. Questions must be authored, uploaded, or generated from Blueprint.',
        `${basePath}/build`
      );
    } else {
      // 4.1 Check for duplicate question IDs
      const seenIds = new Set();
      const duplicateIds = [];
      questionIds.forEach(id => {
        const idStr = String(id);
        if (seenIds.has(idStr)) {
          duplicateIds.push(idStr);
        }
        seenIds.add(idStr);
      });

      if (duplicateIds.length > 0) {
        addError(
          VALIDATION_PHASES.BUILD,
          'DUPLICATE_QUESTION_IDS',
          `Duplicate question IDs detected in test roster: ${duplicateIds.join(', ')}.`,
          `${basePath}/build`
        );
      }

      // 4.2 Validate individual question entities and types
      const allPoolQuestions = questionService.getQuestions();
      const poolMap = new Map(allPoolQuestions.map(q => [String(q.id), q]));

      let missingQuestionsCount = 0;
      let invalidTypeCount = 0;

      questionIds.forEach(id => {
        const qObj = poolMap.get(String(id));
        if (!qObj) {
          missingQuestionsCount++;
        } else if (qObj.type && !questionTypeService.isValidQuestionTypeId(qObj.type)) {
          invalidTypeCount++;
        }
      });

      if (missingQuestionsCount > 0) {
        addWarning(
          VALIDATION_PHASES.BUILD,
          'QUESTIONS_NOT_RESOLVED',
          `${missingQuestionsCount} question ID(s) in the test roster could not be resolved from storage.`,
          `${basePath}/build`
        );
      }

      if (invalidTypeCount > 0) {
        addError(
          VALIDATION_PHASES.BUILD,
          'INVALID_QUESTION_TYPE',
          `${invalidTypeCount} question(s) specify unrecognized platform question types.`,
          `${basePath}/build`
        );
      }

      // 4.3 Check target question count if configured
      const targetCount = Number(test.targetQuestions || rules.blueprint?.totalQuestions || 0);
      if (targetCount > 0 && actualCount !== targetCount) {
        addWarning(
          VALIDATION_PHASES.BUILD,
          'QUESTION_COUNT_TARGET_MISMATCH',
          `Assembled question count (${actualCount}) differs from target standard (${targetCount}).`,
          `${basePath}/build`
        );
      }

      if (!build || !build.mode) {
        addWarning(
          VALIDATION_PHASES.BUILD,
          'UNRECORDED_BUILD_MODE',
          'Question set was assembled without recording a formal build mode (Manual or Blueprint).',
          `${basePath}/build`
        );
      }
    }

    const isReady = errors.length === 0;

    return {
      ready: isReady,
      status: isReady ? READINESS_STATUS.READY : READINESS_STATUS.NOT_READY,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors,
      warnings,
      sections: sectionResults
    };
  }

  /**
   * Quick boolean gate check: is this test publishable?
   */
  isTestPublishable(test, exam = null, options = {}) {
    const result = this.validateTestForPublish(test, exam, options);
    return result.ready === true;
  }

  /**
   * Get formatted readiness report for UI consumption.
   */
  getTestReadiness(test, exam = null, options = {}) {
    return this.validateTestForPublish(test, exam, options);
  }
}

export const testReadinessService = new TestReadinessService();

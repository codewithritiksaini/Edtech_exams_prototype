// =============================================================================
// TEST BUILD SERVICE — PHASE 5 GENERATE / BUILD
// Orchestrates Manual and Blueprint Test Question Set Assembly
//
// Core responsibility:
//   Structure + Content + Rules -> Generate / Build -> Ordered Test Question Set
//
// Canonical storage:
//   test.content.questionIds = ['q-01', 'q-02', ...]
//   test.build = { mode, generatedAt, generatedBy, source }
// =============================================================================

import { questionBankService } from './questionBankService.js';
import { questionService } from './questionService.js';
import { questionTypeService } from './questionTypeService.js';
import { adminTestService } from './adminTestService.js';
import { cbtTestService } from './cbtTestService.js';
import { BLUEPRINT_MODES, createDefaultBlueprint } from './testRulesService.js';

// -----------------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------------

export const BUILD_MODES = {
  MANUAL: 'MANUAL',
  BLUEPRINT: 'BLUEPRINT'
};

export const BUILD_STATUS = {
  NOT_BUILT: 'NOT_BUILT',
  READY_TO_BUILD: 'READY_TO_BUILD',
  BUILT: 'BUILT',
  BUILD_FAILED: 'BUILD_FAILED'
};

// -----------------------------------------------------------------------------
// DETERMINISTIC BLUEPRINT GENERATOR
// -----------------------------------------------------------------------------

/**
 * Pure, isolated generator function that constructs a candidate question set
 * satisfying the test's blueprint rules, or reports structured shortfall errors.
 *
 * @param {object} params
 * @param {object} params.test - The test entity
 * @param {Array<object>} [params.questions] - Pre-fetched eligible questions (optional)
 * @param {object} [params.blueprint] - Custom or test.rules.blueprint (optional)
 * @param {'admin'|'faculty'} [params.role] - User role
 * @param {object|null} [params.requestingFaculty] - Current faculty profile
 * @returns {{ success: boolean, questionIds?: string[], totalQuestions?: number, distribution?: object, errors?: object[], warnings?: string[] }}
 */
export function generateQuestionsFromBlueprint({
  test,
  questions = null,
  blueprint = null,
  role = 'admin',
  requestingFaculty = null
}) {
  if (!test) {
    return {
      success: false,
      errors: [{ code: 'TEST_REQUIRED', message: 'Test configuration is required for generation.' }],
      warnings: [],
      questionIds: []
    };
  }

  // 1. Resolve Blueprint
  const activeBlueprint = blueprint || test.rules?.blueprint || createDefaultBlueprint(test);
  const mode = activeBlueprint.mode || BLUEPRINT_MODES.WEIGHTED;

  // 2. Resolve Target Total Questions
  const totalTarget = Number(test.targetQuestions) || Number(test.totalQuestions) || 20;

  // 3. Resolve Eligible Questions (All, Exam-scoped, Type-compatible, RBAC-checked)
  const candidatePool = questions || questionBankService.getAvailableQuestionsForTest(
    test,
    {},
    role,
    requestingFaculty
  );

  // Filter strictly to compatible & published items
  const eligibleQuestions = candidatePool.filter(q => {
    if (q.isCompatible === false) return false;
    const status = (q.status || 'published').toLowerCase();
    return status !== 'archived';
  });

  // Sort deterministically by ID so repeated runs on same pool yield identical selection
  const sortedPool = [...eligibleQuestions].sort((a, b) => String(a.id).localeCompare(String(b.id)));

  const errors = [];
  const warnings = [];

  // 4. Calculate Inventory by Subject and Difficulty
  const subjectMap = new Map(); // subjectName -> [questions]
  const difficultyMap = {
    easy: [],
    medium: [],
    hard: []
  };

  sortedPool.forEach(q => {
    const subj = (q.metadata?.subject || 'General').trim();
    if (!subjectMap.has(subj)) {
      subjectMap.set(subj, []);
    }
    subjectMap.get(subj).push(q);

    const diff = (q.metadata?.difficulty || 'medium').toLowerCase();
    if (difficultyMap[diff]) {
      difficultyMap[diff].push(q);
    } else {
      difficultyMap.medium.push(q);
    }
  });

  // 5. Evaluate Subject Requirements (Shortfall Detection)
  const subjectDist = activeBlueprint.subjectDistribution || [];
  const requiredSubjectCounts = new Map();

  subjectDist.forEach(s => {
    const targetCount = Number(s.targetCount) || 0;
    if (targetCount > 0) {
      const name = (s.subjectName || s.subjectId || '').trim();
      requiredSubjectCounts.set(name, targetCount);

      // Check available
      let availableCount = 0;
      for (const [subjName, qList] of subjectMap.entries()) {
        if (subjName.toLowerCase() === name.toLowerCase() ||
            subjName.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(subjName.toLowerCase())) {
          availableCount += qList.length;
        }
      }

      if (availableCount < targetCount) {
        errors.push({
          code: 'INSUFFICIENT_QUESTIONS',
          dimension: 'SUBJECT',
          targetId: s.subjectId || name,
          targetName: name,
          required: targetCount,
          available: availableCount,
          shortfall: targetCount - availableCount,
          message: `Insufficient questions for subject "${name}": Required ${targetCount}, available ${availableCount} (Shortfall: ${targetCount - availableCount}).`
        });
      }
    }
  });

  // 6. Overall Target Shortfall Check
  const totalSubjectRequired = Array.from(requiredSubjectCounts.values()).reduce((a, b) => a + b, 0);
  const effectiveTarget = Math.max(totalTarget, totalSubjectRequired);

  if (sortedPool.length < effectiveTarget) {
    errors.push({
      code: 'INSUFFICIENT_QUESTIONS',
      dimension: 'TOTAL',
      targetId: 'total_questions',
      targetName: 'Total Questions',
      required: effectiveTarget,
      available: sortedPool.length,
      shortfall: effectiveTarget - sortedPool.length,
      message: `Total eligible questions (${sortedPool.length}) is less than required target (${effectiveTarget}). Shortfall: ${effectiveTarget - sortedPool.length}.`
    });
  }

  // If there are blocking shortfall errors, return early without generating
  if (errors.length > 0) {
    return {
      success: false,
      errors,
      warnings,
      questionIds: []
    };
  }

  // Seed with already attached questions in canonical roster if any (deficit fulfillment)
  const existingRosterIds = (test.content?.questionIds || []).map(String);
  existingRosterIds.forEach(id => {
    const q = sortedPool.find(item => String(item.id) === id) || questionService.getQuestionById(id);
    if (q && !selectedSet.has(String(q.id))) {
      selectedSet.add(String(q.id));
      selectedQuestions.push(q);
    }
  });

  // A. Fulfill explicit subject distribution targets
  for (const [subjName, targetCount] of requiredSubjectCounts.entries()) {
    let currentInSubject = selectedQuestions.filter(q => {
      const qs = (q.metadata?.subject || '').trim().toLowerCase();
      return qs === subjName.toLowerCase() || qs.includes(subjName.toLowerCase()) || subjName.toLowerCase().includes(qs);
    }).length;

    for (const q of sortedPool) {
      if (currentInSubject >= targetCount || selectedQuestions.length >= effectiveTarget) break;
      if (selectedSet.has(String(q.id))) continue;

      const qSubj = (q.metadata?.subject || '').trim().toLowerCase();
      if (qSubj === subjName.toLowerCase() || qSubj.includes(subjName.toLowerCase()) || subjName.toLowerCase().includes(qSubj)) {
        selectedSet.add(String(q.id));
        selectedQuestions.push(q);
        currentInSubject++;
      }
    }
  }

  // B. Fulfill remaining quota towards effectiveTarget without difficulty weighting
  for (const q of sortedPool) {
    if (selectedQuestions.length >= effectiveTarget) break;
    if (!selectedSet.has(String(q.id))) {
      selectedSet.add(String(q.id));
      selectedQuestions.push(q);
    }
  }

  // 8. Enforce Strict Duplicate Prevention
  const finalQuestionIds = selectedQuestions.map(q => String(q.id));
  if (new Set(finalQuestionIds).size !== finalQuestionIds.length) {
    return {
      success: false,
      errors: [{
        code: 'DUPLICATE_QUESTIONS_DETECTED',
        message: 'Generation failed safely: duplicate question IDs were detected in the generated candidate set.'
      }],
      warnings: [],
      questionIds: []
    };
  }

  // 9. Compute Result Distribution Breakdown
  const distribution = {
    subjects: {},
    questionTypes: {},
    difficulties: { easy: 0, medium: 0, hard: 0 }
  };

  selectedQuestions.forEach(q => {
    // Subject
    const s = q.metadata?.subject || 'General';
    distribution.subjects[s] = (distribution.subjects[s] || 0) + 1;

    // Type
    const t = questionTypeService.normalizeQuestionTypeId(q.type) || q.type || 'single_choice';
    distribution.questionTypes[t] = (distribution.questionTypes[t] || 0) + 1;

    // Difficulty
    const d = (q.metadata?.difficulty || 'medium').toLowerCase();
    if (distribution.difficulties[d] !== undefined) {
      distribution.difficulties[d]++;
    } else {
      distribution.difficulties.medium++;
    }
  });

  if (totalTarget && finalQuestionIds.length !== totalTarget) {
    warnings.push(`Generated question count (${finalQuestionIds.length}) differs from configured target (${totalTarget}).`);
  }

  return {
    success: true,
    questionIds: finalQuestionIds,
    totalQuestions: finalQuestionIds.length,
    distribution,
    warnings
  };
}

// -----------------------------------------------------------------------------
// TEST BUILD SERVICE
// -----------------------------------------------------------------------------

class TestBuildService {
  /**
   * Returns current build state for a test.
   */
  getBuildState(test, role = 'admin', requestingFaculty = null) {
    if (!test) {
      return {
        status: BUILD_STATUS.NOT_BUILT,
        mode: null,
        questionCount: 0,
        targetQuestions: 0,
        isReady: false,
        lastGeneratedAt: null,
        source: null
      };
    }

    const currentQIds = Array.isArray(test.content?.questionIds)
      ? test.content.questionIds
      : (Array.isArray(test.questionIds) ? test.questionIds : []);

    const count = currentQIds.length;
    const target = Number(test.targetQuestions) || Number(test.totalQuestions) || 0;
    const isBuilt = count > 0;
    const mode = test.build?.mode || (isBuilt ? BUILD_MODES.MANUAL : null);

    return {
      status: isBuilt ? BUILD_STATUS.BUILT : BUILD_STATUS.READY_TO_BUILD,
      mode,
      questionCount: count,
      targetQuestions: target,
      isReady: isBuilt,
      lastGeneratedAt: test.build?.generatedAt || null,
      generatedBy: test.build?.generatedBy || null,
      source: test.build?.source || (isBuilt ? 'QUESTION_BANK' : null)
    };
  }

  /**
   * Retrieves eligible questions matching test scope.
   */
  getEligibleQuestions(test, role = 'admin', requestingFaculty = null, filters = {}) {
    return questionBankService.getAvailableQuestionsForTest(test, filters, role, requestingFaculty);
  }

  /**
   * Generates candidate question set from blueprint.
   */
  generateFromBlueprint(test, options = {}, role = 'admin', requestingFaculty = null) {
    return generateQuestionsFromBlueprint({
      test,
      blueprint: options.blueprint || test.rules?.blueprint,
      questions: options.questions,
      role,
      requestingFaculty
    });
  }

  /**
   * Validates a candidate question set against test constraints.
   */
  validateBuild(test, candidateQuestionIds = [], role = 'admin', requestingFaculty = null) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(candidateQuestionIds) || candidateQuestionIds.length === 0) {
      errors.push('No questions in candidate set.');
      return { valid: false, errors, warnings, stats: { totalQuestions: 0 } };
    }

    // Duplicate check
    const seen = new Set();
    for (const id of candidateQuestionIds) {
      const sId = String(id);
      if (seen.has(sId)) {
        errors.push(`Duplicate question ID "${sId}" detected.`);
      }
      seen.add(sId);
    }

    // Verify each question exists and is compatible
    const testAllowedTypes = test.questionTypeConfig?.allowedTypes || [];
    let validCount = 0;
    const stats = {
      totalQuestions: candidateQuestionIds.length,
      bySubject: {},
      byType: {},
      byDifficulty: { easy: 0, medium: 0, hard: 0 }
    };

    for (const id of candidateQuestionIds) {
      const q = questionService.getQuestionById(id);
      if (!q) {
        errors.push(`Question ID "${id}" does not exist in Question Bank.`);
      } else {
        validCount++;
        // Compatibility check
        if (testAllowedTypes.length > 0) {
          const typeCheck = questionBankService.checkQuestionTypeCompatibility(q, testAllowedTypes);
          if (!typeCheck.compatible) {
            warnings.push(`Question "${id}" (${q.type}) is not in allowed question types.`);
          }
        }

        // Stats
        const sub = q.metadata?.subject || 'General';
        stats.bySubject[sub] = (stats.bySubject[sub] || 0) + 1;

        const typ = questionTypeService.normalizeQuestionTypeId(q.type) || q.type || 'single_choice';
        stats.byType[typ] = (stats.byType[typ] || 0) + 1;

        const diff = (q.metadata?.difficulty || 'medium').toLowerCase();
        if (stats.byDifficulty[diff] !== undefined) stats.byDifficulty[diff]++;
        else stats.byDifficulty.medium++;
      }
    }

    const target = Number(test.targetQuestions) || Number(test.totalQuestions) || 0;
    if (target > 0 && candidateQuestionIds.length !== target) {
      warnings.push(`Candidate questions count (${candidateQuestionIds.length}) differs from target count (${target}).`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      stats
    };
  }

  /**
   * Previews candidate build summary with question objects and distribution metrics.
   */
  previewBuild(test, candidateQuestionIds = [], role = 'admin', requestingFaculty = null) {
    const validation = this.validateBuild(test, candidateQuestionIds, role, requestingFaculty);
    const questions = questionService.getQuestionsByIds(candidateQuestionIds);

    return {
      testId: test.id,
      testName: test.name,
      totalQuestions: candidateQuestionIds.length,
      targetQuestions: test.targetQuestions || test.totalQuestions || 0,
      validation,
      questions,
      stats: validation.stats
    };
  }

  /**
   * Commits the candidate question set to the test entity and updates build metadata.
   */
  applyBuild(testId, candidateQuestionIds = [], buildMeta = {}, role = 'admin', requestingFaculty = null) {
    if (!Array.isArray(candidateQuestionIds) || candidateQuestionIds.length === 0) {
      throw new Error('Cannot apply build with empty question set.');
    }

    // Verify duplicate-free
    if (new Set(candidateQuestionIds).size !== candidateQuestionIds.length) {
      throw new Error('Cannot apply build: duplicate question IDs detected.');
    }

    const mode = buildMeta.mode || BUILD_MODES.BLUEPRINT;
    const finalMeta = {
      mode,
      generatedAt: new Date().toISOString(),
      generatedBy: buildMeta.generatedBy || (role === 'faculty' ? (requestingFaculty?.name || 'Faculty') : 'Admin'),
      source: buildMeta.source || mode
    };

    if (role === 'faculty') {
      return cbtTestService.applyFacultyTestBuild(testId, candidateQuestionIds, finalMeta, requestingFaculty);
    } else {
      return adminTestService.applyAdminTestBuild(testId, candidateQuestionIds, finalMeta);
    }
  }

  /**
   * Assembles a test manually and marks build mode as MANUAL.
   */
  buildManually(testId, questionIds = [], role = 'admin', requestingFaculty = null) {
    const meta = {
      mode: BUILD_MODES.MANUAL,
      generatedAt: null,
      generatedBy: role === 'faculty' ? (requestingFaculty?.name || 'Faculty') : 'Admin',
      source: 'QUESTION_BANK'
    };

    if (role === 'faculty') {
      return cbtTestService.applyFacultyTestBuild(testId, questionIds, meta, requestingFaculty);
    } else {
      return adminTestService.applyAdminTestBuild(testId, questionIds, meta);
    }
  }

  /**
   * Clears questions from test and resets build metadata.
   */
  clearBuild(testId, role = 'admin', requestingFaculty = null) {
    const meta = {
      mode: null,
      generatedAt: null,
      generatedBy: null,
      source: null
    };

    if (role === 'faculty') {
      return cbtTestService.applyFacultyTestBuild(testId, [], meta, requestingFaculty);
    } else {
      return adminTestService.applyAdminTestBuild(testId, [], meta);
    }
  }
}

export const testBuildService = new TestBuildService();

// =============================================================================
// EXAM PATTERN HELPER — READ-ONLY NORMALIZATION & STRUCTURE VALIDATION
// Normalizes existing Exam data (catalogService & curriculumService) into
// structured context for the Test Structure Builder.
// Does NOT modify or duplicate the Exam catalog.
// =============================================================================

import { catalogService } from './catalogService.js';
import { curriculumService } from './curriculumService.js';
import { 
  questionTypeService, 
  QUESTION_TYPE_INHERITANCE_MODES, 
  DEFAULT_SECTION_QUESTION_TYPE_CONFIG 
} from './questionTypeService.js';

export const STRUCTURE_MODES = {
  SINGLE_UNIT: 'SINGLE_UNIT',
  MULTI_UNIT: 'MULTI_UNIT'
};

export const UNIT_TYPES = {
  SECTION: 'SECTION',
  BLOCK: 'BLOCK',
  PHASE: 'PHASE'
};

export const STRUCTURE_ITEM_TYPES = {
  PHASE: 'PHASE',
  SECTION: 'SECTION',
  BLOCK: 'BLOCK'
};

export const EXAM_MAPPING_TYPES = {
  EXAM_STAGE: 'EXAM_STAGE',
  SUBJECT: 'SUBJECT',
  CURRICULUM_UNIT: 'CURRICULUM_UNIT'
};

/**
 * Normalizes an Exam's pattern and curriculum context from catalogService & curriculumService.
 * @param {string} examId
 * @returns {object|null}
 */
export function getExamPattern(examId) {
  if (!examId) return null;

  const exam = catalogService.getExamById(examId);
  if (!exam) return null;

  const patternId = `pattern-${exam.id}`;

  // 1. Fetch Curriculum Subjects from curriculumService
  const rawSubjects = curriculumService.getSubjects(exam.id) || [];
  const subjects = rawSubjects.map((s, idx) => ({
    id: s.id,
    name: s.name,
    code: s.code || `SUB-${s.id.slice(-4).toUpperCase()}`,
    description: s.description || '',
    order: s.order !== undefined ? s.order : idx,
    assignedFacultyName: s.assignedFacultyName || null,
    status: s.status || 'Active'
  }));

  const allSubjectIds = subjects.map(s => s.id);

  // 2. Derive Stages from existing exam fields (step1, step2, finalStep, examStructure)
  const stages = [];
  if (exam.step1) {
    let stage1SubjectIds = allSubjectIds;
    if (exam.id === 'neet-pg') {
      const preClinical = subjects.filter(s => s.id === 'sub-neet-patho' || s.id === 'sub-neet-pharma').map(s => s.id);
      if (preClinical.length > 0) stage1SubjectIds = preClinical;
    }
    stages.push({
      id: `${exam.id}-stage-step1`,
      patternId,
      name: 'Stage 1: ' + (exam.step1.includes(':') ? exam.step1.split(':')[0].trim() : 'Step 1'),
      description: exam.step1,
      order: 0,
      subjectIds: stage1SubjectIds
    });
  }
  if (exam.step2) {
    let stage2SubjectIds = allSubjectIds;
    if (exam.id === 'neet-pg') {
      const clinical = subjects.filter(s => s.id !== 'sub-neet-patho' && s.id !== 'sub-neet-pharma').map(s => s.id);
      if (clinical.length > 0) stage2SubjectIds = clinical;
    }
    stages.push({
      id: `${exam.id}-stage-step2`,
      patternId,
      name: 'Stage 2: ' + (exam.step2.includes(':') ? exam.step2.split(':')[0].trim() : 'Step 2'),
      description: exam.step2,
      order: 1,
      subjectIds: stage2SubjectIds
    });
  }
  if (exam.finalStep) {
    stages.push({
      id: `${exam.id}-stage-final`,
      patternId,
      name: 'Final Stage: ' + (exam.finalStep.includes(':') ? exam.finalStep.split(':')[0].trim() : 'Licensing / Allocation'),
      description: exam.finalStep,
      order: 2,
      subjectIds: allSubjectIds
    });
  }

  // Fallback single stage if no discrete step attributes exist
  if (stages.length === 0 && exam.examStructure) {
    stages.push({
      id: `${exam.id}-stage-main`,
      patternId,
      name: `${exam.name} Core Pattern`,
      description: exam.examStructure,
      order: 0,
      subjectIds: allSubjectIds
    });
  }

  // 3. Fetch Curriculum Modules (Units)
  const curriculumUnits = [];
  subjects.forEach(sub => {
    if (typeof curriculumService.getModules === 'function') {
      const subModules = curriculumService.getModules(sub.id) || [];
      subModules.forEach((m, mIdx) => {
        curriculumUnits.push({
          id: m.id,
          subjectId: sub.id,
          subjectName: sub.name,
          name: m.title || m.name,
          moduleNumber: m.moduleNumber || mIdx + 1,
          description: m.description || '',
          order: mIdx
        });
      });
    }
  });

  return {
    patternId,
    exam: {
      id: exam.id,
      name: exam.name,
      code: exam.code || exam.id.toUpperCase(),
      fullName: exam.fullName || exam.name,
      examStructure: exam.examStructure || '',
      country: exam.country || '',
      authority: exam.authority || '',
      stagesCount: exam.stages || stages.length
    },
    stages,
    subjects,
    curriculumUnits,
    capabilities: {
      hasStages: stages.length > 0,
      hasCurriculum: subjects.length > 0,
      hasModules: curriculumUnits.length > 0
    }
  };
}

export const DEFAULT_UNIT_CONFIGURATION = {
  enabled: true,
  subjectIds: [],
  instructions: '',
  questionCount: null,
  required: true,
  randomizeQuestions: false,
  randomizeOptions: false,
  questionTypes: [],
  questionTypeConfig: {
    mode: QUESTION_TYPE_INHERITANCE_MODES.INHERIT,
    allowedTypes: []
  },
  notes: ''
};

/**
 * Normalizes a unit's configuration safely against default values.
 * @param {object} rawConfig
 * @returns {object}
 */
export function normalizeUnitConfiguration(rawConfig = {}) {
  if (!rawConfig || typeof rawConfig !== 'object') {
    return { 
      ...DEFAULT_UNIT_CONFIGURATION,
      questionTypes: [],
      questionTypeConfig: {
        mode: QUESTION_TYPE_INHERITANCE_MODES.INHERIT,
        allowedTypes: []
      }
    };
  }

  // Parse questionTypes and questionTypeConfig
  const rawQtConfig = rawConfig.questionTypeConfig;
  const rawQTypes = rawConfig.questionTypes;
  let mode = QUESTION_TYPE_INHERITANCE_MODES.INHERIT;
  let allowedTypes = [];

  if (rawQtConfig && typeof rawQtConfig === 'object') {
    mode = rawQtConfig.mode === QUESTION_TYPE_INHERITANCE_MODES.EXPLICIT 
      ? QUESTION_TYPE_INHERITANCE_MODES.EXPLICIT 
      : QUESTION_TYPE_INHERITANCE_MODES.INHERIT;
    allowedTypes = Array.isArray(rawQtConfig.allowedTypes) ? [...rawQtConfig.allowedTypes] : [];
  } else if (Array.isArray(rawQTypes) && rawQTypes.length > 0) {
    mode = QUESTION_TYPE_INHERITANCE_MODES.EXPLICIT;
    allowedTypes = [...rawQTypes];
  }

  return {
    enabled: typeof rawConfig.enabled === 'boolean' ? rawConfig.enabled : true,
    subjectIds: Array.isArray(rawConfig.subjectIds) ? [...rawConfig.subjectIds] : [],
    instructions: typeof rawConfig.instructions === 'string' ? rawConfig.instructions : '',
    questionCount: rawConfig.questionCount !== undefined && rawConfig.questionCount !== null && rawConfig.questionCount !== ''
      ? (typeof rawConfig.questionCount === 'number' && !isNaN(rawConfig.questionCount)
          ? rawConfig.questionCount
          : (typeof rawConfig.questionCount === 'string' && !isNaN(Number(rawConfig.questionCount)) && rawConfig.questionCount.trim() !== ''
              ? Number(rawConfig.questionCount)
              : rawConfig.questionCount))
      : null,
    required: typeof rawConfig.required === 'boolean' ? rawConfig.required : true,
    randomizeQuestions: typeof rawConfig.randomizeQuestions === 'boolean' ? rawConfig.randomizeQuestions : false,
    randomizeOptions: typeof rawConfig.randomizeOptions === 'boolean' ? rawConfig.randomizeOptions : false,
    questionTypes: allowedTypes,
    questionTypeConfig: {
      mode,
      allowedTypes
    },
    notes: typeof rawConfig.notes === 'string' ? rawConfig.notes : ''
  };
}

/**
 * Validates a single unit's configuration object.
 * @param {object} configuration
 * @param {string} testExamId
 * @param {Array<string>|null} allowedSubjectIds
 * @returns {{ valid: boolean, errors: Array<{ code: string, message: string }>, warnings: Array<{ code: string, message: string }> }}
 */
export function validateUnitConfiguration(configuration, testExamId, allowedSubjectIds = null, testAllowedQuestionTypes = null) {
  const errors = [];
  const warnings = [];

  if (!configuration || typeof configuration !== 'object') {
    return {
      valid: false,
      errors: [{ code: 'INVALID_CONFIGURATION', message: 'Unit configuration must be a valid object.' }],
      warnings
    };
  }

  // 1. Validate subjectIds
  if (configuration.subjectIds !== undefined) {
    if (!Array.isArray(configuration.subjectIds)) {
      errors.push({
        code: 'INVALID_SUBJECT',
        message: 'Unit configuration "subjectIds" must be an array.'
      });
    } else {
      const examPattern = testExamId ? getExamPattern(testExamId) : null;
      const validSubjectIds = new Set(examPattern?.subjects?.map(s => s.id) || []);

      configuration.subjectIds.forEach(subId => {
        if (!subId || typeof subId !== 'string' || !subId.trim()) {
          errors.push({
            code: 'INVALID_SUBJECT',
            message: 'Subject ID must be a non-empty string.'
          });
          return;
        }

        // Cross-exam check
        if (examPattern && !validSubjectIds.has(subId)) {
          errors.push({
            code: 'SUBJECT_EXAM_MISMATCH',
            message: `Subject "${subId}" does not belong to the selected exam "${testExamId}".`
          });
        }

        // Faculty authorization check
        if (allowedSubjectIds && Array.isArray(allowedSubjectIds) && !allowedSubjectIds.includes('all')) {
          if (!allowedSubjectIds.includes(subId)) {
            errors.push({
              code: 'UNAUTHORIZED_SUBJECT',
              message: `Subject "${subId}" is not in the authorized faculty subject scope.`
            });
          }
        }
      });
    }
  }

  // 2. Validate questionCount
  if (configuration.questionCount !== null && configuration.questionCount !== undefined && configuration.questionCount !== '') {
    const qCount = Number(configuration.questionCount);
    if (typeof configuration.questionCount !== 'number' || isNaN(qCount) || !Number.isInteger(qCount) || qCount <= 0) {
      errors.push({
        code: 'INVALID_QUESTION_COUNT',
        message: `Planned question count must be a positive integer (> 0). Received "${configuration.questionCount}".`
      });
    }
  } else {
    warnings.push({
      code: 'UNCONFIGURED_QUESTION_COUNT',
      message: 'Planned question count is not configured yet.'
    });
  }

  // 3. Validate Randomization Flags
  if (configuration.randomizeQuestions !== undefined && typeof configuration.randomizeQuestions !== 'boolean') {
    errors.push({
      code: 'INVALID_RANDOMIZATION_VALUE',
      message: 'randomizeQuestions must be a boolean value.'
    });
  }
  if (configuration.randomizeOptions !== undefined && typeof configuration.randomizeOptions !== 'boolean') {
    errors.push({
      code: 'INVALID_RANDOMIZATION_VALUE',
      message: 'randomizeOptions must be a boolean value.'
    });
  }

  // 4. Validate Question Types (Phase 4)
  if (configuration.questionTypeConfig || configuration.questionTypes) {
    const rawQt = configuration.questionTypeConfig;
    const sectionQtConfig = (rawQt && typeof rawQt === 'object')
      ? rawQt
      : {
          mode: Array.isArray(configuration.questionTypes) && configuration.questionTypes.length > 0 
            ? QUESTION_TYPE_INHERITANCE_MODES.EXPLICIT 
            : QUESTION_TYPE_INHERITANCE_MODES.INHERIT,
          allowedTypes: configuration.questionTypes || []
        };

    const qtRes = questionTypeService.validateSectionQuestionTypeConfig(
      sectionQtConfig,
      testAllowedQuestionTypes || [],
      configuration.name || 'Unit'
    );

    if (!qtRes.valid) {
      qtRes.errors.forEach(err => errors.push(err));
    }
    if (qtRes.warnings && qtRes.warnings.length > 0) {
      qtRes.warnings.forEach(w => warnings.push(w));
    }
  }

  // Warnings check for unassigned subjects
  if (!configuration.subjectIds || configuration.subjectIds.length === 0) {
    warnings.push({
      code: 'UNCONFIGURED_SUBJECTS',
      message: 'No subjects assigned to this unit.'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Creates a normalized default structure for a Test.
 * Safe fallback for legacy tests or fresh test creation.
 * @param {object} test
 * @returns {object}
 */
export function createDefaultTestStructure(test = {}) {
  const isBlock = test.testType === 'BLOCK_TEST';
  const unitId = `sec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const defaultSection = {
    id: unitId,
    type: isBlock ? UNIT_TYPES.BLOCK : UNIT_TYPES.SECTION,
    phaseId: null,
    name: isBlock ? 'Main Block' : 'Main Section',
    code: isBlock ? 'BLK-1' : 'SEC-1',
    order: 0,
    description: 'Primary assessment container',
    curriculumScope: {
      subjectIds: [],
      chapterIds: []
    },
    configuration: {
      ...DEFAULT_UNIT_CONFIGURATION
    },
    blocks: []
  };

  return {
    mode: STRUCTURE_MODES.SINGLE_UNIT,
    unitType: isBlock ? UNIT_TYPES.BLOCK : UNIT_TYPES.SECTION,
    phases: [],
    sections: [defaultSection],
    units: [
      {
        id: unitId,
        type: isBlock ? UNIT_TYPES.BLOCK : UNIT_TYPES.SECTION,
        name: isBlock ? 'Main Block' : 'Main Section',
        code: isBlock ? 'BLK-1' : 'SEC-1',
        order: 0,
        description: 'Primary assessment container',
        examMapping: {
          type: null,
          id: null
        },
        curriculumScope: {
          subjectIds: [],
          chapterIds: []
        },
        configuration: {
          ...DEFAULT_UNIT_CONFIGURATION
        }
      }
    ]
  };
}

/**
 * Generates a stable unique structure unit ID.
 * @param {string} prefix - Optional prefix ('phase', 'sec', 'blk')
 * @returns {string}
 */
export function generateUnitId(prefix = 'unit') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

/**
 * Centralized structural validation engine.
 * @param {object} structure - The candidate structure to validate
 * @param {string} testExamId - The parent test's examId
 * @param {Array<string>|null} allowedSubjectIds - Optional faculty assigned subject IDs
 * @returns {{ valid: boolean, errors: Array<{ code: string, unitId?: string, message: string }>, warnings: string[] }}
 */
export function validateStructure(structure, testExamId, allowedSubjectIds = null, testAllowedQuestionTypes = null) {
  const errors = [];
  const warnings = [];

  if (!structure || typeof structure !== 'object') {
    return {
      valid: false,
      errors: [{ code: 'NO_STRUCTURE', message: 'Test structure object is missing or null.' }],
      warnings
    };
  }

  // 1. Validate Mode
  if (![STRUCTURE_MODES.SINGLE_UNIT, STRUCTURE_MODES.MULTI_UNIT].includes(structure.mode)) {
    errors.push({
      code: 'INVALID_MODE',
      message: `Invalid structure mode: "${structure.mode}". Must be SINGLE_UNIT or MULTI_UNIT.`
    });
  }

  // 2. Validate Unit Type
  if (![UNIT_TYPES.SECTION, UNIT_TYPES.BLOCK, UNIT_TYPES.PHASE].includes(structure.unitType)) {
    errors.push({
      code: 'INVALID_UNIT_TYPE',
      message: `Invalid unit type: "${structure.unitType}". Must be SECTION, BLOCK, or PHASE.`
    });
  }

  // 3. Validate Units array
  if (!Array.isArray(structure.units) || structure.units.length === 0) {
    errors.push({
      code: 'EMPTY_STRUCTURE',
      message: 'Test structure must contain at least one unit.'
    });
    return { valid: false, errors, warnings };
  }

  // Retrieve Exam Pattern for reference validation
  const examPattern = testExamId ? getExamPattern(testExamId) : null;
  const validStageIds = new Set(examPattern?.stages?.map(s => s.id) || []);
  const validSubjectIds = new Set(examPattern?.subjects?.map(s => s.id) || []);
  const validModuleIds = new Set(examPattern?.curriculumUnits?.map(m => m.id) || []);

  const seenIds = new Set();
  const seenCodes = new Set();

  structure.units.forEach((unit, index) => {
    // ID Check
    if (!unit.id || typeof unit.id !== 'string' || !unit.id.trim()) {
      errors.push({
        code: 'INVALID_UNIT_ID',
        unitId: unit.id || `index-${index}`,
        message: `Unit at index ${index} lacks a valid non-empty string ID.`
      });
    } else {
      if (seenIds.has(unit.id)) {
        errors.push({
          code: 'DUPLICATE_UNIT_ID',
          unitId: unit.id,
          message: `Duplicate unit ID detected: "${unit.id}". Unit IDs must be strictly unique.`
        });
      }
      seenIds.add(unit.id);
    }

    // Name Check
    if (!unit.name || typeof unit.name !== 'string' || !unit.name.trim()) {
      errors.push({
        code: 'EMPTY_UNIT_NAME',
        unitId: unit.id,
        message: `Unit "${unit.id}" requires a non-empty name.`
      });
    }

    // Code Check (unique case-insensitive if provided)
    if (unit.code && typeof unit.code === 'string' && unit.code.trim()) {
      const cleanCode = unit.code.trim().toUpperCase();
      if (seenCodes.has(cleanCode)) {
        errors.push({
          code: 'DUPLICATE_UNIT_CODE',
          unitId: unit.id,
          message: `Duplicate unit code "${cleanCode}" in unit "${unit.name || unit.id}". Code must be unique within the test.`
        });
      }
      seenCodes.add(cleanCode);
    }

    // Order Check
    if (typeof unit.order !== 'number' || isNaN(unit.order) || unit.order < 0) {
      errors.push({
        code: 'INVALID_ORDER',
        unitId: unit.id,
        message: `Unit "${unit.name || unit.id}" has an invalid order index "${unit.order}". Must be a non-negative integer.`
      });
    }

    // Exam Mapping Validation
    if (unit.examMapping && unit.examMapping.type) {
      const { type, id } = unit.examMapping;

      if (![EXAM_MAPPING_TYPES.EXAM_STAGE, EXAM_MAPPING_TYPES.SUBJECT, EXAM_MAPPING_TYPES.CURRICULUM_UNIT].includes(type)) {
        errors.push({
          code: 'INVALID_EXAM_MAPPING_TYPE',
          unitId: unit.id,
          message: `Unit "${unit.name || unit.id}" references unknown mapping type: "${type}".`
        });
      }

      if (id) {
        if (!examPattern) {
          errors.push({
            code: 'INVALID_EXAM_REFERENCE',
            unitId: unit.id,
            message: `Unit "${unit.name || unit.id}" maps to "${id}" but parent test examId "${testExamId}" is invalid or has no exam pattern.`
          });
        } else if (type === EXAM_MAPPING_TYPES.EXAM_STAGE) {
          if (!validStageIds.has(id)) {
            errors.push({
              code: 'EXAM_SCOPE_MISMATCH',
              unitId: unit.id,
              message: `Exam stage "${id}" does not exist in exam pattern for "${testExamId}".`
            });
          }
        } else if (type === EXAM_MAPPING_TYPES.SUBJECT) {
          // Check that subject belongs to this Exam
          if (!validSubjectIds.has(id)) {
            errors.push({
              code: 'EXAM_SCOPE_MISMATCH',
              unitId: unit.id,
              message: `Subject "${id}" does not belong to the selected exam "${testExamId}".`
            });
          }
          // Check Faculty Subject Scope Isolation
          if (allowedSubjectIds && Array.isArray(allowedSubjectIds) && !allowedSubjectIds.includes('all')) {
            if (!allowedSubjectIds.includes(id)) {
              errors.push({
                code: 'SUBJECT_SCOPE_MISMATCH',
                unitId: unit.id,
                message: `Subject "${id}" is outside the authorized faculty subject scope.`
              });
            }
          }
        } else if (type === EXAM_MAPPING_TYPES.CURRICULUM_UNIT) {
          if (!validModuleIds.has(id)) {
            errors.push({
              code: 'EXAM_SCOPE_MISMATCH',
              unitId: unit.id,
              message: `Curriculum module "${id}" does not belong to the curriculum for exam "${testExamId}".`
            });
          }
        }
      }
    }

    // Configuration Validation (Phase 3)
    if (unit.configuration) {
      const configValidation = validateUnitConfiguration(unit.configuration, testExamId, allowedSubjectIds, testAllowedQuestionTypes);
      if (!configValidation.valid) {
        configValidation.errors.forEach(err => {
          errors.push({
            code: err.code,
            unitId: unit.id,
            message: `Unit "${unit.name || unit.id}": ${err.message}`
          });
        });
      }
      if (configValidation.warnings && configValidation.warnings.length > 0) {
        configValidation.warnings.forEach(w => {
          warnings.push({
            code: w.code,
            unitId: unit.id,
            message: `Unit "${unit.name || unit.id}": ${w.message}`
          });
        });
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Retrieves normalized stages for an exam.
 * @param {string} examId
 * @returns {Array<object>}
 */
export function getExamStages(examId) {
  if (!examId) return [];
  const pattern = getExamPattern(examId);
  return pattern?.stages || [];
}

/**
 * Retrieves subjects available for a specific exam stage.
 * @param {string} examId
 * @param {string|null} stageId
 * @returns {Array<object>}
 */
export function getStageSubjects(examId, stageId = null) {
  if (!examId) return [];
  const pattern = getExamPattern(examId);
  if (!pattern) return [];

  if (!stageId) {
    return pattern.subjects || [];
  }

  const stage = pattern.stages.find(s => s.id === stageId);
  if (stage && Array.isArray(stage.subjectIds) && stage.subjectIds.length > 0) {
    return pattern.subjects.filter(s => stage.subjectIds.includes(s.id));
  }

  return pattern.subjects || [];
}

/**
 * Validates the curriculum scope selected for a test.
 * @param {object} curriculumScope
 * @param {string} examId
 * @param {string|null} stageId
 * @param {Array<string>|null} allowedSubjectIds
 * @returns {{ valid: boolean, errors: Array<{ code: string, message: string }>, warnings: Array<{ code: string, message: string }> }}
 */
export function validateCurriculumScope(curriculumScope, examId, stageId = null, allowedSubjectIds = null) {
  const errors = [];
  const warnings = [];

  if (!curriculumScope || typeof curriculumScope !== 'object') {
    return {
      valid: false,
      errors: [{ code: 'INVALID_CURRICULUM_SCOPE', message: 'Curriculum scope must be a valid object.' }],
      warnings
    };
  }

  const subjects = curriculumScope.subjects;
  if (!Array.isArray(subjects) || subjects.length === 0) {
    errors.push({
      code: 'NO_SUBJECTS_SELECTED',
      message: 'At least one subject must be selected in the curriculum scope.'
    });
    return { valid: false, errors, warnings };
  }

  const stageSubjects = getStageSubjects(examId, stageId);
  const stageSubjectIds = new Set(stageSubjects.map(s => s.id));

  subjects.forEach(entry => {
    if (!entry || !entry.subjectId) {
      errors.push({
        code: 'INVALID_SUBJECT_REFERENCE',
        message: 'Curriculum scope entry is missing a valid subjectId.'
      });
      return;
    }

    // Check subject belongs to Stage / Exam
    if (stageId && !stageSubjectIds.has(entry.subjectId)) {
      errors.push({
        code: 'SUBJECT_NOT_IN_STAGE',
        message: `Subject "${entry.subjectId}" is not available in the selected exam stage "${stageId}".`
      });
    }

    // Check Faculty RBAC
    if (allowedSubjectIds && Array.isArray(allowedSubjectIds) && !allowedSubjectIds.includes('all')) {
      if (!allowedSubjectIds.includes(entry.subjectId)) {
        errors.push({
          code: 'UNAUTHORIZED_SUBJECT',
          message: `Subject "${entry.subjectId}" is outside the authorized faculty curriculum scope.`
        });
      }
    }

    // Check Chapters / Modules
    if (Array.isArray(entry.chapterIds) && entry.chapterIds.length > 0) {
      const availableModules = curriculumService.getModules(entry.subjectId, examId) || [];
      const validModuleIds = new Set(availableModules.map(m => m.id));

      entry.chapterIds.forEach(chId => {
        if (!validModuleIds.has(chId)) {
          errors.push({
            code: 'CHAPTER_NOT_IN_SUBJECT',
            message: `Chapter/module "${chId}" does not belong to subject "${entry.subjectId}".`
          });
        }
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Normalizes a Test Structure into the Phase -> Section -> Block hierarchy,
 * while maintaining a synchronized, flattened `units` array for backward compatibility.
 * @param {object} rawStructure
 * @returns {object}
 */
export function normalizeTestStructure(rawStructure = {}) {
  if (!rawStructure || typeof rawStructure !== 'object') {
    return createDefaultTestStructure();
  }

  const mode = rawStructure.mode || STRUCTURE_MODES.SINGLE_UNIT;
  const unitType = rawStructure.unitType || UNIT_TYPES.SECTION;
  const phases = Array.isArray(rawStructure.phases) ? [...rawStructure.phases] : [];
  let sections = Array.isArray(rawStructure.sections) ? [...rawStructure.sections] : [];

  // Migration from legacy flat units format
  if (sections.length === 0 && Array.isArray(rawStructure.units) && rawStructure.units.length > 0) {
    sections = rawStructure.units.map((u, idx) => ({
      id: u.id || generateUnitId('sec'),
      type: UNIT_TYPES.SECTION,
      phaseId: u.phaseId || null,
      name: u.name || u.title || `Section ${idx + 1}`,
      code: u.code || `SEC-${idx + 1}`,
      order: u.order !== undefined ? u.order : idx,
      description: u.description || '',
      curriculumScope: u.curriculumScope || {
        subjectIds: u.configuration?.subjectIds || (u.examMapping?.id ? [u.examMapping.id] : []),
        chapterIds: []
      },
      configuration: normalizeUnitConfiguration(u.configuration),
      blocks: Array.isArray(u.blocks) ? u.blocks : []
    }));
  }

  // Fallback if completely empty
  if (sections.length === 0) {
    sections = [
      {
        id: generateUnitId('sec'),
        type: UNIT_TYPES.SECTION,
        phaseId: null,
        name: 'Main Section',
        code: 'SEC-1',
        order: 0,
        description: 'Primary assessment section',
        curriculumScope: { subjectIds: [], chapterIds: [] },
        configuration: { ...DEFAULT_UNIT_CONFIGURATION },
        blocks: []
      }
    ];
  }

  // Synchronize flattened units array for complete backward compatibility
  const flattenedUnits = [];
  sections.forEach((sec, secIdx) => {
    const normSec = {
      ...sec,
      type: UNIT_TYPES.SECTION,
      order: secIdx,
      configuration: normalizeUnitConfiguration(sec.configuration),
      curriculumScope: sec.curriculumScope || { subjectIds: [], chapterIds: [] },
      blocks: Array.isArray(sec.blocks) ? sec.blocks.map((blk, blkIdx) => ({
        ...blk,
        type: UNIT_TYPES.BLOCK,
        sectionId: sec.id,
        order: blkIdx,
        configuration: normalizeUnitConfiguration(blk.configuration),
        curriculumScope: blk.curriculumScope || { subjectIds: [], chapterIds: [] }
      })) : []
    };

    flattenedUnits.push({
      id: normSec.id,
      type: UNIT_TYPES.SECTION,
      phaseId: normSec.phaseId || null,
      name: normSec.name,
      code: normSec.code,
      order: flattenedUnits.length,
      description: normSec.description || '',
      curriculumScope: normSec.curriculumScope,
      configuration: normSec.configuration
    });

    normSec.blocks.forEach(blk => {
      flattenedUnits.push({
        id: blk.id,
        type: UNIT_TYPES.BLOCK,
        sectionId: normSec.id,
        name: blk.name,
        code: blk.code,
        order: flattenedUnits.length,
        description: blk.description || '',
        curriculumScope: blk.curriculumScope,
        configuration: blk.configuration
      });
    });
  });

  return {
    mode: sections.length > 1 ? STRUCTURE_MODES.MULTI_UNIT : mode,
    unitType,
    phases,
    sections,
    units: flattenedUnits
  };
}

/**
 * Validates the hierarchical Test Structure (Phase -> Section -> Block).
 * @param {object} structure
 * @param {string} testExamId
 * @param {string|null} stageId
 * @param {object|null} curriculumScope
 * @param {Array<string>|null} allowedSubjectIds
 * @param {Array<string>|null} testAllowedQuestionTypes
 * @returns {{ valid: boolean, errors: Array<{ code: string, unitId?: string, message: string }>, warnings: Array<{ code: string, message: string }>, normalized: object }}
 */
export function validateTestStructureHierarchy(structure, testExamId, stageId = null, curriculumScope = null, allowedSubjectIds = null, testAllowedQuestionTypes = null) {
  const errors = [];
  const warnings = [];

  if (!structure || typeof structure !== 'object') {
    return {
      valid: false,
      errors: [{ code: 'NO_STRUCTURE', message: 'Test structure object is missing or null.' }],
      warnings,
      normalized: null
    };
  }

  const normalized = normalizeTestStructure(structure);
  const sections = normalized.sections || [];

  if (!Array.isArray(sections) || sections.length === 0) {
    errors.push({
      code: 'NO_SECTIONS_DEFINED',
      message: 'Test structure must contain at least one section.'
    });
    return { valid: false, errors, warnings, normalized };
  }

  const seenIds = new Set();
  const seenCodes = new Set();
  const validPhaseIds = new Set((normalized.phases || []).map(p => p.id));

  // Validate Phases
  (normalized.phases || []).forEach((phase, pIdx) => {
    if (!phase.id || !String(phase.id).trim()) {
      errors.push({ code: 'INVALID_PHASE_ID', message: `Phase at index ${pIdx} lacks a valid ID.` });
    } else {
      if (seenIds.has(phase.id)) {
        errors.push({ code: 'DUPLICATE_PHASE_ID', message: `Duplicate Phase ID detected: "${phase.id}".` });
      }
      seenIds.add(phase.id);
    }

    if (!phase.name || !String(phase.name).trim()) {
      errors.push({ code: 'EMPTY_PHASE_NAME', message: `Phase "${phase.id}" requires a non-empty name.` });
    }
  });

  const scopeSubjectIds = new Set(curriculumScope?.subjects?.map(s => s.subjectId) || []);

  // Validate Sections and nested Blocks
  sections.forEach((section, sIdx) => {
    // Section ID Check
    if (!section.id || !String(section.id).trim()) {
      errors.push({
        code: 'INVALID_SECTION_ID',
        unitId: section.id || `sec-idx-${sIdx}`,
        message: `Section at index ${sIdx} lacks a valid ID.`
      });
    } else {
      if (seenIds.has(section.id)) {
        errors.push({
          code: 'DUPLICATE_SECTION_ID',
          unitId: section.id,
          message: `Duplicate Section ID detected: "${section.id}".`
        });
      }
      seenIds.add(section.id);
    }

    // Section Name Check
    if (!section.name || !String(section.name).trim()) {
      errors.push({
        code: 'EMPTY_SECTION_NAME',
        unitId: section.id,
        message: `Section "${section.id}" requires a non-empty name.`
      });
    }

    // Section Code Check (unique if provided)
    if (section.code && String(section.code).trim()) {
      const cleanCode = String(section.code).trim().toUpperCase();
      if (seenCodes.has(cleanCode)) {
        errors.push({
          code: 'DUPLICATE_SECTION_CODE',
          unitId: section.id,
          message: `Duplicate section code "${cleanCode}". Section codes must be unique.`
        });
      }
      seenCodes.add(cleanCode);
    }

    // Phase link check
    if (section.phaseId && !validPhaseIds.has(section.phaseId)) {
      errors.push({
        code: 'INVALID_PARENT_PHASE',
        unitId: section.id,
        message: `Section "${section.name || section.id}" references non-existent parent Phase "${section.phaseId}".`
      });
    }

    // Curriculum Scope check
    if (section.curriculumScope && scopeSubjectIds.size > 0) {
      const secSubs = section.curriculumScope.subjectIds || [];
      secSubs.forEach(subId => {
        if (!scopeSubjectIds.has(subId)) {
          warnings.push({
            code: 'SECTION_SUBJECT_NOT_IN_TEST_SCOPE',
            message: `Section "${section.name}" references subject "${subId}" which is not in the test curriculum scope.`
          });
        }
      });
    }

    // Validate Blocks
    const blocks = section.blocks || [];
    blocks.forEach((block, bIdx) => {
      if (!block.id || !String(block.id).trim()) {
        errors.push({
          code: 'INVALID_BLOCK_ID',
          unitId: block.id || `blk-idx-${bIdx}`,
          message: `Block at index ${bIdx} under Section "${section.name}" lacks a valid ID.`
        });
      } else {
        if (seenIds.has(block.id)) {
          errors.push({
            code: 'DUPLICATE_BLOCK_ID',
            unitId: block.id,
            message: `Duplicate Block ID detected: "${block.id}".`
          });
        }
        seenIds.add(block.id);
      }

      if (!block.name || !String(block.name).trim()) {
        errors.push({
          code: 'EMPTY_BLOCK_NAME',
          unitId: block.id,
          message: `Block "${block.id}" under Section "${section.name}" requires a non-empty name.`
        });
      }

      if (block.code && String(block.code).trim()) {
        const cleanCode = String(block.code).trim().toUpperCase();
        if (seenCodes.has(cleanCode)) {
          errors.push({
            code: 'DUPLICATE_BLOCK_CODE',
            unitId: block.id,
            message: `Duplicate block code "${cleanCode}".`
          });
        }
        seenCodes.add(cleanCode);
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalized
  };
}

/**
 * Readiness check for Phase 2: Structure.
 * Requires:
 * 1. Exam Stage selected
 * 2. Curriculum scope selected (at least 1 subject)
 * 3. Valid Test Structure (at least 1 section)
 * @param {object} test
 * @returns {boolean}
 */
export function isStructureReady(test) {
  if (!test) return false;
  const examId = test.examId || test.examTrack || test.courseId;
  if (!examId) return false;

  // 1. Exam Stage selected
  const stageId = test.examPattern?.stageId;
  if (!stageId) return false;

  const examStages = getExamStages(examId);
  const stageExists = examStages.some(s => s.id === stageId);
  if (!stageExists) return false;

  // 2. Curriculum Scope selected (at least 1 subject)
  const currScope = test.curriculumScope;
  if (!currScope || !Array.isArray(currScope.subjects) || currScope.subjects.length === 0) {
    return false;
  }
  const currValidation = validateCurriculumScope(currScope, examId, stageId);
  if (!currValidation.valid) return false;

  // 3. Test Structure defined
  const structure = test.structure;
  if (!structure) return false;

  const sections = Array.isArray(structure.sections) && structure.sections.length > 0
    ? structure.sections
    : (Array.isArray(structure.units) ? structure.units.filter(u => u.type === 'SECTION' || !u.type) : []);

  if (sections.length === 0) return false;

  return sections.every(s => s.id && (s.name || s.title) && String(s.name || s.title).trim());
}

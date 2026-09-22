// =============================================================================
// QUESTION TYPE SERVICE — CANONICAL REGISTRY & VALIDATION
// Provides centralized metadata, capability definitions, and validation helpers
// for Phase 4 Question Type System across Admin and Faculty tests.
// =============================================================================

import { catalogService } from './catalogService.js';

export const QUESTION_TYPES = {
  SINGLE_BEST_ANSWER: 'SINGLE_BEST_ANSWER',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  TRUE_FALSE: 'TRUE_FALSE',
  EXTENDED_MATCHING: 'EXTENDED_MATCHING',
  CLINICAL_CASE: 'CLINICAL_CASE',
  IMAGE_BASED: 'IMAGE_BASED',
  SHORT_ANSWER: 'SHORT_ANSWER'
};

export const QUESTION_TYPE_REGISTRY = [
  {
    id: QUESTION_TYPES.SINGLE_BEST_ANSWER,
    name: 'Single Best Answer',
    shortName: 'SBA',
    category: 'Objective',
    description: 'Clinical stem followed by multiple options with exactly one correct answer. The gold-standard format for medical licensing exams (NEET-PG, USMLE, PLAB).',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    capabilities: {
      options: true,
      singleCorrectAnswer: true,
      multipleCorrectAnswers: false,
      media: true,
      clinicalStem: true,
      textInput: false
    },
    aliases: ['single_choice', 'sba', 'single_best_answer']
  },
  {
    id: QUESTION_TYPES.MULTIPLE_CHOICE,
    name: 'Multiple Choice (Multi-Select)',
    shortName: 'MCQ',
    category: 'Objective',
    description: 'Clinical presentation with multiple viable options where one or more correct answers must be selected.',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    capabilities: {
      options: true,
      singleCorrectAnswer: false,
      multipleCorrectAnswers: true,
      media: true,
      clinicalStem: true,
      textInput: false
    },
    aliases: ['multiple_choice', 'multi_select', 'multiple_response', 'mcq']
  },
  {
    id: QUESTION_TYPES.TRUE_FALSE,
    name: 'True / False',
    shortName: 'T/F',
    category: 'Objective',
    description: 'Direct clinical assertion requiring candidate to evaluate factual validity as binary True or False.',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    capabilities: {
      options: true,
      singleCorrectAnswer: true,
      multipleCorrectAnswers: false,
      media: false,
      clinicalStem: false,
      textInput: false
    },
    aliases: ['true_false', 'tf']
  },
  {
    id: QUESTION_TYPES.EXTENDED_MATCHING,
    name: 'Extended Matching Questions (EMQ)',
    shortName: 'EMQ',
    category: 'Objective',
    description: 'Common clinical theme with a large option bank (e.g. differential diagnoses, pharmacotherapies) matched across multiple patient scenarios.',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    capabilities: {
      options: true,
      singleCorrectAnswer: true,
      multipleCorrectAnswers: false,
      media: false,
      clinicalStem: true,
      textInput: false
    },
    aliases: ['extended_matching', 'emq', 'matching', 'matching_pairs']
  },
  {
    id: QUESTION_TYPES.CLINICAL_CASE,
    name: 'Clinical Case Simulation',
    shortName: 'Clinical Case',
    category: 'Interactive',
    description: 'Multi-stage progressive patient scenario with evolving vital signs, investigation results, and sequential decision steps.',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    capabilities: {
      options: true,
      singleCorrectAnswer: true,
      multipleCorrectAnswers: false,
      media: true,
      clinicalStem: true,
      textInput: false
    },
    aliases: ['clinical_case', 'case_study', 'vignette_group', 'case']
  },
  {
    id: QUESTION_TYPES.IMAGE_BASED,
    name: 'Image-Based / Diagnostic Hotspot',
    shortName: 'Image Based',
    category: 'Interactive',
    description: 'Diagnostic radiology (CT, MRI, X-ray), histopathology slides, ECG tracings, or anatomical diagrams with visual interpretation prompts.',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    capabilities: {
      options: true,
      singleCorrectAnswer: true,
      multipleCorrectAnswers: false,
      media: true,
      clinicalStem: true,
      textInput: false
    },
    aliases: ['image_based', 'hotspot', 'drag_drop', 'image']
  },
  {
    id: QUESTION_TYPES.SHORT_ANSWER,
    name: 'Short Answer / Fill Blank',
    shortName: 'Short Answer',
    category: 'Subjective',
    description: 'Direct numerical or keyword entry for drug dosages, physiological calculations, or diagnostic naming.',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    capabilities: {
      options: false,
      singleCorrectAnswer: true,
      multipleCorrectAnswers: false,
      media: false,
      clinicalStem: true,
      textInput: true
    },
    aliases: ['short_answer', 'fill_blank', 'short_ans']
  }
];

export const QUESTION_TYPE_INHERITANCE_MODES = {
  INHERIT: 'INHERIT',
  EXPLICIT: 'EXPLICIT'
};

export const DEFAULT_TEST_ALLOWED_QUESTION_TYPES = [
  QUESTION_TYPES.SINGLE_BEST_ANSWER,
  QUESTION_TYPES.MULTIPLE_CHOICE,
  QUESTION_TYPES.EXTENDED_MATCHING,
  QUESTION_TYPES.CLINICAL_CASE,
  QUESTION_TYPES.IMAGE_BASED
];

export const DEFAULT_TEST_QUESTION_TYPE_CONFIG = {
  mode: QUESTION_TYPE_INHERITANCE_MODES.EXPLICIT,
  allowedTypes: [...DEFAULT_TEST_ALLOWED_QUESTION_TYPES]
};

export const DEFAULT_SECTION_QUESTION_TYPE_CONFIG = {
  mode: QUESTION_TYPE_INHERITANCE_MODES.INHERIT,
  allowedTypes: []
};

class QuestionTypeService {
  constructor() {
    this.registry = QUESTION_TYPE_REGISTRY;
  }

  /**
   * Returns all question type definitions.
   * @returns {Array<object>}
   */
  getAllQuestionTypes() {
    return JSON.parse(JSON.stringify(this.registry));
  }

  /**
   * Returns all canonical question type IDs.
   * @returns {Array<string>}
   */
  getAllQuestionTypeIds() {
    return this.registry.map(t => t.id);
  }

  /**
   * Normalizes any input ID or alias into a canonical uppercase Question Type ID.
   * @param {string} rawId
   * @returns {string|null}
   */
  normalizeQuestionTypeId(rawId) {
    if (!rawId || typeof rawId !== 'string') return null;
    const clean = rawId.trim().toUpperCase();
    const cleanLower = rawId.trim().toLowerCase();

    // Check direct ID match
    const exact = this.registry.find(t => t.id === clean);
    if (exact) return exact.id;

    // Check shortName match (e.g. SBA, MCQ, EMQ)
    const byShortName = this.registry.find(t => t.shortName && t.shortName.toUpperCase() === clean);
    if (byShortName) return byShortName.id;

    // Check aliases
    const aliased = this.registry.find(t => 
      t.aliases && t.aliases.some(a => a.toLowerCase() === cleanLower)
    );
    if (aliased) return aliased.id;

    return null;
  }

  /**
   * Safely normalizes an array of question type IDs.
   * @param {Array<string>} rawIds
   * @returns {Array<string>}
   */
  normalizeQuestionTypeIds(rawIds) {
    if (!Array.isArray(rawIds)) return [];
    const normalized = [];
    const seen = new Set();
    rawIds.forEach(r => {
      const canon = this.normalizeQuestionTypeId(r);
      if (canon && !seen.has(canon)) {
        seen.add(canon);
        normalized.push(canon);
      }
    });
    return normalized;
  }

  /**
   * Checks if an ID or alias corresponds to a recognized question type.
   * @param {string} rawId
   * @returns {boolean}
   */
  isValidQuestionTypeId(rawId) {
    return this.normalizeQuestionTypeId(rawId) !== null;
  }

  /**
   * Retrieves definition for a question type ID or alias.
   * @param {string} rawId
   * @returns {object|null}
   */
  getQuestionTypeById(rawId) {
    const canonId = this.normalizeQuestionTypeId(rawId);
    if (!canonId) return null;
    const found = this.registry.find(t => t.id === canonId);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  /**
   * Retrieves the human-readable label for a question type.
   * @param {string} rawId
   * @returns {string}
   */
  getQuestionTypeLabel(rawId) {
    const def = this.getQuestionTypeById(rawId);
    return def ? def.name : (rawId || 'Unknown Type');
  }

  /**
   * Retrieves the short name for a question type.
   * @param {string} rawId
   * @returns {string}
   */
  getQuestionTypeShortName(rawId) {
    const def = this.getQuestionTypeById(rawId);
    return def ? def.shortName : (rawId || 'Unknown');
  }

  /**
   * Retrieves capabilities object for a question type.
   * @param {string} rawId
   * @returns {object|null}
   */
  getQuestionTypeCapabilities(rawId) {
    const def = this.getQuestionTypeById(rawId);
    return def ? { ...def.capabilities } : null;
  }

  /**
   * Retrieves question types supported by a specific Exam.
   * If the exam catalog specifies `supportedQuestionTypes`, respects it.
   * Otherwise returns all platform question types.
   * @param {string} examId
   * @returns {Array<string>}
   */
  getExamSupportedQuestionTypes(examId) {
    if (!examId) return this.getAllQuestionTypeIds();
    const exam = catalogService.getExamById(examId);
    if (exam && Array.isArray(exam.supportedQuestionTypes) && exam.supportedQuestionTypes.length > 0) {
      return this.normalizeQuestionTypeIds(exam.supportedQuestionTypes);
    }
    return this.getAllQuestionTypeIds();
  }

  /**
   * Validates test-level question type configuration.
   * @param {object} config
   * @param {string} examId
   * @returns {{ valid: boolean, errors: Array<{ code: string, message: string }>, warnings: Array<{ code: string, message: string }> }}
   */
  validateTestQuestionTypeConfig(config, examId = null) {
    const errors = [];
    const warnings = [];

    if (!config || typeof config !== 'object') {
      return {
        valid: false,
        errors: [{ code: 'INVALID_CONFIG', message: 'Question type configuration must be an object.' }],
        warnings
      };
    }

    const mode = config.mode || QUESTION_TYPE_INHERITANCE_MODES.EXPLICIT;
    const allowedTypes = config.allowedTypes;

    if (!Array.isArray(allowedTypes)) {
      errors.push({
        code: 'INVALID_QUESTION_TYPE_LIST',
        message: 'Test questionTypeConfig "allowedTypes" must be an array of Question Type IDs.'
      });
      return { valid: false, errors, warnings };
    }

    if (allowedTypes.length === 0) {
      warnings.push({
        code: 'EMPTY_ALLOWED_TYPES',
        message: 'No question types are enabled for this test. Candidates may not receive questions until types are selected.'
      });
    }

    const seen = new Set();
    const examSupported = examId ? this.getExamSupportedQuestionTypes(examId) : null;
    const examSupportedSet = examSupported ? new Set(examSupported) : null;

    allowedTypes.forEach(tId => {
      if (!tId || typeof tId !== 'string' || !tId.trim()) {
        errors.push({
          code: 'INVALID_QUESTION_TYPE',
          message: 'Question type ID must be a non-empty string.'
        });
        return;
      }

      const canon = this.normalizeQuestionTypeId(tId);

      if (!canon) {
        errors.push({
          code: 'INVALID_QUESTION_TYPE',
          message: `Question type "${tId}" is not a recognized platform question type.`
        });
        return;
      }

      if (seen.has(canon)) {
        errors.push({
          code: 'DUPLICATE_QUESTION_TYPE',
          message: `Question type "${canon}" is specified more than once.`
        });
      }
      seen.add(canon);

      // Check against exam track restrictions if defined
      if (examSupportedSet && !examSupportedSet.has(canon)) {
        errors.push({
          code: 'EXAM_TYPE_NOT_ALLOWED',
          message: `Question type "${canon}" is not supported by exam track "${examId}".`
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
   * Validates section-level question type configuration against test-level allowed types.
   * @param {object} sectionConfig
   * @param {Array<string>} testAllowedTypes
   * @param {string} unitName
   * @returns {{ valid: boolean, errors: Array<{ code: string, message: string }>, warnings: Array<{ code: string, message: string }> }}
   */
  validateSectionQuestionTypeConfig(sectionConfig, testAllowedTypes = [], unitName = 'Section') {
    const errors = [];
    const warnings = [];

    if (!sectionConfig || typeof sectionConfig !== 'object') {
      return {
        valid: false,
        errors: [{ code: 'INVALID_CONFIG', message: 'Section question type configuration must be an object.' }],
        warnings
      };
    }

    const mode = sectionConfig.mode || QUESTION_TYPE_INHERITANCE_MODES.INHERIT;
    const allowedTypes = Array.isArray(sectionConfig.allowedTypes)
      ? sectionConfig.allowedTypes
      : (Array.isArray(sectionConfig.questionTypes) ? sectionConfig.questionTypes : []);

    // INHERIT mode: Automatically inherits from Test, always valid
    if (mode === QUESTION_TYPE_INHERITANCE_MODES.INHERIT) {
      return { valid: true, errors, warnings };
    }

    // EXPLICIT mode: Must be subset of testAllowedTypes
    if (!Array.isArray(allowedTypes)) {
      errors.push({
        code: 'INVALID_QUESTION_TYPE_LIST',
        message: `Section "${unitName}" question types must be an array.`
      });
      return { valid: false, errors, warnings };
    }

    if (allowedTypes.length === 0) {
      warnings.push({
        code: 'EMPTY_SECTION_QUESTION_TYPES',
        message: `Section "${unitName}" has explicit question type configuration but no question types selected.`
      });
    }

    const testSet = new Set(this.normalizeQuestionTypeIds(testAllowedTypes));
    const seen = new Set();

    allowedTypes.forEach(tId => {
      if (!tId || typeof tId !== 'string' || !tId.trim()) {
        errors.push({
          code: 'INVALID_QUESTION_TYPE',
          message: `Section "${unitName}" contains an empty or non-string question type ID.`
        });
        return;
      }

      const canon = this.normalizeQuestionTypeId(tId);
      if (!canon) {
        errors.push({
          code: 'INVALID_QUESTION_TYPE',
          message: `Section "${unitName}" contains unrecognized question type "${tId}".`
        });
        return;
      }

      if (seen.has(canon)) {
        errors.push({
          code: 'DUPLICATE_QUESTION_TYPE',
          message: `Section "${unitName}" specifies duplicate question type "${canon}".`
        });
      }
      seen.add(canon);

      // Section allowedTypes must be subset of Test allowedTypes
      if (testSet.size > 0 && !testSet.has(canon)) {
        errors.push({
          code: 'SECTION_TYPE_NOT_ALLOWED',
          message: `Section "${unitName}" specifies question type "${canon}" which is not permitted by the test configuration.`
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
   * Resolves effective question types for a unit.
   * If unit inherits, returns test-level types. If explicit, returns unit-level types.
   * @param {object} unit
   * @param {object} testQuestionTypeConfig
   * @returns {Array<string>}
   */
  resolveEffectiveUnitQuestionTypes(unit, testQuestionTypeConfig = null) {
    const testTypes = testQuestionTypeConfig && Array.isArray(testQuestionTypeConfig.allowedTypes)
      ? this.normalizeQuestionTypeIds(testQuestionTypeConfig.allowedTypes)
      : [...DEFAULT_TEST_ALLOWED_QUESTION_TYPES];

    if (!unit || !unit.configuration) return testTypes;

    const config = unit.configuration;
    const qtConfig = config.questionTypeConfig || {};
    const mode = qtConfig.mode || (Array.isArray(config.questionTypes) && config.questionTypes.length > 0 
      ? QUESTION_TYPE_INHERITANCE_MODES.EXPLICIT 
      : QUESTION_TYPE_INHERITANCE_MODES.INHERIT);

    if (mode === QUESTION_TYPE_INHERITANCE_MODES.INHERIT) {
      return testTypes;
    }

    const explicitTypes = Array.isArray(qtConfig.allowedTypes) && qtConfig.allowedTypes.length > 0
      ? qtConfig.allowedTypes
      : (Array.isArray(config.questionTypes) ? config.questionTypes : []);

    const normalizedExplicit = this.normalizeQuestionTypeIds(explicitTypes);
    return normalizedExplicit.length > 0 ? normalizedExplicit : testTypes;
  }

  getQuestionTypes() {
    return this.getAllQuestionTypes();
  }

  getQuestionType(type) {
    return this.getQuestionTypeById(type);
  }

  getQuestionTypeSchema(type) {
    return getQuestionTypeSchema(type);
  }

  validateQuestionByType(question) {
    return validateQuestionByType(question);
  }
}

export const questionTypeService = new QuestionTypeService();

export function getQuestionTypes() {
  return questionTypeService.getAllQuestionTypes();
}

export function getQuestionType(type) {
  return questionTypeService.getQuestionTypeById(type);
}

export function getQuestionTypeSchema(type) {
  const def = questionTypeService.getQuestionTypeById(type);
  if (!def) {
    return {
      id: type || 'SINGLE_BEST_ANSWER',
      name: 'Single Best Answer',
      shortName: 'SBA',
      capabilities: { options: true, singleCorrectAnswer: true, multipleCorrectAnswers: false, media: false, clinicalStem: true, textInput: false },
      defaultOptions: [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' }
      ],
      allowCustomOptions: true,
      minOptions: 2,
      maxOptions: 6,
      multiSelect: false,
      requiresTextAnswer: false,
      requiresMedia: false,
      requiresVignette: false
    };
  }

  const id = def.id;

  switch (id) {
    case QUESTION_TYPES.SINGLE_BEST_ANSWER:
      return {
        id,
        name: def.name,
        shortName: def.shortName,
        capabilities: def.capabilities,
        defaultOptions: [
          { id: 'A', text: '' },
          { id: 'B', text: '' },
          { id: 'C', text: '' },
          { id: 'D', text: '' }
        ],
        allowCustomOptions: true,
        minOptions: 2,
        maxOptions: 6,
        multiSelect: false,
        requiresTextAnswer: false,
        requiresMedia: false,
        requiresVignette: false
      };
    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return {
        id,
        name: def.name,
        shortName: def.shortName,
        capabilities: def.capabilities,
        defaultOptions: [
          { id: 'A', text: '' },
          { id: 'B', text: '' },
          { id: 'C', text: '' },
          { id: 'D', text: '' }
        ],
        allowCustomOptions: true,
        minOptions: 2,
        maxOptions: 8,
        multiSelect: true,
        requiresTextAnswer: false,
        requiresMedia: false,
        requiresVignette: false
      };
    case QUESTION_TYPES.TRUE_FALSE:
      return {
        id,
        name: def.name,
        shortName: def.shortName,
        capabilities: def.capabilities,
        defaultOptions: [
          { id: 'A', text: 'True' },
          { id: 'B', text: 'False' }
        ],
        allowCustomOptions: false,
        minOptions: 2,
        maxOptions: 2,
        multiSelect: false,
        requiresTextAnswer: false,
        requiresMedia: false,
        requiresVignette: false
      };
    case QUESTION_TYPES.EXTENDED_MATCHING:
      return {
        id,
        name: def.name,
        shortName: def.shortName,
        capabilities: def.capabilities,
        defaultOptions: [
          { id: 'A', text: '' },
          { id: 'B', text: '' },
          { id: 'C', text: '' },
          { id: 'D', text: '' },
          { id: 'E', text: '' }
        ],
        allowCustomOptions: true,
        minOptions: 3,
        maxOptions: 10,
        multiSelect: false,
        requiresTextAnswer: false,
        requiresMedia: false,
        requiresVignette: true
      };
    case QUESTION_TYPES.CLINICAL_CASE:
      return {
        id,
        name: def.name,
        shortName: def.shortName,
        capabilities: def.capabilities,
        defaultOptions: [
          { id: 'A', text: '' },
          { id: 'B', text: '' },
          { id: 'C', text: '' },
          { id: 'D', text: '' }
        ],
        allowCustomOptions: true,
        minOptions: 2,
        maxOptions: 6,
        multiSelect: false,
        requiresTextAnswer: false,
        requiresMedia: false,
        requiresVignette: true
      };
    case QUESTION_TYPES.IMAGE_BASED:
      return {
        id,
        name: def.name,
        shortName: def.shortName,
        capabilities: def.capabilities,
        defaultOptions: [
          { id: 'A', text: '' },
          { id: 'B', text: '' },
          { id: 'C', text: '' },
          { id: 'D', text: '' }
        ],
        allowCustomOptions: true,
        minOptions: 2,
        maxOptions: 6,
        multiSelect: false,
        requiresTextAnswer: false,
        requiresMedia: true,
        requiresVignette: false
      };
    case QUESTION_TYPES.SHORT_ANSWER:
      return {
        id,
        name: def.name,
        shortName: def.shortName,
        capabilities: def.capabilities,
        defaultOptions: [],
        allowCustomOptions: false,
        minOptions: 0,
        maxOptions: 0,
        multiSelect: false,
        requiresTextAnswer: true,
        requiresMedia: false,
        requiresVignette: false
      };
    default:
      return {
        id,
        name: def.name,
        shortName: def.shortName,
        capabilities: def.capabilities,
        defaultOptions: [
          { id: 'A', text: '' },
          { id: 'B', text: '' }
        ],
        allowCustomOptions: true,
        minOptions: 2,
        maxOptions: 6,
        multiSelect: false,
        requiresTextAnswer: false,
        requiresMedia: false,
        requiresVignette: false
      };
  }
}

export function validateQuestionByType(question) {
  const errors = [];
  if (!question || typeof question !== 'object') {
    return { valid: false, errors: ['Question must be an object.'] };
  }

  const type = questionTypeService.normalizeQuestionTypeId(question.type);
  if (!type) {
    errors.push(`Invalid or missing question type "${question.type}".`);
    return { valid: false, errors };
  }

  const schema = getQuestionTypeSchema(type);
  const prompt = question.content?.prompt?.trim();
  if (!prompt) {
    errors.push('Question prompt / stem is required.');
  }

  if (schema.requiresTextAnswer) {
    const textAnswer = question.answer?.correct?.[0] || question.answer?.textAnswer;
    if (!textAnswer || !String(textAnswer).trim()) {
      errors.push('Accepted answer/keywords are required for short answer questions.');
    }
  } else {
    const options = question.responseSchema?.options || [];
    if (options.length < schema.minOptions) {
      errors.push(`At least ${schema.minOptions} options are required for ${schema.name}.`);
    }
    const emptyOpts = options.filter(o => !o.text || !o.text.trim());
    if (emptyOpts.length > 0) {
      errors.push('All options must have non-empty text.');
    }
    const correctAnswers = question.answer?.correct || [];
    if (!Array.isArray(correctAnswers) || correctAnswers.length === 0) {
      errors.push('At least one correct answer must be selected.');
    }
  }

  if (schema.requiresMedia) {
    const mediaUrl = question.content?.mediaUrl || question.mediaUrl;
    if (!mediaUrl || !mediaUrl.trim()) {
      errors.push('Image or media URL is required for Image-Based questions.');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

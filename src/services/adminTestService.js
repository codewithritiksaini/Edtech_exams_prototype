// =============================================================================
// ADMIN TEST SERVICE — PHASE 1 TEST FOUNDATION
// Manages dynamic Test entities (assessments) created inside MedPrep Pro.
// Relationship: Test -> Exam (examId references an existing Exam in catalogService)
// LocalStorage Key: medprep_admin_tests_v1
// Event: medprep-admin-tests-updated
// =============================================================================

import { catalogService } from './catalogService.js';
import { 
  STRUCTURE_MODES, 
  UNIT_TYPES, 
  EXAM_MAPPING_TYPES, 
  STRUCTURE_ITEM_TYPES,
  getExamPattern, 
  createDefaultTestStructure, 
  generateUnitId, 
  validateStructure,
  DEFAULT_UNIT_CONFIGURATION,
  normalizeUnitConfiguration,
  validateUnitConfiguration,
  getExamStages,
  getStageSubjects,
  validateCurriculumScope,
  normalizeTestStructure,
  validateTestStructureHierarchy,
  isStructureReady
} from './examPatternHelper.js';

export { STRUCTURE_ITEM_TYPES, isStructureReady };
import { 
  questionTypeService, 
  QUESTION_TYPES, 
  QUESTION_TYPE_INHERITANCE_MODES, 
  DEFAULT_TEST_ALLOWED_QUESTION_TYPES, 
  DEFAULT_TEST_QUESTION_TYPE_CONFIG 
} from './questionTypeService.js';
import { questionService } from './questionService.js';
import { questionBankService } from './questionBankService.js';
import { 
  ASSESSMENT_METHODS, 
  ASSESSMENT_METHOD_LIST, 
  VALID_ASSESSMENT_METHOD_IDS,
  getAssessmentMethodLabel, 
  getAssessmentMethodBadgeClass, 
  isValidAssessmentMethod, 
  validateAssessmentMethod 
} from './assessmentMethodService.js';

export { 
  ASSESSMENT_METHODS, 
  ASSESSMENT_METHOD_LIST, 
  VALID_ASSESSMENT_METHOD_IDS,
  getAssessmentMethodLabel, 
  getAssessmentMethodBadgeClass, 
  isValidAssessmentMethod, 
  validateAssessmentMethod 
};

export const STORAGE_KEY_ADMIN_TESTS = 'medprep_admin_tests_v1';
export const EVENT_ADMIN_TESTS_UPDATED = 'medprep-admin-tests-updated';

// -----------------------------------------------------------------------------
// DOMAIN CONSTANTS & ENUMS
// -----------------------------------------------------------------------------

export const TEST_STATUS = {
  DRAFT: 'DRAFT',
  CONFIGURING: 'CONFIGURING',
  READY: 'READY',
  PUBLISHED: 'PUBLISHED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED'
};

export const TEST_TYPES = [
  { value: 'FULL_MOCK', label: 'Full Mock' },
  { value: 'SUBJECT_TEST', label: 'Subject Test' },
  { value: 'CHAPTER_TEST', label: 'Chapter Test' },
  { value: 'BLOCK_TEST', label: 'Block Test' },
  { value: 'PRACTICE_TEST', label: 'Practice Test' },
  { value: 'CUSTOM', label: 'Custom Test' }
];

export const TEST_LANGUAGES = [
  'English',
  'Hindi',
  'Russian',
  'Spanish',
  'French',
  'German',
  'Other'
];

export const getTestTypeLabel = (typeValue) => {
  const found = TEST_TYPES.find(t => t.value === typeValue);
  return found ? found.label : (typeValue || 'Custom Test');
};

// -----------------------------------------------------------------------------
// INITIAL SEED DATA (8 PROTOTYPE TESTS CONNECTED TO EXISTING EXAMS)
// -----------------------------------------------------------------------------

export const INITIAL_ADMIN_TESTS = [
  {
    id: 'test-neetpg-mock-01',
    examId: 'neet-pg',
    name: 'NEET-PG Full Mock Test 01',
    code: 'NEETPG-MOCK-01',
    description: 'Comprehensive 200 clinical vignette mock assessment strictly aligned with NBE exam blueprint and 3-hour timing.',
    testType: 'FULL_MOCK',
    status: TEST_STATUS.DRAFT,
    targetQuestions: 200,
    targetDuration: 210, // 3.5 hours
    language: 'English',
    instructions: 'This mock test contains 200 clinical questions across pre-clinical, para-clinical, and clinical specialties. Negative marking of -1 per incorrect answer applies.',
    createdAt: '2026-09-10T08:00:00Z',
    updatedAt: '2026-09-15T14:30:00Z',
    // Architectural placeholders for upcoming phases
    structure: null,
    sections: [],
    questionTypes: [],
    questionBankId: null,
    blueprint: null,
    scoringAndTiming: null,
    generationConfig: null,
    testWindow: null
  },
  {
    id: 'test-neetpg-med-01',
    examId: 'neet-pg',
    name: 'NEET-PG Medicine Subject Test',
    code: 'NEETPG-MED-01',
    description: 'High-yield clinical medicine assessment covering cardiology, pulmonology, gastroenterology, nephrology, and neurology.',
    testType: 'SUBJECT_TEST',
    status: TEST_STATUS.DRAFT,
    targetQuestions: 100,
    targetDuration: 90,
    language: 'English',
    instructions: '100 MCQs covering General Medicine and clinical decision pathways. Complete within 90 minutes.',
    createdAt: '2026-09-11T09:15:00Z',
    updatedAt: '2026-09-14T11:20:00Z',
    structure: null,
    sections: [],
    questionTypes: [],
    questionBankId: null,
    blueprint: null,
    scoringAndTiming: null,
    generationConfig: null,
    testWindow: null
  },
  {
    id: 'test-neetpg-cardio-01',
    examId: 'neet-pg',
    name: 'NEET-PG Cardiology Chapter Test',
    code: 'NEETPG-CARDIO-01',
    description: 'Focused chapter revision on acute coronary syndromes, valvular heart disease, ECG rhythm interpretation, and heart failure.',
    testType: 'CHAPTER_TEST',
    status: TEST_STATUS.DRAFT,
    targetQuestions: 45,
    targetDuration: 45,
    language: 'English',
    instructions: 'Focused 45-question chapter sprint on clinical cardiology.',
    createdAt: '2026-09-12T10:00:00Z',
    updatedAt: '2026-09-15T09:10:00Z',
    structure: null,
    sections: [],
    questionTypes: [],
    questionBankId: null,
    blueprint: null,
    scoringAndTiming: null,
    generationConfig: null,
    testWindow: null
  },
  {
    id: 'test-usmle-b1-01',
    examId: 'usmle',
    name: 'USMLE Step 1 Block Test 01',
    code: 'USMLE-B1-01',
    description: 'Timed 40-question block testing foundational sciences, pathology, pharmacokinetics, and diagnostic algorithms.',
    testType: 'BLOCK_TEST',
    status: TEST_STATUS.DRAFT,
    targetQuestions: 40,
    targetDuration: 60,
    language: 'English',
    instructions: 'Standard 40-question USMLE Step 1 block format. 60-minute strict time constraint.',
    createdAt: '2026-09-08T10:00:00Z',
    updatedAt: '2026-09-16T16:45:00Z',
    structure: null,
    sections: [],
    questionTypes: [],
    questionBankId: null,
    blueprint: null,
    scoringAndTiming: null,
    generationConfig: null,
    testWindow: null
  },
  {
    id: 'test-usmle-ck-01',
    examId: 'usmle',
    name: 'USMLE Step 2 CK Clinical Test 01',
    code: 'USMLE-CK-01',
    description: 'Integrated clinical knowledge assessment emphasizing next-best-step diagnostic reasoning and preventive interventions.',
    testType: 'PRACTICE_TEST',
    status: TEST_STATUS.DRAFT,
    targetQuestions: 80,
    targetDuration: 90,
    language: 'English',
    instructions: '80 clinical scenarios designed for Step 2 CK preparation with comprehensive explanation reviews.',
    createdAt: '2026-09-09T11:30:00Z',
    updatedAt: '2026-09-15T12:00:00Z',
    structure: null,
    sections: [],
    questionTypes: [],
    questionBankId: null,
    blueprint: null,
    scoringAndTiming: null,
    generationConfig: null,
    testWindow: null
  },
  {
    id: 'test-plab1-mock-01',
    examId: 'plab',
    name: 'PLAB 1 Mock Test 01',
    code: 'PLAB1-MOCK-01',
    description: 'Full 180 Single Best Answer (SBA) questions simulating the UK GMC licensing examination under NHS guidelines.',
    testType: 'FULL_MOCK',
    status: TEST_STATUS.PUBLISHED,
    targetQuestions: 180,
    targetDuration: 180,
    language: 'English',
    instructions: '180 SBA questions based on UK clinical practice and GMC standards. 3 hours continuous test window.',
    createdAt: '2026-09-01T07:45:00Z',
    updatedAt: '2026-09-12T13:00:00Z',
    structure: null,
    sections: [],
    questionTypes: [],
    questionBankId: null,
    blueprint: null,
    scoringAndTiming: null,
    generationConfig: null,
    testWindow: null
  },
  {
    id: 'test-plab-emerg-01',
    examId: 'plab',
    name: 'PLAB Emergency Medicine Practice Test',
    code: 'PLAB-EMERG-01',
    description: 'High-acuity emergency presentation drills covering sepsis, resuscitation, anaphylaxis, and acute trauma management.',
    testType: 'PRACTICE_TEST',
    status: TEST_STATUS.DRAFT,
    targetQuestions: 50,
    targetDuration: 60,
    language: 'English',
    instructions: '50 emergency medicine scenarios under UK resuscitation council guidelines.',
    createdAt: '2026-09-07T12:00:00Z',
    updatedAt: '2026-09-14T08:20:00Z',
    structure: null,
    sections: [],
    questionTypes: [],
    questionBankId: null,
    blueprint: null,
    scoringAndTiming: null,
    generationConfig: null,
    testWindow: null
  },
  {
    id: 'test-eu-mock-01',
    examId: 'europe',
    name: 'European Medical Licensing Mock Test 01',
    code: 'EU-MOCK-01',
    description: 'Comprehensive medical assessment based on European Approbation and Kenntnisprüfung clinical curricula.',
    testType: 'FULL_MOCK',
    status: TEST_STATUS.ARCHIVED,
    targetQuestions: 120,
    targetDuration: 150,
    language: 'English',
    instructions: '120 clinical vignette questions covering internal medicine and surgery standards in Europe.',
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-09-02T15:40:00Z',
    structure: null,
    sections: [],
    questionTypes: [],
    questionBankId: null,
    blueprint: null,
    scoringAndTiming: null,
    generationConfig: null,
    testWindow: null
  }
];

// -----------------------------------------------------------------------------
// SERVICE CLASS IMPLEMENTATION
// -----------------------------------------------------------------------------

class AdminTestService {
  constructor() {
    this.tests = this.load();
  }

  load() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY_ADMIN_TESTS);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('AdminTestService load error:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_ADMIN_TESTS));
  }

  save() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_ADMIN_TESTS, JSON.stringify(this.tests));
        window.dispatchEvent(
          new CustomEvent(EVENT_ADMIN_TESTS_UPDATED, {
            detail: { tests: [...this.tests] }
          })
        );
      }
    } catch (e) {
      console.warn('AdminTestService save error:', e);
    }
  }

  /**
   * Return existing Exam records from catalogService (READ-ONLY)
   */
  getAvailableExams() {
    if (catalogService && typeof catalogService.getExams === 'function') {
      return catalogService.getExams();
    }
    return [];
  }

  /**
   * Resolve an associated Exam by its ID
   */
  getExamById(examId) {
    if (!examId) return null;
    const exams = this.getAvailableExams();
    return exams.find(e => e.id === examId) || null;
  }

  /**
   * Return all tests matching optional filters
   */
  getTests(filters = {}) {
    let result = [...this.tests];

    // Filter by Exam ID
    if (filters.examId && filters.examId !== 'all') {
      result = result.filter(t => t.examId === filters.examId);
    }

    // Filter by Status
    if (filters.status && filters.status !== 'all') {
      result = result.filter(t => t.status === filters.status);
    }

    // Filter by Test Type
    if (filters.testType && filters.testType !== 'all') {
      result = result.filter(t => t.testType === filters.testType);
    }

    // Search query: case-insensitive search by Test name or Test code
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(t => 
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.code && t.code.toLowerCase().includes(q))
      );
    }

    // Sort by updatedAt descending
    result.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

    return result;
  }

  /**
   * Retrieve single test by ID
   */
  getTest(id) {
    if (!id) return null;
    return this.tests.find(t => t.id === id) || null;
  }

  /**
   * Retrieve single test by Code (case-insensitive)
   */
  getTestByCode(code) {
    if (!code) return null;
    const cleanCode = code.trim().toUpperCase();
    return this.tests.find(t => t.code.toUpperCase() === cleanCode) || null;
  }

  /**
   * Check if a Test Code is unique (case-insensitive)
   */
  isCodeUnique(code, excludeId = null) {
    if (!code || !code.trim()) return false;
    const cleanCode = code.trim().toUpperCase();
    return !this.tests.some(t => t.code.toUpperCase() === cleanCode && t.id !== excludeId);
  }

  /**
   * Create a new Test foundation entity
   */
  createTest(data) {
    if (!data.examId || !data.examId.trim()) {
      throw new Error('Associated Exam is required.');
    }
    if (!data.name || !data.name.trim()) {
      throw new Error('Test Name is required.');
    }
    if (!data.code || !data.code.trim()) {
      throw new Error('Test Code is required.');
    }
    if (!data.testType || !data.testType.trim()) {
      throw new Error('Test Type is required.');
    }

    if (data.assessmentMethod) {
      const v = validateAssessmentMethod(data.assessmentMethod);
      if (!v.valid) {
        throw new Error(v.errors[0]?.message || 'Select a valid assessment method.');
      }
    }

    // Normalize code: trim, uppercase, whitespace replaced with underscore
    const cleanCode = data.code.trim().toUpperCase().replace(/\s+/g, '_');

    if (!this.isCodeUnique(cleanCode)) {
      throw new Error(`Test Code "${cleanCode}" already exists. Test Code must be unique.`);
    }

    const now = new Date().toISOString();
    const newTest = {
      id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      examId: data.examId.trim(),
      name: data.name.trim(),
      code: cleanCode,
      testType: data.testType.trim(),
      assessmentMethod: data.assessmentMethod || null,
      status: TEST_STATUS.DRAFT,
      targetDuration: Number(data.targetDuration) || 180,
      targetQuestions: Number(data.targetQuestions) || 100,
      language: data.language || 'English',
      description: (data.description || '').trim(),
      instructions: (data.instructions || '').trim(),
      createdAt: now,
      updatedAt: now,
      // Phase 2: Test Structure Builder (default normalized structure)
      structure: createDefaultTestStructure({ testType: data.testType }),
      questionTypeConfig: { ...DEFAULT_TEST_QUESTION_TYPE_CONFIG },
      sections: [],
      questionTypes: [],
      questionBankId: null,
      blueprint: null,
      scoringAndTiming: null,
      generationConfig: null,
      testWindow: null
    };

    this.tests.unshift(newTest);
    this.save();
    return newTest;
  }

  /**
   * Update an existing test's editable attributes.
   * Test Code is strictly immutable and preserved.
   */
  updateTest(id, data) {
    const index = this.tests.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Test with ID "${id}" not found.`);
    }

    if (!data.name || !data.name.trim()) {
      throw new Error('Test Name cannot be empty.');
    }
    if (!data.examId || !data.examId.trim()) {
      throw new Error('Associated Exam cannot be empty.');
    }
    if (!data.testType || !data.testType.trim()) {
      throw new Error('Test Type cannot be empty.');
    }

    if (data.assessmentMethod !== undefined && data.assessmentMethod !== null && data.assessmentMethod !== '') {
      const v = validateAssessmentMethod(data.assessmentMethod);
      if (!v.valid) {
        throw new Error(v.errors[0]?.message || 'Select a valid assessment method.');
      }
    }

    const existing = this.tests[index];
    const now = new Date().toISOString();
    const examChanged = existing.examId !== data.examId.trim();

    const updated = {
      ...existing,
      name: data.name.trim(),
      examId: data.examId.trim(),
      testType: data.testType.trim(),
      assessmentMethod: data.assessmentMethod !== undefined ? (data.assessmentMethod || null) : (existing.assessmentMethod || null),
      // Test Code is strictly read-only and immutable after creation
      code: existing.code,
      targetDuration: data.targetDuration !== undefined ? Number(data.targetDuration) : existing.targetDuration,
      targetQuestions: data.targetQuestions !== undefined ? Number(data.targetQuestions) : existing.targetQuestions,
      language: data.language || existing.language,
      description: (data.description !== undefined ? data.description : existing.description).trim(),
      instructions: (data.instructions !== undefined ? data.instructions : existing.instructions).trim(),
      // Invalidate stage, curriculumScope, and structure if exam changes (Requirement 24)
      examPattern: examChanged ? null : existing.examPattern,
      curriculumScope: examChanged ? null : existing.curriculumScope,
      structure: examChanged ? null : existing.structure,
      updatedAt: now
    };

    this.tests[index] = updated;
    this.save();
    return updated;
  }

  /**
   * Duplicate a test as a new DRAFT copy linked to the same Exam.
   * Preserves structure with newly generated unit IDs.
   */
  duplicateTest(id, newName, newCode) {
    const source = this.getTest(id);
    if (!source) {
      throw new Error(`Source test with ID "${id}" not found.`);
    }

    const targetName = (newName || `${source.name} - Copy`).trim();
    const targetCode = (newCode || `${source.code}_COPY`).trim().toUpperCase().replace(/\s+/g, '_');

    if (!this.isCodeUnique(targetCode)) {
      throw new Error(`Test Code "${targetCode}" already exists. Please choose a unique code.`);
    }

    const now = new Date().toISOString();

    // Preserve structure and clone with newly generated unit IDs
    const sourceStructure = source.structure || createDefaultTestStructure(source);
    const clonedStructure = {
      ...JSON.parse(JSON.stringify(sourceStructure)),
      units: (sourceStructure.units || []).map(u => ({
        ...u,
        id: generateUnitId(),
        configuration: normalizeUnitConfiguration(u.configuration)
      }))
    };

    const duplicatedTest = {
      ...JSON.parse(JSON.stringify(source)),
      id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: targetName,
      code: targetCode,
      status: TEST_STATUS.DRAFT,
      structure: clonedStructure,
      questionTypeConfig: source.questionTypeConfig
        ? JSON.parse(JSON.stringify(source.questionTypeConfig))
        : { ...DEFAULT_TEST_QUESTION_TYPE_CONFIG },
      content: source.content
        ? JSON.parse(JSON.stringify(source.content))
        : { questionIds: source.questionIds ? [...source.questionIds] : [], questionCount: (source.questionIds || []).length },
      questionIds: Array.isArray(source.content?.questionIds)
        ? [...source.content.questionIds]
        : (Array.isArray(source.questionIds) ? [...source.questionIds] : []),
      createdAt: now,
      updatedAt: now
    };

    this.tests.unshift(duplicatedTest);
    this.save();
    return duplicatedTest;
  }

  // ---------------------------------------------------------------------------
  // PHASE 2: EXAM PATTERN, CURRICULUM SCOPE & TEST STRUCTURE METHODS
  // ---------------------------------------------------------------------------

  /**
   * Phase 2: Get Exam Pattern / Stage configuration for an Admin Test.
   * @param {string} testId
   * @returns {object|null}
   */
  getAdminTestExamPattern(testId) {
    const test = this.getTest(testId);
    if (!test) throw new Error(`Admin Test with ID "${testId}" not found.`);
    return test.examPattern || null;
  }

  /**
   * Phase 2: Update Exam Pattern / Stage configuration for an Admin Test.
   * Validates that stage belongs to the test's exam.
   * @param {string} testId
   * @param {object} examPattern { patternId, stageId }
   * @returns {object} updated examPattern
   */
  updateAdminTestExamPattern(testId, examPattern) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) throw new Error(`Admin Test with ID "${testId}" not found.`);

    const test = this.tests[index];
    if (![TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status)) {
      throw new Error(`LIFECYCLE_LOCKED: Cannot update exam pattern in status "${test.status}".`);
    }

    if (!examPattern || !examPattern.stageId) {
      throw new Error('INVALID_STAGE: A valid Exam Stage must be selected.');
    }

    const stages = getExamStages(test.examId);
    const validStage = stages.find(s => s.id === examPattern.stageId);
    if (!validStage) {
      throw new Error(`INVALID_STAGE: Stage "${examPattern.stageId}" does not belong to Exam "${test.examId}".`);
    }

    const now = new Date().toISOString();
    const updated = {
      ...test,
      examPattern: {
        patternId: examPattern.patternId || validStage.patternId || null,
        stageId: validStage.id,
        stageName: validStage.name
      },
      updatedAt: now
    };

    // If existing curriculumScope has subjects that do not belong to the new stage, filter them out safely
    if (updated.curriculumScope && Array.isArray(updated.curriculumScope.subjects)) {
      const allowedSubjects = getStageSubjects(test.examId, validStage.id);
      const allowedSubjectIds = new Set(allowedSubjects.map(s => s.id));
      const filteredSubjects = updated.curriculumScope.subjects.filter(sub => allowedSubjectIds.has(sub.subjectId));
      updated.curriculumScope = {
        ...updated.curriculumScope,
        subjects: filteredSubjects
      };
    }

    this.tests[index] = updated;
    this.save();
    return updated.examPattern;
  }

  /**
   * Phase 2: Get Curriculum Scope configuration for an Admin Test.
   * @param {string} testId
   * @returns {object|null}
   */
  getAdminTestCurriculumScope(testId) {
    const test = this.getTest(testId);
    if (!test) throw new Error(`Admin Test with ID "${testId}" not found.`);
    return test.curriculumScope || null;
  }

  /**
   * Phase 2: Update Curriculum Scope for an Admin Test.
   * Validates subjects and chapters against the selected stage.
   * @param {string} testId
   * @param {object} curriculumScope { subjects: [{ subjectId, chapterIds: [] }] }
   * @returns {object} updated curriculumScope
   */
  updateAdminTestCurriculumScope(testId, curriculumScope) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) throw new Error(`Admin Test with ID "${testId}" not found.`);

    const test = this.tests[index];
    if (![TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status)) {
      throw new Error(`LIFECYCLE_LOCKED: Cannot update curriculum scope in status "${test.status}".`);
    }

    const stageId = test.examPattern?.stageId;
    if (!stageId) {
      throw new Error('STAGE_REQUIRED: An Exam Stage must be selected in Step 1 before defining Curriculum Scope.');
    }

    const validation = validateCurriculumScope(curriculumScope, test.examId, stageId);
    if (!validation.valid) {
      const firstError = validation.errors[0];
      throw new Error(`${firstError.code}: ${firstError.message}`);
    }

    const now = new Date().toISOString();
    const updated = {
      ...test,
      curriculumScope: validation.normalizedScope,
      updatedAt: now
    };

    this.tests[index] = updated;
    this.save();
    return updated.curriculumScope;
  }

  /**
   * Phase 2: Test Structure Builder — Retrieves structure for an Admin Test.
   * Auto-initializes legacy tests missing structure and normalizes dual sections & units representation.
   */
  getAdminTestStructure(testId) {
    const test = this.getTest(testId);
    if (!test) {
      throw new Error(`Admin Test with ID "${testId}" not found.`);
    }

    if (!test.structure || (!Array.isArray(test.structure.units) && !Array.isArray(test.structure.sections))) {
      test.structure = createDefaultTestStructure(test);
      this.save();
    } else {
      const normalized = normalizeTestStructure(test.structure);
      test.structure = normalized;
      this.save();
    }

    return JSON.parse(JSON.stringify(test.structure));
  }

  /**
   * Phase 2: Check if test structure is ready
   */
  isAdminStructureReady(testId) {
    const test = this.getTest(testId);
    if (!test) return false;
    return isStructureReady(test);
  }

  /**
   * Phase 2: Test Structure Builder — Updates full structure for an Admin Test.
   * Validates Phase -> Section -> Block hierarchy, unique codes/IDs, and keeps units synced.
   * Editable in DRAFT and CONFIGURING. Strictly locked in READY, PUBLISHED, ACTIVE, COMPLETED, ARCHIVED.
   */
  updateAdminTestStructure(testId, candidateStructure) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Admin Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];
    if (![TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status)) {
      throw new Error(`LIFECYCLE_LOCKED: Test structure cannot be modified while status is "${test.status}". Structure is editable only in DRAFT and CONFIGURING.`);
    }

    const stageId = test.examPattern?.stageId || null;
    const curriculumScope = test.curriculumScope || null;
    const testAllowedTypes = (test.questionTypeConfig && test.questionTypeConfig.allowedTypes) || null;

    const validation = validateTestStructureHierarchy(
      candidateStructure,
      test.examId,
      stageId,
      curriculumScope,
      null,
      testAllowedTypes
    );
    if (!validation.valid) {
      const firstError = validation.errors[0];
      throw new Error(`${firstError.code}: ${firstError.message}`);
    }

    const normalizedStructure = normalizeTestStructure(candidateStructure);

    const updated = {
      ...test,
      structure: normalizedStructure,
      updatedAt: new Date().toISOString()
    };

    this.tests[index] = updated;
    this.save();
    return normalizedStructure;
  }

  /**
   * Phase 2: Test Structure Builder — Adds a new unit to an Admin Test.
   */
  addAdminTestStructureUnit(testId, unitData) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Admin Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];
    if (![TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status)) {
      throw new Error(`LIFECYCLE_LOCKED: Cannot add structure units in status "${test.status}".`);
    }

    if (!test.structure || !Array.isArray(test.structure.units) || test.structure.units.length === 0) {
      test.structure = createDefaultTestStructure(test);
    }

    if (!unitData || !unitData.name || !unitData.name.trim()) {
      throw new Error('EMPTY_UNIT_NAME: Unit name cannot be empty.');
    }

    const newUnit = {
      id: unitData.id || generateUnitId(),
      name: unitData.name.trim(),
      code: (unitData.code || '').trim().toUpperCase(),
      order: test.structure.units.length,
      description: (unitData.description || '').trim(),
      examMapping: unitData.examMapping || { type: null, id: null },
      configuration: normalizeUnitConfiguration(unitData.configuration)
    };

    const newUnits = [...test.structure.units, newUnit];
    const candidateMode = newUnits.length > 1 ? STRUCTURE_MODES.MULTI_UNIT : test.structure.mode;

    const candidateStructure = {
      mode: candidateMode,
      unitType: test.structure.unitType || UNIT_TYPES.SECTION,
      units: newUnits
    };

    const validation = validateStructure(candidateStructure, test.examId);
    if (!validation.valid) {
      const firstError = validation.errors[0];
      throw new Error(`${firstError.code}: ${firstError.message}`);
    }

    const updated = {
      ...test,
      structure: candidateStructure,
      updatedAt: new Date().toISOString()
    };

    this.tests[index] = updated;
    this.save();
    return newUnit;
  }

  /**
   * Phase 2: Test Structure Builder — Updates an existing unit in an Admin Test.
   */
  updateAdminTestStructureUnit(testId, unitId, updates) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Admin Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];
    if (![TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status)) {
      throw new Error(`LIFECYCLE_LOCKED: Cannot update structure units in status "${test.status}".`);
    }

    if (!test.structure || !Array.isArray(test.structure.units)) {
      test.structure = createDefaultTestStructure(test);
    }

    const uIndex = test.structure.units.findIndex(u => u.id === unitId);
    if (uIndex === -1) {
      throw new Error(`Unit with ID "${unitId}" not found in test.`);
    }

    const existingUnit = test.structure.units[uIndex];
    const updatedUnit = {
      ...existingUnit,
      name: updates.name !== undefined ? updates.name.trim() : existingUnit.name,
      code: updates.code !== undefined ? updates.code.trim().toUpperCase() : existingUnit.code,
      description: updates.description !== undefined ? updates.description.trim() : existingUnit.description,
      examMapping: updates.examMapping !== undefined ? updates.examMapping : existingUnit.examMapping,
      configuration: updates.configuration !== undefined 
        ? normalizeUnitConfiguration({ ...(existingUnit.configuration || {}), ...updates.configuration })
        : normalizeUnitConfiguration(existingUnit.configuration),
      // Stable id and order preserved
      id: existingUnit.id,
      order: existingUnit.order
    };

    const updatedUnits = [...test.structure.units];
    updatedUnits[uIndex] = updatedUnit;

    const candidateStructure = {
      ...test.structure,
      units: updatedUnits
    };

    const validation = validateStructure(candidateStructure, test.examId);
    if (!validation.valid) {
      const firstError = validation.errors[0];
      throw new Error(`${firstError.code}: ${firstError.message}`);
    }

    const updated = {
      ...test,
      structure: candidateStructure,
      updatedAt: new Date().toISOString()
    };

    this.tests[index] = updated;
    this.save();
    return updatedUnit;
  }

  /**
   * Phase 2: Test Structure Builder — Removes a unit from an Admin Test.
   */
  removeAdminTestStructureUnit(testId, unitId) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Admin Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];
    if (![TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status)) {
      throw new Error(`LIFECYCLE_LOCKED: Cannot remove structure units in status "${test.status}".`);
    }

    if (!test.structure || !Array.isArray(test.structure.units)) {
      test.structure = createDefaultTestStructure(test);
    }

    if (test.structure.units.length <= 1) {
      throw new Error('CANNOT_DELETE_LAST_UNIT: Test must contain at least one structure unit.');
    }

    const targetExists = test.structure.units.some(u => u.id === unitId);
    if (!targetExists) {
      throw new Error(`Unit with ID "${unitId}" not found in test.`);
    }

    // Filter and re-index sequentially while keeping remaining unit IDs stable
    const remainingUnits = test.structure.units
      .filter(u => u.id !== unitId)
      .map((u, idx) => ({ ...u, order: idx }));

    const updatedStructure = {
      ...test.structure,
      mode: remainingUnits.length === 1 ? STRUCTURE_MODES.SINGLE_UNIT : test.structure.mode,
      units: remainingUnits
    };

    const updated = {
      ...test,
      structure: updatedStructure,
      updatedAt: new Date().toISOString()
    };

    this.tests[index] = updated;
    this.save();
    return true;
  }

  /**
   * Phase 2: Test Structure Builder — Reorders units in an Admin Test.
   * Preserves stable unit IDs; only updates `order`.
   */
  reorderAdminTestStructureUnits(testId, orderedUnitIds) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Admin Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];
    if (![TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status)) {
      throw new Error(`LIFECYCLE_LOCKED: Cannot reorder structure units in status "${test.status}".`);
    }

    if (!test.structure || !Array.isArray(test.structure.units)) {
      test.structure = createDefaultTestStructure(test);
    }

    const currentUnits = test.structure.units;
    if (!Array.isArray(orderedUnitIds) || orderedUnitIds.length !== currentUnits.length) {
      throw new Error('INVALID_ORDER: Submitted unit order does not match existing units count.');
    }

    const currentIdSet = new Set(currentUnits.map(u => u.id));
    const newIdSet = new Set(orderedUnitIds);
    if (newIdSet.size !== orderedUnitIds.length || ![...newIdSet].every(id => currentIdSet.has(id))) {
      throw new Error('INVALID_ORDER: Permutation mismatch in reordered unit IDs.');
    }

    const unitMap = new Map(currentUnits.map(u => [u.id, u]));
    const reorderedUnits = orderedUnitIds.map((id, idx) => {
      const u = unitMap.get(id);
      return { ...u, order: idx };
    });

    const updatedStructure = {
      ...test.structure,
      units: reorderedUnits
    };

    const updated = {
      ...test,
      structure: updatedStructure,
      updatedAt: new Date().toISOString()
    };

    this.tests[index] = updated;
    this.save();
    return reorderedUnits;
  }

  /**
   * Phase 2: Test Structure Builder — Validates an Admin Test's structure.
   */
  validateAdminTestStructure(testId, candidateStructure = null) {
    const test = this.getTest(testId);
    if (!test) {
      return {
        valid: false,
        errors: [{ code: 'TEST_NOT_FOUND', message: `Test "${testId}" not found.` }],
        warnings: []
      };
    }

    const structure = candidateStructure || test.structure || createDefaultTestStructure(test);
    return validateStructure(structure, test.examId);
  }

  // ---------------------------------------------------------------------------
  // PHASE 3: SECTION / BLOCK CONFIGURATION METHODS
  // ---------------------------------------------------------------------------

  /**
   * Phase 3: Retrieves a unit's configuration.
   * Auto-initializes default configuration if absent.
   */
  getAdminTestUnitConfiguration(testId, unitId) {
    const test = this.getTest(testId);
    if (!test) {
      throw new Error(`Admin Test with ID "${testId}" not found.`);
    }

    if (!test.structure || !Array.isArray(test.structure.units) || test.structure.units.length === 0) {
      test.structure = createDefaultTestStructure(test);
      this.save();
    }

    const unit = test.structure.units.find(u => u.id === unitId);
    if (!unit) {
      throw new Error(`INVALID_UNIT: Unit with ID "${unitId}" not found in test.`);
    }

    if (!unit.configuration) {
      unit.configuration = normalizeUnitConfiguration(unit.configuration);
      this.save();
    }

    return JSON.parse(JSON.stringify(normalizeUnitConfiguration(unit.configuration)));
  }

  /**
   * Phase 3: Updates a unit's configuration.
   * Lifecycle check: editable in DRAFT and CONFIGURING; locked in READY, PUBLISHED, ACTIVE, COMPLETED, ARCHIVED.
   * Validates configuration against test.examId.
   */
  updateAdminTestUnitConfiguration(testId, unitId, configurationUpdates) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Admin Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];
    if (![TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status)) {
      throw new Error(`LIFECYCLE_LOCKED: Unit configuration cannot be modified while status is "${test.status}". Configuration is editable only in DRAFT and CONFIGURING.`);
    }

    if (!test.structure || !Array.isArray(test.structure.units)) {
      test.structure = createDefaultTestStructure(test);
    }

    const uIndex = test.structure.units.findIndex(u => u.id === unitId);
    if (uIndex === -1) {
      throw new Error(`INVALID_UNIT: Unit with ID "${unitId}" not found in test.`);
    }

    const currentUnit = test.structure.units[uIndex];

    // Validate incoming updates before normalization
    const updateValidation = validateUnitConfiguration(configurationUpdates, test.examId, null);
    if (!updateValidation.valid) {
      const firstError = updateValidation.errors[0];
      throw new Error(`${firstError.code}: ${firstError.message}`);
    }

    const candidateConfig = normalizeUnitConfiguration({
      ...(currentUnit.configuration || DEFAULT_UNIT_CONFIGURATION),
      ...(configurationUpdates || {})
    });

    const validation = validateUnitConfiguration(candidateConfig, test.examId, null);
    if (!validation.valid) {
      const firstError = validation.errors[0];
      throw new Error(`${firstError.code}: ${firstError.message}`);
    }

    test.structure.units[uIndex].configuration = candidateConfig;
    test.updatedAt = new Date().toISOString();

    this.tests[index] = test;
    this.save();
    return JSON.parse(JSON.stringify(candidateConfig));
  }

  /**
   * Phase 3: Sets subjects for a unit.
   */
  setAdminTestUnitSubjects(testId, unitId, subjectIds) {
    return this.updateAdminTestUnitConfiguration(testId, unitId, { subjectIds });
  }

  /**
   * Phase 3: Validates a unit's configuration.
   */
  validateAdminTestUnitConfiguration(testId, unitId) {
    const test = this.getTest(testId);
    if (!test) {
      return {
        valid: false,
        errors: [{ code: 'TEST_NOT_FOUND', message: `Test "${testId}" not found.` }],
        warnings: []
      };
    }

    if (!test.structure || !Array.isArray(test.structure.units)) {
      return {
        valid: false,
        errors: [{ code: 'NO_STRUCTURE', message: 'Test has no structure units.' }],
        warnings: []
      };
    }

    const unit = test.structure.units.find(u => u.id === unitId);
    if (!unit) {
      return {
        valid: false,
        errors: [{ code: 'INVALID_UNIT', message: `Unit "${unitId}" not found.` }],
        warnings: []
      };
    }

    const config = normalizeUnitConfiguration(unit.configuration);
    return validateUnitConfiguration(config, test.examId, null);
  }

  /**
   * Phase 3: Test-level configuration validator across all units.
   */
  validateAdminTestConfiguration(testId) {
    const test = this.getTest(testId);
    if (!test) {
      return {
        valid: false,
        errors: [{ code: 'TEST_NOT_FOUND', message: `Test "${testId}" not found.` }],
        warnings: [],
        units: []
      };
    }

    const structure = test.structure || createDefaultTestStructure(test);
    const units = structure.units || [];

    const unitReports = [];
    const allErrors = [];
    const allWarnings = [];

    units.forEach(u => {
      const config = normalizeUnitConfiguration(u.configuration);
      const res = validateUnitConfiguration(config, test.examId, null);

      const hasAssignedSubjects = Array.isArray(config.subjectIds) && config.subjectIds.length > 0;
      const hasQuestionCount = config.questionCount !== null && config.questionCount !== undefined;
      const isConfigured = res.valid && (hasAssignedSubjects || hasQuestionCount);

      if (!res.valid) {
        res.errors.forEach(err => {
          allErrors.push({ ...err, unitId: u.id, unitName: u.name });
        });
      }

      if (res.warnings && res.warnings.length > 0) {
        res.warnings.forEach(w => {
          allWarnings.push({ ...w, unitId: u.id, unitName: u.name });
        });
      }

      unitReports.push({
        unitId: u.id,
        unitName: u.name,
        code: u.code,
        valid: res.valid,
        isConfigured,
        errors: res.errors,
        warnings: res.warnings
      });
    });

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      units: unitReports
    };
  }

  // ---------------------------------------------------------------------------
  // PHASE 4: QUESTION TYPE SYSTEM METHODS
  // ---------------------------------------------------------------------------

  /**
   * Phase 4: Retrieves Test-level Question Type configuration.
   * Auto-initializes if not present.
   * @param {string} testId
   * @returns {object}
   */
  getAdminTestQuestionTypeConfig(testId) {
    const test = this.getTest(testId);
    if (!test) {
      throw new Error(`Admin Test with ID "${testId}" not found.`);
    }

    if (!test.questionTypeConfig) {
      test.questionTypeConfig = { ...DEFAULT_TEST_QUESTION_TYPE_CONFIG };
      this.save();
    }

    return JSON.parse(JSON.stringify(test.questionTypeConfig));
  }

  /**
   * Phase 4: Updates Test-level Question Type configuration.
   * Lifecycle check: editable in DRAFT and CONFIGURING; locked in READY, PUBLISHED, ACTIVE, COMPLETED, ARCHIVED.
   * @param {string} testId
   * @param {object} configUpdates
   * @returns {object}
   */
  updateAdminTestQuestionTypeConfig(testId, configUpdates) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Admin Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];
    if (![TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status)) {
      throw new Error(`LIFECYCLE_LOCKED: Question Type configuration cannot be modified while status is "${test.status}". Configuration is editable only in DRAFT and CONFIGURING.`);
    }

    const currentConfig = test.questionTypeConfig || DEFAULT_TEST_QUESTION_TYPE_CONFIG;
    const candidateConfig = {
      mode: configUpdates?.mode || currentConfig.mode || QUESTION_TYPE_INHERITANCE_MODES.EXPLICIT,
      allowedTypes: configUpdates?.allowedTypes !== undefined ? configUpdates.allowedTypes : currentConfig.allowedTypes
    };

    const validation = questionTypeService.validateTestQuestionTypeConfig(candidateConfig, test.examId);
    if (!validation.valid) {
      const firstError = validation.errors[0];
      throw new Error(`${firstError.code}: ${firstError.message}`);
    }

    const normalizedTypes = questionTypeService.normalizeQuestionTypeIds(candidateConfig.allowedTypes);
    const finalConfig = {
      mode: candidateConfig.mode,
      allowedTypes: normalizedTypes
    };

    test.questionTypeConfig = finalConfig;
    test.updatedAt = new Date().toISOString();

    this.tests[index] = test;
    this.save();
    return JSON.parse(JSON.stringify(finalConfig));
  }

  /**
   * Phase 4: Retrieves effective and configured Question Types for a specific unit.
   * @param {string} testId
   * @param {string} unitId
   * @returns {object}
   */
  getAdminUnitQuestionTypes(testId, unitId) {
    const test = this.getTest(testId);
    if (!test) {
      throw new Error(`Admin Test with ID "${testId}" not found.`);
    }

    const structure = this.getAdminTestStructure(testId);
    const unit = structure.units.find(u => u.id === unitId);
    if (!unit) {
      throw new Error(`INVALID_UNIT: Unit with ID "${unitId}" not found in test.`);
    }

    const testConfig = this.getAdminTestQuestionTypeConfig(testId);
    const effectiveTypes = questionTypeService.resolveEffectiveUnitQuestionTypes(unit, testConfig);

    const unitConfig = unit.configuration || {};
    const qtConfig = unitConfig.questionTypeConfig || {
      mode: QUESTION_TYPE_INHERITANCE_MODES.INHERIT,
      allowedTypes: []
    };

    return {
      unitId,
      unitName: unit.name,
      mode: qtConfig.mode || QUESTION_TYPE_INHERITANCE_MODES.INHERIT,
      configuredTypes: Array.isArray(qtConfig.allowedTypes) ? [...qtConfig.allowedTypes] : [],
      effectiveTypes
    };
  }

  /**
   * Phase 4: Updates supported Question Types for a specific Section/Unit.
   * Enforces subset rule: section allowedTypes ⊆ test allowedTypes.
   * @param {string} testId
   * @param {string} unitId
   * @param {Array<string>} questionTypeIds
   * @param {string} mode - 'INHERIT' | 'EXPLICIT'
   * @returns {object}
   */
  updateAdminUnitQuestionTypes(testId, unitId, questionTypeIds, mode = QUESTION_TYPE_INHERITANCE_MODES.EXPLICIT) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Admin Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];
    if (![TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status)) {
      throw new Error(`LIFECYCLE_LOCKED: Unit Question Types cannot be modified while status is "${test.status}".`);
    }

    if (!test.structure || !Array.isArray(test.structure.units)) {
      test.structure = createDefaultTestStructure(test);
    }

    const uIndex = test.structure.units.findIndex(u => u.id === unitId);
    if (uIndex === -1) {
      throw new Error(`INVALID_UNIT: Unit with ID "${unitId}" not found in test.`);
    }

    const currentUnit = test.structure.units[uIndex];
    const testConfig = this.getAdminTestQuestionTypeConfig(testId);

    const candidateSectionConfig = {
      mode,
      allowedTypes: Array.isArray(questionTypeIds) ? questionTypeIds : []
    };

    const validation = questionTypeService.validateSectionQuestionTypeConfig(
      candidateSectionConfig,
      testConfig.allowedTypes,
      currentUnit.name
    );

    if (!validation.valid) {
      const firstError = validation.errors[0];
      throw new Error(`${firstError.code}: ${firstError.message}`);
    }

    const normalizedTypes = questionTypeService.normalizeQuestionTypeIds(candidateSectionConfig.allowedTypes);
    const finalSectionQtConfig = {
      mode,
      allowedTypes: normalizedTypes
    };

    const currentConfig = currentUnit.configuration || DEFAULT_UNIT_CONFIGURATION;
    test.structure.units[uIndex].configuration = {
      ...currentConfig,
      questionTypes: normalizedTypes,
      questionTypeConfig: finalSectionQtConfig
    };
    test.updatedAt = new Date().toISOString();

    this.tests[index] = test;
    this.save();
    return JSON.parse(JSON.stringify(finalSectionQtConfig));
  }

  /**
   * Phase 4: Whole-test Question Type validator.
   * @param {string} testId
   * @returns {object}
   */
  validateAdminQuestionTypeConfig(testId) {
    const test = this.getTest(testId);
    if (!test) {
      return {
        valid: false,
        errors: [{ code: 'TEST_NOT_FOUND', message: `Test "${testId}" not found.` }],
        warnings: [],
        units: []
      };
    }

    const testConfig = test.questionTypeConfig || DEFAULT_TEST_QUESTION_TYPE_CONFIG;
    const testValidation = questionTypeService.validateTestQuestionTypeConfig(testConfig, test.examId);

    const allErrors = [...testValidation.errors];
    const allWarnings = [...testValidation.warnings];
    const unitReports = [];

    const structure = test.structure || createDefaultTestStructure(test);
    const units = structure.units || [];

    units.forEach(u => {
      const config = u.configuration || {};
      const qtConfig = config.questionTypeConfig || {
        mode: QUESTION_TYPE_INHERITANCE_MODES.INHERIT,
        allowedTypes: []
      };

      const unitRes = questionTypeService.validateSectionQuestionTypeConfig(
        qtConfig,
        testConfig.allowedTypes,
        u.name
      );

      const effectiveTypes = questionTypeService.resolveEffectiveUnitQuestionTypes(u, testConfig);

      if (!unitRes.valid) {
        unitRes.errors.forEach(err => {
          allErrors.push({ ...err, unitId: u.id, unitName: u.name });
        });
      }

      if (unitRes.warnings && unitRes.warnings.length > 0) {
        unitRes.warnings.forEach(w => {
          allWarnings.push({ ...w, unitId: u.id, unitName: u.name });
        });
      }

      unitReports.push({
        unitId: u.id,
        unitName: u.name,
        code: u.code,
        mode: qtConfig.mode || QUESTION_TYPE_INHERITANCE_MODES.INHERIT,
        configuredTypes: qtConfig.allowedTypes || [],
        effectiveTypes,
        valid: unitRes.valid,
        errors: unitRes.errors,
        warnings: unitRes.warnings
      });
    });

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      testConfig,
      units: unitReports
    };
  }

  // ---------------------------------------------------------------------------
  // PHASE 4: RULES — BLUEPRINT + SCORING + TIMING + NAVIGATION
  // ---------------------------------------------------------------------------

  /**
   * Phase 4: Retrieves Rules configuration for an Admin Test.
   * Returns test.rules if present, otherwise returns null (caller creates defaults).
   * @param {string} testId
   * @returns {object|null}
   */
  getAdminTestRules(testId) {
    const test = this.getTest(testId);
    if (!test) throw new Error(`Admin Test with ID "${testId}" not found.`);
    return test.rules ? JSON.parse(JSON.stringify(test.rules)) : null;
  }

  /**
   * Phase 4: Saves Rules configuration for an Admin Test.
   * Lifecycle check: editable in DRAFT and CONFIGURING; locked afterwards.
   * @param {string} testId
   * @param {object} rules - Full rules object { blueprint, scoring, timing, navigation, version, savedAt }
   * @returns {object} updated test
   */
  saveAdminTestRules(testId, rules) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) throw new Error(`Admin Test with ID "${testId}" not found.`);

    const test = this.tests[index];
    if (![TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status)) {
      throw new Error(
        `LIFECYCLE_LOCKED: Rules cannot be modified while status is "${test.status}". Editable in DRAFT and CONFIGURING.`
      );
    }

    const updated = {
      ...test,
      rules: { ...rules },
      updatedAt: new Date().toISOString()
    };

    this.tests[index] = updated;
    this.save();
    return JSON.parse(JSON.stringify(updated));
  }

  /**
   * Archive a test: DRAFT -> ARCHIVED
   */
  archiveTest(id) {
    const index = this.tests.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Test with ID "${id}" not found.`);
    }

    const updated = {
      ...this.tests[index],
      status: TEST_STATUS.ARCHIVED,
      updatedAt: new Date().toISOString()
    };

    this.tests[index] = updated;
    this.save();
    return updated;
  }

  /**
   * Restore an archived test: ARCHIVED -> DRAFT
   */
  restoreTest(id) {
    const index = this.tests.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Test with ID "${id}" not found.`);
    }

    const updated = {
      ...this.tests[index],
      status: TEST_STATUS.DRAFT,
      updatedAt: new Date().toISOString()
    };

    this.tests[index] = updated;
    this.save();
    return updated;
  }

  /**
   * Permanently delete a test (admin utility)
   */
  deleteTest(id) {
    const initialLen = this.tests.length;
    this.tests = this.tests.filter(t => t.id !== id);
    if (this.tests.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Reset tests to initial prototype seeds
   */
  resetToSeeds() {
    this.tests = JSON.parse(JSON.stringify(INITIAL_ADMIN_TESTS));
    this.save();
    return [...this.tests];
  }

  /**
   * Calculate dynamic summary statistics
   */
  getSummaryStats() {
    const total = this.tests.length;
    const draft = this.tests.filter(t => t.status === TEST_STATUS.DRAFT).length;
    const configuring = this.tests.filter(t => t.status === TEST_STATUS.CONFIGURING).length;
    const ready = this.tests.filter(t => t.status === TEST_STATUS.READY).length;
    const published = this.tests.filter(t => t.status === TEST_STATUS.PUBLISHED).length;
    const active = this.tests.filter(t => t.status === TEST_STATUS.ACTIVE).length;
    const completed = this.tests.filter(t => t.status === TEST_STATUS.COMPLETED).length;
    const archived = this.tests.filter(t => t.status === TEST_STATUS.ARCHIVED).length;

    return {
      total,
      draft,
      configuring,
      ready,
      published,
      active,
      completed,
      archived
    };
  }

  // =========================================================================
  // PHASE 3: CONTENT & QUESTION ASSEMBLY METHODS
  // =========================================================================

  /**
   * Retrieves resolved question objects for an Admin Test in exact order.
   * @param {string} testId
   * @returns {Array<object>}
   */
  getAdminTestQuestions(testId) {
    const test = this.getTest(testId);
    if (!test) {
      throw new Error(`Admin Test with ID "${testId}" not found.`);
    }

    const qIds = Array.isArray(test.content?.questionIds)
      ? test.content.questionIds
      : (Array.isArray(test.questionIds) ? test.questionIds : []);

    return questionService.getQuestionsByIds(qIds);
  }

  /**
   * Adds a single question to an Admin Test.
   * @param {string} testId
   * @param {string|number} questionId
   * @returns {object} Updated test
   */
  addQuestionToAdminTest(testId, questionId) {
    return this.addQuestionsToAdminTest(testId, [questionId]);
  }

  /**
   * Atomically adds multiple questions to an Admin Test with duplicate prevention,
   * lifecycle protection, and question type compatibility checks.
   * @param {string} testId
   * @param {Array<string|number>} questionIds
   * @returns {object} Updated test
   */
  addQuestionsToAdminTest(testId, questionIds) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Admin Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];

    // Lifecycle guard: DRAFT and CONFIGURING are editable
    const isEditable = [TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status);
    if (!isEditable) {
      throw new Error(`LIFECYCLE_LOCKED: Cannot add questions to test in status "${test.status}". Only DRAFT and CONFIGURING tests can be modified.`);
    }

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      throw new Error('No question IDs provided to add.');
    }

    // Duplicate input check
    const inputSet = new Set(questionIds.map(String));
    if (inputSet.size !== questionIds.length) {
      throw new Error('DUPLICATE_QUESTION: Input contains duplicate question IDs.');
    }

    const currentQIds = Array.isArray(test.content?.questionIds)
      ? [...test.content.questionIds]
      : (Array.isArray(test.questionIds) ? [...test.questionIds] : []);

    const existingSet = new Set(currentQIds.map(String));
    const testAllowedTypes = test.questionTypeConfig?.allowedTypes || DEFAULT_TEST_ALLOWED_QUESTION_TYPES;

    // Validate each question
    const validQuestionsToAdd = [];
    for (const rawId of questionIds) {
      const qId = String(rawId);
      if (existingSet.has(qId)) {
        throw new Error(`DUPLICATE_QUESTION: Question "${qId}" is already attached to this test.`);
      }

      const q = questionService.getQuestionById(qId);
      if (!q) {
        throw new Error(`INVALID_QUESTION_REFERENCE: Question "${qId}" not found in Question Bank.`);
      }

      // Check Question Type Compatibility
      const typeCheck = questionBankService.checkQuestionTypeCompatibility(q, testAllowedTypes);
      if (!typeCheck.compatible) {
        throw new Error(`QUESTION_TYPE_MISMATCH: ${typeCheck.error}`);
      }

      // Check Exam Association (if question explicitly specifies an examId)
      const qExamId = q.examId || q.metadata?.examId || q.courseId;
      if (qExamId && test.examId) {
        const cleanQExam = String(qExamId).toLowerCase();
        const cleanTestExam = String(test.examId).toLowerCase();
        if (!cleanQExam.includes(cleanTestExam) && !cleanTestExam.includes(cleanQExam)) {
          throw new Error(`EXAM_MISMATCH: Question "${qId}" belongs to exam "${qExamId}", not "${test.examId}".`);
        }
      }

      validQuestionsToAdd.push(qId);
    }

    const updatedQIds = [...currentQIds, ...validQuestionsToAdd];
    const now = new Date().toISOString();

    const updated = {
      ...test,
      content: {
        ...(test.content || {}),
        questionIds: updatedQIds,
        questionCount: updatedQIds.length
      },
      questionIds: updatedQIds,
      questionCount: updatedQIds.length,
      updatedAt: now
    };

    this.tests[index] = updated;
    this.save();
    return updated;
  }

  /**
   * Removes a question reference from an Admin Test.
   * Does NOT delete the question from the Question Bank (questionService).
   * @param {string} testId
   * @param {string|number} questionId
   * @returns {object} Updated test
   */
  removeQuestionFromAdminTest(testId, questionId) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Admin Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];
    const isEditable = [TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status);
    if (!isEditable) {
      throw new Error(`LIFECYCLE_LOCKED: Cannot remove questions from test in status "${test.status}". Only DRAFT and CONFIGURING tests can be modified.`);
    }

    const currentQIds = Array.isArray(test.content?.questionIds)
      ? test.content.questionIds
      : (Array.isArray(test.questionIds) ? test.questionIds : []);

    const targetId = String(questionId);
    const updatedQIds = currentQIds.filter(id => String(id) !== targetId);
    const now = new Date().toISOString();

    const updated = {
      ...test,
      content: {
        ...(test.content || {}),
        questionIds: updatedQIds,
        questionCount: updatedQIds.length
      },
      questionIds: updatedQIds,
      questionCount: updatedQIds.length,
      updatedAt: now
    };

    this.tests[index] = updated;
    this.save();
    return updated;
  }

  /**
   * Reorders questions in an Admin Test.
   * @param {string} testId
   * @param {Array<string|number>} orderedQuestionIds
   * @returns {object} Updated test
   */
  reorderAdminTestQuestions(testId, orderedQuestionIds) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Admin Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];
    const isEditable = [TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status);
    if (!isEditable) {
      throw new Error(`LIFECYCLE_LOCKED: Cannot reorder questions in test with status "${test.status}".`);
    }

    const currentQIds = Array.isArray(test.content?.questionIds)
      ? test.content.questionIds
      : (Array.isArray(test.questionIds) ? test.questionIds : []);

    const inputList = (orderedQuestionIds || []).map(String);

    if (inputList.length !== currentQIds.length) {
      throw new Error('Reorder list must contain all current questions.');
    }

    const currentSet = new Set(currentQIds.map(String));
    for (const id of inputList) {
      if (!currentSet.has(id)) {
        throw new Error(`Question ID "${id}" is not in current test questions.`);
      }
    }

    const now = new Date().toISOString();
    const updated = {
      ...test,
      content: {
        ...(test.content || {}),
        questionIds: inputList,
        questionCount: inputList.length
      },
      questionIds: inputList,
      questionCount: inputList.length,
      updatedAt: now
    };

    this.tests[index] = updated;
    this.save();
    return updated;
  }

  /**
   * Validates Content phase completeness for an Admin Test.
   * @param {string} testId
   * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
   */
  validateAdminTestContent(testId) {
    const test = this.getTest(testId);
    if (!test) {
      return { valid: false, errors: ['Test not found'], warnings: [] };
    }

    const errors = [];
    const warnings = [];

    const qIds = Array.isArray(test.content?.questionIds)
      ? test.content.questionIds
      : (Array.isArray(test.questionIds) ? test.questionIds : []);

    if (qIds.length === 0) {
      errors.push('NO_QUESTIONS: No questions have been added to this test.');
    }

    const seen = new Set();
    const testAllowedTypes = test.questionTypeConfig?.allowedTypes || DEFAULT_TEST_ALLOWED_QUESTION_TYPES;

    for (const id of qIds) {
      const strId = String(id);
      if (seen.has(strId)) {
        errors.push(`DUPLICATE_QUESTION: Duplicate question ID "${strId}" detected.`);
      }
      seen.add(strId);

      const q = questionService.getQuestionById(strId);
      if (!q) {
        errors.push(`INVALID_REFERENCE: Question "${strId}" not found in Question Bank.`);
      } else {
        const typeCheck = questionBankService.checkQuestionTypeCompatibility(q, testAllowedTypes);
        if (!typeCheck.compatible) {
          warnings.push(`INCOMPATIBLE_TYPE: Question "${strId}" (${q.type}) is not in test's allowed question types.`);
        }
      }
    }

    const targetQuestions = Number(test.targetQuestions) || 0;
    if (targetQuestions > 0 && qIds.length !== targetQuestions) {
      warnings.push(`TARGET_MISMATCH: Current questions count (${qIds.length}) differs from target (${targetQuestions}).`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Phase 4: Save Rules configuration for an admin test
   * @param {string} id
   * @param {object} rules
   * @returns {object} updated test
   */
  saveAdminTestRules(id, rules) {
    const index = this.tests.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Admin test "${id}" not found.`);
    }
    const test = this.tests[index];
    const isEditable = [TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status);
    if (!isEditable) {
      throw new Error(`LIFECYCLE_LOCKED: Cannot edit rules for test with status "${test.status}".`);
    }

    const now = new Date().toISOString();
    const updated = {
      ...test,
      rules,
      updatedAt: now
    };

    this.tests[index] = updated;
    this.save();
    return updated;
  }

  /**
   * Phase 4: Get Rules for an admin test
   * @param {string} id
   * @returns {object|null}
   */
  getAdminTestRules(id) {
    const test = this.getTest(id);
    return test?.rules || null;
  }

  /**
   * Phase 5: Commits a question set and build metadata to an Admin test.
   * @param {string} id
   * @param {Array<string>} questionIds
   * @param {object} buildMeta
   * @returns {object} updated test
   */
  applyAdminTestBuild(id, questionIds = [], buildMeta = {}) {
    const index = this.tests.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Admin test "${id}" not found.`);
    }
    const test = this.tests[index];
    const isEditable = [TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status);
    if (!isEditable) {
      throw new Error(`LIFECYCLE_LOCKED: Cannot apply build for test with status "${test.status}".`);
    }

    const cleanIds = Array.from(new Set(questionIds.map(String)));
    const now = new Date().toISOString();

    const updated = {
      ...test,
      content: {
        ...(test.content || {}),
        questionIds: cleanIds,
        questionCount: cleanIds.length
      },
      questionIds: cleanIds,
      questionCount: cleanIds.length,
      build: {
        mode: buildMeta.mode || 'BLUEPRINT',
        generatedAt: buildMeta.generatedAt || now,
        generatedBy: buildMeta.generatedBy || 'Admin',
        source: buildMeta.source || buildMeta.mode || 'BLUEPRINT'
      },
      updatedAt: now
    };

    this.tests[index] = updated;
    this.save();
    return updated;
  }

  /**
   * Phase 5: Get build state for an Admin test
   * @param {string} id
   * @returns {object|null}
   */
  getAdminTestBuild(id) {
    const test = this.getTest(id);
    return test?.build || null;
  }

  /**
   * Subscribe to updates
   */
  subscribe(callback) {
    if (typeof window === 'undefined') return () => {};
    const handler = (e) => {
      callback(e.detail?.tests || this.tests);
    };
    window.addEventListener(EVENT_ADMIN_TESTS_UPDATED, handler);
    return () => window.removeEventListener(EVENT_ADMIN_TESTS_UPDATED, handler);
  }
}

export const adminTestService = new AdminTestService();

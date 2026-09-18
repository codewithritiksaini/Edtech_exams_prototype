// =============================================================================
// AUTOMATED TEST SUITE: PHASE 4 QUESTION TYPE SYSTEM
// Verifies Question Type Registry, metadata, aliases, capabilities, normalization,
// Test-level configuration, Section-level configuration & inheritance, subset rules,
// Admin & Faculty service methods, RBAC & Lifecycle guards, duplication isolation,
// and zero-regression preservation of Question Assembly.
//
// Run with: node -r ./scripts/setupNodeTestEnv.js scripts/testQuestionTypeSystem.js
// =============================================================================

import assert from 'assert';
import { 
  questionTypeService,
  QUESTION_TYPES,
  QUESTION_TYPE_REGISTRY,
  QUESTION_TYPE_INHERITANCE_MODES,
  DEFAULT_TEST_ALLOWED_QUESTION_TYPES,
  DEFAULT_TEST_QUESTION_TYPE_CONFIG,
  DEFAULT_SECTION_QUESTION_TYPE_CONFIG
} from '../src/services/questionTypeService.js';
import { adminTestService, TEST_STATUS } from '../src/services/adminTestService.js';
import { cbtTestService, FACULTY_TEST_STATUS } from '../src/services/cbtTestService.js';
import { questionService } from '../src/services/questionService.js';
import { 
  normalizeUnitConfiguration, 
  validateUnitConfiguration,
  validateStructure,
  STRUCTURE_MODES,
  UNIT_TYPES
} from '../src/services/examPatternHelper.js';

console.log('🧪 Starting Phase 4 Question Type System Verification Suite...\n');

let totalTests = 0;
let passedTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${description}`);
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    Error: ${err.message}`);
    throw err;
  }
}

// =============================================================================
// 1. CANONICAL REGISTRY & METADATA VERIFICATION
// =============================================================================
console.log('--- 1. CANONICAL REGISTRY & METADATA ---');

test('Registry contains all 7 canonical question types', () => {
  const all = questionTypeService.getAllQuestionTypes();
  assert.strictEqual(all.length, 7);
  const ids = all.map(t => t.id);
  assert.ok(ids.includes(QUESTION_TYPES.SINGLE_BEST_ANSWER));
  assert.ok(ids.includes(QUESTION_TYPES.MULTIPLE_CHOICE));
  assert.ok(ids.includes(QUESTION_TYPES.TRUE_FALSE));
  assert.ok(ids.includes(QUESTION_TYPES.EXTENDED_MATCHING));
  assert.ok(ids.includes(QUESTION_TYPES.CLINICAL_CASE));
  assert.ok(ids.includes(QUESTION_TYPES.IMAGE_BASED));
  assert.ok(ids.includes(QUESTION_TYPES.SHORT_ANSWER));
});

test('Every registry item provides full metadata and capability definitions', () => {
  const all = questionTypeService.getAllQuestionTypes();
  all.forEach(t => {
    assert.ok(t.id, 'Must have ID');
    assert.ok(t.name, 'Must have name');
    assert.ok(t.shortName, 'Must have shortName');
    assert.ok(t.category, 'Must have category');
    assert.ok(t.description, 'Must have description');
    assert.ok(t.badgeClass, 'Must have badgeClass');
    assert.ok(t.capabilities, 'Must have capabilities');
    assert.strictEqual(typeof t.capabilities.options, 'boolean');
    assert.strictEqual(typeof t.capabilities.singleCorrectAnswer, 'boolean');
    assert.strictEqual(typeof t.capabilities.multipleCorrectAnswers, 'boolean');
    assert.strictEqual(typeof t.capabilities.media, 'boolean');
    assert.strictEqual(typeof t.capabilities.clinicalStem, 'boolean');
    assert.strictEqual(typeof t.capabilities.textInput, 'boolean');
  });
});

test('Question type capabilities are correct for representative types', () => {
  const sba = questionTypeService.getQuestionTypeById(QUESTION_TYPES.SINGLE_BEST_ANSWER);
  assert.strictEqual(sba.capabilities.singleCorrectAnswer, true);
  assert.strictEqual(sba.capabilities.multipleCorrectAnswers, false);
  assert.strictEqual(sba.capabilities.textInput, false);

  const mcq = questionTypeService.getQuestionTypeById(QUESTION_TYPES.MULTIPLE_CHOICE);
  assert.strictEqual(mcq.capabilities.singleCorrectAnswer, false);
  assert.strictEqual(mcq.capabilities.multipleCorrectAnswers, true);

  const sa = questionTypeService.getQuestionTypeById(QUESTION_TYPES.SHORT_ANSWER);
  assert.strictEqual(sa.capabilities.textInput, true);
  assert.strictEqual(sa.capabilities.options, false);
});

// =============================================================================
// 2. NORMALIZATION, ALIAS RESOLUTION & INVALID ID REJECTION
// =============================================================================
console.log('\n--- 2. NORMALIZATION & ALIAS RESOLUTION ---');

test('Normalizes exact canonical IDs regardless of casing', () => {
  assert.strictEqual(
    questionTypeService.normalizeQuestionTypeId('single_best_answer'),
    QUESTION_TYPES.SINGLE_BEST_ANSWER
  );
  assert.strictEqual(
    questionTypeService.normalizeQuestionTypeId('MULTIPLE_CHOICE'),
    QUESTION_TYPES.MULTIPLE_CHOICE
  );
  assert.strictEqual(
    questionTypeService.normalizeQuestionTypeId('true_false'),
    QUESTION_TYPES.TRUE_FALSE
  );
});

test('Resolves known aliases to canonical IDs', () => {
  // Aliases for SBA
  assert.strictEqual(questionTypeService.normalizeQuestionTypeId('single_choice'), QUESTION_TYPES.SINGLE_BEST_ANSWER);
  assert.strictEqual(questionTypeService.normalizeQuestionTypeId('sba'), QUESTION_TYPES.SINGLE_BEST_ANSWER);
  assert.strictEqual(questionTypeService.normalizeQuestionTypeId('mcq'), QUESTION_TYPES.SINGLE_BEST_ANSWER);

  // Aliases for MCQ multi-select
  assert.strictEqual(questionTypeService.normalizeQuestionTypeId('multi_select'), QUESTION_TYPES.MULTIPLE_CHOICE);
  assert.strictEqual(questionTypeService.normalizeQuestionTypeId('multiple_response'), QUESTION_TYPES.MULTIPLE_CHOICE);

  // Aliases for Extended Matching
  assert.strictEqual(questionTypeService.normalizeQuestionTypeId('emq'), QUESTION_TYPES.EXTENDED_MATCHING);
  assert.strictEqual(questionTypeService.normalizeQuestionTypeId('matching'), QUESTION_TYPES.EXTENDED_MATCHING);

  // Aliases for Image-based
  assert.strictEqual(questionTypeService.normalizeQuestionTypeId('hotspot'), QUESTION_TYPES.IMAGE_BASED);
  assert.strictEqual(questionTypeService.normalizeQuestionTypeId('image'), QUESTION_TYPES.IMAGE_BASED);

  // Aliases for Short Answer
  assert.strictEqual(questionTypeService.normalizeQuestionTypeId('fill_blank'), QUESTION_TYPES.SHORT_ANSWER);
});

test('Rejects unrecognized question type IDs', () => {
  assert.strictEqual(questionTypeService.normalizeQuestionTypeId('RANDOM_TYPE_XYZ'), null);
  assert.strictEqual(questionTypeService.normalizeQuestionTypeId(''), null);
  assert.strictEqual(questionTypeService.normalizeQuestionTypeId(null), null);
  assert.strictEqual(questionTypeService.isValidQuestionTypeId('NON_EXISTENT'), false);
  assert.strictEqual(questionTypeService.isValidQuestionTypeId('SINGLE_BEST_ANSWER'), true);
});

test('normalizeQuestionTypeIds deduplicates and strips invalid entries', () => {
  const result = questionTypeService.normalizeQuestionTypeIds([
    'sba',
    'SINGLE_BEST_ANSWER',
    'single_choice',
    'INVALID_ID',
    'multi_select',
    'MULTIPLE_CHOICE'
  ]);
  assert.deepStrictEqual(result, [
    QUESTION_TYPES.SINGLE_BEST_ANSWER,
    QUESTION_TYPES.MULTIPLE_CHOICE
  ]);
});

// =============================================================================
// 3. TEST-LEVEL CONFIGURATION VALIDATION
// =============================================================================
console.log('\n--- 3. TEST-LEVEL CONFIGURATION VALIDATION ---');

test('Validates a standard test question type configuration', () => {
  const config = {
    mode: QUESTION_TYPE_INHERITANCE_MODES.EXPLICIT,
    allowedTypes: [
      QUESTION_TYPES.SINGLE_BEST_ANSWER,
      QUESTION_TYPES.IMAGE_BASED
    ]
  };
  const val = questionTypeService.validateTestQuestionTypeConfig(config);
  assert.strictEqual(val.valid, true);
  assert.strictEqual(val.errors.length, 0);
});

test('Fails validation if config is not an object or allowedTypes is not an array', () => {
  const v1 = questionTypeService.validateTestQuestionTypeConfig(null);
  assert.strictEqual(v1.valid, false);

  const v2 = questionTypeService.validateTestQuestionTypeConfig({ allowedTypes: 'not-an-array' });
  assert.strictEqual(v2.valid, false);
  assert.ok(v2.errors.some(e => e.code === 'INVALID_QUESTION_TYPE_LIST'));
});

test('Fails validation if unrecognized question types are present', () => {
  const config = {
    mode: 'EXPLICIT',
    allowedTypes: [QUESTION_TYPES.SINGLE_BEST_ANSWER, 'INVALID_UNKNOWN_TYPE']
  };
  const val = questionTypeService.validateTestQuestionTypeConfig(config);
  assert.strictEqual(val.valid, false);
  assert.ok(val.errors.some(e => e.code === 'INVALID_QUESTION_TYPE'));
});

test('Fails validation if duplicate question types are listed', () => {
  const config = {
    mode: 'EXPLICIT',
    allowedTypes: [QUESTION_TYPES.SINGLE_BEST_ANSWER, QUESTION_TYPES.SINGLE_BEST_ANSWER]
  };
  const val = questionTypeService.validateTestQuestionTypeConfig(config);
  assert.strictEqual(val.valid, false);
  assert.ok(val.errors.some(e => e.code === 'DUPLICATE_QUESTION_TYPE'));
});

test('Warns if allowedTypes is empty', () => {
  const config = {
    mode: 'EXPLICIT',
    allowedTypes: []
  };
  const val = questionTypeService.validateTestQuestionTypeConfig(config);
  assert.strictEqual(val.valid, true);
  assert.ok(val.warnings.some(w => w.code === 'EMPTY_ALLOWED_TYPES'));
});

// =============================================================================
// 4. SECTION-LEVEL CONFIGURATION, INHERITANCE & SUBSET ENFORCEMENT
// =============================================================================
console.log('\n--- 4. SECTION-LEVEL CONFIGURATION & INHERITANCE ---');

test('Section INHERIT mode automatically validates and inherits parent test types', () => {
  const sectionConfig = {
    mode: QUESTION_TYPE_INHERITANCE_MODES.INHERIT,
    allowedTypes: []
  };
  const testAllowed = [
    QUESTION_TYPES.SINGLE_BEST_ANSWER,
    QUESTION_TYPES.EXTENDED_MATCHING
  ];

  const val = questionTypeService.validateSectionQuestionTypeConfig(sectionConfig, testAllowed, 'Section A');
  assert.strictEqual(val.valid, true);

  const effective = questionTypeService.resolveEffectiveUnitQuestionTypes(
    { configuration: { questionTypeConfig: sectionConfig } },
    { allowedTypes: testAllowed }
  );
  assert.deepStrictEqual(effective, testAllowed);
});

test('Section EXPLICIT mode with valid subset passes validation', () => {
  const testAllowed = [
    QUESTION_TYPES.SINGLE_BEST_ANSWER,
    QUESTION_TYPES.MULTIPLE_CHOICE,
    QUESTION_TYPES.IMAGE_BASED
  ];
  const sectionConfig = {
    mode: QUESTION_TYPE_INHERITANCE_MODES.EXPLICIT,
    allowedTypes: [QUESTION_TYPES.SINGLE_BEST_ANSWER, QUESTION_TYPES.IMAGE_BASED]
  };

  const val = questionTypeService.validateSectionQuestionTypeConfig(sectionConfig, testAllowed, 'Section B');
  assert.strictEqual(val.valid, true);
  assert.strictEqual(val.errors.length, 0);

  const effective = questionTypeService.resolveEffectiveUnitQuestionTypes(
    { configuration: { questionTypeConfig: sectionConfig } },
    { allowedTypes: testAllowed }
  );
  assert.deepStrictEqual(effective, [QUESTION_TYPES.SINGLE_BEST_ANSWER, QUESTION_TYPES.IMAGE_BASED]);
});

test('Section EXPLICIT mode fails if it specifies question types not allowed by parent test', () => {
  const testAllowed = [QUESTION_TYPES.SINGLE_BEST_ANSWER];
  const sectionConfig = {
    mode: QUESTION_TYPE_INHERITANCE_MODES.EXPLICIT,
    allowedTypes: [
      QUESTION_TYPES.SINGLE_BEST_ANSWER,
      QUESTION_TYPES.SHORT_ANSWER // Not permitted by test!
    ]
  };

  const val = questionTypeService.validateSectionQuestionTypeConfig(sectionConfig, testAllowed, 'Section C');
  assert.strictEqual(val.valid, false);
  assert.ok(val.errors.some(e => e.code === 'SECTION_TYPE_NOT_ALLOWED'));
});

test('normalizeUnitConfiguration applies default questionTypeConfig and questionTypes', () => {
  const normalized = normalizeUnitConfiguration(null);
  assert.ok(normalized.questionTypeConfig);
  assert.strictEqual(normalized.questionTypeConfig.mode, QUESTION_TYPE_INHERITANCE_MODES.INHERIT);
  assert.deepStrictEqual(normalized.questionTypeConfig.allowedTypes, []);
  assert.deepStrictEqual(normalized.questionTypes, []);
});

test('validateUnitConfiguration validates section question types against testAllowedQuestionTypes', () => {
  const testAllowed = [QUESTION_TYPES.SINGLE_BEST_ANSWER, QUESTION_TYPES.MULTIPLE_CHOICE];
  
  // Valid unit configuration with inheritance
  const validInherit = validateUnitConfiguration({
    enabled: true,
    questionTypeConfig: { mode: 'INHERIT', allowedTypes: [] }
  }, null, null, testAllowed);
  assert.strictEqual(validInherit.valid, true);

  // Invalid unit configuration with forbidden type
  const invalidExplicit = validateUnitConfiguration({
    enabled: true,
    questionTypeConfig: {
      mode: 'EXPLICIT',
      allowedTypes: [QUESTION_TYPES.CLINICAL_CASE]
    }
  }, null, null, testAllowed);
  assert.strictEqual(invalidExplicit.valid, false);
  assert.ok(invalidExplicit.errors.some(e => e.code === 'SECTION_TYPE_NOT_ALLOWED'));
});

// =============================================================================
// 5. ADMIN TEST SERVICE QUESTION TYPE SYSTEM
// =============================================================================
console.log('\n--- 5. ADMIN TEST SERVICE QUESTION TYPE SYSTEM ---');

test('Admin test initializes with default questionTypeConfig', () => {
  const created = adminTestService.createTest({
    name: 'Admin Question Type Test 1',
    code: 'ADM_QT_01',
    examId: 'neet-pg',
    testType: 'MOCK'
  });

  assert.ok(created.questionTypeConfig);
  assert.strictEqual(created.questionTypeConfig.mode, 'EXPLICIT');
  assert.ok(Array.isArray(created.questionTypeConfig.allowedTypes));
  assert.ok(created.questionTypeConfig.allowedTypes.includes(QUESTION_TYPES.SINGLE_BEST_ANSWER));

  const config = adminTestService.getAdminTestQuestionTypeConfig(created.id);
  assert.deepStrictEqual(config, created.questionTypeConfig);
});

test('updateAdminTestQuestionTypeConfig updates test allowed types when test is draft', () => {
  const testObj = adminTestService.createTest({
    name: 'Admin Question Type Test 2',
    code: 'ADM_QT_02',
    examId: 'neet-pg',
    testType: 'MOCK'
  });

  const updated = adminTestService.updateAdminTestQuestionTypeConfig(testObj.id, {
    allowedTypes: [QUESTION_TYPES.SINGLE_BEST_ANSWER, QUESTION_TYPES.EXTENDED_MATCHING]
  });

  assert.strictEqual(updated.allowedTypes.length, 2);
  assert.deepStrictEqual(updated.allowedTypes, [
    QUESTION_TYPES.SINGLE_BEST_ANSWER,
    QUESTION_TYPES.EXTENDED_MATCHING
  ]);
});

test('updateAdminTestQuestionTypeConfig rejects invalid question types', () => {
  const testObj = adminTestService.createTest({
    name: 'Admin Question Type Test 3',
    code: 'ADM_QT_03',
    examId: 'neet-pg',
    testType: 'MOCK'
  });

  assert.throws(() => {
    adminTestService.updateAdminTestQuestionTypeConfig(testObj.id, {
      allowedTypes: ['COMPLETELY_BOGUS_TYPE']
    });
  }, /not a recognized platform question type/i);
});

test('Admin section question types can be set to INHERIT or valid EXPLICIT subset', () => {
  const testObj = adminTestService.createTest({
    name: 'Admin Question Type Test 4',
    code: 'ADM_QT_04',
    examId: 'neet-pg',
    testType: 'MOCK'
  });

  // Limit test allowed types to SBA and Image Based
  adminTestService.updateAdminTestQuestionTypeConfig(testObj.id, {
    allowedTypes: [QUESTION_TYPES.SINGLE_BEST_ANSWER, QUESTION_TYPES.IMAGE_BASED]
  });

  // Add a section
  const section = adminTestService.addAdminTestStructureUnit(testObj.id, {
    name: 'Biochemistry Section',
    code: 'BIO_SEC'
  });

  // Initial state should inherit
  const initialUnitConfig = adminTestService.getAdminUnitQuestionTypes(testObj.id, section.id);
  assert.strictEqual(initialUnitConfig.mode, 'INHERIT');
  assert.deepStrictEqual(initialUnitConfig.effectiveTypes, [
    QUESTION_TYPES.SINGLE_BEST_ANSWER,
    QUESTION_TYPES.IMAGE_BASED
  ]);

  // Update section to valid explicit subset (SBA only)
  const updatedSection = adminTestService.updateAdminUnitQuestionTypes(
    testObj.id,
    section.id,
    [QUESTION_TYPES.SINGLE_BEST_ANSWER],
    'EXPLICIT'
  );
  assert.strictEqual(updatedSection.mode, 'EXPLICIT');
  assert.deepStrictEqual(updatedSection.allowedTypes, [
    QUESTION_TYPES.SINGLE_BEST_ANSWER
  ]);

  const reloaded = adminTestService.getAdminUnitQuestionTypes(testObj.id, section.id);
  assert.strictEqual(reloaded.mode, 'EXPLICIT');
  assert.deepStrictEqual(reloaded.configuredTypes, [QUESTION_TYPES.SINGLE_BEST_ANSWER]);
});

test('updateAdminUnitQuestionTypes rejects explicit types outside parent test allowed types', () => {
  const testObj = adminTestService.createTest({
    name: 'Admin Question Type Test 5',
    code: 'ADM_QT_05',
    examId: 'neet-pg',
    testType: 'MOCK'
  });

  adminTestService.updateAdminTestQuestionTypeConfig(testObj.id, {
    allowedTypes: [QUESTION_TYPES.SINGLE_BEST_ANSWER]
  });

  const section = adminTestService.addAdminTestStructureUnit(testObj.id, {
    name: 'Pathology Section',
    code: 'PATH_SEC'
  });

  assert.throws(() => {
    adminTestService.updateAdminUnitQuestionTypes(
      testObj.id,
      section.id,
      [QUESTION_TYPES.SHORT_ANSWER], // Not permitted at test level
      'EXPLICIT'
    );
  }, /not permitted by the test configuration/i);
});

test('Admin question type modification respects lifecycle locks', () => {
  const testObj = adminTestService.createTest({
    name: 'Admin Locked Test',
    code: 'ADM_LOCKED_01',
    examId: 'neet-pg',
    testType: 'MOCK'
  });

  const section = adminTestService.addAdminTestStructureUnit(testObj.id, {
    name: 'Locked Section',
    code: 'LOCK_SEC'
  });

  // Force test status to PUBLISHED
  const testA = adminTestService.getTest(testObj.id);
  testA.status = TEST_STATUS.PUBLISHED;
  adminTestService.save();

  // Attempting to modify test-level question types should fail
  assert.throws(() => {
    adminTestService.updateAdminTestQuestionTypeConfig(testObj.id, {
      allowedTypes: [QUESTION_TYPES.SINGLE_BEST_ANSWER]
    });
  }, /LIFECYCLE_LOCKED/i);

  // Attempting to modify section-level question types should fail
  assert.throws(() => {
    adminTestService.updateAdminUnitQuestionTypes(
      testObj.id,
      section.id,
      [QUESTION_TYPES.SINGLE_BEST_ANSWER],
      'EXPLICIT'
    );
  }, /LIFECYCLE_LOCKED/i);
});

test('Admin test duplication performs deep copy of questionTypeConfig', () => {
  const original = adminTestService.createTest({
    name: 'Original Admin Test with Custom QT',
    code: 'ADM_ORIG_QT',
    examId: 'neet-pg',
    testType: 'MOCK'
  });

  adminTestService.updateAdminTestQuestionTypeConfig(original.id, {
    allowedTypes: [QUESTION_TYPES.CLINICAL_CASE, QUESTION_TYPES.IMAGE_BASED]
  });

  const duplicated = adminTestService.duplicateTest(original.id, 'Duplicated Admin QT Test', 'ADM_DUP_QT');
  assert.notStrictEqual(duplicated.id, original.id);
  assert.deepStrictEqual(
    duplicated.questionTypeConfig.allowedTypes,
    [QUESTION_TYPES.CLINICAL_CASE, QUESTION_TYPES.IMAGE_BASED]
  );

  // Mutating duplicated should not affect original
  adminTestService.updateAdminTestQuestionTypeConfig(duplicated.id, {
    allowedTypes: [QUESTION_TYPES.SINGLE_BEST_ANSWER]
  });

  const freshOriginal = adminTestService.getTest(original.id);
  assert.deepStrictEqual(
    freshOriginal.questionTypeConfig.allowedTypes,
    [QUESTION_TYPES.CLINICAL_CASE, QUESTION_TYPES.IMAGE_BASED]
  );
});

// =============================================================================
// 6. FACULTY TEST SERVICE QUESTION TYPE SYSTEM
// =============================================================================
console.log('\n--- 6. FACULTY TEST SERVICE QUESTION TYPE SYSTEM ---');

const facultyDrSiddharth = {
  id: 'fac-1',
  name: 'Dr. Siddharth V. (AIIMS)',
  assignedExams: ['neet-pg', 'usmle', 'plab'],
  assignedSubjects: ['sub-neet-cardio', 'sub-neet-pharma', 'sub-usmle-cvs', 'sub-plab-acute']
};

const facultyDrMarcus = {
  id: 'fac-3',
  name: 'Dr. Marcus Vance (MRCP)',
  assignedExams: ['plab'],
  assignedSubjects: ['sub-plab-acute']
};

test('Faculty test initializes with default questionTypeConfig', () => {
  const created = cbtTestService.createFacultyTest({
    name: 'Faculty Question Type Test 1',
    examId: 'neet-pg',
    testType: 'SUBJECT_TEST'
  }, facultyDrSiddharth);

  assert.ok(created.questionTypeConfig);
  assert.strictEqual(created.questionTypeConfig.mode, 'EXPLICIT');
  assert.ok(Array.isArray(created.questionTypeConfig.allowedTypes));

  const config = cbtTestService.getFacultyTestQuestionTypeConfig(created.id, facultyDrSiddharth);
  assert.deepStrictEqual(config, created.questionTypeConfig);
});

test('Faculty test question type updates enforce faculty ownership', () => {
  const created = cbtTestService.createFacultyTest({
    name: 'Faculty Ownership Test',
    examId: 'neet-pg',
    testType: 'SUBJECT_TEST'
  }, facultyDrSiddharth);

  assert.throws(() => {
    cbtTestService.updateFacultyTestQuestionTypeConfig(
      created.id,
      { allowedTypes: [QUESTION_TYPES.SINGLE_BEST_ANSWER] },
      facultyDrMarcus // Dr. Marcus is not the owner!
    );
  }, /Unauthorized/i);
});

test('Faculty test question type updates succeed for owner in draft status', () => {
  const created = cbtTestService.createFacultyTest({
    name: 'Faculty QT Update Test',
    examId: 'neet-pg',
    testType: 'SUBJECT_TEST'
  }, facultyDrSiddharth);

  const updated = cbtTestService.updateFacultyTestQuestionTypeConfig(
    created.id,
    { allowedTypes: [QUESTION_TYPES.SINGLE_BEST_ANSWER, QUESTION_TYPES.TRUE_FALSE] },
    facultyDrSiddharth
  );

  assert.deepStrictEqual(updated.allowedTypes, [
    QUESTION_TYPES.SINGLE_BEST_ANSWER,
    QUESTION_TYPES.TRUE_FALSE
  ]);
});

test('Faculty section question types support INHERIT and subset EXPLICIT', () => {
  const created = cbtTestService.createFacultyTest({
    name: 'Faculty Section QT Test',
    examId: 'neet-pg',
    testType: 'SUBJECT_TEST'
  }, facultyDrSiddharth);

  cbtTestService.updateFacultyTestQuestionTypeConfig(
    created.id,
    { allowedTypes: [QUESTION_TYPES.SINGLE_BEST_ANSWER, QUESTION_TYPES.IMAGE_BASED] },
    facultyDrSiddharth
  );

  const structure = cbtTestService.getFacultyTestStructure(created.id, facultyDrSiddharth);
  const section = structure.units[0];

  // Check initial inheritance
  const unitInfo = cbtTestService.getFacultyUnitQuestionTypes(created.id, section.id, facultyDrSiddharth);
  assert.strictEqual(unitInfo.mode, 'INHERIT');
  assert.deepStrictEqual(unitInfo.effectiveTypes, [
    QUESTION_TYPES.SINGLE_BEST_ANSWER,
    QUESTION_TYPES.IMAGE_BASED
  ]);

  // Update section to explicit subset
  const updatedUnit = cbtTestService.updateFacultyUnitQuestionTypes(
    created.id,
    section.id,
    [QUESTION_TYPES.SINGLE_BEST_ANSWER],
    facultyDrSiddharth,
    'EXPLICIT'
  );
  assert.strictEqual(updatedUnit.mode, 'EXPLICIT');
  assert.deepStrictEqual(updatedUnit.allowedTypes, [
    QUESTION_TYPES.SINGLE_BEST_ANSWER
  ]);

  const reloadedUnit = cbtTestService.getFacultyUnitQuestionTypes(created.id, section.id, facultyDrSiddharth);
  assert.strictEqual(reloadedUnit.mode, 'EXPLICIT');
  assert.deepStrictEqual(reloadedUnit.configuredTypes, [QUESTION_TYPES.SINGLE_BEST_ANSWER]);

  // Reject explicit type not allowed by test
  assert.throws(() => {
    cbtTestService.updateFacultyUnitQuestionTypes(
      created.id,
      section.id,
      [QUESTION_TYPES.EXTENDED_MATCHING], // Not allowed at test level
      facultyDrSiddharth,
      'EXPLICIT'
    );
  }, /not permitted by the test configuration/i);
});

test('Faculty question type modification respects lifecycle locks (LIVE/COMPLETED)', () => {
  const created = cbtTestService.createFacultyTest({
    name: 'Faculty Locked Test',
    examId: 'neet-pg',
    testType: 'SUBJECT_TEST'
  }, facultyDrSiddharth);

  // Lock status to LIVE
  const found = cbtTestService.getTestById(created.id);
  found.status = FACULTY_TEST_STATUS.LIVE;
  cbtTestService.saveTests();

  assert.throws(() => {
    cbtTestService.updateFacultyTestQuestionTypeConfig(
      created.id,
      { allowedTypes: [QUESTION_TYPES.SINGLE_BEST_ANSWER] },
      facultyDrSiddharth
    );
  }, /LIFECYCLE_LOCKED/i);
});

test('Faculty test duplication creates independent deep-copy of questionTypeConfig', () => {
  const original = cbtTestService.createFacultyTest({
    name: 'Original Faculty Test QT',
    examId: 'neet-pg',
    testType: 'SUBJECT_TEST'
  }, facultyDrSiddharth);

  cbtTestService.updateFacultyTestQuestionTypeConfig(
    original.id,
    { allowedTypes: [QUESTION_TYPES.SHORT_ANSWER, QUESTION_TYPES.CLINICAL_CASE] },
    facultyDrSiddharth
  );

  const dup = cbtTestService.duplicateFacultyTest(original.id, facultyDrSiddharth);
  assert.notStrictEqual(dup.id, original.id);
  assert.deepStrictEqual(dup.questionTypeConfig.allowedTypes, [
    QUESTION_TYPES.SHORT_ANSWER,
    QUESTION_TYPES.CLINICAL_CASE
  ]);

  // Modify duplicated test
  cbtTestService.updateFacultyTestQuestionTypeConfig(
    dup.id,
    { allowedTypes: [QUESTION_TYPES.SINGLE_BEST_ANSWER] },
    facultyDrSiddharth
  );

  const freshOriginal = cbtTestService.getTestById(original.id);
  assert.deepStrictEqual(freshOriginal.questionTypeConfig.allowedTypes, [
    QUESTION_TYPES.SHORT_ANSWER,
    QUESTION_TYPES.CLINICAL_CASE
  ]);
});

// =============================================================================
// 7. PRESERVATION OF FACULTY QUESTION ASSEMBLY & SOFT WARNINGS
// =============================================================================
console.log('\n--- 7. QUESTION ASSEMBLY PRESERVATION & SOFT WARNINGS ---');

test('Existing faculty question assembly functions without regression', () => {
  const testObj = cbtTestService.createFacultyTest({
    name: 'Faculty Question Assembly Test',
    examId: 'neet-pg',
    testType: 'PRACTICE_TEST'
  }, facultyDrSiddharth);

  assert.ok(Array.isArray(testObj.content?.questionIds || testObj.questionIds));
  
  // Ensure test questions exist in questionService
  if (!questionService.getQuestionById('q-neet-01')) {
    questionService.createQuestion({
      id: 'q-neet-01',
      type: 'single_choice',
      status: 'published',
      content: { prompt: 'Cardio Q1' },
      metadata: { examId: 'neet-pg', subjectId: 'sub-neet-cardio' }
    });
  }
  if (!questionService.getQuestionById('q-neet-02')) {
    questionService.createQuestion({
      id: 'q-neet-02',
      type: 'single_choice',
      status: 'published',
      content: { prompt: 'Cardio Q2' },
      metadata: { examId: 'neet-pg', subjectId: 'sub-neet-cardio' }
    });
  }

  // Set question IDs via addQuestionsToFacultyTest
  const sampleQIds = ['q-neet-01', 'q-neet-02'];
  const updated = cbtTestService.addQuestionsToFacultyTest(testObj.id, sampleQIds, facultyDrSiddharth);
  const currentIds = updated.content?.questionIds || updated.questionIds;
  assert.deepStrictEqual(currentIds, sampleQIds);

  // Validate test content
  const val = cbtTestService.validateFacultyTestContent(testObj.id, facultyDrSiddharth);
  assert.strictEqual(typeof val.valid, 'boolean');
  assert.strictEqual(val.questionCount, 2);
});

test('validateFacultyTestContent generates soft non-blocking warning when question type is incompatible', () => {
  const testObj = cbtTestService.createFacultyTest({
    name: 'Faculty Mismatched QT Warning Test',
    examId: 'neet-pg',
    testType: 'PRACTICE_TEST'
  }, facultyDrSiddharth);

  // Restrict test allowed types to SHORT_ANSWER only
  cbtTestService.updateFacultyTestQuestionTypeConfig(
    testObj.id,
    { allowedTypes: [QUESTION_TYPES.SHORT_ANSWER] },
    facultyDrSiddharth
  );

  // Attach a single choice question ('q-neet-01' is single_choice in demo questions)
  cbtTestService.addQuestionToFacultyTest(testObj.id, 'q-neet-01', facultyDrSiddharth);

  const val = cbtTestService.validateFacultyTestContent(testObj.id, facultyDrSiddharth);
  
  // Notice: valid is still true (non-blocking), but warnings contains QUESTION_TYPE_NOT_ALLOWED
  assert.strictEqual(val.valid, true);
  assert.ok(
    val.warnings.some(w => typeof w === 'string' && w.includes('QUESTION_TYPE_NOT_ALLOWED')),
    'Should have QUESTION_TYPE_NOT_ALLOWED soft warning'
  );
  // Questions array remains intact
  const fresh = cbtTestService.getTestById(testObj.id);
  const qIds = fresh.content?.questionIds || fresh.questionIds;
  assert.deepStrictEqual(qIds, ['q-neet-01']);
});

// =============================================================================
// SUMMARY
// =============================================================================
console.log(`\n🎉 All Phase 4 Question Type System tests passed successfully!`);
console.log(`   Passed: ${passedTests} / ${totalTests} test assertions.\n`);

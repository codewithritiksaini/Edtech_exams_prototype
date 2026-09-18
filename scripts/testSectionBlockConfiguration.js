// =============================================================================
// AUTOMATED TEST SUITE: PHASE 3 SECTION / BLOCK CONFIGURATION
// Verifies Admin & Faculty unit configuration, subject mapping, question counts,
// instructions, randomization flags, lifecycle guards, RBAC scope, test-level
// validation, duplication isolation, and question assembly preservation.
// Run with: node -r ./scripts/setupNodeTestEnv.js scripts/testSectionBlockConfiguration.js
// =============================================================================

import assert from 'assert';
import { adminTestService, TEST_STATUS } from '../src/services/adminTestService.js';
import { cbtTestService, FACULTY_TEST_STATUS } from '../src/services/cbtTestService.js';
import { 
  DEFAULT_UNIT_CONFIGURATION,
  normalizeUnitConfiguration,
  validateUnitConfiguration,
  STRUCTURE_MODES,
  UNIT_TYPES,
  EXAM_MAPPING_TYPES,
  getExamPattern
} from '../src/services/examPatternHelper.js';
import { curriculumService } from '../src/services/curriculumService.js';
import { peopleService } from '../src/services/peopleService.js';

console.log('🧪 Starting Phase 3 Section / Block Configuration Verification Suite...\n');

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
// 1. CONFIGURATION NORMALIZATION & VALIDATOR HELPER SUITE
// =============================================================================
console.log('--- 1. CONFIGURATION NORMALIZATION & VALIDATION ---');

test('normalizeUnitConfiguration applies default values for missing or empty fields', () => {
  const normalized = normalizeUnitConfiguration(null);
  assert.strictEqual(normalized.enabled, true);
  assert.deepStrictEqual(normalized.subjectIds, []);
  assert.strictEqual(normalized.instructions, '');
  assert.strictEqual(normalized.questionCount, null);
  assert.strictEqual(normalized.required, true);
  assert.strictEqual(normalized.randomizeQuestions, false);
  assert.strictEqual(normalized.randomizeOptions, false);
  assert.strictEqual(normalized.notes, '');
});

test('normalizeUnitConfiguration safely parses numeric questionCount and preserves booleans', () => {
  const config = normalizeUnitConfiguration({
    questionCount: '45',
    required: false,
    randomizeQuestions: true,
    randomizeOptions: true,
    instructions: 'Section instructions text',
    notes: 'Internal section notes'
  });
  assert.strictEqual(config.questionCount, 45);
  assert.strictEqual(config.required, false);
  assert.strictEqual(config.randomizeQuestions, true);
  assert.strictEqual(config.randomizeOptions, true);
  assert.strictEqual(config.instructions, 'Section instructions text');
  assert.strictEqual(config.notes, 'Internal section notes');
});

// =============================================================================
// 2. ADMIN SECTION / BLOCK CONFIGURATION SUITE
// =============================================================================
console.log('\n--- 2. ADMIN SECTION / BLOCK CONFIGURATION ---');

test('Admin: Unit configuration can be fetched with default initialization', () => {
  const adminTest = adminTestService.getTest('test-neetpg-med-01'); // DRAFT status
  assert(adminTest, 'Admin test must exist');

  const structure = adminTestService.getAdminTestStructure(adminTest.id);
  assert(structure.units.length > 0);
  const firstUnit = structure.units[0];

  const config = adminTestService.getAdminTestUnitConfiguration(adminTest.id, firstUnit.id);
  assert(config, 'Configuration must be returned');
  assert.strictEqual(config.enabled, true);
  assert.strictEqual(config.required, true);
  assert.strictEqual(config.questionCount, null);
  assert(Array.isArray(config.subjectIds));
});

test('Admin: Unit configuration can be updated with valid fields', () => {
  const adminTest = adminTestService.getTest('test-neetpg-med-01');
  const structure = adminTestService.getAdminTestStructure(adminTest.id);
  const firstUnit = structure.units[0];

  const updated = adminTestService.updateAdminTestUnitConfiguration(adminTest.id, firstUnit.id, {
    questionCount: 40,
    required: true,
    instructions: 'Read clinical vignettes carefully before choosing the single best answer.',
    randomizeQuestions: true,
    randomizeOptions: false,
    notes: 'NEET-PG Part A Core'
  });

  assert.strictEqual(updated.questionCount, 40);
  assert.strictEqual(updated.required, true);
  assert.strictEqual(updated.randomizeQuestions, true);
  assert.strictEqual(updated.randomizeOptions, false);
  assert.strictEqual(updated.instructions, 'Read clinical vignettes carefully before choosing the single best answer.');
  assert.strictEqual(updated.notes, 'NEET-PG Part A Core');

  // Verify persistence
  const reloaded = adminTestService.getAdminTestUnitConfiguration(adminTest.id, firstUnit.id);
  assert.strictEqual(reloaded.questionCount, 40);
  assert.strictEqual(reloaded.randomizeQuestions, true);
});

test('Admin: Valid subjects within selected Exam can be assigned', () => {
  const adminTest = adminTestService.getTest('test-neetpg-med-01'); // neet-pg
  const structure = adminTestService.getAdminTestStructure(adminTest.id);
  const firstUnit = structure.units[0];

  // neet-pg subjects: 'sub-neet-cardio', 'sub-neet-pulmo'
  const updated = adminTestService.setAdminTestUnitSubjects(adminTest.id, firstUnit.id, [
    'sub-neet-cardio',
    'sub-neet-pulmo'
  ]);

  assert.deepStrictEqual(updated.subjectIds, ['sub-neet-cardio', 'sub-neet-pulmo']);

  const reloaded = adminTestService.getAdminTestUnitConfiguration(adminTest.id, firstUnit.id);
  assert.deepStrictEqual(reloaded.subjectIds, ['sub-neet-cardio', 'sub-neet-pulmo']);
});

test('Admin: Invalid subject format (non-array or empty strings) is rejected', () => {
  const adminTest = adminTestService.getTest('test-neetpg-med-01');
  const structure = adminTestService.getAdminTestStructure(adminTest.id);
  const firstUnit = structure.units[0];

  assert.throws(() => {
    adminTestService.updateAdminTestUnitConfiguration(adminTest.id, firstUnit.id, {
      subjectIds: 'not-an-array'
    });
  }, /INVALID_SUBJECT/);

  assert.throws(() => {
    adminTestService.updateAdminTestUnitConfiguration(adminTest.id, firstUnit.id, {
      subjectIds: ['']
    });
  }, /INVALID_SUBJECT/);
});

test('Admin: CRITICAL EXAM SCOPE — Cross-Exam subjects are strictly rejected', () => {
  const adminTest = adminTestService.getTest('test-neetpg-med-01'); // neet-pg
  const structure = adminTestService.getAdminTestStructure(adminTest.id);
  const firstUnit = structure.units[0];

  // 'sub-usmle-cvs' is a USMLE subject, not NEET-PG!
  assert.throws(() => {
    adminTestService.setAdminTestUnitSubjects(adminTest.id, firstUnit.id, [
      'sub-usmle-cvs'
    ]);
  }, /SUBJECT_EXAM_MISMATCH/);
});

test('Admin: Question count accepts valid positive integer', () => {
  const adminTest = adminTestService.getTest('test-neetpg-med-01');
  const structure = adminTestService.getAdminTestStructure(adminTest.id);
  const firstUnit = structure.units[0];

  const updated = adminTestService.updateAdminTestUnitConfiguration(adminTest.id, firstUnit.id, {
    questionCount: 50
  });
  assert.strictEqual(updated.questionCount, 50);

  // null clears question count
  const cleared = adminTestService.updateAdminTestUnitConfiguration(adminTest.id, firstUnit.id, {
    questionCount: null
  });
  assert.strictEqual(cleared.questionCount, null);
});

test('Admin: Invalid question counts (<= 0, float, NaN) are strictly rejected', () => {
  const adminTest = adminTestService.getTest('test-neetpg-med-01');
  const structure = adminTestService.getAdminTestStructure(adminTest.id);
  const firstUnit = structure.units[0];

  assert.throws(() => {
    adminTestService.updateAdminTestUnitConfiguration(adminTest.id, firstUnit.id, {
      questionCount: 0
    });
  }, /INVALID_QUESTION_COUNT/);

  assert.throws(() => {
    adminTestService.updateAdminTestUnitConfiguration(adminTest.id, firstUnit.id, {
      questionCount: -10
    });
  }, /INVALID_QUESTION_COUNT/);

  assert.throws(() => {
    adminTestService.updateAdminTestUnitConfiguration(adminTest.id, firstUnit.id, {
      questionCount: 12.5
    });
  }, /INVALID_QUESTION_COUNT/);

  assert.throws(() => {
    adminTestService.updateAdminTestUnitConfiguration(adminTest.id, firstUnit.id, {
      questionCount: 'invalid_number'
    });
  }, /INVALID_QUESTION_COUNT/);
});

test('Admin: Randomization flags require boolean values', () => {
  const adminTest = adminTestService.getTest('test-neetpg-med-01');
  const structure = adminTestService.getAdminTestStructure(adminTest.id);
  const firstUnit = structure.units[0];

  assert.throws(() => {
    adminTestService.updateAdminTestUnitConfiguration(adminTest.id, firstUnit.id, {
      randomizeQuestions: 'yes'
    });
  }, /INVALID_RANDOMIZATION_VALUE/);

  assert.throws(() => {
    adminTestService.updateAdminTestUnitConfiguration(adminTest.id, firstUnit.id, {
      randomizeOptions: 1
    });
  }, /INVALID_RANDOMIZATION_VALUE/);
});

test('Admin: Whole-test configuration validator reports per-unit configuration state', () => {
  const adminTest = adminTestService.getTest('test-neetpg-med-01');
  const structure = adminTestService.getAdminTestStructure(adminTest.id);
  const firstUnit = structure.units[0];

  // Configure first unit
  adminTestService.updateAdminTestUnitConfiguration(adminTest.id, firstUnit.id, {
    subjectIds: ['sub-neet-cardio'],
    questionCount: 40
  });

  const testReport = adminTestService.validateAdminTestConfiguration(adminTest.id);
  assert(testReport.valid, 'Test configuration must be valid');
  assert.strictEqual(testReport.units.length, structure.units.length);
  assert.strictEqual(testReport.units[0].isConfigured, true);
  assert.strictEqual(testReport.units[0].valid, true);
});

test('Admin: Lifecycle guards — DRAFT and CONFIGURING allow edits; locked states reject modification', () => {
  // CONFIGURING status test
  const configTest = adminTestService.getTest('test-neetpg-mock-01'); // status: CONFIGURING
  const configStructure = adminTestService.getAdminTestStructure(configTest.id);
  const unit = configStructure.units[0];

  const updated = adminTestService.updateAdminTestUnitConfiguration(configTest.id, unit.id, {
    questionCount: 45
  });
  assert.strictEqual(updated.questionCount, 45);

  // PUBLISHED test should be locked
  const pubTest = adminTestService.getTest('test-plab1-mock-01'); // status: PUBLISHED
  const pubStructure = adminTestService.getAdminTestStructure(pubTest.id);
  assert.throws(() => {
    adminTestService.updateAdminTestUnitConfiguration(pubTest.id, pubStructure.units[0].id, {
      questionCount: 60
    });
  }, /LIFECYCLE_LOCKED/);

  // READY, ACTIVE, COMPLETED tests should also be locked
  const testA = adminTestService.getTest('test-neetpg-med-01');
  const unitId = testA.structure.units[0].id;

  // READY
  testA.status = TEST_STATUS.READY;
  adminTestService.save();
  assert.throws(() => {
    adminTestService.updateAdminTestUnitConfiguration(testA.id, unitId, { questionCount: 70 });
  }, /LIFECYCLE_LOCKED/);

  // ACTIVE
  testA.status = TEST_STATUS.ACTIVE;
  adminTestService.save();
  assert.throws(() => {
    adminTestService.updateAdminTestUnitConfiguration(testA.id, unitId, { questionCount: 70 });
  }, /LIFECYCLE_LOCKED/);

  // COMPLETED
  testA.status = TEST_STATUS.COMPLETED;
  adminTestService.save();
  assert.throws(() => {
    adminTestService.updateAdminTestUnitConfiguration(testA.id, unitId, { questionCount: 70 });
  }, /LIFECYCLE_LOCKED/);

  // Restore to DRAFT
  testA.status = TEST_STATUS.DRAFT;
  adminTestService.save();
});

test('Admin: Duplicate Test preserves unit configuration independently with fresh unit IDs', () => {
  const source = adminTestService.getTest('test-neetpg-med-01');
  const structure = adminTestService.getAdminTestStructure(source.id);
  const firstUnit = structure.units[0];

  adminTestService.updateAdminTestUnitConfiguration(source.id, firstUnit.id, {
    subjectIds: ['sub-neet-cardio'],
    questionCount: 42,
    instructions: 'Duplication test instructions',
    randomizeQuestions: true,
    notes: 'Duplication source note'
  });

  const duplicated = adminTestService.duplicateTest(source.id, 'Duplicated Configuration Test', 'DUP_CFG_01');
  assert(duplicated.structure, 'Must have structure');
  assert.strictEqual(duplicated.structure.units.length, structure.units.length);

  const dupUnit = duplicated.structure.units[0];
  assert.notStrictEqual(dupUnit.id, firstUnit.id, 'Duplicated unit must have fresh ID');
  assert.strictEqual(dupUnit.configuration.questionCount, 42);
  assert.deepStrictEqual(dupUnit.configuration.subjectIds, ['sub-neet-cardio']);
  assert.strictEqual(dupUnit.configuration.instructions, 'Duplication test instructions');
  assert.strictEqual(dupUnit.configuration.randomizeQuestions, true);
  assert.strictEqual(dupUnit.configuration.notes, 'Duplication source note');

  // Modifying duplicate does not affect original
  adminTestService.updateAdminTestUnitConfiguration(duplicated.id, dupUnit.id, {
    questionCount: 99
  });

  const sourceConfig = adminTestService.getAdminTestUnitConfiguration(source.id, firstUnit.id);
  assert.strictEqual(sourceConfig.questionCount, 42, 'Source configuration must remain unchanged');
});

// =============================================================================
// 3. FACULTY SECTION / BLOCK CONFIGURATION SUITE
// =============================================================================
console.log('\n--- 3. FACULTY SECTION / BLOCK CONFIGURATION ---');

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

test('Faculty: Authorized Faculty can get and auto-initialize unit configuration', () => {
  const facultyTests = cbtTestService.getFacultyScopedTests({ examId: 'neet-pg' }, facultyDrSiddharth);
  assert(facultyTests.length > 0);
  const testA = facultyTests[0];

  const structure = cbtTestService.getFacultyTestStructure(testA.id, facultyDrSiddharth);
  const unit = structure.units[0];

  const config = cbtTestService.getFacultyTestUnitConfiguration(testA.id, unit.id, facultyDrSiddharth);
  assert(config, 'Configuration must be retrieved');
  assert.strictEqual(config.enabled, true);
  assert.strictEqual(config.required, true);
  assert.strictEqual(config.questionCount, null);
});

test('Faculty: Accessing another faculty member test configuration is rejected with Unauthorized', () => {
  const marcusTest = cbtTestService.createFacultyTest({
    examId: 'plab',
    name: 'Marcus PLAB Exam Unit Test',
    testType: 'SUBJECT_TEST',
    subjectId: 'sub-plab-acute',
    targetQuestions: 30,
    durationMinutes: 45
  }, facultyDrMarcus);

  const marcusStructure = cbtTestService.getFacultyTestStructure(marcusTest.id, facultyDrMarcus);
  const marcusUnit = marcusStructure.units[0];

  // Dr. Siddharth cannot access Dr. Marcus's test configuration
  assert.throws(() => {
    cbtTestService.getFacultyTestUnitConfiguration(marcusTest.id, marcusUnit.id, facultyDrSiddharth);
  }, /Unauthorized/);
});

test('Faculty: Authorized Faculty can configure assigned Subjects', () => {
  const testA = cbtTestService.getFacultyScopedTests({ examId: 'neet-pg' }, facultyDrSiddharth)[0];
  const structure = cbtTestService.getFacultyTestStructure(testA.id, facultyDrSiddharth);
  const unit = structure.units[0];

  // Both 'sub-neet-cardio' and 'sub-neet-pharma' are assigned to Dr. Siddharth
  const updated = cbtTestService.updateFacultyTestUnitConfiguration(testA.id, unit.id, {
    subjectIds: ['sub-neet-cardio', 'sub-neet-pharma'],
    questionCount: 35,
    required: true,
    instructions: 'Cardiology and Clinical Pharmacology clinical questions.'
  }, facultyDrSiddharth);

  assert.deepStrictEqual(updated.subjectIds, ['sub-neet-cardio', 'sub-neet-pharma']);
  assert.strictEqual(updated.questionCount, 35);
  assert.strictEqual(updated.instructions, 'Cardiology and Clinical Pharmacology clinical questions.');

  const reloaded = cbtTestService.getFacultyTestUnitConfiguration(testA.id, unit.id, facultyDrSiddharth);
  assert.deepStrictEqual(reloaded.subjectIds, ['sub-neet-cardio', 'sub-neet-pharma']);
});

test('Faculty: CRITICAL FACULTY SCOPE — Unassigned Subject is rejected at service layer', () => {
  const testA = cbtTestService.getFacultyScopedTests({ examId: 'neet-pg' }, facultyDrSiddharth)[0];
  const structure = cbtTestService.getFacultyTestStructure(testA.id, facultyDrSiddharth);
  const unit = structure.units[0];

  // 'sub-neet-nephro' is a NEET-PG subject, BUT Dr. Siddharth is NOT assigned to it!
  assert.throws(() => {
    cbtTestService.setFacultyTestUnitSubjects(testA.id, unit.id, [
      'sub-neet-nephro'
    ], facultyDrSiddharth);
  }, /UNAUTHORIZED_SUBJECT/);
});

test('Faculty: Whole-test configuration validator validates against faculty assigned subjects', () => {
  const testA = cbtTestService.getFacultyScopedTests({ examId: 'neet-pg' }, facultyDrSiddharth)[0];
  const structure = cbtTestService.getFacultyTestStructure(testA.id, facultyDrSiddharth);
  const unit = structure.units[0];

  cbtTestService.updateFacultyTestUnitConfiguration(testA.id, unit.id, {
    subjectIds: ['sub-neet-cardio'],
    questionCount: 25
  }, facultyDrSiddharth);

  const report = cbtTestService.validateFacultyTestConfiguration(testA.id, facultyDrSiddharth);
  assert(report.valid, 'Report must be valid');
  assert.strictEqual(report.units[0].isConfigured, true);
});

test('Faculty: Lifecycle guards — DRAFT and UPCOMING allow configuration; LIVE, COMPLETED, CANCELLED are locked', () => {
  const testA = cbtTestService.getFacultyScopedTests({ examId: 'neet-pg' }, facultyDrSiddharth)[0];
  const structure = cbtTestService.getFacultyTestStructure(testA.id, facultyDrSiddharth);
  const unit = structure.units[0];

  // Set to LIVE
  testA.status = FACULTY_TEST_STATUS.LIVE;
  cbtTestService.saveTests();

  assert.throws(() => {
    cbtTestService.updateFacultyTestUnitConfiguration(testA.id, unit.id, {
      questionCount: 50
    }, facultyDrSiddharth);
  }, /LIFECYCLE_LOCKED/);

  // Set to COMPLETED
  testA.status = FACULTY_TEST_STATUS.COMPLETED;
  cbtTestService.saveTests();

  assert.throws(() => {
    cbtTestService.updateFacultyTestUnitConfiguration(testA.id, unit.id, {
      questionCount: 50
    }, facultyDrSiddharth);
  }, /LIFECYCLE_LOCKED/);

  // Set to CANCELLED
  testA.status = FACULTY_TEST_STATUS.CANCELLED;
  cbtTestService.saveTests();

  assert.throws(() => {
    cbtTestService.updateFacultyTestUnitConfiguration(testA.id, unit.id, {
      questionCount: 50
    }, facultyDrSiddharth);
  }, /LIFECYCLE_LOCKED/);

  // Set to UPCOMING (editable)
  testA.status = FACULTY_TEST_STATUS.UPCOMING;
  cbtTestService.saveTests();

  const upcomingUpdate = cbtTestService.updateFacultyTestUnitConfiguration(testA.id, unit.id, {
    questionCount: 32
  }, facultyDrSiddharth);
  assert.strictEqual(upcomingUpdate.questionCount, 32);

  // Reset back to DRAFT
  testA.status = FACULTY_TEST_STATUS.DRAFT;
  cbtTestService.saveTests();

  // DRAFT allows modification
  const draftUpdate = cbtTestService.updateFacultyTestUnitConfiguration(testA.id, unit.id, {
    questionCount: 30
  }, facultyDrSiddharth);
  assert.strictEqual(draftUpdate.questionCount, 30);
});

test('Faculty: Existing Question Assembly functionality (test.content.questionIds) is strictly preserved', () => {
  const testA = cbtTestService.getFacultyScopedTests({ examId: 'neet-pg' }, facultyDrSiddharth)[0];
  const initialQCount = testA.content?.questionIds?.length || 0;

  // Add question via question assembly
  cbtTestService.addQuestionToFacultyTest(testA.id, 'q-neet-01', facultyDrSiddharth);

  // Configure section
  const structure = cbtTestService.getFacultyTestStructure(testA.id, facultyDrSiddharth);
  const unit = structure.units[0];
  cbtTestService.updateFacultyTestUnitConfiguration(testA.id, unit.id, {
    questionCount: 20
  }, facultyDrSiddharth);

  // Check that test.content.questionIds still includes 'q-neet-01'
  const reloaded = cbtTestService.getTestById(testA.id);
  assert(reloaded.content.questionIds.includes('q-neet-01'), 'Question assembly IDs must be intact');
  assert.strictEqual(reloaded.content.questionIds.length, initialQCount + 1);
});

test('Faculty: Duplicate Faculty Test preserves unit configuration independently with fresh IDs', () => {
  const testA = cbtTestService.getFacultyScopedTests({ examId: 'neet-pg' }, facultyDrSiddharth)[0];
  const structure = cbtTestService.getFacultyTestStructure(testA.id, facultyDrSiddharth);
  const unit = structure.units[0];

  cbtTestService.updateFacultyTestUnitConfiguration(testA.id, unit.id, {
    subjectIds: ['sub-neet-cardio'],
    questionCount: 28,
    instructions: 'Faculty duplicate instructions'
  }, facultyDrSiddharth);

  const duplicated = cbtTestService.duplicateFacultyTest(testA.id, facultyDrSiddharth);
  assert(duplicated.structure, 'Duplicated test must have structure');
  assert.strictEqual(duplicated.structure.units.length, structure.units.length);

  const dupUnit = duplicated.structure.units[0];
  assert.notStrictEqual(dupUnit.id, unit.id, 'Duplicated unit must have fresh ID');
  assert.strictEqual(dupUnit.configuration.questionCount, 28);
  assert.deepStrictEqual(dupUnit.configuration.subjectIds, ['sub-neet-cardio']);
  assert.strictEqual(dupUnit.configuration.instructions, 'Faculty duplicate instructions');

  // Verify independence
  cbtTestService.updateFacultyTestUnitConfiguration(duplicated.id, dupUnit.id, {
    questionCount: 60
  }, facultyDrSiddharth);

  const originalConfig = cbtTestService.getFacultyTestUnitConfiguration(testA.id, unit.id, facultyDrSiddharth);
  assert.strictEqual(originalConfig.questionCount, 28, 'Original configuration must remain unmodified');
});

console.log(`\n=======================================================`);
console.log(`🎉 ALL ${passedTests} OF ${totalTests} ASSERTIONS PASSED PERFECTLY!`);
console.log(`=======================================================\n`);

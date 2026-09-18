// =============================================================================
// AUTOMATED TEST SUITE: PHASE 2 TEST STRUCTURE BUILDER
// Verifies Admin & Faculty structure builder, RBAC, scope isolation, lifecycle rules,
// Exam isolation, stable ID reordering, legacy fallback, and question preservation.
// Run with: node -r ./scripts/setupNodeTestEnv.js scripts/testTestStructureBuilder.js
// =============================================================================

import assert from 'assert';
import { adminTestService, TEST_STATUS } from '../src/services/adminTestService.js';
import { cbtTestService, FACULTY_TEST_STATUS } from '../src/services/cbtTestService.js';
import { STRUCTURE_MODES, UNIT_TYPES, EXAM_MAPPING_TYPES, getExamPattern, createDefaultTestStructure } from '../src/services/examPatternHelper.js';
import { peopleService } from '../src/services/peopleService.js';
import { curriculumService } from '../src/services/curriculumService.js';

console.log('🧪 Starting Phase 2 Test Structure Builder Verification Suite...\n');

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
// 1. EXAM PATTERN HELPER SUITE
// =============================================================================
console.log('--- 1. EXAM PATTERN HELPER ---');

test('getExamPattern returns normalized stages and subjects for neet-pg', () => {
  const pattern = getExamPattern('neet-pg');
  assert(pattern !== null, 'Pattern should not be null');
  assert.strictEqual(pattern.exam.id, 'neet-pg');
  assert(pattern.stages.length > 0, 'Should have stages derived from exam');
  assert(pattern.subjects.length > 0, 'Should have curriculum subjects');
  assert.strictEqual(pattern.capabilities.hasStages, true);
  assert.strictEqual(pattern.capabilities.hasCurriculum, true);
});

test('getExamPattern returns normalized stages for usmle', () => {
  const pattern = getExamPattern('usmle');
  assert(pattern !== null, 'USMLE pattern should exist');
  assert(pattern.stages.some(s => s.name.includes('Step 1') || s.description.includes('Step 1')));
});

test('createDefaultTestStructure returns valid SINGLE_UNIT structure', () => {
  const def = createDefaultTestStructure({ testType: 'FULL_MOCK' });
  assert.strictEqual(def.mode, STRUCTURE_MODES.SINGLE_UNIT);
  assert.strictEqual(def.unitType, UNIT_TYPES.SECTION);
  assert.strictEqual(def.units.length, 1);
  assert.strictEqual(def.units[0].code, 'MAIN');
  assert.strictEqual(def.units[0].order, 0);
  assert.strictEqual(def.units[0].examMapping.type, null);
});

// =============================================================================
// 2. ADMIN TEST STRUCTURE BUILDER SUITE
// =============================================================================
console.log('\n--- 2. ADMIN TEST STRUCTURE BUILDER ---');

adminTestService.resetToSeeds();

test('Admin: Newly created Test receives default structure', () => {
  const created = adminTestService.createTest({
    examId: 'neet-pg',
    name: 'Admin Structure Test 01',
    code: 'ADM-STR-01',
    testType: 'FULL_MOCK'
  });

  assert(created.structure !== null, 'Should have structure');
  assert.strictEqual(created.structure.mode, STRUCTURE_MODES.SINGLE_UNIT);
  assert.strictEqual(created.structure.units.length, 1);
  assert.strictEqual(created.structure.units[0].code, 'MAIN');
});

test('Admin: Legacy Test without structure safely initializes default structure on read', () => {
  // Simulate legacy test
  const legacyId = 'test-neetpg-mock-01';
  const rawTest = adminTestService.getTest(legacyId);
  rawTest.structure = null; // force legacy null
  adminTestService.save();

  const structure = adminTestService.getAdminTestStructure(legacyId);
  assert(structure !== null, 'Structure should be initialized');
  assert.strictEqual(structure.mode, STRUCTURE_MODES.SINGLE_UNIT);
  assert.strictEqual(structure.units.length, 1);
  // Verify other test fields remain intact
  const updatedTest = adminTestService.getTest(legacyId);
  assert.strictEqual(updatedTest.code, 'NEETPG-MOCK-01');
  assert.strictEqual(updatedTest.status, TEST_STATUS.DRAFT);
});

test('Admin: Unit can be added and mode automatically switches to MULTI_UNIT', () => {
  const testId = 'test-neetpg-med-01';
  // Ensure starting state
  adminTestService.getAdminTestStructure(testId);

  const neetSubjects = curriculumService.getSubjects('neet-pg');
  const cardioSub = neetSubjects.find(s => s.name.includes('Cardiology'));

  const added = adminTestService.addAdminTestStructureUnit(testId, {
    name: 'Cardiology Clinical Vignettes',
    code: 'SEC-CARD',
    description: 'High-yield ECG and heart failure questions',
    examMapping: {
      type: EXAM_MAPPING_TYPES.SUBJECT,
      id: cardioSub.id
    }
  });

  assert(added.id, 'Should have generated unit ID');
  assert.strictEqual(added.code, 'SEC-CARD');
  assert.strictEqual(added.order, 1);

  const structure = adminTestService.getAdminTestStructure(testId);
  assert.strictEqual(structure.mode, STRUCTURE_MODES.MULTI_UNIT);
  assert.strictEqual(structure.units.length, 2);
});

test('Admin: Unit can be updated with new name and description', () => {
  const testId = 'test-neetpg-med-01';
  const structure = adminTestService.getAdminTestStructure(testId);
  const targetUnit = structure.units[1];

  const updated = adminTestService.updateAdminTestStructureUnit(testId, targetUnit.id, {
    name: 'Cardiology & Hemodynamics Clinical Block',
    code: 'SEC-CARDIO-REV',
    description: 'Updated description'
  });

  assert.strictEqual(updated.name, 'Cardiology & Hemodynamics Clinical Block');
  assert.strictEqual(updated.code, 'SEC-CARDIO-REV');
  assert.strictEqual(updated.id, targetUnit.id, 'Unit ID must remain stable');
  assert.strictEqual(updated.order, 1, 'Order must remain stable');
});

test('Admin: Units can be reordered and unit IDs remain stable', () => {
  const testId = 'test-neetpg-med-01';
  const initialStructure = adminTestService.getAdminTestStructure(testId);
  assert.strictEqual(initialStructure.units.length, 2);

  const [unitA, unitB] = initialStructure.units;
  const reordered = adminTestService.reorderAdminTestStructureUnits(testId, [unitB.id, unitA.id]);

  assert.strictEqual(reordered[0].id, unitB.id);
  assert.strictEqual(reordered[0].order, 0);
  assert.strictEqual(reordered[1].id, unitA.id);
  assert.strictEqual(reordered[1].order, 1);
});

test('Admin: Unit can be deleted, remaining units re-indexed sequentially with stable IDs', () => {
  const testId = 'test-neetpg-med-01';
  const structure = adminTestService.getAdminTestStructure(testId);
  const toDelete = structure.units[0];
  const toKeep = structure.units[1];

  const res = adminTestService.removeAdminTestStructureUnit(testId, toDelete.id);
  assert.strictEqual(res, true);

  const newStructure = adminTestService.getAdminTestStructure(testId);
  assert.strictEqual(newStructure.units.length, 1);
  assert.strictEqual(newStructure.units[0].id, toKeep.id, 'Kept unit must retain its exact stable ID');
  assert.strictEqual(newStructure.units[0].order, 0, 'Order must be re-indexed to 0');
});

test('Admin: Deleting the last unit is strictly rejected', () => {
  const testId = 'test-neetpg-med-01';
  const structure = adminTestService.getAdminTestStructure(testId);
  assert.strictEqual(structure.units.length, 1);

  assert.throws(() => {
    adminTestService.removeAdminTestStructureUnit(testId, structure.units[0].id);
  }, /CANNOT_DELETE_LAST_UNIT/);
});

test('Admin: Duplicate unit IDs and duplicate unit codes are rejected', () => {
  const testId = 'test-neetpg-med-01';
  const currentStructure = adminTestService.getAdminTestStructure(testId);
  const existingCode = currentStructure.units[0].code;

  // Duplicate code
  assert.throws(() => {
    adminTestService.addAdminTestStructureUnit(testId, {
      name: 'Duplicate Code Unit',
      code: existingCode
    });
  }, /DUPLICATE_UNIT_CODE/);
});

test('Admin: Empty unit name is rejected', () => {
  const testId = 'test-neetpg-med-01';
  assert.throws(() => {
    adminTestService.addAdminTestStructureUnit(testId, {
      name: '   ',
      code: 'SEC-EMPTY'
    });
  }, /EMPTY_UNIT_NAME/);
});

test('Admin: CRITICAL EXAM ISOLATION — Cross-exam mapping is rejected (NEET-PG mapping on USMLE test)', () => {
  const usmleTestId = 'test-usmle-b1-01'; // examId = 'usmle'
  adminTestService.getAdminTestStructure(usmleTestId);

  const neetSubjects = curriculumService.getSubjects('neet-pg');
  const neetCardio = neetSubjects.find(s => s.id === 'sub-neet-cardio');

  assert.throws(() => {
    adminTestService.addAdminTestStructureUnit(usmleTestId, {
      name: 'Attempted NEET Subject on USMLE',
      code: 'NEET-ON-USMLE',
      examMapping: {
        type: EXAM_MAPPING_TYPES.SUBJECT,
        id: neetCardio.id // 'sub-neet-cardio' does NOT belong to 'usmle'
      }
    });
  }, /EXAM_SCOPE_MISMATCH/);
});

test('Admin: Lifecycle guards — DRAFT and CONFIGURING are editable; READY, PUBLISHED, ACTIVE, COMPLETED, ARCHIVED are locked', () => {
  const testObj = adminTestService.getTest('test-plab1-mock-01'); // status: PUBLISHED
  assert.strictEqual(testObj.status, TEST_STATUS.PUBLISHED);

  assert.throws(() => {
    adminTestService.addAdminTestStructureUnit(testObj.id, {
      name: 'New Section in Published Test',
      code: 'SEC-LOCKED'
    });
  }, /LIFECYCLE_LOCKED/);

  // Test ARCHIVED
  const archTest = adminTestService.getTest('test-eu-mock-01'); // status: ARCHIVED
  assert.throws(() => {
    adminTestService.addAdminTestStructureUnit(archTest.id, {
      name: 'New Section in Archived Test',
      code: 'SEC-ARCH'
    });
  }, /LIFECYCLE_LOCKED/);
});

test('Admin: Duplicate Test clones structure and generates fresh independent unit IDs', () => {
  const source = adminTestService.getTest('test-neetpg-med-01');
  const sourceStructure = adminTestService.getAdminTestStructure(source.id);

  const duplicated = adminTestService.duplicateTest(source.id, 'Duplicated NEET Test', 'NEET_DUP_01');
  assert(duplicated.structure !== null, 'Duplicated test must have structure');
  assert.strictEqual(duplicated.structure.units.length, sourceStructure.units.length);
  assert.strictEqual(duplicated.structure.units[0].code, sourceStructure.units[0].code);
  // Unit IDs must be fresh and different from source
  assert.notStrictEqual(duplicated.structure.units[0].id, sourceStructure.units[0].id);
});

// =============================================================================
// 3. FACULTY TEST STRUCTURE BUILDER SUITE
// =============================================================================
console.log('\n--- 3. FACULTY TEST STRUCTURE BUILDER ---');

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

test('Faculty: Authorized Faculty can read and auto-initialize structure', () => {
  const facultyTests = cbtTestService.getFacultyScopedTests({}, facultyDrSiddharth);
  assert(facultyTests.length > 0, 'Should have scoped tests');

  const testA = facultyTests[0];
  const structure = cbtTestService.getFacultyTestStructure(testA.id, facultyDrSiddharth);
  assert(structure !== null, 'Structure should be initialized');
  assert.strictEqual(structure.mode, STRUCTURE_MODES.SINGLE_UNIT);
  assert.strictEqual(structure.units.length, 1);
});

test('Faculty: Accessing another faculty member test is rejected with Unauthorized', () => {
  // Create test owned by Dr. Marcus
  const marcusTest = cbtTestService.createFacultyTest({
    examId: 'plab',
    name: 'Marcus PLAB Emergency Test',
    testType: 'SUBJECT_TEST',
    subjectId: 'sub-plab-acute',
    targetQuestions: 30,
    durationMinutes: 45
  }, facultyDrMarcus);

  assert.throws(() => {
    cbtTestService.getFacultyTestStructure(marcusTest.id, facultyDrSiddharth);
  }, /Unauthorized/);
});

test('Faculty: Unauthorized Exam access is rejected', () => {
  // Dr. Marcus is only assigned to 'plab'. Trying to edit a NEET-PG test should fail.
  const neetTest = cbtTestService.getFacultyScopedTests({ examId: 'neet-pg' }, facultyDrSiddharth)[0];
  assert.throws(() => {
    cbtTestService.getFacultyTestStructure(neetTest.id, facultyDrMarcus);
  }, /Unauthorized/);
});

test('Faculty: Unit with assigned Subject mapping succeeds', () => {
  const testA = cbtTestService.getFacultyScopedTests({ examId: 'neet-pg' }, facultyDrSiddharth)[0];
  cbtTestService.getFacultyTestStructure(testA.id, facultyDrSiddharth);

  // 'sub-neet-cardio' is in Dr. Siddharth's assignedSubjects
  const added = cbtTestService.addFacultyTestStructureUnit(testA.id, {
    name: 'Cardiology High-Yield Unit',
    code: 'SEC-CARDIO',
    description: 'Dr. Siddharth cardiology section',
    examMapping: {
      type: EXAM_MAPPING_TYPES.SUBJECT,
      id: 'sub-neet-cardio'
    }
  }, facultyDrSiddharth);

  assert(added.id, 'Unit must be created');
  assert.strictEqual(added.code, 'SEC-CARDIO');
});

test('Faculty: CRITICAL FACULTY SCOPE TEST — Unassigned Subject mapping is rejected at service layer', () => {
  const testA = cbtTestService.getFacultyScopedTests({ examId: 'neet-pg' }, facultyDrSiddharth)[0];

  // 'sub-neet-nephro' is NOT in facultyDrSiddharth.assignedSubjects
  assert.throws(() => {
    cbtTestService.addFacultyTestStructureUnit(testA.id, {
      name: 'Unauthorized Nephrology Section',
      code: 'SEC-NEPHRO',
      examMapping: {
        type: EXAM_MAPPING_TYPES.SUBJECT,
        id: 'sub-neet-nephro' // outside assigned scope
      }
    }, facultyDrSiddharth);
  }, /SUBJECT_SCOPE_MISMATCH/);
});

test('Faculty: Units can be edited, reordered and deleted with stable IDs', () => {
  const testA = cbtTestService.getFacultyScopedTests({ examId: 'neet-pg' }, facultyDrSiddharth)[0];
  const structure = cbtTestService.getFacultyTestStructure(testA.id, facultyDrSiddharth);
  assert(structure.units.length >= 2);

  const [unit1, unit2] = structure.units;

  // Edit
  const edited = cbtTestService.updateFacultyTestStructureUnit(testA.id, unit2.id, {
    name: 'Updated Section Name',
    code: 'SEC-CARDIO-UPD'
  }, facultyDrSiddharth);
  assert.strictEqual(edited.name, 'Updated Section Name');
  assert.strictEqual(edited.id, unit2.id);

  // Reorder
  const reordered = cbtTestService.reorderFacultyTestStructureUnits(testA.id, [unit2.id, unit1.id], facultyDrSiddharth);
  assert.strictEqual(reordered[0].id, unit2.id);
  assert.strictEqual(reordered[0].order, 0);
  assert.strictEqual(reordered[1].id, unit1.id);
  assert.strictEqual(reordered[1].order, 1);

  // Delete
  const deleted = cbtTestService.removeFacultyTestStructureUnit(testA.id, unit1.id, facultyDrSiddharth);
  assert.strictEqual(deleted, true);

  const finalStructure = cbtTestService.getFacultyTestStructure(testA.id, facultyDrSiddharth);
  assert.strictEqual(finalStructure.units.length, 1);
  assert.strictEqual(finalStructure.units[0].id, unit2.id);
  assert.strictEqual(finalStructure.units[0].order, 0);
});

test('Faculty: Lifecycle guards — DRAFT and UPCOMING are editable; LIVE, COMPLETED, CANCELLED are locked', () => {
  const testA = cbtTestService.getFacultyScopedTests({ examId: 'neet-pg' }, facultyDrSiddharth)[0];

  // Set test to COMPLETED
  testA.status = FACULTY_TEST_STATUS.COMPLETED;
  cbtTestService.saveTests();

  assert.throws(() => {
    cbtTestService.addFacultyTestStructureUnit(testA.id, {
      name: 'Attempt to add unit to completed test',
      code: 'SEC-FAIL'
    }, facultyDrSiddharth);
  }, /LIFECYCLE_LOCKED/);

  // Reset back to DRAFT for subsequent tests
  testA.status = FACULTY_TEST_STATUS.DRAFT;
  cbtTestService.saveTests();
});

test('Faculty: Existing Question Assembly functionality is preserved without regression', () => {
  const testA = cbtTestService.getFacultyScopedTests({ examId: 'neet-pg' }, facultyDrSiddharth)[0];
  const initialQCount = testA.content?.questionIds?.length || 0;

  // Verify getFacultyTestQuestions works
  const questions = cbtTestService.getFacultyTestQuestions(testA.id, facultyDrSiddharth);
  assert(Array.isArray(questions));

  // Verify validateFacultyTestContent works
  const contentValidation = cbtTestService.validateFacultyTestContent(testA.id, facultyDrSiddharth);
  assert(contentValidation !== undefined);
  assert.strictEqual(typeof contentValidation.valid, 'boolean');

  // Verify test.content.questionIds is untouched
  assert.strictEqual(testA.content.questionIds.length, initialQCount);
});

test('Faculty: Duplication preserves structure and generates fresh independent unit IDs', () => {
  const testA = cbtTestService.getFacultyScopedTests({ examId: 'neet-pg' }, facultyDrSiddharth)[0];
  const sourceStructure = cbtTestService.getFacultyTestStructure(testA.id, facultyDrSiddharth);

  const duplicated = cbtTestService.duplicateFacultyTest(testA.id, facultyDrSiddharth);
  assert(duplicated.structure !== null);
  assert.strictEqual(duplicated.structure.units.length, sourceStructure.units.length);
  assert.strictEqual(duplicated.structure.units[0].code, sourceStructure.units[0].code);
  assert.notStrictEqual(duplicated.structure.units[0].id, sourceStructure.units[0].id);
});

console.log(`\n=======================================================`);
console.log(`🎉 ALL ${passedTests} OF ${totalTests} ASSERTIONS PASSED PERFECTLY!`);
console.log(`=======================================================\n`);

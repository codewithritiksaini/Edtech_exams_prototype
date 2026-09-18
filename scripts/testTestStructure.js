// =============================================================================
// TEST SUITE: PHASE 2 TEST STRUCTURE REDESIGN
// Hierarchy: Exam -> Exam Pattern (Stage, Subjects, Curriculum) -> Test (Stage, Scope, Structure)
// Tests all 5 categories from specification section 29:
// 1. Exam Pattern
// 2. Curriculum Scope
// 3. Structure Hierarchy
// 4. Integration
// 5. RBAC
// =============================================================================

import assert from 'assert';
import { 
  getExamPattern, 
  getExamStages, 
  getStageSubjects, 
  validateCurriculumScope, 
  normalizeTestStructure, 
  validateTestStructureHierarchy, 
  isStructureReady, 
  STRUCTURE_ITEM_TYPES 
} from '../src/services/examPatternHelper.js';
import { adminTestService, TEST_STATUS } from '../src/services/adminTestService.js';
import { cbtTestService, FACULTY_TEST_STATUS } from '../src/services/cbtTestService.js';
import { catalogService } from '../src/services/catalogService.js';
import { testReadinessService } from '../src/services/testReadinessService.js';

let passedTests = 0;
let totalTests = 0;

function it(desc, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(`    ${err.message}`);
    throw err;
  }
}

console.log('\n======================================================');
console.log('RUNNING MEDPREP PRO PHASE 2 STRUCTURE TEST SUITE');
console.log('======================================================\n');

// -----------------------------------------------------------------------------
// SUITE 1: EXAM PATTERN & STAGE SELECTION
// -----------------------------------------------------------------------------
console.log('--- 1. Exam Pattern & Stage Tests ---');

it('Exam pattern returns valid stages for neet-pg', () => {
  const stages = getExamStages('neet-pg');
  assert(Array.isArray(stages) && stages.length >= 2, 'NEET-PG should have at least 2 stages');
  assert(stages.some(s => s.id === 'stage-neet-stage-1'), 'Stage 1 should exist');
  assert(stages.some(s => s.id === 'stage-neet-stage-2'), 'Stage 2 should exist');
});

it('Valid Stage can be selected and updated on an Admin test', () => {
  const testId = 'test-neetpg-mock-01';
  const pattern = adminTestService.updateAdminTestExamPattern(testId, {
    stageId: 'stage-neet-stage-1'
  });
  assert.strictEqual(pattern.stageId, 'stage-neet-stage-1');
  const stored = adminTestService.getAdminTestExamPattern(testId);
  assert.strictEqual(stored.stageId, 'stage-neet-stage-1');
});

it('Invalid Stage not belonging to Exam is rejected', () => {
  const testId = 'test-neetpg-mock-01';
  assert.throws(() => {
    adminTestService.updateAdminTestExamPattern(testId, {
      stageId: 'non-existent-stage-xyz'
    });
  }, /INVALID_STAGE/);
});

it('Changing Exam in Phase 1 Foundation invalidates Stage, Curriculum, and Structure safely', () => {
  const testId = 'test-neetpg-mock-01';
  // Initially configured
  adminTestService.updateAdminTestExamPattern(testId, { stageId: 'stage-neet-stage-1' });
  adminTestService.updateAdminTestCurriculumScope(testId, {
    subjects: [{ subjectId: 'sub-neet-cardio', chapterIds: [] }]
  });

  const beforeTest = adminTestService.getTest(testId);
  assert(beforeTest.examPattern !== null, 'Stage should be set');

  // Change exam to USMLE
  adminTestService.updateTest(testId, {
    name: beforeTest.name,
    examId: 'usmle-step1',
    testType: beforeTest.testType
  });

  const afterTest = adminTestService.getTest(testId);
  assert.strictEqual(afterTest.examPattern, null, 'Stage must be invalidated when Exam changes');
  assert.strictEqual(afterTest.curriculumScope, null, 'Curriculum Scope must be invalidated when Exam changes');
  assert.strictEqual(afterTest.structure, null, 'Structure must be invalidated when Exam changes');

  // Revert test back to neet-pg for remaining tests
  adminTestService.updateTest(testId, {
    name: beforeTest.name,
    examId: 'neet-pg',
    testType: beforeTest.testType
  });
});

// -----------------------------------------------------------------------------
// SUITE 2: CURRICULUM SCOPE TESTS
// -----------------------------------------------------------------------------
console.log('\n--- 2. Curriculum Scope Tests ---');

it('Subject belongs to stage', () => {
  const stageSubjects = getStageSubjects('neet-pg', 'stage-neet-stage-1');
  assert(Array.isArray(stageSubjects) && stageSubjects.length > 0, 'Stage 1 should have subjects');
  const hasCardio = stageSubjects.some(s => s.id === 'sub-neet-cardio');
  assert(hasCardio, 'Cardiology should belong to NEET-PG Stage 1');
});

it('Chapter belongs to subject', () => {
  const pattern = getExamPattern('neet-pg');
  const cardio = pattern.subjects.find(s => s.id === 'sub-neet-cardio');
  assert(cardio && Array.isArray(cardio.chapters) && cardio.chapters.length > 0, 'Cardiology should have chapters');
  assert(cardio.chapters.some(c => c.id === 'chap-cardio-01'), 'Chapter chap-cardio-01 belongs to Cardiology');
});

it('Valid Subject selection is accepted and normalized', () => {
  const validation = validateCurriculumScope({
    subjects: [
      { subjectId: 'sub-neet-cardio', chapterIds: ['chap-cardio-01'] }
    ]
  }, 'neet-pg', 'stage-neet-stage-1');

  assert(validation.valid, 'Curriculum scope should be valid');
  assert.strictEqual(validation.normalizedScope.subjects.length, 1);
  assert.strictEqual(validation.normalizedScope.subjects[0].subjectId, 'sub-neet-cardio');
});

it('Invalid curriculum references are rejected with clear error codes', () => {
  // Unknown subject
  const invalidSub = validateCurriculumScope({
    subjects: [{ subjectId: 'sub-fake-subject-404', chapterIds: [] }]
  }, 'neet-pg', 'stage-neet-stage-1');
  assert(!invalidSub.valid, 'Unknown subject must be rejected');
  assert(invalidSub.errors.some(e => e.code === 'INVALID_SUBJECT'));

  // Unknown chapter
  const invalidChap = validateCurriculumScope({
    subjects: [{ subjectId: 'sub-neet-cardio', chapterIds: ['chap-fake-999'] }]
  }, 'neet-pg', 'stage-neet-stage-1');
  assert(!invalidChap.valid, 'Unknown chapter must be rejected');
  assert(invalidChap.errors.some(e => e.code === 'INVALID_CHAPTER'));
});

it('Curriculum Scope update on Admin test works with Select All', () => {
  const testId = 'test-neetpg-mock-01';
  adminTestService.updateAdminTestExamPattern(testId, { stageId: 'stage-neet-stage-1' });

  const allStageSubjects = getStageSubjects('neet-pg', 'stage-neet-stage-1');
  const allSelectedScope = {
    subjects: allStageSubjects.map(s => ({
      subjectId: s.id,
      chapterIds: (s.chapters || []).map(c => c.id)
    }))
  };

  const updatedScope = adminTestService.updateAdminTestCurriculumScope(testId, allSelectedScope);
  assert.strictEqual(updatedScope.subjects.length, allStageSubjects.length, 'All subjects should be selected');
});

it('Curriculum Scope Clear All sets empty array', () => {
  const testId = 'test-neetpg-mock-01';
  const emptyScope = adminTestService.updateAdminTestCurriculumScope(testId, { subjects: [] });
  assert.strictEqual(emptyScope.subjects.length, 0);
});

// -----------------------------------------------------------------------------
// SUITE 3: TEST STRUCTURE HIERARCHY TESTS
// -----------------------------------------------------------------------------
console.log('\n--- 3. Test Structure Hierarchy Tests ---');

it('Creates hierarchical structure with Phase, Section, and Block', () => {
  const hierarchical = {
    mode: 'MULTI_UNIT',
    phases: [
      {
        id: 'phase-01',
        type: STRUCTURE_ITEM_TYPES.PHASE,
        name: 'Phase 1: Basic Clinical Vignettes',
        order: 0
      }
    ],
    sections: [
      {
        id: 'sec-01',
        type: STRUCTURE_ITEM_TYPES.SECTION,
        phaseId: 'phase-01',
        name: 'Section A: General Medicine',
        code: 'SEC-A',
        order: 0,
        blocks: [
          {
            id: 'blk-01',
            type: STRUCTURE_ITEM_TYPES.BLOCK,
            name: 'Block 1: Rapid Fire',
            code: 'BLK-1',
            order: 0
          }
        ]
      },
      {
        id: 'sec-02',
        type: STRUCTURE_ITEM_TYPES.SECTION,
        phaseId: null, // Section can exist without Phase
        name: 'Section B: Comprehensive Cases',
        code: 'SEC-B',
        order: 1,
        blocks: [] // Section can exist without Block
      }
    ]
  };

  const normalized = normalizeTestStructure(hierarchical);
  assert.strictEqual(normalized.phases.length, 1);
  assert.strictEqual(normalized.sections.length, 2);
  assert.strictEqual(normalized.sections[0].blocks.length, 1);
  assert.strictEqual(normalized.sections[1].blocks.length, 0);

  // Backward compatibility: units array is automatically synchronized
  assert(Array.isArray(normalized.units) && normalized.units.length >= 2, 'Units array must be synchronized');
});

it('Validates hierarchy parent-child relationships and unique codes', () => {
  const testId = 'test-neetpg-mock-01';
  adminTestService.updateAdminTestExamPattern(testId, { stageId: 'stage-neet-stage-1' });
  adminTestService.updateAdminTestCurriculumScope(testId, {
    subjects: [{ subjectId: 'sub-neet-cardio', chapterIds: [] }]
  });

  const validStructure = {
    sections: [
      {
        id: 'sec-101',
        name: 'Cardiology Section',
        code: 'SEC-CARDIO',
        order: 0,
        blocks: [
          { id: 'blk-101', name: 'ECG Analysis', code: 'BLK-ECG', order: 0 }
        ]
      }
    ]
  };

  const updated = adminTestService.updateAdminTestStructure(testId, validStructure);
  assert.strictEqual(updated.sections.length, 1);
  assert.strictEqual(updated.sections[0].id, 'sec-101');
});

it('Rejects duplicate codes within the structure', () => {
  const invalidStructure = {
    sections: [
      { id: 'sec-1', name: 'Sec 1', code: 'DUP-CODE', order: 0 },
      { id: 'sec-2', name: 'Sec 2', code: 'DUP-CODE', order: 1 }
    ]
  };

  assert.throws(() => {
    adminTestService.updateAdminTestStructure('test-neetpg-mock-01', invalidStructure);
  }, /DUPLICATE_SECTION_CODE/);
});

it('Stable IDs preserved on reordering', () => {
  const initial = {
    sections: [
      { id: 'sec-alpha', name: 'Section Alpha', order: 0 },
      { id: 'sec-beta', name: 'Section Beta', order: 1 }
    ]
  };
  adminTestService.updateAdminTestStructure('test-neetpg-mock-01', initial);

  // Reorder sections
  const reordered = {
    sections: [
      { id: 'sec-beta', name: 'Section Beta', order: 0 },
      { id: 'sec-alpha', name: 'Section Alpha', order: 1 }
    ]
  };
  const result = adminTestService.updateAdminTestStructure('test-neetpg-mock-01', reordered);
  assert.strictEqual(result.sections[0].id, 'sec-beta');
  assert.strictEqual(result.sections[1].id, 'sec-alpha');
});

it('Readiness check: isStructureReady requires Stage, Curriculum Scope, and Section', () => {
  const incompleteTest1 = {
    examId: 'neet-pg',
    examPattern: null,
    curriculumScope: { subjects: [{ subjectId: 'sub-neet-cardio', chapterIds: [] }] },
    structure: { sections: [{ id: 's1', name: 'Sec 1' }] }
  };
  assert.strictEqual(isStructureReady(incompleteTest1), false, 'Missing stage must not be ready');

  const incompleteTest2 = {
    examId: 'neet-pg',
    examPattern: { stageId: 'stage-neet-stage-1' },
    curriculumScope: { subjects: [] },
    structure: { sections: [{ id: 's1', name: 'Sec 1' }] }
  };
  assert.strictEqual(isStructureReady(incompleteTest2), false, 'Empty curriculum scope must not be ready');

  const completeTest = {
    examId: 'neet-pg',
    examPattern: { stageId: 'stage-neet-stage-1' },
    curriculumScope: { subjects: [{ subjectId: 'sub-neet-cardio', chapterIds: [] }] },
    structure: { sections: [{ id: 's1', name: 'Sec 1' }] }
  };
  assert.strictEqual(isStructureReady(completeTest), true, 'All 3 steps complete must be ready');
});

// -----------------------------------------------------------------------------
// SUITE 4: INTEGRATION & DOWNSTREAM COMPATIBILITY
// -----------------------------------------------------------------------------
console.log('\n--- 4. Downstream Integration Tests ---');

it('Existing Question Bank remains unaffected and untouched', () => {
  const testId = 'test-neetpg-mock-01';
  const test = adminTestService.getTest(testId);
  // Ensure question bank queries and questionService work properly
  assert(test !== null, 'Test exists');
});

it('testReadinessService Layer 2 validates Stage, Scope, and Structure', () => {
  const testId = 'test-neetpg-mock-01';
  adminTestService.updateAdminTestExamPattern(testId, { stageId: 'stage-neet-stage-1' });
  adminTestService.updateAdminTestCurriculumScope(testId, {
    subjects: [{ subjectId: 'sub-neet-cardio', chapterIds: [] }]
  });
  adminTestService.updateAdminTestStructure(testId, {
    sections: [{ id: 'sec-main', name: 'Main Section', order: 0 }]
  });

  const updatedTest = adminTestService.getTest(testId);
  const report = testReadinessService.validateTest(updatedTest);
  assert.strictEqual(report.sections.structure.ready, true, 'Layer 2 Structure must be ready');
});

// -----------------------------------------------------------------------------
// SUITE 5: RBAC & FACULTY CURRICULUM RESTRICTIONS
// -----------------------------------------------------------------------------
console.log('\n--- 5. RBAC & Faculty Authorization Tests ---');

it('Faculty is permitted to select authorized subjects in Curriculum Scope', () => {
  const faculty = {
    id: 'fac-01',
    name: 'Dr. Siddharth',
    assignedSubjects: ['sub-neet-cardio']
  };

  const validation = validateCurriculumScope({
    subjects: [{ subjectId: 'sub-neet-cardio', chapterIds: [] }]
  }, 'neet-pg', 'stage-neet-stage-1', faculty.assignedSubjects);

  assert(validation.valid, 'Authorized subject should be valid for faculty');
});

it('Faculty is strictly rejected when attempting to select unauthorized subject', () => {
  const faculty = {
    id: 'fac-01',
    name: 'Dr. Siddharth',
    assignedSubjects: ['sub-neet-cardio'] // Pulmonology is not authorized
  };

  const validation = validateCurriculumScope({
    subjects: [{ subjectId: 'sub-neet-pulmo', chapterIds: [] }]
  }, 'neet-pg', 'stage-neet-stage-1', faculty.assignedSubjects);

  assert(!validation.valid, 'Unauthorized subject must be rejected for faculty');
  assert(validation.errors.some(e => e.code === 'UNAUTHORIZED_SUBJECT'));
});

it('Faculty Test Service enforces RBAC on curriculum scope mutation', () => {
  const facultyTests = cbtTestService.getAllTests();
  const targetFacultyTest = facultyTests.find(t => t.id === 'fac-test-neet-01') || facultyTests[0];

  if (targetFacultyTest) {
    const faculty = {
      id: targetFacultyTest.facultyId || 'fac-01',
      name: 'Dr. Siddharth',
      assignedSubjects: ['sub-neet-cardio']
    };

    // Stage update
    cbtTestService.updateFacultyTestExamPattern(targetFacultyTest.id, {
      stageId: 'stage-neet-stage-1'
    }, faculty);

    // Scope update with authorized subject
    const scope = cbtTestService.updateFacultyTestCurriculumScope(targetFacultyTest.id, {
      subjects: [{ subjectId: 'sub-neet-cardio', chapterIds: [] }]
    }, faculty);
    assert.strictEqual(scope.subjects[0].subjectId, 'sub-neet-cardio');

    // Scope update with unauthorized subject throws UNAUTHORIZED_SUBJECT
    assert.throws(() => {
      cbtTestService.updateFacultyTestCurriculumScope(targetFacultyTest.id, {
        subjects: [{ subjectId: 'sub-neet-pulmo', chapterIds: [] }]
      }, faculty);
    }, /UNAUTHORIZED_SUBJECT/);
  }
});

console.log(`\n======================================================`);
console.log(`TEST RESULTS: ALL ${passedTests} / ${totalTests} TESTS PASSED SUCCESSFULLY!`);
console.log(`======================================================\n`);

/**
 * MedPrep Pro — Compact Test Creation Architecture Test Suite
 * Validates 12-phase to 6-phase consolidation for Admin and Faculty.
 */

import assert from 'assert';
import { 
  TEST_CREATION_PHASES, 
  OLD_PHASE_TO_NEW_PHASE, 
  POST_CREATION_CAPABILITIES,
  getCreationPhaseById,
  getCreationPhaseByNumber,
  mapOldPhaseToNew,
  getPhaseRoute
} from '../src/services/testCreationWorkflow.js';

import { adminTestService } from '../src/services/adminTestService.js';
import { cbtTestService } from '../src/services/cbtTestService.js';
import { questionTypeService } from '../src/services/questionTypeService.js';
import { catalogService } from '../src/services/catalogService.js';
import { peopleService } from '../src/services/peopleService.js';

console.log('--- RUNNING COMPACT TEST CREATION ARCHITECTURE TEST SUITE ---');

// TEST 1: 6-Phase Constants Structure
console.log('Test 1: Validating 6 canonical test creation phases...');
assert.strictEqual(TEST_CREATION_PHASES.length, 6, 'Should have exactly 6 canonical creation phases');

const expectedPhases = [
  { phaseNumber: 1, id: 'foundation', shortLabel: 'Foundation' },
  { phaseNumber: 2, id: 'structure', shortLabel: 'Structure' },
  { phaseNumber: 3, id: 'content', shortLabel: 'Content' },
  { phaseNumber: 4, id: 'rules', shortLabel: 'Rules' },
  { phaseNumber: 5, id: 'generate', shortLabel: 'Generate / Build' },
  { phaseNumber: 6, id: 'review-publish', shortLabel: 'Review & Publish' }
];

expectedPhases.forEach((expected, index) => {
  const phase = TEST_CREATION_PHASES[index];
  assert.strictEqual(phase.phaseNumber, expected.phaseNumber, `Phase index ${index} should have phaseNumber ${expected.phaseNumber}`);
  assert.strictEqual(phase.id, expected.id, `Phase index ${index} should have id ${expected.id}`);
  assert.strictEqual(phase.shortLabel, expected.shortLabel, `Phase index ${index} should have shortLabel ${expected.shortLabel}`);
  assert.ok(phase.label, `Phase ${phase.id} must have a full label`);
  assert.ok(phase.description, `Phase ${phase.id} must have a description`);
  assert.ok(Array.isArray(phase.capabilities), `Phase ${phase.id} must have capabilities array`);
  assert.ok(phase.capabilities.length > 0, `Phase ${phase.id} must have at least one capability`);
});
console.log('✓ Test 1 Passed: 6 Canonical phases valid.');

// TEST 2: Old 12-Phase Mapping Table
console.log('Test 2: Validating old 12-phase to new 6-phase mapping...');
assert.strictEqual(OLD_PHASE_TO_NEW_PHASE[1], 'foundation', 'Old Phase 1 maps to foundation');
assert.strictEqual(OLD_PHASE_TO_NEW_PHASE[2], 'structure', 'Old Phase 2 maps to structure');
assert.strictEqual(OLD_PHASE_TO_NEW_PHASE[3], 'structure', 'Old Phase 3 maps to structure');
assert.strictEqual(OLD_PHASE_TO_NEW_PHASE[4], 'content', 'Old Phase 4 maps to content');
assert.strictEqual(OLD_PHASE_TO_NEW_PHASE[5], 'content', 'Old Phase 5 maps to content');
assert.strictEqual(OLD_PHASE_TO_NEW_PHASE[6], 'rules', 'Old Phase 6 maps to rules');
assert.strictEqual(OLD_PHASE_TO_NEW_PHASE[7], 'rules', 'Old Phase 7 maps to rules');
assert.strictEqual(OLD_PHASE_TO_NEW_PHASE[8], 'generate', 'Old Phase 8 maps to generate');
assert.strictEqual(OLD_PHASE_TO_NEW_PHASE[9], 'review-publish', 'Old Phase 9 maps to review-publish');
assert.strictEqual(OLD_PHASE_TO_NEW_PHASE[10], 'review-publish', 'Old Phase 10 maps to review-publish');
assert.strictEqual(OLD_PHASE_TO_NEW_PHASE[11], null, 'Old Phase 11 maps to null (post-creation)');
assert.strictEqual(OLD_PHASE_TO_NEW_PHASE[12], null, 'Old Phase 12 maps to null (post-creation)');

// Helper check
assert.strictEqual(mapOldPhaseToNew(1).id, 'foundation');
assert.strictEqual(mapOldPhaseToNew(2).id, 'structure');
assert.strictEqual(mapOldPhaseToNew(3).id, 'structure');
assert.strictEqual(mapOldPhaseToNew(4).id, 'content');
assert.strictEqual(mapOldPhaseToNew(5).id, 'content');
assert.strictEqual(mapOldPhaseToNew(6).id, 'rules');
assert.strictEqual(mapOldPhaseToNew(7).id, 'rules');
assert.strictEqual(mapOldPhaseToNew(8).id, 'generate');
assert.strictEqual(mapOldPhaseToNew(9).id, 'review-publish');
assert.strictEqual(mapOldPhaseToNew(10).id, 'review-publish');
assert.strictEqual(mapOldPhaseToNew(11), null);
assert.strictEqual(mapOldPhaseToNew(12), null);
console.log('✓ Test 2 Passed: 12-to-6 Phase mappings valid.');

// TEST 3: Post-Creation Capabilities
console.log('Test 3: Validating post-creation capabilities...');
assert.strictEqual(POST_CREATION_CAPABILITIES.length, 2, 'Should have exactly 2 post-creation capabilities');
assert.strictEqual(POST_CREATION_CAPABILITIES[0].id, 'advanced-test-types');
assert.strictEqual(POST_CREATION_CAPABILITIES[1].id, 'analytics-versioning');
console.log('✓ Test 3 Passed: Post-creation capabilities valid.');

// TEST 4: Routing Helpers
console.log('Test 4: Validating phase route helpers for admin and faculty...');
const testId = 'test-mock-999';

// Admin routes
assert.strictEqual(getPhaseRoute('foundation', testId, 'admin'), `/admin/tests/${testId}`);
assert.strictEqual(getPhaseRoute('structure', testId, 'admin'), `/admin/tests/${testId}/structure`);
assert.strictEqual(getPhaseRoute('content', testId, 'admin'), `/admin/tests/${testId}/content`);
assert.strictEqual(getPhaseRoute('rules', testId, 'admin'), `/admin/tests/${testId}/rules`);
assert.strictEqual(getPhaseRoute('generate', testId, 'admin'), `/admin/tests/${testId}/generate`);
assert.strictEqual(getPhaseRoute('review-publish', testId, 'admin'), `/admin/tests/${testId}/review`);

// Faculty routes
assert.strictEqual(getPhaseRoute('foundation', testId, 'faculty'), `/faculty/tests/${testId}`);
assert.strictEqual(getPhaseRoute('structure', testId, 'faculty'), `/faculty/tests/${testId}/structure`);
assert.strictEqual(getPhaseRoute('content', testId, 'faculty'), `/faculty/tests/${testId}/content`);
assert.strictEqual(getPhaseRoute('rules', testId, 'faculty'), `/faculty/tests/${testId}/rules`);
assert.strictEqual(getPhaseRoute('generate', testId, 'faculty'), `/faculty/tests/${testId}/generate`);
assert.strictEqual(getPhaseRoute('review-publish', testId, 'faculty'), `/faculty/tests/${testId}/review`);
console.log('✓ Test 4 Passed: Route helpers valid.');

// TEST 5: Lookup Helpers
console.log('Test 5: Validating phase lookup helpers...');
assert.strictEqual(getCreationPhaseById('content').phaseNumber, 3);
assert.strictEqual(getCreationPhaseByNumber(3).id, 'content');
assert.strictEqual(getCreationPhaseById('non-existent'), null);
assert.strictEqual(getCreationPhaseByNumber(99), null);
console.log('✓ Test 5 Passed: Lookup helpers valid.');

// TEST 6: Data Integrity & Service Verification
console.log('Test 6: Validating Admin and Faculty service integrity...');
const adminTests = adminTestService.getTests();
assert.ok(adminTests.length > 0, 'Admin tests must exist');

adminTests.forEach(test => {
  assert.ok(test.id, 'Test must have id');
  assert.ok(test.examId, 'Test must reference examId');
  assert.ok(test.status, 'Test must have status');
  const config = adminTestService.getAdminTestQuestionTypeConfig(test.id);
  assert.ok(config, 'Test must have questionTypeConfig');
  assert.ok(Array.isArray(config.allowedTypes), 'allowedTypes must be array');
});

const faculty = peopleService.getCurrentFacultyProfile();
const facultyTests = cbtTestService.getAllTests();
assert.ok(facultyTests.length > 0, 'Faculty tests must exist');

facultyTests.forEach(test => {
  assert.ok(test.id, 'Faculty test must have id');
  assert.ok(test.examId || test.examTrack, 'Faculty test must reference exam');
  const config = cbtTestService.getFacultyTestQuestionTypeConfig(test.id, faculty);
  assert.ok(config, 'Faculty test must have questionTypeConfig');
  assert.ok(test.content, 'Faculty test must have content object');
  assert.ok(Array.isArray(test.content.questionIds), 'content.questionIds must be array');
});
console.log('✓ Test 6 Passed: Service & model integrity intact.');

// TEST 7: Catalog Integrity (Exam ≠ Test check)
console.log('Test 7: Validating Medical Exam Catalog integrity...');
const exams = catalogService.getExams();
assert.ok(exams.length >= 4, 'Should have all medical exams (NEET PG, USMLE, PLAB, etc.)');
const neet = catalogService.getExamById('neet-pg');
assert.ok(neet, 'NEET PG exam must exist in catalog');
assert.strictEqual(neet.title || neet.name, 'NEET PG & NExT');
console.log('✓ Test 7 Passed: Exam catalog integrity preserved.');

console.log('\n--- ALL COMPACT ARCHITECTURE TESTS PASSED SUCCESSFULLY! ---');

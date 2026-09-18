// =============================================================================
// PHASE 6: REVIEW & PUBLISH AUTOMATED TEST SUITE
// Verifies Multi-Layer Readiness Validation, Warnings vs Errors, Direct Fix Links,
// Candidate Preview Simulation, Test Window Scheduling, and Publish Locking.
// =============================================================================

import './setupNodeTestEnv.js';
import { testReadinessService, VALIDATION_PHASES } from '../src/services/testReadinessService.js';
import { testPreviewService } from '../src/services/testPreviewService.js';
import { testPublishService } from '../src/services/testPublishService.js';
import { adminTestService, TEST_STATUS } from '../src/services/adminTestService.js';
import { cbtTestService, FACULTY_TEST_STATUS } from '../src/services/cbtTestService.js';
import { questionService } from '../src/services/questionService.js';
import { testBuildService, BUILD_MODES } from '../src/services/testBuildService.js';

let passed = 0;
let failed = 0;

function assert(condition, testName, extraInfo = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}${extraInfo ? ` — ${extraInfo}` : ''}`);
    failed++;
  }
}

console.log('\n==================================================');
console.log('RUNNING PHASE 6: REVIEW & PUBLISH TEST SUITE');
console.log('==================================================\n');

// Fetch canonical questions from question bank
const allQuestions = questionService.getQuestions();
const sampleQuestionIds = allQuestions.slice(0, 5).map(q => q.id);

// -----------------------------------------------------------------------------
// Suite 1: Multi-Layer Readiness Validation (Incomplete Test)
// -----------------------------------------------------------------------------
console.log('--- Suite 1: Multi-Layer Pre-Flight Readiness Gate ---');

const emptyTest = {
  id: 'test-incomplete-001',
  name: '',
  code: '',
  examId: null,
  durationMinutes: 0,
  structure: null,
  content: { questionIds: [] }
};

const incompleteReadiness = testReadinessService.validateTestForPublish(emptyTest, null, { role: 'admin' });

assert(incompleteReadiness.ready === false, 'Incomplete test fails readiness gate (ready === false)');
assert(incompleteReadiness.errorCount >= 4, 'Multiple layer errors detected', `Count: ${incompleteReadiness.errorCount}`);

const errorCodes = incompleteReadiness.errors.map(e => e.code);
assert(errorCodes.includes('MISSING_EXAM_ID'), 'Foundation error flagged: MISSING_EXAM_ID');
assert(errorCodes.includes('MISSING_TEST_NAME'), 'Foundation error flagged: MISSING_TEST_NAME');
assert(errorCodes.includes('MISSING_TEST_CODE'), 'Foundation error flagged: MISSING_TEST_CODE');
assert(errorCodes.includes('MISSING_STRUCTURE'), 'Structure error flagged: MISSING_STRUCTURE');
assert(errorCodes.includes('NO_QUESTIONS_ATTACHED'), 'Content error flagged: NO_QUESTIONS_ATTACHED');

// Verify direct fix links
const examErr = incompleteReadiness.errors.find(e => e.code === 'MISSING_EXAM_ID');
assert(examErr && examErr.link.includes('/admin/tests/'), 'Error provides navigation link back to Foundation');

const structureErr = incompleteReadiness.errors.find(e => e.code === 'MISSING_STRUCTURE');
assert(structureErr && structureErr.link.includes('/structure'), 'Structure error provides link to /structure');

// -----------------------------------------------------------------------------
// Suite 2: Warnings vs. Blocking Errors
// -----------------------------------------------------------------------------
console.log('\n--- Suite 2: Warnings vs. Blocking Errors ---');

const testWithWarnings = adminTestService.createTest({
  name: 'NEET PG Full Mock Complete',
  code: 'NEETPG-COMP-001',
  examId: 'neet-pg',
  testType: 'FULL_MOCK',
  durationMinutes: 180,
  totalMarks: 20,
  description: '', // Empty description (should be a warning, not error)
  instructions: '' // Empty instructions (should be a warning)
});

// Attach questions and rules
testBuildService.buildManually(testWithWarnings, sampleQuestionIds, { updatedBy: 'Suite' });
adminTestService.saveTestRules(testWithWarnings.id, {
  blueprint: { mode: 'CUSTOM', difficultyDistribution: { easy: 50, medium: 50, hard: 0 } },
  scoring: { correct: 4, incorrect: -1 },
  timing: { mode: 'TOTAL_TIME', durationMinutes: 180 },
  navigation: { mode: 'FREE' }
});

const updatedWithWarnings = adminTestService.getTest(testWithWarnings.id);
const warningsReadiness = testReadinessService.validateTestForPublish(updatedWithWarnings, null, { role: 'admin' });

assert(warningsReadiness.ready === true, 'Test with only advisory warnings passes readiness gate (ready === true)');
assert(warningsReadiness.errors.length === 0, 'Zero blocking errors');
assert(warningsReadiness.warnings.length >= 1, 'Advisory warnings captured separately', `Count: ${warningsReadiness.warnings.length}`);

// -----------------------------------------------------------------------------
// Suite 3: Content Duplicate & Type Checking
// -----------------------------------------------------------------------------
console.log('\n--- Suite 3: Content Duplicate & Type Compatibility ---');

const dupTest = {
  ...updatedWithWarnings,
  id: 'test-dup-001',
  content: {
    questionIds: [sampleQuestionIds[0], sampleQuestionIds[0], sampleQuestionIds[1]]
  }
};

const dupReadiness = testReadinessService.validateTestForPublish(dupTest, null, { role: 'admin' });
const dupCodes = dupReadiness.errors.map(e => e.code);
assert(dupCodes.includes('DUPLICATE_QUESTION_IDS'), 'Duplicate question IDs flagged as blocking error');

// -----------------------------------------------------------------------------
// Suite 4: Candidate Simulation Preview Model
// -----------------------------------------------------------------------------
console.log('\n--- Suite 4: Candidate Simulation Preview Model ---');

const previewModel = testPreviewService.getPreviewModel(updatedWithWarnings);

assert(previewModel && previewModel.isSimulation === true, 'Preview model created with isSimulation flag');
assert(previewModel.questions.length === sampleQuestionIds.length, 'Resolves all attached questions in sequence');
assert(previewModel.questions[0].options.length > 0, 'Question options formatted with labels (A, B, C, D)');
assert(previewModel.questions[0].correctAnswer !== undefined, 'Question has valid answer representation');
assert(previewModel.sections.length >= 1, 'Questions partitioned into structural sections');
assert(previewModel.navigation.mode === 'FREE', 'Navigation mode accurately reflected in simulation');

// -----------------------------------------------------------------------------
// Suite 5: Test Window Scheduling & Validation
// -----------------------------------------------------------------------------
console.log('\n--- Suite 5: Test Window Scheduling & Validation ---');

// Invalid: end before start
const invalidWindow = {
  enabled: true,
  startAt: '2026-10-10T10:00:00Z',
  endAt: '2026-10-09T10:00:00Z', // Prior to start
  timezone: 'Asia/Kolkata'
};

const invalidWinRes = testPublishService.validateTestWindow(invalidWindow);
assert(invalidWinRes.valid === false, 'Test Window rejects end date prior to start date');

// Valid window
const validWindow = {
  enabled: true,
  startAt: '2026-10-01T09:00:00Z',
  endAt: '2026-10-07T18:00:00Z',
  timezone: 'Asia/Kolkata'
};

const validWinRes = testPublishService.validateTestWindow(validWindow);
assert(validWinRes.valid === true, 'Test Window accepts valid future date range');

// Disabled window (continuous access)
const disabledWinRes = testPublishService.validateTestWindow({ enabled: false });
assert(disabledWinRes.valid === true, 'Disabled test window (continuous access) evaluates as valid');

// -----------------------------------------------------------------------------
// Suite 6: Publishing Lifecycle & State Transition
// -----------------------------------------------------------------------------
console.log('\n--- Suite 6: Publishing Lifecycle & State Transition ---');

// 6.1 Publishing blocked if invalid
let blockedCaught = false;
try {
  testPublishService.publishAdminTest(emptyTest.id);
} catch (err) {
  blockedCaught = true;
}
assert(blockedCaught === true, 'Attempting to publish an unready test is strictly blocked');

// 6.2 Admin Publish
const publishedAdminTest = testPublishService.publishAdminTest(updatedWithWarnings.id, {
  testWindow: validWindow,
  publishedBy: 'Dr. Administrator'
});

assert(publishedAdminTest.status === TEST_STATUS.PUBLISHED, 'Admin test status transitioned to PUBLISHED');
assert(publishedAdminTest.publishedAt !== undefined, 'Timestamp publishedAt recorded');
assert(publishedAdminTest.testWindow && publishedAdminTest.testWindow.enabled === true, 'Test window attached to published test');

// 6.3 Faculty Publish
const facultyTest = cbtTestService.createFacultyTest({
  name: 'Pediatrics Clinical Assessment',
  code: 'PED-CBT-001',
  examId: 'neet-pg',
  subject: 'Pediatrics',
  testType: 'SUBJECT_TEST',
  durationMinutes: 45,
  totalMarks: 20
});

// Attach questions and publish
testBuildService.buildManually(facultyTest, sampleQuestionIds);
const publishedFacultyTest = testPublishService.publishFacultyTest(facultyTest.id, {
  testWindow: validWindow,
  publishedBy: 'Dr. Sarah Jenkins'
});

assert(publishedFacultyTest.status === FACULTY_TEST_STATUS.UPCOMING, 'Faculty test status transitioned to UPCOMING');
assert(publishedFacultyTest.publishedAt !== undefined, 'Faculty test publishedAt timestamp recorded');

// -----------------------------------------------------------------------------
// Suite 7: Lifecycle Configuration Lock
// -----------------------------------------------------------------------------
console.log('\n--- Suite 7: Lifecycle Configuration Lock ---');

assert(testPublishService.isTestPublished(publishedAdminTest) === true, 'isTestPublished recognizes published Admin test');
assert(testPublishService.isTestPublished(publishedFacultyTest) === true, 'isTestPublished recognizes published Faculty test');

// Attempting to modify questions on published test must be rejected by lifecycle guard
let lockErrorCaught = false;
try {
  adminTestService.applyAdminTestBuild(publishedAdminTest.id, [sampleQuestionIds[0]]);
} catch (err) {
  lockErrorCaught = true;
}
assert(lockErrorCaught === true, 'LIFECYCLE_LOCKED: Modifying questions on published test is rejected');

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n==================================================');
console.log(`PHASE 6 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('==================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

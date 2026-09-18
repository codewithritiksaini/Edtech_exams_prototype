// =============================================================================
// PHASE 5: TEST BUILD & GENERATION AUTOMATED TEST SUITE
// Verifies Manual Build, Blueprint Build (Deterministic Selection),
// Shortfall Detection, Candidate Preview vs Commit, and RBAC Scoping.
// =============================================================================

import './setupNodeTestEnv.js';
import { testBuildService, BUILD_MODES, BUILD_STATUS } from '../src/services/testBuildService.js';
import { adminTestService } from '../src/services/adminTestService.js';
import { cbtTestService } from '../src/services/cbtTestService.js';
import { questionService } from '../src/services/questionService.js';
import { rulesService } from '../src/services/rulesService.js';

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
console.log('RUNNING PHASE 5: GENERATE / BUILD TEST SUITE');
console.log('==================================================\n');

// -----------------------------------------------------------------------------
// Suite 1: Canonical Question Bank Inventory & Structure
// -----------------------------------------------------------------------------
console.log('--- Suite 1: Canonical Question Bank Inventory ---');
const allQuestions = questionService.getQuestions();
assert(Array.isArray(allQuestions) && allQuestions.length >= 15, 'Canonical questions available in Question Bank', `Count: ${allQuestions.length}`);

const sampleQ = allQuestions[0];
assert(sampleQ && sampleQ.id && sampleQ.subject && sampleQ.type, 'Question entity has required fields (id, subject, type)');

const publishedQuestions = allQuestions.filter(q => q.status === 'published' || q.status === 'active' || !q.status);
assert(publishedQuestions.length >= 10, 'Published questions available for generation', `Count: ${publishedQuestions.length}`);

// -----------------------------------------------------------------------------
// Suite 2: Manual Build Workflow
// -----------------------------------------------------------------------------
console.log('\n--- Suite 2: Manual Build Workflow ---');
// Create an admin test for testing
const testAdmin = adminTestService.createTest({
  name: 'Phase 5 Manual Build Verification Test',
  code: 'P5-MANUAL-001',
  examId: 'neet-pg',
  testType: 'MOCK',
  durationMinutes: 60,
  totalMarks: 40
});

assert(testAdmin && testAdmin.id, 'Admin test created for manual build');

// Select 3 question IDs manually
const selectedIds = [publishedQuestions[0].id, publishedQuestions[1].id, publishedQuestions[2].id];
const manualResult = testBuildService.buildManually(testAdmin, selectedIds, { updatedBy: 'Test Runner' });

assert(manualResult.success === true, 'Manual build succeeds with valid question IDs');
assert(manualResult.test.content.questionIds.length === 3, 'Manual build attaches exactly 3 question IDs');
assert(manualResult.test.build.mode === BUILD_MODES.MANUAL, 'Build mode recorded as MANUAL');

// Verify deduplication
const duplicateIds = [publishedQuestions[0].id, publishedQuestions[0].id, publishedQuestions[1].id];
const dedupResult = testBuildService.buildManually(testAdmin, duplicateIds);
assert(dedupResult.test.content.questionIds.length === 2, 'Duplicate question IDs are automatically deduplicated');
assert(new Set(dedupResult.test.content.questionIds).size === dedupResult.test.content.questionIds.length, 'No duplicate IDs in committed test');

// -----------------------------------------------------------------------------
// Suite 3: Deterministic Blueprint Generation
// -----------------------------------------------------------------------------
console.log('\n--- Suite 3: Deterministic Blueprint Generation ---');
// Configure blueprint rules with specific subjects that exist in the bank
const medicineQuestions = publishedQuestions.filter(q => (q.subject || '').toLowerCase() === 'medicine');
const surgeryQuestions = publishedQuestions.filter(q => (q.subject || '').toLowerCase() === 'surgery');

const blueprintTest = adminTestService.createTest({
  name: 'Phase 5 Blueprint Determinism Test',
  code: 'P5-BP-001',
  examId: 'neet-pg',
  testType: 'MOCK',
  durationMinutes: 90,
  totalMarks: 50
});

// Configure blueprint rules
const blueprintRules = {
  blueprint: {
    mode: 'CUSTOM',
    totalQuestions: 4,
    subjectQuotas: [
      { subjectId: 'medicine', subjectName: 'Medicine', percentage: 50, count: 2 },
      { subjectId: 'surgery', subjectName: 'Surgery', percentage: 50, count: 2 }
    ],
    difficultyDistribution: {
      easy: 50,
      medium: 50,
      hard: 0
    }
  },
  scoring: { correct: 4, incorrect: -1, unanswered: 0 },
  timing: { mode: 'TOTAL_TIME', durationMinutes: 90 }
};

adminTestService.saveTestRules(blueprintTest.id, blueprintRules);

const genRun1 = testBuildService.generateQuestionsFromBlueprint(blueprintTest, {
  rules: blueprintRules,
  pool: allQuestions
});

assert(genRun1.success === true, 'Blueprint generation succeeds with valid pool');
assert(genRun1.questionIds.length === 4, 'Generates exactly 4 questions per blueprint target');

// Run 2: Exact same test and pool must yield exact same ordered array
const genRun2 = testBuildService.generateQuestionsFromBlueprint(blueprintTest, {
  rules: blueprintRules,
  pool: allQuestions
});

const isIdentical = JSON.stringify(genRun1.questionIds) === JSON.stringify(genRun2.questionIds);
assert(isIdentical === true, 'Deterministic generation: subsequent runs produce identical ordered IDs');

// -----------------------------------------------------------------------------
// Suite 4: Shortfall & Insufficient Questions Detection
// -----------------------------------------------------------------------------
console.log('\n--- Suite 4: Shortfall & Insufficient Questions Detection ---');
// Request 50 questions when the pool has fewer than 50
const impossibleBlueprint = {
  blueprint: {
    mode: 'CUSTOM',
    totalQuestions: 50,
    subjectQuotas: [
      { subjectId: 'medicine', subjectName: 'Medicine', percentage: 100, count: 50 }
    ]
  }
};

let shortfallErrorCaught = false;
let shortfallDetails = null;

try {
  testBuildService.generateQuestionsFromBlueprint(blueprintTest, {
    rules: impossibleBlueprint,
    pool: allQuestions
  });
} catch (err) {
  shortfallErrorCaught = true;
  shortfallDetails = err.shortfallInfo || err;
}

assert(shortfallErrorCaught === true, 'Shortfall throws error instead of silently generating incomplete test');
assert(
  shortfallDetails && (shortfallDetails.code === 'INSUFFICIENT_QUESTIONS' || shortfallDetails.message?.includes('INSUFFICIENT')),
  'Error identifies INSUFFICIENT_QUESTIONS condition'
);

// Verify test build preview detects shortfall gracefully without throwing if requested
const validationResult = testBuildService.validateBuild({
  test: blueprintTest,
  rules: impossibleBlueprint,
  pool: allQuestions
});
assert(validationResult.valid === false, 'validateBuild reports invalid for impossible blueprint');
assert(validationResult.shortfalls && validationResult.shortfalls.length > 0, 'validateBuild provides explicit shortfalls list');

// -----------------------------------------------------------------------------
// Suite 5: Candidate Preview vs Commit (Safe Assembly)
// -----------------------------------------------------------------------------
console.log('\n--- Suite 5: Candidate Preview vs Commit ---');
const safeTest = adminTestService.createTest({
  name: 'Safe Assembly Commit Test',
  code: 'P5-SAFE-001',
  examId: 'neet-pg',
  testType: 'MOCK',
  durationMinutes: 60,
  totalMarks: 40
});

// Initially set 2 manual questions
testBuildService.buildManually(safeTest, [allQuestions[0].id, allQuestions[1].id]);
const beforeCommitIds = [...adminTestService.getTest(safeTest.id).content.questionIds];
assert(beforeCommitIds.length === 2, 'Pre-existing test has 2 questions attached');

// Generate preview candidate set
const preview = testBuildService.previewBuild({
  test: safeTest,
  rules: blueprintRules,
  pool: allQuestions
});

assert(preview.candidateIds && preview.candidateIds.length === 4, 'Preview generates 4 candidate question IDs');

// Verify safeTest is NOT modified yet
const testAfterPreview = adminTestService.getTest(safeTest.id);
assert(
  JSON.stringify(testAfterPreview.content.questionIds) === JSON.stringify(beforeCommitIds),
  'Preview does NOT overwrite current test questions before commit'
);

// Commit candidate build
const applyResult = testBuildService.applyBuild({
  testId: safeTest.id,
  role: 'admin',
  questionIds: preview.candidateIds,
  buildMeta: {
    mode: BUILD_MODES.BLUEPRINT,
    source: 'Phase 5 Verification Suite'
  }
});

const testAfterApply = adminTestService.getTest(safeTest.id);
assert(
  JSON.stringify(testAfterApply.content.questionIds) === JSON.stringify(preview.candidateIds),
  'applyBuild successfully commits candidate question set to test.content.questionIds'
);
assert(testAfterApply.build.mode === BUILD_MODES.BLUEPRINT, 'Committed build mode is recorded as BLUEPRINT');

// -----------------------------------------------------------------------------
// Suite 6: Clear Build Workflow
// -----------------------------------------------------------------------------
console.log('\n--- Suite 6: Clear Build Workflow ---');
const clearedTest = testBuildService.clearBuild(safeTest.id, 'admin');
assert(clearedTest.content.questionIds.length === 0, 'clearBuild resets questionIds to empty array');
assert(clearedTest.build.mode === null, 'clearBuild resets build mode to null');

// -----------------------------------------------------------------------------
// Suite 7: Faculty RBAC & Subject Scoping
// -----------------------------------------------------------------------------
console.log('\n--- Suite 7: Faculty RBAC & Subject Scoping ---');
const facultyUser = {
  id: 'fac-101',
  name: 'Dr. Sarah Jenkins',
  role: 'faculty',
  assignedExams: ['neet-pg'],
  assignedSubjects: ['Medicine']
};

const facultyPool = testBuildService.getEligibleQuestions({
  examId: 'neet-pg',
  user: facultyUser,
  role: 'faculty',
  allQuestions
});

assert(Array.isArray(facultyPool), 'Faculty eligible question pool retrieved');
const invalidFacultyQuestions = facultyPool.filter(q => (q.subject || '').toLowerCase() !== 'medicine');
assert(
  invalidFacultyQuestions.length === 0,
  'Faculty is strictly restricted to assigned subjects (Medicine)',
  `Non-medicine count: ${invalidFacultyQuestions.length}`
);

const adminPool = testBuildService.getEligibleQuestions({
  examId: 'neet-pg',
  user: { role: 'admin' },
  role: 'admin',
  allQuestions
});
assert(adminPool.length > facultyPool.length, 'Admin pool has broader catalog scope than restricted Faculty pool');

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n==================================================');
console.log(`PHASE 5 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('==================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

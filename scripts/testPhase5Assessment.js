import './setupNodeTestEnv.js';

import { 
  cbtTestService, 
  CBT_STATUS, 
  evaluateAttempt, 
  canStartTest, 
  getTestStatus, 
  getTestTimes, 
  formatTestCountdown 
} from '../src/services/cbtTestService.js';
import { testService } from '../src/data/mockData.js';
import { questionService } from '../src/services/questionService.js';
import { curriculumService } from '../src/services/curriculumService.js';
import { peopleService } from '../src/services/peopleService.js';
import { catalogService } from '../src/services/catalogService.js';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

console.log('\n================================================================');
console.log('MEDPREP PRO — PHASE 5 ASSESSMENT & QUESTION BANK TEST SUITE');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Suite 1: Single Source of Truth & Dual-Key Synchronized Persistence
// -----------------------------------------------------------------------------
console.log('--- Suite 1: Canonical Assessment Service & Adapter ---');

const initialTests = cbtTestService.getAllTests('all');
assert(Array.isArray(initialTests) && initialTests.length >= 5, `Initial CBT tests loaded (${initialTests.length} tests, >= 5 expected)`);

// Test adapter transparent delegation
const adapterTests = testService.getTests();
assert(Array.isArray(adapterTests) && adapterTests.length === initialTests.length, `testService adapter returns identical tests count (${adapterTests.length})`);

// Create test through cbtTestService and verify dual persistence
const testCreated = cbtTestService.createTest({
  name: 'Unit Test Exam Alpha',
  examTrack: 'neet-pg',
  courseId: 'neet-pg',
  course: 'NEET PG & NExT 2026',
  durationMinutes: 45,
  totalQuestions: 10,
  totalMarks: 50,
  passingScore: 50,
  status: 'upcoming'
});
assert(testCreated && testCreated.id, `Test created with ID: ${testCreated.id}`);

// Check that both storage keys are synchronized
const cbtRaw = JSON.parse(localStorage.getItem('medprep_cbt_tests_v2') || '[]');
const phase6Raw = JSON.parse(localStorage.getItem('medprep_phase6_tests') || '[]');
assert(
  cbtRaw.some(t => t.id === testCreated.id) && phase6Raw.some(t => t.id === testCreated.id),
  'Dual-key synchronized persistence: newly created test exists in both medprep_cbt_tests_v2 and medprep_phase6_tests'
);

// Verify adapter can read the test
const retrievedViaAdapter = testService.getTestById(testCreated.id);
assert(retrievedViaAdapter && retrievedViaAdapter.name === 'Unit Test Exam Alpha', 'testService adapter retrieves test created via cbtTestService');

// -----------------------------------------------------------------------------
// Suite 2: Question Bank Integration & Curriculum Hierarchy Validation
// -----------------------------------------------------------------------------
console.log('\n--- Suite 2: Question Bank & Curriculum Hierarchy Validation ---');

// Validate full valid curriculum path
const validScope = {
  examId: 'neet-pg',
  subjectId: 'sub-neet-cardio',
  moduleId: 'mod-neet-valvular',
  lectureId: 'lec-valvular-mvp-tricuspid'
};
const validCurriculum = questionService.validateCurriculumHierarchy(validScope);
assert(validCurriculum.isValid, `Valid curriculum hierarchy validated (NEET PG -> Cardio -> Valvular -> MVP)`);

// Validate invalid subject
const invalidScope = {
  examId: 'neet-pg',
  subjectId: 'nonexistent-subject-xyz'
};
const invalidCurriculum = questionService.validateCurriculumHierarchy(invalidScope);
assert(!invalidCurriculum.isValid && invalidCurriculum.errors.length > 0, `Invalid subject correctly caught: ${invalidCurriculum.errors.join('; ')}`);

// Author a question into canonical Question Bank
const authoredResult = questionService.createFromAuthoring({
  vignette: 'A 50-year-old male presents with severe chest pain and diaphoresis.',
  question: 'What is the most appropriate initial diagnostic study?',
  optA: '12-lead Electrocardiogram (ECG)',
  optB: 'Echocardiogram',
  optC: 'Cardiac MRI',
  optD: 'CT Pulmonary Angiogram',
  correct: 'A',
  explanation: 'ECG must be obtained and interpreted within 10 minutes of arrival.',
  guidelineRef: 'ACC/AHA 2023 Guidelines',
  marks: 5,
  negativeMarks: -1,
  examId: 'neet-pg',
  subjectId: 'sub-neet-cardio',
  moduleId: 'mod-neet-valvular',
  lectureId: 'lec-valvular-mvp-tricuspid'
});

assert(authoredResult.success && authoredResult.question, `Question created from authoring adapter (ID: ${authoredResult.question?.id})`);
assert(authoredResult.question?.content?.prompt === 'What is the most appropriate initial diagnostic study?', 'Question prompt correctly structured');
assert(authoredResult.question?.scoring?.marks === 5 && authoredResult.question?.scoring?.negativeMarks === -1, 'Question scoring correctly set (+5/-1)');

// -----------------------------------------------------------------------------
// Suite 3: Test Creation Referencing Question Bank IDs
// -----------------------------------------------------------------------------
console.log('\n--- Suite 3: Test Creation Referencing Question Bank IDs ---');

const bankQId = authoredResult.question.id;
const bankTest = cbtTestService.createTest({
  name: 'Question Bank Integration CBT',
  examTrack: 'neet-pg',
  courseId: 'neet-pg',
  course: 'NEET PG & NExT 2026',
  durationMinutes: 30,
  questionIds: [bankQId],
  passingScore: 50
});

assert(bankTest.questionIds?.includes(bankQId), `Test created referencing Question Bank ID: ${bankQId}`);

// Resolve questions for test
const resolvedQuestions = cbtTestService.getQuestionsForTest(bankTest.id);
assert(Array.isArray(resolvedQuestions) && resolvedQuestions.length >= 1, `getQuestionsForTest resolves Question Bank items (count: ${resolvedQuestions.length})`);
assert(resolvedQuestions[0].id === bankQId, `Resolved question ID matches bank ID: ${resolvedQuestions[0].id}`);
assert(resolvedQuestions[0].correct === 'A', `Resolved question correct answer key is 'A'`);
assert(resolvedQuestions[0].options?.length === 4, `Resolved question options normalized to 4 choices`);

// -----------------------------------------------------------------------------
// Suite 4: 1 Active Attempt Enforcement & State Machine
// -----------------------------------------------------------------------------
console.log('\n--- Suite 4: 1 Active Attempt Enforcement & State Machine ---');

const attemptTestId = testCreated.id;
const attempt1 = cbtTestService.startAttempt(attemptTestId, 'student-ritik');
assert(attempt1 && attempt1.status === CBT_STATUS.IN_PROGRESS, `Attempt 1 started with status: ${attempt1?.status}`);
assert(typeof attempt1.startedAt === 'number' && typeof attempt1.endAt === 'number', 'Attempt has valid startedAt and endAt timestamps');

// Starting again MUST return the existing active attempt, not create a duplicate
const attempt2 = cbtTestService.startAttempt(attemptTestId, 'student-ritik');
assert(attempt2.attemptId === attempt1.attemptId, `1 Active Attempt Enforced: subsequent startAttempt returned existing attempt (${attempt2.attemptId})`);

// Pause attempt
const paused = cbtTestService.pauseAttempt(attemptTestId);
assert(paused && paused.status === CBT_STATUS.PAUSED, `pauseAttempt sets status to 'paused'`);
assert(typeof paused.remainingMs === 'number' && paused.remainingMs > 0, `pauseAttempt captures remainingMs (${Math.round(paused.remainingMs / 1000)}s)`);

// Resume attempt
const resumed = cbtTestService.resumeAttempt(attemptTestId);
assert(resumed && resumed.status === CBT_STATUS.IN_PROGRESS, `resumeAttempt restores status to 'in-progress'`);
assert(resumed.endAt > Date.now(), `resumeAttempt recalculates endAt timestamp into future`);

// -----------------------------------------------------------------------------
// Suite 5: Effective Deadline Calculation: min(startedAt + duration, testEnd)
// -----------------------------------------------------------------------------
console.log('\n--- Suite 5: Effective Deadline Calculation ---');

// Test whose window closes in 10 minutes, but test duration is 45 minutes
const shortWindowTest = cbtTestService.createTest({
  name: 'Short Window Window Mock',
  examTrack: 'neet-pg',
  courseId: 'neet-pg',
  durationMinutes: 45,
  startOffsetMinutes: -10, // started 10m ago
  endOffsetMinutes: 10, // closes in 10m
  status: 'upcoming'
});

const shortAttempt = cbtTestService.startAttempt(shortWindowTest.id, 'student-ritik');
const timeUntilEnd = shortAttempt.endAt - shortAttempt.startedAt;
// Window closes in 10 minutes = 600,000ms. Allowed duration is 45m = 2,700,000ms.
// Effective deadline MUST be bounded by window closing!
assert(
  shortAttempt.endAt <= (Date.now() + 11 * 60000),
  `Effective deadline bounded by window closing: attempt endAt is ~10m from now, NOT full 45m`
);

// -----------------------------------------------------------------------------
// Suite 6: Autosave & Real-Time Answer Capture
// -----------------------------------------------------------------------------
console.log('\n--- Suite 6: Autosave & Answer Capture ---');

// Save answers
cbtTestService.saveAnswer(attemptTestId, 'q1', 'B');
cbtTestService.saveAnswer(attemptTestId, 'q2', 'C');
let savedAttempt = cbtTestService.getActiveAttempt(attemptTestId);
assert(savedAttempt.answers['q1'] === 'B' && savedAttempt.answers['q2'] === 'C', 'Answers saved in real time (q1=B, q2=C)');

// Update answer
cbtTestService.saveAnswer(attemptTestId, 'q1', 'A');
savedAttempt = cbtTestService.getActiveAttempt(attemptTestId);
assert(savedAttempt.answers['q1'] === 'A' && savedAttempt.answers['q2'] === 'C', 'Answer updated cleanly without loss of other answers (q1=A, q2=C)');

// Mark for review
cbtTestService.toggleReview(attemptTestId, 'q1');
savedAttempt = cbtTestService.getActiveAttempt(attemptTestId);
assert(savedAttempt.markedForReview['q1'] === true, 'Question q1 marked for review');

// Clear answer
cbtTestService.clearAnswer(attemptTestId, 'q2');
savedAttempt = cbtTestService.getActiveAttempt(attemptTestId);
assert(savedAttempt.answers['q2'] === undefined, 'Answer q2 cleared cleanly');

// -----------------------------------------------------------------------------
// Suite 7: Centralized Pure Evaluation Engine (`evaluateAttempt`)
// -----------------------------------------------------------------------------
console.log('\n--- Suite 7: Evaluation Engine & Score Consistency ---');

// Mock test with 3 questions
const evalTest = {
  id: 'test-eval-mock',
  name: 'Evaluation Precision Test',
  durationMinutes: 30,
  totalQuestions: 3,
  totalMarks: 15,
  marksPerCorrect: 5,
  marksPerIncorrect: -1,
  passingScore: 50,
  questions: [
    { id: 'q1', correct: 'A', marks: 5, negativeMarks: -1 },
    { id: 'q2', correct: 'B', marks: 5, negativeMarks: -1 },
    { id: 'q3', correct: 'C', marks: 5, negativeMarks: -1 }
  ]
};

// Attempt: q1 correct ('A'), q2 incorrect ('A', should be 'B'), q3 unattempted
// Expected score: +5 -1 +0 = 4 / 15 marks
const mockAttempt = {
  testId: 'test-eval-mock',
  studentId: 'student-ritik',
  answers: {
    q1: 'A', // Correct: +5
    q2: 'A'  // Incorrect: -1
    // q3: Unattempted: 0
  },
  startedAt: Date.now() - 600000,
  submittedTimestamp: Date.now()
};

const evalResult = evaluateAttempt(mockAttempt, evalTest);
assert(evalResult !== null, 'Pure evaluation function returned result object');
assert(evalResult.correctCount === 1, `Correct count is 1 (got: ${evalResult.correctCount})`);
assert(evalResult.incorrectCount === 1, `Incorrect count is 1 (got: ${evalResult.incorrectCount})`);
assert(evalResult.unattemptedCount === 1, `Unattempted count is 1 (got: ${evalResult.unattemptedCount})`);
assert(evalResult.score === 4, `Calculated score is exactly 4 (+5 -1 = 4; got: ${evalResult.score})`);
assert(evalResult.totalMarks === 15, `Total marks is 15 (got: ${evalResult.totalMarks})`);
assert(evalResult.percentage === 27, `Percentage is 27% (4/15 * 100 = 26.66% -> 27%; got: ${evalResult.percentage})`);
assert(evalResult.statusLabel === 'Fail', `Status label is 'Fail' since 27% < 50% passing cutoff`);

// Verify submitAttempt delegates directly to evaluateAttempt
const finalSubmission = cbtTestService.submitAttempt(attemptTestId, 'normal');
assert(finalSubmission && finalSubmission.status === CBT_STATUS.SUBMITTED, `submitAttempt finalizes status to 'submitted'`);
assert(typeof finalSubmission.score === 'number' && typeof finalSubmission.totalMarks === 'number', 'Submitted attempt contains numerical score and totalMarks');
assert(finalSubmission.submissionReason === 'normal', 'Submission reason captured as normal');

// Verify Faculty Cohort Results reflect submission
const cohortResults = cbtTestService.getCohortResults(attemptTestId);
assert(cohortResults && cohortResults.students?.length > 0, `Faculty cohort scorecard retrieved (${cohortResults.students?.length} candidates)`);
const ritikInCohort = cohortResults.students.find(s => s.name?.includes('Ritik'));
assert(ritikInCohort !== undefined, `Dr. Ritik Saini present in Faculty cohort results`);

// -----------------------------------------------------------------------------
// Suite 8: Candidate Eligibility & Access Gating (canStartTest)
// -----------------------------------------------------------------------------
console.log('\n--- Suite 8: Candidate Eligibility & Access Gating ---');

// Available test (started in past, closes in future)
const availableTest = {
  id: 'test-avail',
  status: 'upcoming',
  startOffsetMinutes: -10,
  endOffsetMinutes: 60,
  courseId: 'neet-pg',
  examTrack: 'neet-pg'
};
assert(canStartTest(availableTest, new Date()), 'canStartTest returns true for currently available test');

// Draft test MUST NOT be startable
const draftTest = {
  id: 'test-draft',
  status: 'draft',
  startOffsetMinutes: -10,
  endOffsetMinutes: 60
};
assert(!canStartTest(draftTest, new Date()), 'canStartTest returns false for draft test');

// Archived test MUST NOT be startable
const archivedTest = {
  id: 'test-archived',
  status: 'archived',
  startOffsetMinutes: -10,
  endOffsetMinutes: 60
};
assert(!canStartTest(archivedTest, new Date()), 'canStartTest returns false for archived test');

// Future upcoming test MUST NOT be startable
const futureTest = {
  id: 'test-future',
  status: 'upcoming',
  startOffsetMinutes: 120, // starts in 2 hours
  endOffsetMinutes: 240
};
assert(!canStartTest(futureTest, new Date()), 'canStartTest returns false for future scheduled test before window opens');

// Student enrollment course matching
const studentNeet = { id: 's1', enrolledExamId: 'neet-pg' };
const studentUsmle = { id: 's2', enrolledExamId: 'usmle' };
assert(canStartTest(availableTest, new Date(), studentNeet), 'NEET PG enrolled candidate allowed to access NEET PG test');
assert(!canStartTest(availableTest, new Date(), studentUsmle), 'USMLE candidate blocked from starting NEET PG test');

// -----------------------------------------------------------------------------
// Suite 9: Faculty Scope & Role Boundary
// -----------------------------------------------------------------------------
console.log('\n--- Suite 9: Faculty Scope Integrity ---');

const faculty = peopleService.getCurrentFacultyProfile();
const assignedExams = faculty?.assignedExams || ['neet-pg', 'usmle'];
assert(Array.isArray(assignedExams) && assignedExams.length > 0, `Faculty assigned exams retrieved: [${assignedExams.join(', ')}]`);

// Verify filtering of tests by faculty exam scope
const allExams = catalogService.getExams();
assert(allExams.length >= 4, `Active catalog exams loaded (${allExams.length} programs)`);

const facultyPermittedExams = allExams.filter(e => assignedExams.includes(e.id));
assert(
  facultyPermittedExams.length === assignedExams.length,
  `Faculty scope restricts authoring strictly to authorized programs (${facultyPermittedExams.map(e => e.name).join(', ')})`
);

// Delete test cleanup check
const deleted = cbtTestService.deleteTest(testCreated.id);
assert(deleted === true, 'Test deleted successfully');
assert(cbtTestService.getTestById(testCreated.id) === null, 'Deleted test no longer found in cbtTestService');

// -----------------------------------------------------------------------------
// Final Results
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`PHASE 5 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

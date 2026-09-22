// =============================================================================
// ASSESSMENT DELIVERY & PREVIEW ARCHITECTURE TEST SUITE
// Verifies:
// 1. Unified Test Read Model (testPresentationService)
// 2. Question Order Integrity (test.content.questionIds)
// 3. Question Transformation for Candidate Delivery vs Authoring Preview
// 4. Multi-Section & Navigation/Timing/Scoring Rules Resolution
// 5. Candidate Attempt Engine (testAttemptService) Lifecycle & Scoring
// 6. Non-Destructive Isolation (Test and Question definitions remain unmodified)
// =============================================================================

import './setupNodeTestEnv.js';
import { testPresentationService } from '../src/services/testPresentationService.js';
import { testAttemptService } from '../src/services/testAttemptService.js';
import { adminTestService } from '../src/services/adminTestService.js';
import { cbtTestService } from '../src/services/cbtTestService.js';
import { questionService } from '../src/services/questionService.js';

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

console.log('\n===============================================================');
console.log('RUNNING ASSESSMENT DELIVERY & PREVIEW ARCHITECTURE TEST SUITE');
console.log('===============================================================\n');

// -----------------------------------------------------------------------------
// Suite 1: Unified Test Retrieval & Read Model
// -----------------------------------------------------------------------------
console.log('--- Suite 1: Unified Test Retrieval (Admin & Faculty) ---');

// 1. Create an Admin Test with structured rules and questions
const sampleQuestions = questionService.getQuestions();
if (sampleQuestions.length < 4) {
  // Ensure we have mock questions
  questionService.createQuestion({
    stem: 'Which cranial nerve passes through the jugular foramen?',
    type: 'single-best-answer',
    subject: 'Anatomy',
    options: [
      { id: 'opt-1', text: 'CN IX (Glossopharyngeal)' },
      { id: 'opt-2', text: 'CN VII (Facial)' },
      { id: 'opt-3', text: 'CN V (Trigeminal)' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'CN IX, X, and XI exit through the jugular foramen.'
  });
}

const allQuestions = questionService.getQuestions();
const q1 = allQuestions[0];
const q2 = allQuestions[1] || allQuestions[0];
const q3 = allQuestions[2] || allQuestions[0];

const testAdmin = {
  id: 'test-delivery-eval-001',
  name: 'Clinical Medicine Grand Assessment 2026',
  code: 'CMGA-2026',
  examId: 'neet-pg',
  status: 'PUBLISHED',
  content: {
    questionIds: [q3.id, q1.id, q2.id] // Deliberate custom order
  },
  rules: {
    timing: {
      totalDurationMinutes: 90,
      mode: 'TOTAL_TIME',
      autoSubmit: true
    },
    navigation: {
      mode: 'FREE',
      allowBackNavigation: true,
      allowSkip: true,
      allowQuestionReview: true
    },
    scoring: {
      marksPerQuestion: 4,
      penaltyPerWrong: 1,
      passingPercentage: 60
    }
  },
  structure: {
    sections: [
      { id: 'sec-a', name: 'Section A: Clinical Diagnostics', questionIds: [q3.id, q1.id] },
      { id: 'sec-b', name: 'Section B: Therapeutics', questionIds: [q2.id] }
    ]
  }
};

adminTestService.tests.push(testAdmin);
adminTestService.save();

// Test resolution by ID
const resolvedAdminTest = testPresentationService.getTestById('test-delivery-eval-001');
assert(resolvedAdminTest !== null, 'Retrieves Admin Test by ID');
assert(resolvedAdminTest.name === 'Clinical Medicine Grand Assessment 2026', 'Matches test name');

// -----------------------------------------------------------------------------
// Suite 2: Question Order Integrity
// -----------------------------------------------------------------------------
console.log('\n--- Suite 2: Question Order Integrity & Roster Resolution ---');

const rosterQuestions = testPresentationService.getTestQuestions(testAdmin);
assert(rosterQuestions.length === 3, 'Roster contains all 3 specified questions');
assert(rosterQuestions[0].id === q3.id, 'First question matches questionIds[0] (strictly preserves order)');
assert(rosterQuestions[1].id === q1.id, 'Second question matches questionIds[1]');
assert(rosterQuestions[2].id === q2.id, 'Third question matches questionIds[2]');

// -----------------------------------------------------------------------------
// Suite 3: Question Transformation for Delivery vs Preview
// -----------------------------------------------------------------------------
console.log('\n--- Suite 3: Question Transformation (Delivery vs Authoring Preview) ---');

// Delivery model for candidate (Must NOT expose correctOptionId or explanation)
const candidateQ = testPresentationService.getQuestionForDelivery(q1, 'student');
assert(candidateQ.correctOptionId === undefined, 'Candidate question scrubs correctOptionId');
assert(candidateQ.explanation === undefined, 'Candidate question scrubs explanation');
assert(candidateQ.stem === q1.stem, 'Candidate question preserves stem');
assert(Array.isArray(candidateQ.options), 'Candidate question preserves options');

// Preview model for author/faculty (May retain metadata for review)
const previewQ = testPresentationService.getQuestionForDelivery(q1, 'preview');
assert(previewQ.correctOptionId !== undefined || q1.correctOptionId === undefined, 'Preview question retains or handles correctOptionId');
assert(previewQ.stem === q1.stem, 'Preview question preserves stem');

// -----------------------------------------------------------------------------
// Suite 4: Multi-Section & Rules Resolution
// -----------------------------------------------------------------------------
console.log('\n--- Suite 4: Multi-Section, Timing & Scoring Models ---');

const sections = testPresentationService.getTestSections(testAdmin);
assert(sections.length === 2, 'Resolves 2 sections from test.structure');
assert(sections[0].id === 'sec-a', 'First section matches sec-a');
assert(sections[1].id === 'sec-b', 'Second section matches sec-b');

const timing = testPresentationService.getTestTimingModel(testAdmin);
assert(timing.totalDurationMinutes === 90, 'Timing model resolves 90 minutes from test.rules.timing');
assert(timing.autoSubmit === true, 'Timing model resolves autoSubmit = true');

const scoring = testPresentationService.getTestScoringModel(testAdmin);
assert(scoring.marksPerQuestion === 4, 'Scoring model resolves +4 marks');
assert(scoring.penaltyPerWrong === 1, 'Scoring model resolves -1 penalty');

const nav = testPresentationService.getTestNavigationModel(testAdmin);
assert(nav.allowBackNavigation === true, 'Navigation model resolves allowBackNavigation');
assert(nav.allowSkip === true, 'Navigation model resolves allowSkip');

// -----------------------------------------------------------------------------
// Suite 5: Full Test Preview & Delivery Models
// -----------------------------------------------------------------------------
console.log('\n--- Suite 5: Full Preview and Delivery Models ---');

const previewModel = testPresentationService.getTestPreviewModel('test-delivery-eval-001');
assert(previewModel.test.id === 'test-delivery-eval-001', 'PreviewModel contains test metadata');
assert(previewModel.questions.length === 3, 'PreviewModel contains ordered questions');
assert(previewModel.sections.length === 2, 'PreviewModel contains sections');

const deliveryModel = testPresentationService.getTestDeliveryModel(testAdmin);
assert(deliveryModel.questions.length === 3, 'DeliveryModel contains candidate-ready questions');
assert(deliveryModel.questions[0].correctOptionId === undefined, 'DeliveryModel questions are sanitized');

// -----------------------------------------------------------------------------
// Suite 6: Student Test Attempt Lifecycle (testAttemptService)
// -----------------------------------------------------------------------------
console.log('\n--- Suite 6: Student Test Attempt Engine (testAttemptService) ---');

const studentId = 'candidate-dr-saini-01';

// 1. Start Attempt
const attempt = testAttemptService.startAttempt(testAdmin, studentId);
assert(attempt !== null, 'Starts new candidate attempt');
assert(attempt.status === 'IN_PROGRESS', 'Attempt status is IN_PROGRESS');
assert(attempt.remainingSeconds === 90 * 60, 'Attempt initializes countdown timer to 5400s (90m)');
assert(attempt.totalQuestions === 3, 'Attempt records totalQuestions = 3');

// 2. Answer Questions
// Question 1 (q3): Correct Answer
const q3Resolved = testPresentationService.getQuestionForDelivery(q3, 0, 'preview');
const q3Correct = q3Resolved.correctAnswers[0] || q3.answer?.correct?.[0] || 'A';
const updatedAns1 = testAttemptService.recordResponse(testAdmin.id, studentId, q3.id, q3Correct);
assert(updatedAns1.answers[q3.id] === q3Correct, 'Records answer for Q1');

// Question 2 (q1): Deliberately wrong answer
const q1Resolved = testPresentationService.getQuestionForDelivery(q1, 1, 'preview');
const q1Correct = q1Resolved.correctAnswers[0] || q1.answer?.correct?.[0] || 'A';
const wrongOpt = q1Resolved.options?.find(o => o.id !== q1Correct)?.id || 'Z';
testAttemptService.recordResponse(testAdmin.id, studentId, q1.id, wrongOpt);

// Question 3 (q2): Flag for review without answer
testAttemptService.toggleFlag(testAdmin.id, studentId, q2.id);
const flaggedAttempt = testAttemptService.getAttempt(testAdmin.id, studentId);
assert(flaggedAttempt.flaggedQuestionIds.includes(q2.id), 'Toggles review flag for Q3');

// Check question statuses in palette
const statuses = testAttemptService.getAllQuestionStatuses(testAdmin.id, studentId, [q3.id, q1.id, q2.id]);
assert(statuses[q3.id] === 'ANSWERED', 'Q1 status is ANSWERED');
assert(statuses[q1.id] === 'ANSWERED', 'Q2 status is ANSWERED');
assert(statuses[q2.id] === 'MARKED', 'Q3 status is MARKED (unanswered flagged)');

// 3. Update Remaining Timer
testAttemptService.updateRemainingTime(testAdmin.id, studentId, 3600);
const timedAttempt = testAttemptService.getAttempt(testAdmin.id, studentId);
assert(timedAttempt.remainingSeconds === 3600, 'Updates remaining countdown to 3600s');

// 4. Submit Attempt & Verify Scoring
const submitted = testAttemptService.submitAttempt(testAdmin.id, studentId);
assert(submitted.status === 'COMPLETED', 'Submitted attempt status is COMPLETED');
assert(submitted.summary !== undefined, 'Attempt generates scoring summary');
assert(submitted.summary.totalQuestions === 3, 'Summary records 3 total questions');
assert(submitted.summary.answeredCount === 2, 'Summary records 2 answered questions');
assert(submitted.summary.unansweredCount === 1, 'Summary records 1 unanswered question');

// Check Score Calculation:
// Q1 was correct: +4
// Q2 was wrong: -1
// Q3 was unanswered: 0
// Total score should be 3
const expectedScore = 4 - 1; // 3
assert(submitted.summary.score === expectedScore, `Score calculated correctly (+4 - 1 = 3)`, `Actual: ${submitted.summary.score}`);
assert(submitted.summary.correctCount === 1, 'Correct count is 1');
assert(submitted.summary.incorrectCount === 1, 'Incorrect count is 1');

// -----------------------------------------------------------------------------
// Suite 7: Non-Destructive Isolation
// -----------------------------------------------------------------------------
console.log('\n--- Suite 7: Non-Destructive Isolation Verification ---');

const testAfterAttempt = adminTestService.getTest('test-delivery-eval-001');
assert(testAfterAttempt.status === 'PUBLISHED', 'Canonical test status unmodified');
assert(testAfterAttempt.content.questionIds.length === 3, 'Canonical questionIds intact');
assert(testAfterAttempt.attempts === undefined, 'Canonical test object was NOT mutated with attempt state');

const q1After = questionService.getQuestionById ? questionService.getQuestionById(q1.id) : questionService.getQuestions().find(q => q.id === q1.id);
assert(q1After.stem === q1.stem, 'Canonical question stem unmodified');

// Summary Report
console.log('\n===============================================================');
console.log(`TEST EXECUTION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('===============================================================\n');

if (failed > 0) {
  process.exit(1);
}

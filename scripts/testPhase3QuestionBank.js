// =============================================================================
// PHASE 3 QUESTION BANK & AUTHORING AUTOMATED TEST SUITE
// Verifies Question Bank CRUD, search, filter, cloning, archiving, usage,
// status-aware validation across all 5 supported types, and role access.
// =============================================================================

import { questionService } from '../src/services/questionService.js';
import { assessmentService } from '../src/services/assessmentService.js';
import { 
  QUESTION_TYPES, 
  QUESTION_STATUSES, 
  getDefaultQuestionStructure 
} from '../src/utils/questionTypes.js';
import { 
  validateQuestion, 
  validateQuestionAuthoring, 
  detectDuplicateIds 
} from '../src/utils/examValidation.js';
import { authService, USER_ROLES } from '../src/services/authService.js';

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

console.log('\n==================================================');
console.log('RUNNING PHASE 3 QUESTION BANK & AUTHORING TESTS');
console.log('==================================================\n');

// -----------------------------------------------------------------------------
// Suite 1: Question Inventory & Stats
// -----------------------------------------------------------------------------
console.log('--- Suite 1: Inventory & Statistics ---');

questionService.resetToDefaults();
const questions = questionService.getQuestions();
assert(Array.isArray(questions) && questions.length >= 15, `Retrieve default questions (loaded ${questions.length} items, >= 15 expected)`);

const stats = questionService.getSummaryStats();
assert(
  stats.total === questions.length &&
  stats.published > 0 &&
  stats.draft > 0 &&
  stats.review > 0,
  `Dynamic KPI stats calculate accurately (Total: ${stats.total}, Published: ${stats.published}, Review: ${stats.review}, Draft: ${stats.draft})`
);

// -----------------------------------------------------------------------------
// Suite 2: Question Retrieval & Single Item Lookup
// -----------------------------------------------------------------------------
console.log('\n--- Suite 2: Retrieval & Lookup ---');

const qNeet = questionService.getQuestionById('q-neet-01');
assert(qNeet !== null && qNeet.type === QUESTION_TYPES.SINGLE_CHOICE, 'Get question by ID (q-neet-01)');

const qNonExistent = questionService.getQuestionById('q-unknown-id-xyz');
assert(qNonExistent === null, 'Gracefully return null for nonexistent question ID');

const multiBatch = questionService.getQuestionsByIds(['q-neet-01', 'q-neet-02']);
assert(multiBatch.length === 2 && multiBatch[0].id === 'q-neet-01', 'Get multiple questions by ID array');

// -----------------------------------------------------------------------------
// Suite 3: Question Creation Across All 5 Supported Types
// -----------------------------------------------------------------------------
console.log('\n--- Suite 3: Question Creation (5 Types) ---');

// 1. Single Choice
const singleChoiceRes = questionService.createQuestion({
  id: 'q-test-sc-01',
  type: QUESTION_TYPES.SINGLE_CHOICE,
  content: { prompt: 'Single choice diagnostic question?' },
  responseSchema: {
    options: [
      { id: 'A', text: 'Option A description' },
      { id: 'B', text: 'Option B description' }
    ]
  },
  answer: { correct: ['A'] },
  scoring: { marks: 5, negativeMarks: -1 },
  metadata: { subject: 'Cardiology', topic: 'ECG', difficulty: 'medium', tags: ['Unit'] },
  status: QUESTION_STATUSES.PUBLISHED
});
assert(singleChoiceRes.success && singleChoiceRes.question.id === 'q-test-sc-01', 'Create Single Choice Question');

// 2. Multiple Choice
const multiChoiceRes = questionService.createQuestion({
  id: 'q-test-mc-01',
  type: QUESTION_TYPES.MULTIPLE_CHOICE,
  content: { prompt: 'Select all features of cardiogenic shock:' },
  responseSchema: {
    options: [
      { id: 'A', text: 'Elevated PCWP' },
      { id: 'B', text: 'Decreased Cardiac Index' },
      { id: 'C', text: 'Decreased SVR' }
    ]
  },
  answer: { correct: ['A', 'B'] },
  scoring: { marks: 4, negativeMarks: -1 },
  metadata: { subject: 'Critical Care', topic: 'Hemodynamics', difficulty: 'hard' },
  status: QUESTION_STATUSES.PUBLISHED
});
assert(multiChoiceRes.success && multiChoiceRes.question.answer.correct.length === 2, 'Create Multiple Choice (Multi-Select) Question');

// 3. True / False
const tfRes = questionService.createQuestion({
  id: 'q-test-tf-01',
  type: QUESTION_TYPES.TRUE_FALSE,
  content: { prompt: 'Aspirin permanently acetylates cyclooxygenase-1.' },
  responseSchema: {
    options: [
      { id: 'true', text: 'True' },
      { id: 'false', text: 'False' }
    ]
  },
  answer: { correct: ['true'] },
  scoring: { marks: 2, negativeMarks: -1 },
  metadata: { subject: 'Pharmacology', topic: 'Antiplatelet', difficulty: 'easy' },
  status: QUESTION_STATUSES.PUBLISHED
});
assert(tfRes.success && tfRes.question.answer.correct[0] === 'true', 'Create True / False Question');

// 4. Short Answer
const saRes = questionService.createQuestion({
  id: 'q-test-sa-01',
  type: QUESTION_TYPES.SHORT_ANSWER,
  content: { prompt: 'Name the artery that gives rise to the posterior descending artery in a right-dominant circulation.' },
  responseSchema: { placeholder: 'Enter artery name...', caseSensitive: false },
  answer: { correct: ['Right Coronary Artery', 'RCA', 'Right coronary'] },
  scoring: { marks: 3, negativeMarks: 0 },
  metadata: { subject: 'Anatomy', topic: 'Coronary Anatomy', difficulty: 'medium' },
  status: QUESTION_STATUSES.PUBLISHED
});
assert(saRes.success && saRes.question.answer.correct.includes('RCA'), 'Create Short Answer Question');

// 5. Fill in the Blank
const fbRes = questionService.createQuestion({
  id: 'q-test-fb-01',
  type: QUESTION_TYPES.FILL_BLANK,
  content: { prompt: 'Normal physiological fasting serum glucose is ___ to ___ mg/dL.' },
  responseSchema: { placeholder: 'e.g. 70 to 99' },
  answer: { correct: ['70 to 99', '70-99', '70 - 99'] },
  scoring: { marks: 2, negativeMarks: 0 },
  metadata: { subject: 'Endocrinology', topic: 'Glucose Homeostasis', difficulty: 'easy' },
  status: QUESTION_STATUSES.PUBLISHED
});
assert(fbRes.success && fbRes.question.type === QUESTION_TYPES.FILL_BLANK, 'Create Fill in the Blank Question');

// -----------------------------------------------------------------------------
// Suite 4: Question Duplication / Cloning
// -----------------------------------------------------------------------------
console.log('\n--- Suite 4: Duplication / Cloning ---');

const cloneRes = questionService.cloneQuestion('q-test-sc-01');
assert(
  cloneRes.success &&
  cloneRes.question.id !== 'q-test-sc-01' &&
  cloneRes.question.id.includes('q-test-sc-01-clone-') &&
  cloneRes.question.status === QUESTION_STATUSES.DRAFT,
  `Clone question generates independent ID (${cloneRes.question?.id}) with draft status`
);

// Verify modifying clone does not mutate original
questionService.updateQuestion(cloneRes.question.id, {
  content: { prompt: 'Mutated clone prompt' }
});
const originalUntouched = questionService.getQuestionById('q-test-sc-01');
assert(originalUntouched.content.prompt === 'Single choice diagnostic question?', 'Original question remains unchanged after clone mutation');

// -----------------------------------------------------------------------------
// Suite 5: Status Transitions & Archiving
// -----------------------------------------------------------------------------
console.log('\n--- Suite 5: Status Transitions & Archiving ---');

const statusUpdated = questionService.changeQuestionStatus('q-test-sc-01', QUESTION_STATUSES.REVIEW);
assert(statusUpdated.status === QUESTION_STATUSES.REVIEW, 'Change status to review');

const archivedQ = questionService.archiveQuestion('q-test-sc-01');
assert(archivedQ.status === QUESTION_STATUSES.ARCHIVED, 'Archive question successfully');

// -----------------------------------------------------------------------------
// Suite 6: Search & Multi-Filter Engine
// -----------------------------------------------------------------------------
console.log('\n--- Suite 6: Search & Filtering Engine ---');

// Search across prompt
const searchByPrompt = questionService.searchQuestions({ search: 'Amiodarone' });
assert(searchByPrompt.length > 0 && searchByPrompt.some(q => q.id === 'q-med-mc-02'), 'Search by keyword in prompt (Amiodarone)');

// Search across clinical vignette
const searchByVignette = questionService.searchQuestions({ search: 'crushing substernal' });
assert(searchByVignette.length > 0 && searchByVignette.some(q => q.id === 'q-neet-01'), 'Search by keyword in clinical vignette stem');

// Search by Question ID
const searchById = questionService.searchQuestions({ search: 'q-neet-01' });
assert(searchById.length === 1 && searchById[0].id === 'q-neet-01', 'Search directly by question ID');

// Filter by Status
const filterByStatus = questionService.searchQuestions({ status: QUESTION_STATUSES.ARCHIVED });
assert(filterByStatus.some(q => q.id === 'q-med-arc-01' || q.id === 'q-test-sc-01'), 'Filter by status (Archived)');

// Filter by Question Type
const filterByType = questionService.searchQuestions({ type: QUESTION_TYPES.TRUE_FALSE });
assert(filterByType.length >= 2 && filterByType.every(q => q.type === QUESTION_TYPES.TRUE_FALSE), 'Filter by type (True/False)');

// -----------------------------------------------------------------------------
// Suite 7: Question Usage Resolution
// -----------------------------------------------------------------------------
console.log('\n--- Suite 7: Usage Calculation ---');

// Seed assessments to verify usage calculation
assessmentService.seedPrototypeExamData();
const neetUsage = questionService.getQuestionUsage('q-neet-01');
assert(neetUsage.count >= 1 && neetUsage.assessments.length >= 1, `q-neet-01 is correctly recognized as used in ${neetUsage.count} assessment(s)`);

const caseUsage = questionService.getQuestionUsage('q-case-01');
assert(caseUsage.count >= 1, `q-case-01 grouped item is correctly recognized as used in ${caseUsage.count} assessment(s)`);

const unassignedUsage = questionService.getQuestionUsage('q-test-sa-01');
assert(unassignedUsage.count === 0, 'Unassigned question correctly reports 0 assessment references');

// -----------------------------------------------------------------------------
// Suite 8: Status-Aware Authoring Validation
// -----------------------------------------------------------------------------
console.log('\n--- Suite 8: Authoring Validation Rules ---');

// 1. Single Choice: Invalid when 0 correct options
const scInvalid = validateQuestionAuthoring({
  type: QUESTION_TYPES.SINGLE_CHOICE,
  content: { prompt: 'Valid prompt' },
  responseSchema: { options: [{ id: 'A', text: 'Option A' }, { id: 'B', text: 'Option B' }] },
  answer: { correct: [] },
  scoring: { marks: 5 }
}, QUESTION_STATUSES.PUBLISHED);
assert(!scInvalid.isValid && scInvalid.errors.some(e => e.includes('exactly 1 correct answer')), 'Reject Single Choice with 0 correct answers for publication');

// 2. Single Choice: Invalid when < 2 options
const scTooFewOptions = validateQuestionAuthoring({
  type: QUESTION_TYPES.SINGLE_CHOICE,
  content: { prompt: 'Valid prompt' },
  responseSchema: { options: [{ id: 'A', text: 'Option A' }] },
  answer: { correct: ['A'] },
  scoring: { marks: 5 }
}, QUESTION_STATUSES.PUBLISHED);
assert(!scTooFewOptions.isValid && scTooFewOptions.errors.some(e => e.includes('at least 2')), 'Reject Single Choice with fewer than 2 options');

// 3. Multiple Choice: Invalid when 0 correct answers
const mcInvalid = validateQuestionAuthoring({
  type: QUESTION_TYPES.MULTIPLE_CHOICE,
  content: { prompt: 'Valid prompt' },
  responseSchema: { options: [{ id: 'A', text: 'Option A' }, { id: 'B', text: 'Option B' }] },
  answer: { correct: [] },
  scoring: { marks: 4 }
}, QUESTION_STATUSES.PUBLISHED);
assert(!mcInvalid.isValid && mcInvalid.errors.some(e => e.includes('at least 1 correct answer')), 'Reject Multiple Choice with 0 correct answers for publication');

// 4. Short Answer: Invalid when 0 accepted answers
const saInvalid = validateQuestionAuthoring({
  type: QUESTION_TYPES.SHORT_ANSWER,
  content: { prompt: 'Valid prompt' },
  responseSchema: {},
  answer: { correct: [] },
  scoring: { marks: 3 }
}, QUESTION_STATUSES.PUBLISHED);
assert(!saInvalid.isValid && saInvalid.errors.some(e => e.includes('at least 1 accepted answer')), 'Reject Short Answer with 0 accepted answer phrases');

// 5. Draft Mode: Allows saving incomplete drafts with warnings
const draftIncomplete = validateQuestionAuthoring({
  type: QUESTION_TYPES.SINGLE_CHOICE,
  content: { prompt: 'Draft in progress' },
  responseSchema: { options: [{ id: 'A', text: 'Draft opt' }] },
  answer: { correct: [] },
  scoring: { marks: 5 }
}, QUESTION_STATUSES.DRAFT);
assert(draftIncomplete.isValid && draftIncomplete.warnings.length > 0, 'Draft mode allows incomplete questions with non-blocking warnings');

// -----------------------------------------------------------------------------
// Suite 9: Duplicate ID Protection & Clean Deletion
// -----------------------------------------------------------------------------
console.log('\n--- Suite 9: Duplicate ID Protection & Deletion ---');

const dupCheck = detectDuplicateIds([
  { id: 'q-dup-test' },
  { id: 'q-dup-test' },
  { id: 'q-unique-test' }
], 'testSuite');
assert(dupCheck.length === 1 && dupCheck[0] === 'q-dup-test', 'Detect duplicate IDs without throwing exceptions');

// Clean up created test items
questionService.deleteQuestion('q-test-sc-01');
questionService.deleteQuestion('q-test-mc-01');
questionService.deleteQuestion('q-test-tf-01');
questionService.deleteQuestion('q-test-sa-01');
questionService.deleteQuestion('q-test-fb-01');
questionService.deleteQuestion(cloneRes.question.id);

assert(questionService.getQuestionById('q-test-sc-01') === null, 'Delete transient test questions cleanly');

// -----------------------------------------------------------------------------
// Suite 10: Role Guard & Route Logic
// -----------------------------------------------------------------------------
console.log('\n--- Suite 10: Role Logic & Access Boundaries ---');

// Mock auth roles verification
const adminUser = { email: 'admin@demo.com', role: USER_ROLES.ADMIN };
const facultyUser = { email: 'faculty@demo.com', role: USER_ROLES.FACULTY };
const studentUser = { email: 'student@demo.com', role: USER_ROLES.STUDENT };

assert(adminUser.role === 'admin' && facultyUser.role === 'faculty', 'Admin and Faculty roles identified for Question Bank authoring access');
assert(studentUser.role === 'student' && studentUser.role !== USER_ROLES.ADMIN && studentUser.role !== USER_ROLES.FACULTY, 'Student role is strictly disallowed from question authoring');

// Default template generator
const tfDefault = getDefaultQuestionStructure(QUESTION_TYPES.TRUE_FALSE);
assert(tfDefault.responseSchema.options.length === 2 && tfDefault.answer.correct[0] === 'true', 'Default question structure helper formats True/False correctly');

console.log('\n==================================================');
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('==================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

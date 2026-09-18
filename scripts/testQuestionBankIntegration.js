// =============================================================================
// QUESTION BANK INTEGRATION AUTOMATED TEST SUITE
// Tests QuestionBankService, AdminTestService question assembly,
// Faculty parity, search/filter, duplicate prevention, type enforcement,
// lifecycle locking, and cloning.
// =============================================================================

import { questionService } from '../src/services/questionService.js';
import { questionBankService } from '../src/services/questionBankService.js';
import { adminTestService, TEST_STATUS } from '../src/services/adminTestService.js';
import { cbtTestService, FACULTY_TEST_STATUS } from '../src/services/cbtTestService.js';
import { questionTypeService } from '../src/services/questionTypeService.js';

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

console.log('\n======================================================');
console.log('RUNNING QUESTION BANK & CONTENT INTEGRATION TESTS');
console.log('======================================================\n');

// -----------------------------------------------------------------------------
// Suite 1: Question Bank Service Fundamentals
// -----------------------------------------------------------------------------
console.log('--- Suite 1: QuestionBankService Fundamentals ---');

questionService.resetToDefaults();
const allBankQuestions = questionBankService.getQuestions();
assert(Array.isArray(allBankQuestions) && allBankQuestions.length >= 10, 
  `Retrieve all questions from Question Bank (loaded ${allBankQuestions.length} items, expected >= 10)`);

const singleQ = questionBankService.getQuestion('q-neet-01');
assert(singleQ !== null && singleQ.id === 'q-neet-01', 'Retrieve single question by ID');

const batchQs = questionBankService.getQuestionsByIds(['q-neet-01', 'q-neet-02']);
assert(batchQs.length === 2 && batchQs[0].id === 'q-neet-01' && batchQs[1].id === 'q-neet-02', 
  'Retrieve multiple questions in exact requested sequence');

const stats = questionBankService.getQuestionStats();
assert(stats.total === allBankQuestions.length && stats.byDifficulty.medium > 0, 
  `Dynamic statistics calculated correctly (Total: ${stats.total}, Medium: ${stats.byDifficulty.medium})`);

// -----------------------------------------------------------------------------
// Suite 2: Search & Composable Filtering Engine
// -----------------------------------------------------------------------------
console.log('\n--- Suite 2: Search & Composable Filters ---');

// Case-insensitive search on prompt/vignette
const searchPrompt = questionBankService.searchQuestions('shock');
assert(searchPrompt.length > 0, `Search text "shock" case-insensitively found ${searchPrompt.length} questions`);

const searchUpper = questionBankService.searchQuestions('SHOCK');
assert(searchUpper.length === searchPrompt.length, 'Search is strictly case-insensitive ("SHOCK" matches "shock")');

// Filter by Difficulty
const easyQs = questionBankService.getQuestions({ difficulty: 'easy' });
assert(easyQs.every(q => (q.metadata?.difficulty || '').toLowerCase() === 'easy'), 
  'Filter by difficulty="easy" matches exclusively easy questions');

// Filter by Question Type
const singleChoiceQs = questionBankService.getQuestions({ type: 'single_choice' });
assert(singleChoiceQs.every(q => questionTypeService.normalizeQuestionTypeId(q.type) === 'single_choice'), 
  'Filter by normalized question type "single_choice" works');

// Filter by Exam Track
const neetQs = questionBankService.getQuestions({ examId: 'neet-pg' });
assert(neetQs.length > 0, `Filter by examId="neet-pg" returned ${neetQs.length} questions`);

// Composable Multi-Filter
const multiFiltered = questionBankService.getQuestions({
  examId: 'neet-pg',
  difficulty: 'medium'
});
assert(multiFiltered.length > 0 && multiFiltered.every(q => (q.metadata?.difficulty || '').toLowerCase() === 'medium'),
  'Composable multi-filter (examId="neet-pg" + difficulty="medium") works');

// -----------------------------------------------------------------------------
// Suite 3: Question Type Compatibility Validation
// -----------------------------------------------------------------------------
console.log('\n--- Suite 3: Question Type Compatibility ---');

const testAllowedTypes = ['single_choice', 'clinical_case'];

// Allowed single_choice question
const scQuestion = questionBankService.getQuestion('q-neet-01');
const compAllowed = questionBankService.checkQuestionTypeCompatibility(scQuestion, testAllowedTypes);
assert(compAllowed.compatible === true, 'Permitted format single_choice passes compatibility check');

// Disallowed image_based question (or non-allowed type)
const disallowedQuestion = { id: 'q-custom-01', type: 'image_based' };
const compDisallowed = questionBankService.checkQuestionTypeCompatibility(disallowedQuestion, testAllowedTypes);
assert(compDisallowed.compatible === false && compDisallowed.error.includes('not permitted'), 
  'Disallowed format image_based rejected with explanatory error');

// Empty allowed types implies permissive/all allowed
const compUnrestricted = questionBankService.checkQuestionTypeCompatibility(disallowedQuestion, []);
assert(compUnrestricted.compatible === true, 'Empty allowed types configuration is permissive');

// -----------------------------------------------------------------------------
// Suite 4: Admin Test Question Assembly Methods
// -----------------------------------------------------------------------------
console.log('\n--- Suite 4: Admin Test Question Assembly ---');

// Create a draft test
const newAdminTest = adminTestService.createTest({
  name: 'QB Assembly Test',
  examId: 'neet-pg',
  targetQuestions: 10,
  questionTypeConfig: {
    allowedTypes: ['single_choice', 'multiple_choice', 'clinical_case']
  }
});
assert(newAdminTest !== null && newAdminTest.id, `Created draft Admin Test (${newAdminTest.id})`);

// Initial questions should be empty
const initQuestions = adminTestService.getAdminTestQuestions(newAdminTest.id);
assert(Array.isArray(initQuestions) && initQuestions.length === 0, 'Initial Admin Test question roster is empty');

// 1. Add single question
const q1Res = adminTestService.addQuestionToAdminTest(newAdminTest.id, 'q-neet-01');
assert(q1Res.success && q1Res.test.content.questionIds.includes('q-neet-01'), 
  'addQuestionToAdminTest adds item to content.questionIds');

// 2. Duplicate Prevention
let duplicateBlocked = false;
try {
  adminTestService.addQuestionToAdminTest(newAdminTest.id, 'q-neet-01');
} catch (err) {
  duplicateBlocked = true;
}
assert(duplicateBlocked, 'Duplicate addition of existing question throws error (Duplicate Prevention)');

// 3. Question Type Enforcement in addQuestion
let incompatibleBlocked = false;
try {
  // Create an image_based question in questionService first
  questionService.createQuestion({
    id: 'q-disallowed-img-01',
    type: 'image_based',
    content: { prompt: 'CT scan question' },
    responseSchema: { options: [{ id: 'A', text: 'Opt' }] },
    answer: { correct: ['A'] },
    metadata: { examId: 'neet-pg', subject: 'Radiology', difficulty: 'hard' }
  });
  adminTestService.addQuestionToAdminTest(newAdminTest.id, 'q-disallowed-img-01');
} catch (err) {
  incompatibleBlocked = true;
}
assert(incompatibleBlocked, 'Adding question format not permitted by test throws error (Question Type Enforcement)');

// 4. Bulk addition
const q2 = questionBankService.getQuestions({ examId: 'neet-pg' }).find(q => q.id !== 'q-neet-01' && q.type === 'single_choice');
if (q2) {
  const bulkRes = adminTestService.addQuestionsToAdminTest(newAdminTest.id, [q2.id]);
  assert(bulkRes.addedCount === 1, `Bulk added ${bulkRes.addedCount} new questions`);
}

// 5. Reorder questions
const currentIds = adminTestService.getAdminTest(newAdminTest.id).content.questionIds;
if (currentIds.length >= 2) {
  const reversed = [...currentIds].reverse();
  const reorderRes = adminTestService.reorderAdminTestQuestions(newAdminTest.id, reversed);
  assert(reorderRes.content.questionIds[0] === reversed[0], 'reorderAdminTestQuestions updates candidate delivery sequence');
}

// 6. Remove question
const toRemove = currentIds[0];
const removeRes = adminTestService.removeQuestionFromAdminTest(newAdminTest.id, toRemove);
assert(!removeRes.content.questionIds.includes(toRemove), 'removeQuestionFromAdminTest removes item from test roster');

// 7. Question Bank remains untouched
const checkQStillInBank = questionBankService.getQuestion(toRemove);
assert(checkQStillInBank !== null, 'Removing question from Test does NOT delete it from Question Bank (Single Source of Truth)');

// -----------------------------------------------------------------------------
// Suite 5: Content Validation & Readiness
// -----------------------------------------------------------------------------
console.log('\n--- Suite 5: Content Validation ---');

const valRes = adminTestService.validateAdminTestContent(newAdminTest.id);
assert(valRes.questionCount !== undefined, `Validation returns questionCount (${valRes.questionCount})`);
if (valRes.questionCount < (newAdminTest.targetQuestions || 10)) {
  assert(valRes.warnings.length > 0, 'Validation returns warning when questions are below target standard');
}

// -----------------------------------------------------------------------------
// Suite 6: Lifecycle Protection & Immutability
// -----------------------------------------------------------------------------
console.log('\n--- Suite 6: Lifecycle Protection ---');

// Update test to PUBLISHED status
adminTestService.updateTest(newAdminTest.id, { status: TEST_STATUS.PUBLISHED });

let lockedAddBlocked = false;
try {
  adminTestService.addQuestionToAdminTest(newAdminTest.id, 'q-neet-02');
} catch (err) {
  lockedAddBlocked = true;
}
assert(lockedAddBlocked, 'addQuestionToAdminTest blocked on PUBLISHED test (Lifecycle Protection)');

let lockedRemoveBlocked = false;
try {
  adminTestService.removeQuestionFromAdminTest(newAdminTest.id, 'q-neet-01');
} catch (err) {
  lockedRemoveBlocked = true;
}
assert(lockedRemoveBlocked, 'removeQuestionFromAdminTest blocked on PUBLISHED test (Lifecycle Protection)');

// -----------------------------------------------------------------------------
// Suite 7: Test Duplication Copies Question Roster
// -----------------------------------------------------------------------------
console.log('\n--- Suite 7: Test Duplication ---');

// Revert to draft for clean duplication
adminTestService.updateTest(newAdminTest.id, { status: TEST_STATUS.DRAFT });
adminTestService.addQuestionsToAdminTest(newAdminTest.id, ['q-neet-01']);

const duplicated = adminTestService.duplicateTest(newAdminTest.id, 'Duplicated QB Test');
assert(duplicated !== null, 'duplicateTest successfully created clone');
assert(Array.isArray(duplicated.content?.questionIds) && duplicated.content.questionIds.includes('q-neet-01'), 
  'Cloned test inherits exact question roster in content.questionIds');

// -----------------------------------------------------------------------------
// Suite 8: Faculty Question Assembly Parity
// -----------------------------------------------------------------------------
console.log('\n--- Suite 8: Faculty Question Assembly Parity ---');

const facultyTest = cbtTestService.getAllTests()[0];
if (facultyTest) {
  const facQuestions = cbtTestService.getFacultyTestQuestions(facultyTest.id);
  assert(Array.isArray(facQuestions), `Faculty getFacultyTestQuestions returned ${facQuestions.length} items`);

  const facVal = cbtTestService.validateFacultyTestContent(facultyTest.id);
  assert(facVal !== null && facVal.valid !== undefined, 'Faculty validateFacultyTestContent works seamlessly');
}

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n======================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
}

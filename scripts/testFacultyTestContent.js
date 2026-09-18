import { catalogService } from '../src/services/catalogService.js';
import { curriculumService } from '../src/services/curriculumService.js';
import { questionService } from '../src/services/questionService.js';
import { adminTestService } from '../src/services/adminTestService.js';
import { 
  cbtTestService, 
  FACULTY_TEST_STATUS, 
  checkQuestionCompatibility 
} from '../src/services/cbtTestService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n======================================================');
console.log('🧪 MEDPREP PRO — FACULTY TEST CONTENT ASSEMBLY (PHASE 2) TESTS');
console.log('======================================================\n');

// Faculty Test Profiles
const facultySiddharth = {
  id: 'fac-1',
  name: 'Dr. Siddharth V.',
  email: 'faculty@demo.com',
  assignedExams: ['neet-pg', 'usmle', 'plab'],
  assignedSubjects: ['sub-neet-cardio', 'sub-neet-pharma']
};

const facultyMarcus = {
  id: 'fac-3',
  name: 'Dr. Marcus Vance',
  email: 'marcus.vance@demo.com',
  assignedExams: ['plab'],
  assignedSubjects: []
};

// Seed questions if not already in questionService
const initialQuestions = questionService.getQuestions();
console.log(`Loaded ${initialQuestions.length} initial questions from questionService.\n`);

// Ensure known test questions exist for verification
let qNeet1 = questionService.getQuestionById('q-neet-01');
if (!qNeet1) {
  const res = questionService.createQuestion({
    id: 'q-neet-01',
    type: 'single_choice',
    status: 'published',
    content: { prompt: 'NEET-PG Cardiology STEMI question' },
    metadata: { examId: 'neet-pg', subjectId: 'sub-neet-cardio', subject: 'Medicine', topic: 'Cardiology', difficulty: 'medium' }
  });
  qNeet1 = res.question;
}

let qNeet2 = questionService.getQuestionById('q-neet-02');
if (!qNeet2) {
  const res = questionService.createQuestion({
    id: 'q-neet-02',
    type: 'single_choice',
    status: 'published',
    content: { prompt: 'NEET-PG Neurology Neuropathy question' },
    metadata: { examId: 'neet-pg', subjectId: 'sub-neet-neuro', subject: 'Medicine', topic: 'Neurology', difficulty: 'easy' }
  });
  qNeet2 = res.question;
}

let qUsmle1 = questionService.getQuestionById('q-usmle-cvs-01');
if (!qUsmle1) {
  const res = questionService.createQuestion({
    id: 'q-usmle-cvs-01',
    type: 'single_choice',
    status: 'published',
    content: { prompt: 'USMLE Step 1 CVS Hemodynamics question' },
    metadata: { examId: 'usmle', subjectId: 'sub-usmle-cvs', subject: 'Physiology', topic: 'Cardiovascular', difficulty: 'hard' }
  });
  qUsmle1 = res.question;
}

let qPharma1 = questionService.getQuestionById('q-neet-05');
if (!qPharma1) {
  const res = questionService.createQuestion({
    id: 'q-neet-05',
    type: 'single_choice',
    status: 'published',
    content: { prompt: 'NEET-PG Digoxin Toxicity Antidote question' },
    metadata: { examId: 'neet-pg', subjectId: 'sub-neet-pharma', subject: 'Pharmacology', topic: 'Toxicology', difficulty: 'hard' }
  });
  qPharma1 = res.question;
}

// 1. Test Creation for Content Assembly
console.log('--- 1. Test Setup & Ownership ---');
const testNeetCardio = cbtTestService.createFacultyTest({
  examId: 'neet-pg',
  subjectId: 'sub-neet-cardio',
  name: 'Cardiology Clinical Resuscitation Assessment',
  testType: 'SUBJECT_TEST',
  targetQuestions: 3,
  status: 'DRAFT'
}, facultySiddharth);

assert(Boolean(testNeetCardio && testNeetCardio.id), `Created test "${testNeetCardio.name}" with ID: ${testNeetCardio.id}`);
assert(testNeetCardio.facultyId === facultySiddharth.id, `Test owned by Dr. Siddharth (${testNeetCardio.facultyId})`);

// Verify faculty Marcus cannot add questions to Siddharth's test
let ownershipBlocked = false;
try {
  cbtTestService.addQuestionToFacultyTest(testNeetCardio.id, 'q-neet-01', facultyMarcus);
} catch (e) {
  ownershipBlocked = true;
}
assert(ownershipBlocked, `Unauthorized faculty cannot modify another faculty's test`);

// 2. Exam Scope Enforcement
console.log('\n--- 2. Exam Scope Enforcement ---');
let examMismatchBlocked = false;
try {
  // Attempt to attach USMLE question to NEET-PG test
  cbtTestService.addQuestionToFacultyTest(testNeetCardio.id, 'q-usmle-cvs-01', facultySiddharth);
} catch (e) {
  examMismatchBlocked = true;
}
assert(examMismatchBlocked, `Attaching USMLE question to NEET-PG test was rejected with exam mismatch`);

// 3. Subject Scope Enforcement
console.log('\n--- 3. Subject Scope Enforcement ---');
let subjectMismatchBlocked = false;
try {
  // Attempt to attach Pharmacology question to a Cardiology-scoped test
  cbtTestService.addQuestionToFacultyTest(testNeetCardio.id, 'q-neet-05', facultySiddharth);
} catch (e) {
  subjectMismatchBlocked = true;
}
assert(subjectMismatchBlocked, `Attaching Pharmacology question to Cardiology-scoped test was rejected`);

// 4. Question Existence
console.log('\n--- 4. Question Existence ---');
let nonExistentBlocked = false;
try {
  cbtTestService.addQuestionToFacultyTest(testNeetCardio.id, 'non-existent-question-99999', facultySiddharth);
} catch (e) {
  nonExistentBlocked = true;
}
assert(nonExistentBlocked, `Non-existent question ID was rejected`);

// 5. Add Question
console.log('\n--- 5. Add Question ---');
const updatedWithOne = cbtTestService.addQuestionToFacultyTest(testNeetCardio.id, 'q-neet-01', facultySiddharth);
assert(updatedWithOne.content.questionIds.includes('q-neet-01'), `Question "q-neet-01" successfully added to test`);
assert(updatedWithOne.questionIds.includes('q-neet-01'), `Top-level questionIds synchronized with content.questionIds`);
assert(updatedWithOne.content.questionCount === 1, `content.questionCount is 1`);
assert(updatedWithOne.questionCount === 1, `questionCount derived metadata is 1`);

// 6. Duplicate Prevention
console.log('\n--- 6. Duplicate Prevention ---');
let duplicateBlocked = false;
try {
  cbtTestService.addQuestionToFacultyTest(testNeetCardio.id, 'q-neet-01', facultySiddharth);
} catch (e) {
  duplicateBlocked = true;
}
assert(duplicateBlocked, `Adding duplicate question "q-neet-01" was rejected`);
assert(updatedWithOne.content.questionIds.length === 1, `Question list length remained 1`);

// 7. Bulk Add Questions (and preserve order)
console.log('\n--- 7. Bulk Add Questions ---');
// Create a multi-subject test for bulk tests
const testMulti = cbtTestService.createFacultyTest({
  examId: 'neet-pg',
  name: 'NEET-PG Comprehensive Mock Assessment',
  testType: 'PRACTICE_TEST',
  targetQuestions: 5,
  status: 'DRAFT'
}, facultySiddharth);

const bulkIds = ['q-neet-01', 'q-neet-02', 'q-neet-05'];
const testAfterBulk = cbtTestService.addQuestionsToFacultyTest(testMulti.id, bulkIds, facultySiddharth);
assert(testAfterBulk.content.questionCount === 3, `Bulk added 3 questions (count = ${testAfterBulk.content.questionCount})`);
assert(
  testAfterBulk.content.questionIds[0] === 'q-neet-01' &&
  testAfterBulk.content.questionIds[1] === 'q-neet-02' &&
  testAfterBulk.content.questionIds[2] === 'q-neet-05',
  `Preserved exact input order in bulk add: ${testAfterBulk.content.questionIds.join(', ')}`
);

// 8. Remove Question from Test
console.log('\n--- 8. Remove Question from Test ---');
const testAfterRemove = cbtTestService.removeQuestionFromFacultyTest(testMulti.id, 'q-neet-02', facultySiddharth);
assert(!testAfterRemove.content.questionIds.includes('q-neet-02'), `Removed "q-neet-02" from test`);
assert(testAfterRemove.content.questionCount === 2, `questionCount decremented to 2`);
assert(
  testAfterRemove.content.questionIds[0] === 'q-neet-01' && testAfterRemove.content.questionIds[1] === 'q-neet-05',
  `Remaining question order preserved after removal: ${testAfterRemove.content.questionIds.join(', ')}`
);

// 9. Question Bank Integrity
console.log('\n--- 9. Question Bank Integrity ---');
const questionInBank = questionService.getQuestionById('q-neet-02');
assert(Boolean(questionInBank), `Question "q-neet-02" still exists in questionService after removal from test`);
assert(questionInBank.id === 'q-neet-02', `Question content and ID remain intact in Question Bank`);

// 10. Ordering
console.log('\n--- 10. Question Ordering ---');
const questionsResolved = cbtTestService.getFacultyTestQuestions(testMulti.id, facultySiddharth);
assert(questionsResolved.length === 2, `getFacultyTestQuestions returned 2 questions`);
assert(questionsResolved[0].id === 'q-neet-01', `First resolved question is "q-neet-01"`);
assert(questionsResolved[1].id === 'q-neet-05', `Second resolved question is "q-neet-05"`);

// 11. Reorder Validation
console.log('\n--- 11. Reorder Validation ---');
// Valid permutation
const reordered = cbtTestService.reorderFacultyTestQuestions(testMulti.id, ['q-neet-05', 'q-neet-01'], facultySiddharth);
assert(reordered.content.questionIds[0] === 'q-neet-05', `First question is now "q-neet-05"`);
assert(reordered.content.questionIds[1] === 'q-neet-01', `Second question is now "q-neet-01"`);

// Invalid reorder: missing an ID
let reorderMissingBlocked = false;
try {
  cbtTestService.reorderFacultyTestQuestions(testMulti.id, ['q-neet-05'], facultySiddharth);
} catch (e) {
  reorderMissingBlocked = true;
}
assert(reorderMissingBlocked, `Reorder with missing ID was rejected`);

// Invalid reorder: adding a foreign ID
let reorderForeignBlocked = false;
try {
  cbtTestService.reorderFacultyTestQuestions(testMulti.id, ['q-neet-05', 'q-neet-02'], facultySiddharth);
} catch (e) {
  reorderForeignBlocked = true;
}
assert(reorderForeignBlocked, `Reorder with foreign ID not in current set was rejected`);

// 12. Content Persistence
console.log('\n--- 12. Content Persistence across Service Reload ---');
cbtTestService.saveTests();
// Simulate service reload
const loadedDirect = cbtTestService.loadTests();
const reloadedMulti = loadedDirect.find(t => t.id === testMulti.id);
assert(Boolean(reloadedMulti), `Reloaded test found in storage`);
assert(
  reloadedMulti.content.questionIds.length === 2 &&
  reloadedMulti.content.questionIds[0] === 'q-neet-05' &&
  reloadedMulti.content.questionIds[1] === 'q-neet-01',
  `Question references and order survived reload: ${reloadedMulti.content.questionIds.join(', ')}`
);

// 13. Content Validation — Empty Test
console.log('\n--- 13. Content Validation (NO_QUESTIONS) ---');
const emptyTest = cbtTestService.createFacultyTest({
  examId: 'neet-pg',
  name: 'Empty Practice Drill',
  testType: 'PRACTICE_TEST',
  status: 'DRAFT'
}, facultySiddharth);
const emptyVal = cbtTestService.validateFacultyTestContent(emptyTest.id, facultySiddharth);
assert(!emptyVal.valid, `Empty test is not valid`);
assert(emptyVal.errors.includes('NO_QUESTIONS'), `Empty test returns "NO_QUESTIONS" error`);

// 14. Target Warning
console.log('\n--- 14. Target Warning ---');
const valMulti = cbtTestService.validateFacultyTestContent(testMulti.id, facultySiddharth);
assert(valMulti.valid, `Multi test content is valid (has questions, no errors)`);
assert(valMulti.warnings.length > 0, `Target mismatch generated a warning (2 selected vs 5 target)`);
assert(valMulti.warnings[0].includes('Target: 5 questions'), `Warning contains clear target information`);

// 15. Lifecycle Protection (LIVE, COMPLETED, CANCELLED)
console.log('\n--- 15. Lifecycle Protection ---');
const liveTest = cbtTestService.createFacultyTest({
  examId: 'neet-pg',
  name: 'Live Clinical CBT Assessment',
  testType: 'COHORT_TEST',
  status: 'DRAFT'
}, facultySiddharth);
liveTest.status = FACULTY_TEST_STATUS.LIVE;

let liveAddBlocked = false;
try {
  cbtTestService.addQuestionToFacultyTest(liveTest.id, 'q-neet-01', facultySiddharth);
} catch (e) {
  liveAddBlocked = true;
}
assert(liveAddBlocked, `Adding question to LIVE assessment is locked`);

const completedTest = cbtTestService.createFacultyTest({
  examId: 'neet-pg',
  name: 'Completed Clinical Assessment',
  testType: 'COHORT_TEST',
  status: 'DRAFT'
}, facultySiddharth);
completedTest.status = FACULTY_TEST_STATUS.COMPLETED;

let completedAddBlocked = false;
try {
  cbtTestService.addQuestionToFacultyTest(completedTest.id, 'q-neet-01', facultySiddharth);
} catch (e) {
  completedAddBlocked = true;
}
assert(completedAddBlocked, `Adding question to COMPLETED assessment is locked`);

const cancelledTest = cbtTestService.createFacultyTest({
  examId: 'neet-pg',
  name: 'Cancelled Practice Drill',
  testType: 'PRACTICE_TEST',
  status: 'DRAFT'
}, facultySiddharth);
cbtTestService.cancelFacultyTest(cancelledTest.id, facultySiddharth);

let cancelledAddBlocked = false;
try {
  cbtTestService.addQuestionToFacultyTest(cancelledTest.id, 'q-neet-01', facultySiddharth);
} catch (e) {
  cancelledAddBlocked = true;
}
assert(cancelledAddBlocked, `Adding question to CANCELLED assessment is locked`);

// 16. Draft Editing
console.log('\n--- 16. Draft Editing Allowed ---');
const draftDrill = cbtTestService.createFacultyTest({
  examId: 'neet-pg',
  name: 'Draft Surgical Drill',
  testType: 'CHAPTER_TEST',
  status: 'DRAFT'
}, facultySiddharth);
const draftUpdated = cbtTestService.addQuestionToFacultyTest(draftDrill.id, 'q-neet-01', facultySiddharth);
assert(draftUpdated.content.questionCount === 1, `DRAFT status allows question addition`);

// 17. Upcoming Editing
console.log('\n--- 17. Upcoming Editing Allowed ---');
const upcomingDrill = cbtTestService.createFacultyTest({
  examId: 'neet-pg',
  name: 'Upcoming Clinical Sprint',
  testType: 'SUBJECT_TEST',
  scheduling: {
    date: '2026-09-30',
    startTime: '19:00',
    durationMinutes: 45
  },
  status: 'UPCOMING'
}, facultySiddharth);
const upcomingUpdated = cbtTestService.addQuestionToFacultyTest(upcomingDrill.id, 'q-neet-01', facultySiddharth);
assert(upcomingUpdated.content.questionCount === 1, `UPCOMING status allows question addition`);

// 18. Admin Test Isolation
console.log('\n--- 18. Admin Test Isolation ---');
const adminTests = adminTestService.getTests();
assert(adminTests.length > 0, `Admin tests remain intact (${adminTests.length} tests)`);
const hasFacultyTestInAdmin = adminTests.some(t => t.id === testMulti.id);
assert(!hasFacultyTestInAdmin, `Faculty test "${testMulti.id}" does NOT appear in adminTestService`);

// 19. Question Bank Data Isolation
console.log('\n--- 19. Question Bank Data Isolation ---');
const allQuestionsCount = questionService.getQuestions().length;
cbtTestService.removeQuestionFromFacultyTest(upcomingDrill.id, 'q-neet-01', facultySiddharth);
const allQuestionsCountAfter = questionService.getQuestions().length;
assert(allQuestionsCount === allQuestionsCountAfter, `Removing question from test does not alter total Question Bank count (${allQuestionsCount})`);

// 20. Exam Catalog Isolation
console.log('\n--- 20. Exam Catalog Isolation ---');
const catalogExams = catalogService.getExams();
assert(catalogExams.length === 4, `Catalog exams unchanged (4 canonical exams)`);

// 21. Duplicate Behavior (New ID, New Code, DRAFT, Reset Schedule)
console.log('\n--- 21. Duplicate Behavior ---');
const duplicatedMulti = cbtTestService.duplicateFacultyTest(testMulti.id, facultySiddharth);
assert(duplicatedMulti.id !== testMulti.id, `Duplicated test received new unique ID: ${duplicatedMulti.id}`);
assert(duplicatedMulti.code !== testMulti.code, `Duplicated test received new unique code: ${duplicatedMulti.code}`);
assert(duplicatedMulti.status === FACULTY_TEST_STATUS.DRAFT, `Duplicated test status reset to DRAFT`);
assert(!duplicatedMulti.attempts, `Duplicated test has no attempts`);
assert(!duplicatedMulti.results, `Duplicated test has no results`);

// 22. Question References Copied in Duplicate
console.log('\n--- 22. Question References Copied in Duplicate ---');
const currentSource = cbtTestService.getTestById(testMulti.id);
assert(
  duplicatedMulti.content.questionIds.length === currentSource.content.questionIds.length,
  `Duplicated test copied ${duplicatedMulti.content.questionIds.length} question IDs`
);
assert(
  duplicatedMulti.content.questionIds[0] === currentSource.content.questionIds[0] &&
  duplicatedMulti.content.questionIds[1] === currentSource.content.questionIds[1],
  `Duplicated test preserved exact question references and order (${duplicatedMulti.content.questionIds.join(', ')})`
);

// 23. Summary Count Synchronization
console.log('\n--- 23. Summary Count Synchronization ---');
assert(
  duplicatedMulti.content.questionCount === duplicatedMulti.content.questionIds.length,
  `content.questionCount (${duplicatedMulti.content.questionCount}) === content.questionIds.length (${duplicatedMulti.content.questionIds.length})`
);
assert(
  duplicatedMulti.questionCount === duplicatedMulti.questionIds.length,
  `questionCount (${duplicatedMulti.questionCount}) === questionIds.length (${duplicatedMulti.questionIds.length})`
);

// 24. No Duplicate IDs
console.log('\n--- 24. No Duplicate Question IDs ---');
const uniqueIdsCount = new Set(duplicatedMulti.content.questionIds).size;
assert(
  uniqueIdsCount === duplicatedMulti.content.questionIds.length,
  `No duplicates in question list (unique: ${uniqueIdsCount}, total: ${duplicatedMulti.content.questionIds.length})`
);

console.log('\n======================================================');
console.log(`🏁 PHASE 2 CONTENT ASSEMBLY TESTS: ${passed} PASSED, ${failed} FAILED`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

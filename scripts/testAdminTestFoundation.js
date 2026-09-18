import { catalogService } from '../src/services/catalogService.js';
import { 
  adminTestService, 
  TEST_STATUS, 
  TEST_TYPES 
} from '../src/services/adminTestService.js';

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
console.log('🧪 MEDPREP PRO — TEST FOUNDATION (PHASE 1) VERIFICATION');
console.log('======================================================\n');

// 1. Verify Catalog Exams are Untouched and Canonical
console.log('--- 1. Canonical Medical Exams Verification ---');
const exams = catalogService.getExams();
assert(Array.isArray(exams) && exams.length >= 4, `Catalog contains ${exams.length} existing exams`);
const examIds = exams.map(e => e.id);
assert(examIds.includes('neet-pg'), 'NEET-PG exam exists in catalog');
assert(examIds.includes('usmle'), 'USMLE exam exists in catalog');
assert(examIds.includes('plab'), 'PLAB exam exists in catalog');
assert(examIds.includes('europe'), 'Europe exam exists in catalog');

// 2. Verify Initial Seed Tests Link to Existing Exams
console.log('\n--- 2. Prototype Tests & Exam Associations ---');
const initialTests = adminTestService.getTests();
assert(initialTests.length >= 8, `Loaded ${initialTests.length} prototype tests`);

let allExamsValid = true;
initialTests.forEach(test => {
  const isLinked = examIds.includes(test.examId);
  if (!isLinked) allExamsValid = false;
});
assert(allExamsValid, 'All initial tests reference valid existing medical exams');

// 3. Verify Dynamic Summary Stats
console.log('\n--- 3. Dynamic Summary Statistics ---');
const stats = adminTestService.getSummaryStats();
assert(stats.total === initialTests.length, `Total tests count (${stats.total}) matches tests array`);
assert(stats.draft >= 1, `Draft tests count: ${stats.draft}`);
assert(stats.archived >= 1, `Archived tests count: ${stats.archived}`);

// 4. Test Filtering & Search
console.log('\n--- 4. Search and Filter Mechanisms ---');
const neetTests = adminTestService.getTests({ examId: 'neet-pg' });
assert(neetTests.length > 0 && neetTests.every(t => t.examId === 'neet-pg'), `Filtered ${neetTests.length} NEET-PG tests`);

const draftTests = adminTestService.getTests({ status: TEST_STATUS.DRAFT });
assert(draftTests.length > 0 && draftTests.every(t => t.status === TEST_STATUS.DRAFT), `Filtered ${draftTests.length} DRAFT tests`);

const searchByCode = adminTestService.getTests({ search: 'neetpg-mock' });
assert(searchByCode.length > 0, `Search by code returned ${searchByCode.length} tests`);

const searchByName = adminTestService.getTests({ search: 'cardiology' });
assert(searchByName.length > 0, `Search by name returned ${searchByName.length} tests`);

// 5. Code Uniqueness & Normalization Check
console.log('\n--- 5. Code Uniqueness & Normalization ---');
const isUniqueExisting = adminTestService.isCodeUnique('NEETPG-MOCK-01');
assert(!isUniqueExisting, 'Detected existing code NEETPG-MOCK-01 as NOT unique');

const isUniqueCaseInsensitive = adminTestService.isCodeUnique('neetpg-mock-01');
assert(!isUniqueCaseInsensitive, 'Detected lowercase neetpg-mock-01 as NOT unique (case-insensitive)');

const isUniqueNew = adminTestService.isCodeUnique('BRAND-NEW-CODE-999');
assert(isUniqueNew, 'Recognized unique code as available');

// 6. Test Creation (Foundation Step 1)
console.log('\n--- 6. Test Creation (Save as Draft) ---');
const created = adminTestService.createTest({
  examId: 'neet-pg',
  name: 'NEET-PG Biochemistry Sprint Test',
  code: ' neetpg_biochem_01 ', // with spaces and lowercase
  testType: 'CHAPTER_TEST',
  targetDuration: 60,
  targetQuestions: 50,
  language: 'English',
  description: 'High yield sprint covering enzymatic pathways and metabolic cycles.',
  instructions: '50 clinical MCQs. Marking: +4 for correct, -1 for incorrect.'
});

assert(created && created.id, `Created test with ID: ${created.id}`);
assert(created.code === 'NEETPG_BIOCHEM_01', `Code normalized to uppercase: ${created.code}`);
assert(created.status === TEST_STATUS.DRAFT, `Initial status is DRAFT: ${created.status}`);
assert(created.targetQuestions === 50, `Target questions metadata saved: ${created.targetQuestions}`);
assert(created.targetDuration === 60, `Target duration metadata saved: ${created.targetDuration}`);

// 7. Test Code Immutability on Update
console.log('\n--- 7. Test Update & Code Immutability ---');
const updated = adminTestService.updateTest(created.id, {
  name: 'NEET-PG Biochemistry Comprehensive Test',
  examId: 'neet-pg',
  testType: 'CHAPTER_TEST',
  targetDuration: 75,
  targetQuestions: 60,
  code: 'CHANGED_CODE_SHOULD_BE_IGNORED' // attempt to change code
});

assert(updated.name === 'NEET-PG Biochemistry Comprehensive Test', 'Test name successfully updated');
assert(updated.code === 'NEETPG_BIOCHEM_01', `Test code remains strictly immutable: ${updated.code}`);
assert(updated.targetDuration === 75, 'Target duration updated');

// 8. Test Duplication
console.log('\n--- 8. Test Duplication Workflow ---');
const duplicated = adminTestService.duplicateTest(created.id, 'NEET-PG Biochemistry Copy', 'NEETPG_BIOCHEM_COPY');
assert(duplicated && duplicated.id !== created.id, `Duplicated test with new ID: ${duplicated.id}`);
assert(duplicated.code === 'NEETPG_BIOCHEM_COPY', `Duplicated test has unique code: ${duplicated.code}`);
assert(duplicated.status === TEST_STATUS.DRAFT, `Duplicated test starts in DRAFT status: ${duplicated.status}`);
assert(duplicated.examId === created.examId, `Duplicated test preserves associated exam: ${duplicated.examId}`);

// 9. Lifecycle Transitions: Archive & Restore
console.log('\n--- 9. Archive & Restore Transitions ---');
const archived = adminTestService.archiveTest(created.id);
assert(archived.status === TEST_STATUS.ARCHIVED, `Test transitioned to ARCHIVED: ${archived.status}`);

const restored = adminTestService.restoreTest(created.id);
assert(restored.status === TEST_STATUS.DRAFT, `Archived test restored to DRAFT: ${restored.status}`);

// 10. Clean up created tests and verify catalog purity
console.log('\n--- 10. Purity & Cleanup Verification ---');
adminTestService.deleteTest(created.id);
adminTestService.deleteTest(duplicated.id);

const postExams = catalogService.getExams();
assert(postExams.length === exams.length, `Catalog exams unchanged (${postExams.length} exams)`);

console.log('\n======================================================');
console.log(`🏁 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

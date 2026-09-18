import { catalogService } from '../src/services/catalogService.js';
import { curriculumService } from '../src/services/curriculumService.js';
import { peopleService, INITIAL_FACULTY } from '../src/services/peopleService.js';
import { adminTestService } from '../src/services/adminTestService.js';
import { 
  cbtTestService, 
  FACULTY_TEST_STATUS, 
  FACULTY_TEST_TYPES,
  getNormalizedFacultyStatus,
  generateFacultyTestCode
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
console.log('🧪 MEDPREP PRO — FACULTY TEST FOUNDATION (PHASE 1) TESTS');
console.log('======================================================\n');

// Set up Faculty mock profiles
const facultySiddharth = {
  id: 'fac-1',
  name: 'Dr. Siddharth V.',
  email: 'faculty@demo.com',
  assignedExams: ['neet-pg', 'usmle', 'plab'],
  assignedSubjects: ['sub-cardio-1', 'sub-pharma-1']
};

const facultyMarcus = {
  id: 'fac-3',
  name: 'Dr. Marcus Vance',
  email: 'marcus.vance@demo.com',
  assignedExams: ['plab'],
  assignedSubjects: []
};

// 1. Exam Scope
console.log('--- 1. Exam Scope ---');
const siddharthExams = catalogService.getExams().filter(e => facultySiddharth.assignedExams.includes(e.id));
assert(siddharthExams.length === 3, `Faculty Dr. Siddharth has access to 3 assigned exams`);
assert(siddharthExams.some(e => e.id === 'neet-pg'), `Faculty has access to NEET-PG`);
assert(!siddharthExams.some(e => e.id === 'europe'), `Faculty does NOT have access to unassigned Europe exam`);

// 2. Unassigned Exam Rejection
console.log('\n--- 2. Unassigned Exam Rejection ---');
let rejectedUnassigned = false;
try {
  cbtTestService.createFacultyTest({
    examId: 'europe',
    name: 'Unauthorized Europe Test',
    testType: 'SUBJECT_TEST'
  }, facultySiddharth);
} catch (err) {
  rejectedUnassigned = true;
}
assert(rejectedUnassigned, `Creation rejected when attempting to create test for unassigned exam "europe"`);

// 3. Test Creation
console.log('\n--- 3. Test Creation ---');
const createdTest = cbtTestService.createFacultyTest({
  examId: 'neet-pg',
  name: 'Emergency Cardiology Resuscitation Drill',
  testType: 'SUBJECT_TEST',
  description: 'Clinical scenarios on cardiac arrest algorithm and ACLS drugs.',
  instructions: '25 MCQs. +5 correct, -1 negative mark.',
  status: 'DRAFT'
}, facultySiddharth);

assert(Boolean(createdTest && createdTest.id), `Created test with ID: ${createdTest.id}`);
assert(createdTest.name === 'Emergency Cardiology Resuscitation Drill', `Test name saved properly`);
assert(createdTest.code && createdTest.code.startsWith('FT-'), `Auto-generated code created: ${createdTest.code}`);

// 4. Ownership
console.log('\n--- 4. Ownership ---');
assert(createdTest.facultyId === 'fac-1', `Stored facultyId: ${createdTest.facultyId}`);
assert(createdTest.facultyName === 'Dr. Siddharth V.', `Stored facultyName: ${createdTest.facultyName}`);

// 5. Subject Scope
console.log('\n--- 5. Subject Scope ---');
let invalidSubjectRejected = false;
try {
  cbtTestService.createFacultyTest({
    examId: 'neet-pg',
    subjectId: 'non-existent-subject-xyz',
    name: 'Invalid Subject Test',
    testType: 'SUBJECT_TEST'
  }, facultySiddharth);
} catch (e) {
  invalidSubjectRejected = true;
}
assert(invalidSubjectRejected, `Rejected test creation with invalid subject that does not belong to exam`);

// 6. Test Type Validation
console.log('\n--- 6. Test Type Validation ---');
const validTypes = ['SUBJECT_TEST', 'CHAPTER_TEST', 'PRACTICE_TEST', 'COHORT_TEST', 'CUSTOM'];
let allTypesValid = true;
validTypes.forEach(type => {
  const t = cbtTestService.createFacultyTest({
    examId: 'neet-pg',
    name: `Test for ${type}`,
    testType: type
  }, facultySiddharth);
  if (t.testType !== type) allTypesValid = false;
  cbtTestService.deleteTest(t.id);
});
assert(allTypesValid, `All 5 Faculty Test Types accepted`);

let invalidTypeRejected = false;
try {
  cbtTestService.createFacultyTest({
    examId: 'neet-pg',
    name: 'Invalid Type Test',
    testType: 'ADMIN_SUPER_MOCK'
  }, facultySiddharth);
} catch (e) {
  invalidTypeRejected = true;
}
assert(invalidTypeRejected, `Rejected invalid/Admin-only test type`);

// 7. Scheduling Persistence
console.log('\n--- 7. Scheduling Persistence ---');
const scheduledTest = cbtTestService.createFacultyTest({
  examId: 'neet-pg',
  name: 'Arrhythmias Live Cohort Mock',
  testType: 'COHORT_TEST',
  status: 'UPCOMING',
  date: '2026-09-25',
  startTime: '19:30',
  durationMinutes: 60,
  timezone: 'Asia/Kolkata',
  cohort: 'Residency Batch 2026'
}, facultySiddharth);

assert(scheduledTest.scheduling.date === '2026-09-25', `Stored scheduled date: ${scheduledTest.scheduling.date}`);
assert(scheduledTest.scheduling.startTime === '19:30', `Stored start time: ${scheduledTest.scheduling.startTime}`);
assert(scheduledTest.durationMinutes === 60, `Stored duration: ${scheduledTest.durationMinutes} mins`);
assert(scheduledTest.scheduling.timezone === 'Asia/Kolkata', `Stored timezone: ${scheduledTest.scheduling.timezone}`);
assert(scheduledTest.status === FACULTY_TEST_STATUS.UPCOMING, `Status is UPCOMING: ${scheduledTest.status}`);

// 8. Draft Creation without full schedule
console.log('\n--- 8. Draft Creation without Scheduling ---');
const draftTest = cbtTestService.createFacultyTest({
  examId: 'usmle',
  name: 'USMLE Pathology Revision Draft',
  testType: 'CHAPTER_TEST',
  status: 'DRAFT'
}, facultySiddharth);

assert(draftTest.status === FACULTY_TEST_STATUS.DRAFT, `Draft created successfully with status DRAFT`);

// 9. Schedule Test requires scheduling info
console.log('\n--- 9. Schedule Test Validation ---');
let scheduleWithoutDateRejected = false;
try {
  cbtTestService.createFacultyTest({
    examId: 'usmle',
    name: 'Incomplete Upcoming Test',
    testType: 'CHAPTER_TEST',
    status: 'UPCOMING'
    // missing date & startTime
  }, facultySiddharth);
} catch (e) {
  scheduleWithoutDateRejected = true;
}
assert(scheduleWithoutDateRejected, `Scheduling as UPCOMING without date/time was rejected`);

// 10. Edit Permissions for DRAFT and UPCOMING
console.log('\n--- 10. Edit Permissions ---');
const updatedDraft = cbtTestService.updateFacultyTest(draftTest.id, {
  name: 'USMLE Pathology Comprehensive Drill (Updated)',
  description: 'Updated clinical description for pathology block.'
}, facultySiddharth);

assert(updatedDraft.name === 'USMLE Pathology Comprehensive Drill (Updated)', `Draft test updated successfully`);
assert(updatedDraft.description === 'Updated clinical description for pathology block.', `Description updated`);

// 11. Lifecycle Protection (LIVE & COMPLETED cannot be edited)
console.log('\n--- 11. Lifecycle Protection (LIVE & COMPLETED) ---');
// Create dummy live & completed tests
const liveTest = cbtTestService.createFacultyTest({
  examId: 'neet-pg',
  name: 'Live Examination Demo',
  testType: 'SUBJECT_TEST',
  status: 'DRAFT'
}, facultySiddharth);
// Force status to LIVE
liveTest.status = FACULTY_TEST_STATUS.LIVE;

let liveEditRejected = false;
try {
  cbtTestService.updateFacultyTest(liveTest.id, {
    name: 'Tampered Live Test'
  }, facultySiddharth);
} catch (e) {
  liveEditRejected = true;
}
assert(liveEditRejected, `Editing LIVE assessment rejected by lifecycle guard`);

// 12. Code Immutability
console.log('\n--- 12. Code Immutability ---');
const originalCode = updatedDraft.code;
const updateAttemptWithCode = cbtTestService.updateFacultyTest(draftTest.id, {
  code: 'ATTEMPTED_TAMPERED_CODE'
}, facultySiddharth);

assert(updateAttemptWithCode.code === originalCode, `Test code remained immutable: ${updateAttemptWithCode.code}`);

// 13. Owner Immutability
console.log('\n--- 13. Owner Immutability ---');
const updateAttemptWithOwner = cbtTestService.updateFacultyTest(draftTest.id, {
  facultyId: 'fac-999',
  facultyName: 'Hacker Faculty'
}, facultySiddharth);

assert(updateAttemptWithOwner.facultyId === 'fac-1', `facultyId remained immutable: ${updateAttemptWithOwner.facultyId}`);
assert(updateAttemptWithOwner.facultyName === 'Dr. Siddharth V.', `facultyName remained immutable`);

// 14. Duplicate Test
console.log('\n--- 14. Duplicate Test ---');
const duplicated = cbtTestService.duplicateFacultyTest(scheduledTest.id, facultySiddharth);
assert(duplicated.id !== scheduledTest.id, `Duplicate has new unique ID: ${duplicated.id}`);
assert(duplicated.code !== scheduledTest.code, `Duplicate has new unique code: ${duplicated.code}`);
assert(duplicated.status === FACULTY_TEST_STATUS.DRAFT, `Duplicate status is reset to DRAFT: ${duplicated.status}`);
assert(duplicated.name.includes('(Copy)'), `Duplicate name has (Copy) suffix: ${duplicated.name}`);
assert(duplicated.facultyId === facultySiddharth.id, `Duplicate preserves faculty owner: ${duplicated.facultyId}`);
assert(duplicated.examId === scheduledTest.examId, `Duplicate preserves examId: ${duplicated.examId}`);

// 15. Duplicate Isolation (No attempts/results copied)
console.log('\n--- 15. Duplicate Isolation ---');
assert(!duplicated.attempts || Object.keys(duplicated.attempts).length === 0, `Duplicate has no copied student attempts`);
assert(!duplicated.results, `Duplicate has no copied execution results`);

// 16. Cancel Test
console.log('\n--- 16. Cancel Test ---');
const cancelled = cbtTestService.cancelFacultyTest(scheduledTest.id, facultySiddharth);
assert(cancelled.status === FACULTY_TEST_STATUS.CANCELLED, `Upcoming test cancelled to status CANCELLED`);

const testStillExists = cbtTestService.getTestById(scheduledTest.id);
assert(Boolean(testStillExists), `Cancelled test remains in storage (not hard-deleted)`);

const cancelledDraft = cbtTestService.cancelFacultyTest(draftTest.id, facultySiddharth);
assert(cancelledDraft.status === FACULTY_TEST_STATUS.CANCELLED, `Draft test cancelled to status CANCELLED`);

// 17. Invalid Status Transitions
console.log('\n--- 17. Invalid Lifecycle Transitions ---');
let cannotEditCancelled = false;
try {
  cbtTestService.updateFacultyTest(cancelled.id, {
    name: 'Revived Cancelled Test'
  }, facultySiddharth);
} catch (e) {
  cannotEditCancelled = true;
}
assert(cannotEditCancelled, `Editing a CANCELLED test rejected`);

// 18. Faculty Isolation (Cannot edit another faculty's test)
console.log('\n--- 18. Faculty Isolation ---');
let otherFacultyEditRejected = false;
try {
  cbtTestService.updateFacultyTest(createdTest.id, {
    name: 'Tampered by Marcus'
  }, facultyMarcus);
} catch (e) {
  otherFacultyEditRejected = true;
}
assert(otherFacultyEditRejected, `Faculty Marcus cannot edit Faculty Siddharth's test`);

// 19. Admin Test System Isolation
console.log('\n--- 19. Admin Test Isolation ---');
const adminTestsBefore = adminTestService.getTests();
assert(adminTestsBefore.length >= 8, `Admin tests intact (${adminTestsBefore.length} admin tests)`);
assert(!adminTestsBefore.some(t => t.id === createdTest.id), `Faculty test not leaked into adminTestService`);

// 20. Exam Catalog Isolation
console.log('\n--- 20. Exam Catalog Isolation ---');
const catalogExams = catalogService.getExams();
assert(catalogExams.length >= 4, `Catalog exams unchanged (${catalogExams.length} exams)`);
assert(catalogExams.some(e => e.id === 'neet-pg'), `NEET-PG catalog exam intact`);

// 21. Storage Isolation
console.log('\n--- 21. Storage Isolation ---');
// Verify cbtTestService manages its own tests array
const allCbtTests = cbtTestService.tests;
assert(allCbtTests.some(t => t.id === createdTest.id), `Faculty test exists in cbtTestService`);

// 22. Summary Statistics
console.log('\n--- 22. Summary Statistics ---');
const stats = cbtTestService.getFacultySummaryStats(facultySiddharth);
assert(typeof stats.total === 'number' && stats.total >= 1, `Total stats count: ${stats.total}`);
assert(typeof stats.draft === 'number', `Draft count calculated: ${stats.draft}`);
assert(typeof stats.upcoming === 'number', `Upcoming count calculated: ${stats.upcoming}`);
assert(typeof stats.live === 'number', `Live count calculated: ${stats.live}`);
assert(typeof stats.completed === 'number', `Completed count calculated: ${stats.completed}`);
assert(typeof stats.cancelled === 'number' && stats.cancelled >= 1, `Cancelled count calculated: ${stats.cancelled}`);

// 23. Scoped Listing
console.log('\n--- 23. Scoped Listing ---');
const marcusTests = cbtTestService.getFacultyScopedTests({}, facultyMarcus);
let marcusOnlyPlab = marcusTests.every(t => (t.examId || t.examTrack) === 'plab' || (t.examId || t.examTrack) === 'all');
assert(marcusOnlyPlab, `Faculty Marcus (PLAB only) only sees PLAB assessments in scoped tests`);

// 24. Filter Behavior
console.log('\n--- 24. Filter Behavior ---');
const filteredByStatus = cbtTestService.getFacultyScopedTests({ status: 'DRAFT' }, facultySiddharth);
assert(filteredByStatus.every(t => getNormalizedFacultyStatus(t) === FACULTY_TEST_STATUS.DRAFT), `Status filter strictly returns DRAFT tests`);

const filteredBySearch = cbtTestService.getFacultyScopedTests({ search: 'Emergency Cardiology' }, facultySiddharth);
assert(filteredBySearch.length >= 1 && filteredBySearch[0].id === createdTest.id, `Search by title returns matching test`);

// Cleanup created test objects from CBT test service
cbtTestService.deleteTest(createdTest.id);
cbtTestService.deleteTest(scheduledTest.id);
cbtTestService.deleteTest(draftTest.id);
cbtTestService.deleteTest(liveTest.id);
cbtTestService.deleteTest(duplicated.id);

console.log('\n======================================================');
console.log(`🏁 FACULTY TEST VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

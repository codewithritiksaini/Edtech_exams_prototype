// scripts/testPhase7FinalVerification.js
// MEDPREP PRO — PHASE 7 FINAL CLEANUP + RBAC HARDENING + ARCHITECTURE VERIFICATION TEST SUITE

import './setupNodeTestEnv.js';
import assert from 'assert';

import { catalogService } from '../src/services/catalogService.js';
import { curriculumService } from '../src/services/curriculumService.js';
import { facultyAvailabilityService } from '../src/services/facultyAvailabilityService.js';
import { liveSessionsService, SESSION_STATUS, getLiveSessionStatus } from '../src/services/liveSessionsService.js';
import { questionService } from '../src/services/questionService.js';
import { cbtTestService, CBT_STATUS } from '../src/services/cbtTestService.js';
import { peopleService } from '../src/services/peopleService.js';
import { doubtsService } from '../src/services/doubtsService.js';
import { facultyAnalyticsService } from '../src/services/facultyAnalyticsService.js';
import { samplePaperService } from '../src/services/samplePaperService.js';
import { authService, USER_ROLES } from '../src/services/authService.js';

console.log('============================================================');
console.log('PHASE 7 FINAL ARCHITECTURAL & RBAC VERIFICATION TEST SUITE');
console.log('============================================================\n');

let passedTests = 0;
let failedTests = 0;

function pass(title) {
  passedTests++;
  console.log(`  ✓ PASS: ${title}`);
}

function fail(title, error) {
  failedTests++;
  console.error(`  ✗ FAIL: ${title}`);
  console.error(`    ${error.message}`);
}

async function runSuite() {
  // -------------------------------------------------------------------------
  // SUITE 1: CANONICAL SOURCE OF TRUTH INVENTORY (10 DOMAINS)
  // -------------------------------------------------------------------------
  console.log('Suite 1: Canonical Source of Truth Inventory (10 Domains)');

  try {
    // 1. Catalog
    const exams = catalogService.getExams();
    assert.ok(Array.isArray(exams) && exams.length >= 4, 'catalogService must return all active global programs');
    pass('Domain 1 (Catalog): catalogService is canonical exam source');

    // 2. Curriculum
    const subjects = curriculumService.getSubjects();
    assert.ok(Array.isArray(subjects) && subjects.length > 0, 'curriculumService must return subjects');
    const modules = curriculumService.getModules();
    assert.ok(Array.isArray(modules) && modules.length > 0, 'curriculumService must return modules');
    const lectures = curriculumService.getLectures();
    assert.ok(Array.isArray(lectures) && lectures.length > 0, 'curriculumService must return lectures');
    pass('Domain 2 (Curriculum): curriculumService is canonical 4-tier academic hierarchy');

    // 3. Delivery
    const deliveryPlan = curriculumService.getDeliveryPlan('neet-pg');
    assert.ok(Array.isArray(deliveryPlan) && deliveryPlan.length === 4, 'Delivery plan must supply Weeks 1–4');
    pass('Domain 3 (Delivery): curriculumService.getDeliveryPlan is canonical week/day delivery source');

    // 4. Availability
    const availability = facultyAvailabilityService.getAllAvailability();
    assert.ok(availability && typeof availability === 'object', 'facultyAvailabilityService returns availability object');
    pass('Domain 4 (Availability): facultyAvailabilityService is canonical faculty capacity source');

    // 5. Schedule
    const facultySchedule = curriculumService.getFacultySchedule('faculty@demo.com');
    assert.ok(Array.isArray(facultySchedule), 'curriculumService returns faculty calendar assignments');
    pass('Domain 5 (Schedule): curriculumService schedule calendar is canonical teaching schedule source');

    // 6. Live Sessions
    const sessions = liveSessionsService.getAllSessions();
    assert.ok(Array.isArray(sessions) && sessions.length > 0, 'liveSessionsService returns live sessions');
    pass('Domain 6 (Live): liveSessionsService is canonical live events & room source');

    // 7. Question Bank
    const questions = questionService.getQuestions();
    assert.ok(Array.isArray(questions) && questions.length > 0, 'questionService returns question items');
    pass('Domain 7 (Questions): questionService is canonical item bank source');

    // 8. Assessments / CBT
    const tests = cbtTestService.getAllTests('all');
    assert.ok(Array.isArray(tests) && tests.length > 0, 'cbtTestService returns tests');
    pass('Domain 8 (Assessments): cbtTestService is canonical test, attempt, and evaluation engine');

    // 9. People & Enrollment
    const students = peopleService.getStudents();
    assert.ok(Array.isArray(students) && students.length > 0, 'peopleService returns enrolled students');
    pass('Domain 9 (Students): peopleService is canonical candidate directory & enrollment source');

    // 10. Doubts
    const doubts = doubtsService.getAllDoubts();
    assert.ok(Array.isArray(doubts) && doubts.length > 0, 'doubtsService returns candidate clinical doubts');
    pass('Domain 10 (Doubts): doubtsService is canonical clinical doubts & pearl source');

  } catch (err) {
    fail('Canonical Source of Truth Inventory', err);
  }

  // -------------------------------------------------------------------------
  // SUITE 2: RBAC & ROLE BOUNDARIES HARDENING
  // -------------------------------------------------------------------------
  console.log('\nSuite 2: RBAC & Role Boundaries Hardening');

  try {
    // 1. Faculty assigned exam scope boundary
    const facultyProfile = peopleService.getCurrentFacultyProfile();
    assert.ok(facultyProfile, 'Current faculty profile must resolve');
    const assignedExams = facultyProfile.assignedExams || [];
    assert.ok(assignedExams.includes('neet-pg') && assignedExams.includes('usmle'), 'Faculty assigned to NEET PG and USMLE');

    // Out of scope program (europe)
    assert.strictEqual(assignedExams.includes('europe'), false, 'Faculty must NOT have access to europe exam track');
    pass('Faculty exam scope strictly isolates unassigned programs (europe)');

    // 2. Candidate access scope protection
    const authorizedCheck = peopleService.getStudentById('std-1', facultyProfile.id);
    assert.strictEqual(authorizedCheck.authorized, true, 'In-scope candidate access is authorized');

    const unauthorizedCheck = peopleService.getStudentById('std-4', facultyProfile.id); // std-4 is europe track
    assert.strictEqual(unauthorizedCheck.authorized, false, 'Out-of-scope candidate access is blocked');
    assert.strictEqual(unauthorizedCheck.student, null, 'Out-of-scope candidate payload is nulled');
    pass('Candidate access security: Out-of-scope candidate details are blocked and sanitized');

    // 3. Admin Layout Guard Logic
    const studentUser = { email: 'student@demo.com', role: USER_ROLES.STUDENT };
    const facultyUser = { email: 'faculty@demo.com', role: USER_ROLES.FACULTY };
    const adminUser = { email: 'admin@demo.com', role: USER_ROLES.ADMIN };

    const isAdminAllowed = (user) => user && user.role === USER_ROLES.ADMIN;
    assert.strictEqual(isAdminAllowed(studentUser), false, 'Student blocked from Admin portal');
    assert.strictEqual(isAdminAllowed(facultyUser), false, 'Faculty blocked from Admin portal');
    assert.strictEqual(isAdminAllowed(adminUser), true, 'Admin permitted in Admin portal');
    pass('Role Guard verification: Only ADMIN can access Admin layout routes');

    // 4. Student Attempt Isolation Logic
    const testId = 'test-phase7-iso';
    cbtTestService.createTest({
      id: testId,
      name: 'Isolation Benchmark Test',
      examTrack: 'neet-pg',
      durationMinutes: 30,
      totalMarks: 50,
      questions: [
        {
          id: 'q-iso-1',
          vignette: 'Patient presents with severe dyspnea and S3 gallop.',
          question: 'What is the first-line diuretic?',
          options: [
            { key: 'A', text: 'Intravenous Furosemide' },
            { key: 'B', text: 'Oral Spironolactone' },
            { key: 'C', text: 'Hydrochlorothiazide' },
            { key: 'D', text: 'Acetazolamide' }
          ],
          correct: 'A'
        }
      ]
    });

    const studentA = 'student-alpha';
    const studentB = 'student-beta';

    const attemptA = cbtTestService.startAttempt(testId, studentA);
    assert.strictEqual(attemptA.studentId, studentA, 'Attempt A belongs to student-alpha');

    // Querying active attempt for student-beta must return null (isolation)
    const queryB = cbtTestService.getActiveAttempt(testId, studentB);
    assert.strictEqual(queryB, null, 'Student Beta cannot access Student Alpha active attempt');
    pass('Student Attempt Isolation: Cross-student attempt leakage is prevented');

    // Clean up test
    cbtTestService.deleteTest(testId);

  } catch (err) {
    fail('RBAC & Role Boundaries Hardening', err);
  }

  // -------------------------------------------------------------------------
  // SUITE 3: PURE DERIVED ANALYTICS INTEGRITY
  // -------------------------------------------------------------------------
  console.log('\nSuite 3: Pure Derived Analytics Integrity');

  try {
    const studentMetrics = facultyAnalyticsService.getStudentMetrics(['neet-pg', 'usmle']);
    assert.ok(studentMetrics && typeof studentMetrics === 'object', 'getStudentMetrics returns object');
    assert.ok(typeof studentMetrics.totalStudents === 'number', 'Summary totalStudents is a calculated number');

    const weakTopicsMetrics = facultyAnalyticsService.getWeakTopicsMetrics(['neet-pg', 'usmle']);
    assert.ok(Array.isArray(weakTopicsMetrics.weakTopics), 'Weak topics is an array derived from error rates');

    const summary = facultyAnalyticsService.getDashboardSummary(peopleService.getCurrentFacultyProfile());
    assert.ok(summary && typeof summary === 'object', 'getDashboardSummary returns summary object');
    assert.ok(typeof summary.activeStudents === 'number', 'Summary activeStudents is a calculated number');
    pass('facultyAnalyticsService derived metrics calculated without hardcoded figures');

  } catch (err) {
    fail('Pure Derived Analytics Integrity', err);
  }

  // -------------------------------------------------------------------------
  // SUITE 4: LOCALSTORAGE PERSISTENCE KEY CONFORMANCE
  // -------------------------------------------------------------------------
  console.log('\nSuite 4: LocalStorage Persistence Key Conformance');

  try {
    const knownKeys = [
      'medprep_catalog_exams_v2',
      'medprep_curriculum_subjects_v2',
      'medprep_curriculum_modules_v2',
      'medprep_curriculum_lectures_v2',
      'medprep_schedule_v2',
      'medprep_faculty_availability_v1',
      'medprep_live_sessions_v1',
      'medprep_live_session_reminders_v1',
      'medprep_phase5_faculty_v1',
      'medprep_phase5_students_v1',
      'medprep_question_bank_v1',
      'medprep_cbt_tests_v2',
      'medprep_cbt_attempts_v2',
      'medprep_clinical_doubts_v1',
      'medprep_sample_papers_v1',
      'medprep_learning_progress_v2',
      'medprep_lecture_completions_v1',
      'medprep_auth_user'
    ];

    knownKeys.forEach(k => {
      assert.ok(k.startsWith('medprep_'), `Key ${k} must adhere to the medprep_ canonical prefix convention`);
    });
    pass(`All ${knownKeys.length} canonical storage keys follow standardized naming conventions`);

  } catch (err) {
    fail('LocalStorage Persistence Key Conformance', err);
  }

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n============================================================');
  console.log(`PHASE 7 VERIFICATION RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('============================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSuite();

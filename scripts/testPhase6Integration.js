// =============================================================================
// PHASE 6 INTEGRATION TEST SUITE
// Tests Student Management, Faculty Scope Authorization, Doubts/Q&A, and
// Derived Faculty Analytics
// =============================================================================

import './setupNodeTestEnv.js';
import assert from 'assert';
import { peopleService, INITIAL_STUDENTS } from '../src/services/peopleService.js';
import { doubtsService } from '../src/services/doubtsService.js';
import { facultyAnalyticsService } from '../src/services/facultyAnalyticsService.js';
import { cbtTestService, CBT_STATUS } from '../src/services/cbtTestService.js';
import { learningProgressService } from '../src/services/learningProgressService.js';
import { liveSessionsService } from '../src/services/liveSessionsService.js';

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failedTests++;
  }
}

console.log('\n============================================================');
console.log('PHASE 6 INTEGRATION & ARCHITECTURE VERIFICATION');
console.log('============================================================\n');

// -----------------------------------------------------------------------------
// SUITE 1: CANONICAL STUDENT MANAGEMENT & FACULTY SCOPE
// -----------------------------------------------------------------------------
console.log('Suite 1: Canonical Student Management & Faculty Scope Enforcement');

test('peopleService is the canonical source of truth for students', () => {
  const students = peopleService.getStudents();
  assert(Array.isArray(students), 'Students must be an array');
  assert(students.length >= 7, 'Must have initial students seeded');
  const ritik = students.find(s => s.id === 'std-1');
  assert(ritik, 'Dr. Ritik Saini (std-1) must exist');
  assert.strictEqual(ritik.examId, 'neet-pg', 'Ritik must be enrolled in neet-pg');
});

test('Faculty scope filters students strictly by assigned exams', () => {
  // Dr. Priya Sharma (fac-5): assignedExams = ['neet-pg']
  const neetStudents = peopleService.getStudentsForScope(['neet-pg']);
  assert(neetStudents.length > 0, 'Must find NEET PG candidates');
  neetStudents.forEach(s => {
    assert.strictEqual(s.examId, 'neet-pg', `Student ${s.name} must belong to neet-pg`);
  });

  // Multi-exam faculty: Dr. Siddharth V. ['neet-pg', 'usmle']
  const multiStudents = peopleService.getStudentsForScope(['neet-pg', 'usmle']);
  const examSet = new Set(multiStudents.map(s => s.examId));
  assert(examSet.has('neet-pg'), 'Must include neet-pg');
  assert(examSet.has('usmle'), 'Must include usmle');
  assert(!examSet.has('plab'), 'Must NOT include plab');
  assert(!examSet.has('europe'), 'Must NOT include europe');
});

test('getStudentById rejects out-of-scope candidate access for faculty', () => {
  // fac-5 (Dr. Priya Sharma, assigned NEET PG only) tries to access std-4 (Lukas Weber, Europe track)
  const authCheck = peopleService.getStudentById('std-4', 'fac-5');
  assert.strictEqual(authCheck.authorized, false, 'Access must be rejected for out-of-scope student');
  assert.strictEqual(authCheck.student, null, 'Authorized student payload must be null');
  assert(authCheck.reason.includes('Access Denied'), 'Reason must explain scope restriction');
});

test('getStudentById allows in-scope candidate access for faculty', () => {
  // fac-5 (Dr. Priya Sharma, assigned NEET PG) accesses std-1 (Dr. Ritik Saini, NEET PG)
  const authCheck = peopleService.getStudentById('std-1', 'fac-5');
  assert.strictEqual(authCheck.authorized, true, 'Access must be authorized for in-scope student');
  assert(authCheck.student, 'Student payload must be present');
  assert.strictEqual(authCheck.student.id, 'std-1', 'Must return requested student');
});

// -----------------------------------------------------------------------------
// SUITE 2: DOUBTS & Q&A ARCHITECTURE
// -----------------------------------------------------------------------------
console.log('\nSuite 2: Doubts / Q&A Architecture & Scoping');

test('Student can submit doubt with full academic context', () => {
  const newDoubt = doubtsService.submitDoubt({
    studentId: 'std-1',
    studentName: 'Dr. Ritik Saini',
    studentAvatar: 'https://demo.url/avatar.jpg',
    course: 'NEET PG & NExT 2026',
    examId: 'neet-pg',
    subjectId: 'sub-neet-cardio',
    subjectName: 'Cardiology & Hemodynamics',
    moduleId: 'mod-cardio-ecg',
    lectureId: 'lec-ecg-basics',
    topic: 'ECG Basics & Lead Placement',
    dayNumber: 3,
    title: 'P-wave morphology in Dextrocardia',
    question: 'How does lead I inversion correlate with limb lead reversal in suspected Dextrocardia?',
    urgency: 'high'
  });

  assert(newDoubt.id, 'Doubt must have generated id');
  assert.strictEqual(newDoubt.studentId, 'std-1');
  assert.strictEqual(newDoubt.examId, 'neet-pg');
  assert.strictEqual(newDoubt.lectureId, 'lec-ecg-basics');
  assert.strictEqual(newDoubt.status, 'unresolved');
});

test('Faculty doubts queue scopes queries by assigned exams', () => {
  // Scoped to NEET PG
  const neetDoubts = doubtsService.getDoubtsForFacultyScope(['neet-pg']);
  assert(neetDoubts.length > 0, 'Must have NEET PG doubts');
  neetDoubts.forEach(d => {
    assert.strictEqual(d.examId, 'neet-pg', `Doubt must belong to neet-pg`);
  });

  // Out-of-scope track (PLAB) must not contain NEET PG doubt
  const plabDoubts = doubtsService.getDoubtsForFacultyScope(['plab']);
  const containsNeetDoubt = plabDoubts.some(d => d.title === 'P-wave morphology in Dextrocardia');
  assert(!containsNeetDoubt, 'PLAB queue must NOT contain NEET PG doubts');
});

test('Faculty can answer doubt and mark resolved with Clinical Pearl', () => {
  const doubts = doubtsService.getDoubtsForFacultyScope(['neet-pg']);
  const targetDoubt = doubts.find(d => d.title === 'P-wave morphology in Dextrocardia');
  assert(targetDoubt, 'Target doubt must exist in queue');

  const answered = doubtsService.replyToDoubt(
    targetDoubt.id,
    'Clinical Pearl: True dextrocardia exhibits inverted P waves in Lead I with upright aVR, while limb lead reversal leaves chest lead V1-V6 progression normal.',
    'Dr. Siddharth V. (Cardiology Lead)',
    'fac-1'
  );

  assert.strictEqual(answered.status, 'resolved', 'Doubt status must transition to resolved');
  assert(answered.facultyReply.includes('True dextrocardia'), 'Faculty reply must be stored');
  assert(answered.repliedAt, 'RepliedAt timestamp must be recorded');
  assert.strictEqual(answered.repliedBy, 'Dr. Siddharth V. (Cardiology Lead)');

  // Verify persistence in getDoubtById
  const refreshed = doubtsService.getDoubtById(targetDoubt.id);
  assert.strictEqual(refreshed.status, 'resolved');
});

test('getDoubtsByStudent retrieves candidate-specific history for student profile', () => {
  const ritikDoubts = doubtsService.getDoubtsByStudent('std-1');
  assert(Array.isArray(ritikDoubts), 'Must return array of doubts');
  assert(ritikDoubts.length >= 1, 'Must contain at least 1 doubt from std-1');
  assert(ritikDoubts.every(d => d.studentId === 'std-1'), 'All returned doubts must belong to std-1');
});

// -----------------------------------------------------------------------------
// SUITE 3: PURE DERIVED FACULTY ANALYTICS
// -----------------------------------------------------------------------------
console.log('\nSuite 3: Pure Derived Faculty Analytics Engine');

test('facultyAnalyticsService derives student metrics from peopleService', () => {
  const metrics = facultyAnalyticsService.getStudentMetrics(['neet-pg']);
  assert.strictEqual(typeof metrics.totalStudents, 'number', 'totalStudents must be number');
  assert.strictEqual(typeof metrics.activeStudents, 'number', 'activeStudents must be number');
  assert.strictEqual(metrics.totalStudents, peopleService.getStudentsForScope(['neet-pg']).length, 'Must match peopleService count');
});

test('facultyAnalyticsService derives syllabus progress from learningProgressService', () => {
  const progressMetrics = facultyAnalyticsService.getLearningProgressMetrics(['neet-pg'], ['sub-neet-cardio']);
  assert(progressMetrics.hasCurriculum, 'Curriculum must be present');
  assert.strictEqual(typeof progressMetrics.overallSyllabusPercentage, 'number');
  assert(progressMetrics.overallSyllabusPercentage >= 0 && progressMetrics.overallSyllabusPercentage <= 100);
});

test('facultyAnalyticsService derives CBT assessment scores from canonical attempts', () => {
  const assessmentMetrics = facultyAnalyticsService.getAssessmentMetrics(['neet-pg']);
  assert.strictEqual(typeof assessmentMetrics.hasAttempts, 'boolean');
  assert.strictEqual(typeof assessmentMetrics.totalTestsScoped, 'number');

  if (assessmentMetrics.hasAttempts) {
    assert.strictEqual(typeof assessmentMetrics.averageScorePercentage, 'number');
    assert(assessmentMetrics.averageScorePercentage > 0);
    assert(assessmentMetrics.passRateLabel.includes('% Pass'));
  } else {
    assert.strictEqual(assessmentMetrics.averageScorePercentage, null, 'Must be null if no attempts exist, never 0%');
    assert.strictEqual(assessmentMetrics.averageScoreLabel, 'No attempts yet');
  }
});

test('facultyAnalyticsService zero-attempts handling for non-existent scope', () => {
  // Non-existent scope
  const emptyScopeMetrics = facultyAnalyticsService.getAssessmentMetrics(['non-existent-exam-xyz']);
  assert.strictEqual(emptyScopeMetrics.hasAttempts, false, 'Must report hasAttempts: false');
  assert.strictEqual(emptyScopeMetrics.averageScorePercentage, null, 'Score must be null, not 0');
  assert.strictEqual(emptyScopeMetrics.averageScoreLabel, 'No attempts yet');
  assert.strictEqual(emptyScopeMetrics.passRateLabel, 'No attempts yet');
});

test('facultyAnalyticsService live sessions metrics reports attendance transparently', () => {
  const liveMetrics = facultyAnalyticsService.getLiveSessionMetrics(['neet-pg']);
  assert.strictEqual(typeof liveMetrics.totalScheduled, 'number');
  assert.strictEqual(liveMetrics.individualAttendanceTracking, 'UNAVAILABLE', 'Must disclose UNAVAILABLE per Step 12');
  assert(liveMetrics.individualAttendanceNote.includes('not logged'), 'Must explain gateway logging');
});

test('facultyAnalyticsService weak topics derived purely from question error rates', () => {
  const weakMetrics = facultyAnalyticsService.getWeakTopicsMetrics(['neet-pg']);
  assert.strictEqual(typeof weakMetrics.hasData, 'boolean');
  assert(Array.isArray(weakMetrics.weakTopics), 'weakTopics must be an array');
});

test('facultyAnalyticsService dashboard summary rollups match underlying services', () => {
  const faculty = peopleService.getCurrentFacultyProfile();
  const summary = facultyAnalyticsService.getDashboardSummary(faculty);
  assert.strictEqual(typeof summary.activeStudents, 'number');
  assert.strictEqual(typeof summary.unresolvedDoubts, 'number');
  assert.strictEqual(summary.activeStudents, peopleService.getStudentsForScope(faculty.assignedExams).filter(s => s.status === 'Active').length);
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n============================================================');
console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('============================================================\n');

if (failedTests > 0) {
  process.exit(1);
}

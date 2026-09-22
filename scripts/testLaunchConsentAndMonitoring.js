// =============================================================================
// Automated Test Suite: Student Test Launch Gateway, Consent,
// Anti-Tab Violation Immediate Auto-Submission, and Pause/Resume Lifecycle
// =============================================================================

import assert from 'node:assert';
import { testAttemptService } from '../src/services/testAttemptService.js';
import { testPresentationService } from '../src/services/testPresentationService.js';

console.log('--- Starting Student Test Launch & Monitoring Test Suite ---');

const studentId = 'test-candidate-99';
const mockTest = {
  id: 'test-auto-sub-001',
  title: 'NEET PG Security & Consent Validation Exam',
  rules: {
    timing: {
      totalDurationMinutes: 45,
      allowPause: true,
      autoSubmit: true
    },
    scoring: {
      marksPerQuestion: 4,
      penaltyPerWrong: 1,
      unansweredMarks: 0
    },
    navigation: {
      mode: 'FREE',
      allowBackNavigation: true
    },
    security: {
      tabSwitchPolicy: 'AUTO_SUBMIT',
      allowPause: true
    }
  },
  content: {
    questionIds: ['q1', 'q2']
  }
};

// 1. Verify Security Model Generation
console.log('1. Testing getTestSecurityModel...');
const secModel = testPresentationService.getTestSecurityModel(mockTest);
assert.strictEqual(secModel.tabSwitchPolicy, 'AUTO_SUBMIT');
assert.strictEqual(secModel.allowPause, true);
console.log('✓ Security model properly reflects canonical rules.');

// 2. Testing startAttempt with Consent
console.log('2. Testing startAttempt with Explicit Candidate Consent...');
const consentRecord = {
  instructionsAccepted: true,
  monitoringAccepted: true,
  autoSubmitAccepted: true,
  candidateAgreement: true,
  acceptedAt: new Date().toISOString(),
  studentId,
  studentName: 'Dr. Test Candidate'
};

const attempt = testAttemptService.startAttempt(mockTest, studentId, consentRecord);
assert.ok(attempt, 'Attempt should be created');
assert.strictEqual(attempt.status, 'IN_PROGRESS');
assert.ok(attempt.consent, 'Consent object must be stored on attempt');
assert.strictEqual(attempt.consent.instructionsAccepted, true);
assert.strictEqual(attempt.consent.autoSubmitAccepted, true);

// Verify canonical test object was NOT polluted with attempt or consent data
assert.strictEqual(mockTest.consent, undefined, 'Canonical test must not store candidate consent');
assert.strictEqual(mockTest.monitoring, undefined, 'Canonical test must not store candidate monitoring state');

// Verify monitoring state initialization
assert.ok(attempt.monitoring, 'Monitoring state must be initialized on attempt');
assert.strictEqual(attempt.monitoring.status, 'ACTIVE');
assert.strictEqual(attempt.monitoring.violationCount, 0);
assert.strictEqual(Array.isArray(attempt.monitoring.events), true);
console.log('✓ Attempt initialized with consent and active monitoring state.');

// 3. Testing Pause Attempt (Timer Freeze + Monitoring Suspension)
console.log('3. Testing pauseAttempt...');
const paused = testAttemptService.pauseAttempt(mockTest.id, studentId);
assert.strictEqual(paused.status, 'PAUSED', 'Status should transition to PAUSED');
assert.strictEqual(paused.monitoring.status, 'SUSPENDED_PAUSED', 'Monitoring must be suspended during legitimate pause');
assert.ok(paused.remainingSeconds > 0, 'Remaining time should be preserved');
console.log('✓ pauseAttempt cleanly freezes session and suspends monitoring.');

// 4. Testing Resume Attempt
console.log('4. Testing resumeAttempt...');
const resumed = testAttemptService.resumeAttempt(mockTest.id, studentId);
assert.strictEqual(resumed.status, 'IN_PROGRESS', 'Status should return to IN_PROGRESS');
assert.strictEqual(resumed.monitoring.status, 'ACTIVE', 'Monitoring should be re-activated');
// Consent must still be present and intact
assert.strictEqual(resumed.consent.instructionsAccepted, true, 'Consent must persist across resume');
console.log('✓ resumeAttempt restores testing session and reactivates monitoring.');

// 5. Testing Tab / Window Violation Logging & Immediate Auto-Submission
console.log('5. Testing Violation Recording & Immediate Auto-Submission...');
testAttemptService.recordViolation(mockTest.id, studentId, {
  type: 'VISIBILITY_HIDDEN',
  message: 'User switched browser tab or minimized window'
});

const withViolation = testAttemptService.getAttempt(mockTest.id, studentId);
assert.strictEqual(withViolation.monitoring.violationCount, 1);
assert.strictEqual(withViolation.monitoring.events.length, 1);
assert.strictEqual(withViolation.monitoring.events[0].type, 'VISIBILITY_HIDDEN');

// Trigger immediate auto-submission
const autoSubmitted = testAttemptService.submitAttempt(
  mockTest.id,
  'TAB_OR_WINDOW_VIOLATION',
  mockTest,
  studentId
);

assert.strictEqual(autoSubmitted.status, 'AUTO_SUBMITTED', 'Status must be AUTO_SUBMITTED');
assert.strictEqual(autoSubmitted.submissionReason, 'TAB_OR_WINDOW_VIOLATION');
assert.strictEqual(autoSubmitted.monitoring.status, 'AUTO_SUBMITTED');
assert.ok(autoSubmitted.submittedAt, 'Submitted timestamp must be recorded');
console.log('✓ Tab/window violation triggers immediate auto-submission with status AUTO_SUBMITTED.');

// 6. Testing Double-Submission Guard
console.log('6. Testing Double-Submission Guard...');
const duplicateSubmission = testAttemptService.submitAttempt(
  mockTest.id,
  'STUDENT_SUBMITTED',
  mockTest,
  studentId
);

assert.strictEqual(duplicateSubmission.status, 'AUTO_SUBMITTED', 'Must preserve original AUTO_SUBMITTED status');
assert.strictEqual(duplicateSubmission.submissionReason, 'TAB_OR_WINDOW_VIOLATION', 'Must retain initial violation reason');
assert.strictEqual(duplicateSubmission.submittedAt, autoSubmitted.submittedAt, 'Must not re-stamp submittedAt timestamp');
console.log('✓ Double-submission guard successfully prevented duplicate processing.');

console.log('--- All Student Test Launch & Monitoring Tests Passed Successfully! ---');

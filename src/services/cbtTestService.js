// =============================================================================
// CBT TEST SERVICE — LIFECYCLE, SCHEDULING, ATTEMPTS & PERSISTENCE
// Centralized state machine: UPCOMING -> AVAILABLE -> IN_PROGRESS -> SUBMITTED / EXPIRED
// =============================================================================

import { testService, sampleCbtQuestionBank } from '../data/mockData';

export const CBT_STATUS = {
  UPCOMING: 'upcoming',
  AVAILABLE: 'available',
  IN_PROGRESS: 'in-progress',
  PAUSED: 'paused',
  SUBMITTED: 'submitted',
  EXPIRED: 'expired'
};

const STORAGE_KEY_TESTS = 'medprep_cbt_tests_v2';
const STORAGE_KEY_ATTEMPTS = 'medprep_cbt_attempts_v2';

// Base timestamp reference for prototype reactivity
const PROTOTYPE_EPOCH = Date.now();

export const INITIAL_CBT_TESTS = [
  // 1. AVAILABLE NOW: Cardiology Grand Mock Test #01
  {
    id: 'test-cardio-01',
    name: 'Cardiology Grand Mock Test #01',
    title: 'Cardiology Grand Mock Test #01',
    examTrack: 'neet-pg',
    courseId: 'neet-pg',
    course: 'NEET PG & NExT 2026',
    batch: 'All Enrolled Candidates',
    durationMinutes: 45,
    durationSeconds: 2700,
    totalQuestions: 20,
    totalMarks: 100,
    passingScore: 50,
    negativeMarking: true,
    marksPerCorrect: 5,
    marksPerIncorrect: -1,
    marksUnanswered: 0,
    // Started 15 mins ago, window stays open for next 90 mins from epoch
    startOffsetMinutes: -15,
    endOffsetMinutes: 90,
    formattedWindow: 'Today • 6:00 PM – 7:45 PM IST',
    pattern: 'NExT Aligned Clinical Vignettes',
    instructions: [
      'This examination consists of 20 high-yield clinical vignette multiple choice questions.',
      'Total duration allowed is 45 minutes from the time you start your attempt.',
      'Marking Scheme: +5 marks for each correct answer; -1 mark negative marking for incorrect responses; 0 for unattempted.',
      'Timer starts immediately upon clicking "Start Examination". You may pause the examination at any time to freeze the timer.',
      'Answers are saved automatically in real time and persist across page refreshes.',
      'You can pause the test and resume later, or leave to submit your attempt.',
      'The test will automatically finalize and submit when your remaining time expires.'
    ],
    questions: sampleCbtQuestionBank
  },

  // 2. UPCOMING TONIGHT: Cardiac Arrhythmias & ECG Clinical CBT
  {
    id: 'test-arrhythmia-02',
    name: 'Cardiac Arrhythmias & Clinical ECG Mastery CBT',
    title: 'Cardiac Arrhythmias & Clinical ECG Mastery CBT',
    examTrack: 'neet-pg',
    courseId: 'neet-pg',
    course: 'NEET PG & NExT 2026',
    batch: 'All Enrolled Candidates',
    durationMinutes: 60,
    durationSeconds: 3600,
    totalQuestions: 25,
    totalMarks: 125,
    passingScore: 50,
    negativeMarking: true,
    marksPerCorrect: 5,
    marksPerIncorrect: -1,
    marksUnanswered: 0,
    // Starts in 2 hours 15 mins (135 mins), window open for 120 mins
    startOffsetMinutes: 135,
    endOffsetMinutes: 255,
    formattedWindow: 'Tonight • 10:00 PM – 12:00 AM IST',
    pattern: 'ECG Strips & Emergency Management',
    instructions: [
      'High-yield emergency arrhythmia recognition and pharmacotherapy vignettes.',
      'Duration: 60 minutes. 25 multiple-choice questions.',
      'Marking Scheme: +5 for correct, -1 for incorrect, 0 for unattempted.',
      'Strict scheduled examination window. The virtual exam room opens precisely at 10:00 PM IST.'
    ],
    questions: sampleCbtQuestionBank.slice(0, 20)
  },

  // 3. UPCOMING TOMORROW: National Grand Mock Test #08 (Full CBT)
  {
    id: 'test-full-08',
    name: 'National Grand Mock Test #08 (Full CBT)',
    title: 'National Grand Mock Test #08 (Full CBT)',
    examTrack: 'neet-pg',
    courseId: 'neet-pg',
    course: 'NEET PG & NExT 2026',
    batch: 'All Standard & Premium Students',
    durationMinutes: 180,
    durationSeconds: 10800,
    totalQuestions: 200,
    totalMarks: 800,
    passingScore: 50,
    negativeMarking: true,
    marksPerCorrect: 4,
    marksPerIncorrect: -1,
    marksUnanswered: 0,
    // Starts tomorrow at 10:00 AM (~24 hours from epoch)
    startOffsetMinutes: 1440,
    endOffsetMinutes: 1800,
    formattedWindow: 'Tomorrow • 10:00 AM – 4:00 PM IST',
    pattern: 'Full 19-Subject National Benchmark',
    instructions: [
      'Comprehensive 19-subject grand mock test with All India Rank (AIR) and percentile metrics.',
      'Total duration is 180 minutes with 200 clinical vignette questions.',
      'Marking: +4 for correct, -1 for incorrect, 0 for unattempted.',
      'Proctored examination window.'
    ],
    questions: sampleCbtQuestionBank
  },

  // 4. EXPIRED / CLOSED: Renal & Acid-Base Physiology Assessment
  {
    id: 'test-renal-03',
    name: 'Renal & Acid-Base Balance Diagnostic CBT',
    title: 'Renal & Acid-Base Balance Diagnostic CBT',
    examTrack: 'neet-pg',
    courseId: 'neet-pg',
    course: 'NEET PG & NExT 2026',
    batch: 'All Enrolled Candidates',
    durationMinutes: 45,
    durationSeconds: 2700,
    totalQuestions: 20,
    totalMarks: 100,
    passingScore: 50,
    negativeMarking: true,
    marksPerCorrect: 5,
    marksPerIncorrect: -1,
    marksUnanswered: 0,
    // Ended yesterday
    startOffsetMinutes: -2880,
    endOffsetMinutes: -2700,
    formattedWindow: 'Sep 12 • 2:00 PM – 5:00 PM IST',
    pattern: 'Acid-Base Nomograms & Electrolyte Drills',
    instructions: [
      'Diagnostic evaluation of ABG interpretation, Henderson-Hasselbalch equations, and acute kidney injury.'
    ],
    questions: sampleCbtQuestionBank
  },

  // 5. SUBMITTED / COMPLETED: National Grand Mock Test #07
  {
    id: 'test-full-07',
    name: 'National Grand Mock Test #07',
    title: 'National Grand Mock Test #07',
    examTrack: 'neet-pg',
    courseId: 'neet-pg',
    course: 'NEET PG & NExT 2026',
    batch: 'All Enrolled Candidates',
    durationMinutes: 180,
    durationSeconds: 10800,
    totalQuestions: 200,
    totalMarks: 800,
    passingScore: 50,
    negativeMarking: true,
    marksPerCorrect: 4,
    marksPerIncorrect: -1,
    marksUnanswered: 0,
    // Completed last week
    startOffsetMinutes: -10000,
    endOffsetMinutes: -9700,
    formattedWindow: 'Sep 02 • 10:00 AM – 1:30 PM IST',
    pattern: 'Full 19-Subject Clinical Simulation',
    instructions: [
      'Comprehensive 19-subject grand mock test.'
    ],
    questions: sampleCbtQuestionBank
  }
];

// Seed sample completed attempt for test-full-07
const SEED_COMPLETED_ATTEMPTS = {
  'test-full-07': {
    testId: 'test-full-07',
    attemptId: 'attempt-full-07-seed',
    status: CBT_STATUS.SUBMITTED,
    startedAt: PROTOTYPE_EPOCH - 10000 * 60000,
    endAt: PROTOTYPE_EPOCH - 9700 * 60000,
    submittedAt: 'Sep 02, 1:14 PM IST',
    score: 684,
    totalMarks: 800,
    percentage: 85,
    percentile: '99.2%ile',
    rank: 'AIR 84',
    correctCount: 176,
    incorrectCount: 20,
    unattemptedCount: 4,
    accuracy: 90,
    timeTakenFormatted: '162m 40s',
    answers: { 1: 'A', 2: 'A', 3: 'A', 4: 'A', 5: 'A', 6: 'A', 7: 'A' },
    markedForReview: {},
    submissionReason: 'normal'
  }
};

// =============================================================================
// TIME & STATUS HELPERS
// =============================================================================

export function getTestTimes(test) {
  if (!test) return { startTime: new Date(), endTime: new Date() };

  if (test.startIso && test.endIso) {
    return {
      startTime: new Date(test.startIso),
      endTime: new Date(test.endIso)
    };
  }

  if (typeof test.startOffsetMinutes === 'number' && typeof test.endOffsetMinutes === 'number') {
    return {
      startTime: new Date(PROTOTYPE_EPOCH + test.startOffsetMinutes * 60000),
      endTime: new Date(PROTOTYPE_EPOCH + test.endOffsetMinutes * 60000)
    };
  }

  const fallback = new Date();
  return { startTime: fallback, endTime: new Date(fallback.getTime() + 7200000) };
}

/**
 * Derives the effective test status:
 * 1. If submitted attempt exists -> 'submitted'
 * 2. If active attempt exists and now < endAt -> 'in-progress'
 * 3. If now < startTime -> 'upcoming'
 * 4. If startTime <= now < endTime -> 'available'
 * 5. If now >= endTime -> 'expired'
 */
export function getTestStatus(test, now = new Date()) {
  if (!test) return CBT_STATUS.EXPIRED;

  // 1. Check completed attempt
  const completed = cbtTestService.getCompletedAttempt(test.id);
  if (completed) {
    return CBT_STATUS.SUBMITTED;
  }

  // 2. Check active or paused attempt
  const active = cbtTestService.getActiveAttempt(test.id);
  if (active) {
    if (active.status === CBT_STATUS.PAUSED) {
      return CBT_STATUS.PAUSED;
    }
    const currentMs = (now instanceof Date ? now : new Date(now)).getTime();
    if (currentMs < active.endAt) {
      return CBT_STATUS.IN_PROGRESS;
    }
  }

  // 3. Derive from scheduled window
  const { startTime, endTime } = getTestTimes(test);
  const currentTime = (now instanceof Date ? now : new Date(now)).getTime();
  const start = startTime.getTime();
  const end = endTime.getTime();

  if (currentTime < start) {
    return CBT_STATUS.UPCOMING;
  }
  if (currentTime >= start && currentTime < end) {
    return CBT_STATUS.AVAILABLE;
  }
  return CBT_STATUS.EXPIRED;
}

export function canStartTest(test, now = new Date()) {
  if (!test) return false;
  const status = getTestStatus(test, now);
  return status === CBT_STATUS.AVAILABLE || status === CBT_STATUS.IN_PROGRESS || status === CBT_STATUS.PAUSED;
}

export function formatTestCountdown(test, now = new Date()) {
  if (!test) return '';
  const { startTime, endTime } = getTestTimes(test);
  const current = (now instanceof Date ? now : new Date(now)).getTime();
  const diffMs = startTime.getTime() - current;

  if (diffMs <= 0) {
    if (current < endTime.getTime()) {
      const remainingWindowMs = endTime.getTime() - current;
      const remHours = Math.floor(remainingWindowMs / 3600000);
      const remMins = Math.floor((remainingWindowMs % 3600000) / 60000);
      return remHours > 0 ? `Closes in ${remHours}h ${remMins}m` : `Closes in ${remMins}m`;
    }
    return 'Test Closed';
  }

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return `Starts in ${Math.max(1, diffMin)}m`;
  }
  if (diffHours < 24) {
    const remMins = diffMin % 60;
    return `Starts in ${diffHours}h ${remMins}m`;
  }
  if (diffDays === 1) {
    return `Starts Tomorrow • ${test.formattedWindow ? test.formattedWindow.split('•').pop().trim() : '10:00 AM IST'}`;
  }
  return `Starts in ${diffDays} days`;
}

// =============================================================================
// MAIN SERVICE CLASS
// =============================================================================

class CbtTestService {
  constructor() {
    this.tests = this.loadTests();
    this.attempts = this.loadAttempts();
  }

  loadTests() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TESTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('CBT tests read error:', e);
    }
    return [...INITIAL_CBT_TESTS];
  }

  saveTests() {
    try {
      localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(this.tests));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('medprep-cbt-tests-updated', { detail: this.tests }));
      }
    } catch (e) {
      console.warn('CBT tests save error:', e);
    }
  }

  loadAttempts() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('CBT attempts read error:', e);
    }
    return { ...SEED_COMPLETED_ATTEMPTS };
  }

  saveAttempts() {
    try {
      localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(this.attempts));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('medprep-cbt-attempts-updated', { detail: this.attempts }));
      }
    } catch (e) {
      console.warn('CBT attempts save error:', e);
    }
  }

  getAllTests(trackFilter = 'neet-pg') {
    return this.tests.filter(t => trackFilter === 'all' || !t.examTrack || t.examTrack === trackFilter);
  }

  getTestById(id) {
    return this.tests.find(t => t.id === id) || null;
  }

  // Retrieve active (in-progress or paused) attempt for a test
  getActiveAttempt(testId) {
    const attempt = this.attempts[testId];
    if (!attempt) return null;

    if (attempt.status === CBT_STATUS.PAUSED) {
      return attempt;
    }

    if (attempt.status === CBT_STATUS.IN_PROGRESS) {
      // Check if attempt time expired while away
      if (Date.now() >= attempt.endAt) {
        this.submitAttempt(testId, 'time-expired');
        return null;
      }
      return attempt;
    }
    return null;
  }

  // Freeze the timer and pause the examination
  pauseAttempt(testId) {
    const attempt = this.attempts[testId];
    if (!attempt) return null;
    if (attempt.status === CBT_STATUS.PAUSED) return attempt;
    if (attempt.status !== CBT_STATUS.IN_PROGRESS) return null;

    const remainingMs = Math.max(0, attempt.endAt - Date.now());
    attempt.status = CBT_STATUS.PAUSED;
    attempt.pausedAt = Date.now();
    attempt.remainingMs = remainingMs;
    this.saveAttempts();
    return attempt;
  }

  // Restore the remaining timer and resume examination
  resumeAttempt(testId) {
    const attempt = this.attempts[testId];
    if (!attempt) return null;
    if (attempt.status === CBT_STATUS.IN_PROGRESS) return attempt;
    if (attempt.status !== CBT_STATUS.PAUSED) return null;

    const test = this.getTestById(testId);
    const remainingMs = typeof attempt.remainingMs === 'number' 
      ? attempt.remainingMs 
      : ((test?.durationMinutes || 45) * 60000);

    attempt.status = CBT_STATUS.IN_PROGRESS;
    attempt.endAt = Date.now() + remainingMs;
    attempt.resumedAt = Date.now();
    delete attempt.remainingMs;
    delete attempt.pausedAt;
    this.saveAttempts();
    return attempt;
  }

  getCompletedAttempt(testId) {
    const attempt = this.attempts[testId];
    if (attempt && attempt.status === CBT_STATUS.SUBMITTED) {
      return attempt;
    }
    return null;
  }

  /**
   * Starts or resumes an attempt.
   * End timestamp rule: endAt = Math.min(startedAt + durationMs, testEndTimeMs)
   */
  startAttempt(testId) {
    const test = this.getTestById(testId);
    if (!test) return null;

    // Check if active or paused attempt already exists
    const existing = this.getActiveAttempt(testId);
    if (existing) {
      if (existing.status === CBT_STATUS.PAUSED) {
        return this.resumeAttempt(testId);
      }
      return existing;
    }

    const { endTime } = getTestTimes(test);
    const startedAt = Date.now();
    const durationMs = (test.durationMinutes || 45) * 60000;
    // End time is the earlier of attempt duration or test window closing
    const calculatedEnd = startedAt + durationMs;
    const windowEnd = endTime.getTime();
    const endAt = Math.min(calculatedEnd, windowEnd > startedAt ? windowEnd : calculatedEnd);

    const newAttempt = {
      testId,
      attemptId: `attempt-${testId}-${startedAt}`,
      status: CBT_STATUS.IN_PROGRESS,
      startedAt,
      endAt,
      currentQuestionIndex: 0,
      answers: {},
      markedForReview: {},
      tabSwitchCount: 0
    };

    this.attempts[testId] = newAttempt;
    this.saveAttempts();

    return newAttempt;
  }

  saveAnswer(testId, questionId, optionKey) {
    const attempt = this.getActiveAttempt(testId);
    if (!attempt) return null;

    attempt.answers[questionId] = optionKey;
    this.saveAttempts();
    return attempt;
  }

  clearAnswer(testId, questionId) {
    const attempt = this.getActiveAttempt(testId);
    if (!attempt) return null;

    delete attempt.answers[questionId];
    this.saveAttempts();
    return attempt;
  }

  toggleReview(testId, questionId) {
    const attempt = this.getActiveAttempt(testId);
    if (!attempt) return null;

    attempt.markedForReview[questionId] = !attempt.markedForReview[questionId];
    this.saveAttempts();
    return attempt;
  }

  setCurrentQuestionIndex(testId, index) {
    const attempt = this.getActiveAttempt(testId);
    if (!attempt) return;

    attempt.currentQuestionIndex = index;
    this.saveAttempts();
  }

  recordTabSwitch(testId) {
    const attempt = this.getActiveAttempt(testId);
    if (!attempt) return;

    attempt.tabSwitchCount = (attempt.tabSwitchCount || 0) + 1;
    this.saveAttempts();
  }

  /**
   * Finalizes and scores the attempt.
   */
  submitAttempt(testId, reason = 'normal') {
    const test = this.getTestById(testId);
    const attempt = this.attempts[testId];
    if (!test || !attempt) return null;

    const questions = test.questions || sampleCbtQuestionBank;
    const totalQuestions = questions.length;
    const userAnswers = attempt.answers || {};

    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    questions.forEach((q) => {
      const chosen = userAnswers[q.id];
      if (!chosen) {
        unattemptedCount++;
      } else if (chosen === q.correct) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    const marksCorrect = test.marksPerCorrect || 5;
    const marksIncorrect = test.marksPerIncorrect || -1;
    const rawScore = Math.max(0, (correctCount * marksCorrect) + (incorrectCount * marksIncorrect));
    const maxMarks = totalQuestions * marksCorrect;
    const percentage = Math.round((rawScore / maxMarks) * 100);
    const passed = percentage >= (test.passingScore || 50);

    const elapsedSeconds = Math.min(
      (test.durationMinutes || 45) * 60,
      Math.max(1, Math.round((Date.now() - attempt.startedAt) / 1000))
    );
    const elapsedMins = Math.floor(elapsedSeconds / 60);
    const elapsedSecs = elapsedSeconds % 60;
    const timeTakenFormatted = `${elapsedMins}m ${elapsedSecs}s`;

    const completedAttempt = {
      ...attempt,
      status: CBT_STATUS.SUBMITTED,
      submissionReason: reason, // 'normal' | 'time-expired' | 'navigation-exit'
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      score: rawScore,
      totalMarks: maxMarks,
      percentage,
      statusLabel: passed ? 'Pass' : 'Fail',
      percentile: percentage >= 85 ? '97.4%ile' : percentage >= 70 ? '89.6%ile' : percentage >= 50 ? '71.2%ile' : '48.5%ile',
      rank: percentage >= 85 ? 'AIR 34' : percentage >= 70 ? 'AIR 92' : 'AIR 240',
      correctCount,
      incorrectCount,
      unattemptedCount,
      accuracy: (correctCount + incorrectCount) > 0 ? Math.round((correctCount / (correctCount + incorrectCount)) * 100) : 0,
      timeTakenFormatted
    };

    this.attempts[testId] = completedAttempt;
    this.saveAttempts();

    // Also synchronize with legacy testService so Faculty/Admin portal reflects the submission!
    try {
      testService.submitStudentAttempt(testId, {
        score: rawScore,
        totalMarks: maxMarks,
        percentage,
        status: passed ? 'Pass' : 'Fail',
        percentile: completedAttempt.percentile,
        rank: completedAttempt.rank,
        correctCount,
        incorrectCount,
        unattemptedCount,
        accuracy: completedAttempt.accuracy,
        timeTakenFormatted,
        submittedAt: completedAttempt.submittedAt
      });
    } catch (e) {
      console.warn('Legacy testService sync error:', e);
    }

    return completedAttempt;
  }

  subscribe(callback) {
    const handler = () => callback(this.tests, this.attempts);
    window.addEventListener('medprep-cbt-tests-updated', handler);
    window.addEventListener('medprep-cbt-attempts-updated', handler);
    return () => {
      window.removeEventListener('medprep-cbt-tests-updated', handler);
      window.removeEventListener('medprep-cbt-attempts-updated', handler);
    };
  }
}

export const cbtTestService = new CbtTestService();

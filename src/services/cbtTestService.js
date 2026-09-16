// =============================================================================
// CBT TEST SERVICE — LIFECYCLE, SCHEDULING, ATTEMPTS & PERSISTENCE
// Centralized state machine: UPCOMING -> AVAILABLE -> IN_PROGRESS -> SUBMITTED / EXPIRED
// =============================================================================

import { sampleCbtQuestionBank } from '../data/cbtQuestionBankData.js';
import { questionService } from './questionService.js';

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

  if (test.date && test.time) {
    try {
      const timeClean = test.time.replace(/IST|AM|PM/gi, '').trim();
      const isPM = /PM/i.test(test.time);
      const isAM = /AM/i.test(test.time);
      let [hours, mins] = timeClean.split(':').map(Number);
      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;
      const hh = String(hours || 0).padStart(2, '0');
      const mm = String(mins || 0).padStart(2, '0');
      const schedDate = new Date(`${test.date}T${hh}:${mm}:00`);
      if (!isNaN(schedDate.getTime())) {
        const durationMinutes = Number(test.durationMinutes) || 
          (typeof test.duration === 'string' ? parseInt(test.duration, 10) : 45) || 45;
        const windowEnd = new Date(schedDate.getTime() + (durationMinutes + 120) * 60000);
        return {
          startTime: schedDate,
          endTime: windowEnd
        };
      }
    } catch (e) {
      console.warn('Date parsing fallback:', e);
    }
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
 * Pure canonical assessment evaluation function.
 * Calculates score (+marks / -negativeMarks), totals, accuracy, and performance percentiles.
 * @param {object} attempt
 * @param {object} test
 * @returns {object}
 */
export function evaluateAttempt(attempt, test) {
  if (!test || !attempt) return null;
  const questions = cbtTestService.getQuestionsForTest(test);
  const totalQuestions = questions.length;
  const userAnswers = attempt.answers || {};

  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  const defaultMarksPerCorrect = Number(test.marksPerCorrect) || 5;
  const defaultMarksPerIncorrect = Number(test.marksPerIncorrect) !== undefined ? Number(test.marksPerIncorrect) : -1;

  let rawScore = 0;
  let maxMarks = 0;

  questions.forEach((q) => {
    const qMarks = Number(q.marks) || defaultMarksPerCorrect;
    const qNeg = Number(q.negativeMarks) !== undefined ? Number(q.negativeMarks) : defaultMarksPerIncorrect;
    maxMarks += qMarks;

    const chosen = userAnswers[q.id];
    const correctKey = q.correct || q.correctOption || 
      (Array.isArray(q.answer?.correct) ? q.answer.correct[0] : q.answer?.correct);

    if (!chosen) {
      unattemptedCount++;
    } else if (String(chosen).trim().toUpperCase() === String(correctKey).trim().toUpperCase()) {
      correctCount++;
      rawScore += qMarks;
    } else {
      incorrectCount++;
      rawScore += qNeg; // Apply configured negative marking
    }
  });

  rawScore = Math.max(0, rawScore);
  const percentage = maxMarks > 0 ? Math.round((rawScore / maxMarks) * 100) : 0;
  const passingScore = Number(test.passingScore) || 50;
  const passed = percentage >= passingScore;

  const attemptedCount = correctCount + incorrectCount;
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

  const percentile = percentage >= 85 ? '97.4%ile' : percentage >= 70 ? '89.6%ile' : percentage >= 50 ? '71.2%ile' : '48.5%ile';
  const rank = percentage >= 85 ? 'AIR 34' : percentage >= 70 ? 'AIR 92' : 'AIR 240';

  const durationSec = ((Number(test.durationMinutes) || 45) * 60);
  const elapsedSeconds = attempt.startedAt 
    ? Math.min(durationSec, Math.max(1, Math.round(((attempt.submittedTimestamp || Date.now()) - attempt.startedAt) / 1000)))
    : durationSec;
  const elapsedMins = Math.floor(elapsedSeconds / 60);
  const elapsedSecs = elapsedSeconds % 60;
  const timeTakenFormatted = `${elapsedMins}m ${elapsedSecs}s`;

  return {
    score: rawScore,
    totalMarks: maxMarks,
    percentage,
    passed,
    statusLabel: passed ? 'Pass' : 'Fail',
    percentile,
    rank,
    correctCount,
    incorrectCount,
    unattemptedCount,
    unansweredCount: unattemptedCount,
    accuracy,
    timeTakenFormatted
  };
}

/**
 * Derives the effective test status:
 * 1. If test status is draft or archived -> 'draft' | 'archived'
 * 2. If submitted attempt exists -> 'submitted'
 * 3. If active attempt exists and now < endAt -> 'in-progress'
 * 4. If now < startTime -> 'upcoming'
 * 5. If startTime <= now < endTime -> 'available'
 * 6. If now >= endTime -> 'expired'
 */
export function getTestStatus(test, now = new Date()) {
  if (!test) return CBT_STATUS.EXPIRED;

  // Explicit draft or archived status
  if (test.status === 'draft' || test.status === 'Draft') return 'draft';
  if (test.status === 'archived' || test.status === 'Archived') return 'archived';

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

/**
 * Centralized test eligibility and access gate.
 * @param {object} test
 * @param {Date|number} now
 * @param {object|null} student
 * @returns {boolean}
 */
export function canStartTest(test, now = new Date(), student = null) {
  if (!test) return false;

  // Cannot start draft, archived, or cancelled tests
  if (test.status === 'draft' || test.status === 'Draft' || 
      test.status === 'archived' || test.status === 'Archived' ||
      test.status === 'cancelled') {
    return false;
  }

  // Validate student course enrollment if student provided
  if (student) {
    const studentCourse = student.enrolledExamId || student.courseId || student.course;
    const testCourse = test.examTrack || test.courseId;
    if (studentCourse && testCourse && testCourse !== 'all' && testCourse !== 'all-courses') {
      const cleanStudent = String(studentCourse).toLowerCase();
      const cleanTest = String(testCourse).toLowerCase();
      if (!cleanStudent.includes(cleanTest) && !cleanTest.includes(cleanStudent)) {
        return false;
      }
    }
  }

  const status = getTestStatus(test, now);
  return status === CBT_STATUS.AVAILABLE || status === CBT_STATUS.IN_PROGRESS || status === CBT_STATUS.PAUSED;
}

export function formatTestCountdown(testOrDate, now = new Date()) {
  if (!testOrDate) return '';
  let startTime, endTime;
  let formattedWindow = '';

  if (testOrDate instanceof Date || (typeof testOrDate === 'number' && !isNaN(testOrDate))) {
    startTime = testOrDate instanceof Date ? testOrDate : new Date(testOrDate);
    endTime = new Date(startTime.getTime() + 7200000);
  } else {
    const times = getTestTimes(testOrDate);
    startTime = times.startTime;
    endTime = times.endTime;
    formattedWindow = testOrDate.formattedWindow || '';
  }

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
    return `Starts Tomorrow • ${formattedWindow ? formattedWindow.split('•').pop().trim() : '10:00 AM IST'}`;
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
      // Migration from legacy phase6 tests if available
      const legacyStored = localStorage.getItem('medprep_phase6_tests');
      if (legacyStored) {
        const legacyParsed = JSON.parse(legacyStored);
        if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
          return legacyParsed;
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
      // Sync legacy storage key for complete backward compatibility
      localStorage.setItem('medprep_phase6_tests', JSON.stringify(this.tests));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('medprep-cbt-tests-updated', { detail: this.tests }));
        window.dispatchEvent(new CustomEvent('medprep-tests-updated', { detail: this.tests }));
        window.dispatchEvent(new CustomEvent('medprep-assessment-updated', { detail: { tests: this.tests } }));
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
        window.dispatchEvent(new CustomEvent('medprep-results-updated', { detail: this.attempts }));
        window.dispatchEvent(new CustomEvent('medprep-assessment-updated', { detail: { attempts: this.attempts } }));
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

  /**
   * Normalizes question objects from Question Bank, CBT, or manual authoring formats.
   */
  normalizeQuestion(q, defaultIndex = 1) {
    if (!q) return null;
    const id = q.id || defaultIndex;
    const vignette = q.vignette || q.content?.vignette || '';
    const question = q.question || q.content?.prompt || q.prompt || 'What is the most appropriate next clinical step or diagnosis?';
    
    let options = [];
    if (Array.isArray(q.options) && q.options.length > 0) {
      options = q.options.map((opt, idx) => {
        const key = opt.key || opt.id || String.fromCharCode(65 + idx);
        return {
          id: key,
          key: key,
          text: opt.text || ''
        };
      });
    } else if (Array.isArray(q.responseSchema?.options)) {
      options = q.responseSchema.options.map((opt, idx) => {
        const key = opt.id || opt.key || String.fromCharCode(65 + idx);
        return {
          id: key,
          key: key,
          text: opt.text || ''
        };
      });
    } else if (q.optA || q.optB) {
      options = [
        { id: 'A', key: 'A', text: q.optA || '' },
        { id: 'B', key: 'B', text: q.optB || '' },
        { id: 'C', key: 'C', text: q.optC || '' },
        { id: 'D', key: 'D', text: q.optD || '' }
      ];
    }

    const correct = q.correct || q.correctOption || 
      (Array.isArray(q.answer?.correct) ? q.answer.correct[0] : q.answer?.correct) || 'A';

    const explanation = q.explanation || q.rationale || '';
    const guidelineRef = q.guidelineRef || q.metadata?.guidelineRef || '';
    const marks = Number(q.marks) || Number(q.scoring?.marks) || 5;
    const negativeMarks = Number(q.negativeMarks) !== undefined 
      ? Number(q.negativeMarks) 
      : (Number(q.scoring?.negativeMarks) !== undefined ? Number(q.scoring?.negativeMarks) : -1);

    return {
      id,
      vignette,
      question,
      options,
      correct,
      correctOption: correct,
      explanation,
      guidelineRef,
      marks,
      negativeMarks
    };
  }

  /**
   * Resolves questions for a test.
   * Prioritizes questionIds from Question Bank, falls back to inline questions.
   * @param {string|object} testOrId
   * @returns {Array<object>}
   */
  getQuestionsForTest(testOrId) {
    const test = typeof testOrId === 'object' ? testOrId : this.getTestById(testOrId);
    if (!test) return sampleCbtQuestionBank;

    // 1. If test references question IDs from canonical Question Bank
    if (Array.isArray(test.questionIds) && test.questionIds.length > 0) {
      const bankQuestions = questionService.getQuestionsByIds(test.questionIds);
      if (bankQuestions.length > 0) {
        return bankQuestions.map((q, idx) => this.normalizeQuestion(q, idx + 1));
      }
    }

    // 2. If test has inline questions
    if (Array.isArray(test.questions) && test.questions.length > 0) {
      return test.questions.map((q, idx) => this.normalizeQuestion(q, idx + 1));
    }

    return sampleCbtQuestionBank.map((q, idx) => this.normalizeQuestion(q, idx + 1));
  }

  // Retrieve active (in-progress or paused) attempt for a test
  getActiveAttempt(testId, studentId = null) {
    const attempt = this.attempts[testId];
    if (!attempt) return null;
    if (studentId && attempt.studentId && attempt.studentId !== studentId) return null;

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

  getCompletedAttempt(testId, studentId = null) {
    const attempt = this.attempts[testId];
    if (attempt && attempt.status === CBT_STATUS.SUBMITTED) {
      if (studentId && attempt.studentId && attempt.studentId !== studentId) return null;
      return attempt;
    }
    return null;
  }

  /**
   * Starts or resumes an attempt.
   * Guarantees EXACTLY ONE active attempt per test per student.
   * Timestamp-based effective deadline: min(startedAt + duration, windowEnd).
   */
  startAttempt(testId, studentId = 'student-ritik') {
    const test = this.getTestById(testId);
    if (!test) return null;

    // Check if active or paused attempt already exists - resume it!
    const existing = this.getActiveAttempt(testId, studentId);
    if (existing) {
      if (existing.status === CBT_STATUS.PAUSED) {
        return this.resumeAttempt(testId);
      }
      return existing;
    }

    const { endTime } = getTestTimes(test);
    const startedAt = Date.now();
    const durationMinutes = Number(test.durationMinutes) || 
      (typeof test.duration === 'string' ? parseInt(test.duration, 10) : 45) || 45;
    const durationMs = durationMinutes * 60000;

    // Effective deadline is the earlier of attempt duration or test window closing
    const calculatedEnd = startedAt + durationMs;
    const windowEnd = endTime.getTime();
    const endAt = Math.min(calculatedEnd, windowEnd > startedAt ? windowEnd : calculatedEnd);

    const newAttempt = {
      testId,
      attemptId: `attempt-${testId}-${studentId}-${startedAt}`,
      studentId,
      status: CBT_STATUS.IN_PROGRESS,
      startedAt,
      endAt,
      durationMs,
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
   * Finalizes and scores the attempt using the canonical pure evaluateAttempt function.
   */
  submitAttempt(testId, reason = 'normal') {
    const test = this.getTestById(testId);
    const attempt = this.attempts[testId];
    if (!test || !attempt) return null;

    const evalResult = evaluateAttempt(attempt, test);
    if (!evalResult) return null;

    const completedAttempt = {
      ...attempt,
      status: CBT_STATUS.SUBMITTED,
      submissionReason: reason, // 'normal' | 'time-expired' | 'navigation-exit'
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      submittedTimestamp: Date.now(),
      score: evalResult.score,
      totalMarks: evalResult.totalMarks,
      percentage: evalResult.percentage,
      statusLabel: evalResult.statusLabel,
      percentile: evalResult.percentile,
      rank: evalResult.rank,
      correctCount: evalResult.correctCount,
      incorrectCount: evalResult.incorrectCount,
      unattemptedCount: evalResult.unattemptedCount,
      accuracy: evalResult.accuracy,
      timeTakenFormatted: evalResult.timeTakenFormatted
    };

    this.attempts[testId] = completedAttempt;
    this.saveAttempts();

    return completedAttempt;
  }

  // ===========================================================================
  // FACULTY & ADMIN MUTATIONS: SINGLE SOURCE OF TRUTH
  // ===========================================================================

  createTest(testData) {
    const id = testData.id || `test-${Date.now()}`;
    const durationMinutes = Number(testData.durationMinutes) || 
      (typeof testData.duration === 'string' ? parseInt(testData.duration, 10) : 45) || 45;
    const durationSeconds = durationMinutes * 60;
    
    // Exam track mapping
    let examTrack = testData.examTrack || testData.courseId;
    if (!examTrack) {
      if (testData.course?.includes('USMLE')) examTrack = 'usmle';
      else if (testData.course?.includes('PLAB') || testData.course?.includes('UKMLA')) examTrack = 'plab';
      else if (testData.course?.includes('Europe')) examTrack = 'europe';
      else examTrack = 'neet-pg';
    }

    const course = testData.course || (
      examTrack === 'usmle' ? 'USMLE Step 1 & 2 CK' :
      examTrack === 'plab' ? 'PLAB 1 & 2 / UKMLA' :
      examTrack === 'europe' ? 'Europe Medical Licensing' :
      'NEET PG & NExT 2026'
    );

    // Support questionIds from Question Bank, or inline questions
    let questionIds = Array.isArray(testData.questionIds) ? testData.questionIds : [];
    let questions = Array.isArray(testData.questions) ? testData.questions : [];

    if (questionIds.length > 0 && questions.length === 0) {
      const resolved = questionService.getQuestionsByIds(questionIds);
      questions = resolved.map((q, idx) => this.normalizeQuestion(q, idx + 1));
    } else if (questions.length > 0 && questionIds.length === 0) {
      questionIds = questions.map((q, idx) => q.id || `q-inline-${id}-${idx + 1}`);
    } else if (questions.length === 0 && questionIds.length === 0) {
      questions = sampleCbtQuestionBank.slice(0, Math.min(testData.questionCount || testData.totalQuestions || 20, sampleCbtQuestionBank.length));
      questionIds = questions.map(q => q.id);
    }
    
    const totalQuestions = questions.length || Number(testData.questionCount) || Number(testData.totalQuestions) || 20;
    const totalMarks = Number(testData.totalMarks) || (totalQuestions * (testData.marksPerCorrect || 5));

    // Calculate window offsets
    let startOffsetMinutes = typeof testData.startOffsetMinutes === 'number' ? testData.startOffsetMinutes : 60;
    let endOffsetMinutes = typeof testData.endOffsetMinutes === 'number' ? testData.endOffsetMinutes : (startOffsetMinutes + durationMinutes + 120);
    let formattedWindow = testData.formattedWindow || 'Upcoming • Scheduled';

    if (testData.date && testData.time) {
      try {
        const timeClean = testData.time.replace('IST', '').trim();
        const schedDate = new Date(`${testData.date}T${timeClean}`);
        if (!isNaN(schedDate.getTime())) {
          startOffsetMinutes = Math.round((schedDate.getTime() - PROTOTYPE_EPOCH) / 60000);
          endOffsetMinutes = startOffsetMinutes + durationMinutes + 120;
          formattedWindow = `${schedDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} • ${testData.time}`;
        }
      } catch (e) {
        console.warn('Date parsing fallback:', e);
      }
    }

    const newTest = {
      id,
      name: testData.name || testData.title || 'Clinical Mock Assessment',
      title: testData.name || testData.title || 'Clinical Mock Assessment',
      examTrack,
      courseId: examTrack,
      course,
      // Academic hierarchy & delivery scope
      subjectId: testData.subjectId || null,
      moduleId: testData.moduleId || null,
      lectureId: testData.lectureId || null,
      deliveryDayId: testData.deliveryDayId || null,
      batch: testData.batch || testData.batchTier || 'All Enrolled Candidates',
      batchTier: testData.batchTier || testData.batch || 'All Enrolled Candidates',
      date: testData.date || 'Upcoming',
      time: testData.time || '18:00 IST',
      duration: `${durationMinutes} mins`,
      durationMinutes,
      durationSeconds,
      totalQuestions,
      questionCount: totalQuestions,
      totalMarks,
      passingScore: Number(testData.passingScore) || 50,
      negativeMarking: testData.negativeMarking !== undefined ? testData.negativeMarking : true,
      marksPerCorrect: Number(testData.marksPerCorrect) || 5,
      marksPerIncorrect: Number(testData.marksPerIncorrect) || -1,
      marksUnanswered: 0,
      startOffsetMinutes,
      endOffsetMinutes,
      formattedWindow,
      pattern: testData.pattern || 'NExT Aligned Clinical Vignettes',
      instructions: testData.instructions || [
        `This examination consists of ${totalQuestions} high-yield clinical vignette multiple choice questions.`,
        `Total duration allowed is ${durationMinutes} minutes from the time you start your attempt.`,
        `Marking Scheme: +${testData.marksPerCorrect || 5} for correct, ${testData.marksPerIncorrect || -1} for incorrect, 0 for unattempted.`,
        'Timer starts immediately upon clicking "Start Examination".',
        'Answers are saved automatically in real time and persist across page refreshes.'
      ],
      questionIds,
      questions,
      status: testData.status || 'upcoming'
    };

    this.tests = [newTest, ...this.tests.filter(t => t.id !== id)];
    this.saveTests();

    return newTest;
  }

  updateTest(id, patch) {
    const index = this.tests.findIndex(t => t.id === id);
    if (index === -1) return null;

    const updated = {
      ...this.tests[index],
      ...patch,
      title: patch.name || patch.title || this.tests[index].title,
      name: patch.name || patch.title || this.tests[index].name
    };

    if (patch.questions) {
      updated.totalQuestions = patch.questions.length;
      updated.questionCount = patch.questions.length;
      updated.totalMarks = patch.questions.length * (updated.marksPerCorrect || 5);
      if (!patch.questionIds) {
        updated.questionIds = patch.questions.map((q, idx) => q.id || `q-${id}-${idx + 1}`);
      }
    }

    if (patch.questionIds && !patch.questions) {
      const resolved = questionService.getQuestionsByIds(patch.questionIds);
      updated.questions = resolved.map((q, idx) => this.normalizeQuestion(q, idx + 1));
      updated.totalQuestions = patch.questionIds.length;
      updated.questionCount = patch.questionIds.length;
      updated.totalMarks = patch.questionIds.length * (updated.marksPerCorrect || 5);
    }

    this.tests[index] = updated;
    this.saveTests();

    return updated;
  }

  deleteTest(id) {
    this.tests = this.tests.filter(t => t.id !== id);
    delete this.attempts[id];
    this.saveTests();
    this.saveAttempts();
    return true;
  }

  updateTestQuestions(testId, questions) {
    const test = this.getTestById(testId);
    if (!test) return null;

    const normalized = questions.map((q, idx) => this.normalizeQuestion(q, idx + 1));
    const questionIds = normalized.map(q => q.id);

    return this.updateTest(testId, {
      questions: normalized,
      questionIds,
      totalQuestions: normalized.length,
      questionCount: normalized.length,
      totalMarks: normalized.length * (test.marksPerCorrect || 5)
    });
  }

  addQuestionToTest(testId, questionData) {
    const test = this.getTestById(testId);
    if (!test) return null;

    // Persist into canonical Question Bank as well!
    let bankQuestion = null;
    try {
      const bankResult = questionService.createFromAuthoring({
        ...questionData,
        examId: test.examTrack || test.courseId || 'neet-pg',
        subjectId: test.subjectId,
        moduleId: test.moduleId,
        lectureId: test.lectureId
      });
      if (bankResult.success) {
        bankQuestion = bankResult.question;
      }
    } catch (e) {
      console.warn('Question Bank sync error:', e);
    }

    const currentQuestions = Array.isArray(test.questions) ? test.questions : [];
    const newQ = bankQuestion 
      ? this.normalizeQuestion(bankQuestion, currentQuestions.length + 1)
      : this.normalizeQuestion(questionData, currentQuestions.length + 1);

    const updatedQuestions = [...currentQuestions, newQ];
    this.updateTestQuestions(testId, updatedQuestions);
    return newQ;
  }

  getCohortResults(testId) {
    const attemptsForTest = this.getAttemptsForTest(testId);
    return {
      testId,
      testName: attemptsForTest.test?.name || 'Scheduled Mock Test',
      summary: {
        averageScore: attemptsForTest.summary?.batchMeanScore || '78.4 / 100',
        highestScore: attemptsForTest.summary?.highestMark || '96 / 100',
        attemptedCount: attemptsForTest.candidates?.length || 10,
        totalEligible: 450,
        passRate: attemptsForTest.summary?.passingPercentage || '88.5%',
        cutoffScore: attemptsForTest.test?.passingScore || 50
      },
      students: attemptsForTest.candidates || []
    };
  }

  getAttemptsForTest(testId) {
    const test = this.getTestById(testId);
    const completedAttempt = this.getCompletedAttempt(testId);

    // Standard benchmark cohort candidates for realistic institutional depth
    const defaultCohortCandidates = [
      { rank: 1, name: 'Dr. Priya Sharma', email: 'priya.s@medprep.com', score: '96/100', percentage: '96.0%', percentile: '99.8%', timeTaken: '34m 12s', status: 'Pass', submittedAt: 'Sep 06, 19:42' },
      { rank: 2, name: 'Dr. Rohan Verma', email: 'rohan.v@medprep.com', score: '92/100', percentage: '92.0%', percentile: '99.1%', timeTaken: '38m 05s', status: 'Pass', submittedAt: 'Sep 06, 19:45' },
      { rank: 3, name: 'Dr. Ananya Joshi', email: 'ananya.j@medprep.com', score: '88/100', percentage: '88.0%', percentile: '98.4%', timeTaken: '41m 20s', status: 'Pass', submittedAt: 'Sep 06, 19:50' },
      { rank: 4, name: 'Dr. Michael Chen', email: 'm.chen@medprep.com', score: '86/100', percentage: '86.0%', percentile: '97.2%', timeTaken: '42m 10s', status: 'Pass', submittedAt: 'Sep 06, 19:51' },
      { rank: 5, name: 'Dr. Emily Watson', email: 'emily.w@medprep.com', score: '84/100', percentage: '84.0%', percentile: '95.6%', timeTaken: '44m 30s', status: 'Pass', submittedAt: 'Sep 06, 19:54' },
      { rank: 7, name: 'Dr. Arjun Patel', email: 'arjun.p@medprep.com', score: '76/100', percentage: '76.0%', percentile: '86.5%', timeTaken: '44m 50s', status: 'Pass', submittedAt: 'Sep 06, 19:56' },
      { rank: 8, name: 'Dr. Fatima Noor', email: 'fatima.n@medprep.com', score: '68/100', percentage: '68.0%', percentile: '74.2%', timeTaken: '45m 00s', status: 'Pass', submittedAt: 'Sep 06, 19:58' },
      { rank: 9, name: 'Dr. David Miller', email: 'david.m@medprep.com', score: '52/100', percentage: '52.0%', percentile: '51.0%', timeTaken: '45m 00s', status: 'Fail', submittedAt: 'Sep 06, 19:59' },
      { rank: 10, name: 'Dr. Kavita Singh', email: 'kavita.s@medprep.com', score: '44/100', percentage: '44.0%', percentile: '38.5%', timeTaken: '45m 00s', status: 'Fail', submittedAt: 'Sep 06, 20:00' }
    ];

    let candidates = [...defaultCohortCandidates];

    // If an actual student attempt exists in cbtTestService, inject/update Dr. Ritik Saini
    if (completedAttempt) {
      const ritikCandidate = {
        rank: 6,
        name: 'Dr. Ritik Saini',
        email: 'student@demo.com',
        score: `${completedAttempt.score}/${completedAttempt.totalMarks}`,
        percentage: `${completedAttempt.percentage}.0%`,
        percentile: completedAttempt.percentile || '91.8%',
        timeTaken: completedAttempt.timeTakenFormatted || '43m 15s',
        status: completedAttempt.statusLabel || (completedAttempt.percentage >= (test?.passingScore || 50) ? 'Pass' : 'Fail'),
        submittedAt: completedAttempt.submittedAt || 'Today, 18:49 IST'
      };
      candidates.splice(5, 0, ritikCandidate);
    } else {
      candidates.splice(5, 0, {
        rank: 6,
        name: 'Dr. Ritik Saini',
        email: 'student@demo.com',
        score: '80/100',
        percentage: '80.0%',
        percentile: '91.8%',
        timeTaken: '43m 15s',
        status: 'Pass',
        submittedAt: 'Sep 06, 19:55'
      });
    }

    const totalAppeared = 384 + (completedAttempt ? 1 : 0);
    const passCount = candidates.filter(c => c.status === 'Pass').length;
    const passPercentage = Math.round((passCount / candidates.length) * 100);

    return {
      test,
      candidates,
      summary: {
        totalAppeared: `${totalAppeared} Doctors`,
        batchMeanScore: '78.4 / 100',
        passingPercentage: `${passPercentage}% Pass`,
        highestMark: '96 / 100'
      }
    };
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

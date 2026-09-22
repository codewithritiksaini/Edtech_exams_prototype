// =============================================================================
// CBT TEST SERVICE — LIFECYCLE, SCHEDULING, ATTEMPTS & PERSISTENCE
// Centralized state machine: UPCOMING -> AVAILABLE -> IN_PROGRESS -> SUBMITTED / EXPIRED
// =============================================================================

import { sampleCbtQuestionBank } from '../data/cbtQuestionBankData.js';
import { questionService } from './questionService.js';
import { catalogService } from './catalogService.js';
import { curriculumService } from './curriculumService.js';
import { peopleService } from './peopleService.js';
import { getStoredData, setStoredData } from '../utils/examStorage.js';
import { 
  STRUCTURE_MODES, 
  UNIT_TYPES, 
  EXAM_MAPPING_TYPES, 
  STRUCTURE_ITEM_TYPES,
  getExamPattern, 
  createDefaultTestStructure, 
  generateUnitId, 
  validateStructure,
  DEFAULT_UNIT_CONFIGURATION,
  normalizeUnitConfiguration,
  validateUnitConfiguration,
  getExamStages,
  getStageSubjects,
  validateCurriculumScope,
  normalizeTestStructure,
  validateTestStructureHierarchy,
  isStructureReady
} from './examPatternHelper.js';

export { STRUCTURE_ITEM_TYPES, isStructureReady };
import { 
  questionTypeService, 
  QUESTION_TYPES, 
  QUESTION_TYPE_INHERITANCE_MODES, 
  DEFAULT_TEST_ALLOWED_QUESTION_TYPES, 
  DEFAULT_TEST_QUESTION_TYPE_CONFIG 
} from './questionTypeService.js';
import { 
  ASSESSMENT_METHODS, 
  ASSESSMENT_METHOD_LIST, 
  VALID_ASSESSMENT_METHOD_IDS,
  getAssessmentMethodLabel, 
  getAssessmentMethodBadgeClass, 
  isValidAssessmentMethod, 
  validateAssessmentMethod 
} from './assessmentMethodService.js';

export { 
  ASSESSMENT_METHODS, 
  ASSESSMENT_METHOD_LIST, 
  VALID_ASSESSMENT_METHOD_IDS,
  getAssessmentMethodLabel, 
  getAssessmentMethodBadgeClass, 
  isValidAssessmentMethod, 
  validateAssessmentMethod 
};

export const CBT_STATUS = {
  UPCOMING: 'upcoming',
  AVAILABLE: 'available',
  IN_PROGRESS: 'in-progress',
  PAUSED: 'paused',
  SUBMITTED: 'submitted',
  EXPIRED: 'expired'
};

export const FACULTY_TEST_STATUS = {
  DRAFT: 'DRAFT',
  UPCOMING: 'UPCOMING',
  LIVE: 'LIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const FACULTY_TEST_TYPES = [
  { value: 'SUBJECT_TEST', label: 'Subject Test' },
  { value: 'CHAPTER_TEST', label: 'Chapter Test' },
  { value: 'PRACTICE_TEST', label: 'Practice Test' },
  { value: 'COHORT_TEST', label: 'Cohort Test' },
  { value: 'CUSTOM', label: 'Custom Test' }
];

export const getFacultyTestTypeLabel = (typeValue) => {
  const found = FACULTY_TEST_TYPES.find(t => t.value === typeValue);
  return found ? found.label : (typeValue || 'Subject Test');
};

export function generateFacultyTestCode(existingTests = []) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const datePrefix = `FT-${yyyy}${mm}${dd}`;

  let maxSeq = 0;
  if (Array.isArray(existingTests)) {
    existingTests.forEach(t => {
      if (t && t.code && typeof t.code === 'string' && t.code.startsWith(datePrefix)) {
        const parts = t.code.split('-');
        if (parts.length >= 3) {
          const seq = parseInt(parts[2], 10);
          if (!isNaN(seq) && seq > maxSeq) {
            maxSeq = seq;
          }
        }
      }
    });
  }

  const nextSeq = String(maxSeq + 1).padStart(3, '0');
  return `${datePrefix}-${nextSeq}`;
}

export function getNormalizedFacultyStatus(test) {
  if (!test) return FACULTY_TEST_STATUS.DRAFT;
  const rawStatus = (test.status || '').toUpperCase();
  if (rawStatus === 'DRAFT') return FACULTY_TEST_STATUS.DRAFT;
  if (rawStatus === 'CANCELLED') return FACULTY_TEST_STATUS.CANCELLED;
  if (rawStatus === 'UPCOMING') return FACULTY_TEST_STATUS.UPCOMING;
  if (rawStatus === 'LIVE' || rawStatus === 'AVAILABLE' || rawStatus === 'IN-PROGRESS' || rawStatus === 'IN_PROGRESS') return FACULTY_TEST_STATUS.LIVE;
  if (rawStatus === 'COMPLETED' || rawStatus === 'SUBMITTED' || rawStatus === 'EXPIRED') return FACULTY_TEST_STATUS.COMPLETED;
  
  if (test.startOffsetMinutes !== undefined) {
    if (test.startOffsetMinutes > 0) return FACULTY_TEST_STATUS.UPCOMING;
    if (test.endOffsetMinutes !== undefined && test.endOffsetMinutes < 0) return FACULTY_TEST_STATUS.COMPLETED;
    return FACULTY_TEST_STATUS.LIVE;
  }

  return FACULTY_TEST_STATUS.UPCOMING;
}

/**
 * Helper to check question compatibility with a test's exam and subject scope.
 * @param {object} question - Question object from questionService
 * @param {object} test - Test object
 * @returns {{ compatible: boolean, error?: string }}
 */
export function checkQuestionCompatibility(question, test) {
  if (!question || !question.id) {
    return { compatible: false, error: 'INVALID_QUESTION_REFERENCE' };
  }

  const testExamId = (test.examId || test.examTrack || test.courseId || '').toLowerCase().trim();

  // 1. Exam Scope Check
  const qExamId = question.metadata?.examId ? String(question.metadata.examId).toLowerCase().trim() : null;
  if (qExamId) {
    if (qExamId !== testExamId && qExamId !== 'all') {
      return { compatible: false, error: 'QUESTION_EXAM_MISMATCH' };
    }
  } else {
    // Check heuristics from question ID or metadata
    const qId = String(question.id).toLowerCase();
    const qSubject = (question.metadata?.subject || '').toLowerCase();
    if (qId.startsWith('q-ielts') || qSubject === 'english') {
      if (testExamId !== 'ielts') {
        return { compatible: false, error: 'QUESTION_EXAM_MISMATCH' };
      }
    }
    if (qId.startsWith('q-neet') && testExamId !== 'neet-pg') {
      return { compatible: false, error: 'QUESTION_EXAM_MISMATCH' };
    }
    if (qId.startsWith('q-usmle') && testExamId !== 'usmle') {
      return { compatible: false, error: 'QUESTION_EXAM_MISMATCH' };
    }
    if (qId.startsWith('q-plab') && testExamId !== 'plab') {
      return { compatible: false, error: 'QUESTION_EXAM_MISMATCH' };
    }
  }

  // 2. Subject Scope Check (when test is scoped to a specific subject)
  const testSubjectId = test.subjectId;
  if (testSubjectId && testSubjectId !== 'all') {
    const qSubId = question.metadata?.subjectId;
    if (qSubId && qSubId !== 'all') {
      if (qSubId !== testSubjectId) {
        return { compatible: false, error: 'QUESTION_SUBJECT_MISMATCH' };
      }
    } else {
      // Fallback matching against subject names
      const testSubObj = curriculumService.getSubjectById(testSubjectId);
      const testSubName = (testSubObj?.name || '').toLowerCase();
      const qSubName = (question.metadata?.subject || '').toLowerCase();
      const qTopic = (question.metadata?.topic || '').toLowerCase();

      // Check if question's subject or topic matches test subject
      if (testSubName && qSubName) {
        const words = testSubName.split(/[\s,&/-]+/).filter(w => w.length > 3);
        const match = words.some(w => qSubName.includes(w) || qTopic.includes(w)) || 
                      qSubName.includes(testSubjectId.toLowerCase()) ||
                      testSubjectId.toLowerCase().includes(qSubName);
        if (!match) {
          return { compatible: false, error: 'QUESTION_SUBJECT_MISMATCH' };
        }
      }
    }
  }

  return { compatible: true };
}

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
    let rawTests = [];
    try {
      const storedData = getStoredData(STORAGE_KEY_TESTS, null);
      if (storedData && Array.isArray(storedData) && storedData.length > 0) {
        rawTests = storedData;
      } else if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY_TESTS);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            rawTests = parsed;
          }
        }
        if (rawTests.length === 0) {
          const legacyStored = localStorage.getItem('medprep_phase6_tests');
          if (legacyStored) {
            const legacyParsed = JSON.parse(legacyStored);
            if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
              rawTests = legacyParsed;
            }
          }
        }
      }
    } catch (e) {
      console.warn('CBT tests read error:', e);
    }
    if (rawTests.length === 0) {
      rawTests = JSON.parse(JSON.stringify(INITIAL_CBT_TESTS));
    }

    return rawTests.map((t, idx) => {
      const qIds = (Array.isArray(t.content?.questionIds) && t.content.questionIds.length > 0)
        ? t.content.questionIds
        : (Array.isArray(t.questionIds) && t.questionIds.length > 0
          ? t.questionIds
          : (Array.isArray(t.questions) ? t.questions.map(q => String(q.id)) : []));
      const uniqueQIds = Array.from(new Set(qIds));

      return {
        ...t,
        code: t.code || `FT-20260910-${String(idx + 1).padStart(3, '0')}`,
        examId: t.examId || t.examTrack || t.courseId || 'neet-pg',
        examTrack: t.examTrack || t.examId || t.courseId || 'neet-pg',
        courseId: t.courseId || t.examTrack || t.examId || 'neet-pg',
        facultyId: t.facultyId || 'fac-1',
        facultyName: t.facultyName || 'Dr. Siddharth V.',
        testType: t.testType || 'SUBJECT_TEST',
        status: t.status || (t.startOffsetMinutes && t.startOffsetMinutes > 0 ? FACULTY_TEST_STATUS.UPCOMING : FACULTY_TEST_STATUS.UPCOMING),
        scheduling: t.scheduling || {
          date: t.date || 'Upcoming',
          startTime: t.time ? t.time.replace(' IST', '') : '18:00',
          durationMinutes: t.durationMinutes || 45,
          timezone: 'Asia/Kolkata'
        },
        content: {
          questionIds: uniqueQIds,
          questionCount: uniqueQIds.length
        },
        questionIds: uniqueQIds,
        questionCount: uniqueQIds.length,
        totalQuestions: uniqueQIds.length || t.totalQuestions || 20
      };
    });
  }

  saveTests() {
    try {
      setStoredData(STORAGE_KEY_TESTS, this.tests);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(this.tests));
        localStorage.setItem('medprep_phase6_tests', JSON.stringify(this.tests));
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
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (e) {
      console.warn('CBT attempts read error:', e);
    }
    return { ...SEED_COMPLETED_ATTEMPTS };
  }

  saveAttempts() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(this.attempts));
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

  // =========================================================================
  // FACULTY TEST FOUNDATION — PHASE 1 SPECIFICATION METHODS
  // =========================================================================

  createFacultyTest(data, requestingFaculty = null) {
    const faculty = requestingFaculty || peopleService.getCurrentFacultyProfile();
    if (!faculty) {
      throw new Error('Unauthorized: Faculty profile not found.');
    }

    const assignedExams = faculty.assignedExams || [];
    if (!data.examId || !data.examId.trim()) {
      throw new Error('Associated Medical Exam is required.');
    }

    const cleanExamId = data.examId.trim();
    if (!assignedExams.includes(cleanExamId)) {
      throw new Error(`Unauthorized: Faculty is not assigned to Exam "${cleanExamId}". Allowed exams: ${assignedExams.join(', ')}.`);
    }

    if (!data.name || !data.name.trim()) {
      throw new Error('Test Name is required.');
    }

    const validTypes = FACULTY_TEST_TYPES.map(t => t.value);
    if (!data.testType || !validTypes.includes(data.testType)) {
      throw new Error(`Invalid Test Type "${data.testType}". Must be one of: ${validTypes.join(', ')}.`);
    }

    if (data.assessmentMethod) {
      const v = validateAssessmentMethod(data.assessmentMethod);
      if (!v.valid) {
        throw new Error(v.errors[0]?.message || 'Select a valid assessment method.');
      }
    }

    // Validate subject if specified
    if (data.subjectId && data.subjectId !== 'all') {
      const subjectsForExam = curriculumService.getSubjects(cleanExamId);
      const subjectExists = subjectsForExam.some(s => s.id === data.subjectId);
      if (!subjectExists) {
        throw new Error(`Selected subject "${data.subjectId}" does not belong to exam "${cleanExamId}".`);
      }
      // Check faculty assigned subjects if specified and non-empty
      if (Array.isArray(faculty.assignedSubjects) && faculty.assignedSubjects.length > 0) {
        if (!faculty.assignedSubjects.includes(data.subjectId)) {
          throw new Error(`Unauthorized: Faculty is not assigned to subject "${data.subjectId}".`);
        }
      }
    }

    // Desired status
    const targetStatus = (data.status || '').toUpperCase() === 'UPCOMING'
      ? FACULTY_TEST_STATUS.UPCOMING
      : FACULTY_TEST_STATUS.DRAFT;

    const date = (data.scheduling?.date || data.date || '').trim();
    const startTime = (data.scheduling?.startTime || data.startTime || data.time || '').trim().replace(' IST', '');
    const durationMinutes = Number(data.scheduling?.durationMinutes || data.durationMinutes || data.duration) || 45;
    const timezone = data.scheduling?.timezone || data.timezone || 'Asia/Kolkata';

    // If status is UPCOMING, require full scheduling
    if (targetStatus === FACULTY_TEST_STATUS.UPCOMING) {
      if (!date) {
        throw new Error('Scheduled Date is required to schedule a test as Upcoming.');
      }
      if (!startTime) {
        throw new Error('Start Time is required to schedule a test as Upcoming.');
      }
      if (!durationMinutes || durationMinutes < 5) {
        throw new Error('Valid duration (at least 5 minutes) is required.');
      }
    }

    const now = new Date().toISOString();
    const id = `ft-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const code = generateFacultyTestCode(this.tests);
    const examObj = catalogService.getExamById(cleanExamId);
    const rawQIds = Array.isArray(data.content?.questionIds)
      ? data.content.questionIds
      : (Array.isArray(data.questionIds) ? data.questionIds : []);
    const initialQuestionIds = Array.from(new Set(rawQIds));
    const targetQuestions = Number(data.targetQuestions || data.totalQuestions || data.questionCount) || 25;
    const derivedCount = initialQuestionIds.length;

    const newTest = {
      id,
      facultyId: faculty.id,
      facultyName: faculty.name,
      examId: cleanExamId,
      examTrack: cleanExamId,
      courseId: cleanExamId,
      course: examObj?.name || cleanExamId.toUpperCase(),
      subjectId: data.subjectId && data.subjectId !== 'all' ? data.subjectId : null,
      name: data.name.trim(),
      title: data.name.trim(),
      code,
      testType: data.testType,
      assessmentMethod: data.assessmentMethod || null,
      status: targetStatus,
      description: (data.description || '').trim(),
      instructions: Array.isArray(data.instructions) ? data.instructions : (data.instructions || '').trim(),
      scheduling: {
        date: date || '',
        startTime: startTime || '',
        durationMinutes,
        timezone
      },
      date: date || 'Upcoming',
      time: startTime ? `${startTime} IST` : '18:00 IST',
      duration: `${durationMinutes} mins`,
      durationMinutes,
      durationSeconds: durationMinutes * 60,
      formattedWindow: date && startTime ? `${date} • ${startTime} IST` : 'Upcoming Schedule',
      targetQuestions,
      cohort: data.cohort || data.batchTier || 'All Enrolled Candidates',
      batch: data.cohort || data.batchTier || 'All Enrolled Candidates',
      batchTier: data.cohort || data.batchTier || 'All Enrolled Candidates',
      totalQuestions: derivedCount || targetQuestions,
      questionCount: derivedCount,
      totalMarks: Number(data.totalMarks) || (targetQuestions * 5),
      passingScore: 50,
      negativeMarking: true,
      marksPerCorrect: 5,
      marksPerIncorrect: -1,
      marksUnanswered: 0,
      questions: [],
      content: {
        questionIds: initialQuestionIds,
        questionCount: derivedCount
      },
      questionIds: initialQuestionIds,
      // Phase 2: Test Structure Builder (default normalized structure)
      structure: createDefaultTestStructure({ testType: data.testType }),
      questionTypeConfig: { ...DEFAULT_TEST_QUESTION_TYPE_CONFIG },
      createdAt: now,
      updatedAt: now
    };

    this.tests = [newTest, ...this.tests];
    this.saveTests();
    return newTest;
  }

  updateFacultyTest(id, patch, requestingFaculty = null) {
    const faculty = requestingFaculty || peopleService.getCurrentFacultyProfile();
    const index = this.tests.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Faculty Test with ID "${id}" not found.`);
    }

    const existing = this.tests[index];

    // Validate ownership
    if (existing.facultyId && faculty && existing.facultyId !== faculty.id) {
      throw new Error(`Unauthorized: Cannot edit another faculty member's test.`);
    }

    // Lifecycle guard: only DRAFT and UPCOMING can be edited
    const currentStatus = getNormalizedFacultyStatus(existing);
    if (currentStatus === FACULTY_TEST_STATUS.LIVE || currentStatus === FACULTY_TEST_STATUS.COMPLETED) {
      throw new Error(`Cannot edit test in ${currentStatus} status. Active and completed assessments are read-only.`);
    }
    if (currentStatus === FACULTY_TEST_STATUS.CANCELLED) {
      throw new Error(`Cannot edit a cancelled assessment.`);
    }

    // Validate Exam assignment
    const effectiveExamId = (patch.examId || existing.examId || existing.examTrack).trim();
    const assignedExams = faculty ? (faculty.assignedExams || []) : [effectiveExamId];
    if (!assignedExams.includes(effectiveExamId)) {
      throw new Error(`Unauthorized: Faculty is not assigned to Exam "${effectiveExamId}".`);
    }

    // Validate Subject
    const effectiveSubjectId = patch.subjectId !== undefined ? patch.subjectId : existing.subjectId;
    if (effectiveSubjectId && effectiveSubjectId !== 'all') {
      const subjectsForExam = curriculumService.getSubjects(effectiveExamId);
      if (!subjectsForExam.some(s => s.id === effectiveSubjectId)) {
        throw new Error(`Selected subject "${effectiveSubjectId}" does not belong to exam "${effectiveExamId}".`);
      }
    }

    // Validate Test Type
    if (patch.testType) {
      const validTypes = FACULTY_TEST_TYPES.map(t => t.value);
      if (!validTypes.includes(patch.testType)) {
        throw new Error(`Invalid Test Type "${patch.testType}". Must be one of: ${validTypes.join(', ')}.`);
      }
    }

    // Validate Assessment Method if provided
    if (patch.assessmentMethod !== undefined && patch.assessmentMethod !== null && patch.assessmentMethod !== '') {
      const v = validateAssessmentMethod(patch.assessmentMethod);
      if (!v.valid) {
        throw new Error(v.errors[0]?.message || 'Select a valid assessment method.');
      }
    }

    const now = new Date().toISOString();
    const date = (patch.scheduling?.date ?? patch.date ?? existing.scheduling?.date ?? existing.date ?? '').trim();
    const startTime = (patch.scheduling?.startTime ?? patch.startTime ?? patch.time ?? existing.scheduling?.startTime ?? existing.time ?? '').trim().replace(' IST', '');
    const durationMinutes = Number(patch.scheduling?.durationMinutes ?? patch.durationMinutes ?? existing.scheduling?.durationMinutes ?? existing.durationMinutes) || 45;
    const timezone = patch.scheduling?.timezone ?? patch.timezone ?? existing.scheduling?.timezone ?? 'Asia/Kolkata';

    let targetStatus = existing.status;
    if (patch.status) {
      const norm = patch.status.toUpperCase();
      if (norm === 'UPCOMING') {
        if (!date || !startTime) {
          throw new Error('Date and Start Time are required to schedule as Upcoming.');
        }
        targetStatus = FACULTY_TEST_STATUS.UPCOMING;
      } else if (norm === 'DRAFT') {
        targetStatus = FACULTY_TEST_STATUS.DRAFT;
      } else if (norm === 'CANCELLED') {
        targetStatus = FACULTY_TEST_STATUS.CANCELLED;
      }
    }

    const examObj = catalogService.getExamById(effectiveExamId);

    const updated = {
      ...existing,
      name: patch.name ? patch.name.trim() : existing.name,
      title: patch.name ? patch.name.trim() : existing.title,
      examId: effectiveExamId,
      examTrack: effectiveExamId,
      courseId: effectiveExamId,
      course: examObj?.name || existing.course,
      subjectId: effectiveSubjectId && effectiveSubjectId !== 'all' ? effectiveSubjectId : null,
      testType: patch.testType || existing.testType || 'SUBJECT_TEST',
      assessmentMethod: patch.assessmentMethod !== undefined ? (patch.assessmentMethod || null) : (existing.assessmentMethod || null),
      status: targetStatus,
      description: patch.description !== undefined ? patch.description.trim() : existing.description,
      instructions: patch.instructions !== undefined ? patch.instructions : existing.instructions,
      cohort: patch.cohort || patch.batchTier || existing.cohort || existing.batchTier,
      batch: patch.cohort || patch.batchTier || existing.batch || existing.batchTier,
      batchTier: patch.cohort || patch.batchTier || existing.batchTier || existing.batch,
      scheduling: {
        date,
        startTime,
        durationMinutes,
        timezone
      },
      date: date || existing.date,
      time: startTime ? `${startTime} IST` : existing.time,
      duration: `${durationMinutes} mins`,
      durationMinutes,
      durationSeconds: durationMinutes * 60,
      formattedWindow: date && startTime ? `${date} • ${startTime} IST` : existing.formattedWindow,
      // IMMUTABLE PRESERVED FIELDS
      id: existing.id,
      code: existing.code,
      facultyId: existing.facultyId || faculty?.id,
      facultyName: existing.facultyName || faculty?.name,
      updatedAt: now
    };

    this.tests[index] = updated;
    this.saveTests();
    return updated;
  }

  duplicateFacultyTest(id, requestingFaculty = null) {
    const faculty = requestingFaculty || peopleService.getCurrentFacultyProfile();
    const source = this.getTestById(id);
    if (!source) {
      throw new Error(`Source test with ID "${id}" not found.`);
    }

    const assignedExams = faculty ? (faculty.assignedExams || []) : [source.examId || source.examTrack];
    const testExam = source.examId || source.examTrack;
    if (!assignedExams.includes(testExam)) {
      throw new Error(`Unauthorized: Cannot duplicate test for unassigned exam "${testExam}".`);
    }

    const now = new Date().toISOString();
    const newId = `ft-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newCode = generateFacultyTestCode(this.tests);

    const sourceQuestionIds = Array.isArray(source.content?.questionIds)
      ? source.content.questionIds
      : (Array.isArray(source.questionIds) ? source.questionIds : []);
    const uniqueQIds = Array.from(new Set(sourceQuestionIds));

    const sourceStructure = source.structure || createDefaultTestStructure(source);
    const clonedStructure = {
      ...JSON.parse(JSON.stringify(sourceStructure)),
      units: (sourceStructure.units || []).map(u => ({
        ...u,
        id: generateUnitId(),
        configuration: normalizeUnitConfiguration(u.configuration)
      }))
    };

    const duplicated = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      name: `${source.name || source.title} (Copy)`,
      title: `${source.name || source.title} (Copy)`,
      code: newCode,
      facultyId: faculty.id,
      facultyName: faculty.name,
      status: FACULTY_TEST_STATUS.DRAFT,
      structure: clonedStructure,
      questionTypeConfig: source.questionTypeConfig
        ? JSON.parse(JSON.stringify(source.questionTypeConfig))
        : { ...DEFAULT_TEST_QUESTION_TYPE_CONFIG },
      // Reset scheduling
      scheduling: {
        date: '',
        startTime: '',
        durationMinutes: source.durationMinutes || 45,
        timezone: 'Asia/Kolkata'
      },
      date: 'Upcoming',
      time: '18:00 IST',
      formattedWindow: 'Draft Schedule',
      createdAt: now,
      updatedAt: now,
      // Do NOT copy student attempts, results, or execution state
      attempts: undefined,
      results: undefined,
      submissions: [],
      content: {
        questionIds: [...uniqueQIds],
        questionCount: uniqueQIds.length
      },
      questionIds: [...uniqueQIds],
      questionCount: uniqueQIds.length,
      totalQuestions: uniqueQIds.length,
      questions: []
    };
    delete duplicated.attempts;
    delete duplicated.results;

    this.tests = [duplicated, ...this.tests];
    this.saveTests();
    return duplicated;
  }

  cancelFacultyTest(id, requestingFaculty = null) {
    const faculty = requestingFaculty || peopleService.getCurrentFacultyProfile();
    const index = this.tests.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Test with ID "${id}" not found.`);
    }

    const existing = this.tests[index];
    const currentStatus = getNormalizedFacultyStatus(existing);
    if (currentStatus === FACULTY_TEST_STATUS.LIVE || currentStatus === FACULTY_TEST_STATUS.COMPLETED) {
      throw new Error(`Cannot cancel a test in ${currentStatus} status.`);
    }
    if (currentStatus === FACULTY_TEST_STATUS.CANCELLED) {
      return existing;
    }

    const updated = {
      ...existing,
      status: FACULTY_TEST_STATUS.CANCELLED,
      updatedAt: new Date().toISOString()
    };

    this.tests[index] = updated;
    this.saveTests();
    return updated;
  }

  /**
   * Phase 2: Content Assembly — Retrieves questions referenced by a Faculty Test.
   * @param {string} testId
   * @param {object|null} requestingFaculty
   * @returns {Array<object>}
   */
  getFacultyTestQuestions(testId, requestingFaculty = null) {
    const test = this.getTestById(testId);
    if (!test) {
      throw new Error(`Faculty Test with ID "${testId}" not found.`);
    }
    const faculty = requestingFaculty || peopleService.getCurrentFacultyProfile();
    if (test.facultyId && faculty && test.facultyId !== faculty.id) {
      throw new Error(`Unauthorized: Cannot access questions of another faculty member's test.`);
    }

    const qIds = Array.isArray(test.content?.questionIds)
      ? test.content.questionIds
      : (Array.isArray(test.questionIds) ? test.questionIds : []);

    return questionService.getQuestionsByIds(qIds);
  }

  /**
   * Phase 2: Content Assembly — Adds a single question to a Faculty Test.
   * @param {string} testId
   * @param {string|number} questionId
   * @param {object|null} requestingFaculty
   * @returns {object} Updated test
   */
  addQuestionToFacultyTest(testId, questionId, requestingFaculty = null) {
    return this.addQuestionsToFacultyTest(testId, [questionId], requestingFaculty);
  }

  /**
   * Phase 2: Content Assembly — Atomically adds multiple questions to a Faculty Test.
   * @param {string} testId
   * @param {Array<string|number>} questionIds
   * @param {object|null} requestingFaculty
   * @returns {object} Updated test
   */
  addQuestionsToFacultyTest(testId, questionIds, requestingFaculty = null) {
    const faculty = requestingFaculty || peopleService.getCurrentFacultyProfile();
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Faculty Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];

    // Ownership check
    if (test.facultyId && faculty && test.facultyId !== faculty.id) {
      throw new Error(`Unauthorized: Cannot edit another faculty member's test.`);
    }

    // Exam RBAC check
    const testExam = test.examId || test.examTrack || test.courseId;
    const assignedExams = faculty ? (faculty.assignedExams || []) : [testExam];
    if (!assignedExams.includes(testExam)) {
      throw new Error(`Unauthorized: Faculty is not assigned to Exam "${testExam}".`);
    }

    // Lifecycle guard: only DRAFT and UPCOMING are editable
    const currentStatus = getNormalizedFacultyStatus(test);
    if (currentStatus === FACULTY_TEST_STATUS.LIVE) {
      throw new Error('This Test is no longer editable because it is currently Live.');
    }
    if (currentStatus === FACULTY_TEST_STATUS.COMPLETED) {
      throw new Error('This Test is no longer editable because it is Completed.');
    }
    if (currentStatus === FACULTY_TEST_STATUS.CANCELLED) {
      throw new Error('This Test is no longer editable because it is Cancelled.');
    }

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      throw new Error('No question IDs provided to add.');
    }

    // Check for duplicates within input
    const inputSet = new Set(questionIds.map(String));
    if (inputSet.size !== questionIds.length) {
      throw new Error('DUPLICATE_QUESTION: Input contains duplicate question IDs.');
    }

    const currentQIds = Array.isArray(test.content?.questionIds)
      ? [...test.content.questionIds]
      : (Array.isArray(test.questionIds) ? [...test.questionIds] : []);

    const existingSet = new Set(currentQIds.map(String));

    // Atomic pre-validation of all questions before any mutation
    const validQuestionsToAdd = [];
    for (const rawId of questionIds) {
      const qId = String(rawId);
      if (existingSet.has(qId)) {
        throw new Error(`DUPLICATE_QUESTION: Question "${qId}" is already attached to this test.`);
      }

      const q = questionService.getQuestionById(qId);
      if (!q) {
        throw new Error(`INVALID_QUESTION_REFERENCE: Question "${qId}" not found in Question Bank.`);
      }

      const comp = checkQuestionCompatibility(q, test);
      if (!comp.compatible) {
        throw new Error(`${comp.error}: Question "${qId}" is incompatible with test scope.`);
      }

      validQuestionsToAdd.push(qId);
    }

    // Apply mutation
    const updatedQIds = [...currentQIds, ...validQuestionsToAdd];
    const now = new Date().toISOString();

    const updated = {
      ...test,
      content: {
        questionIds: updatedQIds,
        questionCount: updatedQIds.length
      },
      questionIds: updatedQIds,
      questionCount: updatedQIds.length,
      totalQuestions: updatedQIds.length,
      updatedAt: now
    };

    this.tests[index] = updated;
    this.saveTests();
    return updated;
  }

  /**
   * Phase 2: Content Assembly — Removes a question reference from a Faculty Test.
   * Does NOT delete the question from the Question Bank (questionService).
   * @param {string} testId
   * @param {string|number} questionId
   * @param {object|null} requestingFaculty
   * @returns {object} Updated test
   */
  removeQuestionFromFacultyTest(testId, questionId, requestingFaculty = null) {
    const faculty = requestingFaculty || peopleService.getCurrentFacultyProfile();
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Faculty Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];

    // Ownership check
    if (test.facultyId && faculty && test.facultyId !== faculty.id) {
      throw new Error(`Unauthorized: Cannot edit another faculty member's test.`);
    }

    // Lifecycle guard
    const currentStatus = getNormalizedFacultyStatus(test);
    if (currentStatus === FACULTY_TEST_STATUS.LIVE || currentStatus === FACULTY_TEST_STATUS.COMPLETED || currentStatus === FACULTY_TEST_STATUS.CANCELLED) {
      throw new Error(`This Test is no longer editable because it is in ${currentStatus} status.`);
    }

    const currentQIds = Array.isArray(test.content?.questionIds)
      ? test.content.questionIds
      : (Array.isArray(test.questionIds) ? test.questionIds : []);

    const targetId = String(questionId);
    const updatedQIds = currentQIds.filter(id => String(id) !== targetId);

    const now = new Date().toISOString();
    const updated = {
      ...test,
      content: {
        questionIds: updatedQIds,
        questionCount: updatedQIds.length
      },
      questionIds: updatedQIds,
      questionCount: updatedQIds.length,
      totalQuestions: updatedQIds.length,
      updatedAt: now
    };

    this.tests[index] = updated;
    this.saveTests();
    return updated;
  }

  /**
   * Phase 2: Content Assembly — Reorders questions in a Faculty Test.
   * Enforces exact set permutation check so reordering cannot silently add or remove questions.
   * @param {string} testId
   * @param {Array<string|number>} questionIds
   * @param {object|null} requestingFaculty
   * @returns {object} Updated test
   */
  reorderFacultyTestQuestions(testId, questionIds, requestingFaculty = null) {
    const faculty = requestingFaculty || peopleService.getCurrentFacultyProfile();
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Faculty Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];

    // Ownership check
    if (test.facultyId && faculty && test.facultyId !== faculty.id) {
      throw new Error(`Unauthorized: Cannot edit another faculty member's test.`);
    }

    // Lifecycle guard
    const currentStatus = getNormalizedFacultyStatus(test);
    if (currentStatus === FACULTY_TEST_STATUS.LIVE || currentStatus === FACULTY_TEST_STATUS.COMPLETED || currentStatus === FACULTY_TEST_STATUS.CANCELLED) {
      throw new Error(`This Test is no longer editable because it is in ${currentStatus} status.`);
    }

    if (!Array.isArray(questionIds)) {
      throw new Error('INVALID_REORDER: Question IDs must be an array.');
    }

    const currentQIds = (test.content?.questionIds || test.questionIds || []).map(String);
    const newQIds = questionIds.map(String);

    if (currentQIds.length !== newQIds.length) {
      throw new Error('INVALID_REORDER: Submitted question count does not match current test question count.');
    }

    const currentSet = new Set(currentQIds);
    const newSet = new Set(newQIds);

    if (newSet.size !== newQIds.length) {
      throw new Error('INVALID_REORDER: Duplicate IDs found in reorder list.');
    }

    for (const id of newQIds) {
      if (!currentSet.has(id)) {
        throw new Error(`INVALID_REORDER: Submitted ID "${id}" is not part of the current test questions.`);
      }
    }

    const now = new Date().toISOString();
    const updated = {
      ...test,
      content: {
        questionIds: newQIds,
        questionCount: newQIds.length
      },
      questionIds: newQIds,
      questionCount: newQIds.length,
      totalQuestions: newQIds.length,
      updatedAt: now
    };

    this.tests[index] = updated;
    this.saveTests();
    return updated;
  }

  /**
   * Phase 2: Content Assembly — Validates test question content integrity and target criteria.
   * @param {string} testId
   * @param {object|null} requestingFaculty
   * @returns {{ valid: boolean, questionCount: number, errors: string[], warnings: string[] }}
   */
  validateFacultyTestContent(testId, requestingFaculty = null) {
    const test = this.getTestById(testId);
    if (!test) {
      return {
        valid: false,
        questionCount: 0,
        errors: ['TEST_NOT_FOUND'],
        warnings: []
      };
    }

    const errors = [];
    const warnings = [];

    const qIds = Array.isArray(test.content?.questionIds)
      ? test.content.questionIds
      : (Array.isArray(test.questionIds) ? test.questionIds : []);

    if (qIds.length === 0) {
      errors.push('NO_QUESTIONS');
    } else {
      for (const qId of qIds) {
        const q = questionService.getQuestionById(qId);
        if (!q) {
          errors.push(`INVALID_QUESTION_REFERENCE: Question "${qId}" not found in Question Bank.`);
          continue;
        }
        const comp = checkQuestionCompatibility(q, test);
        if (!comp.compatible) {
          errors.push(`${comp.error}: Question "${qId}" is incompatible with test scope.`);
        }

        // Phase 4: Non-blocking warning if question type is not permitted by test questionTypeConfig
        if (test.questionTypeConfig && Array.isArray(test.questionTypeConfig.allowedTypes) && test.questionTypeConfig.allowedTypes.length > 0) {
          const canonType = questionTypeService.normalizeQuestionTypeId(q.type);
          const normalizedAllowed = questionTypeService.normalizeQuestionTypeIds(test.questionTypeConfig.allowedTypes);
          if (canonType && !normalizedAllowed.includes(canonType)) {
            warnings.push(`QUESTION_TYPE_NOT_ALLOWED: Question "${qId}" has type "${q.type}" which is not currently allowed by this Test configuration.`);
          }
        }
      }
    }

    const target = test.targetQuestions;
    if (target && qIds.length !== target) {
      const diff = Math.abs(target - qIds.length);
      if (qIds.length < target) {
        warnings.push(`Target: ${target} questions. Selected: ${qIds.length} questions. ${diff} more questions are needed to reach the target.`);
      } else {
        warnings.push(`Target: ${target} questions. Selected: ${qIds.length} questions. ${diff} questions over target.`);
      }
    }

    return {
      valid: errors.length === 0,
      questionCount: qIds.length,
      errors,
      warnings
    };
  }

  // ---------------------------------------------------------------------------
  // PHASE 4: RULES — BLUEPRINT + SCORING + TIMING + NAVIGATION (FACULTY)
  // ---------------------------------------------------------------------------

  /**
   * Phase 4: Retrieves Rules configuration for a Faculty Test.
   * Returns test.rules if present, otherwise returns null (caller creates defaults).
   * @param {string} testId
   * @param {object|null} requestingFaculty
   * @returns {object|null}
   */
  getFacultyTestRules(testId, requestingFaculty = null) {
    const test = this.getTestById(testId);
    if (!test) throw new Error(`Faculty test "${testId}" not found.`);
    return test.rules ? JSON.parse(JSON.stringify(test.rules)) : null;
  }

  /**
   * Phase 4: Saves Rules configuration for a Faculty Test.
   * Validates faculty ownership scope before persisting.
   * @param {string} testId
   * @param {object} rules - Full rules object
   * @param {object|null} requestingFaculty
   * @returns {object} updated test
   */
  saveFacultyTestRules(testId, rules, requestingFaculty = null) {
    const faculty = requestingFaculty || peopleService.getCurrentFacultyProfile();

    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) throw new Error(`Faculty test "${testId}" not found.`);

    const test = this.tests[index];

    // Ownership scope check: faculty must belong to the test's exam track
    if (faculty) {
      const assignedExams = faculty.assignedExams || [];
      const testExam = test.examId || test.examTrack || test.courseId;
      if (testExam && testExam !== 'all' && assignedExams.length > 0 && !assignedExams.includes(testExam)) {
        throw new Error(`Unauthorized: Faculty is not assigned to exam "${testExam}".`);
      }
    }

    const updated = {
      ...test,
      rules: { ...rules },
      updatedAt: new Date().toISOString()
    };

    this.tests[index] = updated;
    this.saveTests();
    return JSON.parse(JSON.stringify(updated));
  }

  getFacultyScopedTests(filters = {}, requestingFaculty = null) {
    const faculty = requestingFaculty || peopleService.getCurrentFacultyProfile();
    const assignedExams = faculty?.assignedExams || ['neet-pg', 'usmle', 'plab'];

    let result = this.tests.filter(t => {
      const exam = t.examId || t.examTrack || t.courseId;
      return !exam || exam === 'all' || assignedExams.includes(exam);
    });

    if (filters.examId && filters.examId !== 'all') {
      result = result.filter(t => (t.examId || t.examTrack || t.courseId) === filters.examId);
    }

    if (filters.subjectId && filters.subjectId !== 'all') {
      result = result.filter(t => t.subjectId === filters.subjectId);
    }

    if (filters.testType && filters.testType !== 'all') {
      result = result.filter(t => t.testType === filters.testType);
    }

    if (filters.status && filters.status !== 'all') {
      const target = filters.status.toUpperCase();
      result = result.filter(t => getNormalizedFacultyStatus(t) === target);
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(t => (t.name || t.title || '').toLowerCase().includes(q));
    }

    return result;
  }

  getFacultySummaryStats(requestingFaculty = null) {
    const scopedTests = this.getFacultyScopedTests({}, requestingFaculty);
    const total = scopedTests.length;
    let draft = 0;
    let upcoming = 0;
    let live = 0;
    let completed = 0;
    let cancelled = 0;

    scopedTests.forEach(t => {
      const st = getNormalizedFacultyStatus(t);
      if (st === FACULTY_TEST_STATUS.DRAFT) draft++;
      else if (st === FACULTY_TEST_STATUS.UPCOMING) upcoming++;
      else if (st === FACULTY_TEST_STATUS.LIVE) live++;
      else if (st === FACULTY_TEST_STATUS.COMPLETED) completed++;
      else if (st === FACULTY_TEST_STATUS.CANCELLED) cancelled++;
    });

    return {
      total,
      draft,
      upcoming,
      live,
      completed,
      cancelled
    };
  }

  // ---------------------------------------------------------------------------
  // PHASE 2: FACULTY TEST STRUCTURE BUILDER METHODS
  // ---------------------------------------------------------------------------

  /**
   * Helper to verify faculty ownership and exam assignment scope.
   * Throws Unauthorized if faculty does not have access.
   */
  _verifyFacultyTestAccess(test, requestingFaculty = null) {
    const faculty = requestingFaculty || peopleService.getCurrentFacultyProfile();
    if (test.facultyId && faculty && test.facultyId !== faculty.id) {
      throw new Error(`Unauthorized: Cannot access another faculty member's test.`);
    }

    const testExam = test.examId || test.examTrack || test.courseId;
    const assignedExams = faculty ? (faculty.assignedExams || []) : (testExam ? [testExam] : []);
    if (testExam && !assignedExams.includes(testExam)) {
      throw new Error(`Unauthorized: Faculty is not assigned to Exam "${testExam}".`);
    }

    return faculty;
  }

  /**
   * Helper to verify test is in an editable lifecycle state for structure modifications.
   * Editable: DRAFT, UPCOMING.
   * Locked: LIVE, COMPLETED, CANCELLED.
   */
  _verifyFacultyStructureEditable(test) {
    const currentStatus = getNormalizedFacultyStatus(test);
    if (currentStatus === FACULTY_TEST_STATUS.LIVE || currentStatus === FACULTY_TEST_STATUS.COMPLETED || currentStatus === FACULTY_TEST_STATUS.CANCELLED) {
      throw new Error(`LIFECYCLE_LOCKED: Test structure cannot be modified while status is "${currentStatus}". Structure is editable only in DRAFT and UPCOMING.`);
    }
  }

  /**
   * Phase 2: Test Structure Builder — Retrieves structure for a Faculty Test.
   * Auto-initializes legacy tests missing structure safely without mutating other fields.
   */
  /**
   * Phase 2: Get Exam Pattern / Stage for a Faculty Test.
   */
  getFacultyTestExamPattern(testId, requestingFaculty = null) {
    const test = this.getTestById(testId);
    if (!test) throw new Error(`Faculty Test with ID "${testId}" not found.`);
    this._verifyFacultyTestAccess(test, requestingFaculty);
    return test.examPattern || null;
  }

  /**
   * Phase 2: Update Exam Pattern / Stage for a Faculty Test.
   */
  updateFacultyTestExamPattern(testId, examPattern, requestingFaculty = null) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) throw new Error(`Faculty Test with ID "${testId}" not found.`);

    const test = this.tests[index];
    this._verifyFacultyTestAccess(test, requestingFaculty);
    this._verifyFacultyStructureEditable(test);

    if (!examPattern || !examPattern.stageId) {
      throw new Error('INVALID_STAGE: A valid Exam Stage must be selected.');
    }

    const testExam = test.examId || test.examTrack || test.courseId;
    const stages = getExamStages(testExam);
    const validStage = stages.find(s => s.id === examPattern.stageId);
    if (!validStage) {
      throw new Error(`INVALID_STAGE: Stage "${examPattern.stageId}" does not belong to Exam "${testExam}".`);
    }

    const now = new Date().toISOString();
    const updated = {
      ...test,
      examPattern: {
        patternId: examPattern.patternId || validStage.patternId || null,
        stageId: validStage.id,
        stageName: validStage.name
      },
      updatedAt: now
    };

    // Filter out invalid subjects in curriculumScope if stage changed
    if (updated.curriculumScope && Array.isArray(updated.curriculumScope.subjects)) {
      const allowedSubjects = getStageSubjects(testExam, validStage.id);
      const allowedSubjectIds = new Set(allowedSubjects.map(s => s.id));
      const filteredSubjects = updated.curriculumScope.subjects.filter(sub => allowedSubjectIds.has(sub.subjectId));
      updated.curriculumScope = {
        ...updated.curriculumScope,
        subjects: filteredSubjects
      };
    }

    this.tests[index] = updated;
    this.saveTests();
    return updated.examPattern;
  }

  /**
   * Phase 2: Get Curriculum Scope for a Faculty Test.
   */
  getFacultyTestCurriculumScope(testId, requestingFaculty = null) {
    const test = this.getTestById(testId);
    if (!test) throw new Error(`Faculty Test with ID "${testId}" not found.`);
    this._verifyFacultyTestAccess(test, requestingFaculty);
    return test.curriculumScope || null;
  }

  /**
   * Phase 2: Update Curriculum Scope for a Faculty Test with RBAC.
   * Faculty is strictly restricted to their assigned subjects.
   */
  updateFacultyTestCurriculumScope(testId, curriculumScope, requestingFaculty = null) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) throw new Error(`Faculty Test with ID "${testId}" not found.`);

    const test = this.tests[index];
    const faculty = this._verifyFacultyTestAccess(test, requestingFaculty);
    this._verifyFacultyStructureEditable(test);

    const stageId = test.examPattern?.stageId;
    if (!stageId) {
      throw new Error('STAGE_REQUIRED: An Exam Stage must be selected in Step 1 before defining Curriculum Scope.');
    }

    const testExam = test.examId || test.examTrack || test.courseId;
    const validation = validateCurriculumScope(curriculumScope, testExam, stageId, faculty?.assignedSubjects);
    if (!validation.valid) {
      const firstError = validation.errors[0];
      throw new Error(`${firstError.code}: ${firstError.message}`);
    }

    const now = new Date().toISOString();
    const updated = {
      ...test,
      curriculumScope: validation.normalizedScope,
      updatedAt: now
    };

    this.tests[index] = updated;
    this.saveTests();
    return updated.curriculumScope;
  }

  /**
   * Phase 2: Check if Faculty test structure is ready
   */
  isFacultyStructureReady(testId, requestingFaculty = null) {
    const test = this.getTestById(testId);
    if (!test) return false;
    this._verifyFacultyTestAccess(test, requestingFaculty);
    return isStructureReady(test);
  }

  /**
   * Phase 2: Test Structure Builder — Retrieves structure for a Faculty Test.
   * Auto-initializes legacy tests missing structure safely without mutating other fields.
   */
  getFacultyTestStructure(testId, requestingFaculty = null) {
    const test = this.getTestById(testId);
    if (!test) {
      throw new Error(`Faculty Test with ID "${testId}" not found.`);
    }

    this._verifyFacultyTestAccess(test, requestingFaculty);

    if (!test.structure || (!Array.isArray(test.structure.units) && !Array.isArray(test.structure.sections))) {
      test.structure = createDefaultTestStructure(test);
      this.saveTests();
    } else {
      const normalized = normalizeTestStructure(test.structure);
      test.structure = normalized;
      this.saveTests();
    }

    return JSON.parse(JSON.stringify(test.structure));
  }

  /**
   * Phase 2: Test Structure Builder — Updates full structure for a Faculty Test.
   * Enforces Ownership, Exam Assignment, Faculty Subject Scope Isolation, and Lifecycle Guards.
   */
  updateFacultyTestStructure(testId, candidateStructure, requestingFaculty = null) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Faculty Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];
    const faculty = this._verifyFacultyTestAccess(test, requestingFaculty);
    this._verifyFacultyStructureEditable(test);

    const testExam = test.examId || test.examTrack || test.courseId;
    const stageId = test.examPattern?.stageId || null;
    const curriculumScope = test.curriculumScope || null;
    const testAllowedTypes = (test.questionTypeConfig && test.questionTypeConfig.allowedTypes) || null;

    const validation = validateTestStructureHierarchy(
      candidateStructure,
      testExam,
      stageId,
      curriculumScope,
      faculty?.assignedSubjects,
      testAllowedTypes
    );
    if (!validation.valid) {
      const firstError = validation.errors[0];
      throw new Error(`${firstError.code}: ${firstError.message}`);
    }

    const normalizedStructure = normalizeTestStructure(candidateStructure);

    const updated = {
      ...test,
      structure: normalizedStructure,
      updatedAt: new Date().toISOString()
    };

    this.tests[index] = updated;
    this.saveTests();
    return normalizedStructure;
  }

  /**
   * Phase 2: Test Structure Builder — Adds a new unit to a Faculty Test.
   */
  addFacultyTestStructureUnit(testId, unitData, requestingFaculty = null) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Faculty Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];
    const faculty = this._verifyFacultyTestAccess(test, requestingFaculty);
    this._verifyFacultyStructureEditable(test);

    if (!test.structure || !Array.isArray(test.structure.units) || test.structure.units.length === 0) {
      test.structure = createDefaultTestStructure(test);
    }

    if (!unitData || !unitData.name || !unitData.name.trim()) {
      throw new Error('EMPTY_UNIT_NAME: Unit name cannot be empty.');
    }

    const newUnit = {
      id: unitData.id || generateUnitId(),
      name: unitData.name.trim(),
      code: (unitData.code || '').trim().toUpperCase(),
      order: test.structure.units.length,
      description: (unitData.description || '').trim(),
      examMapping: unitData.examMapping || { type: null, id: null },
      configuration: normalizeUnitConfiguration(unitData.configuration)
    };

    const newUnits = [...test.structure.units, newUnit];
    const candidateMode = newUnits.length > 1 ? STRUCTURE_MODES.MULTI_UNIT : test.structure.mode;

    const candidateStructure = {
      mode: candidateMode,
      unitType: test.structure.unitType || UNIT_TYPES.SECTION,
      units: newUnits
    };

    const testExam = test.examId || test.examTrack || test.courseId;
    const validation = validateStructure(candidateStructure, testExam, faculty?.assignedSubjects);
    if (!validation.valid) {
      const firstError = validation.errors[0];
      throw new Error(`${firstError.code}: ${firstError.message}`);
    }

    const updated = {
      ...test,
      structure: candidateStructure,
      updatedAt: new Date().toISOString()
    };

    this.tests[index] = updated;
    this.saveTests();
    return newUnit;
  }

  /**
   * Phase 2: Test Structure Builder — Updates an existing unit in a Faculty Test.
   */
  updateFacultyTestStructureUnit(testId, unitId, updates, requestingFaculty = null) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Faculty Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];
    const faculty = this._verifyFacultyTestAccess(test, requestingFaculty);
    this._verifyFacultyStructureEditable(test);

    if (!test.structure || !Array.isArray(test.structure.units)) {
      test.structure = createDefaultTestStructure(test);
    }

    const uIndex = test.structure.units.findIndex(u => u.id === unitId);
    if (uIndex === -1) {
      throw new Error(`Unit with ID "${unitId}" not found in test.`);
    }

    const existingUnit = test.structure.units[uIndex];
    const updatedUnit = {
      ...existingUnit,
      name: updates.name !== undefined ? updates.name.trim() : existingUnit.name,
      code: updates.code !== undefined ? updates.code.trim().toUpperCase() : existingUnit.code,
      description: updates.description !== undefined ? updates.description.trim() : existingUnit.description,
      examMapping: updates.examMapping !== undefined ? updates.examMapping : existingUnit.examMapping,
      configuration: updates.configuration !== undefined 
        ? normalizeUnitConfiguration({ ...(existingUnit.configuration || {}), ...updates.configuration })
        : normalizeUnitConfiguration(existingUnit.configuration),
      id: existingUnit.id,
      order: existingUnit.order
    };

    const updatedUnits = [...test.structure.units];
    updatedUnits[uIndex] = updatedUnit;

    const candidateStructure = {
      ...test.structure,
      units: updatedUnits
    };

    const testExam = test.examId || test.examTrack || test.courseId;
    const validation = validateStructure(candidateStructure, testExam, faculty?.assignedSubjects);
    if (!validation.valid) {
      const firstError = validation.errors[0];
      throw new Error(`${firstError.code}: ${firstError.message}`);
    }

    const updated = {
      ...test,
      structure: candidateStructure,
      updatedAt: new Date().toISOString()
    };

    this.tests[index] = updated;
    this.saveTests();
    return updatedUnit;
  }

  /**
   * Phase 2: Test Structure Builder — Removes a unit from a Faculty Test.
   * Strictly preserves test.content.questionIds!
   */
  removeFacultyTestStructureUnit(testId, unitId, requestingFaculty = null) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Faculty Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];
    this._verifyFacultyTestAccess(test, requestingFaculty);
    this._verifyFacultyStructureEditable(test);

    if (!test.structure || !Array.isArray(test.structure.units)) {
      test.structure = createDefaultTestStructure(test);
    }

    if (test.structure.units.length <= 1) {
      throw new Error('CANNOT_DELETE_LAST_UNIT: Test must contain at least one structure unit.');
    }

    const targetExists = test.structure.units.some(u => u.id === unitId);
    if (!targetExists) {
      throw new Error(`Unit with ID "${unitId}" not found in test.`);
    }

    // Filter and re-index sequentially while keeping remaining unit IDs stable
    const remainingUnits = test.structure.units
      .filter(u => u.id !== unitId)
      .map((u, idx) => ({ ...u, order: idx }));

    const updatedStructure = {
      ...test.structure,
      mode: remainingUnits.length === 1 ? STRUCTURE_MODES.SINGLE_UNIT : test.structure.mode,
      units: remainingUnits
    };

    const updated = {
      ...test,
      structure: updatedStructure,
      updatedAt: new Date().toISOString()
    };

    this.tests[index] = updated;
    this.saveTests();
    return true;
  }

  /**
   * Phase 2: Test Structure Builder — Reorders units in a Faculty Test.
   * Preserves stable unit IDs; only updates `order`.
   */
  reorderFacultyTestStructureUnits(testId, orderedUnitIds, requestingFaculty = null) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Faculty Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];
    this._verifyFacultyTestAccess(test, requestingFaculty);
    this._verifyFacultyStructureEditable(test);

    if (!test.structure || !Array.isArray(test.structure.units)) {
      test.structure = createDefaultTestStructure(test);
    }

    const currentUnits = test.structure.units;
    if (!Array.isArray(orderedUnitIds) || orderedUnitIds.length !== currentUnits.length) {
      throw new Error('INVALID_ORDER: Submitted unit order does not match existing units count.');
    }

    const currentIdSet = new Set(currentUnits.map(u => u.id));
    const newIdSet = new Set(orderedUnitIds);
    if (newIdSet.size !== orderedUnitIds.length || ![...newIdSet].every(id => currentIdSet.has(id))) {
      throw new Error('INVALID_ORDER: Permutation mismatch in reordered unit IDs.');
    }

    const unitMap = new Map(currentUnits.map(u => [u.id, u]));
    const reorderedUnits = orderedUnitIds.map((id, idx) => {
      const u = unitMap.get(id);
      return { ...u, order: idx };
    });

    const updatedStructure = {
      ...test.structure,
      units: reorderedUnits
    };

    const updated = {
      ...test,
      structure: updatedStructure,
      updatedAt: new Date().toISOString()
    };

    this.tests[index] = updated;
    this.saveTests();
    return reorderedUnits;
  }

  /**
   * Phase 2: Test Structure Builder — Validates a Faculty Test's structure.
   */
  validateFacultyTestStructure(testId, candidateStructure = null, requestingFaculty = null) {
    const test = this.getTestById(testId);
    if (!test) {
      return {
        valid: false,
        errors: [{ code: 'TEST_NOT_FOUND', message: `Test "${testId}" not found.` }],
        warnings: []
      };
    }

    const faculty = this._verifyFacultyTestAccess(test, requestingFaculty);
    const structure = candidateStructure || test.structure || createDefaultTestStructure(test);
    const testExam = test.examId || test.examTrack || test.courseId;
    return validateStructure(structure, testExam, faculty?.assignedSubjects);
  }

  // ---------------------------------------------------------------------------
  // PHASE 3: FACULTY SECTION / BLOCK CONFIGURATION METHODS
  // ---------------------------------------------------------------------------

  /**
   * Phase 3: Retrieves a unit's configuration for a Faculty Test.
   * Auto-initializes default configuration if absent.
   */
  getFacultyTestUnitConfiguration(testId, unitId, requestingFaculty = null) {
    const test = this.getTestById(testId);
    if (!test) {
      throw new Error(`Faculty Test with ID "${testId}" not found.`);
    }

    this._verifyFacultyTestAccess(test, requestingFaculty);

    if (!test.structure || !Array.isArray(test.structure.units) || test.structure.units.length === 0) {
      test.structure = createDefaultTestStructure(test);
      this.saveTests();
    }

    const unit = test.structure.units.find(u => u.id === unitId);
    if (!unit) {
      throw new Error(`INVALID_UNIT: Unit with ID "${unitId}" not found in test.`);
    }

    if (!unit.configuration) {
      unit.configuration = normalizeUnitConfiguration(unit.configuration);
      this.saveTests();
    }

    return JSON.parse(JSON.stringify(normalizeUnitConfiguration(unit.configuration)));
  }

  /**
   * Phase 3: Updates a unit's configuration for a Faculty Test.
   * Enforces:
   * 1. Ownership & Exam Assignment
   * 2. Lifecycle Guards (DRAFT, UPCOMING editable; LIVE, COMPLETED, CANCELLED locked)
   * 3. Faculty Subject Scope Isolation (only assigned subjects allowed)
   */
  updateFacultyTestUnitConfiguration(testId, unitId, configurationUpdates, requestingFaculty = null) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Faculty Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];
    const faculty = this._verifyFacultyTestAccess(test, requestingFaculty);
    this._verifyFacultyStructureEditable(test);

    if (!test.structure || !Array.isArray(test.structure.units)) {
      test.structure = createDefaultTestStructure(test);
    }

    const uIndex = test.structure.units.findIndex(u => u.id === unitId);
    if (uIndex === -1) {
      throw new Error(`INVALID_UNIT: Unit with ID "${unitId}" not found in test.`);
    }

    const currentUnit = test.structure.units[uIndex];
    const testExam = test.examId || test.examTrack || test.courseId;

    // Validate incoming updates before normalization
    const updateValidation = validateUnitConfiguration(configurationUpdates, testExam, faculty?.assignedSubjects);
    if (!updateValidation.valid) {
      const firstError = updateValidation.errors[0];
      throw new Error(`${firstError.code}: ${firstError.message}`);
    }

    const candidateConfig = normalizeUnitConfiguration({
      ...(currentUnit.configuration || DEFAULT_UNIT_CONFIGURATION),
      ...(configurationUpdates || {})
    });

    const validation = validateUnitConfiguration(candidateConfig, testExam, faculty?.assignedSubjects);
    if (!validation.valid) {
      const firstError = validation.errors[0];
      throw new Error(`${firstError.code}: ${firstError.message}`);
    }

    test.structure.units[uIndex].configuration = candidateConfig;
    test.updatedAt = new Date().toISOString();

    this.tests[index] = test;
    this.saveTests();
    return JSON.parse(JSON.stringify(candidateConfig));
  }

  /**
   * Phase 3: Sets subjects for a unit in a Faculty Test.
   */
  setFacultyTestUnitSubjects(testId, unitId, subjectIds, requestingFaculty = null) {
    return this.updateFacultyTestUnitConfiguration(testId, unitId, { subjectIds }, requestingFaculty);
  }

  /**
   * Phase 3: Validates a unit's configuration for a Faculty Test.
   */
  validateFacultyTestUnitConfiguration(testId, unitId, requestingFaculty = null) {
    const test = this.getTestById(testId);
    if (!test) {
      return {
        valid: false,
        errors: [{ code: 'TEST_NOT_FOUND', message: `Test "${testId}" not found.` }],
        warnings: []
      };
    }

    const faculty = this._verifyFacultyTestAccess(test, requestingFaculty);

    if (!test.structure || !Array.isArray(test.structure.units)) {
      return {
        valid: false,
        errors: [{ code: 'NO_STRUCTURE', message: 'Test has no structure units.' }],
        warnings: []
      };
    }

    const unit = test.structure.units.find(u => u.id === unitId);
    if (!unit) {
      return {
        valid: false,
        errors: [{ code: 'INVALID_UNIT', message: `Unit "${unitId}" not found.` }],
        warnings: []
      };
    }

    const testExam = test.examId || test.examTrack || test.courseId;
    const config = normalizeUnitConfiguration(unit.configuration);
    return validateUnitConfiguration(config, testExam, faculty?.assignedSubjects);
  }

  /**
   * Phase 3: Test-level configuration validator across all units for Faculty.
   */
  validateFacultyTestConfiguration(testId, requestingFaculty = null) {
    const test = this.getTestById(testId);
    if (!test) {
      return {
        valid: false,
        errors: [{ code: 'TEST_NOT_FOUND', message: `Test "${testId}" not found.` }],
        warnings: [],
        units: []
      };
    }

    const faculty = this._verifyFacultyTestAccess(test, requestingFaculty);
    const structure = test.structure || createDefaultTestStructure(test);
    const units = structure.units || [];
    const testExam = test.examId || test.examTrack || test.courseId;

    const unitReports = [];
    const allErrors = [];
    const allWarnings = [];

    units.forEach(u => {
      const config = normalizeUnitConfiguration(u.configuration);
      const res = validateUnitConfiguration(config, testExam, faculty?.assignedSubjects);

      const hasAssignedSubjects = Array.isArray(config.subjectIds) && config.subjectIds.length > 0;
      const hasQuestionCount = config.questionCount !== null && config.questionCount !== undefined;
      const isConfigured = res.valid && (hasAssignedSubjects || hasQuestionCount);

      if (!res.valid) {
        res.errors.forEach(err => {
          allErrors.push({ ...err, unitId: u.id, unitName: u.name });
        });
      }

      if (res.warnings && res.warnings.length > 0) {
        res.warnings.forEach(w => {
          allWarnings.push({ ...w, unitId: u.id, unitName: u.name });
        });
      }

      unitReports.push({
        unitId: u.id,
        unitName: u.name,
        code: u.code,
        valid: res.valid,
        isConfigured,
        errors: res.errors,
        warnings: res.warnings
      });
    });

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      units: unitReports
    };
  }

  // ---------------------------------------------------------------------------
  // PHASE 4: FACULTY QUESTION TYPE SYSTEM METHODS
  // ---------------------------------------------------------------------------

  /**
   * Phase 4: Retrieves Test-level Question Type configuration for a Faculty Test.
   * Auto-initializes if missing.
   * @param {string} testId
   * @param {object|null} requestingFaculty
   * @returns {object}
   */
  getFacultyTestQuestionTypeConfig(testId, requestingFaculty = null) {
    const test = this.getTestById(testId);
    if (!test) {
      throw new Error(`Faculty Test with ID "${testId}" not found.`);
    }

    this._verifyFacultyTestAccess(test, requestingFaculty);

    if (!test.questionTypeConfig) {
      test.questionTypeConfig = { ...DEFAULT_TEST_QUESTION_TYPE_CONFIG };
      this.saveTests();
    }

    return JSON.parse(JSON.stringify(test.questionTypeConfig));
  }

  /**
   * Phase 4: Updates Test-level Question Type configuration for a Faculty Test.
   * Enforces faculty ownership, exam scope, and lifecycle guards (DRAFT, UPCOMING allowed).
   * @param {string} testId
   * @param {object} configUpdates
   * @param {object|null} requestingFaculty
   * @returns {object}
   */
  updateFacultyTestQuestionTypeConfig(testId, configUpdates, requestingFaculty = null) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Faculty Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];
    this._verifyFacultyTestAccess(test, requestingFaculty);
    this._verifyFacultyStructureEditable(test);

    const testExam = test.examId || test.examTrack || test.courseId;
    const currentConfig = test.questionTypeConfig || DEFAULT_TEST_QUESTION_TYPE_CONFIG;
    const candidateConfig = {
      mode: configUpdates?.mode || currentConfig.mode || QUESTION_TYPE_INHERITANCE_MODES.EXPLICIT,
      allowedTypes: configUpdates?.allowedTypes !== undefined ? configUpdates.allowedTypes : currentConfig.allowedTypes
    };

    const validation = questionTypeService.validateTestQuestionTypeConfig(candidateConfig, testExam);
    if (!validation.valid) {
      const firstError = validation.errors[0];
      throw new Error(`${firstError.code}: ${firstError.message}`);
    }

    const normalizedTypes = questionTypeService.normalizeQuestionTypeIds(candidateConfig.allowedTypes);
    const finalConfig = {
      mode: candidateConfig.mode,
      allowedTypes: normalizedTypes
    };

    test.questionTypeConfig = finalConfig;
    test.updatedAt = new Date().toISOString();

    this.tests[index] = test;
    this.saveTests();
    return JSON.parse(JSON.stringify(finalConfig));
  }

  /**
   * Phase 4: Retrieves effective and configured Question Types for a specific Faculty unit.
   * @param {string} testId
   * @param {string} unitId
   * @param {object|null} requestingFaculty
   * @returns {object}
   */
  getFacultyUnitQuestionTypes(testId, unitId, requestingFaculty = null) {
    const test = this.getTestById(testId);
    if (!test) {
      throw new Error(`Faculty Test with ID "${testId}" not found.`);
    }

    this._verifyFacultyTestAccess(test, requestingFaculty);

    const structure = this.getFacultyTestStructure(testId, requestingFaculty);
    const unit = structure.units.find(u => u.id === unitId);
    if (!unit) {
      throw new Error(`INVALID_UNIT: Unit with ID "${unitId}" not found in test.`);
    }

    const testConfig = this.getFacultyTestQuestionTypeConfig(testId, requestingFaculty);
    const effectiveTypes = questionTypeService.resolveEffectiveUnitQuestionTypes(unit, testConfig);

    const unitConfig = unit.configuration || {};
    const qtConfig = unitConfig.questionTypeConfig || {
      mode: QUESTION_TYPE_INHERITANCE_MODES.INHERIT,
      allowedTypes: []
    };

    return {
      unitId,
      unitName: unit.name,
      mode: qtConfig.mode || QUESTION_TYPE_INHERITANCE_MODES.INHERIT,
      configuredTypes: Array.isArray(qtConfig.allowedTypes) ? [...qtConfig.allowedTypes] : [],
      effectiveTypes
    };
  }

  /**
   * Phase 4: Updates supported Question Types for a specific Faculty Section/Unit.
   * Enforces subset rule: section allowedTypes ⊆ test allowedTypes.
   * @param {string} testId
   * @param {string} unitId
   * @param {Array<string>} questionTypeIds
   * @param {object|null} requestingFaculty
   * @param {string} mode - 'INHERIT' | 'EXPLICIT'
   * @returns {object}
   */
  updateFacultyUnitQuestionTypes(testId, unitId, questionTypeIds, requestingFaculty = null, mode = QUESTION_TYPE_INHERITANCE_MODES.EXPLICIT) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Faculty Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];
    this._verifyFacultyTestAccess(test, requestingFaculty);
    this._verifyFacultyStructureEditable(test);

    if (!test.structure || !Array.isArray(test.structure.units)) {
      test.structure = createDefaultTestStructure(test);
    }

    const uIndex = test.structure.units.findIndex(u => u.id === unitId);
    if (uIndex === -1) {
      throw new Error(`INVALID_UNIT: Unit with ID "${unitId}" not found in test.`);
    }

    const currentUnit = test.structure.units[uIndex];
    const testConfig = this.getFacultyTestQuestionTypeConfig(testId, requestingFaculty);

    const candidateSectionConfig = {
      mode,
      allowedTypes: Array.isArray(questionTypeIds) ? questionTypeIds : []
    };

    const validation = questionTypeService.validateSectionQuestionTypeConfig(
      candidateSectionConfig,
      testConfig.allowedTypes,
      currentUnit.name
    );

    if (!validation.valid) {
      const firstError = validation.errors[0];
      throw new Error(`${firstError.code}: ${firstError.message}`);
    }

    const normalizedTypes = questionTypeService.normalizeQuestionTypeIds(candidateSectionConfig.allowedTypes);
    const finalSectionQtConfig = {
      mode,
      allowedTypes: normalizedTypes
    };

    const currentConfig = currentUnit.configuration || DEFAULT_UNIT_CONFIGURATION;
    test.structure.units[uIndex].configuration = {
      ...currentConfig,
      questionTypes: normalizedTypes,
      questionTypeConfig: finalSectionQtConfig
    };
    test.updatedAt = new Date().toISOString();

    this.tests[index] = test;
    this.saveTests();
    return JSON.parse(JSON.stringify(finalSectionQtConfig));
  }

  /**
   * Phase 4: Whole-test Question Type validator for Faculty Tests.
   * @param {string} testId
   * @param {object|null} requestingFaculty
   * @returns {object}
   */
  validateFacultyQuestionTypeConfig(testId, requestingFaculty = null) {
    const test = this.getTestById(testId);
    if (!test) {
      return {
        valid: false,
        errors: [{ code: 'TEST_NOT_FOUND', message: `Test "${testId}" not found.` }],
        warnings: [],
        units: []
      };
    }

    const faculty = this._verifyFacultyTestAccess(test, requestingFaculty);
    const testExam = test.examId || test.examTrack || test.courseId;

    const testConfig = test.questionTypeConfig || DEFAULT_TEST_QUESTION_TYPE_CONFIG;
    const testValidation = questionTypeService.validateTestQuestionTypeConfig(testConfig, testExam);

    const allErrors = [...testValidation.errors];
    const allWarnings = [...testValidation.warnings];
    const unitReports = [];

    const structure = test.structure || createDefaultTestStructure(test);
    const units = structure.units || [];

    units.forEach(u => {
      const config = u.configuration || {};
      const qtConfig = config.questionTypeConfig || {
        mode: QUESTION_TYPE_INHERITANCE_MODES.INHERIT,
        allowedTypes: []
      };

      const unitRes = questionTypeService.validateSectionQuestionTypeConfig(
        qtConfig,
        testConfig.allowedTypes,
        u.name
      );

      const effectiveTypes = questionTypeService.resolveEffectiveUnitQuestionTypes(u, testConfig);

      if (!unitRes.valid) {
        unitRes.errors.forEach(err => {
          allErrors.push({ ...err, unitId: u.id, unitName: u.name });
        });
      }

      if (unitRes.warnings && unitRes.warnings.length > 0) {
        unitRes.warnings.forEach(w => {
          allWarnings.push({ ...w, unitId: u.id, unitName: u.name });
        });
      }

      unitReports.push({
        unitId: u.id,
        unitName: u.name,
        code: u.code,
        mode: qtConfig.mode || QUESTION_TYPE_INHERITANCE_MODES.INHERIT,
        configuredTypes: qtConfig.allowedTypes || [],
        effectiveTypes,
        valid: unitRes.valid,
        errors: unitRes.errors,
        warnings: unitRes.warnings
      });
    });

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      testConfig,
      units: unitReports
    };
  }

  /**
   * Phase 4: Save Rules for a Faculty Test
   * @param {string} testId
   * @param {object} rules
   * @param {object|null} requestingFaculty
   * @returns {object} updated test
   */
  saveFacultyTestRules(testId, rules, requestingFaculty = null) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Faculty Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];
    this._verifyFacultyTestAccess(test, requestingFaculty);
    this._verifyFacultyStructureEditable(test);

    const updated = {
      ...test,
      rules,
      updatedAt: new Date().toISOString()
    };

    this.tests[index] = updated;
    this.saveTests();
    return updated;
  }

  /**
   * Phase 4: Get Rules for a Faculty Test
   * @param {string} testId
   * @param {object|null} requestingFaculty
   * @returns {object|null}
   */
  getFacultyTestRules(testId, requestingFaculty = null) {
    const test = this.getTestById(testId);
    if (!test) {
      throw new Error(`Faculty Test with ID "${testId}" not found.`);
    }
    this._verifyFacultyTestAccess(test, requestingFaculty);
    return test.rules || null;
  }

  /**
   * Phase 5: Commits a question set and build metadata to a Faculty Test.
   * @param {string} testId
   * @param {Array<string>} questionIds
   * @param {object} buildMeta
   * @param {object|null} requestingFaculty
   * @returns {object} updated test
   */
  applyFacultyTestBuild(testId, questionIds = [], buildMeta = {}, requestingFaculty = null) {
    const index = this.tests.findIndex(t => t.id === testId);
    if (index === -1) {
      throw new Error(`Faculty Test with ID "${testId}" not found.`);
    }

    const test = this.tests[index];
    this._verifyFacultyTestAccess(test, requestingFaculty);
    this._verifyFacultyStructureEditable(test);

    const cleanIds = Array.from(new Set(questionIds.map(String)));
    const now = new Date().toISOString();

    const updated = {
      ...test,
      content: {
        ...(test.content || {}),
        questionIds: cleanIds,
        questionCount: cleanIds.length
      },
      questionIds: cleanIds,
      questionCount: cleanIds.length,
      build: {
        mode: buildMeta.mode || 'BLUEPRINT',
        generatedAt: buildMeta.generatedAt || now,
        generatedBy: buildMeta.generatedBy || (requestingFaculty?.name || 'Faculty'),
        source: buildMeta.source || buildMeta.mode || 'BLUEPRINT'
      },
      updatedAt: now
    };

    this.tests[index] = updated;
    this.saveTests();
    return updated;
  }

  /**
   * Phase 5: Get build state for a Faculty Test
   * @param {string} testId
   * @param {object|null} requestingFaculty
   * @returns {object|null}
   */
  getFacultyTestBuild(testId, requestingFaculty = null) {
    const test = this.getTestById(testId);
    if (!test) {
      throw new Error(`Faculty Test with ID "${testId}" not found.`);
    }
    this._verifyFacultyTestAccess(test, requestingFaculty);
    return test.build || null;
  }

  subscribe(callback) {
    if (typeof window === 'undefined') return () => {};
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

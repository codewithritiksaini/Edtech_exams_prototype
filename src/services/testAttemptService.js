// =============================================================================
// TEST ATTEMPT SERVICE — ISOLATED CANDIDATE SESSION & ATTEMPT ENGINE
// Manages real candidate attempts, answers, review flags, live timer countdown,
// and scoring submission without modifying the canonical Test or Question models.
// =============================================================================

import { questionService } from './questionService.js';
import { testPresentationService } from './testPresentationService.js';

const STORAGE_PREFIX = 'medprep_test_attempt_';

class TestAttemptService {
  getStorageKey(testId, studentId = 'student-ritik') {
    return `${STORAGE_PREFIX}${testId}_${studentId}`;
  }

  getStoredAttempt(testId, studentId = 'student-ritik') {
    try {
      const key = this.getStorageKey(testId, studentId);
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('[testAttemptService] Failed to read attempt from storage:', e);
      return null;
    }
  }

  saveStoredAttempt(attempt) {
    if (!attempt || !attempt.testId) return;
    try {
      const key = this.getStorageKey(attempt.testId, attempt.studentId);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(attempt));
      }
    } catch (e) {
      console.error('[testAttemptService] Failed to persist attempt:', e);
    }
  }

  /**
   * Starts a new attempt or resumes an existing active attempt.
   *
   * @param {object} test Canonical test object
   * @param {string} studentId
   * @param {object|null} consent Explicit student consent record
   * @returns {object} Active attempt object
   */
  startAttempt(test, studentId = 'student-ritik', consent = null) {
    if (!test || !test.id) {
      throw new Error('Cannot start attempt: Invalid test definition.');
    }

    const testId = test.id;
    const existing = this.getStoredAttempt(testId, studentId);

    // Resume if already in progress or paused
    if (existing && (existing.status === 'IN_PROGRESS' || existing.status === 'PAUSED')) {
      if (consent && !existing.consent) {
        existing.consent = consent;
        this.saveStoredAttempt(existing);
      }
      return existing;
    }

    // Extract timing rules
    const timing = testPresentationService.getTestTimingModel(test);
    const totalSeconds = timing.totalSeconds || 3600;

    const questionIds = test.content?.questionIds || test.questionIds || [];
    const firstQuestionId = questionIds.length > 0 ? String(questionIds[0]) : null;

    const newAttempt = {
      attemptId: `att-${testId}-${Date.now()}`,
      testId,
      studentId,
      status: 'IN_PROGRESS',
      currentQuestionIndex: 0,
      totalQuestions: questionIds.length,
      answers: {},
      visitedQuestionIds: firstQuestionId ? [firstQuestionId] : [],
      markedForReview: [],
      flaggedQuestionIds: [],
      consent: consent || {
        instructionsAccepted: true,
        monitoringAccepted: true,
        autoSubmitAccepted: true,
        acceptedAt: new Date().toISOString()
      },
      monitoring: {
        enabled: true,
        violationCount: 0,
        lastViolationAt: null,
        status: 'ACTIVE',
        events: []
      },
      startedAt: new Date().toISOString(),
      submittedAt: null,
      submissionReason: null,
      totalSeconds,
      remainingSeconds: totalSeconds,
      lastActiveAt: new Date().toISOString(),
      scoringSummary: null
    };

    this.saveStoredAttempt(newAttempt);
    return newAttempt;
  }

  /**
   * Retrieves active or completed attempt for a test.
   */
  getAttempt(testId, studentId = 'student-ritik') {
    return this.getStoredAttempt(testId, studentId);
  }

  /**
   * Calculates question status in attempt (UNVISITED | VISITED | ANSWERED | MARKED | ANSWERED_AND_MARKED)
   */
  getQuestionStatus(testId, questionId, studentId = 'student-ritik') {
    const attempt = this.getStoredAttempt(testId, studentId);
    if (!attempt) return 'UNVISITED';

    const qIdStr = String(questionId);
    const hasAnswer = attempt.answers[qIdStr] !== undefined && 
                      attempt.answers[qIdStr] !== null && 
                      attempt.answers[qIdStr] !== '' &&
                      (!Array.isArray(attempt.answers[qIdStr]) || attempt.answers[qIdStr].length > 0);
    const isMarked = (attempt.markedForReview || []).includes(qIdStr);
    const isVisited = (attempt.visitedQuestionIds || []).includes(qIdStr);

    if (hasAnswer && isMarked) return 'ANSWERED_AND_MARKED';
    if (isMarked) return 'MARKED';
    if (hasAnswer) return 'ANSWERED';
    if (isVisited) return 'VISITED';
    return 'UNVISITED';
  }

  /**
   * Records an answer for a question.
   */
  saveAnswer(testId, questionId, answer, studentId = 'student-ritik') {
    const attempt = this.getStoredAttempt(testId, studentId);
    if (!attempt || attempt.status !== 'IN_PROGRESS') return null;

    const qIdStr = String(questionId);
    attempt.answers[qIdStr] = answer;

    if (!attempt.visitedQuestionIds.includes(qIdStr)) {
      attempt.visitedQuestionIds.push(qIdStr);
    }
    attempt.lastActiveAt = new Date().toISOString();

    this.saveStoredAttempt(attempt);
    return attempt;
  }

  /**
   * Alias for saveAnswer with alternative signature (testId, studentId, questionId, answer)
   */
  recordResponse(testId, arg2, arg3, arg4) {
    if (arg4 !== undefined) {
      // (testId, studentId, questionId, answer)
      return this.saveAnswer(testId, arg3, arg4, arg2);
    }
    // (testId, questionId, answer)
    return this.saveAnswer(testId, arg2, arg3);
  }

  /**
   * Clears answer for a question.
   */
  clearAnswer(testId, questionId, studentId = 'student-ritik') {
    const attempt = this.getStoredAttempt(testId, studentId);
    if (!attempt || attempt.status !== 'IN_PROGRESS') return null;

    const qIdStr = String(questionId);
    delete attempt.answers[qIdStr];
    attempt.lastActiveAt = new Date().toISOString();

    this.saveStoredAttempt(attempt);
    return attempt;
  }

  /**
   * Toggles the mark for review flag on a question.
   */
  toggleMarkForReview(testId, questionId, studentId = 'student-ritik') {
    const attempt = this.getStoredAttempt(testId, studentId);
    if (!attempt || attempt.status !== 'IN_PROGRESS') return null;

    const qIdStr = String(questionId);
    const set = new Set(attempt.markedForReview || []);
    if (set.has(qIdStr)) {
      set.delete(qIdStr);
    } else {
      set.add(qIdStr);
    }
    attempt.markedForReview = Array.from(set);
    attempt.flaggedQuestionIds = attempt.markedForReview;

    if (!attempt.visitedQuestionIds.includes(qIdStr)) {
      attempt.visitedQuestionIds.push(qIdStr);
    }
    attempt.lastActiveAt = new Date().toISOString();

    this.saveStoredAttempt(attempt);
    return attempt;
  }

  /**
   * Alias for toggleMarkForReview (testId, studentId, questionId)
   */
  toggleFlag(testId, studentId, questionId) {
    return this.toggleMarkForReview(testId, questionId, studentId);
  }

  /**
   * Marks a question as visited.
   */
  recordVisit(testId, questionId, studentId = 'student-ritik') {
    const attempt = this.getStoredAttempt(testId, studentId);
    if (!attempt || attempt.status !== 'IN_PROGRESS') return null;

    const qIdStr = String(questionId);
    if (!attempt.visitedQuestionIds.includes(qIdStr)) {
      attempt.visitedQuestionIds.push(qIdStr);
      this.saveStoredAttempt(attempt);
    }
    return attempt;
  }

  /**
   * Updates current question index.
   */
  setQuestionIndex(testId, index, studentId = 'student-ritik') {
    const attempt = this.getStoredAttempt(testId, studentId);
    if (!attempt || attempt.status !== 'IN_PROGRESS') return null;

    attempt.currentQuestionIndex = Math.max(0, index);
    attempt.lastActiveAt = new Date().toISOString();
    this.saveStoredAttempt(attempt);
    return attempt;
  }

  /**
   * Updates remaining seconds on the countdown timer.
   */
  updateTimer(testId, remainingSeconds, studentId = 'student-ritik') {
    const attempt = this.getStoredAttempt(testId, studentId);
    if (!attempt || attempt.status !== 'IN_PROGRESS') return null;

    attempt.remainingSeconds = Math.max(0, remainingSeconds);
    this.saveStoredAttempt(attempt);
    return attempt;
  }

  /**
   * Alias for updateTimer (testId, studentId, remainingSeconds)
   */
  updateRemainingTime(testId, studentId, remainingSeconds) {
    return this.updateTimer(testId, remainingSeconds, studentId);
  }

  /**
   * Retrieves status dictionary for multiple question IDs.
   */
  getAllQuestionStatuses(testId, studentId, questionIds = []) {
    const statuses = {};
    questionIds.forEach(qId => {
      statuses[qId] = this.getQuestionStatus(testId, qId, studentId);
    });
    return statuses;
  }

  /**
   * Explicitly pauses an in-progress attempt, freezing the timer and suspending monitoring.
   */
  pauseAttempt(testId, studentId = 'student-ritik') {
    const attempt = this.getStoredAttempt(testId, studentId);
    if (!attempt || attempt.status !== 'IN_PROGRESS') return attempt;

    attempt.status = 'PAUSED';
    attempt.pausedAt = new Date().toISOString();
    if (!attempt.monitoring) {
      attempt.monitoring = { enabled: true, violationCount: 0, lastViolationAt: null, status: 'SUSPENDED_PAUSED', events: [] };
    } else {
      attempt.monitoring.status = 'SUSPENDED_PAUSED';
    }
    attempt.lastActiveAt = new Date().toISOString();

    this.saveStoredAttempt(attempt);
    return attempt;
  }

  /**
   * Resumes a paused attempt, unfreezing the timer and resuming monitoring.
   */
  resumeAttempt(testId, studentId = 'student-ritik') {
    const attempt = this.getStoredAttempt(testId, studentId);
    if (!attempt || attempt.status !== 'PAUSED') return attempt;

    attempt.status = 'IN_PROGRESS';
    delete attempt.pausedAt;
    if (!attempt.monitoring) {
      attempt.monitoring = { enabled: true, violationCount: 0, lastViolationAt: null, status: 'ACTIVE', events: [] };
    } else {
      attempt.monitoring.status = 'ACTIVE';
    }
    attempt.lastActiveAt = new Date().toISOString();

    this.saveStoredAttempt(attempt);
    return attempt;
  }

  /**
   * Records a tab/window visibility violation event in attempt.monitoring.
   */
  recordViolation(testId, studentId = 'student-ritik', details = {}) {
    const attempt = this.getStoredAttempt(testId, studentId);
    if (!attempt || attempt.status !== 'IN_PROGRESS') return attempt;

    const timestamp = new Date().toISOString();
    if (!attempt.monitoring) {
      attempt.monitoring = { enabled: true, violationCount: 0, lastViolationAt: null, status: 'ACTIVE', events: [] };
    }

    attempt.monitoring.violationCount = (attempt.monitoring.violationCount || 0) + 1;
    attempt.monitoring.lastViolationAt = timestamp;
    attempt.monitoring.events.push({
      type: 'TAB_OR_WINDOW_VIOLATION',
      detectedAt: timestamp,
      action: 'AUTO_SUBMITTED',
      ...details
    });

    this.saveStoredAttempt(attempt);
    return attempt;
  }

  /**
   * Finalizes and submits the attempt.
   * Calculates score according to test.rules.scoring.
   * Prevents double submission.
   *
   * @param {string} testId
   * @param {string} reason 'STUDENT_SUBMITTED' | 'TIME_EXPIRED' | 'TAB_OR_WINDOW_VIOLATION' | 'manual'
   * @param {object|string} test
   * @param {string} studentId
   * @returns {object} Finalized attempt
   */
  submitAttempt(testId, reason = 'STUDENT_SUBMITTED', test = null, studentId = 'student-ritik') {
    let resolvedReason = reason || 'STUDENT_SUBMITTED';
    let resolvedTest = test;
    let resolvedStudentId = studentId;

    // Flexible parameter detection
    if (typeof reason === 'string' && (reason.startsWith('student') || reason.startsWith('candidate') || reason.startsWith('user') || reason.startsWith('dr-') || (!['STUDENT_SUBMITTED', 'TIME_EXPIRED', 'TAB_OR_WINDOW_VIOLATION', 'manual', 'time_expired', 'auto'].includes(reason) && !reason.includes('VIOLATION')))) {
      resolvedStudentId = reason;
      resolvedReason = 'STUDENT_SUBMITTED';
    } else if (typeof test === 'string') {
      resolvedStudentId = test;
      resolvedTest = null;
    }

    // Normalize reason strings
    if (resolvedReason === 'manual') resolvedReason = 'STUDENT_SUBMITTED';
    if (resolvedReason === 'time_expired') resolvedReason = 'TIME_EXPIRED';

    const attempt = this.getStoredAttempt(testId, resolvedStudentId);
    if (!attempt) return null;

    // Guard: prevent double submission
    if (attempt.status === 'COMPLETED' || attempt.status === 'AUTO_SUBMITTED' || attempt.status === 'SUBMITTED') {
      return attempt;
    }

    const finalTest = (resolvedTest && typeof resolvedTest === 'object') ? resolvedTest : testPresentationService.getTestById(testId);
    const questions = finalTest ? testPresentationService.getTestQuestions(finalTest, 'preview') : [];
    const scoringRules = finalTest 
      ? testPresentationService.getTestScoringModel(finalTest)
      : { marksPerQuestion: 4, penaltyPerWrong: 1, negativeMarks: 1, unansweredMarks: 0 };

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let totalScore = 0;

    questions.forEach(q => {
      const studentAns = attempt.answers[q.id];
      if (studentAns === undefined || studentAns === null || studentAns === '' || (Array.isArray(studentAns) && studentAns.length === 0)) {
        unansweredCount++;
        totalScore += scoringRules.unansweredMarks;
        return;
      }

      // Check correctness
      let isCorrect = false;
      const correctList = q.correctAnswers || (q.correctOptionId ? [q.correctOptionId] : []);

      if (Array.isArray(studentAns)) {
        // Multi-select MCQ: exact match of selected option IDs
        const sortedStudent = [...studentAns].sort();
        const sortedCorrect = [...correctList].sort();
        isCorrect = sortedStudent.length === sortedCorrect.length && 
                    sortedStudent.every((val, i) => val === sortedCorrect[i]);
      } else if (typeof studentAns === 'string') {
        const cleanStudent = studentAns.trim().toLowerCase();
        // Check if student string matches any correct answer ID or text
        isCorrect = correctList.some(c => String(c).trim().toLowerCase() === cleanStudent) ||
                    (q.textAnswer && q.textAnswer.trim().toLowerCase() === cleanStudent);
      }

      if (isCorrect) {
        correctCount++;
        totalScore += scoringRules.marksPerQuestion;
      } else {
        incorrectCount++;
        const penalty = scoringRules.penaltyPerWrong !== undefined ? scoringRules.penaltyPerWrong : scoringRules.negativeMarks;
        totalScore -= penalty;
      }
    });

    const maxMarks = questions.length * scoringRules.marksPerQuestion;
    const percentage = maxMarks > 0 ? Math.max(0, Math.round((totalScore / maxMarks) * 100)) : 0;

    const isViolation = resolvedReason === 'TAB_OR_WINDOW_VIOLATION';
    const isTimeout = resolvedReason === 'TIME_EXPIRED';
    attempt.status = isViolation ? 'AUTO_SUBMITTED' : 'COMPLETED';
    attempt.submittedAt = new Date().toISOString();
    attempt.submissionReason = resolvedReason;
    if (attempt.monitoring) {
      attempt.monitoring.status = isViolation ? 'AUTO_SUBMITTED' : 'COMPLETED';
    }

    attempt.scoringSummary = {
      totalQuestions: questions.length,
      answeredCount: questions.length - unansweredCount,
      unansweredCount,
      correctCount,
      incorrectCount,
      maxMarks,
      totalScore,
      score: totalScore,
      percentage,
      isAutoSubmitted: isViolation || isTimeout,
      reason: resolvedReason
    };
    attempt.summary = attempt.scoringSummary;

    this.saveStoredAttempt(attempt);
    return attempt;
  }

  /**
   * Clears attempt data from storage (for reset or test replay).
   */
  clearAttempt(testId, studentId = 'student-ritik') {
    try {
      const key = this.getStorageKey(testId, studentId);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.error('[testAttemptService] Error clearing attempt:', e);
    }
  }
}

export const testAttemptService = new TestAttemptService();
export default testAttemptService;

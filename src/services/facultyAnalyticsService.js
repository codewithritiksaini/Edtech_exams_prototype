// =============================================================================
// FACULTY ANALYTICS SERVICE — PURE DERIVED DOMAIN ENGINE
// Calculates live metrics dynamically from canonical services:
// - peopleService (Student & Enrollment counts)
// - learningProgressService (Syllabus & Lecture Completion)
// - cbtTestService (Assessment attempts, scores, question accuracy)
// - liveSessionsService (Sessions & aggregate attendance)
// - doubtsService (Q&A resolution metrics)
//
// CRITICAL RULE: This is a calculation/derivation layer. It never stores
// a second permanent database of hardcoded or fabricated statistics.
// =============================================================================

import { peopleService } from './peopleService.js';
import { learningProgressService } from './learningProgressService.js';
import { cbtTestService, CBT_STATUS } from './cbtTestService.js';
import { liveSessionsService } from './liveSessionsService.js';
import { doubtsService } from './doubtsService.js';
import { curriculumService } from './curriculumService.js';

export const facultyAnalyticsService = {
  /**
   * Derive candidate enrollment metrics strictly for the faculty's assigned scope.
   */
  getStudentMetrics: (assignedExams = []) => {
    const students = peopleService.getStudentsForScope(assignedExams);
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'Active').length;
    const expiredStudents = students.filter(s => s.status === 'Expired').length;

    // Track distribution across assigned exams
    const trackCounts = {};
    students.forEach(s => {
      const examKey = s.examId || 'unassigned';
      trackCounts[examKey] = (trackCounts[examKey] || 0) + 1;
    });

    return {
      totalStudents,
      activeStudents,
      expiredStudents,
      trackCounts,
      hasStudents: totalStudents > 0
    };
  },

  /**
   * Derive curriculum syllabus learning progress from learningProgressService
   */
  getLearningProgressMetrics: (assignedExams = [], assignedSubjectIds = []) => {
    const allSubjects = curriculumService.getSubjects ? curriculumService.getSubjects() : [];
    
    // Scoped subjects
    const scopedSubjects = allSubjects.filter(sub => {
      const matchesExam = !assignedExams || assignedExams.length === 0 || assignedExams.includes(sub.examId);
      const matchesSubject = !assignedSubjectIds || assignedSubjectIds.length === 0 || assignedSubjectIds.includes(sub.id);
      return matchesExam && matchesSubject;
    });

    let totalLecturesCount = 0;
    let subjectBreakdown = [];

    const completedLecturesList = learningProgressService.getCompletedLectures 
      ? learningProgressService.getCompletedLectures() 
      : [];

    scopedSubjects.forEach(sub => {
      const modules = curriculumService.getModulesBySubject ? curriculumService.getModulesBySubject(sub.id) : [];
      let subLecturesCount = 0;
      let subCompletedCount = 0;

      modules.forEach(mod => {
        const lecs = curriculumService.getLecturesByModule ? curriculumService.getLecturesByModule(mod.id) : [];
        subLecturesCount += lecs.length;
        lecs.forEach(l => {
          if (completedLecturesList.includes(l.id)) {
            subCompletedCount++;
          }
        });
      });

      totalLecturesCount += subLecturesCount;
      const subPct = subLecturesCount > 0 ? Math.round((subCompletedCount / subLecturesCount) * 100) : 0;

      subjectBreakdown.push({
        id: sub.id,
        name: sub.name,
        examId: sub.examId,
        totalLectures: subLecturesCount,
        completedLectures: subCompletedCount,
        percentage: subPct
      });
    });

    const totalCompletedCount = subjectBreakdown.reduce((acc, s) => acc + s.completedLectures, 0);
    const overallSyllabusPercentage = totalLecturesCount > 0 
      ? Math.round((totalCompletedCount / totalLecturesCount) * 100) 
      : 0;

    return {
      totalLecturesCount,
      completedLecturesCount: totalCompletedCount,
      overallSyllabusPercentage,
      subjectBreakdown,
      hasCurriculum: totalLecturesCount > 0,
      hasProgressData: totalCompletedCount > 0
    };
  },

  /**
   * Derive assessment and CBT performance metrics from real completed attempts in cbtTestService
   */
  getAssessmentMetrics: (assignedExams = []) => {
    const allTests = cbtTestService.getAllTests ? cbtTestService.getAllTests('all') : [];
    
    // Filter tests to faculty scope
    const scopedTests = allTests.filter(t => {
      const testExam = t.examTrack || t.courseId;
      return !assignedExams || assignedExams.length === 0 || assignedExams.includes(testExam);
    });

    // Scan completed attempts
    const attemptsMap = cbtTestService.attempts || {};
    const completedAttemptsList = [];

    Object.keys(attemptsMap).forEach(key => {
      const att = attemptsMap[key];
      if (att && att.status === CBT_STATUS.SUBMITTED) {
        // Verify test belongs to scoped tests
        const matchingTest = scopedTests.find(t => t.id === att.testId);
        if (matchingTest) {
          completedAttemptsList.push({
            attempt: att,
            test: matchingTest
          });
        }
      }
    });

    const totalAttemptsCount = completedAttemptsList.length;

    // Check if any attempts exist
    if (totalAttemptsCount === 0) {
      return {
        hasAttempts: false,
        totalTestsScoped: scopedTests.length,
        totalAttemptsCount: 0,
        averageScorePercentage: null, // explicit null, not misleading 0%
        averageScoreLabel: 'No attempts yet',
        passRate: null,
        passRateLabel: 'No attempts yet',
        highestScore: null,
        lowestScore: null,
        testsBreakdown: scopedTests.map(t => ({
          id: t.id,
          name: t.name || t.title,
          totalQuestions: t.questions?.length || t.totalQuestions || 20,
          attemptsCount: 0,
          meanScore: 'No attempts yet',
          passRate: 'No attempts yet'
        }))
      };
    }

    // Calculate real score aggregations
    let sumPercentage = 0;
    let passedCount = 0;
    let maxScore = -1;
    let minScore = 99999;

    completedAttemptsList.forEach(({ attempt, test }) => {
      const pct = typeof attempt.percentage === 'number' 
        ? attempt.percentage 
        : Math.round(((attempt.score || 0) / (attempt.totalMarks || 100)) * 100);
      
      sumPercentage += pct;
      if (pct >= (test.passingScore || 50)) {
        passedCount++;
      }
      if (pct > maxScore) maxScore = pct;
      if (pct < minScore) minScore = pct;
    });

    const averageScorePercentage = Math.round(sumPercentage / totalAttemptsCount);
    const passRatePercentage = Math.round((passedCount / totalAttemptsCount) * 100);

    // Tests Breakdown
    const testsBreakdown = scopedTests.map(test => {
      const testAttempts = completedAttemptsList.filter(item => item.attempt.testId === test.id);
      if (testAttempts.length === 0) {
        return {
          id: test.id,
          name: test.name || test.title,
          totalQuestions: test.questions?.length || test.totalQuestions || 20,
          attemptsCount: 0,
          meanScore: 'No attempts yet',
          passRate: 'No attempts yet'
        };
      }

      const testSum = testAttempts.reduce((acc, item) => acc + (item.attempt.percentage || 0), 0);
      const testPass = testAttempts.filter(item => (item.attempt.percentage || 0) >= (test.passingScore || 50)).length;

      return {
        id: test.id,
        name: test.name || test.title,
        totalQuestions: test.questions?.length || test.totalQuestions || 20,
        attemptsCount: testAttempts.length,
        meanScore: `${Math.round(testSum / testAttempts.length)}%`,
        passRate: `${Math.round((testPass / testAttempts.length) * 100)}%`
      };
    });

    return {
      hasAttempts: true,
      totalTestsScoped: scopedTests.length,
      totalAttemptsCount,
      averageScorePercentage,
      averageScoreLabel: `${averageScorePercentage}%`,
      passRate: passRatePercentage,
      passRateLabel: `${passRatePercentage}% Pass`,
      highestScore: `${maxScore}%`,
      lowestScore: `${minScore}%`,
      testsBreakdown
    };
  },

  /**
   * Derive Weak Topics dynamically from question-level accuracy on completed CBT attempts.
   */
  getWeakTopicsMetrics: (assignedExams = [], accuracyThreshold = 65) => {
    const attemptsMap = cbtTestService.attempts || {};
    const allTests = cbtTestService.getAllTests ? cbtTestService.getAllTests('all') : [];
    
    const questionStats = {}; // { questionId: { totalAppeared, correctCount, text, topic, module } }

    Object.keys(attemptsMap).forEach(key => {
      const att = attemptsMap[key];
      if (att && att.status === CBT_STATUS.SUBMITTED && att.answers) {
        const test = allTests.find(t => t.id === att.testId);
        if (!test) return;

        // Verify scope
        const testExam = test.examTrack || test.courseId;
        if (assignedExams && assignedExams.length > 0 && !assignedExams.includes(testExam)) {
          return;
        }

        const questions = cbtTestService.getQuestionsForTest ? cbtTestService.getQuestionsForTest(test) : [];

        questions.forEach(q => {
          const userAns = att.answers[q.id];
          if (!userAns) return; // unattempted

          if (!questionStats[q.id]) {
            questionStats[q.id] = {
              id: q.id,
              prompt: q.question || q.prompt || 'Clinical Question',
              topic: q.topic || test.name || 'Clinical Topic',
              examTrack: testExam,
              totalAnswers: 0,
              correctCount: 0
            };
          }

          questionStats[q.id].totalAnswers++;
          const isCorrect = String(userAns).trim().toUpperCase() === String(q.correct || q.correctOption).trim().toUpperCase();
          if (isCorrect) {
            questionStats[q.id].correctCount++;
          }
        });
      }
    });

    const identifiedWeakQuestions = [];
    Object.values(questionStats).forEach(stat => {
      if (stat.totalAnswers >= 1) {
        const accuracy = Math.round((stat.correctCount / stat.totalAnswers) * 100);
        if (accuracy < accuracyThreshold) {
          identifiedWeakQuestions.push({
            ...stat,
            accuracy,
            errorRate: 100 - accuracy
          });
        }
      }
    });

    // Sort by lowest accuracy
    identifiedWeakQuestions.sort((a, b) => a.accuracy - b.accuracy);

    return {
      hasData: identifiedWeakQuestions.length > 0,
      weakTopics: identifiedWeakQuestions.slice(0, 5)
    };
  },

  /**
   * Derive live sessions statistics from liveSessionsService
   */
  getLiveSessionMetrics: (assignedExams = []) => {
    const allSessions = liveSessionsService.getAllSessions ? liveSessionsService.getAllSessions() : [];
    
    const scopedSessions = allSessions.filter(s => {
      return !assignedExams || assignedExams.length === 0 || assignedExams.includes(s.examId);
    });

    const totalScheduled = scopedSessions.length;
    const completedSessions = scopedSessions.filter(s => s.status === 'ended' || s.isLive === false).length;
    const liveNowSessions = scopedSessions.filter(s => s.status === 'live' || s.isLive === true).length;
    
    // Total registered / present attendee engagements
    const totalEngagementCount = scopedSessions.reduce((acc, s) => acc + (s.attendeesCount || 0), 0);

    return {
      totalScheduled,
      completedSessions,
      liveNowSessions,
      totalEngagementCount,
      // Formal architecture disclosure (Step 12):
      individualAttendanceTracking: 'UNAVAILABLE',
      individualAttendanceNote: 'Individual student live presence tracking is not logged by the streaming gateway; session-level attendee headcounts are reflected above.'
    };
  },

  /**
   * Derive Q&A resolution statistics from doubtsService
   */
  getDoubtMetrics: (assignedExams = []) => {
    return doubtsService.getDoubtStatsForScope ? doubtsService.getDoubtStatsForScope(assignedExams) : { total: 0, unresolved: 0, resolved: 0 };
  },

  /**
   * Aggregate lightweight dashboard summary for Faculty Command Center
   */
  getDashboardSummary: (faculty) => {
    const assignedExams = faculty?.assignedExams || ['neet-pg'];
    const studentMetrics = facultyAnalyticsService.getStudentMetrics(assignedExams);
    const assessmentMetrics = facultyAnalyticsService.getAssessmentMetrics(assignedExams);
    const doubtMetrics = facultyAnalyticsService.getDoubtMetrics(assignedExams);
    const liveMetrics = facultyAnalyticsService.getLiveSessionMetrics(assignedExams);
    const progressMetrics = facultyAnalyticsService.getLearningProgressMetrics(assignedExams, faculty?.assignedSubjects);

    return {
      activeStudents: studentMetrics.activeStudents,
      totalStudents: studentMetrics.totalStudents,
      averageScoreLabel: assessmentMetrics.averageScoreLabel,
      unresolvedDoubts: doubtMetrics.unresolved,
      liveSessionsDelivered: liveMetrics.completedSessions,
      overallProgressLabel: `${progressMetrics.overallSyllabusPercentage}%`
    };
  }
};

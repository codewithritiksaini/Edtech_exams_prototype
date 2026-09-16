import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Brain, 
  Video, 
  FileText, 
  Award, 
  Layers, 
  Filter, 
  AlertCircle, 
  GraduationCap,
  Sparkles,
  HelpCircle,
  XCircle
} from 'lucide-react';
import { peopleService } from '../../services/peopleService';
import { facultyAnalyticsService } from '../../services/facultyAnalyticsService';
import { cbtTestService } from '../../services/cbtTestService';
import { doubtsService } from '../../services/doubtsService';
import { liveSessionsService } from '../../services/liveSessionsService';
import { learningProgressService } from '../../services/learningProgressService';

export default function FacultyAnalyticsPage() {
  const currentFaculty = peopleService.getCurrentFacultyProfile();
  const assignedExamIds = currentFaculty?.assignedExams || ['neet-pg'];

  const [selectedExamFilter, setSelectedExamFilter] = useState('all');
  const [activeTimeframe, setActiveTimeframe] = useState('all'); // '7d' | '30d' | 'all'
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Subscribe to all underlying canonical services for real-time reactivity
  useEffect(() => {
    const unsubCbt = cbtTestService.subscribe?.(() => setRefreshTrigger(n => n + 1));
    const unsubPeople = peopleService.subscribe?.(() => setRefreshTrigger(n => n + 1));
    const unsubDoubts = doubtsService.subscribe?.(() => setRefreshTrigger(n => n + 1));
    const unsubLive = liveSessionsService.subscribe?.(() => setRefreshTrigger(n => n + 1));
    const unsubLec = learningProgressService.subscribeLectures?.(() => setRefreshTrigger(n => n + 1));

    return () => {
      if (unsubCbt) unsubCbt();
      if (unsubPeople) unsubPeople();
      if (unsubDoubts) unsubDoubts();
      if (unsubLive) unsubLive();
      if (unsubLec) unsubLec();
    };
  }, []);

  // Effective exam filter scoped strictly to faculty assigned exams
  const effectiveExams = useMemo(() => {
    if (selectedExamFilter === 'all') return assignedExamIds;
    return assignedExamIds.includes(selectedExamFilter) ? [selectedExamFilter] : assignedExamIds;
  }, [selectedExamFilter, assignedExamIds]);

  // Pure derived domain metrics
  const studentMetrics = useMemo(() => {
    return facultyAnalyticsService.getStudentMetrics(effectiveExams);
  }, [effectiveExams, refreshTrigger]);

  const progressMetrics = useMemo(() => {
    return facultyAnalyticsService.getLearningProgressMetrics(effectiveExams, currentFaculty?.assignedSubjects);
  }, [effectiveExams, currentFaculty?.assignedSubjects, refreshTrigger]);

  const assessmentMetrics = useMemo(() => {
    return facultyAnalyticsService.getAssessmentMetrics(effectiveExams);
  }, [effectiveExams, refreshTrigger]);

  const weakTopicsMetrics = useMemo(() => {
    return facultyAnalyticsService.getWeakTopicsMetrics(effectiveExams);
  }, [effectiveExams, refreshTrigger]);

  const liveMetrics = useMemo(() => {
    return facultyAnalyticsService.getLiveSessionMetrics(effectiveExams);
  }, [effectiveExams, refreshTrigger]);

  const doubtMetrics = useMemo(() => {
    return facultyAnalyticsService.getDoubtMetrics(effectiveExams);
  }, [effectiveExams, refreshTrigger]);

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Intelligence & Evaluation
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{currentFaculty?.name || 'Faculty Mentor'}</span>
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pure Derived Analytics</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Curriculum & Performance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Real-time pedagogical metrics calculated dynamically from canonical student enrollment, curriculum syllabus progress, CBT test attempts, and live session participation.
          </p>
        </div>

        {/* Exam Track Filter */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedExamFilter}
              onChange={(e) => setSelectedExamFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">All Assigned Tracks ({assignedExamIds.join(', ').toUpperCase()})</option>
              {assignedExamIds.includes('neet-pg') && (
                <option value="neet-pg">NEET PG & NExT</option>
              )}
              {assignedExamIds.includes('usmle') && (
                <option value="usmle">USMLE Step 1 & 2</option>
              )}
              {assignedExamIds.includes('plab') && (
                <option value="plab">PLAB 1 & 2 / UKMLA</option>
              )}
              {assignedExamIds.includes('europe') && (
                <option value="europe">Europe Medical Licensing</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Enrolled Candidates */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Assigned Candidates</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {studentMetrics.totalStudents}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Active: <strong className="text-slate-800">{studentMetrics.activeStudents}</strong></span>
            <span>Expired: <strong className="text-slate-800">{studentMetrics.expiredStudents}</strong></span>
          </div>
        </div>

        {/* Metric 2: Syllabus Completion */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Syllabus Completion</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {progressMetrics.hasCurriculum ? `${progressMetrics.overallSyllabusPercentage}%` : 'No data'}
          </div>
          <div className="text-xs text-slate-500">
            {progressMetrics.hasProgressData ? (
              <span>{progressMetrics.completedLecturesCount} of {progressMetrics.totalLecturesCount} lectures completed</span>
            ) : (
              <span className="text-slate-400">No completed lectures recorded</span>
            )}
          </div>
        </div>

        {/* Metric 3: Assessment Mean Score */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Avg Test Score</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {assessmentMetrics.hasAttempts ? `${assessmentMetrics.averageScorePercentage}%` : 'No attempts yet'}
          </div>
          <div className="text-xs text-slate-500">
            {assessmentMetrics.hasAttempts ? (
              <span className="text-emerald-600 font-bold">{assessmentMetrics.passRateLabel} ({assessmentMetrics.totalAttemptsCount} attempts)</span>
            ) : (
              <span className="text-slate-400">Awaiting candidate submissions</span>
            )}
          </div>
        </div>

        {/* Metric 4: Doubts & Inquiries */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Doubts Resolution</span>
            <HelpCircle className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {doubtMetrics.total > 0 ? `${Math.round((doubtMetrics.resolved / doubtMetrics.total) * 100)}%` : '100%'}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Pending: <strong className="text-rose-600">{doubtMetrics.unresolved}</strong></span>
            <span>Answered: <strong className="text-emerald-600">{doubtMetrics.resolved}</strong></span>
          </div>
        </div>
      </div>

      {/* CBT Assessments Performance Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Assessment Engine Submissions ({assessmentMetrics.totalTestsScoped} Scoped Tests)
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated directly from candidate CBT attempts. Unattempted examinations explicitly state their status.
            </p>
          </div>
        </div>

        {assessmentMetrics.testsBreakdown.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No scheduled examinations configured for this exam scope.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Examination Test</th>
                  <th className="pb-3">Questions</th>
                  <th className="pb-3">Attempts Count</th>
                  <th className="pb-3">Batch Mean Score</th>
                  <th className="pb-3">Pass Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessmentMetrics.testsBreakdown.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pr-3 font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{t.name}</span>
                    </td>
                    <td className="py-3.5 pr-3 text-slate-600 font-semibold">
                      {t.totalQuestions} MCQs
                    </td>
                    <td className="py-3.5 pr-3 font-bold text-slate-800">
                      {t.attemptsCount}
                    </td>
                    <td className="py-3.5 pr-3 font-black text-indigo-700">
                      {t.meanScore}
                    </td>
                    <td className="py-3.5 pr-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        t.passRate.includes('%') 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {t.passRate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Subject Syllabus Pacing Breakdown */}
      {progressMetrics.subjectBreakdown.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Curriculum Syllabus Delivery Breakdown</h3>
              <p className="text-xs text-slate-500">
                Completion rates calculated across all teaching units in your assigned subjects.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {progressMetrics.subjectBreakdown.map(sub => (
              <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{sub.name}</span>
                  <span className="font-black text-emerald-600">{sub.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${sub.percentage}%` }} 
                  />
                </div>
                <span className="text-[11px] text-slate-400 block">
                  {sub.completedLectures} of {sub.totalLectures} lectures completed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weak Topics Analysis (Derived from real question-level accuracy) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-5">
        <div>
          <h3 className="text-base font-black text-slate-900">
            Weak Topics & High-Error Rate Identification
          </h3>
          <p className="text-xs text-slate-500">
            Questions and concepts where candidate error rates exceed 35% on completed assessment attempts.
          </p>
        </div>

        {weakTopicsMetrics.hasData ? (
          <div className="space-y-3">
            {weakTopicsMetrics.weakTopics.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{item.prompt}</span>
                  <span className="font-black text-rose-600">{item.accuracy}% Accuracy</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full" 
                    style={{ width: `${item.accuracy}%` }} 
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Topic: {item.topic}</span>
                  <span>Tested across {item.totalAnswers} response(s)</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
            <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700">No weak topics identified yet</h4>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
              Weak topics are dynamically derived from question error rates when candidates complete CBT examinations. As more submissions are recorded, low-scoring questions will automatically be cataloged here.
            </p>
          </div>
        )}
      </div>

      {/* Live Masterclasses & Attendance Logging Transparency */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">Live Masterclasses & Broadcast Participation</h3>
            <p className="text-xs text-slate-500">
              Scheduled clinical grand rounds and session-level attendee headcounts.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200">
            {liveMetrics.totalScheduled} Sessions Configured
          </span>
        </div>

        {/* Step 12 Attendance Notice */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-slate-800 block">Attendance Architecture Notice</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {liveMetrics.individualAttendanceNote} Overall cumulative attendee engagement across delivered sessions: <strong className="text-slate-900">{liveMetrics.totalEngagementCount} attendees</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

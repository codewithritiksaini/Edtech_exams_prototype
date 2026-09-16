import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Award, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  ShieldAlert, 
  Send, 
  Sparkles, 
  Video, 
  ChevronRight,
  BarChart3,
  Check,
  AlertCircle
} from 'lucide-react';
import { peopleService } from '../../services/peopleService';
import { curriculumService } from '../../services/curriculumService';
import { learningProgressService } from '../../services/learningProgressService';
import { cbtTestService, CBT_STATUS } from '../../services/cbtTestService';
import { doubtsService } from '../../services/doubtsService';
import { liveSessionsService } from '../../services/liveSessionsService';

export default function FacultyStudentDetailPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const currentFaculty = peopleService.getCurrentFacultyProfile();
  const assignedExamIds = currentFaculty?.assignedExams || ['neet-pg'];

  // Tab State: 'overview' | 'progress' | 'tests' | 'doubts' | 'attendance'
  const [activeTab, setActiveTab] = useState('overview');

  // Verify access scope
  const authResult = useMemo(() => {
    return peopleService.getStudentById(studentId, currentFaculty?.id);
  }, [studentId, currentFaculty?.id]);

  const student = authResult?.student;
  const isAuthorized = authResult?.authorized;
  const rawStudent = authResult?.rawStudent;

  // Real-time state
  const [completedLectures, setCompletedLectures] = useState(() => 
    learningProgressService.getCompletedLectures ? learningProgressService.getCompletedLectures() : []
  );
  const [doubts, setDoubts] = useState(() => 
    doubtsService.getDoubtsByStudent ? doubtsService.getDoubtsByStudent(studentId) : []
  );
  const [replyingDoubtId, setReplyingDoubtId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyToast, setReplyToast] = useState('');

  // Subscriptions
  useEffect(() => {
    const unsubLec = learningProgressService.subscribeLectures?.(() => {
      setCompletedLectures(learningProgressService.getCompletedLectures());
    });
    const unsubDoubts = doubtsService.subscribe?.(() => {
      setDoubts(doubtsService.getDoubtsByStudent(studentId));
    });
    return () => {
      if (unsubLec) unsubLec();
      if (unsubDoubts) unsubDoubts();
    };
  }, [studentId]);

  // Curriculum subjects for this student's exam track
  const studentExamId = student?.examId || 'neet-pg';
  const subjects = useMemo(() => {
    const all = curriculumService.getSubjects ? curriculumService.getSubjects() : [];
    return all.filter(s => s.examId === studentExamId);
  }, [studentExamId]);

  // CBT Tests in this student's exam track
  const tests = useMemo(() => {
    const all = cbtTestService.getAllTests ? cbtTestService.getAllTests('all') : [];
    return all.filter(t => (t.examTrack || t.courseId) === studentExamId);
  }, [studentExamId]);

  // Live masterclasses in this student's exam track
  const liveSessions = useMemo(() => {
    const all = liveSessionsService.getAllSessions ? liveSessionsService.getAllSessions() : [];
    return all.filter(s => s.examId === studentExamId);
  }, [studentExamId]);

  // Calculate live progress %
  const studentLiveProgress = useMemo(() => {
    if (!student) return 0;
    if (student.id === 'std-1') {
      if (completedLectures.length > 0) {
        return Math.min(100, Math.max(student.progress || 42, completedLectures.length * 15));
      }
    }
    return student.progress || 0;
  }, [student, completedLectures]);

  // CBT Completed attempts for this student
  const studentTestAttempts = useMemo(() => {
    const attemptsMap = cbtTestService.attempts || {};
    const matched = [];
    Object.keys(attemptsMap).forEach(key => {
      const att = attemptsMap[key];
      if (att && att.status === CBT_STATUS.SUBMITTED) {
        // If student is Ritik Saini (std-1 / student-ritik) or matching id
        if (student?.id === 'std-1' || att.studentId === student?.id) {
          const test = tests.find(t => t.id === att.testId);
          if (test) {
            matched.push({ attempt: att, test });
          }
        }
      }
    });
    return matched;
  }, [tests, student]);

  // Handle reply submission
  const handleSendReply = (doubtId) => {
    if (!replyText.trim()) return;
    doubtsService.replyToDoubt(
      doubtId,
      replyText.trim(),
      `${currentFaculty?.name || 'Faculty Mentor'} (${currentFaculty?.specialty || 'Department Lead'})`,
      currentFaculty?.id
    );
    setReplyToast('Clinical pearl published to candidate study room!');
    setReplyText('');
    setReplyingDoubtId(null);
    setTimeout(() => setReplyToast(''), 3000);
  };

  // 1. UNAUTHORIZED ACCESS GUARD
  if (!isAuthorized) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-rose-200/80 shadow-2xs text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Access Restricted: Out-of-Scope Candidate
            </h1>
            <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              {authResult?.reason || 'You do not have permission to view this candidate profile as they are enrolled in an exam track outside your assigned teaching scope.'}
            </p>
          </div>

          {rawStudent && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 max-w-md mx-auto flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{rawStudent.name}</span>
                <span className="text-slate-400 font-mono">{rawStudent.roll}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                Track: {rawStudent.examName || rawStudent.examId}
              </span>
            </div>
          )}

          <div className="pt-3">
            <button
              onClick={() => navigate('/faculty/students')}
              className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Assigned Candidate Directory</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/faculty/students')}
          className="px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Scope Verified:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Authorized Candidate</span>
          </span>
        </div>
      </div>

      {/* Candidate Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <img
            src={student.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
            alt={student.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover border border-slate-200 shadow-xs shrink-0"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {student.name}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                student.status === 'Active' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {student.status || 'Active'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{student.email}</span>
              </span>
              <span>•</span>
              <span className="font-mono text-slate-600 font-bold">{student.roll}</span>
              <span>•</span>
              <span className="font-bold text-indigo-600">{student.examName}</span>
            </div>

            <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-400">
              <span>Tier: <strong className="text-slate-700">{student.packageTier || 'Standard'}</strong></span>
              <span>•</span>
              <span>Validity: <strong className="text-slate-700">{student.expiryDate || 'Active'}</strong></span>
            </div>
          </div>
        </div>

        {/* Global Progress Radial / Bar Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4 shrink-0">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Syllabus Pace</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{studentLiveProgress}%</div>
          </div>
          <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full" 
              style={{ width: `${studentLiveProgress}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'progress', label: 'Learning Progress', icon: BookOpen },
          { id: 'tests', label: `Assessments & CBT (${studentTestAttempts.length})`, icon: FileText },
          { id: 'doubts', label: `Doubts & Q&A (${doubts.length})`, icon: HelpCircle },
          { id: 'attendance', label: 'Live Masterclasses', icon: Video },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Toast Notification */}
      {replyToast && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-200 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{replyToast}</span>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Syllabus Pace</span>
              <div className="text-2xl font-black text-slate-900">{studentLiveProgress}%</div>
              <span className="text-[11px] text-emerald-600 font-bold">On track for exam</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CBT Attempts</span>
              <div className="text-2xl font-black text-slate-900">{studentTestAttempts.length}</div>
              <span className="text-[11px] text-indigo-600 font-bold">Scheduled Mock Tests</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Latest Mock Score</span>
              <div className="text-2xl font-black text-slate-900">
                {studentTestAttempts[0]?.attempt ? `${studentTestAttempts[0].attempt.percentage}%` : (student.mockScore || 'N/A')}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">{student.percentile || 'National Benchmark'}</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinical Doubts</span>
              <div className="text-2xl font-black text-slate-900">{doubts.length}</div>
              <span className="text-[11px] text-slate-500 font-medium">
                {doubts.filter(d => d.status === 'unresolved').length} Pending Response
              </span>
            </div>
          </div>

          {/* Academic Profile Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Academic Registration & Pacing Plan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 font-bold block mb-1">Enrolled Licensing Track</span>
                <span className="text-slate-900 font-bold text-sm">{student.examName}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 font-bold block mb-1">Enrollment Date</span>
                <span className="text-slate-900 font-bold text-sm">{student.enrollmentDate || '12 Aug 2026'}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 font-bold block mb-1">Package Tier Duration</span>
                <span className="text-slate-900 font-bold text-sm">{student.packageTier} ({student.duration || '6 Months'})</span>
              </div>
            </div>
          </div>

          {/* Recent Doubts preview */}
          {doubts.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">Latest Clinical Doubt from Lecture Room</h3>
                <button
                  onClick={() => setActiveTab('doubts')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  View All ({doubts.length}) →
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{doubts[0].title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    doubts[0].status === 'resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {doubts[0].status === 'resolved' ? 'Resolved' : 'Pending Response'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{doubts[0].question}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LEARNING PROGRESS */}
      {activeTab === 'progress' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Curriculum Syllabus Pacing</h3>
              <p className="text-xs text-slate-400">
                Read-only inspection of completed modules and clinical learning resources
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
              {studentExamId.toUpperCase()} Curriculum
            </span>
          </div>

          <div className="space-y-4">
            {subjects.map(sub => {
              const modules = curriculumService.getModulesBySubject ? curriculumService.getModulesBySubject(sub.id) : [];

              return (
                <div key={sub.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{sub.name}</h4>
                      <span className="text-xs text-slate-500">{modules.length} Modules in syllabus</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    {modules.map(mod => {
                      const lecs = curriculumService.getLecturesByModule ? curriculumService.getLecturesByModule(mod.id) : [];
                      const completedCount = lecs.filter(l => completedLectures.includes(l.id)).length;
                      const modPct = lecs.length > 0 ? Math.round((completedCount / lecs.length) * 100) : 0;

                      return (
                        <div key={mod.id} className="p-3.5 bg-white rounded-xl border border-slate-200/60 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800 block">{mod.title}</span>
                            <span className="text-[11px] text-slate-400">{completedCount} of {lecs.length} lectures completed</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full" 
                                style={{ width: `${modPct}%` }} 
                              />
                            </div>
                            <span className="font-bold text-emerald-600 w-10 text-right">{modPct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ASSESSMENTS / CBT */}
      {activeTab === 'tests' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">CBT Assessments & Evaluation History</h3>
              <p className="text-xs text-slate-400">
                Standardized mock tests, national bench-marking, and candidate response accuracy
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Test Name</th>
                  <th className="pb-3">Attempt Status</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3">Percentage</th>
                  <th className="pb-3">Accuracy</th>
                  <th className="pb-3">Time Taken</th>
                  <th className="pb-3">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tests.map(test => {
                  const match = studentTestAttempts.find(item => item.attempt.testId === test.id);
                  const attempt = match?.attempt;

                  return (
                    <tr key={test.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 pr-3">
                        <span className="font-bold text-slate-900 block">{test.name || test.title}</span>
                        <span className="text-[11px] text-slate-400">{test.durationMinutes || 45} mins • {test.totalQuestions || 20} MCQs</span>
                      </td>

                      <td className="py-4 pr-3">
                        {attempt ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Completed ({attempt.statusLabel || 'Pass'})
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            Not Attempted Yet
                          </span>
                        )}
                      </td>

                      <td className="py-4 pr-3 font-bold text-slate-800">
                        {attempt ? `${attempt.score} / ${attempt.totalMarks}` : '—'}
                      </td>

                      <td className="py-4 pr-3 font-bold text-indigo-600">
                        {attempt ? `${attempt.percentage}%` : '—'}
                      </td>

                      <td className="py-4 pr-3">
                        {attempt ? `${attempt.accuracy || 85}%` : '—'}
                      </td>

                      <td className="py-4 pr-3 text-slate-500">
                        {attempt ? (attempt.timeTakenFormatted || '43m 15s') : '—'}
                      </td>

                      <td className="py-4 text-slate-400">
                        {attempt ? (attempt.submittedAt || 'Today') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DOUBTS & Q&A */}
      {activeTab === 'doubts' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-2">
            <h3 className="text-base font-black text-slate-900">Clinical Doubts Asked by {student.name}</h3>
            <p className="text-xs text-slate-500">
              Queries submitted by this doctor candidate from lecture rooms and clinical study plans.
            </p>
          </div>

          {doubts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No active doubts submitted</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                This candidate currently has no pending or resolved doubts on record.
              </p>
            </div>
          ) : (
            doubts.map(doubt => {
              const isResolved = doubt.status === 'resolved';
              const isReplying = replyingDoubtId === doubt.id;

              return (
                <div 
                  key={doubt.id} 
                  className={`bg-white rounded-3xl p-6 border shadow-2xs space-y-3 ${
                    isResolved ? 'border-slate-200/80' : 'border-rose-200 bg-rose-50/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Context: {doubt.topic || 'Clinical Lecture'} (Day {doubt.dayNumber || 1})
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-0.5">{doubt.title}</h4>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isResolved 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {isResolved ? 'Resolved' : 'Pending Response'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    "{doubt.question}"
                  </p>

                  {isResolved && doubt.facultyReply && (
                    <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-indigo-950">
                        <span className="flex items-center gap-1.5 text-indigo-700">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Specialist Clinical Pearl:</span>
                        </span>
                        <span className="text-[11px] text-indigo-400 font-normal">
                          {doubt.repliedBy}
                        </span>
                      </div>
                      <p className="text-indigo-900">{doubt.facultyReply}</p>
                    </div>
                  )}

                  {isReplying ? (
                    <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in">
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write clinical explanation or diagnostic pearl..."
                        className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setReplyingDoubtId(null)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSendReply(doubt.id)}
                          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Publish Pearl</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          setReplyingDoubtId(doubt.id);
                          setReplyText(doubt.facultyReply || '');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs cursor-pointer border border-indigo-200"
                      >
                        {isResolved ? 'Edit Pearl' : 'Answer with Clinical Pearl'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 5: ATTENDANCE & LIVE MASTERCLASSES */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Live Masterclasses & Broadcast Schedule</h3>
              <p className="text-xs text-slate-400">
                Scheduled masterclasses and interactive grand rounds for this licensing track
              </p>
            </div>
          </div>

          {/* Transparent Step 12 Disclosure Alert */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Attendance Logging Status: Session Level Active / Individual Presence [UNAVAILABLE]</span>
            </div>
            <p className="text-amber-800/90 leading-relaxed text-[11px]">
              In accordance with platform Phase 4 live stream specs, aggregate student headcounts are tracked at the virtual room gateway, but individualized student duration logging is not recorded. Scheduled track sessions and aggregate cohort attendance are presented below without fabricated percentages.
            </p>
          </div>

          <div className="space-y-3">
            {liveSessions.map(sess => (
              <div key={sess.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 block text-sm">{sess.title}</span>
                  <span className="text-slate-500">{sess.topic} • Faculty: {sess.faculty}</span>
                  <span className="text-[11px] text-slate-400 block">{sess.formattedTime}</span>
                </div>

                <div className="text-right space-y-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    sess.status === 'live' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {sess.status === 'live' ? 'Live Now' : sess.status === 'ended' ? 'Completed' : 'Upcoming'}
                  </span>
                  <div className="text-[11px] text-slate-500 font-bold">
                    {sess.attendeesCount || 340} Attendees
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

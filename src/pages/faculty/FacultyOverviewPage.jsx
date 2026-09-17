import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  BookOpen, 
  UploadCloud, 
  Video, 
  FileText, 
  Users, 
  BarChart3, 
  Clock, 
  Radio, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Layers,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  FileCheck
} from 'lucide-react';
import { authService } from '../../services/authService';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import { peopleService } from '../../services/peopleService';
import { 
  liveSessionsService, 
  getLiveSessionStatus, 
  getSessionTimes, 
  SESSION_STATUS 
} from '../../services/liveSessionsService';
import { facultyAnalyticsService } from '../../services/facultyAnalyticsService';
import { questionService } from '../../services/questionService';
import { doubtsService } from '../../services/doubtsService';
import { facultyProfileData } from '../../data/mockData';

export default function FacultyOverviewPage() {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [liveSessions, setLiveSessions] = useState(() => liveSessionsService.getAllSessions());
  const [exams] = useState(() => catalogService.getExams());

  // Derive current faculty profile
  const currentFaculty = useMemo(() => {
    return peopleService.getCurrentFacultyProfile() || {
      id: 'fac-1',
      name: 'Dr. Siddharth V.',
      specialty: 'MD, DM (Interventional Cardiology) • AIIMS New Delhi Senior Clinical Faculty',
      department: 'Clinical Medicine & Therapeutics',
      degrees: 'MD, DM (Cardiology), FACC',
      assignedExams: ['neet-pg', 'usmle', 'plab'],
      assignedExamsLabels: ['NEET PG & NExT', 'USMLE Step 1 & 2', 'PLAB 1 & 2 / UKMLA'],
      assignedSubjects: ['sub-neet-cardio', 'sub-neet-pharma', 'sub-usmle-cvs', 'sub-plab-acute']
    };
  }, [currentUser]);

  const assignedExams = currentFaculty?.assignedExams || ['neet-pg'];

  // Subscribe to live sessions, auth, and doubts
  const [doubtStats, setDoubtStats] = useState(() => doubtsService.getDoubtStatsForScope(assignedExams));
  const [unresolvedDoubts, setUnresolvedDoubts] = useState(() => {
    const allScoped = doubtsService.getDoubtsForFacultyScope(assignedExams, currentFaculty?.id);
    return allScoped.filter(d => d.status === 'unresolved' || d.status === 'OPEN');
  });

  useEffect(() => {
    const unsubLive = liveSessionsService.subscribe((updated) => setLiveSessions([...updated]));
    const unsubAuth = authService.subscribe((u) => setCurrentUser(u));
    const unsubDoubts = doubtsService.subscribe(() => {
      setDoubtStats(doubtsService.getDoubtStatsForScope(assignedExams));
      setUnresolvedDoubts(
        doubtsService
          .getDoubtsForFacultyScope(assignedExams, currentFaculty?.id)
          .filter(d => d.status === 'unresolved' || d.status === 'OPEN')
      );
    });

    return () => {
      unsubLive();
      unsubAuth();
      unsubDoubts();
    };
  }, [assignedExams, currentFaculty?.id]);

  // Derive honest metrics strictly from canonical sources
  const scopedStudents = useMemo(() => {
    return peopleService.getStudentsForScope(assignedExams);
  }, [assignedExams]);

  const questionsCount = useMemo(() => {
    return questionService.getQuestions ? questionService.getQuestions().length : 20;
  }, []);

  const summary = useMemo(() => {
    return facultyAnalyticsService.getDashboardSummary(currentFaculty);
  }, [currentFaculty]);

  // Assigned subjects derivation
  const myAssignedSubjects = useMemo(() => {
    const assignedSubjectIds = currentFaculty?.assignedSubjects || [];
    const cleanFacultyName = currentFaculty?.name ? currentFaculty.name.replace(/^Dr\.\s*/i, '').toLowerCase().trim() : '';
    const allSubjects = curriculumService.getSubjects ? curriculumService.getSubjects() : [];
    return allSubjects.filter(s => 
      assignedSubjectIds.includes(s.id) || 
      (currentFaculty?.email && s.facultyEmail && s.facultyEmail.toLowerCase() === currentFaculty.email.toLowerCase()) ||
      (cleanFacultyName && s.assignedFacultyName && s.assignedFacultyName.toLowerCase().includes(cleanFacultyName))
    );
  }, [currentFaculty]);

  // Derive sessions for assigned scope and identify today's session
  const scopedSessions = useMemo(() => {
    return liveSessions.filter(s => !assignedExams || assignedExams.length === 0 || assignedExams.includes(s.examId));
  }, [liveSessions, assignedExams]);

  const upcomingSessionsCount = useMemo(() => {
    return scopedSessions.filter(s => {
      const status = getLiveSessionStatus(s);
      return status === SESSION_STATUS.UPCOMING || status === SESSION_STATUS.LIVE;
    }).length;
  }, [scopedSessions]);

  // Today's spotlight session logic
  const todaySession = useMemo(() => {
    const now = new Date();
    const isToday = (d) => {
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };

    // 1. Live now in scope
    const liveNow = scopedSessions.find(s => getLiveSessionStatus(s) === SESSION_STATUS.LIVE);
    if (liveNow) return liveNow;

    // 2. Upcoming today
    const upcomingToday = scopedSessions.find(s => {
      if (getLiveSessionStatus(s) !== SESSION_STATUS.UPCOMING) return false;
      const { startTime } = getSessionTimes(s);
      return isToday(startTime);
    });
    if (upcomingToday) return upcomingToday;

    // 3. Any session scheduled today
    const anyToday = scopedSessions.find(s => {
      const { startTime, endTime } = getSessionTimes(s);
      return isToday(startTime) || isToday(endTime);
    });
    if (anyToday) return anyToday;

    // 4. Fallback to first upcoming session if any
    const firstUpcoming = scopedSessions.find(s => getLiveSessionStatus(s) === SESSION_STATUS.UPCOMING);
    return firstUpcoming || null;
  }, [scopedSessions]);

  const todaySessionStatus = todaySession ? getLiveSessionStatus(todaySession) : null;

  // Profile display data
  const facultyName = currentFaculty?.name || 'Dr. Siddharth V.';
  const facultySpecialty = currentFaculty?.specialty || facultyProfileData.specialization;
  const facultyDepartment = currentFaculty?.department || 'Clinical Medicine & Therapeutics';
  const facultyDegrees = currentFaculty?.degrees || 'MD, DM (Cardiology), FACC';
  const examScopeBadges = currentFaculty?.assignedExamsLabels || ['NEET PG & NExT', 'USMLE Step 1 & 2', 'PLAB / UKMLA'];

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* SECTION 1: HERO BANNER (NO FABRICATED RATINGS) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          {/* Overline with Verified Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Faculty Command Center
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Faculty Mentor</span>
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, {facultyName}
          </h1>

          {/* Credentials & Teaching Scope */}
          <div className="space-y-1.5">
            <p className="text-xs sm:text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{facultySpecialty}</span>
              <span className="text-slate-300 mx-2">|</span>
              <span className="text-slate-500">{facultyDepartment} • {facultyDegrees}</span>
            </p>

            {/* Exam Scope Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned Programs:</span>
              {examScopeBadges.map((badge, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-indigo-50/70 border border-indigo-100 text-indigo-700 text-[11px] font-bold"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Primary Command Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/faculty/upload"
            id="faculty-hero-quick-import-btn"
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer hover:shadow-lg"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Quick Content Import</span>
          </Link>

          <Link
            to="/faculty/schedule"
            id="faculty-hero-schedule-btn"
            className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 border border-slate-200/80 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>View Schedule</span>
          </Link>
        </div>
      </div>

      {/* SECTION 2: KPI METRICS STRIP (CANONICAL & DERIVED FIGURES) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { 
            label: 'Assigned Candidates', 
            val: `${scopedStudents.length}`,
            unit: 'Candidates',
            sub: `${summary.activeStudents} Active in scope`,
            icon: Users, 
            color: 'text-indigo-600', 
            bg: 'bg-indigo-50 border-indigo-200' 
          },
          { 
            label: 'Questions Authored', 
            val: `${questionsCount}`,
            unit: 'MCQs',
            sub: 'Clinical Vignette Pool',
            icon: FileText, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50 border-emerald-200' 
          },
          { 
            label: 'Upcoming Sessions', 
            val: `${upcomingSessionsCount}`,
            unit: 'Scheduled',
            sub: 'Live Broadcasts & Rounds',
            icon: Video, 
            color: 'text-rose-600', 
            bg: 'bg-rose-50 border-rose-200' 
          },
          { 
            label: 'Open Doubts', 
            val: `${doubtStats.unresolved}`,
            unit: 'Pending',
            sub: doubtStats.unresolved > 0 ? 'Awaiting Faculty Pearl' : 'All Doubts Resolved',
            icon: HelpCircle, 
            color: 'text-purple-600', 
            bg: 'bg-purple-50 border-purple-200' 
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                <div className={`w-8 h-8 rounded-xl ${kpi.bg} border flex items-center justify-center ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{kpi.val}</span>
                <span className="text-xs font-semibold text-slate-500">{kpi.unit}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {kpi.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* SECTION 3: TODAY'S TEACHING / LIVE SPOTLIGHT (LIFECYCLE-AWARE) */}
      {todaySession ? (
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-indigo-500/20">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                {todaySessionStatus === SESSION_STATUS.LIVE ? (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400">
                      Live Broadcast In Progress
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                      Scheduled Live Masterclass • Today
                    </span>
                  </>
                )}
                <span className="text-slate-600">•</span>
                <span className="text-xs text-indigo-300 font-semibold">{todaySession.examName || todaySession.course || 'NEET PG & NExT'}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {todaySession.title}
              </h2>

              {todaySession.topic && (
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-1">
                  Topic: {todaySession.topic}
                </p>
              )}

              <p className="text-xs text-slate-400 flex flex-wrap items-center gap-4 pt-1">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  {todaySession.formattedTime || todaySession.time || '8:00 PM IST'} ({todaySession.duration || '1 hr 15 min'})
                </span>
                {todaySession.attendeesCount && (
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    Enrolled Attendees: {todaySession.attendeesCount}
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {todaySession.meetingLink ? (
                <a
                  href={todaySession.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  id="faculty-start-live-btn"
                  className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>{todaySessionStatus === SESSION_STATUS.LIVE ? 'Enter Live Broadcast' : 'Launch Broadcast Room'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : null}

              <Link
                to="/faculty/live-sessions"
                id="faculty-all-sessions-btn"
                className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all cursor-pointer"
              >
                All Sessions
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Empty state when no sessions are scheduled today */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                No Live Teaching Sessions Scheduled Today
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                You have no upcoming live masterclasses or grand rounds scheduled for today. Review your delivery timetable or schedule a new broadcast session.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/faculty/schedule"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Full Schedule</span>
            </Link>
            <Link
              to="/faculty/live-sessions"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Schedule Class</span>
            </Link>
          </div>
        </div>
      )}

      {/* SECTION 4: FACULTY WORKFLOW LAUNCHPAD (6 CANONICAL CARDS) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Faculty Workflows & Tools
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct access to core faculty delivery, curriculum management, and clinical assessment modules.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'My Programs',
              desc: 'Browse assigned medical licensing programs, subjects, and curriculum syllabus.',
              icon: BookOpen,
              route: '/faculty/exams',
              actionLabel: 'View Curriculum',
              color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
            },
            {
              title: 'Quick Content Import',
              desc: 'Rapid cascading course ➡️ week ➡️ day content uploader for notes, videos & clinical pearls.',
              icon: UploadCloud,
              route: '/faculty/upload',
              actionLabel: 'Import Content',
              color: 'text-blue-600 bg-blue-50 border-blue-200'
            },
            {
              title: 'My Schedule',
              desc: 'View delivery timetable, teaching slots, and preview assigned delivery days.',
              icon: Calendar,
              route: '/faculty/schedule',
              actionLabel: 'Open Schedule',
              color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
            },
            {
              title: 'Live Sessions',
              desc: 'Host interactive grand rounds, live broadcasts, and clinical masterclasses.',
              icon: Video,
              route: '/faculty/live-sessions',
              actionLabel: 'Manage Sessions',
              color: 'text-rose-600 bg-rose-50 border-rose-200'
            },
            {
              title: 'Tests & Assessments',
              desc: 'Review clinical CBT exams, assess attempt submissions, and track pass rates.',
              icon: FileCheck,
              route: '/faculty/tests',
              actionLabel: 'View Assessments',
              color: 'text-purple-600 bg-purple-50 border-purple-200'
            },
            {
              title: 'Question Bank',
              desc: 'Author, curate, and review multi-tier clinical vignette MCQs with high-yield rationale.',
              icon: Layers,
              route: '/faculty/questions',
              actionLabel: 'Manage Questions',
              color: 'text-amber-600 bg-amber-50 border-amber-200'
            }
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <Link
                key={i}
                to={card.route}
                id={`workflow-card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-xl ${card.color} border flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  <span>{card.actionLabel}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: SECONDARY SPLIT (NEEDS ATTENTION & TEACHING INSIGHTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Needs Attention (Clinical Doubts) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Needs Attention</h3>
                  <p className="text-[11px] text-slate-500">Candidate doubts awaiting faculty clinical pearls</p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                {doubtStats.unresolved} Open
              </span>
            </div>

            {/* List of open doubts */}
            {unresolvedDoubts.length > 0 ? (
              <div className="space-y-3 pt-1">
                {unresolvedDoubts.slice(0, 3).map((doubt) => (
                  <div 
                    key={doubt.id} 
                    className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-purple-200 hover:bg-purple-50/20 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {doubt.studentAvatar ? (
                          <img 
                            src={doubt.studentAvatar} 
                            alt={doubt.studentName} 
                            className="w-5 h-5 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-200 text-[10px] font-bold flex items-center justify-center text-slate-600">
                            {doubt.studentName ? doubt.studentName.charAt(0) : 'D'}
                          </div>
                        )}
                        <span className="text-xs font-bold text-slate-800">{doubt.studentName}</span>
                      </div>
                      {doubt.urgency === 'high' && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">
                          High Priority
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {doubt.title}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {doubt.topic} • Day {doubt.dayNumber}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-700">All Candidate Doubts Resolved</p>
                <p className="text-[11px] text-slate-400">There are no pending clinical questions in your teaching queue.</p>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/faculty/doubts"
              id="faculty-review-doubts-btn"
              className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-purple-200 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Review Doubts Desk ({doubtStats.unresolved} Open)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: Teaching Insights (Pure Derived Analytics) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Teaching Insights</h3>
                  <p className="text-[11px] text-slate-500">Real-time derived metrics across your candidate cohorts</p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Live Derivations
              </span>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Curriculum Coverage</span>
                <div className="text-lg font-black text-slate-900">{summary.overallProgressLabel}</div>
                <span className="text-[10px] text-slate-500">Syllabus completion</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CBT Cohort Average</span>
                <div className="text-lg font-black text-slate-900">{summary.averageScoreLabel}</div>
                <span className="text-[10px] text-slate-500">Clinical assessments</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Doubts Resolution</span>
                <div className="text-lg font-black text-slate-900">
                  {doubtStats.resolved} / {doubtStats.total}
                </div>
                <span className="text-[10px] text-slate-500">
                  {Math.round((doubtStats.resolved / (doubtStats.total || 1)) * 100)}% Answered
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enrolled Doctors</span>
                <div className="text-lg font-black text-slate-900">{summary.activeStudents} Active</div>
                <span className="text-[10px] text-slate-500">In assigned scope</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/faculty/analytics"
              id="faculty-view-analytics-btn"
              className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-amber-200 cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>View Teaching Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 6: MY ASSIGNED PROGRAMS & SUBJECTS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900">
              My Assigned Programs & Subjects
            </h3>
            <p className="text-xs text-slate-500">
              Curriculum tracks and subjects assigned to your faculty profile for syllabus management and content delivery.
            </p>
          </div>

          <Link
            to="/faculty/exams"
            id="faculty-view-all-curriculum-btn"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>View All Programs & Curriculum</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {myAssignedSubjects.map((sub) => {
            const examObj = exams.find(e => e.id === sub.examId);
            const modulesCount = curriculumService.getModules ? curriculumService.getModules(sub.id, sub.examId).length : 0;
            const lecturesCount = curriculumService.getLectures ? curriculumService.getLectures(null, sub.id, sub.examId).length : 0;

            return (
              <div
                key={sub.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-white transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{examObj?.flag || '🩺'}</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Lead Specialist
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400">{examObj?.name || (sub.examId && sub.examId.toUpperCase())}</span>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {sub.name}
                  </h4>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold pt-1 border-t border-slate-200/60">
                  <span>{modulesCount} Modules</span>
                  <span>•</span>
                  <span>{lecturesCount} Lectures</span>
                </div>

                <div className="pt-2">
                  <Link
                    to={`/faculty/exams/${sub.examId}/subjects/${sub.id}/modules`}
                    className="w-full py-2 rounded-xl bg-white group-hover:bg-indigo-600 text-slate-700 group-hover:text-white border border-slate-200 group-hover:border-indigo-600 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>Manage Modules</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

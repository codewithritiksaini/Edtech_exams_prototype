import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  Flame, 
  Play, 
  CheckCircle2, 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Award, 
  Video, 
  FileText, 
  Brain, 
  Sparkles, 
  Users, 
  Radio, 
  HelpCircle,
  BarChart3,
  CalendarCheck2,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  TrendingUp,
  AlertCircle,
  X,
  Download,
  Search,
  Mail,
  Bell,
  CreditCard,
  Target,
  FileCheck,
  GraduationCap,
  Layers,
  Settings,
  Filter,
  FolderTree
} from 'lucide-react';
import DashboardNavbar from '../components/DashboardNavbar';
import DashboardSidebar from '../components/DashboardSidebar';
import LiveSessionModal from '../components/LiveSessionModal';
import TestTakingModal from '../components/TestTakingModal';
import { 
  dashboardUserData, 
  studyPlanWeeks, 
  dashboardTests,
  testService 
} from '../data/mockData';
import { liveSessionsService, getFeaturedSession } from '../services/liveSessionsService';
import { curriculumService } from '../services/curriculumService';

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Dynamic query params from Phase 2 or fallback to default mock
  // Dynamic query params or active state
  const enrolledPlan = searchParams.get('plan') || dashboardUserData.packageTier;

  // Live Sessions integration
  const [dashboardLiveSessions, setDashboardLiveSessions] = useState(() => liveSessionsService.getAllSessions());
  useEffect(() => {
    const unsub = liveSessionsService.subscribe((updated) => {
      setDashboardLiveSessions([...updated]);
    });
    return () => unsub();
  }, []);
  const featuredSession = getFeaturedSession(dashboardLiveSessions) || dashboardLiveSessions[0] || {};
  const examParam = searchParams.get('exam');
  
  const [selectedExamTrack, setSelectedExamTrack] = useState(() => {
    if (examParam === 'usmle' || examParam === 'usmle-step1') return 'usmle';
    if (examParam === 'plab' || examParam === 'plab-ukmla') return 'plab';
    if (examParam === 'europe' || examParam === 'europe-licensing') return 'europe';
    return 'neet-pg';
  });

  const enrolledCourse = selectedExamTrack === 'usmle' 
    ? 'USMLE Step 1 & Step 2 CK' 
    : selectedExamTrack === 'plab' 
      ? 'PLAB 1 & 2 / UKMLA' 
      : selectedExamTrack === 'europe' 
        ? 'Europe Medical Licensing' 
        : dashboardUserData.enrolledCourse;

  // Reactive Curriculum Data from curriculumService
  const [curriculumSubjects, setCurriculumSubjects] = useState(() => curriculumService.getSubjects(selectedExamTrack));
  const [curriculumModules, setCurriculumModules] = useState(() => curriculumService.getModules(null, selectedExamTrack));
  const [curriculumSchedule, setCurriculumSchedule] = useState(() => curriculumService.getSchedule(selectedExamTrack));
  const [inspectingSubject, setInspectingSubject] = useState(null);

  useEffect(() => {
    const unsubC = curriculumService.subscribeCurriculum(() => {
      setCurriculumSubjects(curriculumService.getSubjects(selectedExamTrack));
      setCurriculumModules(curriculumService.getModules(null, selectedExamTrack));
    });
    const unsubS = curriculumService.subscribeSchedule(() => {
      setCurriculumSchedule(curriculumService.getSchedule(selectedExamTrack));
    });
    return () => {
      unsubC();
      unsubS();
    };
  }, [selectedExamTrack]);

  useEffect(() => {
    setCurriculumSubjects(curriculumService.getSubjects(selectedExamTrack));
    setCurriculumModules(curriculumService.getModules(null, selectedExamTrack));
    setCurriculumSchedule(curriculumService.getSchedule(selectedExamTrack));
  }, [selectedExamTrack]);

  // Reactive Tests Store for Phase 6
  const [testsList, setTestsList] = useState(() => testService.getTests());

  useEffect(() => {
    const handleTestsUpdate = () => {
      setTestsList(testService.getTests());
    };
    window.addEventListener('medprep-tests-updated', handleTestsUpdate);
    return () => window.removeEventListener('medprep-tests-updated', handleTestsUpdate);
  }, []);

  // Active upcoming/live test
  const activeTest = testsList.find((t) => t.id === 'test-cardio-01') || testsList[0];

  // Phase 7 Navigation: Completed Day tracking from Day Content View
  const completedDayParam = searchParams.get('completedDay');
  const [completedDaysList, setCompletedDaysList] = useState(() => {
    return completedDayParam ? [parseInt(completedDayParam, 10)] : [];
  });
  const [completionBanner, setCompletionBanner] = useState(() => {
    return completedDayParam ? `🎉 Excellent progress! Day ${completedDayParam} has been marked as Completed.` : '';
  });

  useEffect(() => {
    if (completedDayParam) {
      const dayNum = parseInt(completedDayParam, 10);
      setCompletedDaysList((prev) => Array.from(new Set([...prev, dayNum])));
      setCompletionBanner(`🎉 Excellent progress! Day ${dayNum} has been marked as Completed.`);
      const timer = setTimeout(() => setCompletionBanner(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [completedDayParam]);

  // Sidebar & Tab view state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedLiveSession, setSelectedLiveSession] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);

  // Study Plan Week Expansion state
  const [expandedWeeks, setExpandedWeeks] = useState({ 1: true, 2: false, 3: false, 4: false });

  // Dynamically resolve study plan weeks from curriculumService
  const resolvedStudyPlanWeeks = useMemo(() => {
    if (!curriculumSchedule || curriculumSchedule.length === 0) {
      return studyPlanWeeks;
    }

    const weekMap = {};
    curriculumSchedule.forEach((slot) => {
      const wk = slot.weekNumber || 1;
      if (!weekMap[wk]) {
        weekMap[wk] = [];
      }
      weekMap[wk].push(slot);
    });

    const sortedWeeks = Object.keys(weekMap).map(Number).sort((a, b) => a - b);
    const allLectures = curriculumService.getLectures();

    return sortedWeeks.map((wkNum) => {
      const slots = weekMap[wkNum].sort((a, b) => a.dayNumber - b.dayNumber);
      const firstSlot = slots[0];
      const subject = curriculumSubjects.find((s) => s.id === firstSlot?.subjectId);
      const module = curriculumModules.find((c) => c.id === firstSlot?.moduleId);

      const days = slots.map((s) => {
        const isMarkedCompleted = completedDaysList.includes(s.dayNumber);
        let status = 'available';
        if (s.status === 'Locked') {
          status = 'locked';
        } else if (isMarkedCompleted || (selectedExamTrack === 'neet-pg' && s.dayNumber < 3)) {
          status = 'completed';
        } else if (selectedExamTrack === 'neet-pg' && s.dayNumber === 3) {
          status = 'in-progress';
        } else if (s.status === 'Active') {
          status = 'available';
        } else if (s.status === 'Scheduled') {
          status = 'scheduled';
        } else {
          status = 'available';
        }

        const linkedLectures = (s.lectureIds || []).map((tId) => {
          const top = allLectures.find((t) => t.id === tId);
          return top?.title;
        }).filter(Boolean);

        return {
          dayNumber: s.dayNumber,
          title: s.dayTitle,
          duration: s.estimatedTime || '1.5 hours',
          status,
          score: s.dayNumber === 1 ? '18/20 (90%)' : s.dayNumber === 2 ? '17/20 (85%)' : undefined,
          lectures: linkedLectures.length > 0 ? linkedLectures : undefined,
          hasLive: s.hasLive,
          hasTest: s.hasTest
        };
      });

      const completedCount = days.filter((d) => d.status === 'completed').length;
      const completionRate = `${Math.round((completedCount / (days.length || 1)) * 100)}%`;

      return {
        weekNumber: wkNum,
        title: subject ? subject.name : `Week ${wkNum} Core Curriculum`,
        description: module ? module.title : 'High-Yield Clinical Module',
        badge: wkNum === 1 ? 'Active Track' : 'Upcoming Track',
        status: wkNum === 1 ? 'current' : 'upcoming',
        completionRate,
        days
      };
    });
  }, [curriculumSchedule, curriculumSubjects, curriculumModules, completedDaysList]);

  const toggleWeek = (weekNum) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekNum]: !prev[weekNum]
    }));
  };

  const handleDayClick = (day) => {
    if (day.status === 'locked') return;
    navigate(`/day/${day.dayNumber}`);
  };

  const handleJoinLive = (session) => {
    setSelectedLiveSession(session);
  };

  const handleAttemptTest = (test) => {
    setSelectedTest(test);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* 1. Top Navbar (Logged-in Version) */}
      <DashboardNavbar 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-grow flex">
        
        {/* 2. Left Sidebar (Persistent Navigation) */}
        <DashboardSidebar 
          activeTab={activeTab}
          onSelectTab={(tabId) => {
            setActiveTab(tabId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          
          {/* Phase 7 Return Notification Banner */}
          {completionBanner && (
            <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
                <span className="text-xs sm:text-sm font-bold">{completionBanner}</span>
              </div>
              <button
                onClick={() => setCompletionBanner('')}
                className="p-1 hover:bg-emerald-700 rounded-lg text-emerald-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: DASHBOARD (HOME / OVERVIEW)                                        */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in">
              
              {/* Welcome Banner */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden text-slate-900">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Enrolled: {enrolledPlan}</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                      Welcome back, <span className="text-brand-600">{dashboardUserData.name}</span>
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                      Your personalized clinical study space for <strong className="text-slate-800">{enrolledCourse}</strong>. 
                      Week 1 Cardiology & Hemodynamics is currently active.
                    </p>
                  </div>

                  {/* Days remaining countdown pill */}
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0">
                    <div className="text-center px-2">
                      <div className="text-2xl sm:text-3xl font-black text-amber-600 font-sans">
                        {dashboardUserData.daysLeft}
                      </div>
                      <span className="text-[11px] text-slate-500 font-semibold block uppercase tracking-wider">Days Left</span>
                    </div>
                    <div className="w-px h-10 bg-slate-200" />
                    <div className="text-center px-2">
                      <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-sans">
                        {dashboardUserData.overallProgress}%
                      </div>
                      <span className="text-[11px] text-slate-500 font-semibold block uppercase tracking-wider">Complete</span>
                    </div>
                  </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 mb-2 gap-2">
                    <span className="font-semibold flex items-center gap-2">
                      <span>Curriculum Progression</span>
                      <span className="text-slate-400">({dashboardUserData.overallProgress}% Complete)</span>
                    </span>
                    <span className="text-brand-600 font-bold">Target Exam: {dashboardUserData.targetExamDate}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-500 rounded-full transition-all duration-500" 
                      style={{ width: `${dashboardUserData.overallProgress}%` }}
                    />
                  </div>
                </div>
              </section>

              {/* 4 Quick Access KPI Cards */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* 1. Continue Learning */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                        NEXT UP
                      </span>
                      <span className="text-xs text-brand-600 font-bold">Day 3</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      Cardiac Arrhythmias & ECG Interpretation
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Narrow vs wide complex tachycardia and AV conduction blocks.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-brand-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                      In Progress
                    </span>
                    <button
                      onClick={() => navigate('/day/3')}
                      className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1 group/btn cursor-pointer"
                    >
                      <span>Resume</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* 2. Next Live Session */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        LIVE TONIGHT
                      </span>
                      <span className="text-xs text-slate-500">8:00 PM IST</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      STEMI & Acute ECG Grand Rounds
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Taught by Dr. Siddharth V. (AIIMS New Delhi Faculty).
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">340+ Registered</span>
                    <button
                      onClick={() => handleJoinLive(featuredSession)}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Join</span>
                    </button>
                  </div>
                </div>

                {/* 3. Upcoming Test Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        activeTest.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {activeTest.status === 'Completed' ? 'TEST COMPLETED' : 'SCHEDULED ASSESSMENT'}
                      </span>
                      <span className="text-xs text-slate-500">{activeTest.duration}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {activeTest.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {activeTest.status === 'Completed' ? (
                        <span className="text-emerald-700 font-semibold">
                          Your Score: {activeTest.score} ({activeTest.percentile || '94.2%ile'}) • PASSED
                        </span>
                      ) : (
                        <span>{activeTest.questionsCount || 20} clinical vignette questions • +5 / -1 marking scheme.</span>
                      )}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs">
                      {activeTest.status === 'Completed' ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Result Ready</span>
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{activeTest.startsIn || 'Live Window Active'}</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => navigate(`/test/${activeTest.id}`)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer ${
                        activeTest.status === 'Completed'
                          ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                          : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/20'
                      }`}
                    >
                      <span>{activeTest.status === 'Completed' ? 'Review Answers' : 'View Details & Start'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 4. This Week's Progress */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        WEEK 1 PACE
                      </span>
                      <span className="text-xs font-bold text-slate-700">Goal: 7/7 Days</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      4 of 7 Days Completed
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Daily study pace is on track for the Sunday Grand Test.
                    </p>
                  </div>

                  {/* Visual Day Bubbles (Mon-Sun) */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayChar, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-semibold">{dayChar}</span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          i < 2 
                            ? 'bg-emerald-500 text-white' 
                            : i === 2 
                              ? 'bg-brand-600 text-white ring-2 ring-brand-300' 
                              : 'bg-slate-100 text-slate-400'
                        }`}>
                          {i < 2 ? '✓' : i === 2 ? '3' : '•'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </section>

              {/* Today's Schedule & Clinical Milestones */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <CalendarCheck2 className="w-5 h-5 text-brand-600" />
                      <span>Today's Clinical Study Schedule & Milestones</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Target 3.5 hours active recall • 3 key tasks remaining today
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('plan')}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                  >
                    <span>View Full 28-Day Plan</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      ✓
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-emerald-800 uppercase">Completed • 09:30 AM</div>
                      <h4 className="text-xs font-bold text-slate-900">Valvular Murmurs Auscultation</h4>
                      <p className="text-[11px] text-slate-600">30 min video breakdown & phonocardiograms.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200/80 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
                      ▶
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-brand-700 uppercase">Active Now • 02:00 PM</div>
                      <h4 className="text-xs font-bold text-slate-900">ECG Arrhythmias Drill (Day 3)</h4>
                      <p className="text-[11px] text-slate-600">Complete 25 high-yield flashcards.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200/80 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      🔴
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-red-700 uppercase">Tonight • 08:00 PM</div>
                      <h4 className="text-xs font-bold text-slate-900">Live STEMI Grand Rounds</h4>
                      <p className="text-[11px] text-slate-600">With Dr. Siddharth V. (AIIMS Lead).</p>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: MY COURSE(S)                                                       */}
          {/* ========================================================================= */}
          {activeTab === 'courses' && (
            <div className="space-y-8 animate-in fade-in">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider mb-2">
                    <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                    <span>Curriculum & Program Portal</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    My Enrolled Course(s)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Complete medical specialization syllabus, faculty leads, and module progression.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => alert('Downloading official high-yield course syllabus (PDF)...')}
                    className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span>Download Syllabus PDF</span>
                  </button>
                </div>
              </div>

              {/* Course Track Switcher */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-1 shrink-0 flex items-center gap-1.5 mr-1">
                  <Layers className="w-3.5 h-3.5" />
                  Select Program Track:
                </span>
                {[
                  { id: 'neet-pg', name: 'NEET PG & NExT', flag: '🇮🇳' },
                  { id: 'usmle', name: 'USMLE Step 1/2', flag: '🇺🇸' },
                  { id: 'plab', name: 'PLAB 1 & 2 / UKMLA', flag: '🇬🇧' },
                  { id: 'europe', name: 'Europe Licensing (FSP)', flag: '🇪🇺' }
                ].map(track => (
                  <button
                    key={track.id}
                    onClick={() => setSelectedExamTrack(track.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      selectedExamTrack === track.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{track.flag}</span>
                    <span>{track.name}</span>
                  </button>
                ))}
              </div>

              {/* Active Program Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-200 shadow-sm relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
                        Primary Enrollment Track
                      </span>
                      <span className="text-xs text-slate-400 font-mono">ID: MED-PRO-2026</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      {enrolledCourse} — Master Preparation Program
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Comprehensive clinical preparation covering all 19 medical subjects with clinical vignettes, 
                      daily spaced-repetition flashcards, live AIIMS/NHS grand rounds, and national CBT mock exams.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Clock className="w-4 h-4 text-brand-600" />
                        <span>Valid Until: Nov 29, 2026</span>
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <span>Cohort: Batch Alpha 2026</span>
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span>Tier: {enrolledPlan}</span>
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center shrink-0 min-w-[220px] space-y-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Completion</div>
                    <div className="text-4xl font-black text-brand-600">32%</div>
                    <p className="text-[11px] text-slate-500">28 of 88 Daily Modules Done</p>
                    <button
                      onClick={() => setActiveTab('plan')}
                      className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Open Study Plan
                    </button>
                  </div>
                </div>
              </div>

              {/* Subject Module Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-brand-600" />
                    <span>Subject Modules & Progress Tracker</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    {curriculumSubjects.length} Accredited Disciplines
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {curriculumSubjects.map((sub, i) => {
                    const subModules = curriculumModules.filter(c => c.subjectId === sub.id);
                    const allLectures = curriculumService.getLectures();
                    const subLectures = allLectures.filter(t => subModules.some(c => c.id === t.moduleId));
                    const pct = i === 0 ? 85 : i === 1 ? 40 : i === 2 ? 15 : 0;
                    const statusText = i === 0 ? 'Active Module' : i === 1 ? 'Next Up' : sub.status;

                    return (
                      <div key={sub.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            i === 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {sub.code} • {statusText}
                          </span>
                          <span className="text-xs font-black text-slate-900">{pct}%</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{sub.name}</h4>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{sub.description}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                          <span className="font-semibold text-slate-700">{subModules.length} Modules</span>
                          <span>•</span>
                          <span>{subLectures.length} Lectures</span>
                        </div>
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                            <span>Clinical Mastery</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-brand-600 rounded-full transition-all" 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => setInspectingSubject(sub)}
                          className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                          <span>View Modules & Lectures ({subModules.length})</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Faculty Mentors Section */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-brand-600" />
                  <span>Assigned Faculty Mentors for Your Course</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { name: 'Dr. Siddharth V.', spec: 'MD Medicine (AIIMS New Delhi)', role: 'Cardiology & Emergency Lead', rating: '4.9 ★' },
                    { name: 'Dr. Priya Sharma', spec: 'MD Pharmacology (PGI Chandigarh)', role: 'Clinical Neuro & Pharmacology Lead', rating: '4.8 ★' },
                    { name: 'Dr. Marcus Vance', spec: 'MRCP (UK), USMLE Step 1/2 265+', role: 'International Advisory Lead', rating: '4.9 ★' },
                  ].map((fac, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-xs">{fac.name}</h4>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">{fac.rating}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-brand-700">{fac.spec}</p>
                      <p className="text-[11px] text-slate-500">{fac.role}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: STUDY PLAN (28-DAY CURRICULUM ROADMAP)                             */}
          {/* ========================================================================= */}
          {activeTab === 'plan' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider mb-2">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    <span>Drip-Fed Structured Syllabus</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Your Study Plan
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Structured week-by-week clinical curriculum. Click on any unlocked Day to view notes, video lessons, and active flashcards.
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 font-semibold text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Completed
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-brand-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                    In Progress
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-400">
                    <Lock className="w-3 h-3" />
                    Locked
                  </span>
                </div>
              </div>

              {/* Study Plan Program Track Switcher */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-1 shrink-0 flex items-center gap-1.5 mr-1">
                  <Layers className="w-3.5 h-3.5" />
                  Exam Track:
                </span>
                {[
                  { id: 'neet-pg', name: 'NEET PG & NExT', flag: '🇮🇳' },
                  { id: 'usmle', name: 'USMLE Step 1/2', flag: '🇺🇸' },
                  { id: 'plab', name: 'PLAB 1 & 2 / UKMLA', flag: '🇬🇧' },
                  { id: 'europe', name: 'Europe Licensing (FSP)', flag: '🇪🇺' }
                ].map(track => (
                  <button
                    key={track.id}
                    onClick={() => setSelectedExamTrack(track.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      selectedExamTrack === track.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{track.flag}</span>
                    <span>{track.name}</span>
                  </button>
                ))}
              </div>

              {/* Expandable Week Cards */}
              <div className="space-y-4">
                {resolvedStudyPlanWeeks.map((week) => {
                  const isExpanded = expandedWeeks[week.weekNumber];
                  const isCurrentWeek = week.status === 'current';

                  return (
                    <div
                      key={week.weekNumber}
                      className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                        isCurrentWeek
                          ? 'border-brand-300 shadow-md ring-1 ring-brand-500/10'
                          : 'border-slate-200 shadow-sm'
                      }`}
                    >
                      
                      {/* Week Header Accordion Bar */}
                      <div
                        onClick={() => toggleWeek(week.weekNumber)}
                        className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-extrabold text-base ${
                            isCurrentWeek 
                              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            W{week.weekNumber}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                                Week {week.weekNumber} — {week.title}
                              </h3>
                              {isCurrentWeek && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 uppercase tracking-wide">
                                  Active Week
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {week.description} • <span className="font-semibold text-brand-700">{week.badge}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                            Progress: {week.completionRate}
                          </span>
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                            isExpanded ? 'bg-slate-100 rotate-180' : 'bg-slate-50'
                          }`}>
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          </span>
                        </div>
                      </div>

                      {/* Week Days List (When Expanded) */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 divide-y divide-slate-100 bg-slate-50/40">
                          {week.days.map((day) => {
                            const isMarkedCompleted = completedDaysList.includes(day.dayNumber);
                            const isCompleted = day.status === 'completed' || isMarkedCompleted;
                            const isInProgress = !isCompleted && day.status === 'in-progress';
                            const isAvailable = !isCompleted && !isInProgress && (day.status === 'available' || day.status === 'scheduled');
                            const isLocked = !isCompleted && !isInProgress && !isAvailable && day.status === 'locked';

                            return (
                              <div
                                key={day.dayNumber}
                                onClick={() => handleDayClick(day)}
                                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                                  isLocked
                                    ? 'opacity-60 bg-slate-50/80 cursor-not-allowed'
                                    : isInProgress
                                      ? 'bg-brand-50/50 hover:bg-brand-50 cursor-pointer border-l-4 border-brand-500'
                                      : 'hover:bg-white cursor-pointer'
                                }`}
                              >
                                <div className="flex items-start sm:items-center gap-3.5">
                                  
                                  {/* Status Indicator Icon */}
                                  <div className="shrink-0 mt-0.5 sm:mt-0">
                                    {isCompleted && (
                                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                                        <CheckCircle2 className="w-5 h-5" />
                                      </div>
                                    )}
                                    {isInProgress && (
                                      <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-sm shadow-brand-500/30 animate-pulse">
                                        <Play className="w-4 h-4 fill-current ml-0.5" />
                                      </div>
                                    )}
                                    {isAvailable && (
                                      <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-200">
                                        <BookOpen className="w-4 h-4" />
                                      </div>
                                    )}
                                    {isLocked && (
                                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center">
                                        <Lock className="w-4 h-4" />
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-bold text-slate-400 uppercase">
                                        Day {day.dayNumber}
                                      </span>
                                      {isInProgress && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-600 text-white uppercase tracking-wider">
                                          Current Day
                                        </span>
                                      )}
                                      {isCompleted && day.score && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                          Drill Score: {day.score}
                                        </span>
                                      )}
                                      {day.hasLive && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                                          🔴 Live Rounds
                                        </span>
                                      )}
                                      {day.hasTest && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                                          📝 CBT Test
                                        </span>
                                      )}
                                    </div>

                                    <h4 className={`text-sm sm:text-base font-bold mt-0.5 ${
                                      isLocked ? 'text-slate-500' : 'text-slate-900 hover:text-brand-600'
                                    }`}>
                                      {day.title}
                                    </h4>

                                    {day.lectures && (
                                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                        {day.lectures.map((t, idx) => (
                                          <span key={idx} className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200/60">
                                            {t}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Right Action Button */}
                                <div className="flex items-center justify-end gap-3 shrink-0">
                                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                                    <Clock className="w-3.5 h-3.5" />
                                    {day.duration}
                                  </span>

                                  {!isLocked ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDayClick(day);
                                      }}
                                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                                        isCompleted
                                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                          : isInProgress
                                            ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
                                            : 'bg-white hover:bg-brand-50 hover:text-brand-700 text-slate-700 border border-slate-200'
                                      }`}
                                    >
                                      <span>{isCompleted ? 'Review Day' : isInProgress ? 'Resume Day' : 'Start Study'}</span>
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded-lg">
                                      Locked
                                    </span>
                                  )}
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: LIVE SESSIONS HUB                                                  */}
          {/* ========================================================================= */}
          {activeTab === 'live' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider mb-2">
                    <Radio className="w-3.5 h-3.5 text-red-600" />
                    <span>Interactive Faculty Broadcast Hub</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Live Faculty Sessions & Grand Rounds
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Attend interactive clinical case discussions, differential diagnosis drills, and ask real-time doubts.
                  </p>
                </div>

                <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl self-start sm:self-auto shadow-xs">
                  Next Session: <strong>Tonight @ 8:00 PM IST</strong>
                </span>
              </div>

              {/* Featured Tonight Live Session Card */}
              <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      <span>TONIGHT'S FEATURED CLINICAL GRAND ROUNDS</span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black">
                      STEMI & Acute ECG Grand Rounds: Localization & Reperfusion
                    </h3>

                    <p className="text-xs sm:text-sm text-red-100 leading-relaxed">
                      Deep-dive case study of anteroseptal vs inferior STEMI, Sgarbossa criteria, ventricular arrhythmias, 
                      and emergency cath-lab activation guidelines.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-red-100">
                      <span>👨‍⚕️ Dr. Siddharth V. (AIIMS New Delhi Faculty)</span>
                      <span>•</span>
                      <span>⏱ 1.5 Hours Interactive Class</span>
                      <span>•</span>
                      <span>👥 340+ Doctors Registered</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 shrink-0">
                    <button
                      onClick={() => handleJoinLive(featuredSession)}
                      className="px-6 py-3.5 bg-white text-red-700 hover:bg-red-50 font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      <Radio className="w-4 h-4 text-red-600 animate-pulse" />
                      <span>Join Live Broadcast Room</span>
                    </button>
                    <button
                      onClick={() => alert('Added to Google Calendar!')}
                      className="text-xs text-white/80 hover:text-white text-center font-medium"
                    >
                      + Add to Calendar
                    </button>
                  </div>
                </div>
              </div>

              {/* Upcoming Live Sessions Grid */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">Upcoming Live Class Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {dashboardLiveSessions.map((session) => {
                    const isLiveSoon = session.status === 'Live Soon';
                    return (
                      <div
                        key={session.id}
                        className={`rounded-2xl p-5 border flex flex-col justify-between transition-all bg-white ${
                          isLiveSoon
                            ? 'border-red-300 ring-1 ring-red-400/20 shadow-sm'
                            : 'border-slate-200 shadow-xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isLiveSoon ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {session.badge}
                            </span>
                            <span className="text-xs font-bold text-slate-600">{session.time}</span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                            {session.title}
                          </h4>

                          <p className="text-xs font-semibold text-brand-700 mb-2">
                            {session.faculty}
                          </p>

                          <p className="text-xs text-slate-500 leading-relaxed mb-4">
                            {session.description}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => alert(`Session reminder set: ${session.title}`)}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            + Reminder
                          </button>

                          <button
                            onClick={() => handleJoinLive(session)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                              isLiveSoon
                                ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <Radio className="w-3.5 h-3.5" />
                            <span>Join Session</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recorded Lectures Archive */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Recorded Masterclasses Archive</h3>
                  <span className="text-xs text-slate-400">Available 24/7 on Demand</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {[
                    { title: 'Cardiology ECG Masterclass: Axis & Conduction Abnormalities', date: 'Sep 2, 2026', dur: '1h 22m', fac: 'Dr. Siddharth V.' },
                    { title: 'Valvular Murmurs Clinical Auscultation & Phonocardiograms', date: 'Aug 28, 2026', dur: '58m', fac: 'Dr. Siddharth V.' },
                    { title: 'Heart Failure Pharmacotherapy: Landmark SGLT2i & ARNI Trials', date: 'Aug 22, 2026', dur: '1h 10m', fac: 'Dr. Priya Sharma' },
                  ].map((rec, i) => (
                    <div key={i} className="py-3.5 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-900">{rec.title}</h4>
                        <span className="text-slate-500 text-[11px]">{rec.fac} • {rec.date} • {rec.dur}</span>
                      </div>
                      <button 
                        onClick={() => alert(`Launching recorded video playback: ${rec.title}`)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Watch Replay
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: TESTS & ASSESSMENTS (CBT ENGINE CENTER)                            */}
          {/* ========================================================================= */}
          {activeTab === 'tests' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider mb-2">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>National Standard Assessment Engine</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    CBT Test Series & Mock Schedule
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Simulated proctored examinations with All India Rank (AIR), percentile scores, and question-by-question rationales.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
                    {testsList.filter(t => t.status === 'Completed').length} Completed • {testsList.filter(t => t.status !== 'Completed').length} Scheduled
                  </span>
                </div>
              </div>

              {/* Scheduled and Active Tests */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Scheduled Mock Tests (Phase 6 Reactive Store)</h3>
                  <span className="text-xs text-slate-400">Synchronized with Faculty Test Bank</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {testsList.map((test) => {
                    const isCompleted = test.status === 'Completed';

                    return (
                      <div
                        key={test.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 p-3 rounded-2xl transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-50 text-brand-600'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">
                                {test.name}
                              </h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {test.status}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                              <span>📅 {test.date}</span>
                              <span>•</span>
                              <span>⏱ {test.duration}</span>
                              <span>•</span>
                              <span>📝 {test.questionsCount || (test.questions && test.questions.length) || 20} Questions</span>
                              {test.score && (
                                <>
                                  <span>•</span>
                                  <span className="font-bold text-emerald-600">Score: {test.score} ({test.percentile})</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          {isCompleted ? (
                            <button
                              onClick={() => navigate(`/test/${test.id}`)}
                              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Review Results & Answers</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(`/test/${test.id}`)}
                              className="px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Attempt Test</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CBT Engine Guide Banner */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 block">Marking Pattern:</span>
                  <p className="text-slate-600">+5 Marks for correct answer, -1 Mark penalty for incorrect. Zero for unattempted.</p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 block">Proctored Navigation:</span>
                  <p className="text-slate-600">Full color-coded Question Palette (Answered, Marked for Review, Unvisited).</p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 block">Dynamic Faculty Questions:</span>
                  <p className="text-slate-600">Questions authored by Faculty in the Admin Panel feed directly into your CBT exam room.</p>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: PROGRESS & ANALYTICS                                               */}
          {/* ========================================================================= */}
          {activeTab === 'progress' && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Clinical Diagnostic Analytics</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Performance & Learning Analytics
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Accurate tracking of subject accuracy, spaced repetition retention, and mock test percentiles.
                </p>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-xs text-slate-500 font-semibold">Curriculum Completed</span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">32%</div>
                  <span className="text-[11px] text-emerald-600 font-bold">+8% this week</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-xs text-slate-500 font-semibold">Active Streak</span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-600">5 Days</div>
                  <span className="text-[11px] text-slate-400">Target: 3.5 hrs/day</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-xs text-slate-500 font-semibold">Flashcards Mastered</span>
                  <div className="text-2xl sm:text-3xl font-black text-brand-600">1,420</div>
                  <span className="text-[11px] text-brand-600 font-bold">92% Long-Term Recall</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-xs text-slate-500 font-semibold">Mock CBT Average</span>
                  <div className="text-2xl sm:text-3xl font-black text-indigo-600">76.4%</div>
                  <span className="text-[11px] text-indigo-600 font-bold">Top 8% National Percentile</span>
                </div>
              </div>

              {/* Subject Accuracy Matrix */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-base font-bold text-slate-900">Subject Accuracy Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { subject: 'Cardiology & Hemodynamics', accuracy: 92, status: 'Strong', badgeColor: 'bg-emerald-50 text-emerald-800' },
                    { subject: 'Systemic Pathology & Neoplasia', accuracy: 84, status: 'Proficient', badgeColor: 'bg-emerald-50 text-emerald-800' },
                    { subject: 'Neurology & Neuroanatomy', accuracy: 71, status: 'Moderate', badgeColor: 'bg-amber-50 text-amber-800' },
                    { subject: 'Clinical Pharmacology & Pharmacokinetics', accuracy: 58, status: 'Needs Revision', badgeColor: 'bg-rose-50 text-rose-800' },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{item.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                            {item.status}
                          </span>
                          <span className="font-black text-slate-900">{item.accuracy}%</span>
                        </div>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.accuracy >= 80 ? 'bg-emerald-500' : item.accuracy >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${item.accuracy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI High-Yield Diagnostic Recommendations */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Personalized High-Yield Recommendations</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                    <span className="font-bold text-amber-900 block">Pharmacology Alert:</span>
                    <p className="text-slate-600">Review Vaughan-Williams Class I-IV antiarrhythmic agents before tomorrow's live class.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                    <span className="font-bold text-emerald-900 block">Cardiology Mastery:</span>
                    <p className="text-slate-600">Scored 94% on Valvular Murmurs! Excellent understanding of phonocardiograms.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                    <span className="font-bold text-indigo-900 block">Mock Readiness:</span>
                    <p className="text-slate-600">On schedule for Sunday's Grand Mock Test. Review weak questions in Day 3.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: SETTINGS & DOCTOR PROFILE                                          */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2">
                  <Settings className="w-3.5 h-3.5 text-slate-600" />
                  <span>Account & Preferences</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Doctor Profile & Settings
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Manage your candidate profile, target exam preferences, study reminders, and package billing.
                </p>
              </div>

              {/* Profile Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center font-black text-xl text-brand-600">
                    DR
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{dashboardUserData.name}</h3>
                    <p className="text-xs text-slate-500">Candidate Roll No: <strong className="text-slate-700">MED-2026-904</strong></p>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                      Verified MBBS Candidate
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Full Name</label>
                    <input 
                      type="text" 
                      defaultValue={dashboardUserData.name} 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue={dashboardUserData.email} 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Target Exam Year</label>
                    <select className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold">
                      <option>2026 Examination Cycle</option>
                      <option>2027 Examination Cycle</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Specialization Aspiration</label>
                    <input 
                      type="text" 
                      defaultValue="Internal Medicine / Cardiology" 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Study Notifications */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900">Alerts & Study Reminders</h3>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Daily Morning High-Yield Clinical Pearl</span>
                      <span className="text-slate-500">Receive 1 high-yield clinical vignette via WhatsApp & Email at 07:00 AM</span>
                    </div>
                    <input type="checkbox" defaultChecked className="accent-brand-600 w-4 h-4 cursor-pointer" />
                  </div>
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Live Grand Rounds 30-Minute Reminder</span>
                      <span className="text-slate-500">Push notification and SMS prior to live broadcasts</span>
                    </div>
                    <input type="checkbox" defaultChecked className="accent-brand-600 w-4 h-4 cursor-pointer" />
                  </div>
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">CBT Test Series Scorecard Alerts</span>
                      <span className="text-slate-500">Instant notification when national rank and percentile are computed</span>
                    </div>
                    <input type="checkbox" defaultChecked className="accent-brand-600 w-4 h-4 cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* Package & Subscription Details */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900">Current Package & Subscription</h3>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-brand-50 border border-brand-200">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-brand-800 uppercase">ACTIVE SUBSCRIPTION</span>
                    <h4 className="text-base font-black text-slate-900">{enrolledPlan}</h4>
                    <p className="text-xs text-slate-600">Access valid until Nov 29, 2026 • Full CBT & Live Classes Included</p>
                  </div>
                  <button 
                    onClick={() => alert('Tax invoice downloaded.')}
                    className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    Download Invoice PDF
                  </button>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* Interactive Modals */}
      <LiveSessionModal 
        isOpen={Boolean(selectedLiveSession)}
        onClose={() => setSelectedLiveSession(null)}
        session={selectedLiveSession}
      />

      <TestTakingModal 
        isOpen={Boolean(selectedTest)}
        onClose={() => setSelectedTest(null)}
        test={selectedTest}
      />

      {/* Subject Modules & Lectures Inspector Modal */}
      {inspectingSubject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-brand-100 text-brand-800 text-xs font-black">
                    {inspectingSubject.code}
                  </span>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    {inspectingSubject.examId?.toUpperCase() || 'CORE'} Curriculum
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900">{inspectingSubject.name}</h3>
                <p className="text-xs text-slate-600 max-w-xl">{inspectingSubject.description}</p>
              </div>
              <button 
                onClick={() => setInspectingSubject(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {(() => {
                const subModules = curriculumModules.filter(c => c.subjectId === inspectingSubject.id);
                if (subModules.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-400">
                      <FolderTree className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm font-semibold">No modules configured for this subject yet.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                      <span>{subModules.length} MODULES IN CURRICULUM</span>
                      <span>DIFFICULTY & CLINICAL ASSETS</span>
                    </div>

                    {subModules.map((ch, idx) => {
                      const chLectures = curriculumService.getLectures(ch.id);
                      return (
                        <div key={ch.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-700 text-xs font-black flex items-center justify-center border border-brand-100">
                                  {idx + 1}
                                </span>
                                <h4 className="text-sm font-bold text-slate-900">{ch.name}</h4>
                              </div>
                              {ch.description && (
                                <p className="text-xs text-slate-500 ml-8 mt-0.5">{ch.description}</p>
                              )}
                            </div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 shrink-0">
                              {chLectures.length} Lectures
                            </span>
                          </div>

                          {chLectures.length > 0 && (
                            <div className="ml-8 space-y-1.5 pt-1">
                              {chLectures.map((top, tIdx) => {
                                const content = curriculumService.getLectureContent(top.id);
                                const pdfCount = content?.pdfs?.length || 0;
                                const imgCount = content?.images?.length || 0;
                                const hasVid = Boolean(content?.video?.url || content?.video?.title);
                                const flashCount = content?.flashcards?.length || 0;

                                return (
                                  <div 
                                    key={top.id}
                                    className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-3"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-slate-400 font-mono text-[10px] shrink-0">{idx + 1}.{tIdx + 1}</span>
                                      <span className="font-semibold text-slate-800 truncate">{top.title}</span>
                                      <span className="text-[10px] text-slate-400 shrink-0">({top.durationMinutes || 20}m)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                                      {pdfCount > 0 && (
                                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-100">
                                          <FileText className="w-2.5 h-2.5" />
                                          {pdfCount}
                                        </span>
                                      )}
                                      {hasVid && (
                                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-bold border border-sky-100">
                                          <Video className="w-2.5 h-2.5" />
                                          Vid
                                        </span>
                                      )}
                                      {flashCount > 0 && (
                                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-100">
                                          <Brain className="w-2.5 h-2.5" />
                                          {flashCount}
                                        </span>
                                      )}
                                      {imgCount > 0 && (
                                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                                          IMG
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Lectures are drip-fed according to the Master Study Plan.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectingSubject(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setInspectingSubject(null);
                    setActiveTab('plan');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Open Study Plan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

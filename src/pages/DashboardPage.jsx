import React, { useState, useEffect } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import DashboardNavbar from '../components/DashboardNavbar';
import DashboardSidebar from '../components/DashboardSidebar';
import LiveSessionModal from '../components/LiveSessionModal';
import TestTakingModal from '../components/TestTakingModal';
import { 
  dashboardUserData, 
  studyPlanWeeks, 
  dashboardLiveSessions, 
  dashboardTests,
  testService 
} from '../data/mockData';

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Dynamic query params from Phase 2 or fallback to default mock
  const enrolledPlan = searchParams.get('plan') || dashboardUserData.packageTier;
  const examParam = searchParams.get('exam');
  const enrolledCourse = examParam === 'usmle' 
    ? 'USMLE Step 1 & Step 2 CK' 
    : examParam === 'plab' 
      ? 'PLAB 1 & 2 / UKMLA' 
      : examParam === 'europe' 
        ? 'Europe Medical Licensing' 
        : dashboardUserData.enrolledCourse;

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

  // Sidebar & Modals state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedLiveSession, setSelectedLiveSession] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);

  // Study Plan Week Expansion state
  const [expandedWeeks, setExpandedWeeks] = useState({ 1: true, 2: false, 3: false, 4: false });

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
            const section = document.getElementById(tabId === 'plan' ? 'study-plan-section' : tabId === 'live' ? 'live-sessions-section' : tabId === 'tests' ? 'tests-section' : 'overview-section');
            if (section) {
              section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-10">
          
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
          {/* 3. Welcome / Overview Section (Top of Main Area)                          */}
          {/* ========================================================================= */}
          <section id="overview-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden text-slate-900">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
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
                  Week 1 Cardiology is currently active.
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
                  <span>Overall Curriculum Progress</span>
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

          {/* ========================================================================= */}
          {/* 4. Quick Access Cards Row                                                 */}
          {/* ========================================================================= */}
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
                  className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1 group/btn"
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
                  onClick={() => handleJoinLive(dashboardLiveSessions[0])}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Join</span>
                </button>
              </div>
            </div>

            {/* 3. Upcoming Test Card (Phase 6 Reactive Store) */}
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
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1 ${
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

          {/* ========================================================================= */}
          {/* 5. Study Plan Section (MAIN SECTION — Week-wise Structure)                */}
          {/* ========================================================================= */}
          <section id="study-plan-section" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider mb-2">
                  <Calendar className="w-3.5 h-3.5 text-brand-600" />
                  <span>Drip-Fed Structured Syllabus</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Your Study Plan
                </h2>
                <p className="text-sm text-slate-600 mt-1">
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

            {/* Expandable Week Cards */}
            <div className="space-y-4">
              {studyPlanWeeks.map((week) => {
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
                          const isLocked = !isCompleted && day.status === 'locked';

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
                                  {isLocked && (
                                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center">
                                      <Lock className="w-4 h-4" />
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
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
                                  </div>

                                  <h4 className={`text-sm sm:text-base font-bold mt-0.5 ${
                                    isLocked ? 'text-slate-500' : 'text-slate-900 hover:text-brand-600'
                                  }`}>
                                    {day.title}
                                  </h4>

                                  {day.topics && (
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                      {day.topics.map((t, idx) => (
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
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                      isInProgress
                                        ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                                    }`}
                                  >
                                    <span>{isInProgress ? 'Start / Resume' : 'Review Content'}</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 px-3 py-1.5 bg-slate-100 rounded-lg">
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Drip Locked</span>
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
          </section>

          {/* ========================================================================= */}
          {/* 6. Live Sessions Section                                                  */}
          {/* ========================================================================= */}
          <section id="live-sessions-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider mb-2">
                  <Radio className="w-3.5 h-3.5 text-red-600" />
                  <span>Clinical Case Grand Rounds</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Live Faculty Sessions
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Interactive real-time case discussions, differential diagnosis drills, and clinical Q&A.
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                Next session in 3 hours
              </span>
            </div>

            {/* List of Live Sessions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {dashboardLiveSessions.map((session) => {
                const isLiveSoon = session.status === 'Live Soon';
                return (
                  <div
                    key={session.id}
                    className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                      isLiveSoon
                        ? 'border-red-300 bg-red-50/20 shadow-sm ring-1 ring-red-400/20'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isLiveSoon ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-200 text-slate-700'
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

                    <div className="pt-4 border-t border-slate-200/70 flex items-center justify-between gap-2">
                      <button
                        onClick={() => alert(`Session added to your Google/Outlook calendar: ${session.title}`)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                      >
                        + Add Calendar
                      </button>

                      <button
                        onClick={() => handleJoinLive(session)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
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
          </section>

          {/* ========================================================================= */}
          {/* 7. Test Schedule Section                                                  */}
          {/* ========================================================================= */}
          <section id="tests-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider mb-2">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Computer Based Testing</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Test Series & Mock Schedule
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Full-length examination simulations with national percentile and weak-area diagnostic reports.
                </p>
              </div>

              <div className="text-xs text-slate-500">
                1 Completed • 2 Scheduled
              </div>
            </div>

            {/* Test list rows (Dynamic Phase 6 Store) */}
            <div className="divide-y divide-slate-100">
              {testsList.map((test) => {
                const isCompleted = test.status === 'Completed';

                return (
                  <div
                    key={test.id}
                    className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 p-3 rounded-2xl transition-colors"
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
                          <span>📝 {test.questionsCount || test.questions || 20} Questions</span>
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
                          className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
                        >
                          <span>Review Results & Answers</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/test/${test.id}`)}
                          className="px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
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
          </section>

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

    </div>
  );
}

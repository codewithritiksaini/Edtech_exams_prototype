import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  Flame, 
  Play, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  Award, 
  Video, 
  FileText, 
  Brain, 
  Sparkles, 
  Users, 
  Radio, 
  BarChart3, 
  CalendarCheck2, 
  ChevronRight, 
  BookOpen, 
  Layers, 
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import LiveSessionModal from '../../components/LiveSessionModal';
import { 
  dashboardUserData, 
  dashboardLiveSessions, 
  testService 
} from '../../data/mockData';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const enrolledPlan = searchParams.get('plan') || dashboardUserData.packageTier;
  const completedDayParam = searchParams.get('completedDay');

  // Completion toast state
  const [completionBanner, setCompletionBanner] = useState('');
  const [selectedLiveSession, setSelectedLiveSession] = useState(null);

  useEffect(() => {
    if (completedDayParam) {
      const dayNum = parseInt(completedDayParam, 10);
      setCompletionBanner(`🎉 Outstanding work! Day ${dayNum} clinical module has been marked as Completed.`);
      const timer = setTimeout(() => setCompletionBanner(''), 6500);
      return () => clearTimeout(timer);
    }
  }, [completedDayParam]);

  // Reactive Tests Store
  const [testsList, setTestsList] = useState(() => testService.getTests());

  useEffect(() => {
    const handleTestsUpdate = () => {
      setTestsList(testService.getTests());
    };
    window.addEventListener('medprep-tests-updated', handleTestsUpdate);
    return () => window.removeEventListener('medprep-tests-updated', handleTestsUpdate);
  }, []);

  const activeTest = testsList.find((t) => t.id === 'test-cardio-01') || testsList[0];

  const exams = catalogService.getExams();
  const activeExam = exams[0] || { id: 'neet-pg', name: 'NEET PG & NExT Elite' };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Return Notification Banner */}
      {completionBanner && (
        <div className="bg-emerald-600 text-white p-4 sm:p-5 rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="font-bold text-sm sm:text-base">{completionBanner}</p>
              <p className="text-xs text-emerald-100 mt-0.5">Spaced repetition schedule updated. High-yield flashcards added to retention queue.</p>
            </div>
          </div>
          <button 
            onClick={() => setCompletionBanner('')}
            className="text-white/80 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-700/50 hover:bg-emerald-700 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden text-slate-900">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Enrolled: {enrolledPlan}</span>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                <span>MBBS Candidate MED-2026-904</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Welcome back, <span className="text-brand-600">{dashboardUserData.name}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Your personalized clinical study space for <strong className="text-slate-800">{activeExam.name}</strong>. 
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
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-2xl sm:text-3xl font-black text-brand-600 font-sans flex items-center justify-center gap-1">
                <Flame className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />
                <span>14</span>
              </div>
              <span className="text-[11px] text-slate-500 font-semibold block uppercase tracking-wider">Day Streak</span>
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
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
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
              className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 group/btn cursor-pointer"
            >
              <span>Resume</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* 2. Next Live Session */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                LIVE TONIGHT
              </span>
              <span className="text-xs text-slate-500 font-semibold">8:00 PM IST</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
              STEMI & Acute ECG Grand Rounds
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Taught by Dr. Siddharth V. (AIIMS New Delhi Faculty).
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">340+ Registered</span>
            <button
              onClick={() => setSelectedLiveSession(dashboardLiveSessions[0])}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Join</span>
            </button>
          </div>
        </div>

        {/* 3. Upcoming Test Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                activeTest.status === 'Completed'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {activeTest.status === 'Completed' ? 'TEST COMPLETED' : 'SCHEDULED ASSESSMENT'}
              </span>
              <span className="text-xs text-slate-500 font-semibold">{activeTest.duration}</span>
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
                <span>{activeTest.questionsCount || 20} clinical vignette questions • +5 / -1 marking.</span>
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
                  : 'bg-brand-600 hover:bg-brand-500 text-white'
              }`}
            >
              <span>{activeTest.status === 'Completed' ? 'Review Answers' : 'View & Start'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4. This Week's Progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
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
              Daily study pace is on track for the Sunday Grand Mock Test.
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
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck2 className="w-5 h-5 text-brand-600" />
              <span>Today's Clinical Study Schedule & Milestones</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Target 3.5 hours active recall • 3 key milestones scheduled today
            </p>
          </div>
          <Link 
            to="/student/study-plan"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View Full 28-Day Plan</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
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

      {/* Quick Portal Navigation Grid */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">EXPLORE PORTAL</span>
            <h3 className="text-xl sm:text-2xl font-black">Comprehensive 5-Level Learning Matrix</h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Access the complete hierarchy from national exam tracks down to module lectures and the interactive Lecture Study Room.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/student/courses"
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse All Subjects</span>
            </Link>
            <Link
              to="/student/tests"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>CBT Test Center</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Session Modal */}
      <LiveSessionModal
        isOpen={Boolean(selectedLiveSession)}
        onClose={() => setSelectedLiveSession(null)}
        session={selectedLiveSession}
      />
    </div>
  );
}

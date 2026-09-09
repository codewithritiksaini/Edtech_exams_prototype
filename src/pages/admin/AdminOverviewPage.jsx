import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Crown, 
  BookOpen, 
  Calendar, 
  FileText, 
  Video, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Radio, 
  Plus, 
  GraduationCap, 
  Layers, 
  BarChart3,
  ShieldCheck,
  Package
} from 'lucide-react';
import { authService, USER_ROLES } from '../../services/authService';
import { catalogService } from '../../services/catalogService';
import { testService, dashboardLiveSessions } from '../../data/mockData';

export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [exams] = useState(() => catalogService.getExams());
  const [tests] = useState(() => testService.getTests());

  useEffect(() => {
    const unsub = authService.subscribe((u) => setCurrentUser(u));
    return unsub;
  }, []);

  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Greeting Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {todayDateString}
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <Crown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Super Admin (Mission Control)</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome, Super Admin 👋
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Platform Mission Control. Orchestrate all 4 medical licensing tracks, 12 subscription tiers, faculty assignments, daily drip feeds, and proctored CBT series.
          </p>
        </div>

        {/* Account Scope Summary Badge */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1 shrink-0 self-start md:self-auto min-w-[240px]">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Authenticated Account
          </div>
          <div className="text-xs font-extrabold text-slate-900">
            {currentUser?.email || 'admin@demo.com'}
          </div>
          <div className="text-[11px] text-indigo-700 font-semibold pt-1">
            Full Platform Authority
          </div>
        </div>
      </div>

      {/* 5 KPI Summary Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: Enrolled Doctors */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Enrolled Doctors</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">1,420</div>
          <span className="text-[10.5px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% from last cycle</span>
          </span>
        </div>

        {/* Card 2: Active Exam Tracks */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Exam Tracks</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">4 Live</div>
          <span className="text-[10.5px] text-slate-500 font-semibold">
            NEET PG, USMLE, PLAB, EU
          </span>
        </div>

        {/* Card 3: Daily Study Pace */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Daily Pace</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">3.8 hrs</div>
          <span className="text-[10.5px] text-amber-700 font-semibold">
            Active recall retention avg
          </span>
        </div>

        {/* Card 4: Monthly Gross Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">MRR Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">₹38.4L</div>
          <span className="text-[10.5px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.5% YoY Growth</span>
          </span>
        </div>

        {/* Card 5: CBT Benchmark Pass Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mock Pass Rate</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">92.4%</div>
          <span className="text-[10.5px] text-sky-700 font-semibold">
            High-yield clinical cohort
          </span>
        </div>
      </div>

      {/* Quick Access Flow Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Core Workspaces & Flow Entry Points
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/exams"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Academic Curriculum Hierarchy
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Exam ➡️ Subject ➡️ Chapter ➡️ Topic ➡️ Content Studio 5-level flow.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-indigo-600 gap-1">
              <span>Open Academic Hierarchy</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/schedule/neet-pg"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Study Schedule & Drip Planner
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                4-Week / 28-Day interactive calendar and daily topic mapping.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-emerald-600 gap-1">
              <span>Open Drip Planner</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/tests"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors">
                CBT Assessments & Question Bank
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Proctored mock exams, clinical vignettes, rationale, and scorecards.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-purple-600 gap-1">
              <span>Manage CBT Engine</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/live-sessions"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-rose-300 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors">
                Live Grand Rounds Broadcasts
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Zoom & Meet interactive faculty rooms, live attendees, and recordings.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-rose-600 gap-1">
              <span>Launch Live Hub</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Two Column Section: Live Tonight & Recent Platform Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Featured Live Grand Rounds Tonight */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-600 animate-pulse" />
              <span>Live Tonight</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
              8:00 PM IST
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50/50 border border-indigo-100 space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                Cardiology Grand Rounds
              </span>
              <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                STEMI & Acute Coronary Syndromes Emergency Pathways
              </h4>
              <p className="text-[11px] text-slate-500">
                Lead: Dr. Siddharth V. (AIIMS) • 340+ Candidates Registered
              </p>
            </div>

            <div className="pt-2 border-t border-indigo-100/80 flex items-center justify-between text-xs">
              <span className="text-[11px] font-semibold text-slate-600">Platform: Zoom Pro</span>
              <Link
                to="/admin/live-sessions"
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px]"
              >
                Manage Room
              </Link>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Active Assessment
            </span>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <h5 className="text-xs font-bold text-slate-900">Cardiology Mock Test #01</h5>
                <p className="text-[11px] text-slate-400">412 Submissions Evaluated</p>
              </div>
              <Link
                to="/admin/tests"
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                View Scores
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Platform Audit & Event Feed */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Recent Activity & Curriculum Events</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">Real-time sync</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">New Candidate Enrolled: Dr. Kabir Anand</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    USMLE Step 1
                  </span>
                </div>
                <p className="text-slate-500">Premium 12-Month Tier activated. Student workspace initialized.</p>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0 font-medium">8 mins ago</span>
            </div>

            <div className="py-3 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Day 3 Content Published to Student LMS</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Drip Released
                  </span>
                </div>
                <p className="text-slate-500">High-Yield Arrhythmia ECG strips and PDF guide now accessible to candidates.</p>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0 font-medium">1 hour ago</span>
            </div>

            <div className="py-3 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Cardiology Grand Mock #01 Results Evaluated</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                    All India Rank
                  </span>
                </div>
                <p className="text-slate-500">412 candidate scorecards generated with percentile rankings.</p>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0 font-medium">3 hours ago</span>
            </div>

            <div className="py-3 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Faculty Assigned: Dr. Ananya Sen</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                    Faculty Scope
                  </span>
                </div>
                <p className="text-slate-500">Assigned as lead specialist for Clinical Pharmacology & Toxicology modules.</p>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0 font-medium">5 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

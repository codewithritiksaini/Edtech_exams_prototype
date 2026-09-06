import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Stethoscope, 
  BookOpen, 
  Video, 
  Brain, 
  CheckCircle2, 
  Radio, 
  Play, 
  Download, 
  Flame, 
  Clock, 
  Award, 
  ArrowRight,
  ChevronRight,
  FileText,
  Calendar,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function DashboardPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const exam = searchParams.get('exam') || 'neet-pg';
  const plan = searchParams.get('plan') || 'Standard';

  const examTitles = {
    'neet-pg': 'NEET PG & NExT 2026',
    'usmle': 'USMLE Step 1 & Step 2 CK',
    'plab': 'PLAB 1 & 2 / UKMLA',
    'europe': 'Europe Medical Licensing'
  };

  const currentExamTitle = examTitles[exam] || 'NEET PG & NExT 2026';

  return (
    <div className="min-h-screen bg-slate-50 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top bar & Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link to="/" className="hover:text-brand-600">Home</Link>
            <span>/</span>
            <Link to={`/packages/${exam}`} className="hover:text-brand-600">Packages</Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">Student Dashboard (Phase 3 Preview)</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/packages/${exam}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Packages</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20"
            >
              <span>Back to Homepage</span>
            </Link>
          </div>
        </div>

        {/* Hero Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-navy-850 to-brand-950 text-white rounded-3xl p-6 sm:p-8 mb-8 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enrolled & Active Plan: {plan} Tier</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Welcome to your Clinical Study Space, <span className="text-brand-400">Dr. Ritik Saini</span>
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl">
                Preparing for <span className="font-semibold text-white">{currentExamTitle}</span>. 
                Your week-wise roadmap is loaded with high-yield clinical packets, active recall flashcards, and grand tests.
              </p>
            </div>

            {/* Study Streak & Accuracy Badge */}
            <div className="flex items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shrink-0">
              <div className="text-center px-2">
                <span className="text-2xl font-extrabold text-amber-400 flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5 fill-amber-400" />
                  <span>5</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Day Streak</span>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div className="text-center px-2">
                <span className="text-2xl font-extrabold text-emerald-400">92%</span>
                <span className="text-[11px] text-slate-400 font-medium">QBank Accuracy</span>
              </div>
            </div>
          </div>

          {/* Current Progress bar */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 mb-2 gap-2">
              <span className="font-semibold">Current Roadmap: Week 1 of 24 (Cardiology & Clinical Hemodynamics)</span>
              <span className="text-brand-400 font-bold">18% Completed (Target: 3 hrs/day)</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 w-[18%] rounded-full" />
            </div>
          </div>
        </div>

        {/* Quick Launch Cards (The 5 Facilities in Action) */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-600" />
            <span>Today's Study Modules & Clinical Facilities</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* 1. PDF Notes */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">PDF NOTE</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  Aortic & Mitral Murmurs Summary
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  18 pages with histological stains, phonocardiograms, and pharmacotherapy tables.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ready to Read
                </span>
                <button className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" />
                  <span>Open</span>
                </button>
              </div>
            </div>

            {/* 2. Video Lecture */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">RESUME</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  Ventricular Remodeling & Heart Failure
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Taught by Dr. Rajiv Mehta. 24:18 left of 42:00.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">58% Viewed</span>
                <button className="text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-3 py-1 rounded-lg flex items-center gap-1">
                  <Play className="w-3 h-3 fill-current" />
                  <span>Play</span>
                </button>
              </div>
            </div>

            {/* 3. Flashcards */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Brain className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">SRS ACTIVE</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  Cardiology Antiarrhythmics Decks
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Class I-IV Vaughan-Williams mechanisms and toxicities.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-amber-600 font-bold">24 Due Today</span>
                <button className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg">
                  Review
                </button>
              </div>
            </div>

            {/* 4. Test Series */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">CBT MOCK</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  Mini Mock Test #03: ECG Vignettes
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  25 clinical scenario questions. 30 mins timed simulation.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Avg Score: 78%</span>
                <button className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-lg">
                  Start Test
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Live Session Announcement & Weekly Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Live Clinic */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Upcoming Live Case Clinic</span>
                </div>
                <span className="text-xs font-medium text-slate-500">Tonight @ 8:00 PM IST</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Emergency Medicine: STEMI & Acute Coronary Syndrome Grand Rounds
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Join Dr. Siddharth V. (MD, DM Interventional Cardiology) for live ECG analysis, thrombolysis decision-making drills, and student Q&A.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                ⭐ Zoom link & study case notes unlock 15 minutes before the session.
              </div>
              <button className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors">
                Add to Calendar & Reserve Seat
              </button>
            </div>
          </div>

          {/* Academic Support Hotline */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                Faculty Mentorship Hotline
              </span>
              <h4 className="text-base font-bold text-white">
                Have doubts on a question or clinical scenario?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Post your query in the 24/7 faculty forum or connect directly with our specialist MD doubt clearance desk.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
              <button className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition-colors">
                Ask a Doubt to Faculty
              </button>
              <span className="text-[10px] text-slate-400 block text-center">
                Average reply time: Under 45 minutes
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

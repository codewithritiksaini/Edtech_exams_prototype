import React from 'react';
import { ShieldCheck, Flame } from 'lucide-react';

export default function DashboardHero({
  userName = 'Dr. Ritik Saini',
  enrolledCourse = 'NEET PG & NExT 2026',
  enrolledPlan = 'Standard Package (6 Months)',
  candidateId = 'MBBS Candidate MED-2026-904',
  daysLeft = 84,
  overallProgress = 32,
  streakDays = 14,
  targetExamDate = 'Nov 29, 2026',
  currentSystem = 'Week 1 • Cardiology & Hemodynamics'
}) {
  return (
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
              <span>{candidateId}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Welcome back, <span className="text-brand-600">{userName}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Your personalized clinical study space for <strong className="text-slate-800">{enrolledCourse}</strong>. 
            <span className="inline-block sm:inline ml-1 font-medium text-slate-700">{currentSystem} is currently active.</span>
          </p>
        </div>

        {/* Days remaining countdown pills */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0">
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-600 font-sans">
              {daysLeft}
            </div>
            <span className="text-[11px] text-slate-500 font-semibold block uppercase tracking-wider">Days Left</span>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-sans">
              {overallProgress}%
            </div>
            <span className="text-[11px] text-slate-500 font-semibold block uppercase tracking-wider">Complete</span>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-black text-brand-600 font-sans flex items-center justify-center gap-1">
              <Flame className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{streakDays}</span>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold block uppercase tracking-wider">Day Streak</span>
          </div>
        </div>
      </div>

      {/* Overall Curriculum Progress Bar */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 mb-2 gap-2">
          <span className="font-semibold flex items-center gap-2">
            <span>Overall Curriculum Progress</span>
            <span className="text-slate-400">({overallProgress}% Complete)</span>
          </span>
          <span className="text-brand-600 font-bold">Target Exam: {targetExamDate}</span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-500 rounded-full transition-all duration-500" 
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
    </section>
  );
}

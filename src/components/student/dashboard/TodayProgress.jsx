import React from 'react';
import { CheckCircle2, Clock, BarChart3, Flame } from 'lucide-react';

export default function TodayProgress({
  completedCount = 2,
  totalCount = 4,
  studyTime = '1.5 hrs',
  dayProgressPct = 50
}) {
  return (
    <section className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-brand-600" />
          <span>TODAY'S PROGRESS</span>
        </h3>
        <span className="text-xs font-bold text-slate-700">
          Day Milestone Tracking
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {/* Metric 1: Resources Completed */}
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-[11px] font-semibold text-slate-500 line-clamp-1">Resources</span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900">
            {completedCount} <span className="text-xs font-medium text-slate-400">/ {totalCount}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Mandatory Clinical</p>
        </div>

        {/* Metric 2: Study Time */}
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Clock className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span className="text-[11px] font-semibold text-slate-500 line-clamp-1">Study Time</span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900">
            {studyTime}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Active Engagement</p>
        </div>

        {/* Metric 3: Day Progress */}
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-[11px] font-semibold text-slate-500 line-clamp-1">Day Progress</span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-brand-600">
            {dayProgressPct}%
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Completed Today</p>
        </div>
      </div>
    </section>
  );
}

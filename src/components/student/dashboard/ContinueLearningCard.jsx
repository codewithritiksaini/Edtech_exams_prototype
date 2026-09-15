import React from 'react';
import { ArrowRight, Play, CheckCircle2, BookOpen } from 'lucide-react';

export default function ContinueLearningCard({
  dayNumber = 3,
  subjectName = 'Cardiology & Hemodynamics',
  dayTitle = 'Cardiac Arrhythmias & ECG Interpretation',
  completedCount = 2,
  totalCount = 4,
  progressPct = 50,
  currentResourceTitle = 'ECG & Clinical Diagrams',
  currentResourceKey = 'images',
  isDayDone = false,
  onResume
}) {
  const isNothingStarted = completedCount === 0;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-500/20 shadow-sm relative overflow-hidden transition-all hover:shadow-md group">
      {/* Decorative subtle ambient gradient accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left Info Column */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span 
              className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                isDayDone 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 flex items-center gap-1.5' 
                  : 'bg-brand-50 text-brand-700 border-brand-300 flex items-center gap-1.5'
              }`}
            >
              {isDayDone ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>DAY COMPLETED</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                  <span>CONTINUE LEARNING</span>
                </>
              )}
            </span>

            <span className="text-xs font-bold text-slate-500">
              Day {dayNumber} • {subjectName}
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-brand-600 transition-colors">
              {dayTitle}
            </h2>

            {/* Resources progress summary & bar */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-700">
                {completedCount} of {totalCount} resources completed
              </span>
              <span className="text-xs font-black text-brand-600">
                {progressPct}%
              </span>

              <div className="w-36 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isDayDone 
                      ? 'bg-emerald-500' 
                      : 'bg-gradient-to-r from-brand-600 to-brand-500'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Current Resource context status */}
          <div className="pt-1 text-xs text-slate-600 flex items-center gap-2">
            {isDayDone ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All Day {dayNumber} clinical learning modules completed. Ready to review.</span>
              </span>
            ) : isNothingStarted ? (
              <span>
                Next: <strong className="text-slate-900 font-bold">{currentResourceTitle}</strong>
              </span>
            ) : (
              <span>
                Currently studying: <strong className="text-brand-700 font-bold">{currentResourceTitle}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Right CTA Button Column */}
        <div className="shrink-0 flex items-center">
          <button
            onClick={onResume}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] ${
              isDayDone 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20' 
                : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/25 hover:shadow-lg'
            }`}
          >
            {isDayDone ? (
              <>
                <BookOpen className="w-4 h-4" />
                <span>Review Day →</span>
              </>
            ) : isNothingStarted ? (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Learning →</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Current Resource →</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

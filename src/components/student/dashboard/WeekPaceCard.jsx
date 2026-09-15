import React from 'react';
import { ChevronRight, TrendingUp } from 'lucide-react';

export default function WeekPaceCard({
  weekNumber = 1,
  completedDaysCount = 4,
  totalDaysInWeek = 7,
  activeDayIndex = 2, // 0-indexed for current week day (e.g. Day 3 = index 2)
  completedIndices = [0, 1], // indices that are completed
  onNavigateStudyPlan
}) {
  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div 
      onClick={onNavigateStudyPlan}
      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            WEEK {weekNumber} PACE
          </span>
          <span className="text-xs font-bold text-slate-600">
            Goal: {totalDaysInWeek}/{totalDaysInWeek} Days
          </span>
        </div>

        <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
          {completedDaysCount} of {totalDaysInWeek} Days Completed
        </h4>
        
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>On Track</span>
          </span>
          <span>• Daily study pace on target for Sunday Grand Mock.</span>
        </p>
      </div>

      {/* Visual Day Bubbles (Mon-Sun) */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {dayLetters.map((dayChar, i) => {
            const isCompleted = completedIndices.includes(i);
            const isCurrent = !isCompleted && i === activeDayIndex;

            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400 font-semibold">{dayChar}</span>
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-2xs'
                      : isCurrent
                        ? 'bg-brand-600 text-white ring-2 ring-brand-300 shadow-xs'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓' : isCurrent ? `${i + 1}` : '•'}
                </div>
              </div>
            );
          })}
        </div>

        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  );
}

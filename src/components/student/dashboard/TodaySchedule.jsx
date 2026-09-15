import React from 'react';
import { CalendarCheck2, ChevronRight, Play, CheckCircle2, Clock, Radio, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TodaySchedule({
  dayNumber = 3,
  targetHours = '3.5 hours',
  items = [],
  liveSession = null, // only present if today actually has a live session
  onResumeResource,
  onJoinLiveSession
}) {
  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-brand-600" />
            <span>Today's Clinical Study Schedule</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Target: {targetHours} active recall • Day {dayNumber} milestone activities
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

      {/* Grid of Scheduled Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item, idx) => {
          const isCompleted = item.status === 'COMPLETED';
          const isCurrent = item.status === 'CURRENT' || item.status === 'IN_PROGRESS';

          return (
            <div 
              key={item.id || idx}
              className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                isCompleted 
                  ? 'bg-emerald-50/50 border-emerald-200/80' 
                  : isCurrent 
                    ? 'bg-brand-50/60 border-brand-300 ring-1 ring-brand-200' 
                    : 'bg-slate-50/70 border-slate-200/80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div 
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCompleted 
                      ? 'bg-emerald-600 text-white' 
                      : isCurrent 
                        ? 'bg-brand-600 text-white animate-pulse' 
                        : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : isCurrent ? '▶' : `${idx + 1}`}
                </div>

                <div className="space-y-1 min-w-0">
                  <div 
                    className={`text-[10px] font-black uppercase tracking-wider ${
                      isCompleted 
                        ? 'text-emerald-800' 
                        : isCurrent 
                          ? 'text-brand-700' 
                          : 'text-slate-500'
                    }`}
                  >
                    {isCompleted ? 'Completed' : isCurrent ? 'Current Resource' : 'Upcoming In Sequence'}
                    {item.timeSlot ? ` • ${item.timeSlot}` : ''}
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {item.title}
                  </h4>

                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {item.description || item.subtitle}
                  </p>
                </div>
              </div>

              {/* Action for active current resource */}
              {isCurrent && (
                <div className="mt-3 pt-2.5 border-t border-brand-200/60 flex justify-end">
                  <button
                    onClick={() => onResumeResource(item.key)}
                    className="px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Resume</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Section 16: Render Live Session ONLY if today has an actual scheduled Live Session */}
        {liveSession && (
          <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200/80 flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                <Radio className="w-4 h-4" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="text-[10px] font-black text-red-700 uppercase tracking-wider flex items-center gap-1">
                  <span>Tonight • {liveSession.formattedTime ? liveSession.formattedTime.split('–')[0].trim() : '8:00 PM'}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {liveSession.title}
                </h4>
                <p className="text-[11px] text-slate-600 line-clamp-2">
                  {liveSession.faculty} ({liveSession.college || 'Lead Faculty'})
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-red-200/60 flex justify-end">
              <button
                onClick={() => onJoinLiveSession(liveSession)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View Session</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

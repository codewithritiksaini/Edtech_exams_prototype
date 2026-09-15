import React from 'react';
import { Radio, Bell, Check, Clock, Users, ArrowRight } from 'lucide-react';
import { 
  SESSION_STATUS, 
  getLiveSessionStatus, 
  formatSessionCountdown,
  canJoinLiveSession
} from '../../../services/liveSessionsService';

export default function NextLiveSessionCard({
  session = null,
  currentTime = new Date(),
  isReminderActive = false,
  onToggleReminder,
  onJoinSession,
  onBrowseSessions
}) {
  if (!session) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              LIVE MASTERCLASSES
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            NO UPCOMING LIVE SESSIONS
          </h4>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Check recorded masterclasses for on-demand clinical learning and case discussions.
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={onBrowseSessions}
            className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Browse Live Sessions →</span>
          </button>
        </div>
      </div>
    );
  }

  const status = getLiveSessionStatus(session, currentTime);
  const isLive = status === SESSION_STATUS.LIVE;
  const isUpcoming = status === SESSION_STATUS.UPCOMING;
  const countdownText = formatSessionCountdown(session, currentTime);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Card Header Badge */}
        <div className="flex items-center justify-between mb-3">
          {isLive ? (
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span>LIVE NOW</span>
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>NEXT LIVE SESSION</span>
            </span>
          )}

          <span className="text-xs text-slate-500 font-semibold">
            {isLive ? 'Active Stream' : countdownText}
          </span>
        </div>

        {/* Title & Faculty */}
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
          {session.title}
        </h4>
        
        <p className="text-xs text-slate-600 mt-1 font-medium">
          {session.faculty} {session.college ? `• ${session.college}` : ''}
        </p>

        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
          <span>{session.formattedTime || 'Tonight • 8:00 PM IST'}</span>
          {session.attendeesCount && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" />
                <span>{session.attendeesCount}+ Enrolled</span>
              </span>
            </>
          )}
        </p>

        {session.studyPlan && (
          <p className="text-[11px] text-brand-600 font-medium mt-1.5 line-clamp-1">
            Related: Week {session.studyPlan.weekNumber} • Day {session.studyPlan.dayNumber}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {isLive ? (
          // ONLY live sessions show Join button
          <button
            onClick={() => onJoinSession(session)}
            className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Join Live Session →</span>
          </button>
        ) : (
          // Upcoming sessions strictly show Remind Me (NO JOIN BUTTON)
          <div className="w-full flex items-center justify-between">
            <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
              <span>{countdownText}</span>
            </span>

            <button
              type="button"
              onClick={() => onToggleReminder(session)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border ${
                isReminderActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {isReminderActive ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Reminder Set</span>
                </>
              ) : (
                <>
                  <Bell className="w-3 h-3 text-slate-500" />
                  <span>Remind Me</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

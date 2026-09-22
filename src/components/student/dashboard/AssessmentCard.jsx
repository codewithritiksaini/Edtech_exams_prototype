import React from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Play, 
  ArrowRight, 
  AlertCircle, 
  Award,
  Calendar
} from 'lucide-react';
import { 
  CBT_STATUS, 
  getTestStatus, 
  formatTestCountdown,
  getTestTimes,
  cbtTestService
} from '../../../services/cbtTestService';

export default function AssessmentCard({
  test = null,
  currentTime = new Date(),
  onStartTest,
  onResumeTest,
  onViewResult,
  onViewDetails,
  onBrowseTests
}) {
  if (!test) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              CBT ASSESSMENTS
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            No upcoming assessments.
          </h4>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            All current assessment requirements are met. Check the CBT Test Center for practice mocks.
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={onBrowseTests}
            className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Browse Test Center →</span>
          </button>
        </div>
      </div>
    );
  }

  const status = getTestStatus(test, currentTime);
  const isInProgress = status === CBT_STATUS.IN_PROGRESS || status === CBT_STATUS.PAUSED;
  const isAvailable = status === CBT_STATUS.AVAILABLE;
  const isUpcoming = status === CBT_STATUS.UPCOMING;
  const isCompleted = status === CBT_STATUS.SUBMITTED;
  const isExpired = status === CBT_STATUS.EXPIRED;

  const { startTime, endTime } = getTestTimes(test);
  const countdownText = formatTestCountdown(startTime, currentTime);
  const completedAttempt = isCompleted ? cbtTestService.getCompletedAttempt(test.id) : null;
  const activeAttempt = isInProgress ? cbtTestService.getActiveAttempt(test.id) : null;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Card Header Badge */}
        <div className="flex items-center justify-between mb-3">
          {isInProgress ? (
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
              <span>TEST IN PROGRESS</span>
            </span>
          ) : isAvailable ? (
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-600 text-white flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>AVAILABLE NOW</span>
            </span>
          ) : isUpcoming ? (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-600" />
              <span>UPCOMING</span>
            </span>
          ) : isCompleted ? (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>TEST COMPLETED</span>
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              WINDOW CLOSED
            </span>
          )}

          <span className="text-xs text-slate-500 font-semibold">
            {test.durationMinutes || 45} Mins
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
          {test.name || test.title}
        </h4>

        {/* Dynamic Context by State */}
        <div className="mt-1 text-xs text-slate-500 space-y-1">
          {isCompleted && completedAttempt ? (
            <p className="text-emerald-700 font-semibold flex items-center gap-1">
              <span>Score: {completedAttempt.score} / {completedAttempt.totalMarks}</span>
              <span>• {completedAttempt.percentile || 'Passed'}</span>
            </p>
          ) : isExpired ? (
            <p className="text-slate-500">This test window is closed.</p>
          ) : isInProgress ? (
            <p className="text-amber-700 font-semibold">
              Attempt active • Answers auto-saved.
            </p>
          ) : (
            <p className="flex items-center gap-2">
              <span>{test.totalQuestions || test.questionsCount || 20} Questions</span>
              <span>•</span>
              <span>+{test.marksPerCorrect || 5} / {test.marksPerIncorrect || -1}</span>
            </p>
          )}

          {isUpcoming && (
            <p className="text-[11px] text-slate-600 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{test.formattedWindow || 'Scheduled Window'}</span>
            </p>
          )}

          {isAvailable && (
            <p className="text-[11px] text-emerald-700 font-semibold">
              Closes at {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        {isInProgress ? (
          // In Progress -> Resume Test
          <button
            onClick={() => onResumeTest(test)}
            className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Resume Test →</span>
          </button>
        ) : isAvailable ? (
          // Available Now -> Start Test
          <button
            onClick={() => onStartTest(test)}
            className="w-full py-2 px-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Start Test →</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : isUpcoming ? (
          // Upcoming -> STRICTLY NO START BUTTON! Only View Details / Countdown
          <div className="w-full flex items-center justify-between">
            <span className="text-xs text-indigo-700 font-semibold">
              Starts in {countdownText}
            </span>
            <button
              onClick={() => onViewDetails(test)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              View Details
            </button>
          </div>
        ) : isCompleted ? (
          // Completed -> View Result
          <button
            onClick={() => onViewResult(test)}
            className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>View Result &amp; Review →</span>
          </button>
        ) : (
          // Expired
          <button
            onClick={onBrowseTests}
            className="w-full py-2 px-3 bg-slate-100 text-slate-500 text-xs font-medium rounded-xl cursor-pointer"
          >
            View More Tests
          </button>
        )}
      </div>
    </div>
  );
}

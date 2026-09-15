import React from 'react';
import { X, Clock, Calendar, HelpCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatTestCountdown, getTestTimes } from '../../../services/cbtTestService';

export default function TestDetailsModal({ isOpen, onClose, test, currentTime = new Date() }) {
  if (!isOpen || !test) return null;

  const { startTime, endTime } = getTestTimes(test);
  const countdownText = formatTestCountdown(startTime, currentTime);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Scheduled Examination</span>
          </div>

          <h3 className="text-xl font-black text-slate-900 leading-snug">
            {test.name || test.title}
          </h3>

          {/* Timing & Countdown Banner */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Scheduled Window:</span>
              <span className="font-bold text-slate-800">{test.formattedWindow || 'Upcoming Window'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Starts in:</span>
              <span className="font-black text-indigo-700">{countdownText}</span>
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Questions</span>
              <span className="text-sm font-black text-slate-800">{test.totalQuestions || test.questionsCount || 20}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
              <span className="text-sm font-black text-slate-800">{test.durationMinutes || 45} mins</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Marking</span>
              <span className="text-sm font-black text-emerald-700">+{test.marksPerCorrect || 5} / {test.marksPerIncorrect || -1}</span>
            </div>
          </div>

          {/* Access Rule Notice */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Assessment Restriction:</strong> Under proctoring rules, examination rooms unlock precisely when the scheduled window starts. The "Start Test" action will automatically appear at that time.
            </p>
          </div>

          {/* Dismiss Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

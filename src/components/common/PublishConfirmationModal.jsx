import React from 'react';
import { 
  X, 
  ShieldAlert, 
  Lock, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

export default function PublishConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  test, 
  exam, 
  questionsCount = 0,
  isPublishing = false 
}) {
  if (!isOpen || !test) return null;

  const duration = test.durationMinutes || test.targetDuration || 60;
  const windowConfig = test.testWindow;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Publish Assessment
              </h3>
              <p className="text-xs text-slate-500">
                Final confirmation to activate candidate delivery
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPublishing}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Test Summary Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
          <div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
              {test.code}
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-1">
              {test.name}
            </h4>
            <div className="text-xs text-slate-500 mt-0.5">
              Exam: <strong className="text-slate-700">{exam?.name || test.examId}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60">
            <div className="flex items-center gap-1.5 text-slate-600">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
              <span>Questions: <strong className="text-slate-900 font-bold">{questionsCount}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Duration: <strong className="text-slate-900 font-bold">{duration}m</strong></span>
            </div>
          </div>

          {windowConfig && windowConfig.enabled ? (
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-950 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
              <div className="text-[11px] leading-tight">
                <strong>Scheduled Window:</strong>{' '}
                {new Date(windowConfig.startAt).toLocaleDateString()} — {new Date(windowConfig.endAt).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 italic">
              Test Window: Continuous Access (No fixed window restriction)
            </div>
          )}
        </div>

        {/* Prominent Configuration Lock Warning */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold">Lifecycle Configuration Lock</strong>
            <p className="leading-relaxed text-[11px] text-amber-800">
              Publishing will lock this assessment into read-only state. Questions, scoring schemes, section boundaries, and timing rules will no longer be editable to guarantee evaluation integrity.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isPublishing}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPublishing}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            {isPublishing ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Publishing…</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm &amp; Publish Test</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

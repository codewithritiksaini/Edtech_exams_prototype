import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function FacultyTestCancelModal({ test, isOpen, onClose, onConfirmCancel }) {
  if (!isOpen || !test) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Cancel Assessment Schedule?
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to cancel <strong className="text-slate-900 font-semibold">"{test.name || test.title}"</strong>?
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Test Code:</span>
            <span className="font-mono font-bold text-slate-800">{test.code || test.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Course / Exam:</span>
            <span className="font-semibold text-slate-800">{test.course || test.examTrack || test.examId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Scheduled Date:</span>
            <span className="text-slate-700">{test.formattedWindow || test.date || 'Upcoming'}</span>
          </div>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
          <strong>Important:</strong> Cancelling sets the status to <span className="font-semibold text-rose-700">CANCELLED</span> and removes it from active student schedules. The test record is preserved in your history and is not permanently deleted.
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Keep Active
          </button>
          <button
            type="button"
            onClick={() => onConfirmCancel(test.id)}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer"
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
}

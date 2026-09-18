import React, { useState } from 'react';
import { Archive, X, AlertTriangle } from 'lucide-react';
import { adminTestService } from '../../../services/adminTestService';

export default function TestArchiveModal({ isOpen, test, onClose, onArchiveSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !test) return null;

  const associatedExam = adminTestService.getExamById(test.examId);

  const handleArchive = () => {
    setIsSubmitting(true);
    setError('');
    try {
      const archived = adminTestService.archiveTest(test.id);
      if (onArchiveSuccess) {
        onArchiveSuccess(archived);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to archive test.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-6 relative animate-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Archive Test?
              </h3>
              <p className="text-xs text-slate-500">
                Review archive status transition
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Confirmation Body */}
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to archive:
          </p>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 block truncate">{test.name}</span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded shrink-0">
                {associatedExam?.name || test.examId}
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">{test.code}</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Archived tests will no longer appear in the active test list. You can review or restore it anytime from the Archived filter.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleArchive}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Archiving...' : 'Archive Test'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

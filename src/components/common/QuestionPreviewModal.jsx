import React, { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import QuestionPreview from '../questions/QuestionPreview.jsx';

export default function QuestionPreviewModal({
  isOpen,
  onClose,
  question
}) {
  // ESC key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
        onClick={onClose}
      />

      {/* Modal Dialog Box */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-3xl w-full max-h-[90vh] flex flex-col z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
              {question.id}
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Question Clinical Inspection
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Scrollable Question Preview */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <QuestionPreview question={question} />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
          <span>Item inspection mode — verified from MedPrep Question Bank</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

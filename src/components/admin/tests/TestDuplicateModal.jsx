import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, X, AlertCircle } from 'lucide-react';
import { adminTestService } from '../../../services/adminTestService';

export default function TestDuplicateModal({ isOpen, test, onClose, onDuplicateSuccess }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (test && isOpen) {
      setName(`${test.name} - Copy`);
      setCode(`${test.code}_COPY`);
      setError('');
      setIsSubmitting(false);
    }
  }, [test, isOpen]);

  if (!isOpen || !test) return null;

  const associatedExam = adminTestService.getExamById(test.examId);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '_');

    if (!cleanName) {
      setError('New Test Name cannot be empty.');
      return;
    }
    if (!cleanCode) {
      setError('New Test Code cannot be empty.');
      return;
    }

    if (!adminTestService.isCodeUnique(cleanCode)) {
      setError(`Test Code "${cleanCode}" already exists. Please choose a unique code.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const duplicated = adminTestService.duplicateTest(test.id, cleanName, cleanCode);
      if (onDuplicateSuccess) {
        onDuplicateSuccess(duplicated);
      }
      onClose();
      navigate(`/admin/tests/${duplicated.id}`);
    } catch (err) {
      setError(err.message || 'Failed to duplicate test.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-6 relative animate-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Duplicate Test
              </h3>
              <p className="text-xs text-slate-500">
                Creates an independent copy as a new DRAFT
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

        {/* Source Reference Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Source Test
            </span>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              Exam: {associatedExam?.name || test.examId}
            </span>
          </div>
          <p className="font-bold text-slate-900 truncate">{test.name}</p>
          <span className="font-mono text-[11px] text-slate-500">{test.code}</span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700">
              New Test Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NEET-PG Medicine Test 02"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700">
              New Test Code *
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
              placeholder="e.g. NEETPG_MED_02"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
            />
            <p className="text-[11px] text-slate-400">
              Unique assessment identifier. Normalized to uppercase.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Duplicating...' : 'Duplicate Test'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

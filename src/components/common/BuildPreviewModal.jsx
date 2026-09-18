import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  Cpu, 
  ArrowRight, 
  Layers, 
  Eye, 
  RefreshCw,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import QuestionPreviewModal from './QuestionPreviewModal.jsx';

export default function BuildPreviewModal({
  isOpen,
  onClose,
  candidateResult,
  existingQuestionsCount = 0,
  onApply,
  onRegenerate,
  isApplying = false,
  isRegenerating = false
}) {
  const [inspectQuestion, setInspectQuestion] = useState(null);
  const [showConfirmOverride, setShowConfirmOverride] = useState(false);

  if (!isOpen || !candidateResult) return null;

  const {
    questionIds = [],
    totalQuestions = 0,
    distribution = {},
    questions = [],
    warnings = []
  } = candidateResult;

  const handleApplyClick = () => {
    if (existingQuestionsCount > 0 && !showConfirmOverride) {
      setShowConfirmOverride(true);
      return;
    }
    onApply(questionIds);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    Build Preview
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Candidate Set (Not yet committed)
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Generated Blueprint Question Set ({totalQuestions} Questions)
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            
            {/* Overwrite Alert if existing questions present */}
            {existingQuestionsCount > 0 && (
              <div className={`p-4 rounded-2xl border transition-all ${
                showConfirmOverride
                  ? 'bg-amber-100 border-amber-300 ring-2 ring-amber-500/20'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-amber-900 text-xs">
                      Existing Question Set Detected
                    </h4>
                    <p className="text-amber-800">
                      This test already contains <strong>{existingQuestionsCount} question{existingQuestionsCount !== 1 ? 's' : ''}</strong>.
                      Applying this candidate build will replace the current question set with the {totalQuestions} newly generated questions.
                    </p>
                    {showConfirmOverride && (
                      <div className="pt-2 flex items-center gap-2">
                        <span className="font-bold text-amber-950 text-xs">Confirm replacement?</span>
                        <button
                          type="button"
                          onClick={() => onApply(questionIds)}
                          className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold text-xs"
                        >
                          Yes, Replace and Apply
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowConfirmOverride(false)}
                          className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-bold text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Warnings */}
            {warnings && warnings.length > 0 && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                {warnings.map((w, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-amber-800 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Distribution Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Subject Breakdown */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Subject Distribution
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {Object.entries(distribution.subjects || {}).map(([subj, count]) => (
                    <div key={subj} className="flex items-center justify-between font-semibold text-slate-700">
                      <span className="truncate pr-2">{subj}</span>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-900 font-bold shrink-0">
                        {count} Qs
                      </span>
                    </div>
                  ))}
                  {Object.keys(distribution.subjects || {}).length === 0 && (
                    <span className="text-slate-400 italic">No subject targets</span>
                  )}
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Difficulty Breakdown
                </span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100 font-bold">
                    <span>Easy</span>
                    <span>{distribution.difficulties?.easy || 0} Qs ({Math.round(((distribution.difficulties?.easy || 0) / (totalQuestions || 1)) * 100)}%)</span>
                  </div>
                  <div className="flex items-center justify-between text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-100 font-bold">
                    <span>Medium</span>
                    <span>{distribution.difficulties?.medium || 0} Qs ({Math.round(((distribution.difficulties?.medium || 0) / (totalQuestions || 1)) * 100)}%)</span>
                  </div>
                  <div className="flex items-center justify-between text-rose-800 bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-100 font-bold">
                    <span>Hard</span>
                    <span>{distribution.difficulties?.hard || 0} Qs ({Math.round(((distribution.difficulties?.hard || 0) / (totalQuestions || 1)) * 100)}%)</span>
                  </div>
                </div>
              </div>

              {/* Question Formats Breakdown */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Question Types
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {Object.entries(distribution.questionTypes || {}).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between font-semibold text-slate-700">
                      <span className="uppercase text-[10px] tracking-wider truncate">{type.replace('_', ' ')}</span>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-900 font-bold shrink-0">
                        {count} Qs
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Question Roster Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Candidate Question Roster ({questionIds.length} Items)
                </h4>
                <span className="text-slate-400 text-[10px]">Deterministic order</span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto bg-white">
                {questions.map((q, idx) => {
                  const prompt = q.content?.prompt || q.question || q.prompt || '';
                  const diff = (q.metadata?.difficulty || 'medium').toLowerCase();
                  const subj = q.metadata?.subject || 'General';

                  return (
                    <div key={q.id || idx} className="p-3 hover:bg-slate-50/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-[10px] font-bold text-slate-400 w-6 shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate max-w-lg">
                            {prompt}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {q.id}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {subj}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              diff === 'easy' ? 'bg-emerald-100 text-emerald-800' :
                              diff === 'hard' ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {diff}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setInspectQuestion(q)}
                        className="px-2.5 py-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              disabled={isApplying}
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-bold text-xs"
            >
              Cancel (Discard Candidate Set)
            </button>

            <div className="flex items-center gap-2">
              {onRegenerate && (
                <button
                  type="button"
                  disabled={isApplying || isRegenerating}
                  onClick={onRegenerate}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
              )}

              <button
                type="button"
                disabled={isApplying}
                onClick={handleApplyClick}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                {isApplying ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Committing Build…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Apply Build to Test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inspect Modal if user clicks inspect */}
      {inspectQuestion && (
        <QuestionPreviewModal
          question={inspectQuestion}
          onClose={() => setInspectQuestion(null)}
        />
      )}
    </>
  );
}

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  Flag, 
  CheckCircle2, 
  RotateCcw, 
  HelpCircle, 
  ShieldCheck, 
  Eye,
  AlertTriangle,
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';
import { testPreviewService } from '../../services/testPreviewService.js';

export default function StudentTestPreviewModal({ test, isOpen, onClose }) {
  if (!isOpen || !test) return null;

  // Build lightweight preview model
  const previewModel = useMemo(() => {
    return testPreviewService.getPreviewModel(test);
  }, [test]);

  const { questions = [], sections = [], navigation = {}, scoring = {}, durationMinutes = 60 } = previewModel;

  // Interactive in-memory state for candidate simulation
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [qId]: optionId }
  const [flaggedIds, setFlaggedIds] = useState(new Set());
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id || null);

  const currentQ = questions[currentIdx] || questions[0];

  const handleSelectOption = (optId) => {
    if (!currentQ) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: optId
    }));
  };

  const handleClearResponse = () => {
    if (!currentQ) return;
    setUserAnswers(prev => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  const handleToggleFlag = () => {
    if (!currentQ) return;
    setFlaggedIds(prev => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) next.delete(currentQ.id);
      else next.add(currentQ.id);
      return next;
    });
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleJumpTo = (idx) => {
    if (navigation.mode === 'LINEAR' && idx > currentIdx) {
      // In strict linear mode, forward jumping without answering is restricted
      return;
    }
    setCurrentIdx(idx);
  };

  const answeredCount = Object.keys(userAnswers).length;
  const flaggedCount = flaggedIds.size;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-slate-900 text-slate-100 rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl border border-slate-800 overflow-hidden">
        {/* Prototype Watermark Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-4 py-1.5 text-center text-[11px] font-black tracking-wider uppercase text-white shadow-xs shrink-0 flex items-center justify-center gap-2">
          <Eye className="w-3.5 h-3.5" />
          <span>Candidate Experience Simulation — Local In-Memory Review Mode</span>
          <span className="opacity-75">• No attempts or records saved</span>
        </div>

        {/* Header Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 font-mono">
                  {test.code}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">{previewModel.examName}</span>
              </div>
              <h2 className="text-base font-black text-white tracking-tight truncate max-w-lg">
                {test.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Simulated Timer */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-amber-300 shadow-2xs">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{durationMinutes}:00 (Simulated)</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Header: Sections & Navigation Mode */}
        <div className="bg-slate-900/90 px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Section Pills */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {sections.map((sec, sIdx) => {
              const isActive = activeSectionId === sec.id || (sIdx === 0 && !activeSectionId);
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`px-3 py-1 rounded-xl font-bold text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>{sec.name}</span>
                  <span className="text-[10px] opacity-75">({sec.questionCount})</span>
                </button>
              );
            })}
          </div>

          {/* Nav Mode Badge */}
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>Navigation: <strong className="text-white">{navigation.mode === 'LINEAR' ? 'Strict Linear' : 'Free Jump'}</strong></span>
            <span>•</span>
            <span>Scoring: <strong className="text-emerald-400">+{scoring.correct}</strong> / <strong className="text-rose-400">{scoring.incorrect}</strong></span>
          </div>
        </div>

        {/* Main Content: Question Body + Question Palette Sidebar */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Question Area (8 cols) */}
          <div className="lg:col-span-8 p-6 overflow-y-auto flex flex-col justify-between space-y-6">
            {currentQ ? (
              <div className="space-y-6 max-w-3xl">
                {/* Question Metadata Header */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-black text-xs border border-indigo-500/30">
                      Question {currentIdx + 1} of {questions.length}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">
                      {currentQ.subject}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                      {currentQ.difficulty}
                    </span>
                  </div>

                  {navigation.allowReviewFlag && (
                    <button
                      type="button"
                      onClick={handleToggleFlag}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        flaggedIds.has(currentQ.id)
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>{flaggedIds.has(currentQ.id) ? 'Flagged for Review' : 'Flag Question'}</span>
                    </button>
                  )}
                </div>

                {/* Stimulus / Clinical Case Details (if present) */}
                {currentQ.stimulus && (
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-indigo-400 block mb-1 text-[11px] uppercase tracking-wider">
                      Clinical Vignette Attachment
                    </strong>
                    {currentQ.stimulus}
                  </div>
                )}

                {/* Question Stem */}
                <div className="text-sm font-medium text-slate-100 leading-relaxed whitespace-pre-line">
                  {currentQ.stem}
                </div>

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  {currentQ.options.map((opt) => {
                    const isSelected = userAnswers[currentQ.id] === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`p-3.5 rounded-2xl border text-xs sm:text-sm cursor-pointer transition-all flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500 shadow-sm'
                            : 'bg-slate-800/40 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-700 text-slate-400'
                        }`}>
                          {opt.label}
                        </span>
                        <span className="flex-1 leading-relaxed pt-0.5">{opt.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 p-8">No questions loaded in this assessment.</div>
            )}

            {/* Bottom Actions Bar inside Question Area */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous
                </button>

                <button
                  type="button"
                  onClick={handleClearResponse}
                  disabled={!userAnswers[currentQ?.id]}
                  className="px-3 py-2 bg-slate-800/60 hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold transition-colors"
                >
                  Clear Response
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIdx === questions.length - 1}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  Next Question <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Question Palette (4 cols) */}
          <div className="lg:col-span-4 bg-slate-950 p-6 border-l border-slate-800 flex flex-col justify-between space-y-6 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Question Palette
                </h3>
                <div className="flex items-center justify-between text-xs mt-1 text-slate-300">
                  <span>Answered: <strong className="text-emerald-400">{answeredCount}</strong> / {questions.length}</span>
                  <span>Flagged: <strong className="text-amber-400">{flaggedCount}</strong></span>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Flagged</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-700" />
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-indigo-600" />
                  <span>Current Item</span>
                </div>
              </div>

              {/* Grid of Question Numbers */}
              <div className="grid grid-cols-5 gap-2 max-h-[42vh] overflow-y-auto pr-1">
                {questions.map((q, qIdx) => {
                  const isCurrent = qIdx === currentIdx;
                  const isAnswered = Boolean(userAnswers[q.id]);
                  const isFlagged = flaggedIds.has(q.id);

                  let btnStyle = 'bg-slate-800 text-slate-300 border-slate-700';
                  if (isAnswered) {
                    btnStyle = 'bg-emerald-600 text-white border-emerald-500 font-bold';
                  } else if (isFlagged) {
                    btnStyle = 'bg-amber-500 text-slate-950 border-amber-400 font-bold';
                  }

                  if (isCurrent) {
                    btnStyle += ' ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950 scale-105';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleJumpTo(qIdx)}
                      className={`h-9 rounded-xl border text-xs font-bold transition-all flex items-center justify-center relative ${btnStyle}`}
                      title={`Jump to Question ${qIdx + 1}`}
                    >
                      <span>{qIdx + 1}</span>
                      {isFlagged && isAnswered && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 right-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exit Simulation Footer */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Exit Simulation Preview
              </button>
              <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                This simulated candidate preview tests questions sequence, options formatting, and navigation without submitting responses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

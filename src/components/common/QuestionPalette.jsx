import React, { useState, useMemo } from 'react';
import { 
  Check, 
  Flag, 
  Layers, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  ChevronRight
} from 'lucide-react';

export default function QuestionPalette({
  questions = [],
  sections = [],
  currentIndex = 0,
  onSelectQuestion,
  answers = {},
  markedForReview = [],
  visitedQuestionIds = [],
  navigation = { mode: 'FREE', allowJump: true },
  disabled = false,
  className = ''
}) {
  const [activeSectionId, setActiveSectionId] = useState('all');

  const markedSet = useMemo(() => {
    if (Array.isArray(markedForReview)) return new Set(markedForReview);
    if (typeof markedForReview === 'object' && markedForReview !== null) {
      return new Set(Object.keys(markedForReview).filter(k => markedForReview[k]));
    }
    return new Set();
  }, [markedForReview]);

  const visitedSet = useMemo(() => {
    if (Array.isArray(visitedQuestionIds)) return new Set(visitedQuestionIds);
    if (visitedQuestionIds instanceof Set) return visitedQuestionIds;
    return new Set();
  }, [visitedQuestionIds]);

  // Filter questions by section if multiple sections exist
  const displayedQuestions = useMemo(() => {
    if (activeSectionId === 'all' || sections.length <= 1) {
      return questions;
    }
    const targetSection = sections.find(s => s.id === activeSectionId);
    return targetSection ? targetSection.questions : questions;
  }, [questions, sections, activeSectionId]);

  // Aggregate metrics
  const metrics = useMemo(() => {
    let answered = 0;
    let marked = 0;
    let answeredAndMarked = 0;
    let notVisited = 0;

    questions.forEach(q => {
      const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '' &&
        (!Array.isArray(answers[q.id]) || answers[q.id].length > 0);
      const isMarked = markedSet.has(q.id);
      const isVisited = visitedSet.has(q.id);

      if (isAnswered && isMarked) answeredAndMarked++;
      else if (isAnswered) answered++;
      else if (isMarked) marked++;
      else if (!isVisited) notVisited++;
    });

    const notAnswered = questions.length - answered - answeredAndMarked;

    return {
      answered,
      marked,
      answeredAndMarked,
      notAnswered: Math.max(0, notAnswered),
      notVisited
    };
  }, [questions, answers, markedSet, visitedSet]);

  const getItemStatus = (q, globalIdx) => {
    const isCurrent = globalIdx === currentIndex;
    const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '' &&
      (!Array.isArray(answers[q.id]) || answers[q.id].length > 0);
    const isMarked = markedSet.has(q.id);
    const isVisited = visitedSet.has(q.id);

    if (isAnswered && isMarked) {
      return {
        label: 'Answered & Marked',
        classes: isCurrent
          ? 'bg-purple-600 text-white ring-2 ring-purple-600 ring-offset-2 font-bold'
          : 'bg-purple-100 text-purple-800 border border-purple-300 font-bold',
        icon: <Flag className="w-2.5 h-2.5 fill-current shrink-0" />
      };
    }

    if (isMarked) {
      return {
        label: 'Marked for Review',
        classes: isCurrent
          ? 'bg-amber-500 text-white ring-2 ring-amber-500 ring-offset-2 font-bold'
          : 'bg-amber-100 text-amber-800 border border-amber-300 font-bold',
        icon: <Flag className="w-2.5 h-2.5 fill-current shrink-0" />
      };
    }

    if (isAnswered) {
      return {
        label: 'Answered',
        classes: isCurrent
          ? 'bg-emerald-600 text-white ring-2 ring-emerald-600 ring-offset-2 font-bold'
          : 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold',
        icon: <Check className="w-2.5 h-2.5 stroke-[3] shrink-0" />
      };
    }

    if (isVisited) {
      return {
        label: 'Visited, Unanswered',
        classes: isCurrent
          ? 'bg-rose-500 text-white ring-2 ring-rose-500 ring-offset-2 font-bold'
          : 'bg-rose-50 text-rose-700 border border-rose-200 font-medium',
        icon: null
      };
    }

    return {
      label: 'Not Visited',
      classes: isCurrent
        ? 'bg-slate-800 text-white ring-2 ring-slate-800 ring-offset-2 font-bold'
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/80 font-medium',
      icon: null
    };
  };

  const handleItemClick = (q) => {
    if (disabled) return;
    const globalIdx = questions.findIndex(item => item.id === q.id);
    if (globalIdx === -1) return;

    // Linear navigation check: cannot jump ahead in linear mode without answering
    if (navigation.mode === 'LINEAR' && globalIdx > currentIndex) {
      return;
    }

    onSelectQuestion && onSelectQuestion(globalIdx);
  };

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col space-y-4 ${className}`}>
      {/* Palette Title & Sections */}
      <div className="space-y-2 border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-600" />
            <span>Question Palette</span>
          </h4>
          <span className="text-[11px] font-bold text-slate-400">
            {questions.length} Questions
          </span>
        </div>

        {/* Section Tabs (if structured) */}
        {sections.length > 1 && (
          <div className="flex items-center gap-1 overflow-x-auto pt-1 pb-0.5">
            <button
              type="button"
              onClick={() => setActiveSectionId('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0 ${
                activeSectionId === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({questions.length})
            </button>
            {sections.map(sec => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSectionId(sec.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0 truncate max-w-[120px] ${
                  activeSectionId === sec.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={sec.name}
              >
                {sec.name} ({sec.questions?.length || 0})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Question Number Buttons Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-5 gap-2 overflow-y-auto max-h-64 p-1">
        {displayedQuestions.map((q) => {
          const globalIdx = questions.findIndex(item => item.id === q.id);
          const status = getItemStatus(q, globalIdx);
          const canClick = !disabled && (navigation.mode !== 'LINEAR' || globalIdx <= currentIndex);

          return (
            <button
              key={q.id}
              type="button"
              disabled={!canClick}
              onClick={() => handleItemClick(q)}
              className={`h-9 rounded-xl flex items-center justify-center text-xs transition-all relative cursor-pointer ${status.classes} ${
                !canClick ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
              }`}
              title={`Question ${globalIdx + 1}: ${status.label}`}
            >
              <span className="leading-none">{globalIdx + 1}</span>
              {status.icon && (
                <span className="absolute top-1 right-1 scale-75">
                  {status.icon}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend & Summary Counters */}
      <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px]">
        <div className="grid grid-cols-2 gap-2 text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold text-[8px]">
              ✓
            </span>
            <span>Answered: <strong>{metrics.answered}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 font-bold text-[8px]">
              ⚑
            </span>
            <span>Marked: <strong>{metrics.marked}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700 font-bold text-[8px]">
              ★
            </span>
            <span>Ans &amp; Marked: <strong>{metrics.answeredAndMarked}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-200" />
            <span>Not Visited: <strong>{metrics.notVisited}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

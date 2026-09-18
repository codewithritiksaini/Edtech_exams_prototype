import React from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  ListOrdered, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Lock
} from 'lucide-react';
import { questionService } from '../../../services/questionService';

export default function FacultySelectedQuestionsPanel({
  test,
  questionIds = [],
  onRemoveQuestion,
  onReorderQuestions,
  isLocked = false
}) {
  // Resolve question objects from questionService in exact order of IDs
  const resolvedQuestions = questionIds.map((id, index) => {
    const q = questionService.getQuestionById(id);
    return {
      id,
      order: index + 1,
      question: q || {
        id,
        content: { prompt: `Referenced Question (${id})` },
        metadata: { subject: 'Unknown', topic: 'Unresolved', difficulty: 'medium' },
        type: 'single_choice'
      }
    };
  });

  const handleMoveUp = (index) => {
    if (index <= 0 || isLocked) return;
    const newIds = [...questionIds];
    const temp = newIds[index - 1];
    newIds[index - 1] = newIds[index];
    newIds[index] = temp;
    onReorderQuestions(newIds);
  };

  const handleMoveDown = (index) => {
    if (index >= questionIds.length - 1 || isLocked) return;
    const newIds = [...questionIds];
    const temp = newIds[index + 1];
    newIds[index + 1] = newIds[index];
    newIds[index] = temp;
    onReorderQuestions(newIds);
  };

  const difficultyColors = {
    easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    hard: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ListOrdered className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Selected Questions</h2>
            <p className="text-[11px] text-slate-400">
              {questionIds.length} questions attached in examination order
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLocked ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              <Lock className="w-3 h-3" /> Read-Only
            </span>
          ) : (
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              {questionIds.length} Added
            </span>
          )}
        </div>
      </div>

      {/* Questions Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
        {resolvedQuestions.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50/60 text-indigo-500 flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <div className="text-sm font-bold text-slate-800">No Questions Added Yet</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              This assessment currently contains no questions. Search and click "+ Add" on questions from the Question Bank on the left to populate this examination.
            </p>
          </div>
        ) : (
          resolvedQuestions.map(({ id, order, question }, idx) => {
            const prompt = question.content?.prompt || question.question || `Question #${order}`;
            const vignette = question.content?.vignette || question.vignette || '';
            const difficulty = question.metadata?.difficulty || 'medium';
            const subject = question.metadata?.subject || 'Medicine';
            const topic = question.metadata?.topic || 'General';
            const type = question.type || 'single_choice';

            const isFirst = idx === 0;
            const isLast = idx === resolvedQuestions.length - 1;

            return (
              <div 
                key={`${id}-${order}`}
                className="py-3 first:pt-0 last:pb-0 group hover:bg-slate-50/80 rounded-xl p-2.5 transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* Order Number Badge */}
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold text-xs flex items-center justify-center mt-0.5">
                    #{order}
                  </div>

                  {/* Question Content & Metadata */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="font-mono text-slate-400">
                        {id}
                      </span>
                      <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                        {subject}
                      </span>
                      <span className="text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {topic}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded font-bold uppercase border ${difficultyColors[difficulty] || difficultyColors.medium}`}>
                        {difficulty}
                      </span>
                    </div>

                    {vignette && (
                      <p className="text-[11px] text-slate-400 italic line-clamp-1 leading-snug">
                        "{vignette}"
                      </p>
                    )}

                    <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug">
                      {prompt}
                    </h4>
                  </div>

                  {/* Reorder and Remove Actions */}
                  {!isLocked && (
                    <div className="shrink-0 flex items-center gap-1 pt-0.5">
                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        disabled={isFirst}
                        title="Move Up"
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => handleMoveDown(idx)}
                        disabled={isLast}
                        title="Move Down"
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => onRemoveQuestion(id)}
                        title="Remove question from this assessment"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

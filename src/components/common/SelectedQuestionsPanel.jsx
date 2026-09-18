import React from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  ListOrdered, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle,
  Eye,
  Lock,
  Sparkles
} from 'lucide-react';
import { questionBankService } from '../../services/questionBankService.js';
import { questionTypeService } from '../../services/questionTypeService.js';

export default function SelectedQuestionsPanel({
  test,
  questionIds = [],
  onRemoveQuestion,
  onReorderQuestions,
  onPreviewQuestion,
  isLocked = false,
  validation = null
}) {
  const targetQuestions = test?.targetQuestions || 100;
  const count = questionIds.length;
  const progressPercent = Math.min(100, Math.round((count / targetQuestions) * 100));

  // Resolve question objects in exact order of IDs
  const resolvedQuestions = questionBankService.getQuestionsByIds(questionIds).map((q, idx) => {
    const id = questionIds[idx];
    return {
      id,
      order: idx + 1,
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
    if (onReorderQuestions) onReorderQuestions(newIds);
  };

  const handleMoveDown = (index) => {
    if (index >= questionIds.length - 1 || isLocked) return;
    const newIds = [...questionIds];
    const temp = newIds[index + 1];
    newIds[index + 1] = newIds[index];
    newIds[index] = temp;
    if (onReorderQuestions) onReorderQuestions(newIds);
  };

  const difficultyColors = {
    easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    hard: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xs flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="p-5 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ListOrdered className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Active Test Roster</h2>
              <p className="text-[11px] text-slate-400">
                {count} items attached • Sequence reflects candidate delivery order
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
                {count} / {targetQuestions} Target
              </span>
            )}
          </div>
        </div>

        {/* Progress against target questions */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>Target Standard Progress</span>
            <span className="font-bold text-slate-700">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 rounded-full ${
                progressPercent >= 100 
                  ? 'bg-emerald-500' 
                  : progressPercent >= 50 
                    ? 'bg-indigo-600' 
                    : 'bg-amber-500'
              }`} 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Validation Warning / Error Banner if any */}
        {validation && validation.warnings && validation.warnings.length > 0 && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-tight">{validation.warnings[0]}</span>
          </div>
        )}
      </div>

      {/* Questions Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-100 max-h-[600px]">
        {resolvedQuestions.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50/60 text-indigo-500 flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <div className="text-sm font-bold text-slate-800">No Questions Attached Yet</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              This test currently contains no questions. Search and click &quot;+ Add&quot; on questions from the Question Bank to populate this test.
            </p>
          </div>
        ) : (
          resolvedQuestions.map(({ id, order, question }, idx) => {
            const prompt = question.content?.prompt || question.question || `Question #${order}`;
            const vignette = question.content?.vignette || question.vignette || '';
            const difficulty = (question.metadata?.difficulty || 'medium').toLowerCase();
            const subject = question.metadata?.subject || 'General';
            const topic = question.metadata?.topic || 'General Topic';
            const typeDef = questionTypeService.getQuestionTypeById(question.type);

            const isFirst = idx === 0;
            const isLast = idx === resolvedQuestions.length - 1;

            return (
              <div 
                key={`${id}-${order}`}
                className="py-2.5 first:pt-0 last:pb-0 group hover:bg-slate-50/80 rounded-2xl p-3 transition-all border border-transparent hover:border-slate-100"
              >
                <div className="flex items-start gap-3">
                  {/* Sequence Position */}
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
                      <span className={`px-1.5 py-0.2 rounded font-semibold border ${typeDef?.badgeClass || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {typeDef?.shortName || question.type}
                      </span>
                    </div>

                    {vignette && (
                      <p className="text-[11px] text-slate-400 italic line-clamp-1 leading-snug">
                        &quot;{vignette}&quot;
                      </p>
                    )}

                    <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug">
                      {prompt}
                    </h4>
                  </div>

                  {/* Actions: Reorder, Preview, Remove */}
                  <div className="shrink-0 flex items-center gap-1 pt-0.5">
                    {onPreviewQuestion && (
                      <button
                        type="button"
                        onClick={() => onPreviewQuestion(question)}
                        title="Preview question inspection"
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!isLocked && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleMoveUp(idx)}
                          disabled={isFirst}
                          title="Move Up"
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMoveDown(idx)}
                          disabled={isLast}
                          title="Move Down"
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onRemoveQuestion && onRemoveQuestion(id)}
                          title="Remove from test"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors ml-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Plus, 
  UploadCloud, 
  FileText, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  Sparkles,
  Layers,
  HelpCircle,
  Tag
} from 'lucide-react';
import ManualQuestionModal from './ManualQuestionModal.jsx';
import UploadQuestionsModal from './UploadQuestionsModal.jsx';
import QuestionPreviewModal from './QuestionPreviewModal.jsx';

export default function ManualBuildWorkspace({
  test = {},
  attachedQuestions = [],
  targetQuestions = 0,
  onAddQuestionManual,
  onAddQuestionsBulk,
  onRemoveQuestion,
  onReorderQuestions,
  onClearAll,
  isLocked = false
}) {
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);

  const handleMove = (index, direction) => {
    if (isLocked) return;
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= attachedQuestions.length) return;

    const list = [...attachedQuestions];
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    const orderedIds = list.map(q => q.id);
    onReorderQuestions(orderedIds);
  };

  const handleQuestionCreated = (newQuestion) => {
    if (onAddQuestionManual) {
      onAddQuestionManual(newQuestion.id);
    }
  };

  const handleQuestionsImported = (newQuestions) => {
    if (onAddQuestionsBulk) {
      onAddQuestionsBulk(newQuestions.map(q => q.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Manual Question Assembly</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Add questions directly to this assessment via document upload (PDF / DOCX) or authoring manually.
          </p>
        </div>

        {!isLocked && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-cyan-600" />
              <span>Upload Document (PDF / DOCX)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question Manually</span>
            </button>
          </div>
        )}
      </div>

      {/* Roster & Stats */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-800">
              Attached Test Questions ({attachedQuestions.length})
            </span>
            {targetQuestions > 0 && (
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                attachedQuestions.length >= targetQuestions
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {attachedQuestions.length} / {targetQuestions} Target
              </span>
            )}
          </div>

          {attachedQuestions.length > 0 && !isLocked && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear All Questions
            </button>
          )}
        </div>

        {/* Questions List */}
        {attachedQuestions.length === 0 ? (
          <div className="p-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h4 className="text-sm font-bold text-slate-900">No Questions Attached Yet</h4>
              <p className="text-xs text-slate-500 mt-1">
                Upload a document (PDF / DOCX) to automatically parse MCQs, or author a new question manually.
              </p>
            </div>

            {!isLocked && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="p-4 rounded-2xl border-2 border-dashed border-cyan-200 hover:border-cyan-400 bg-cyan-50/40 hover:bg-cyan-50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-900">Upload PDF / DOCX</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Parse multiple MCQs from document</div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(true)}
                  className="p-4 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-900">Add Question Manually</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Author prompt, options &amp; answers</div>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {attachedQuestions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {q.id}
                      </span>
                      {q.metadata?.subject && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                          {q.metadata.subject}
                        </span>
                      )}
                      {q.metadata?.difficulty && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          q.metadata.difficulty === 'hard'
                            ? 'bg-rose-50 text-rose-700'
                            : q.metadata.difficulty === 'medium'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {q.metadata.difficulty}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-900 line-clamp-2">
                      {q.content?.prompt || q.question || 'Question prompt'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setPreviewQuestion(q)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Preview Question"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {!isLocked && (
                    <>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, -1)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg transition-colors"
                        title="Move Up"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        disabled={idx === attachedQuestions.length - 1}
                        onClick={() => handleMove(idx, 1)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg transition-colors"
                        title="Move Down"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveQuestion(q.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Remove Question from Test"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ManualQuestionModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        test={test}
        onQuestionCreated={handleQuestionCreated}
      />

      <UploadQuestionsModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        test={test}
        onQuestionsImported={handleQuestionsImported}
      />

      {previewQuestion && (
        <QuestionPreviewModal
          question={previewQuestion}
          onClose={() => setPreviewQuestion(null)}
        />
      )}
    </div>
  );
}

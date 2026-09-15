import React from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Tag, 
  BookOpen, 
  Award, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { 
  QUESTION_TYPES, 
  QUESTION_TYPE_CONFIG 
} from '../../utils/questionTypes.js';
import QuestionStatusBadge from './QuestionStatusBadge.jsx';
import QuestionDifficultyBadge from './QuestionDifficultyBadge.jsx';

export default function QuestionPreview({ question, className = '' }) {
  if (!question) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
        <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-sm font-semibold">No question data provided for preview.</p>
      </div>
    );
  }

  const typeConfig = QUESTION_TYPE_CONFIG[question.type] || {
    label: question.type || 'Custom Type',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200'
  };

  const correctAnswers = Array.isArray(question.answer?.correct) 
    ? question.answer.correct 
    : (question.answer?.correct ? [question.answer.correct] : []);

  const isSingleChoice = question.type === QUESTION_TYPES.SINGLE_CHOICE;
  const isMultipleChoice = question.type === QUESTION_TYPES.MULTIPLE_CHOICE;
  const isTrueFalse = question.type === QUESTION_TYPES.TRUE_FALSE;
  const isShortAnswer = question.type === QUESTION_TYPES.SHORT_ANSWER;
  const isFillBlank = question.type === QUESTION_TYPES.FILL_BLANK;
  const isMatching = question.type === QUESTION_TYPES.MATCHING;

  const marks = question.scoring?.marks ?? 5;
  const negativeMarks = question.scoring?.negativeMarks ?? -1;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Banner: Preview / Author View */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl">
        <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Preview / Author View</span>
          <span className="text-amber-500 font-normal">
            (Instructor verification mode — correct answers highlighted)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <QuestionStatusBadge status={question.status} />
          <QuestionDifficultyBadge difficulty={question.metadata?.difficulty} />
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
        {/* Header Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold">
              ID: {question.id}
            </span>
            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${typeConfig.badgeClass}`}>
              {typeConfig.label}
            </span>
            {question.metadata?.subject && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold">
                {question.metadata.subject}
                {question.metadata?.topic ? ` • ${question.metadata.topic}` : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
              +{marks} {marks === 1 ? 'Mark' : 'Marks'}
            </span>
            <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
              {negativeMarks} Penalty
            </span>
          </div>
        </div>

        {/* Section 1: Clinical Vignette (Stem) */}
        {question.content?.vignette && (
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-900">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Clinical Scenario Stem / Patient Presentation</span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {question.content.vignette}
            </p>
          </div>
        )}

        {/* Section 2: Question Prompt */}
        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
            {question.content?.prompt || 'No question prompt entered.'}
          </h3>
        </div>

        {/* Section 3: Response Format & Answer Key */}
        <div className="pt-2">
          {/* A. Single Choice Options */}
          {isSingleChoice && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Options (Single Best Answer)
              </p>
              <div className="space-y-2">
                {(question.responseSchema?.options || []).map((opt) => {
                  const isCorrect = correctAnswers.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                        isCorrect
                          ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-slate-50/50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <div className="flex-1 pt-0.5 min-w-0">
                        <span className={`text-xs sm:text-sm ${isCorrect ? 'font-bold text-emerald-950' : 'text-slate-800'}`}>
                          {opt.text}
                        </span>
                      </div>
                      {isCorrect && (
                        <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-lg shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Correct Answer</span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* B. Multiple Choice Options */}
          {isMultipleChoice && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Options (Multi-Select • Select all that apply)
              </p>
              <div className="space-y-2">
                {(question.responseSchema?.options || []).map((opt) => {
                  const isCorrect = correctAnswers.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                        isCorrect
                          ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20'
                          : 'bg-slate-50/50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          isCorrect
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <div className="flex-1 pt-0.5 min-w-0">
                        <span className={`text-xs sm:text-sm ${isCorrect ? 'font-bold text-indigo-950' : 'text-slate-800'}`}>
                          {opt.text}
                        </span>
                      </div>
                      {isCorrect && (
                        <span className="flex items-center gap-1 text-[11px] font-extrabold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-lg shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Correct</span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* C. True / False */}
          {isTrueFalse && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Response Judgment
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                {['true', 'false'].map((val) => {
                  const isCorrect = correctAnswers.map(String).includes(val);
                  return (
                    <div
                      key={val}
                      className={`p-4 rounded-2xl border text-center font-bold text-sm transition-all ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="uppercase tracking-wider">{val}</div>
                      {isCorrect && (
                        <div className="mt-1 text-[11px] font-black text-emerald-700 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Key Answer</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* D. Short Answer */}
          {isShortAnswer && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Accepted Free-Text Answers
              </p>
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {correctAnswers.length > 0 ? (
                    correctAnswers.map((ans, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold shadow-2xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>"{ans}"</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-amber-700 italic">No accepted answers specified.</span>
                  )}
                </div>
                <p className="text-[11px] text-amber-700">
                  {question.responseSchema?.caseSensitive
                    ? 'Note: Evaluation is case-sensitive.'
                    : 'Note: Evaluation is case-insensitive.'}
                </p>
              </div>
            </div>
          )}

          {/* E. Fill in the Blank */}
          {isFillBlank && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Target Blank Solutions
              </p>
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {correctAnswers.length > 0 ? (
                    correctAnswers.map((ans, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-white border border-purple-300 text-purple-900 text-xs font-bold shadow-2xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>"{ans}"</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-purple-700 italic">No target blank answers specified.</span>
                  )}
                </div>
                {question.responseSchema?.placeholder && (
                  <p className="text-[11px] text-purple-700">
                    Input placeholder: "{question.responseSchema.placeholder}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* F. Matching & Future Formats */}
          {isMatching && (
            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-2">
              <p className="text-xs font-black uppercase tracking-wider text-teal-900">
                Matching Pairs Definition
              </p>
              <p className="text-xs text-teal-700">
                Premises and targets paired in canonical responseSchema. Interactive matching preview is available in the student simulator.
              </p>
            </div>
          )}

          {!isSingleChoice && !isMultipleChoice && !isTrueFalse && !isShortAnswer && !isFillBlank && !isMatching && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-slate-600 text-xs">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Interactive authoring for {typeConfig.label} will be enabled in Phase 5. Model schema is stored and validated.
              </span>
            </div>
          )}
        </div>

        {/* Section 4: Clinical Explanation & Pedagogical Rationale */}
        {question.explanation && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Explanation & Clinical Rationale</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {question.explanation}
            </p>
          </div>
        )}

        {/* Section 5: Metadata Tags Footer */}
        {Array.isArray(question.metadata?.tags) && question.metadata.tags.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>Tags:</span>
            </span>
            {question.metadata.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

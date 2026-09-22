import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  CheckSquare, 
  Square, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  Award, 
  AlertCircle,
  Tag
} from 'lucide-react';
import { QUESTION_TYPES } from '../../services/questionTypeService.js';

export default function QuestionRenderer({
  question,
  value,
  onChange,
  mode = 'student', // 'student' | 'preview'
  disabled = false,
  className = ''
}) {
  const [showAnswerKeyInPreview, setShowAnswerKeyInPreview] = useState(false);

  if (!question) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
        <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-sm font-semibold">No question available to display.</p>
      </div>
    );
  }

  const isPreview = mode === 'preview';
  const type = question.type || QUESTION_TYPES.SINGLE_BEST_ANSWER;

  // Single Best Answer (SBA) / True-False handler
  const handleSingleSelect = (optionId) => {
    if (disabled) return;
    onChange && onChange(optionId);
  };

  // Multiple Choice (MCQ) multi-select handler
  const handleMultiSelect = (optionId) => {
    if (disabled) return;
    const currentList = Array.isArray(value) ? [...value] : [];
    const index = currentList.indexOf(optionId);
    if (index === -1) {
      currentList.push(optionId);
    } else {
      currentList.splice(index, 1);
    }
    onChange && onChange(currentList);
  };

  // Text input handler (Short Answer / Fill Blank)
  const handleTextChange = (e) => {
    if (disabled) return;
    onChange && onChange(e.target.value);
  };

  const isOptionSelected = (optId) => {
    if (Array.isArray(value)) {
      return value.includes(optId);
    }
    return value === optId;
  };

  const isOptionCorrect = (optId) => {
    return (question.correctAnswers || []).includes(optId);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Preview-only Authoring Inspection Header */}
      {isPreview && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-800">
              {question.id}
            </span>
            <span className="font-bold px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[11px]">
              {question.typeName || question.type}
            </span>
            {question.metadata?.subject && (
              <span className="text-indigo-900 font-semibold hidden sm:inline">
                • {question.metadata.subject}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-emerald-700 font-bold px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[11px]">
              +{question.scoring?.marks ?? 4} Marks
            </span>
            <span className="text-rose-700 font-bold px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-[11px]">
              {question.scoring?.negativeMarks ?? -1} Penalty
            </span>
            <button
              type="button"
              onClick={() => setShowAnswerKeyInPreview(!showAnswerKeyInPreview)}
              className="px-2.5 py-1 rounded-lg bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              {showAnswerKeyInPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showAnswerKeyInPreview ? 'Hide Answer Key' : 'Reveal Answer Key'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Clinical Vignette Stem (if present) */}
      {question.vignette && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Clinical Scenario / Case Vignette</span>
          </div>
          <p className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
            {question.vignette}
          </p>
        </div>
      )}

      {/* Diagnostic Media Preview (if IMAGE_BASED or mediaUrl is present) */}
      {(question.mediaUrl || type === QUESTION_TYPES.IMAGE_BASED) && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span className="font-bold">Diagnostic Imaging / Investigation Slide</span>
            </div>
            <span className="text-[11px]">Radiology &amp; Clinical Tracing</span>
          </div>
          {question.mediaUrl ? (
            <img
              src={question.mediaUrl}
              alt="Diagnostic Clinical Image"
              className="max-h-72 w-auto mx-auto rounded-xl object-contain border border-slate-800"
            />
          ) : (
            <div className="h-44 rounded-xl border border-dashed border-slate-700 bg-slate-800/60 flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
              <ImageIcon className="w-8 h-8 mb-2 text-slate-500" />
              <span>Diagnostic radiology / ECG media reference</span>
            </div>
          )}
        </div>
      )}

      {/* Question Prompt */}
      <div className="space-y-2">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {question.prompt}
        </h3>
      </div>

      {/* TYPE-SPECIFIC RESPONSE CONTROLS */}

      {/* 1. SINGLE BEST ANSWER (SBA), TRUE/FALSE, EXTENDED MATCHING, CLINICAL CASE */}
      {(type === QUESTION_TYPES.SINGLE_BEST_ANSWER ||
        type === QUESTION_TYPES.TRUE_FALSE ||
        type === QUESTION_TYPES.EXTENDED_MATCHING ||
        type === QUESTION_TYPES.CLINICAL_CASE ||
        type === QUESTION_TYPES.IMAGE_BASED) && (
        <div className="space-y-2.5">
          {(question.options || []).map(opt => {
            const isSelected = isOptionSelected(opt.id);
            const isCorrect = isOptionCorrect(opt.id);
            const showCorrectHighlight = isPreview && showAnswerKeyInPreview && isCorrect;

            return (
              <button
                key={opt.id}
                type="button"
                disabled={disabled}
                onClick={() => handleSingleSelect(opt.id)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center gap-3.5 cursor-pointer ${
                  isSelected
                    ? 'bg-brand-50/70 border-brand-500 text-slate-900 shadow-sm ring-1 ring-brand-500/30'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200 text-slate-700'
                } ${showCorrectHighlight ? 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/40' : ''}`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    opt.id
                  )}
                </div>

                <div className="flex-1 text-sm font-medium leading-relaxed">
                  {opt.text}
                </div>

                {showCorrectHighlight && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md shrink-0">
                    Correct Option
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. MULTIPLE CHOICE (MCQ - Multi-Select Checkboxes) */}
      {type === QUESTION_TYPES.MULTIPLE_CHOICE && (
        <div className="space-y-3">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
            Select one or more correct choices:
          </div>

          <div className="space-y-2.5">
            {(question.options || []).map(opt => {
              const isSelected = isOptionSelected(opt.id);
              const isCorrect = isOptionCorrect(opt.id);
              const showCorrectHighlight = isPreview && showAnswerKeyInPreview && isCorrect;

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleMultiSelect(opt.id)}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center gap-3.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-500 text-slate-900 shadow-sm ring-1 ring-indigo-500/30'
                      : 'bg-white hover:bg-slate-50/80 border-slate-200 text-slate-700'
                  } ${showCorrectHighlight ? 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/40' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 text-sm font-medium leading-relaxed">
                    <span className="font-bold mr-2 text-slate-500">{opt.id}.</span>
                    {opt.text}
                  </div>

                  {showCorrectHighlight && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md shrink-0">
                      Correct Choice
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SHORT ANSWER / FILL IN THE BLANK (Text Input) */}
      {type === QUESTION_TYPES.SHORT_ANSWER && (
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-700">
            Type your response / missing term:
          </label>
          <input
            type="text"
            disabled={disabled}
            value={value || ''}
            onChange={handleTextChange}
            placeholder="Type answer here..."
            className="w-full sm:max-w-md px-4 py-3 bg-white border border-slate-300 rounded-2xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-100 disabled:cursor-not-allowed shadow-xs"
          />

          {isPreview && showAnswerKeyInPreview && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
              <span className="font-bold block">Accepted Answer:</span>
              <p className="font-mono">{question.textAnswer || (question.correctAnswers || []).join(', ')}</p>
            </div>
          )}
        </div>
      )}

      {/* Preview Answer Key & Rationale Disclosure */}
      {isPreview && showAnswerKeyInPreview && question.explanation && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1 text-xs text-amber-950 animate-fadeIn">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Clinical Explanation &amp; Rationale:</span>
          </div>
          <p className="leading-relaxed text-slate-700 whitespace-pre-wrap">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

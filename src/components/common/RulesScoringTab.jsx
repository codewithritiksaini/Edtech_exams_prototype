import React from 'react';
import { AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { CUTOFF_MODES } from '../../services/testRulesService.js';

export default function RulesScoringTab({ scoring, onChange, test, validation }) {

  const update = (patch) => onChange({ ...scoring, ...patch });

  const totalMarks = test?.totalMarks || ((test?.targetQuestions || test?.totalQuestions || 100) * (scoring.marksPerCorrect || 4));

  return (
    <div className="space-y-6">
      {/* Core Marks */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Marks Allocation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Marks per Correct */}
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50 space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
              Correct Answer
            </label>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold text-sm">+</span>
              <input
                type="number"
                min="0.5"
                max="100"
                step="0.5"
                value={scoring.marksPerCorrect}
                onChange={e => update({ marksPerCorrect: Number(e.target.value) })}
                className="w-full text-center text-lg font-black rounded-xl border border-emerald-200 bg-white text-emerald-800 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              />
              <span className="text-[10px] text-emerald-600 font-semibold">marks</span>
            </div>
          </div>

          {/* Marks per Incorrect */}
          <div className={`p-4 rounded-2xl border space-y-2 transition-all ${
            scoring.negativeMarkingEnabled ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50 opacity-60'
          }`}>
            <label className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block">
              Incorrect Answer
            </label>
            <div className="flex items-center gap-2">
              <span className="text-rose-600 font-bold text-sm">{scoring.negativeMarkingEnabled ? '' : '—'}</span>
              <input
                type="number"
                max="0"
                min="-100"
                step="0.5"
                value={scoring.marksPerIncorrect}
                disabled={!scoring.negativeMarkingEnabled}
                onChange={e => update({ marksPerIncorrect: Number(e.target.value) })}
                className="w-full text-center text-lg font-black rounded-xl border border-rose-200 bg-white text-rose-800 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400/40 disabled:opacity-40 disabled:cursor-not-allowed"
              />
              <span className="text-[10px] text-rose-600 font-semibold">marks</span>
            </div>
          </div>

          {/* Marks Unanswered */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Unanswered
            </label>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold text-sm">±</span>
              <input
                type="number"
                min="-10"
                max="10"
                step="0.5"
                value={scoring.marksUnanswered}
                onChange={e => update({ marksUnanswered: Number(e.target.value) })}
                className="w-full text-center text-lg font-black rounded-xl border border-slate-200 bg-white text-slate-800 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
              />
              <span className="text-[10px] text-slate-500 font-semibold">marks</span>
            </div>
          </div>
        </div>

        {/* Estimated Total Marks Preview */}
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs">
          <span className="text-indigo-800 font-semibold">Estimated Max Score</span>
          <span className="font-black text-indigo-900 text-base">
            {((test?.targetQuestions || test?.totalQuestions || 100) * (scoring.marksPerCorrect || 4)).toFixed(0)} marks
          </span>
        </div>
      </div>

      {/* Negative Marking Toggle */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Negative Marking</h3>
            <p className="text-xs text-slate-500 mt-0.5">Deduct marks for incorrect responses to discourage guessing.</p>
          </div>
          <button
            type="button"
            onClick={() => update({ negativeMarkingEnabled: !scoring.negativeMarkingEnabled })}
            className={`w-12 h-6 rounded-full transition-all relative ${
              scoring.negativeMarkingEnabled ? 'bg-rose-500' : 'bg-slate-200'
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
              scoring.negativeMarkingEnabled ? 'left-6' : 'left-0.5'
            }`} />
          </button>
        </div>

        {/* Partial Marking */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-800">Partial Marking</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Award proportional credit for partially correct multi-part answers.</p>
          </div>
          <button
            type="button"
            onClick={() => update({ partialMarkingEnabled: !scoring.partialMarkingEnabled })}
            className={`w-12 h-6 rounded-full transition-all relative ${
              scoring.partialMarkingEnabled ? 'bg-indigo-500' : 'bg-slate-200'
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
              scoring.partialMarkingEnabled ? 'left-6' : 'left-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* Cutoff Thresholds */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Passing Cutoff</h3>
          <p className="text-xs text-slate-500 mt-0.5">Define the minimum score required to pass this test.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: CUTOFF_MODES.NONE, label: 'No Cutoff', desc: 'No pass/fail threshold.' },
            { value: CUTOFF_MODES.PERCENTAGE, label: '% Cutoff', desc: 'Minimum percentage score.' },
            { value: CUTOFF_MODES.ABSOLUTE, label: 'Absolute Marks', desc: 'Fixed raw score threshold.' }
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ cutoffMode: opt.value, cutoffValue: opt.value === CUTOFF_MODES.NONE ? null : (scoring.cutoffValue ?? '') })}
              className={`p-3 rounded-xl border text-left transition-all ${
                scoring.cutoffMode === opt.value
                  ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/20'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`text-xs font-bold mb-0.5 ${scoring.cutoffMode === opt.value ? 'text-amber-800' : 'text-slate-700'}`}>{opt.label}</div>
              <div className="text-[10px] text-slate-500">{opt.desc}</div>
            </button>
          ))}
        </div>

        {scoring.cutoffMode !== CUTOFF_MODES.NONE && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-xs font-bold text-amber-800">
              {scoring.cutoffMode === CUTOFF_MODES.PERCENTAGE ? 'Passing Percentage (%)' : 'Passing Marks (raw)'}
            </span>
            <input
              type="number"
              min="0"
              max={scoring.cutoffMode === CUTOFF_MODES.PERCENTAGE ? 100 : undefined}
              value={scoring.cutoffValue ?? ''}
              onChange={e => update({ cutoffValue: e.target.value === '' ? null : Number(e.target.value) })}
              placeholder={scoring.cutoffMode === CUTOFF_MODES.PERCENTAGE ? 'e.g. 50' : 'e.g. 200'}
              className="w-28 text-center text-sm font-bold rounded-lg border border-amber-200 bg-white px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            />
            {scoring.cutoffMode === CUTOFF_MODES.PERCENTAGE && (
              <span className="text-xs text-amber-700 font-semibold">%</span>
            )}
          </div>
        )}
      </div>

      {/* Validation feedback */}
      {validation && validation.errors.length > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
          {validation.errors.map((e, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{e}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

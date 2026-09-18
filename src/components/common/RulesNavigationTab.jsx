import React from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { NAVIGATION_MODES } from '../../services/testRulesService.js';

const TOGGLE_ITEMS = [
  {
    key: 'allowSectionJump',
    label: 'Allow Section Jump',
    desc: 'Candidates can navigate between sections freely.',
    color: 'bg-indigo-500',
    disabledByLinear: true
  },
  {
    key: 'allowReviewMarking',
    label: 'Allow Review / Flag',
    desc: 'Candidates can mark questions for review and return later.',
    color: 'bg-indigo-500',
    disabledByLinear: false
  },
  {
    key: 'allowAnswerChange',
    label: 'Allow Answer Change',
    desc: 'Candidates can revise previously submitted answers.',
    color: 'bg-indigo-500',
    disabledByLinear: false
  },
  {
    key: 'lockSectionAfterSubmit',
    label: 'Lock Section After Submit',
    desc: 'Once a section is submitted, it becomes read-only.',
    color: 'bg-amber-500',
    disabledByLinear: false
  },
  {
    key: 'showCalculator',
    label: 'On-Screen Calculator',
    desc: 'Display a basic calculator tool during the examination.',
    color: 'bg-teal-500',
    disabledByLinear: false
  },
  {
    key: 'showSectionSummary',
    label: 'Section Summary Panel',
    desc: 'Show answer status grid (answered / marked / unanswered) per section.',
    color: 'bg-indigo-500',
    disabledByLinear: false
  }
];

export default function RulesNavigationTab({ navigation, onChange, validation }) {
  const update = (patch) => onChange({ ...navigation, ...patch });
  const isLinear = navigation.mode === NAVIGATION_MODES.LINEAR;

  return (
    <div className="space-y-6">
      {/* Navigation Mode */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Navigation Mode</h3>
          <p className="text-xs text-slate-500 mt-0.5">Controls how candidates move through questions during the examination.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              value: NAVIGATION_MODES.FREE,
              label: 'Free Navigation',
              desc: 'Candidates can jump to any question at any time. Industry standard for most medical licensing exams.',
              badge: 'Recommended',
              badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
              icon: '↔'
            },
            {
              value: NAVIGATION_MODES.LINEAR,
              label: 'Linear (Sequential)',
              desc: 'Candidates must answer questions in order. Cannot go back to previous questions once moved forward.',
              badge: 'Restrictive',
              badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
              icon: '→'
            }
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({
                mode: opt.value,
                allowSectionJump: opt.value === NAVIGATION_MODES.FREE ? navigation.allowSectionJump : false
              })}
              className={`p-4 rounded-2xl border text-left transition-all ${
                navigation.mode === opt.value
                  ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-lg leading-none ${navigation.mode === opt.value ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {opt.icon}
                </span>
                <span className={`text-sm font-bold ${navigation.mode === opt.value ? 'text-indigo-900' : 'text-slate-700'}`}>
                  {opt.label}
                </span>
                <span className={`ml-auto text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${opt.badgeColor}`}>
                  {opt.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Linear mode warning */}
      {isLinear && (
        <div className="flex items-start gap-2 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <div>
            <strong>Linear Mode Active:</strong> Section jump is automatically disabled. Candidates cannot revisit previous questions.
          </div>
        </div>
      )}

      {/* Feature Toggles */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Candidate Experience Controls</h3>
        <div className="space-y-2.5">
          {TOGGLE_ITEMS.map(item => {
            const isDisabledByMode = item.disabledByLinear && isLinear;
            const isOn = navigation[item.key];

            return (
              <div
                key={item.key}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isDisabledByMode
                    ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                    : 'border-slate-200 bg-white hover:bg-slate-50/60'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{item.label}</span>
                    {isDisabledByMode && (
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        Overridden by Linear
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">{item.desc}</p>
                </div>

                <button
                  type="button"
                  disabled={isDisabledByMode}
                  onClick={() => update({ [item.key]: !isOn })}
                  className={`w-12 h-6 rounded-full transition-all relative shrink-0 ml-4 ${
                    isDisabledByMode ? 'bg-slate-200 cursor-not-allowed' : isOn ? item.color : 'bg-slate-200'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
                    isOn && !isDisabledByMode ? 'left-6' : 'left-0.5'
                  }`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary strip */}
      <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100">
        <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-2">Navigation Summary</p>
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold border border-indigo-200">
            {navigation.mode === NAVIGATION_MODES.FREE ? 'Free' : 'Linear'}
          </span>
          {navigation.allowReviewMarking && <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-slate-700 font-semibold border border-slate-200">Review Flag</span>}
          {navigation.allowAnswerChange && <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-slate-700 font-semibold border border-slate-200">Answer Edit</span>}
          {navigation.showCalculator && <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200">Calculator</span>}
          {navigation.lockSectionAfterSubmit && <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">Section Lock</span>}
        </div>
      </div>

      {/* Validation */}
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

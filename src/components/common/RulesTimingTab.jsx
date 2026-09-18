import React from 'react';
import { Clock, AlertCircle, Info } from 'lucide-react';
import { TIMING_MODES, BREAK_POLICIES } from '../../services/testRulesService.js';

export default function RulesTimingTab({ timing, onChange, test, validation }) {
  const update = (patch) => onChange({ ...timing, ...patch });

  const overallTarget = test?.targetDuration ?? test?.durationMinutes ?? 180;
  const units = test?.structure?.units || [];

  const handleSectionDuration = (unitId, minutes) => {
    const updated = {
      ...timing.sectionDurations,
      [unitId]: Math.max(0, Number(minutes) || 0)
    };
    onChange({ ...timing, sectionDurations: updated });
  };

  const totalSectionTime = Object.values(timing.sectionDurations || {}).reduce(
    (acc, v) => acc + (Number(v) || 0), 0
  );
  const overDuration = timing.mode === TIMING_MODES.PER_SECTION && overallTarget && totalSectionTime > overallTarget;

  return (
    <div className="space-y-6">
      {/* Timing Mode */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Timing Mode</h3>
          <p className="text-xs text-slate-500 mt-0.5">Define how the examination clock is applied to candidates.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              value: TIMING_MODES.OVERALL,
              label: 'Overall Timer',
              desc: 'Single shared countdown for the entire test.',
              icon: '⏱'
            },
            {
              value: TIMING_MODES.PER_SECTION,
              label: 'Per-Section Timer',
              desc: 'Each section has its own independent countdown clock.',
              icon: '⏳'
            },
            {
              value: TIMING_MODES.UNPROCTORED,
              label: 'Unproctored',
              desc: 'No time limit. Candidates work at their own pace.',
              icon: '∞'
            }
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ mode: opt.value })}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                timing.mode === opt.value
                  ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg leading-none">{opt.icon}</span>
                <span className={`text-xs font-bold ${timing.mode === opt.value ? 'text-indigo-900' : 'text-slate-700'}`}>
                  {opt.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Overall Duration */}
      {timing.mode === TIMING_MODES.OVERALL && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Overall Duration</h3>
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white">
            <Clock className="w-5 h-5 text-indigo-500 shrink-0" />
            <div className="flex-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Total Duration (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="1440"
                step="5"
                value={timing.overallDurationMinutes ?? overallTarget}
                onChange={e => update({ overallDurationMinutes: Number(e.target.value) })}
                className="w-32 text-center text-xl font-black rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Foundation target: {overallTarget} min
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-indigo-600">
                {Math.floor((timing.overallDurationMinutes ?? overallTarget) / 60)}<span className="text-sm font-bold text-indigo-400">h</span>{' '}
                {(timing.overallDurationMinutes ?? overallTarget) % 60}<span className="text-sm font-bold text-indigo-400">m</span>
              </div>
              <div className="text-[10px] text-slate-400">equivalent</div>
            </div>
          </div>
        </div>
      )}

      {/* Per-Section Durations */}
      {timing.mode === TIMING_MODES.PER_SECTION && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Section Durations</h3>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              overDuration
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              Total: {totalSectionTime} / {overallTarget} min
            </span>
          </div>

          {overDuration && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Section durations exceed the overall target duration ({overallTarget} min). Consider reducing individual section times.
            </div>
          )}

          {units.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400" />
              No structure units defined. Add sections in Phase 2 (Structure) to configure per-section timing.
            </div>
          ) : (
            <div className="space-y-2">
              {units.map((unit, idx) => {
                const val = timing.sectionDurations?.[unit.id] ?? '';
                return (
                  <div key={unit.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 transition-colors">
                    <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="flex-1 text-xs font-semibold text-slate-800 truncate">{unit.name}</span>
                    <input
                      type="number"
                      min="1"
                      max="480"
                      step="5"
                      value={val}
                      placeholder="min"
                      onChange={e => handleSectionDuration(unit.id, e.target.value)}
                      className="w-20 text-center text-sm font-bold rounded-lg border border-slate-200 px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                    />
                    <span className="text-[10px] text-slate-400">min</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Unproctored notice */}
      {timing.mode === TIMING_MODES.UNPROCTORED && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2 text-xs text-blue-800">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
          <div>
            <strong>Unproctored mode:</strong> No countdown timer will be shown to candidates. Suitable for practice tests and self-paced assessments.
          </div>
        </div>
      )}

      {/* Break Policy */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Break Policy</h3>
            <p className="text-xs text-slate-500 mt-0.5">Allow scheduled breaks during the test.</p>
          </div>
          <button
            type="button"
            onClick={() => update({
              breakPolicy: timing.breakPolicy === BREAK_POLICIES.NONE ? BREAK_POLICIES.SCHEDULED : BREAK_POLICIES.NONE,
              breakIntervalMinutes: timing.breakPolicy === BREAK_POLICIES.NONE ? 60 : null
            })}
            className={`w-12 h-6 rounded-full transition-all relative ${
              timing.breakPolicy === BREAK_POLICIES.SCHEDULED ? 'bg-indigo-500' : 'bg-slate-200'
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
              timing.breakPolicy === BREAK_POLICIES.SCHEDULED ? 'left-6' : 'left-0.5'
            }`} />
          </button>
        </div>

        {timing.breakPolicy === BREAK_POLICIES.SCHEDULED && (
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700">Break after every</span>
            <input
              type="number"
              min="10"
              max="240"
              step="10"
              value={timing.breakIntervalMinutes ?? 60}
              onChange={e => update({ breakIntervalMinutes: Number(e.target.value) })}
              className="w-20 text-center text-sm font-bold rounded-lg border border-slate-200 px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            />
            <span className="text-xs text-slate-500">minutes</span>
          </div>
        )}
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

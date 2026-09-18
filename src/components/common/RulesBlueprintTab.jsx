import React from 'react';
import { BookOpen, Info, AlertCircle } from 'lucide-react';
import { BLUEPRINT_MODES } from '../../services/testRulesService.js';
import { catalogService } from '../../services/catalogService.js';

const DIFFICULTY_COLORS = {
  easy: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  medium: { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  hard: { bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
};

export default function RulesBlueprintTab({ blueprint, onChange, test, validation }) {
  const dist = blueprint.difficultyDistribution || { easy: 30, medium: 50, hard: 20 };
  const totalPct = (Number(dist.easy) || 0) + (Number(dist.medium) || 0) + (Number(dist.hard) || 0);
  const totalError = totalPct !== 100;

  const handleDistChange = (key, val) => {
    const newDist = { ...dist, [key]: Math.max(0, Math.min(100, Number(val) || 0)) };
    onChange({ ...blueprint, difficultyDistribution: newDist });
  };

  const handleModeChange = (mode) => {
    onChange({ ...blueprint, mode });
  };

  const handleSubjectCount = (subjectId, subjectName, count) => {
    const existing = blueprint.subjectDistribution || [];
    const idx = existing.findIndex(s => s.subjectId === subjectId);
    const newEntry = { subjectId, subjectName, targetCount: Math.max(0, Number(count) || 0) };
    const updated = idx >= 0
      ? existing.map((s, i) => i === idx ? newEntry : s)
      : [...existing, newEntry];
    onChange({ ...blueprint, subjectDistribution: updated });
  };

  const targetQuestions = test?.targetQuestions || test?.totalQuestions || 100;

  // Derive exam subjects from catalogService
  const examSubjects = React.useMemo(() => {
    try {
      const examId = test?.examId || test?.examTrack || test?.courseId;
      if (!examId) return [];
      const exam = catalogService.getExamById(examId);
      return exam?.subjects || [];
    } catch {
      return [];
    }
  }, [test]);

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Blueprint Mode</h3>
          <p className="text-xs text-slate-500 mt-0.5">Controls how questions are distributed by difficulty and subject.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              value: BLUEPRINT_MODES.NONE,
              label: 'No Blueprint',
              desc: 'No distribution constraints. Questions selected freely.',
              icon: '○'
            },
            {
              value: BLUEPRINT_MODES.WEIGHTED,
              label: 'Weighted Distribution',
              desc: 'Percentage-based difficulty targets. Soft advisory guidance.',
              icon: '◑'
            },
            {
              value: BLUEPRINT_MODES.STRICT,
              label: 'Strict Blueprint',
              desc: 'Hard question-count constraints per subject and difficulty.',
              icon: '●'
            }
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleModeChange(opt.value)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                blueprint.mode === opt.value
                  ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-lg leading-none ${blueprint.mode === opt.value ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {opt.icon}
                </span>
                <span className={`text-xs font-bold ${blueprint.mode === opt.value ? 'text-indigo-900' : 'text-slate-700'}`}>
                  {opt.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Distribution — shown when mode is not NONE */}
      {blueprint.mode !== BLUEPRINT_MODES.NONE && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Difficulty Distribution</h3>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              totalError
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {totalPct}% / 100%
            </span>
          </div>

          {totalError && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Percentages must sum to exactly 100%. Currently: {totalPct}%.
            </div>
          )}

          {/* Stacked visual bar */}
          <div className="h-3 rounded-full overflow-hidden flex gap-0.5 bg-slate-100">
            {['easy', 'medium', 'hard'].map(key => (
              <div
                key={key}
                className={`h-full transition-all duration-300 ${DIFFICULTY_COLORS[key].bg}`}
                style={{ width: `${Math.max(0, Number(dist[key]) || 0)}%` }}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { key: 'easy', label: 'Easy', hint: 'Foundational recall' },
              { key: 'medium', label: 'Medium', hint: 'Applied clinical reasoning' },
              { key: 'hard', label: 'Hard', hint: 'Complex multi-step' }
            ].map(({ key, label, hint }) => {
              const c = DIFFICULTY_COLORS[key];
              const val = Number(dist[key]) || 0;
              const approxCount = Math.round((val / 100) * targetQuestions);
              return (
                <div key={key} className={`p-3.5 rounded-2xl border ${c.light} ${c.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold ${c.text}`}>{label}</span>
                    <span className={`text-[10px] font-bold ${c.text} opacity-70`}>≈ {approxCount} Qs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={val}
                      onChange={e => handleDistChange(key, e.target.value)}
                      className="flex-1 accent-indigo-600"
                    />
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={val}
                        onChange={e => handleDistChange(key, e.target.value)}
                        className={`w-14 text-center text-xs font-bold rounded-lg border px-1 py-1.5 ${c.light} ${c.border} ${c.text} focus:outline-none focus:ring-2 focus:ring-indigo-400/50`}
                      />
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 pointer-events-none">%</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5">{hint}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subject Distribution — shown only in STRICT mode */}
      {blueprint.mode === BLUEPRINT_MODES.STRICT && (
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Subject Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Set precise question counts per subject. Total should match the test target ({targetQuestions} Qs).</p>
          </div>

          {examSubjects.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400" />
              No subjects found for this exam. Associate the test with an Exam in Phase 1 to enable subject targeting.
            </div>
          ) : (
            <div className="space-y-2">
              {examSubjects.map(subj => {
                const entry = (blueprint.subjectDistribution || []).find(s => s.subjectId === subj.id);
                const val = entry?.targetCount ?? 0;
                return (
                  <div key={subj.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 transition-colors">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="flex-1 text-xs font-semibold text-slate-800 truncate">{subj.name}</span>
                    <input
                      type="number"
                      min="0"
                      max={targetQuestions}
                      value={val}
                      onChange={e => handleSubjectCount(subj.id, subj.name, e.target.value)}
                      className="w-16 text-center text-xs font-bold rounded-lg border border-slate-200 px-1 py-1.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                    />
                    <span className="text-[10px] text-slate-400 w-4">Qs</span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-900">
                <span>Total Subject Allocation</span>
                <span>
                  {(blueprint.subjectDistribution || []).reduce((acc, s) => acc + (Number(s.targetCount) || 0), 0)} / {targetQuestions} Qs
                </span>
              </div>
            </div>
          )}
        </div>
      )}

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

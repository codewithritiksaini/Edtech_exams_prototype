import React from 'react';
import { BookOpen, Info, AlertCircle, Sparkles, CheckCircle2, Layers } from 'lucide-react';
import { BLUEPRINT_MODES } from '../../services/testRulesService.js';
import { catalogService } from '../../services/catalogService.js';
import { curriculumService } from '../../services/curriculumService.js';

export default function RulesBlueprintTab({ blueprint, onChange, test, validation }) {
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
  const testExamId = test?.examId || test?.examTrack || test?.courseId || 'neet-pg';

  // Derive scoped subjects: prioritize test.curriculumScope
  const availableSubjects = React.useMemo(() => {
    const allExamSubs = curriculumService.getSubjects(testExamId) || [];
    const scopeSubs = test?.curriculumScope?.subjects;
    if (Array.isArray(scopeSubs) && scopeSubs.length > 0) {
      const scopeIds = new Set(scopeSubs.map(s => s.subjectId));
      const filtered = allExamSubs.filter(s => scopeIds.has(s.id));
      if (filtered.length > 0) return filtered;
    }
    if (allExamSubs.length > 0) return allExamSubs;

    try {
      const exam = catalogService.getExamById(testExamId);
      return exam?.subjects || [];
    } catch {
      return [];
    }
  }, [testExamId, test?.curriculumScope]);

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Blueprint Mode</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Controls how automatic generation balances questions across curriculum subjects.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              value: BLUEPRINT_MODES.NONE,
              label: 'Manual Authoring Only',
              desc: 'No automated blueprint generation. All questions authored or uploaded directly.',
              icon: '○'
            },
            {
              value: BLUEPRINT_MODES.WEIGHTED,
              label: 'Proportional Curriculum',
              desc: 'Automatic question generation evenly proportioned across scoped curriculum subjects.',
              icon: '◑'
            },
            {
              value: BLUEPRINT_MODES.STRICT,
              label: 'Strict Subject Quotas',
              desc: 'Explicit question quotas per curriculum subject to meet exact target distribution.',
              icon: '●'
            }
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleModeChange(opt.value)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                blueprint.mode === opt.value
                  ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
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

      {/* Informational Banner on Canonical Architecture */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800">
            Authoring-Level Classification Notice
          </p>
          <p className="text-slate-500 leading-relaxed">
            Question Type and Difficulty are selected inside the individual Question model during authoring in Phase 4 (Content &amp; Build). Difficulty is treated strictly as descriptive metadata and is not an automated generation rule or percentage target.
          </p>
        </div>
      </div>

      {/* Proportional Subject Overview — shown when mode is WEIGHTED */}
      {blueprint.mode === BLUEPRINT_MODES.WEIGHTED && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Curriculum Coverage</h3>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              Target: {targetQuestions} Questions
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
            <p className="text-xs text-slate-600">
              When Blueprint Build generates questions, it balances them across the following curriculum subjects:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableSubjects.map((subj, idx) => {
                const approxShare = Math.round(targetQuestions / Math.max(1, availableSubjects.length));
                return (
                  <div key={subj.id || idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-800 truncate">{subj.name}</span>
                    <span className="text-[11px] font-bold text-slate-500 shrink-0">≈ {approxShare} Qs</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Strict Subject Distribution — shown in STRICT mode */}
      {blueprint.mode === BLUEPRINT_MODES.STRICT && (
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Subject Distribution Quotas</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set precise question targets per subject. The total should equal the test target ({targetQuestions} Qs).
            </p>
          </div>

          {availableSubjects.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400" />
              No subjects found in curriculum scope. Please verify curriculum settings.
            </div>
          ) : (
            <div className="space-y-2">
              {availableSubjects.map(subj => {
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
                      className="w-16 text-center text-xs font-bold rounded-lg border border-slate-200 px-1 py-1.5 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-400/50"
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

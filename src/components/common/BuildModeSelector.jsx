import React from 'react';
import { BookOpen, Cpu, CheckCircle2 } from 'lucide-react';
import { BUILD_MODES } from '../../services/testBuildService.js';

export default function BuildModeSelector({ mode, onSelectMode, isLocked = false }) {
  const modes = [
    {
      id: BUILD_MODES.MANUAL,
      title: 'Manual Build',
      subtitle: 'Question Bank Assembly',
      desc: 'Browse, filter, and hand-pick individual clinical questions from the Question Bank into the test roster.',
      icon: BookOpen,
      badge: 'Interactive Roster',
      accentColor: 'indigo'
    },
    {
      id: BUILD_MODES.BLUEPRINT,
      title: 'Blueprint Build',
      subtitle: 'Rules-Driven Auto-Generation',
      desc: 'Generate a balanced question set deterministically based on Phase 4 subject quotas and difficulty distribution.',
      icon: Cpu,
      badge: 'Rules-Driven',
      accentColor: 'amber'
    }
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Build Mode Selection</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose how you want to assemble this test's question set. Both modes produce the same canonical question roster.
          </p>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 self-start sm:self-auto">
          Active Mode: <strong className="text-indigo-600">{mode === BUILD_MODES.BLUEPRINT ? 'Blueprint Build' : 'Manual Build'}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modes.map(m => {
          const isSelected = mode === m.id;
          const Icon = m.icon;

          return (
            <button
              key={m.id}
              type="button"
              disabled={isLocked}
              onClick={() => onSelectMode(m.id)}
              className={`text-left p-4 rounded-2xl border-2 transition-all relative flex flex-col justify-between ${
                isSelected
                  ? m.accentColor === 'amber'
                    ? 'border-amber-500 bg-amber-50/40 shadow-sm ring-2 ring-amber-500/20'
                    : 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              } ${isLocked ? 'cursor-not-allowed opacity-75' : ''}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? m.accentColor === 'amber' ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
                      <span className="text-[10px] text-slate-500 font-medium block">{m.subtitle}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${
                      m.accentColor === 'amber' ? 'bg-amber-600' : 'bg-indigo-600'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {m.desc}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100/80 flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {m.badge}
                </span>
                <span className={`text-[11px] font-bold ${
                  isSelected ? 'text-indigo-600' : 'text-slate-400'
                }`}>
                  {isSelected ? 'Active Selection' : 'Click to Select'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

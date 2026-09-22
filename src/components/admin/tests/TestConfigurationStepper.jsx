import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Lock, 
  Layers, 
  FileText, 
  HelpCircle, 
  Sliders, 
  Cpu, 
  CheckCircle
} from 'lucide-react';
import { 
  TEST_CREATION_PHASES,
  OLD_PHASE_TO_NEW_PHASE 
} from '../../../services/testCreationWorkflow.js';

const ICON_MAP = {
  foundation: FileText,
  structure: Layers,
  rules: Sliders,
  build: Cpu,
  'review-publish': CheckCircle
};

export default function TestConfigurationStepper({ 
  currentStep = 1, 
  testId = null,
  role = 'admin',
  completedSteps = []
}) {
  // Normalize legacy step number if passed > 5
  const normalizedStep = currentStep > 5 
    ? (TEST_CREATION_PHASES.find(p => p.id === OLD_PHASE_TO_NEW_PHASE[currentStep])?.number || 1)
    : currentStep;

  const baseRoute = role === 'faculty' ? 'faculty' : 'admin';

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5 mb-6">
      {/* Top Meta Line */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
            5-Phase Test Pipeline
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Step {normalizedStep} of 5: <strong>{TEST_CREATION_PHASES.find(p => p.number === normalizedStep)?.title || ''}</strong>
          </span>
        </div>
        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50/70 border border-indigo-100 px-2.5 py-0.5 rounded-full">
          Phase {normalizedStep} Active
        </span>
      </div>

      {/* Horizontal 5-Phase Stepper Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
        {TEST_CREATION_PHASES.map((phase) => {
          const isCompleted = phase.number < normalizedStep || completedSteps.includes(phase.number);
          const isCurrent = phase.number === normalizedStep;
          const isLocked = false; // All 5 phases are implemented
          const Icon = ICON_MAP[phase.id] || FileText;

          let targetLink = null;
          if (testId) {
            if (phase.number === 1) targetLink = `/${baseRoute}/tests/${testId}`;
            if (phase.number === 2) targetLink = `/${baseRoute}/tests/${testId}/structure`;
            if (phase.number === 3) targetLink = `/${baseRoute}/tests/${testId}/rules`;
            if (phase.number === 4) targetLink = `/${baseRoute}/tests/${testId}/build`;
            if (phase.number === 5) targetLink = `/${baseRoute}/tests/${testId}/review`;
          }

          const cardContent = (
            <div
              className={`p-3 rounded-2xl transition-all border flex flex-col justify-between h-full min-h-[78px] ${
                isCurrent
                  ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-2xs'
                  : isCompleted
                    ? 'bg-emerald-50/40 border-emerald-200/70 hover:bg-emerald-50/70 hover:border-emerald-300'
                    : isLocked
                      ? 'bg-slate-50/50 border-slate-200/60 opacity-60 cursor-not-allowed'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50/70 hover:border-slate-300'
              }`}
            >
              {/* Header: Number & Badge */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : isLocked
                            ? 'bg-slate-200 text-slate-400'
                            : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : isLocked ? (
                      <Lock className="w-2.5 h-2.5" />
                    ) : (
                      phase.number
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold truncate ${
                      isCurrent
                        ? 'text-indigo-950 font-black'
                        : isCompleted
                          ? 'text-emerald-950'
                          : isLocked
                            ? 'text-slate-400'
                            : 'text-slate-700'
                    }`}
                  >
                    {phase.title}
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span
                  className={`font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isCurrent
                      ? 'bg-indigo-600 text-white'
                      : isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isLocked
                          ? 'bg-slate-100 text-slate-400'
                          : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isCurrent ? '● Current' : isCompleted ? '✓ Done' : isLocked ? '🔒 Locked' : 'Available'}
                </span>
                <span className="text-[10px] text-slate-400 hidden xl:inline truncate max-w-[80px]">
                  {phase.shortDesc ? phase.shortDesc.split(' ')[0] : ''}
                </span>
              </div>
            </div>
          );

          if (targetLink && !isLocked) {
            return (
              <Link key={phase.id} to={targetLink} className="block hover:no-underline group">
                {cardContent}
              </Link>
            );
          }

          return <div key={phase.id}>{cardContent}</div>;
        })}
      </div>
    </div>
  );
}

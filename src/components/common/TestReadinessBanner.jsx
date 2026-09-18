import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { VALIDATION_PHASES } from '../../services/testReadinessService.js';

const PHASE_LABELS = {
  [VALIDATION_PHASES.FOUNDATION]: '1. Foundation',
  [VALIDATION_PHASES.STRUCTURE]: '2. Structure',
  [VALIDATION_PHASES.CONTENT]: '3. Content',
  [VALIDATION_PHASES.RULES]: '4. Rules',
  [VALIDATION_PHASES.BUILD]: '5. Build'
};

export default function TestReadinessBanner({ readiness, role = 'admin', testId }) {
  const [showErrors, setShowErrors] = useState(true);
  const [showWarnings, setShowWarnings] = useState(false);

  if (!readiness) return null;

  const { ready, errors = [], warnings = [], sections = {} } = readiness;

  return (
    <div className={`rounded-3xl border p-6 transition-all ${
      ready 
        ? 'bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/40 border-emerald-200/80 shadow-sm'
        : 'bg-gradient-to-r from-rose-50/80 via-white to-amber-50/40 border-rose-200/80 shadow-sm'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Overall Health Status */}
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
            ready ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            {ready ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <ShieldAlert className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                ready ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                Phase 6: Pre-Flight Gate
              </span>
              <span className="text-xs font-bold text-slate-400">
                {ready ? 'All 5 layers passed' : `${errors.length} error(s) prevent publishing`}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{ready ? 'Test Ready for Publication' : 'Publication Requirements Incomplete'}</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                ready 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {ready ? 'READY TO PUBLISH' : 'NOT READY'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl">
              {ready 
                ? 'All mandatory test parameters, structure containers, question rosters, scoring formulas, and build criteria have been validated.'
                : 'Review the flagged validation errors below. You can navigate directly to the affected phase to make corrections.'}
            </p>
          </div>
        </div>

        {/* Right: 5-Phase Mini Status Matrix */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0 bg-white/80 p-2 rounded-2xl border border-slate-200/60 shadow-2xs">
          {Object.values(VALIDATION_PHASES).map((phaseKey) => {
            const phaseStatus = sections[phaseKey] || { ready: true };
            const isPhaseOk = phaseStatus.ready;
            const label = PHASE_LABELS[phaseKey] || phaseKey;

            return (
              <div 
                key={phaseKey}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  isPhaseOk 
                    ? 'bg-emerald-50/70 text-emerald-700 border-emerald-200/70'
                    : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                }`}
              >
                {isPhaseOk ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable Errors Section */}
      {errors.length > 0 && (
        <div className="mt-5 pt-4 border-t border-rose-100 space-y-3">
          <button
            type="button"
            onClick={() => setShowErrors(!showErrors)}
            className="flex items-center justify-between w-full text-left text-xs font-bold text-rose-900 hover:text-rose-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errors.length} Blocking Error(s) Must Be Resolved</span>
            </span>
            {showErrors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showErrors && (
            <div className="space-y-2">
              {errors.map((err, idx) => (
                <div 
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white border border-rose-200 shadow-2xs"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 uppercase mt-0.5">
                      {err.phase}
                    </span>
                    <span className="text-xs text-slate-800 font-medium leading-relaxed">
                      {err.message}
                    </span>
                  </div>

                  {err.link && (
                    <Link
                      to={err.link}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors shrink-0 self-start sm:self-center"
                    >
                      <span>Fix in {PHASE_LABELS[err.phase] || err.phase}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expandable Warnings Section */}
      {warnings.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <button
            type="button"
            onClick={() => setShowWarnings(!showWarnings)}
            className="flex items-center justify-between w-full text-left text-xs font-bold text-amber-800 hover:text-amber-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>{warnings.length} Advisory Warning(s) (Do not prevent publishing)</span>
            </span>
            {showWarnings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showWarnings && (
            <div className="space-y-1.5">
              {warnings.map((warn, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-amber-900"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                      {warn.phase}
                    </span>
                    <span>{warn.message}</span>
                  </div>
                  {warn.link && (
                    <Link
                      to={warn.link}
                      className="text-amber-700 font-bold hover:underline shrink-0 text-[11px]"
                    >
                      Edit →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

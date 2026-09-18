import React from 'react';
import { 
  ASSESSMENT_METHOD_LIST 
} from '../../services/assessmentMethodService.js';
import { HelpCircle } from 'lucide-react';

export default function AssessmentMethodSelector({
  value,
  onChange,
  error = null,
  readOnly = false,
  required = true,
  layout = 'grid' // 'grid' | 'stack'
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Assessment Method {required && <span className="text-rose-500">*</span>}
        </label>
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <HelpCircle className="w-3 h-3" /> Foundational evaluation format
        </span>
      </div>

      <p className="text-xs text-slate-500">
        Select the examination methodology governing this assessment's clinical evaluation approach.
      </p>

      <div className={layout === 'stack' ? 'space-y-2.5' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'}>
        {ASSESSMENT_METHOD_LIST.map((method) => {
          const isSelected = value === method.id;

          return (
            <label
              key={method.id}
              className={`relative flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs ring-2 ring-indigo-600/20'
                  : 'border-slate-200/80 bg-white hover:bg-slate-50/80 hover:border-slate-300'
              } ${readOnly ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
            >
              <input
                type="radio"
                name="assessmentMethod"
                value={method.id}
                checked={isSelected}
                disabled={readOnly}
                onChange={() => onChange && onChange(method.id)}
                className="mt-1 w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 shrink-0"
              />

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {method.label}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${method.badgeClass}`}>
                    {method.shortLabel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                  {method.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-rose-600 font-semibold mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

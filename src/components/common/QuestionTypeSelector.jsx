import React, { useMemo } from 'react';
import { 
  Check, 
  HelpCircle, 
  Sliders, 
  CheckSquare, 
  Square, 
  Tag, 
  Info,
  Layers,
  Sparkles,
  FileQuestion,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  questionTypeService, 
  QUESTION_TYPE_REGISTRY 
} from '../../services/questionTypeService.js';

export default function QuestionTypeSelector({
  selectedTypeIds = [],
  onChange,
  availableTypeIds = null,
  isEditable = true,
  showBulkActions = true,
  layout = 'grid',
  title = null
}) {
  const allTypes = useMemo(() => questionTypeService.getAllQuestionTypes(), []);

  // Compute which types are selectable
  const normalizedAvailable = useMemo(() => {
    if (!availableTypeIds || !Array.isArray(availableTypeIds)) return null;
    return new Set(questionTypeService.normalizeQuestionTypeIds(availableTypeIds));
  }, [availableTypeIds]);

  const normalizedSelected = useMemo(() => {
    return new Set(questionTypeService.normalizeQuestionTypeIds(selectedTypeIds));
  }, [selectedTypeIds]);

  const handleToggle = (typeId) => {
    if (!isEditable || !onChange) return;
    const isCurrentlySelected = normalizedSelected.has(typeId);
    let next;
    if (isCurrentlySelected) {
      next = [...normalizedSelected].filter(id => id !== typeId);
    } else {
      next = [...normalizedSelected, typeId];
    }
    onChange(next);
  };

  const handleSelectAll = () => {
    if (!isEditable || !onChange) return;
    const selectable = allTypes
      .filter(t => !normalizedAvailable || normalizedAvailable.has(t.id))
      .map(t => t.id);
    onChange(selectable);
  };

  const handleDeselectAll = () => {
    if (!isEditable || !onChange) return;
    onChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Optional Header & Bulk Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          {title ? (
            <h4 className="text-sm font-bold text-slate-900">{title}</h4>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Supported Question Formats</span>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[11px] font-black">
                {normalizedSelected.size} Selected
              </span>
            </div>
          )}
          {normalizedAvailable && (
            <p className="text-[11px] text-slate-500 mt-0.5">
              Restricted to the {normalizedAvailable.size} question format(s) permitted by this test.
            </p>
          )}
        </div>

        {showBulkActions && isEditable && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100/60 px-2.5 py-1 rounded-lg transition-colors"
            >
              Select All Permitted
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/70 px-2.5 py-1 rounded-lg transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Question Type Cards */}
      <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-2.5'}>
        {allTypes.map(qType => {
          const isPermitted = !normalizedAvailable || normalizedAvailable.has(qType.id);
          const isSelected = normalizedSelected.has(qType.id);

          return (
            <div
              key={qType.id}
              onClick={() => {
                if (isPermitted && isEditable) {
                  handleToggle(qType.id);
                }
              }}
              className={`relative rounded-2xl border p-3.5 transition-all select-none ${
                !isPermitted
                  ? 'bg-slate-50/70 border-slate-200/60 opacity-50 cursor-not-allowed'
                  : isSelected
                    ? 'bg-indigo-50/40 border-indigo-300 shadow-2xs hover:border-indigo-400 cursor-pointer ring-1 ring-indigo-500/20'
                    : isEditable
                      ? 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer'
                      : 'bg-white border-slate-200 opacity-90'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox Icon */}
                <div className="pt-0.5 shrink-0">
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white hover:border-slate-400 transition-colors" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-black text-slate-900 truncate">
                        {qType.name}
                      </span>
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider shrink-0">
                        {qType.shortName}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 border ${qType.badgeClass}`}>
                      {qType.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {qType.description}
                  </p>

                  {/* Capabilities Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100/80">
                    {qType.capabilities?.options && (
                      <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        Options List
                      </span>
                    )}
                    {qType.capabilities?.singleCorrectAnswer && (
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                        Single Correct
                      </span>
                    )}
                    {qType.capabilities?.multipleCorrectAnswers && (
                      <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60">
                        Multiple Correct
                      </span>
                    )}
                    {qType.capabilities?.clinicalStem && (
                      <span className="text-[10px] font-medium text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200/60">
                        Clinical Stem
                      </span>
                    )}
                    {qType.capabilities?.media && (
                      <span className="text-[10px] font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/60">
                        Diagnostic Media
                      </span>
                    )}
                    {qType.capabilities?.textInput && (
                      <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                        Text Input
                      </span>
                    )}
                  </div>

                  {!isPermitted && (
                    <div className="mt-2 text-[10px] font-bold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      Not permitted by Test-level configuration
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

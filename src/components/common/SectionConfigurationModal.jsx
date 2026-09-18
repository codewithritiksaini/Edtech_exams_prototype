import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Sliders, 
  CheckSquare, 
  Square, 
  BookOpen, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  Save, 
  Shuffle, 
  FileText, 
  Search, 
  Tag,
  Info
} from 'lucide-react';
import { 
  getExamPattern, 
  DEFAULT_UNIT_CONFIGURATION, 
  normalizeUnitConfiguration, 
  validateUnitConfiguration 
} from '../../services/examPatternHelper.js';
import { 
  questionTypeService, 
  QUESTION_TYPE_INHERITANCE_MODES, 
  DEFAULT_TEST_ALLOWED_QUESTION_TYPES 
} from '../../services/questionTypeService.js';
import QuestionTypeSelector from './QuestionTypeSelector.jsx';

export default function SectionConfigurationModal({
  isOpen,
  onClose,
  unit,
  unitTypeLabel = 'Section',
  examId,
  role = 'admin',
  allowedSubjectIds = null,
  testAllowedQuestionTypes = null,
  isEditable = true,
  onSave
}) {
  if (!isOpen || !unit) return null;

  // Retrieve Exam Pattern Context
  const examPattern = useMemo(() => getExamPattern(examId), [examId]);

  // Compute selectable subjects based on role and allowedSubjectIds
  const selectableSubjects = useMemo(() => {
    if (!examPattern?.subjects) return [];
    if (role === 'faculty' && allowedSubjectIds && Array.isArray(allowedSubjectIds) && !allowedSubjectIds.includes('all')) {
      return examPattern.subjects.filter(s => allowedSubjectIds.includes(s.id));
    }
    return examPattern.subjects;
  }, [examPattern, role, allowedSubjectIds]);

  // Working state
  const [description, setDescription] = useState(unit.description || '');
  const [config, setConfig] = useState(() => normalizeUnitConfiguration(unit.configuration));
  const [subjectSearch, setSubjectSearch] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if unit changes
  useEffect(() => {
    if (unit) {
      setDescription(unit.description || '');
      setConfig(normalizeUnitConfiguration(unit.configuration));
      setValidationError('');
      setSubjectSearch('');
    }
  }, [unit]);

  // Filtered subject list
  const filteredSubjects = useMemo(() => {
    if (!subjectSearch.trim()) return selectableSubjects;
    const q = subjectSearch.toLowerCase().trim();
    return selectableSubjects.filter(s => 
      s.name.toLowerCase().includes(q) || 
      (s.code && s.code.toLowerCase().includes(q))
    );
  }, [selectableSubjects, subjectSearch]);

  // Subject toggling
  const handleToggleSubject = (subjectId) => {
    if (!isEditable) return;
    const current = config.subjectIds || [];
    const exists = current.includes(subjectId);
    const updated = exists 
      ? current.filter(id => id !== subjectId)
      : [...current, subjectId];

    setConfig(prev => ({
      ...prev,
      subjectIds: updated
    }));
    setValidationError('');
  };

  const handleSelectAllSubjects = () => {
    if (!isEditable) return;
    const allIds = selectableSubjects.map(s => s.id);
    setConfig(prev => ({
      ...prev,
      subjectIds: allIds
    }));
    setValidationError('');
  };

  const handleClearSubjects = () => {
    if (!isEditable) return;
    setConfig(prev => ({
      ...prev,
      subjectIds: []
    }));
    setValidationError('');
  };

  // Question Count handling
  const handleQuestionCountChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setConfig(prev => ({ ...prev, questionCount: null }));
    } else {
      const num = Number(val);
      setConfig(prev => ({ ...prev, questionCount: isNaN(num) ? val : num }));
    }
    setValidationError('');
  };

  // Save handler
  const handleSave = async () => {
    if (!isEditable) return;

    // Run validation
    const candidateConfig = normalizeUnitConfiguration(config);
    const validation = validateUnitConfiguration(
      candidateConfig, 
      examId, 
      role === 'faculty' ? allowedSubjectIds : null,
      testAllowedQuestionTypes
    );

    if (!validation.valid) {
      setValidationError(validation.errors[0]?.message || 'Please correct configuration errors.');
      return;
    }

    try {
      setIsSaving(true);
      setValidationError('');

      const updatedUnit = {
        ...unit,
        description: description.trim(),
        configuration: candidateConfig
      };

      if (typeof onSave === 'function') {
        await onSave(updatedUnit);
      }
      onClose();
    } catch (err) {
      setValidationError(err.message || 'Failed to save configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Configure {unitTypeLabel}: {unit.name}
                </h2>
                {unit.code && (
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                    {unit.code}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Phase 3 • Delivery rules, curriculum scope, planned questions, and randomization
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 border border-slate-200 flex items-center justify-center transition-colors shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Validation Error Alert */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Configuration Error:</strong> {validationError}
              </div>
            </div>
          )}

          {/* Section Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {unitTypeLabel} Description / Scope Note
            </label>
            <input
              type="text"
              disabled={!isEditable}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Brief summary of what this ${unitTypeLabel.toLowerCase()} covers...`}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
            />
          </div>

          {/* Subject / Curriculum Scope */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  Subjects / Curriculum Units
                </label>
                <span className="text-[11px] text-slate-500">
                  {config.subjectIds?.length || 0} of {selectableSubjects.length} subjects associated
                </span>
              </div>

              {isEditable && selectableSubjects.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAllSubjects}
                    className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={handleClearSubjects}
                    className="text-slate-500 hover:text-slate-700 font-medium transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Filter Input */}
            {selectableSubjects.length > 5 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  placeholder="Search subjects by name or code..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            )}

            {/* Subject Checkbox Grid */}
            <div className="border border-slate-200 rounded-2xl p-2 max-h-48 overflow-y-auto space-y-1 bg-slate-50/40">
              {filteredSubjects.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  {selectableSubjects.length === 0 
                    ? 'No curriculum subjects available for this exam.' 
                    : 'No matching subjects found.'}
                </div>
              ) : (
                filteredSubjects.map(sub => {
                  const isSelected = config.subjectIds?.includes(sub.id);
                  return (
                    <label
                      key={sub.id}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-white border-indigo-200 shadow-2xs text-slate-900'
                          : 'bg-transparent border-transparent hover:bg-white text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          disabled={!isEditable}
                          checked={isSelected}
                          onChange={() => handleToggleSubject(sub.id)}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-semibold truncate">
                          {sub.name}
                        </span>
                      </div>
                      {sub.code && (
                        <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0 ml-2">
                          {sub.code}
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>
            {role === 'faculty' && allowedSubjectIds && !allowedSubjectIds.includes('all') && (
              <p className="text-[11px] text-slate-500 flex items-center gap-1 italic">
                <Info className="w-3 h-3 text-indigo-500 shrink-0" />
                Subjects are filtered strictly to your authorized faculty appointments.
              </p>
            )}
          </div>

          {/* Planned Question Count & Required Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Question Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                Planned Question Count
                <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                disabled={!isEditable}
                value={config.questionCount !== null && config.questionCount !== undefined ? config.questionCount : ''}
                onChange={handleQuestionCountChange}
                placeholder="e.g. 40"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-50"
              />
              <p className="text-[10px] text-slate-500">
                Planning requirement for Phase 6 Question Blueprint and Phase 8 Paper Generation.
              </p>
            </div>

            {/* Required Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Section Requirement Mode
              </label>
              <label className={`p-3 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                config.required
                  ? 'bg-indigo-50/50 border-indigo-200'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <input
                  type="checkbox"
                  disabled={!isEditable}
                  checked={config.required}
                  onChange={(e) => setConfig(prev => ({ ...prev, required: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 shrink-0"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {config.required ? 'Required Section' : 'Optional Section'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {config.required ? 'Mandatory for all candidates' : 'Optional / Elective container'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Section Candidate Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Candidate Pre-Section Instructions
            </label>
            <textarea
              rows={2}
              disabled={!isEditable}
              value={config.instructions || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="e.g., Read all questions carefully. Choose the single best answer for each clinical vignette..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-50 leading-relaxed resize-none"
            />
            <p className="text-[10px] text-slate-400">
              Displayed prominently to the candidate before commencing this specific section.
            </p>
          </div>

          {/* Randomization Settings */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Shuffle className="w-3.5 h-3.5 text-indigo-600" />
              Delivery Randomization Flags
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isEditable}
                  checked={config.randomizeQuestions}
                  onChange={(e) => setConfig(prev => ({ ...prev, randomizeQuestions: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 shrink-0"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Randomize Questions</span>
                  <span className="text-[10px] text-slate-500 block">Shuffle question sequence per candidate</span>
                </div>
              </label>

              <label className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isEditable}
                  checked={config.randomizeOptions}
                  onChange={(e) => setConfig(prev => ({ ...prev, randomizeOptions: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 shrink-0"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Randomize Options</span>
                  <span className="text-[10px] text-slate-500 block">Shuffle choices A-E / distractors</span>
                </div>
              </label>
            </div>
          </div>

          {/* Phase 4: Supported Question Types */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                Supported Question Types
              </label>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  disabled={!isEditable}
                  onClick={() => {
                    setConfig(prev => ({
                      ...prev,
                      questionTypeConfig: { 
                        mode: QUESTION_TYPE_INHERITANCE_MODES.INHERIT, 
                        allowedTypes: [] 
                      },
                      questionTypes: []
                    }));
                  }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    (config.questionTypeConfig?.mode || 'INHERIT') === 'INHERIT'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Inherit Test Defaults
                </button>
                <button
                  type="button"
                  disabled={!isEditable}
                  onClick={() => {
                    const fallbackTypes = testAllowedQuestionTypes && testAllowedQuestionTypes.length > 0 
                      ? testAllowedQuestionTypes 
                      : DEFAULT_TEST_ALLOWED_QUESTION_TYPES;
                    setConfig(prev => ({
                      ...prev,
                      questionTypeConfig: { 
                        mode: QUESTION_TYPE_INHERITANCE_MODES.EXPLICIT, 
                        allowedTypes: prev.questionTypeConfig?.allowedTypes?.length > 0 
                          ? prev.questionTypeConfig.allowedTypes 
                          : fallbackTypes
                      },
                      questionTypes: prev.questionTypes?.length > 0 
                        ? prev.questionTypes 
                        : fallbackTypes
                    }));
                  }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    config.questionTypeConfig?.mode === 'EXPLICIT'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Custom for this Section
                </button>
              </div>
            </div>

            {config.questionTypeConfig?.mode === 'EXPLICIT' ? (
              <div className="p-3 bg-slate-50/60 rounded-2xl border border-slate-200/80 space-y-2">
                <QuestionTypeSelector
                  selectedTypeIds={config.questionTypeConfig.allowedTypes || config.questionTypes || []}
                  availableTypeIds={testAllowedQuestionTypes && testAllowedQuestionTypes.length > 0 ? testAllowedQuestionTypes : null}
                  isEditable={isEditable}
                  showBulkActions={true}
                  layout="grid"
                  onChange={(newTypes) => {
                    setConfig(prev => ({
                      ...prev,
                      questionTypes: newTypes,
                      questionTypeConfig: {
                        mode: QUESTION_TYPE_INHERITANCE_MODES.EXPLICIT,
                        allowedTypes: newTypes
                      }
                    }));
                    setValidationError('');
                  }}
                />
              </div>
            ) : (
              <div className="p-3.5 bg-indigo-50/30 rounded-2xl border border-indigo-100 text-xs text-slate-600 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">Inheriting Test Question Types</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    This section automatically accepts all question formats configured at the test level. Toggle to "Custom for this Section" to restrict this section to a specific subset of question formats.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Internal Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Internal Configuration Notes
            </label>
            <input
              type="text"
              disabled={!isEditable}
              value={config.notes || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Internal planning note (not visible to students)..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            Cancel
          </button>

          {isEditable && (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

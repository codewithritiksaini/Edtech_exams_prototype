import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  HelpCircle, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Save,
  RotateCcw,
  Sliders,
  Sparkles,
  Info,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { adminTestService, TEST_STATUS, getTestTypeLabel } from '../../services/adminTestService.js';
import { catalogService } from '../../services/catalogService.js';
import { 
  questionTypeService, 
  QUESTION_TYPE_INHERITANCE_MODES, 
  DEFAULT_TEST_ALLOWED_QUESTION_TYPES 
} from '../../services/questionTypeService.js';
import TestStatusBadge from '../../components/admin/tests/TestStatusBadge.jsx';
import TestConfigurationStepper from '../../components/admin/tests/TestConfigurationStepper.jsx';
import ExamPatternPreview from '../../components/common/ExamPatternPreview.jsx';
import QuestionTypeSelector from '../../components/common/QuestionTypeSelector.jsx';
import SectionConfigurationModal from '../../components/common/SectionConfigurationModal.jsx';

export default function AdminTestQuestionTypesPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(() => adminTestService.getTest(id));
  const [selectedTypes, setSelectedTypes] = useState(() => {
    if (!test) return [];
    try {
      const config = adminTestService.getAdminTestQuestionTypeConfig(id);
      return config.allowedTypes || [];
    } catch {
      return [...DEFAULT_TEST_ALLOWED_QUESTION_TYPES];
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [configuringUnit, setConfiguringUnit] = useState(null);

  // Subscribe to changes
  useEffect(() => {
    const unsub = adminTestService.subscribe(() => {
      const updated = adminTestService.getTest(id);
      setTest(updated);
      if (updated?.questionTypeConfig?.allowedTypes) {
        setSelectedTypes(updated.questionTypeConfig.allowedTypes);
      }
    });
    return unsub;
  }, [id]);

  if (!test) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center py-24 space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Test Not Found</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          The requested test could not be found or may have been deleted.
        </p>
        <div className="pt-2">
          <Link
            to="/admin/tests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Tests Directory
          </Link>
        </div>
      </div>
    );
  }

  const exam = catalogService.getExamById(test.examId);
  const canEdit = [TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status);

  // Real-time validation
  const validation = useMemo(() => {
    return questionTypeService.validateTestQuestionTypeConfig(
      { mode: QUESTION_TYPE_INHERITANCE_MODES.EXPLICIT, allowedTypes: selectedTypes },
      test.examId
    );
  }, [selectedTypes, test.examId]);

  // Handle Save Test-Level Question Types
  const handleSaveTestTypes = () => {
    if (!canEdit) return;
    try {
      setIsSaving(true);
      setSaveError('');
      setSaveSuccess('');

      adminTestService.updateAdminTestQuestionTypeConfig(test.id, {
        mode: QUESTION_TYPE_INHERITANCE_MODES.EXPLICIT,
        allowedTypes: selectedTypes
      });

      setSaveSuccess('Test-level question type permissions updated successfully.');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      setSaveError(err.message || 'Failed to update question type configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveUnitConfiguration = (updatedUnit) => {
    if (!test.structure || !Array.isArray(test.structure.units)) return;
    const updatedUnits = test.structure.units.map(u => u.id === updatedUnit.id ? updatedUnit : u);
    adminTestService.updateAdminTestStructure(test.id, {
      ...test.structure,
      units: updatedUnits
    });
    setConfiguringUnit(null);
  };

  const structureUnits = test.structure?.units || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-md text-[11px] font-black text-indigo-700 tracking-wider uppercase">
                Phase 4: Question Type System
              </span>
              <TestStatusBadge status={test.status} />
              <span className="text-xs text-slate-400 font-mono font-medium">
                {test.code}
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {test.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl">
                Configure permitted question formats across the entire test and define section-level overrides.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Link
              to={`/admin/tests/${test.id}/content`}
              className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
            >
              Phase 3 Content Hub
            </Link>
            <Link
              to={`/admin/tests/${test.id}/structure`}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Phase 2: Structure
            </Link>
            <Link
              to={`/admin/tests/${test.id}`}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              Overview
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: 4 cols Stepper + 8 cols Config */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4 cols): 6-Phase Stepper */}
        <div className="lg:col-span-4 space-y-4">
          <TestConfigurationStepper currentStep={3} testId={test.id} />
        </div>

        {/* Right Column (8 cols): Question Type Configuration Workspace */}
        <div className="lg:col-span-8 space-y-6">
          {/* Exam Context Banner */}
          <ExamPatternPreview examId={test.examId} compact={true} />

          {/* Feedback Alerts */}
          {saveSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              {saveSuccess}
            </div>
          )}

          {saveError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              {saveError}
            </div>
          )}

          {/* Card 1: Test-Level Question Type Permissions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    Assessment Supported Question Formats
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Select which question types this assessment permits. Individual sections inherit these formats by default.
                </p>
              </div>

              {canEdit && (
                <button
                  type="button"
                  onClick={handleSaveTestTypes}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 self-start shrink-0 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Saving...' : 'Save Permitted Types'}
                </button>
              )}
            </div>

            {!canEdit && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0 text-amber-600" />
                This test is locked in {test.status} status. Question type configurations are read-only.
              </div>
            )}

            {/* Reusable QuestionTypeSelector */}
            <QuestionTypeSelector
              selectedTypeIds={selectedTypes}
              onChange={setSelectedTypes}
              isEditable={canEdit}
              showBulkActions={true}
              layout="grid"
            />

            {/* Validation Warnings */}
            {validation.warnings.length > 0 && (
              <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-amber-800 space-y-1">
                {validation.warnings.map((w, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                    <span>{w.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Section-Level Question Types Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Section-Level Question Type Breakdown ({structureUnits.length} Units)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Each section can inherit the assessment defaults or specify a custom restricted subset.
                </p>
              </div>
            </div>

            {structureUnits.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/60">
                <p className="text-xs text-slate-500">
                  No structure units created yet.{' '}
                  <Link to={`/admin/tests/${test.id}/structure`} className="text-indigo-600 font-bold hover:underline">
                    Create sections in Phase 2
                  </Link>.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {structureUnits.map((unit, idx) => {
                  const unitConfig = unit.configuration || {};
                  const qtConfig = unitConfig.questionTypeConfig || {};
                  const isInheriting = (qtConfig.mode || 'INHERIT') === 'INHERIT';
                  const effectiveTypes = questionTypeService.resolveEffectiveUnitQuestionTypes(unit, {
                    allowedTypes: selectedTypes
                  });

                  return (
                    <div
                      key={unit.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            {unit.name}
                          </span>
                          {unit.code && (
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                              {unit.code}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isInheriting
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}>
                            {isInheriting ? 'Inheriting Test Types' : 'Custom Section Types'}
                          </span>
                        </div>

                        {/* Supported Types Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {effectiveTypes.map(tId => {
                            const def = questionTypeService.getQuestionTypeById(tId);
                            return (
                              <span
                                key={tId}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${def?.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200'}`}
                              >
                                {def?.shortName || tId}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConfiguringUnit(unit)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                          Configure Section
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Configuration Modal */}
      {configuringUnit && (
        <SectionConfigurationModal
          isOpen={Boolean(configuringUnit)}
          onClose={() => setConfiguringUnit(null)}
          unit={configuringUnit}
          unitTypeLabel={test.structure?.unitType || 'Section'}
          examId={test.examId}
          role="admin"
          testAllowedQuestionTypes={selectedTypes}
          isEditable={canEdit}
          onSave={handleSaveUnitConfiguration}
        />
      )}
    </div>
  );
}

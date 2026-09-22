import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sliders,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Save,
  ArrowRight,
  BookOpen,
  Target,
  Clock,
  Navigation,
  AlertTriangle,
  Info,
  Lock,
  Globe
} from 'lucide-react';
import { 
  adminTestService, 
  TEST_STATUS, 
  getTestTypeLabel,
  getAssessmentMethodLabel,
  getAssessmentMethodBadgeClass 
} from '../../services/adminTestService.js';
import { EVENT_ADMIN_TESTS_UPDATED } from '../../services/adminTestService.js';
import {
  createDefaultRules,
  saveAdminTestRules,
  getAdminTestRules,
  validateRules,
  validateBlueprint,
  validateScoring,
  validateTiming,
  validateNavigation,
  isRulesReady,
  formatScoringScheme,
  formatTimingMode,
  formatNavigationMode,
  formatBlueprintMode,
  BLUEPRINT_MODES,
  TIMING_MODES,
  NAVIGATION_MODES
} from '../../services/testRulesService.js';
import TestStatusBadge from '../../components/admin/tests/TestStatusBadge.jsx';
import TestConfigurationStepper from '../../components/admin/tests/TestConfigurationStepper.jsx';
import RulesBlueprintTab from '../../components/common/RulesBlueprintTab.jsx';
import RulesScoringTab from '../../components/common/RulesScoringTab.jsx';
import RulesTimingTab from '../../components/common/RulesTimingTab.jsx';
import RulesNavigationTab from '../../components/common/RulesNavigationTab.jsx';

const TABS = [
  { id: 'blueprint', label: 'Blueprint', icon: Target, desc: 'Difficulty & subject distribution' },
  { id: 'scoring', label: 'Scoring', icon: BookOpen, desc: 'Marks, penalties & cutoffs' },
  { id: 'timing', label: 'Timing', icon: Clock, desc: 'Duration & section timing' },
  { id: 'navigation', label: 'Navigation', icon: Navigation, desc: 'Candidate navigation rules' }
];

export default function AdminTestRulesPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(() => adminTestService.getTest(id));
  const [activeTab, setActiveTab] = useState('blueprint');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize rules from existing or default
  const [rules, setRules] = useState(() => {
    const t = adminTestService.getTest(id);
    if (!t) return null;
    return getAdminTestRules(id) || createDefaultRules(t);
  });

  // Reactive subscription via DOM event
  useEffect(() => {
    const handler = () => {
      const updated = adminTestService.getTest(id);
      setTest(updated);
    };
    window.addEventListener(EVENT_ADMIN_TESTS_UPDATED, handler);
    return () => window.removeEventListener(EVENT_ADMIN_TESTS_UPDATED, handler);
  }, [id]);

  const validation = useMemo(() => {
    if (!rules || !test) return null;
    return validateRules(rules, test);
  }, [rules, test]);

  const tabValidations = useMemo(() => {
    if (!rules || !test) return {};
    return {
      blueprint: validateBlueprint(rules.blueprint, test),
      scoring: validateScoring(rules.scoring),
      timing: validateTiming(rules.timing, test),
      navigation: validateNavigation(rules.navigation)
    };
  }, [rules, test]);

  const rulesReady = useMemo(() => {
    if (!rules || !test) return false;
    return isRulesReady(rules, test);
  }, [rules, test]);

  const updateSection = useCallback((section, value) => {
    setRules(prev => ({ ...prev, [section]: value }));
    setHasUnsavedChanges(true);
    setSaveSuccess('');
  }, []);

  const handleSave = async () => {
    if (!rules || !test) return;
    setIsSaving(true);
    setSaveError('');
    try {
      await new Promise(r => setTimeout(r, 320));
      saveAdminTestRules(id, rules);
      setHasUnsavedChanges(false);
      setSaveSuccess('Rules saved successfully.');
      setRules(getAdminTestRules(id) || rules);
      setTimeout(() => setSaveSuccess(''), 3500);
    } catch (err) {
      setSaveError(err.message || 'Failed to save rules.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!test) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="p-6 bg-white border border-rose-200 rounded-3xl text-center space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Admin Test Not Found</h2>
          <p className="text-xs text-slate-500">The test with ID "{id}" could not be found.</p>
          <Link
            to="/admin/tests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tests
          </Link>
        </div>
      </div>
    );
  }

  const isLocked = ![TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status);
  const exam = test?.examId ? adminTestService.getExamById(test.examId) : null;
  const activeTabDef = TABS.find(t => t.id === activeTab);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* Toast Notifications */}
      {saveSuccess && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveSuccess}</span>
          </div>
          <button onClick={() => setSaveSuccess('')} className="text-white/80 hover:text-white text-xs px-2">Dismiss</button>
        </div>
      )}
      {saveError && (
        <div className="bg-rose-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{saveError}</span>
          </div>
          <button onClick={() => setSaveError('')} className="text-white/80 hover:text-white text-xs px-2">Dismiss</button>
        </div>
      )}

      {/* Top Breadcrumb & ID */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/admin/tests" className="hover:text-indigo-600 transition-colors">Test Management</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to={`/admin/tests/${id}`} className="hover:text-indigo-600 transition-colors truncate max-w-xs">{test.name}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800">Phase 3: Rules</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">ID: {id}</span>
      </div>

      {/* Top 5-Phase Navigation */}
      <TestConfigurationStepper currentStep={3} testId={id} role="admin" />

      {/* Main Header Banner: Test Identity */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <TestStatusBadge status={test.status} />
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200/80 tracking-wide">
                {test.code}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                {getTestTypeLabel(test.testType)}
              </span>
              {test.assessmentMethod && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${getAssessmentMethodBadgeClass(test.assessmentMethod)}`}>
                  {getAssessmentMethodLabel(test.assessmentMethod)}
                </span>
              )}
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                Phase 3: Rules
              </span>
              {isLocked && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Read-Only ({test.status})
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {test.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  Associated Exam: <strong className="text-slate-800 font-semibold">{exam?.name || test.examId}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  Language: <strong className="text-slate-700">{test.language || 'English'}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/admin/tests/${id}`}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Test Detail
            </Link>
          </div>
        </div>
      </div>

      {/* Full-Width Phase 3 Workspace: Rules */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
        {/* Phase 3 Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Phase 3: Rules
              </h2>
              <p className="text-xs text-slate-500">
                Blueprint, Scoring, Timing &amp; Navigation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
              rulesReady
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {rulesReady ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {rulesReady ? 'Rules Configured' : 'In Progress'}
            </span>
          </div>
        </div>

        {/* Horizontal Rules Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-1 overflow-x-auto">
            {TABS.map(tab => {
              const tabVal = tabValidations[tab.id];
              const hasErrors = tabVal && tabVal.errors?.length > 0;
              const hasWarnings = tabVal && tabVal.warnings?.length > 0;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {hasErrors ? (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                      {tabVal.errors.length}
                    </span>
                  ) : hasWarnings ? (
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-white text-[9px] font-black flex items-center justify-center">
                      !
                    </span>
                  ) : tabVal ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 px-2 shrink-0">
            {rules.savedAt && (
              <span>Last saved: {new Date(rules.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <fieldset disabled={isLocked} className="disabled:opacity-60 disabled:pointer-events-none pt-2">
          {activeTab === 'blueprint' && (
            <RulesBlueprintTab
              blueprint={rules?.blueprint || {}}
              onChange={val => updateSection('blueprint', val)}
              test={test}
              validation={tabValidations.blueprint}
            />
          )}

          {activeTab === 'scoring' && (
            <RulesScoringTab
              scoring={rules?.scoring || {}}
              onChange={val => updateSection('scoring', val)}
              test={test}
              validation={tabValidations.scoring}
            />
          )}

          {activeTab === 'timing' && (
            <RulesTimingTab
              timing={rules?.timing || {}}
              onChange={val => updateSection('timing', val)}
              test={test}
              validation={tabValidations.timing}
            />
          )}

          {activeTab === 'navigation' && (
            <RulesNavigationTab
              navigation={rules?.navigation || {}}
              onChange={val => updateSection('navigation', val)}
              validation={tabValidations.navigation}
            />
          )}
        </fieldset>

        {/* Phase Footer Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <Link
            to={`/admin/tests/${id}/structure`}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous: Structure</span>
          </Link>

          <div className="flex items-center gap-3">
            {!isLocked && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {isSaving ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Saving…
                  </span>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save Rules
                  </>
                )}
              </button>
            )}

            <Link
              to={`/admin/tests/${id}/build`}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                rulesReady
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
              }`}
            >
              <span>Next: Content &amp; Build</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

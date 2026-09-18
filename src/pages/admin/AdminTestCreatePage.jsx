import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Save, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Globe, 
  HelpCircle,
  BookOpen,
  Info
} from 'lucide-react';
import { 
  adminTestService, 
  TEST_TYPES, 
  TEST_LANGUAGES 
} from '../../services/adminTestService';
import AssessmentMethodSelector from '../../components/common/AssessmentMethodSelector.jsx';
import { isValidAssessmentMethod } from '../../services/assessmentMethodService.js';

export default function AdminTestCreatePage() {
  const navigate = useNavigate();
  const availableExams = adminTestService.getAvailableExams();

  const [formData, setFormData] = useState({
    examId: availableExams.length > 0 ? availableExams[0].id : '',
    name: '',
    code: '',
    testType: 'FULL_MOCK',
    assessmentMethod: 'THEORETICAL',
    targetDuration: 180,
    targetQuestions: 100,
    language: 'English',
    description: '',
    instructions: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Code change: auto uppercase and replace spaces with underscores
  const handleCodeChange = (e) => {
    const rawVal = e.target.value;
    const formattedVal = rawVal.toUpperCase().replace(/\s+/g, '_');
    setFormData(prev => ({ ...prev, code: formattedVal }));

    if (errors.code) {
      setErrors(prev => ({ ...prev, code: null }));
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.examId || !formData.examId.trim()) {
      newErrors.examId = 'Please select an associated Exam.';
    }

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Test Name is required.';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Test Name must be at least 3 characters.';
    }

    const cleanCode = formData.code.trim().toUpperCase();
    if (!cleanCode) {
      newErrors.code = 'Test Code is required.';
    } else if (cleanCode.length < 3) {
      newErrors.code = 'Test Code must be at least 3 characters.';
    } else if (!adminTestService.isCodeUnique(cleanCode)) {
      newErrors.code = `Test Code "${cleanCode}" already exists. Test Code must be unique.`;
    }

    if (!formData.testType) {
      newErrors.testType = 'Please select a Test Type.';
    }

    if (!formData.assessmentMethod) {
      newErrors.assessmentMethod = 'Please select an Assessment Method.';
    } else if (!isValidAssessmentMethod(formData.assessmentMethod)) {
      newErrors.assessmentMethod = 'Select a valid assessment method.';
    }

    if (!formData.targetDuration || formData.targetDuration < 5) {
      newErrors.targetDuration = 'Target duration must be at least 5 minutes.';
    }

    if (!formData.targetQuestions || formData.targetQuestions < 1) {
      newErrors.targetQuestions = 'Target questions must be at least 1.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const createdTest = adminTestService.createTest({
        ...formData,
        targetDuration: Number(formData.targetDuration),
        targetQuestions: Number(formData.targetQuestions)
      });

      // Navigate to the newly created test detail page
      navigate(`/admin/tests/${createdTest.id}`, {
        state: { message: `Test "${createdTest.name}" created successfully as Draft!` }
      });
    } catch (err) {
      setErrors(prev => ({ ...prev, form: err.message }));
      setIsSubmitting(false);
    }
  };

  const selectedExam = availableExams.find(e => e.id === formData.examId);

  // Helper to format minutes into human readable text
  const formatDurationHint = (mins) => {
    const num = Number(mins) || 0;
    const hours = Math.floor(num / 60);
    const m = num % 60;
    if (hours > 0 && m > 0) return `${hours} hr ${m} min`;
    if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
    return `${m} mins`;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link 
            to="/admin/tests" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Test Management
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Create New Test
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Step 1: Foundation
                </span>
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Configure assessment parameters and assign to an existing medical exam curriculum.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/tests"
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : 'Save as Draft'}
          </button>
        </div>
      </div>

      {/* Distinction Callout: Test ≠ Exam */}
      <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-blue-50 border border-indigo-100/80 rounded-2xl p-4.5 flex items-start gap-3.5 shadow-sm">
        <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
          <BookOpen className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1">
          <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
            <span>Understanding Tests vs Medical Exams</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">
              Core Architecture
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            In MedPrep Pro, an <strong className="text-slate-800">Exam</strong> (e.g. NEET-PG, USMLE, PLAB) is the medical licensing target students prepare for.
            A <strong className="text-slate-800">Test</strong> is an actual assessment created under that exam. All tests inherit their medical syllabus from the selected exam.
          </p>
        </div>
      </div>

      {/* Global Form Error if any */}
      {errors.form && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div>
            <div className="font-semibold">Creation Error</div>
            <div>{errors.form}</div>
          </div>
        </div>
      )}

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Associated Medical Exam & Type */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              1. Associated Exam & Assessment Type
            </h2>
            <span className="text-xs font-semibold text-rose-500">* Required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Associated Exam Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Associated Medical Exam <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.examId}
                onChange={(e) => handleChange('examId', e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                  errors.examId ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                }`}
              >
                {availableExams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name} ({exam.id.toUpperCase()})
                  </option>
                ))}
              </select>
              {errors.examId ? (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.examId}</p>
              ) : (
                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                  <Info className="w-3 h-3 text-slate-400" />
                  Select existing medical qualification from the MedPrep catalog.
                </p>
              )}

              {selectedExam && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs text-slate-600">
                  <div className="font-semibold text-slate-800">{selectedExam.name}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{selectedExam.description}</div>
                </div>
              )}
            </div>

            {/* Test Type Select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Test Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.testType}
                onChange={(e) => handleChange('testType', e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                  errors.testType ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                }`}
              >
                {TEST_TYPES.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {errors.testType ? (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.testType}</p>
              ) : (
                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                  <Info className="w-3 h-3 text-slate-400" />
                  Defines the educational purpose and scope of this assessment.
                </p>
              )}
            </div>
          </div>

          {/* Assessment Method Option Group */}
          <div className="pt-4 border-t border-slate-100">
            <AssessmentMethodSelector
              value={formData.assessmentMethod}
              onChange={(val) => handleChange('assessmentMethod', val)}
              error={errors.assessmentMethod}
              required={true}
            />
          </div>
        </div>

        {/* Card 2: Identity & Code */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              2. Test Identity & Unique Code
            </h2>
            <span className="text-xs font-semibold text-rose-500">* Required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Test Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Test Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. NEET-PG Full Mock Test 03"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                  errors.name ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                }`}
              />
              {errors.name ? (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.name}</p>
              ) : (
                <p className="text-xs text-slate-500 mt-1.5">
                  Descriptive title shown to candidates and faculty reviewers.
                </p>
              )}
            </div>

            {/* Test Code */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Test Code <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Immutable After Creation</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formData.code}
                  onChange={handleCodeChange}
                  placeholder="e.g. NEETPG-MOCK-03"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border font-mono uppercase tracking-wider rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                    errors.code ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
                {formData.code && !errors.code && (
                  <span className="absolute right-3 top-2.5 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}
              </div>
              {errors.code ? (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.code}</p>
              ) : (
                <p className="text-xs text-slate-500 mt-1.5">
                  Unique system identifier. Normalized to uppercase with underscores.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Planning Targets (Planning Metadata Notice) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                3. Planning Metadata
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Administrative scope targets for blueprinting and question quota planning.
              </p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Phase 1 Planning Targets
            </span>
          </div>

          {/* Explicit Clarification Box */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Administrative Scope Notice:</strong> In Phase 1, <em>Target Questions</em> and <em>Target Duration</em> are basic planning metadata only. They define authoring quotas and do not yet control student timer engines, dynamic scoring rules, or automated section delivery.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Target Questions */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Questions
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={formData.targetQuestions}
                  onChange={(e) => handleChange('targetQuestions', e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                    errors.targetQuestions ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
                <span className="absolute right-3 top-2.5 text-xs font-medium text-slate-400">
                  MCQs
                </span>
              </div>
              {errors.targetQuestions ? (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.targetQuestions}</p>
              ) : (
                <p className="text-xs text-slate-500 mt-1.5">Planned question count for authoring.</p>
              )}
            </div>

            {/* Target Duration */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Duration (Minutes)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="600"
                  step="5"
                  value={formData.targetDuration}
                  onChange={(e) => handleChange('targetDuration', e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                    errors.targetDuration ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
                <span className="absolute right-3 top-2.5 text-xs font-medium text-slate-400">
                  mins
                </span>
              </div>
              {errors.targetDuration ? (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.targetDuration}</p>
              ) : (
                <p className="text-xs text-indigo-600 font-semibold mt-1.5">
                  ≈ {formatDurationHint(formData.targetDuration)}
                </p>
              )}
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Assessment Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              >
                {TEST_LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1.5">Primary delivery language.</p>
            </div>
          </div>
        </div>

        {/* Card 4: Description & Instructions */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              4. Clinical Focus & Candidate Instructions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Guidance displayed to students on their test briefing card prior to starting.
            </p>
          </div>

          <div className="space-y-4">
            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Test Description & Clinical Scope
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="e.g. Comprehensive 200 clinical vignette mock assessment strictly aligned with NBE exam blueprint..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-y"
              />
              <p className="text-xs text-slate-500 mt-1">
                Summary of competencies and medical specialties evaluated in this assessment.
              </p>
            </div>

            {/* Candidate Instructions */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Candidate Instructions & Rules
              </label>
              <textarea
                rows={4}
                value={formData.instructions}
                onChange={(e) => handleChange('instructions', e.target.value)}
                placeholder="e.g. This mock test contains 200 clinical questions across pre-clinical, para-clinical, and clinical specialties. Negative marking of -1 per incorrect answer applies..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-y"
              />
              <p className="text-xs text-slate-500 mt-1">
                Pre-test instructions shown to candidates prior to launching the exam environment.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
            Test will be initialized with status <strong className="text-slate-700">DRAFT</strong>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/tests"
              className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Creating Test...' : 'Save as Draft & Continue'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

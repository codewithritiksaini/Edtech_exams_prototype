import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Globe, 
  FileText, 
  BookOpen, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { 
  adminTestService, 
  TEST_TYPES, 
  TEST_LANGUAGES 
} from '../../services/adminTestService';
import AssessmentMethodSelector from '../../components/common/AssessmentMethodSelector.jsx';
import { isValidAssessmentMethod } from '../../services/assessmentMethodService.js';

export default function AdminTestEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(() => adminTestService.getTest(id));
  const availableExams = adminTestService.getAvailableExams();

  const [formData, setFormData] = useState({
    examId: '',
    name: '',
    code: '',
    testType: 'FULL_MOCK',
    assessmentMethod: '',
    targetDuration: 180,
    targetQuestions: 100,
    language: 'English',
    description: '',
    instructions: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const existing = adminTestService.getTest(id);
    if (existing) {
      setTest(existing);
      setFormData({
        examId: existing.examId || '',
        name: existing.name || '',
        code: existing.code || '',
        testType: existing.testType || 'FULL_MOCK',
        assessmentMethod: existing.assessmentMethod || '',
        targetDuration: existing.targetDuration || 180,
        targetQuestions: existing.targetQuestions || 100,
        language: existing.language || 'English',
        description: existing.description || '',
        instructions: existing.instructions || ''
      });
    }
  }, [id]);

  if (!test) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center py-24 space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Test Not Found</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          The test you are trying to edit does not exist or has been removed.
        </p>
        <div className="pt-2">
          <Link
            to="/admin/tests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Test Management
          </Link>
        </div>
      </div>
    );
  }

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

    if (!formData.testType) {
      newErrors.testType = 'Please select a Test Type.';
    }

    if (formData.assessmentMethod && !isValidAssessmentMethod(formData.assessmentMethod)) {
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
      const updated = adminTestService.updateTest(id, {
        name: formData.name,
        examId: formData.examId,
        testType: formData.testType,
        assessmentMethod: formData.assessmentMethod || null,
        targetDuration: Number(formData.targetDuration),
        targetQuestions: Number(formData.targetQuestions),
        language: formData.language,
        description: formData.description,
        instructions: formData.instructions
      });

      navigate(`/admin/tests/${id}`, {
        state: { message: `Test "${updated.name}" updated successfully!` }
      });
    } catch (err) {
      setErrors(prev => ({ ...prev, form: err.message }));
      setIsSubmitting(false);
    }
  };

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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link 
            to={`/admin/tests/${id}`} 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Test Details
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Edit Test Setup
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Update foundation details for <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{test.code}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/admin/tests/${id}`}
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errors.form && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div>
            <div className="font-semibold">Update Error</div>
            <div>{errors.form}</div>
          </div>
        </div>
      )}

      {/* Main Form */}
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
            {/* Associated Exam */}
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
                <p className="text-xs text-slate-500 mt-1.5">
                  The medical curriculum this test assessment belongs to.
                </p>
              )}
            </div>

            {/* Test Type */}
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
              {errors.testType && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.testType}</p>
              )}
            </div>
          </div>

          {/* Assessment Method Selector */}
          <div className="pt-4 border-t border-slate-100">
            <AssessmentMethodSelector
              value={formData.assessmentMethod}
              onChange={(val) => handleChange('assessmentMethod', val)}
              error={errors.assessmentMethod}
              required={false}
            />
          </div>
        </div>

        {/* Card 2: Identity & Permanent Code */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              2. Test Identity & Code
            </h2>
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
                placeholder="e.g. NEET-PG Full Mock Test 01"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                  errors.name ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                }`}
              />
              {errors.name ? (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.name}</p>
              ) : (
                <p className="text-xs text-slate-500 mt-1.5">
                  Name visible across admin tables and candidate rosters.
                </p>
              )}
            </div>

            {/* Test Code (READ-ONLY & IMMUTABLE) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Test Code (Permanent Identifier)
                </label>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                  Read Only
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formData.code}
                  disabled
                  readOnly
                  className="w-full px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 font-mono uppercase tracking-wider rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed select-none"
                />
                <span className="absolute right-3 top-2.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Test codes cannot be altered after creation to preserve system references.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Planning Targets */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                3. Planning Metadata
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Administrative scope targets for authoring and blueprint planning.
              </p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Phase 1 Planning Targets
            </span>
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
                <p className="text-xs text-slate-500 mt-1.5">Planned question quota.</p>
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
              4. Clinical Scope & Instructions
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Test Description & Clinical Scope
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Overview of specialties and clinical content covered..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Candidate Instructions & Rules
              </label>
              <textarea
                rows={4}
                value={formData.instructions}
                onChange={(e) => handleChange('instructions', e.target.value)}
                placeholder="Pre-test instructions shown to candidates prior to launching the exam..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-y"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <span className="text-xs text-slate-400">
            Last modified: {new Date(test.updatedAt).toLocaleDateString()}
          </span>

          <div className="flex items-center gap-3">
            <Link
              to={`/admin/tests/${id}`}
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
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

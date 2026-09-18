import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Save, 
  Calendar, 
  Clock, 
  BookOpen, 
  Layers, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  Users,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { 
  cbtTestService, 
  FACULTY_TEST_TYPES, 
  FACULTY_TEST_STATUS 
} from '../../services/cbtTestService';
import { peopleService } from '../../services/peopleService';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import AssessmentMethodSelector from '../../components/common/AssessmentMethodSelector.jsx';
import { isValidAssessmentMethod } from '../../services/assessmentMethodService.js';

export default function FacultyTestCreatePage() {
  const navigate = useNavigate();

  // Resolve current faculty profile & assigned exams
  const currentFaculty = peopleService.getCurrentFacultyProfile();
  const assignedExamIds = useMemo(() => {
    return currentFaculty?.assignedExams?.length ? currentFaculty.assignedExams : ['neet-pg', 'usmle', 'plab'];
  }, [currentFaculty]);

  // Strictly scoped exams: only show exams assigned to this faculty
  const allowedExams = useMemo(() => {
    return catalogService.getExams().filter(e => assignedExamIds.includes(e.id));
  }, [assignedExamIds]);

  // Form State
  const [formData, setFormData] = useState({
    examId: allowedExams.length > 0 ? allowedExams[0].id : '',
    subjectId: '',
    name: '',
    testType: 'SUBJECT_TEST',
    assessmentMethod: 'THEORETICAL',
    description: '',
    instructions: '',
    date: '',
    startTime: '18:00',
    durationMinutes: 45,
    timezone: 'Asia/Kolkata',
    cohort: 'All Enrolled Candidates'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available subjects for the currently selected Exam
  const availableSubjects = useMemo(() => {
    if (!formData.examId) return [];
    const subjects = curriculumService.getSubjects(formData.examId);
    // If faculty has specific assigned subjects, we can scope or annotate
    if (Array.isArray(currentFaculty?.assignedSubjects) && currentFaculty.assignedSubjects.length > 0) {
      const permitted = subjects.filter(s => currentFaculty.assignedSubjects.includes(s.id));
      if (permitted.length > 0) return permitted;
    }
    return subjects;
  }, [formData.examId, currentFaculty]);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // If exam changes, reset subject
      if (field === 'examId') {
        next.subjectId = '';
      }
      return next;
    });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = (isScheduling = false) => {
    const newErrors = {};

    if (!formData.examId) {
      newErrors.examId = 'Please select an assigned Medical Exam.';
    } else if (!assignedExamIds.includes(formData.examId)) {
      newErrors.examId = 'You are not assigned to this Medical Exam.';
    }

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Test Name is required.';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Test Name must be at least 3 characters.';
    }

    if (!formData.testType) {
      newErrors.testType = 'Please select a Test Type.';
    }

    if (!formData.assessmentMethod) {
      newErrors.assessmentMethod = 'Please select an Assessment Method.';
    } else if (!isValidAssessmentMethod(formData.assessmentMethod)) {
      newErrors.assessmentMethod = 'Select a valid assessment method.';
    }

    if (isScheduling) {
      if (!formData.date) {
        newErrors.date = 'Scheduled date is required to schedule as Upcoming.';
      }
      if (!formData.startTime) {
        newErrors.startTime = 'Start time is required to schedule as Upcoming.';
      }
      if (!formData.durationMinutes || formData.durationMinutes < 5) {
        newErrors.durationMinutes = 'Duration must be at least 5 minutes.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (targetStatus) => {
    const isUpcoming = targetStatus === FACULTY_TEST_STATUS.UPCOMING;
    if (!validate(isUpcoming)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const createdTest = cbtTestService.createFacultyTest({
        ...formData,
        status: targetStatus,
        durationMinutes: Number(formData.durationMinutes) || 45
      }, currentFaculty);

      navigate(`/faculty/tests/${createdTest.id}`, {
        state: { 
          message: isUpcoming 
            ? `Assessment "${createdTest.name}" scheduled successfully as Upcoming!` 
            : `Draft assessment "${createdTest.name}" saved successfully!` 
        }
      });
    } catch (err) {
      setErrors(prev => ({ ...prev, form: err.message }));
      setIsSubmitting(false);
    }
  };

  const selectedExamObj = allowedExams.find(e => e.id === formData.examId);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link 
            to="/faculty/tests" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Faculty Tests
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Create Faculty Assessment
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Configure classroom tests, subject drills, and cohort assessments.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/faculty/tests"
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={() => handleSave(FACULTY_TEST_STATUS.DRAFT)}
            disabled={isSubmitting}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave(FACULTY_TEST_STATUS.UPCOMING)}
            disabled={isSubmitting}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Calendar className="w-3.5 h-3.5" />
            Schedule Test
          </button>
        </div>
      </div>

      {/* Scope & Auto Code Notice Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-950">
          <div className="p-1.5 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-indigo-900">Faculty Scope Enforced</div>
            <div className="text-slate-600 mt-0.5 leading-relaxed">
              Logged in as <strong className="text-slate-800">{currentFaculty?.name}</strong>. You can only create assessments for your assigned medical programs: <span className="font-semibold text-indigo-700">{allowedExams.map(e => e.name).join(', ')}</span>.
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-700">
          <div className="p-1.5 bg-slate-800 text-white rounded-lg shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">Automatic Test Code Generation</div>
            <div className="text-slate-600 mt-0.5 leading-relaxed">
              A unique permanent assessment code (e.g. <span className="font-mono font-semibold text-slate-800">FT-20260920-001</span>) will be automatically assigned upon creation. No manual code management is required.
            </div>
          </div>
        </div>
      </div>

      {/* Form Error Banner */}
      {errors.form && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Creation Error: </span>
            {errors.form}
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSave(FACULTY_TEST_STATUS.UPCOMING); }} className="space-y-6">
        {/* Card 1: Program & Academic Scope */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              1. Program & Curricular Scope
            </h2>
            <span className="text-xs font-semibold text-rose-500">* Required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Scoped Exam Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Assigned Medical Exam <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.examId}
                onChange={(e) => handleChange('examId', e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                  errors.examId ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                }`}
              >
                {allowedExams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name} ({exam.id.toUpperCase()})
                  </option>
                ))}
              </select>
              {errors.examId ? (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.examId}</p>
              ) : (
                <p className="text-xs text-slate-500 mt-1.5">
                  Filtered strictly to programs assigned to your faculty profile.
                </p>
              )}
            </div>

            {/* Dynamic Subject Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Subject (Optional)
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => handleChange('subjectId', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              >
                <option value="">All Program Subjects / Grand Assessment</option>
                {availableSubjects.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1.5">
                Select a specific subject to narrow the focus of this test.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Assessment Identity */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              2. Assessment Identity & Type
            </h2>
            <span className="text-xs font-semibold text-rose-500">* Required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Test Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Assessment Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Cardiology Arrhythmias & ECG Clinical Drill"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                  errors.name ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                }`}
              />
              {errors.name ? (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.name}</p>
              ) : (
                <p className="text-xs text-slate-500 mt-1.5">
                  Descriptive title visible to enrolled candidates on their schedule.
                </p>
              )}
            </div>

            {/* Test Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Assessment Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.testType}
                onChange={(e) => handleChange('testType', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              >
                {FACULTY_TEST_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1.5">
                Specifies the educational scope of this classroom evaluation.
              </p>
            </div>
          </div>

          {/* Assessment Method Selector */}
          <div className="pt-4 border-t border-slate-100">
            <AssessmentMethodSelector
              value={formData.assessmentMethod}
              onChange={(val) => handleChange('assessmentMethod', val)}
              error={errors.assessmentMethod}
              required={true}
            />
          </div>
        </div>

        {/* Card 3: Scheduling Parameters */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                3. Scheduling & Delivery Parameters
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Required to schedule as Upcoming. Optional if saving as Draft.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Scheduled Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                  errors.date ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                }`}
              />
              {errors.date && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.date}</p>
              )}
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Start Time (IST)
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                  errors.startTime ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                }`}
              />
              {errors.startTime && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.startTime}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="360"
                step="5"
                value={formData.durationMinutes}
                onChange={(e) => handleChange('durationMinutes', e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                  errors.durationMinutes ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                }`}
              />
              {errors.durationMinutes && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.durationMinutes}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* Target Cohort */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Cohort / Batch Tier
              </label>
              <input
                type="text"
                value={formData.cohort}
                onChange={(e) => handleChange('cohort', e.target.value)}
                placeholder="e.g. All Enrolled Candidates or Batch 2026-A"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
              <p className="text-xs text-slate-500 mt-1">
                Student cohort eligible to take this test.
              </p>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Timezone
              </label>
              <input
                type="text"
                value={formData.timezone}
                disabled
                readOnly
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-mono text-slate-600 cursor-not-allowed select-none"
              />
              <p className="text-xs text-slate-400 mt-1">Standard Indian Standard Time (IST).</p>
            </div>
          </div>
        </div>

        {/* Card 4: Clinical Scope & Instructions */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              4. Clinical Focus & Candidate Instructions
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Test Description & Focus
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="e.g. Focused 45-minute clinical drill covering acute coronary syndromes, STEMI vs NSTEMI ECG changes, and hemodynamic stabilization..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Candidate Pre-Test Instructions
              </label>
              <textarea
                rows={3}
                value={formData.instructions}
                onChange={(e) => handleChange('instructions', e.target.value)}
                placeholder="e.g. 25 MCQs. Marking scheme: +5 marks for correct, -1 negative mark for incorrect. Ensure a stable internet connection..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-y"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Link
            to="/faculty/tests"
            className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSave(FACULTY_TEST_STATUS.DRAFT)}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Calendar className="w-4 h-4" />
              {isSubmitting ? 'Scheduling...' : 'Schedule Assessment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  BookOpen, 
  Layers, 
  FileText, 
  Users,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { 
  cbtTestService, 
  FACULTY_TEST_TYPES, 
  FACULTY_TEST_STATUS,
  getNormalizedFacultyStatus 
} from '../../services/cbtTestService';
import { peopleService } from '../../services/peopleService';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import FacultyTestStatusBadge from '../../components/faculty/tests/FacultyTestStatusBadge';
import AssessmentMethodSelector from '../../components/common/AssessmentMethodSelector.jsx';
import { isValidAssessmentMethod } from '../../services/assessmentMethodService.js';

export default function FacultyTestEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentFaculty = peopleService.getCurrentFacultyProfile();
  const assignedExamIds = useMemo(() => {
    return currentFaculty?.assignedExams?.length ? currentFaculty.assignedExams : ['neet-pg', 'usmle', 'plab'];
  }, [currentFaculty]);

  const allowedExams = useMemo(() => {
    return catalogService.getExams().filter(e => assignedExamIds.includes(e.id));
  }, [assignedExamIds]);

  const [test, setTest] = useState(() => cbtTestService.getTestById(id));

  const [formData, setFormData] = useState({
    examId: '',
    subjectId: '',
    name: '',
    testType: 'SUBJECT_TEST',
    assessmentMethod: '',
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

  useEffect(() => {
    const existing = cbtTestService.getTestById(id);
    if (existing) {
      setTest(existing);
      setFormData({
        examId: existing.examId || existing.examTrack || existing.courseId || '',
        subjectId: existing.subjectId || '',
        name: existing.name || existing.title || '',
        testType: existing.testType || 'SUBJECT_TEST',
        assessmentMethod: existing.assessmentMethod || '',
        description: existing.description || '',
        instructions: Array.isArray(existing.instructions) ? existing.instructions.join('\n') : (existing.instructions || ''),
        date: existing.scheduling?.date || existing.date || '',
        startTime: existing.scheduling?.startTime || (existing.time ? existing.time.replace(' IST', '') : '18:00'),
        durationMinutes: existing.durationMinutes || 45,
        timezone: existing.scheduling?.timezone || 'Asia/Kolkata',
        cohort: existing.cohort || existing.batchTier || 'All Enrolled Candidates'
      });
    }
  }, [id]);

  const availableSubjects = useMemo(() => {
    if (!formData.examId) return [];
    return curriculumService.getSubjects(formData.examId);
  }, [formData.examId]);

  if (!test) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center py-24 space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Assessment Not Found</h1>
        <div className="pt-2">
          <Link
            to="/faculty/tests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Faculty Tests
          </Link>
        </div>
      </div>
    );
  }

  const currentStatus = getNormalizedFacultyStatus(test);
  const isLive = currentStatus === FACULTY_TEST_STATUS.LIVE;
  const isCompleted = currentStatus === FACULTY_TEST_STATUS.COMPLETED;
  const isCancelled = currentStatus === FACULTY_TEST_STATUS.CANCELLED;
  const isReadOnly = isLive || isCompleted || isCancelled;

  const handleChange = (field, value) => {
    if (isReadOnly) return;
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'examId') {
        next.subjectId = '';
      }
      return next;
    });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.examId) {
      newErrors.examId = 'Medical Exam is required.';
    } else if (!assignedExamIds.includes(formData.examId)) {
      newErrors.examId = 'You are not assigned to this Medical Exam.';
    }

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Test Name is required.';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Test Name must be at least 3 characters.';
    }

    if (!formData.testType) {
      newErrors.testType = 'Test Type is required.';
    }

    if (formData.assessmentMethod && !isValidAssessmentMethod(formData.assessmentMethod)) {
      newErrors.assessmentMethod = 'Select a valid assessment method.';
    }

    if (!formData.durationMinutes || formData.durationMinutes < 5) {
      newErrors.durationMinutes = 'Duration must be at least 5 minutes.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = cbtTestService.updateFacultyTest(id, {
        name: formData.name,
        examId: formData.examId,
        subjectId: formData.subjectId || null,
        testType: formData.testType,
        assessmentMethod: formData.assessmentMethod || null,
        description: formData.description,
        instructions: formData.instructions,
        cohort: formData.cohort,
        batchTier: formData.cohort,
        scheduling: {
          date: formData.date,
          startTime: formData.startTime,
          durationMinutes: Number(formData.durationMinutes) || 45,
          timezone: formData.timezone
        }
      }, currentFaculty);

      navigate(`/faculty/tests/${id}`, {
        state: { message: `Assessment "${updated.name}" updated successfully!` }
      });
    } catch (err) {
      setErrors(prev => ({ ...prev, form: err.message }));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link 
            to={`/faculty/tests/${id}`} 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Assessment Details
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Edit Assessment Setup
                </h1>
                <FacultyTestStatusBadge status={currentStatus} />
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Assessment Code: <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{test.code || test.id}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to={`/faculty/tests/${id}`}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            {isReadOnly ? 'Back' : 'Cancel'}
          </Link>
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      {/* Read-Only Lock Banner for Live / Completed / Cancelled */}
      {isReadOnly && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 flex items-start gap-3 text-xs leading-relaxed">
          <div className="p-1.5 bg-amber-600 text-white rounded-lg shrink-0 mt-0.5">
            <Ban className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm">
              Assessment Locked ({currentStatus})
            </div>
            <div className="text-amber-800 mt-0.5">
              {isLive && 'This assessment is currently Live and active. Editing is disabled to protect active candidate attempts.'}
              {isCompleted && 'This assessment has been Completed and submitted by candidates. Parameters are permanently locked for integrity.'}
              {isCancelled && 'This assessment was Cancelled and cannot be edited. You can duplicate it to create a new draft if desired.'}
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errors.form && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Update Error: </span>
            {errors.form}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Program & Identity */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              1. Program & Curricular Scope
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Scoped Exam Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Assigned Medical Exam <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.examId}
                disabled={isReadOnly}
                onChange={(e) => handleChange('examId', e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors disabled:bg-slate-100 disabled:text-slate-500 ${
                  errors.examId ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                }`}
              >
                {allowedExams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name} ({exam.id.toUpperCase()})
                  </option>
                ))}
              </select>
              {errors.examId && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.examId}</p>
              )}
            </div>

            {/* Dynamic Subject */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Subject
              </label>
              <select
                value={formData.subjectId}
                disabled={isReadOnly}
                onChange={(e) => handleChange('subjectId', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="">All Program Subjects / Grand Assessment</option>
                {availableSubjects.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Assessment Identity & Immutable Code */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              2. Assessment Identity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Assessment Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                disabled={isReadOnly}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Cardiology Grand Mock Test"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors disabled:bg-slate-100 disabled:text-slate-500 ${
                  errors.name ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                }`}
              />
              {errors.name && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.name}</p>
              )}
            </div>

            {/* Test Code (READ-ONLY) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Test Code (Permanent Identifier)
                </label>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                  Auto-Generated
                </span>
              </div>
              <input
                type="text"
                value={test.code || test.id}
                disabled
                readOnly
                className="w-full px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 font-mono uppercase tracking-wider rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed select-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Test Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Assessment Type
              </label>
              <select
                value={formData.testType}
                disabled={isReadOnly}
                onChange={(e) => handleChange('testType', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors disabled:bg-slate-100 disabled:text-slate-500"
              >
                {FACULTY_TEST_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Faculty Owner (READ-ONLY) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Faculty In-Charge
                </label>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                  Owner
                </span>
              </div>
              <input
                type="text"
                value={`${test.facultyName || 'Dr. Siddharth V.'} (${test.facultyId || 'fac-1'})`}
                disabled
                readOnly
                className="w-full px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* Assessment Method Selector */}
          <div className="pt-4 border-t border-slate-100">
            <AssessmentMethodSelector
              value={formData.assessmentMethod}
              onChange={(val) => handleChange('assessmentMethod', val)}
              error={errors.assessmentMethod}
              readOnly={isReadOnly}
              required={false}
            />
          </div>
        </div>

        {/* Card 3: Scheduling */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              3. Scheduling & Delivery Parameters
            </h2>
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
                disabled={isReadOnly}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Start Time (IST)
              </label>
              <input
                type="time"
                value={formData.startTime}
                disabled={isReadOnly}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors disabled:bg-slate-100 disabled:text-slate-500"
              />
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
                disabled={isReadOnly}
                onChange={(e) => handleChange('durationMinutes', e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors disabled:bg-slate-100 disabled:text-slate-500 ${
                  errors.durationMinutes ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* Cohort */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Cohort
              </label>
              <input
                type="text"
                value={formData.cohort}
                disabled={isReadOnly}
                onChange={(e) => handleChange('cohort', e.target.value)}
                placeholder="e.g. All Enrolled Candidates"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors disabled:bg-slate-100 disabled:text-slate-500"
              />
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
                disabled={isReadOnly}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-y disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Candidate Instructions
              </label>
              <textarea
                rows={3}
                value={formData.instructions}
                disabled={isReadOnly}
                onChange={(e) => handleChange('instructions', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-y disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Link
            to={`/faculty/tests/${id}`}
            className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            {isReadOnly ? 'Back to Details' : 'Cancel'}
          </Link>

          {!isReadOnly && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

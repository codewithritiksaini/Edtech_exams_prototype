import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  BarChart3, 
  Search, 
  Eye, 
  Edit3, 
  Copy, 
  XCircle, 
  Filter, 
  RotateCcw,
  Sparkles,
  BookOpen,
  Layers,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { 
  cbtTestService, 
  FACULTY_TEST_STATUS, 
  FACULTY_TEST_TYPES, 
  getFacultyTestTypeLabel,
  getNormalizedFacultyStatus,
  getAssessmentMethodLabel
} from '../../services/cbtTestService';
import { peopleService } from '../../services/peopleService';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import FacultyTestStatusBadge from '../../components/faculty/tests/FacultyTestStatusBadge';
import FacultyTestCancelModal from '../../components/faculty/tests/FacultyTestCancelModal';

export default function FacultyTestsPage() {
  const navigate = useNavigate();

  // Current faculty profile & assigned exam scope
  const [currentFaculty, setCurrentFaculty] = useState(() => peopleService.getCurrentFacultyProfile());
  const assignedExamIds = useMemo(() => {
    return currentFaculty?.assignedExams?.length ? currentFaculty.assignedExams : ['neet-pg', 'usmle', 'plab'];
  }, [currentFaculty]);

  // Allowed exams for filters
  const allowedExams = useMemo(() => {
    return catalogService.getExams().filter(e => assignedExamIds.includes(e.id));
  }, [assignedExamIds]);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [selectedTestType, setSelectedTestType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Cancel Modal & Toast state
  const [cancelTargetTest, setCancelTargetTest] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Tests data
  const [rawTests, setRawTests] = useState(() => cbtTestService.getFacultyScopedTests({}, currentFaculty));
  const [stats, setStats] = useState(() => cbtTestService.getFacultySummaryStats(currentFaculty));

  // Subscribe to service updates
  useEffect(() => {
    const unsubscribe = cbtTestService.subscribe(() => {
      setRawTests(cbtTestService.getFacultyScopedTests({}, currentFaculty));
      setStats(cbtTestService.getFacultySummaryStats(currentFaculty));
    });

    const handlePeople = () => {
      const updatedProfile = peopleService.getCurrentFacultyProfile();
      setCurrentFaculty(updatedProfile);
      setRawTests(cbtTestService.getFacultyScopedTests({}, updatedProfile));
      setStats(cbtTestService.getFacultySummaryStats(updatedProfile));
    };

    window.addEventListener('medprep-people-updated', handlePeople);
    return () => {
      unsubscribe();
      window.removeEventListener('medprep-people-updated', handlePeople);
    };
  }, [currentFaculty]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Available subjects for the currently selected exam filter
  const availableSubjects = useMemo(() => {
    if (selectedExamId === 'all') {
      // Aggregate subjects across all assigned exams
      const allSubs = [];
      assignedExamIds.forEach(exId => {
        allSubs.push(...curriculumService.getSubjects(exId));
      });
      return allSubs;
    }
    return curriculumService.getSubjects(selectedExamId);
  }, [selectedExamId, assignedExamIds]);

  // Filtered tests calculation
  const filteredTests = useMemo(() => {
    return cbtTestService.getFacultyScopedTests({
      examId: selectedExamId,
      subjectId: selectedSubjectId,
      testType: selectedTestType,
      status: selectedStatus,
      search: searchQuery
    }, currentFaculty);
  }, [rawTests, selectedExamId, selectedSubjectId, selectedTestType, selectedStatus, searchQuery, currentFaculty]);

  const hasActiveFilters = 
    searchQuery.trim() !== '' || 
    selectedExamId !== 'all' || 
    selectedSubjectId !== 'all' || 
    selectedTestType !== 'all' || 
    selectedStatus !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedExamId('all');
    setSelectedSubjectId('all');
    setSelectedTestType('all');
    setSelectedStatus('all');
  };

  const handleDuplicate = (testId) => {
    try {
      const duplicated = cbtTestService.duplicateFacultyTest(testId, currentFaculty);
      showToast(`Duplicated successfully as "${duplicated.name}" (Draft)!`);
      setRawTests(cbtTestService.getFacultyScopedTests({}, currentFaculty));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmCancel = (testId) => {
    try {
      cbtTestService.cancelFacultyTest(testId, currentFaculty);
      setCancelTargetTest(null);
      showToast('Assessment cancelled successfully.');
      setRawTests(cbtTestService.getFacultyScopedTests({}, currentFaculty));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Assessments & Cohorts
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              {currentFaculty?.name || 'Dr. Siddharth V.'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Faculty Tests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Create, schedule, and manage assessments for your assigned students and subjects.
          </p>
        </div>

        <Link
          to="/faculty/tests/create"
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Test</span>
        </Link>
      </div>

      {/* 5 Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Tests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Tests</div>
            <div className="text-2xl font-black text-slate-800 mt-0.5">{stats.total}</div>
          </div>
        </div>

        {/* Draft Tests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Draft</div>
            <div className="text-2xl font-black text-slate-800 mt-0.5">{stats.draft}</div>
          </div>
        </div>

        {/* Upcoming Tests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Upcoming</div>
            <div className="text-2xl font-black text-amber-700 mt-0.5">{stats.upcoming}</div>
          </div>
        </div>

        {/* Live Now */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Live Now</div>
            <div className="text-2xl font-black text-rose-700 mt-0.5">{stats.live}</div>
          </div>
        </div>

        {/* Completed Tests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completed</div>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">{stats.completed}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assessments by title..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Exam Filter (Scoped) */}
            <select
              value={selectedExamId}
              onChange={(e) => { setSelectedExamId(e.target.value); setSelectedSubjectId('all'); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Assigned Exams</option>
              {allowedExams.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>

            {/* Subject Filter */}
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Subjects</option>
              {availableSubjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>

            {/* Test Type Filter */}
            <select
              value={selectedTestType}
              onChange={(e) => setSelectedTestType(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Test Types</option>
              {FACULTY_TEST_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Statuses</option>
              <option value={FACULTY_TEST_STATUS.DRAFT}>Draft</option>
              <option value={FACULTY_TEST_STATUS.UPCOMING}>Upcoming</option>
              <option value={FACULTY_TEST_STATUS.LIVE}>Live Now</option>
              <option value={FACULTY_TEST_STATUS.COMPLETED}>Completed</option>
              <option value={FACULTY_TEST_STATUS.CANCELLED}>Cancelled ({stats.cancelled})</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Assigned Assessments ({filteredTests.length})
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              Medical assessments within your authorized scope: <span className="text-slate-600 font-semibold">{allowedExams.map(e => e.id.toUpperCase()).join(', ')}</span>
            </p>
          </div>
        </div>

        {filteredTests.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="font-bold text-slate-800 text-sm">No assessments found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {hasActiveFilters 
                ? 'No assessments match the selected filters. Try clearing your filters.' 
                : 'You have not created any assessments for your assigned exams yet.'}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/faculty/tests/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Create First Test
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Assessment Title & Code</th>
                  <th className="pb-3">Program / Exam</th>
                  <th className="pb-3">Subject</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Scheduled Window</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3 text-center">Questions</th>
                  <th className="pb-3 text-center">Students</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTests.map((test) => {
                  const status = getNormalizedFacultyStatus(test);
                  const isDraft = status === FACULTY_TEST_STATUS.DRAFT;
                  const isUpcoming = status === FACULTY_TEST_STATUS.UPCOMING;
                  const canEdit = isDraft || isUpcoming;
                  const canCancel = isDraft || isUpcoming;

                  const exam = catalogService.getExamById(test.examId || test.examTrack || test.courseId);
                  const subject = test.subjectId ? curriculumService.getSubjectById(test.subjectId) : null;
                  const durationLabel = test.durationMinutes ? `${test.durationMinutes} min` : (test.duration || '45 min');
                  const studentCount = test.studentCount || (test.attempts ? Object.keys(test.attempts).length : '—');
                  const qCount = test.content?.questionIds?.length ?? (test.questionIds?.length || 0);
                  const targetCount = test.targetQuestions || test.totalQuestions || 25;

                  return (
                    <tr key={test.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Code */}
                      <td className="py-4 pr-3 font-bold text-slate-900">
                        <Link 
                          to={`/faculty/tests/${test.id}`}
                          className="hover:text-indigo-600 transition-colors block font-bold text-sm"
                        >
                          {test.name || test.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {test.code || test.id}
                          </span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            {test.cohort || test.batchTier || 'All Batches'}
                          </span>
                        </div>
                      </td>

                      {/* Exam */}
                      <td className="py-4 pr-3 font-semibold text-indigo-700">
                        {exam?.name || test.course || test.examTrack}
                      </td>

                      {/* Subject */}
                      <td className="py-4 pr-3 text-slate-600">
                        {subject?.name || <span className="text-slate-400 italic">Grand / Multi-topic</span>}
                      </td>

                      {/* Type & Assessment Method */}
                      <td className="py-4 pr-3">
                        <span className="text-slate-700 font-medium block">
                          {getFacultyTestTypeLabel(test.testType)}
                        </span>
                        {test.assessmentMethod && (
                          <span className="inline-block mt-0.5 text-[10px] font-medium text-slate-500">
                            {getAssessmentMethodLabel(test.assessmentMethod)}
                          </span>
                        )}
                      </td>

                      {/* Scheduled */}
                      <td className="py-4 pr-3 text-slate-600">
                        <div className="font-medium text-slate-800">
                          {test.formattedWindow || test.date || 'Scheduled'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {test.scheduling?.startTime || test.time || '18:00 IST'}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-4 pr-3 text-slate-700 font-semibold">
                        {durationLabel}
                      </td>

                      {/* Questions */}
                      <td className="py-4 pr-3 text-center">
                        <Link
                          to={`/faculty/tests/${test.id}/questions`}
                          className="hover:text-indigo-600 transition-colors inline-block"
                          title="Manage Questions"
                        >
                          <span className="font-bold text-slate-800">{qCount}</span>
                          <span className="text-[11px] text-slate-400 font-normal"> / {targetCount}</span>
                        </Link>
                      </td>

                      {/* Students */}
                      <td className="py-4 pr-3 text-center font-medium text-slate-600">
                        {studentCount}
                      </td>

                      {/* Status */}
                      <td className="py-4 pr-3">
                        <FacultyTestStatusBadge status={status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Manage Questions */}
                          <Link
                            to={`/faculty/tests/${test.id}/questions`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Manage Questions"
                          >
                            <FileText className="w-4 h-4" />
                          </Link>

                          {/* View Details */}
                          <Link
                            to={`/faculty/tests/${test.id}`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Edit (if Draft / Upcoming) */}
                          {canEdit && (
                            <Link
                              to={`/faculty/tests/${test.id}/edit`}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit Setup"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                          )}

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => handleDuplicate(test.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Duplicate Test"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Cancel (if Upcoming / Draft) */}
                          {canCancel && (
                            <button
                              type="button"
                              onClick={() => setCancelTargetTest(test)}
                              className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Cancel Assessment"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Author Questions link */}
                          <Link
                            to={`/faculty/tests/${test.id}/questions`}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-[11px] transition-colors"
                            title="Author MCQs"
                          >
                            MCQs
                          </Link>

                          {/* Ranks link */}
                          <Link
                            to={`/faculty/tests/${test.id}/results`}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition-colors"
                            title="Scorecard & Ranks"
                          >
                            Ranks
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <FacultyTestCancelModal
        test={cancelTargetTest}
        isOpen={Boolean(cancelTargetTest)}
        onClose={() => setCancelTargetTest(null)}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
}

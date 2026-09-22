import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit3, 
  Archive, 
  Copy, 
  Eye, 
  Filter, 
  X, 
  RotateCcw, 
  CheckCircle2, 
  Layers, 
  Clock, 
  HelpCircle,
  BarChart2,
  Calendar,
  Sparkles,
  ChevronRight,
  Radio,
  Play
} from 'lucide-react';
import { 
  adminTestService, 
  TEST_STATUS, 
  TEST_TYPES, 
  getTestTypeLabel,
  getAssessmentMethodLabel,
  getAssessmentMethodBadgeClass
} from '../../services/adminTestService';
import TestStatusBadge from '../../components/admin/tests/TestStatusBadge';
import TestDuplicateModal from '../../components/admin/tests/TestDuplicateModal';
import TestArchiveModal from '../../components/admin/tests/TestArchiveModal';
import ManageTestsTab from '../../components/admin/ManageTestsTab';

export default function AdminTestsPage() {
  const navigate = useNavigate();

  // Active view: 'management' (Phase 1 Test Foundation) | 'cbt-cohorts' (Legacy CBT Presets & Results)
  const [activeView, setActiveView] = useState('management');

  const [tests, setTests] = useState(() => adminTestService.getTests());
  const [summaryStats, setSummaryStats] = useState(() => adminTestService.getSummaryStats());
  const [availableExams, setAvailableExams] = useState(() => adminTestService.getAvailableExams());

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTestType, setSelectedTestType] = useState('all');

  // Modal State
  const [duplicateTargetTest, setDuplicateTargetTest] = useState(null);
  const [archiveTargetTest, setArchiveTargetTest] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Subscribe to reactive service updates
  useEffect(() => {
    const unsub = adminTestService.subscribe(() => {
      setTests(adminTestService.getTests());
      setSummaryStats(adminTestService.getSummaryStats());
      setAvailableExams(adminTestService.getAvailableExams());
    });
    return unsub;
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Filtered tests calculation
  const filteredTests = useMemo(() => {
    return adminTestService.getTests({
      search: searchQuery,
      examId: selectedExamId,
      status: selectedStatus,
      testType: selectedTestType
    });
  }, [tests, searchQuery, selectedExamId, selectedStatus, selectedTestType]);

  const hasActiveFilters = 
    searchQuery.trim() !== '' || 
    selectedExamId !== 'all' || 
    selectedStatus !== 'all' || 
    selectedTestType !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedExamId('all');
    setSelectedStatus('all');
    setSelectedTestType('all');
  };

  const handleRestoreTest = (test) => {
    try {
      adminTestService.restoreTest(test.id);
      showToast(`Restored "${test.name}" back to DRAFT.`);
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  };

  const formatFriendlyDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = 
      date.getDate() === now.getDate() && 
      date.getMonth() === now.getMonth() && 
      date.getFullYear() === now.getFullYear();

    if (isToday) return 'Today';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold animate-in slide-in-from-bottom-3 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage('')}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Test Management • Phase 1
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-400 font-bold">
              Assessment Foundation
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Test Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Create and manage medical assessments, full mocks, subject drills, and chapter evaluations linked to existing preparation exams.
          </p>
        </div>

        {/* Primary Header Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/70 text-xs font-bold">
            <button
              onClick={() => setActiveView('management')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeView === 'management'
                  ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Test Foundation
            </button>
            <button
              onClick={() => setActiveView('cbt-cohorts')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeView === 'cbt-cohorts'
                  ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CBT Attempts & Results
            </button>
          </div>

          {activeView === 'management' && (
            <Link
              to="/admin/tests/create"
              id="admin-create-test-btn"
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Test</span>
            </Link>
          )}
        </div>
      </div>

      {/* VIEW SWITCHER: CBT COHORTS VS TEST MANAGEMENT */}
      {activeView === 'cbt-cohorts' ? (
        <ManageTestsTab />
      ) : (
        <>
          {/* DASHBOARD SUMMARY CARDS (DYNAMIC METRICS) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            {[
              { 
                label: 'Total Tests', 
                count: summaryStats.total, 
                statusKey: 'all',
                icon: FileText, 
                color: 'text-indigo-600', 
                bg: 'bg-indigo-50 border-indigo-200' 
              },
              { 
                label: 'Draft', 
                count: summaryStats.draft, 
                statusKey: TEST_STATUS.DRAFT,
                icon: Edit3, 
                color: 'text-slate-600', 
                bg: 'bg-slate-100 border-slate-200' 
              },
              { 
                label: 'Published', 
                count: summaryStats.published, 
                statusKey: TEST_STATUS.PUBLISHED,
                icon: CheckCircle2, 
                color: 'text-sky-600', 
                bg: 'bg-sky-50 border-sky-200' 
              },
              { 
                label: 'Active', 
                count: summaryStats.active, 
                statusKey: TEST_STATUS.ACTIVE,
                icon: Radio, 
                color: 'text-emerald-600', 
                bg: 'bg-emerald-50 border-emerald-200' 
              },
              { 
                label: 'Archived', 
                count: summaryStats.archived, 
                statusKey: TEST_STATUS.ARCHIVED,
                icon: Archive, 
                color: 'text-rose-600', 
                bg: 'bg-rose-50 border-rose-200' 
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              const isSelected = selectedStatus === card.statusKey;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedStatus(card.statusKey)}
                  className={`text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/15 shadow-md' 
                      : 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                      {card.label}
                    </span>
                    <div className={`w-7 h-7 rounded-xl ${card.bg} border flex items-center justify-center ${card.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                    {card.count}
                  </div>
                </button>
              );
            })}
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search Input */}
              <div className="md:col-span-4 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="admin-tests-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tests by name or code..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Associated Exam Filter (from existing exams) */}
              <div className="md:col-span-3">
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="all">Exam: All Tracks</option>
                  {availableExams.map(exam => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name} ({exam.country})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="md:col-span-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="all">Status: All</option>
                  <option value={TEST_STATUS.DRAFT}>Draft</option>
                  <option value={TEST_STATUS.CONFIGURING}>Configuring</option>
                  <option value={TEST_STATUS.READY}>Ready</option>
                  <option value={TEST_STATUS.PUBLISHED}>Published</option>
                  <option value={TEST_STATUS.ACTIVE}>Active</option>
                  <option value={TEST_STATUS.COMPLETED}>Completed</option>
                  <option value={TEST_STATUS.ARCHIVED}>Archived</option>
                </select>
              </div>

              {/* Test Type Filter */}
              <div className="md:col-span-3">
                <select
                  value={selectedTestType}
                  onChange={(e) => setSelectedTestType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="all">Type: All Types</option>
                  {TEST_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Summary & Reset Action */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">
                  Showing {filteredTests.length} of {tests.length} tests
                </span>
                {hasActiveFilters && (
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    Filters Active
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* TEST TABLE (MAKING TEST != EXAM VISIBLE) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {filteredTests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-400">
                      <th className="py-3.5 px-5">Test</th>
                      <th className="py-3.5 px-4">Exam (Preparation Context)</th>
                      <th className="py-3.5 px-4">Code</th>
                      <th className="py-3.5 px-4">Test Type</th>
                      <th className="py-3.5 px-4 text-center">Target Qs</th>
                      <th className="py-3.5 px-4 text-center">Target Duration</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Last Updated</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTests.map((test) => {
                      const associatedExam = adminTestService.getExamById(test.examId);

                      return (
                        <tr 
                          key={test.id}
                          className="hover:bg-slate-50/60 transition-colors group"
                        >
                          {/* Test Name & Description */}
                          <td className="py-4 px-5 max-w-xs">
                            <Link
                              to={`/admin/tests/${test.id}`}
                              className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors block truncate"
                              title={test.name}
                            >
                              {test.name}
                            </Link>
                            {test.description && (
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {test.description}
                              </p>
                            )}
                          </td>

                          {/* Associated Exam (Test != Exam) */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70">
                              <span>{associatedExam?.name || test.examId}</span>
                            </span>
                          </td>

                          {/* Code */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/80">
                              {test.code}
                            </span>
                          </td>

                          {/* Test Type & Assessment Method */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="font-semibold text-slate-700 block">
                              {getTestTypeLabel(test.testType)}
                            </span>
                            {test.assessmentMethod && (
                              <span className="inline-block mt-0.5 text-[10px] font-medium text-slate-500">
                                {getAssessmentMethodLabel(test.assessmentMethod)}
                              </span>
                            )}
                          </td>

                          {/* Target Questions */}
                          <td className="py-4 px-4 whitespace-nowrap text-center">
                            <span className="font-extrabold text-slate-800">
                              {test.targetQuestions ? `${test.targetQuestions}` : '—'}
                            </span>
                          </td>

                          {/* Target Duration */}
                          <td className="py-4 px-4 whitespace-nowrap text-center">
                            <span className="font-extrabold text-slate-800">
                              {test.targetDuration ? `${test.targetDuration} min` : '—'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <TestStatusBadge status={test.status} />
                          </td>

                          {/* Last Updated */}
                          <td className="py-4 px-4 whitespace-nowrap text-slate-500 font-medium">
                            {formatFriendlyDate(test.updatedAt || test.createdAt)}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Preview Assessment */}
                              <Link
                                to={`/admin/tests/${test.id}/preview`}
                                title="Preview Assessment"
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                              >
                                <Play className="w-4 h-4" />
                              </Link>

                              {/* View / Configure Workspace */}
                              <Link
                                to={`/admin/tests/${test.id}`}
                                title="Open Test Setup Workspace"
                                className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>

                              {/* Edit */}
                              <Link
                                to={`/admin/tests/${test.id}/edit`}
                                title="Edit Test"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Link>

                              {/* Duplicate */}
                              <button
                                onClick={() => setDuplicateTargetTest(test)}
                                title="Duplicate Test"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              {/* Archive / Restore */}
                              {test.status === TEST_STATUS.ARCHIVED ? (
                                <button
                                  onClick={() => handleRestoreTest(test)}
                                  title="Restore Test from Archive"
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => setArchiveTargetTest(test)}
                                  title="Archive Test"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                >
                                  <Archive className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* EMPTY STATE */
              <div className="py-16 px-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <FileText className="w-7 h-7" />
                </div>

                {hasActiveFilters ? (
                  <div className="space-y-2 max-w-sm mx-auto">
                    <h3 className="text-base font-black text-slate-900">
                      No tests match your search or filters.
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Try selecting a different exam, clearing search keywords, or resetting filters.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={handleResetFilters}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-w-sm mx-auto">
                    <h3 className="text-base font-black text-slate-900">
                      No tests found
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Create your first test to start building assessments.
                    </p>
                    <div className="pt-2">
                      <Link
                        to="/admin/tests/create"
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Create Test</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DUPLICATE MODAL */}
          <TestDuplicateModal
            isOpen={Boolean(duplicateTargetTest)}
            test={duplicateTargetTest}
            onClose={() => setDuplicateTargetTest(null)}
            onDuplicateSuccess={(newTest) => {
              showToast(`Successfully duplicated "${newTest.name}".`);
            }}
          />

          {/* ARCHIVE MODAL */}
          <TestArchiveModal
            isOpen={Boolean(archiveTargetTest)}
            test={archiveTargetTest}
            onClose={() => setArchiveTargetTest(null)}
            onArchiveSuccess={(archived) => {
              showToast(`Archived "${archived.name}".`);
            }}
          />
        </>
      )}
    </div>
  );
}

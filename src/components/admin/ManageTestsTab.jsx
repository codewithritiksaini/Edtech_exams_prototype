import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  X, 
  Award, 
  TrendingUp, 
  AlertCircle, 
  Layers,
  HelpCircle,
  BarChart2
} from 'lucide-react';
import { authService, USER_ROLES } from '../../services/authService';
import { catalogService } from '../../services/catalogService';
import { testService, initialCohortTestResults } from '../../data/mockData';

export default function ManageTestsTab() {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [activeCatalogExams, setActiveCatalogExams] = useState(() => catalogService.getActiveExams());

  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;
  const isFaculty = currentUser?.role === USER_ROLES.FACULTY;
  const facultyAllowedExams = ['neet-pg', 'usmle'];

  // Scoped Exams: Admin sees all; Faculty sees only assigned
  const availableExams = isAdmin 
    ? activeCatalogExams 
    : activeCatalogExams.filter(e => facultyAllowedExams.includes(e.id));

  // ---------------------------------------------------------------------------
  // Form State
  // ---------------------------------------------------------------------------
  const [formExam, setFormExam] = useState(() => availableExams[0]?.id || 'neet-pg');
  const [formTestName, setFormTestName] = useState('');
  const [formBatch, setFormBatch] = useState('All Enrolled Students');
  const [formDate, setFormDate] = useState('2026-09-12');
  const [formTime, setFormTime] = useState('18:00');
  const [formDuration, setFormDuration] = useState('1 hour');
  const [formTotalMarks, setFormTotalMarks] = useState(100);
  const [formQuestions, setFormQuestions] = useState(25);

  // ---------------------------------------------------------------------------
  // Filter & List State
  // ---------------------------------------------------------------------------
  const [examFilter, setExamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [allTests, setAllTests] = useState(() => testService.getAllTests());

  // Modals & Toast
  const [toastMessage, setToastMessage] = useState('');
  const [selectedCohortTest, setSelectedCohortTest] = useState(null);
  const [cohortSearch, setCohortSearch] = useState('');

  // Sync testService
  useEffect(() => {
    const unsubscribe = testService.subscribe((updatedTests) => {
      setAllTests(updatedTests);
    });
    return unsubscribe;
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Schedule Test Handler
  const handleScheduleTest = (e) => {
    e.preventDefault();
    if (!formTestName.trim()) {
      alert('Please enter an assessment title.');
      return;
    }

    const selectedExamObj = availableExams.find(e => e.id === formExam);
    const created = testService.addTest({
      name: formTestName.trim(),
      courseId: formExam,
      course: selectedExamObj?.name || 'NEET PG & NExT 2026',
      batch: formBatch,
      dateTime: `${formDate} @ ${formTime} IST`,
      duration: formDuration,
      totalQuestions: Number(formQuestions),
      totalMarks: Number(formTotalMarks)
    });

    setFormTestName('');
    showToast(`✅ CBT Assessment "${created.name}" published! Visible on eligible Student Dashboards.`);
  };

  // Cancel Test Handler
  const handleCancelTest = (test) => {
    if (confirm(`Are you sure you want to cancel "${test.name}"?`)) {
      const remaining = allTests.filter(t => t.id !== test.id);
      try {
        localStorage.setItem('medprep_phase6_tests', JSON.stringify(remaining));
        window.dispatchEvent(new CustomEvent('medprep-tests-updated', { detail: remaining }));
      } catch (err) {
        console.warn('Cancel test err:', err);
      }
      showToast(`Test "${test.name}" cancelled.`);
    }
  };

  // Filtered Tests
  const filteredTests = allTests.filter(t => {
    if (isFaculty && !facultyAllowedExams.includes(t.courseId)) {
      return false;
    }
    if (examFilter !== 'all' && t.courseId !== examFilter) {
      return false;
    }
    if (statusFilter !== 'all' && t.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Selected Cohort Results Data
  const cohortResults = selectedCohortTest ? testService.getCohortResults(selectedCohortTest.id) : null;
  const submissionsList = cohortResults?.submissions || [
    { id: 'sub-1', candidateName: 'Dr. Ritik Saini', rollNo: 'MED-2026-904', score: 94, totalMarks: 100, percentage: 94, timeTaken: '32m 14s', status: 'Pass', submittedAt: 'Yesterday, 19:42 IST', isCurrentStudent: true },
    { id: 'sub-2', candidateName: 'Dr. Priya Sharma', rollNo: 'MED-2026-112', score: 88, totalMarks: 100, percentage: 88, timeTaken: '38m 10s', status: 'Pass', submittedAt: 'Yesterday, 19:48 IST', isCurrentStudent: false },
    { id: 'sub-3', candidateName: 'Dr. Aarav Patel', rollNo: 'MED-2026-309', score: 78, totalMarks: 100, percentage: 78, timeTaken: '44m 20s', status: 'Pass', submittedAt: 'Yesterday, 19:54 IST', isCurrentStudent: false },
    { id: 'sub-4', candidateName: 'Dr. Sunita Rao', rollNo: 'MED-2026-224', score: 62, totalMarks: 100, percentage: 62, timeTaken: '45m 00s', status: 'Pass', submittedAt: 'Yesterday, 19:55 IST', isCurrentStudent: false },
    { id: 'sub-5', candidateName: 'Dr. Vikram Malhotra', rollNo: 'MED-2026-581', score: 36, totalMarks: 100, percentage: 36, timeTaken: '24m 10s', status: 'Fail', submittedAt: 'Yesterday, 19:35 IST', isCurrentStudent: false }
  ];

  const filteredSubmissions = submissionsList.filter(s => 
    s.candidateName.toLowerCase().includes(cohortSearch.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(cohortSearch.toLowerCase())
  );

  const selectedExamName = availableExams.find(e => e.id === formExam)?.name || formExam;

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold shadow-xs transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Rule 9 Enforced: Batch & Tier-Scoped CBT Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manage Tests & Mock Assessments
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Schedule proctored CBT mock exams, target by package tier/batch, and analyze cohort pass rates and rank distributions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isFaculty && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Faculty Scoped
              </span>
            )}
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {filteredTests.length} Assessments Active
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* PART B.1: CREATE TEST FORM                                          */}
        {/* ------------------------------------------------------------------- */}
        <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Schedule New Mock Examination</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-200">
              Proctored CBT Mode (Phase 6 Engine)
            </span>
          </div>

          <form onSubmit={handleScheduleTest} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Target Exam Course *</span>
                  {isFaculty && <span className="text-[10px] text-emerald-700 font-bold">Scoped</span>}
                </label>
                <select
                  value={formExam}
                  onChange={(e) => setFormExam(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {availableExams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.flag} {exam.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700">Test Title / Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiology Grand Mock Test 1 — ECG, Arrhythmias & ACLS"
                  value={formTestName}
                  onChange={(e) => setFormTestName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
                />
              </div>
            </div>

            {/* Batch & Tier Scoping (Rule 9) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Applicable Tier / Cohort (Rule 9) *</label>
                <select
                  value={formBatch}
                  onChange={(e) => setFormBatch(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white focus:outline-none"
                >
                  <option value="All Enrolled Students">All Enrolled Candidates (Basic, Standard & Premium)</option>
                  <option value="Standard & Premium Only">Standard & Premium Tiers Only</option>
                  <option value="All Premium Students">Premium VIP Candidates Only</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Test Date *</label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Start Time (IST) *</label>
                <input
                  type="time"
                  required
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Duration, Marks, Questions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Exam Duration *</label>
                <select
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white focus:outline-none"
                >
                  <option value="30 mins">30 Minutes (Sprint Drill)</option>
                  <option value="45 mins">45 Minutes</option>
                  <option value="1 hour">1 Hour</option>
                  <option value="1.5 hours">1.5 Hours</option>
                  <option value="2 hours">2 Hours (Standard Mini-Mock)</option>
                  <option value="3 hours">3 Hours (Full Grand CBT)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Total Marks</label>
                <input
                  type="number"
                  value={formTotalMarks}
                  onChange={(e) => setFormTotalMarks(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Number of Questions</label>
                <input
                  type="number"
                  value={formQuestions}
                  onChange={(e) => setFormQuestions(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Helper Note Banner */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-950 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Scoping Rule 9:</span> This test will be visible only to <strong>{formBatch}</strong> of <strong>{selectedExamName}</strong> on their Student Dashboard's <em>"Upcoming Test"</em> card. Questions are linked to the MedPrep Clinical Question Bank.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer text-xs"
              >
                <FileText className="w-4 h-4" />
                <span>Schedule Proctored CBT Test</span>
              </button>
            </div>

          </form>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* PART B.2: SCHEDULED TESTS LIST / TABLE                               */}
        {/* ------------------------------------------------------------------- */}
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Scheduled Assessment Roster</h3>
              <p className="text-xs text-slate-500">Live assessments synchronized with student CBT test room</p>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 font-semibold">
                <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                <select
                  value={examFilter}
                  onChange={(e) => setExamFilter(e.target.value)}
                  className="bg-transparent text-slate-700 font-bold px-2 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Exam Tracks</option>
                  {availableExams.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 font-semibold">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-slate-700 font-bold px-2 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="Scheduled">Scheduled / Upcoming</option>
                  <option value="Completed">Completed Assessments</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3.5 px-4">Test Title</th>
                  <th className="py-3.5 px-4">Exam Track</th>
                  <th className="py-3.5 px-4">Applicable Batch</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Format & Duration</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No assessments found matching the active filters.
                    </td>
                  </tr>
                ) : (
                  filteredTests.map((test) => (
                    <tr key={test.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{test.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{test.id}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">
                          {test.course || test.courseId.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {test.batch}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{test.date}</div>
                        <div className="text-[11px] font-mono text-slate-500">{test.time}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {test.questionsCount || test.totalQuestions || 20} Qs • {test.duration}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          test.status === 'Completed'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {test.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedCohortTest(test)}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors cursor-pointer text-xs inline-flex items-center gap-1"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                          <span>View Results</span>
                        </button>
                        <button
                          onClick={() => handleCancelTest(test)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Cancel Assessment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* ------------------------------------------------------------------- */}
      {/* PART B.3: TEST RESULTS MODAL (FOR COMPLETED / ACTIVE TESTS)         */}
      {/* ------------------------------------------------------------------- */}
      {selectedCohortTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-4xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Cohort Evaluation & Score Analytics
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {selectedCohortTest.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Track: {selectedCohortTest.course || selectedCohortTest.courseId.toUpperCase()} • Batch: {selectedCohortTest.batch} • Duration: {selectedCohortTest.duration}
                </p>
              </div>
              <button
                onClick={() => setSelectedCohortTest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-0.5">
                <div className="text-xs text-slate-500 font-semibold">Average Score</div>
                <div className="text-xl font-black text-slate-900">76.4 / 100</div>
                <span className="text-[10px] text-slate-400">Mean cohort score</span>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-0.5">
                <div className="text-xs text-slate-500 font-semibold">Highest Score</div>
                <div className="text-xl font-black text-emerald-600">96 / 100</div>
                <span className="text-[10px] text-emerald-700 font-bold">Dr. Ritik Saini</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-0.5">
                <div className="text-xs text-slate-500 font-semibold">Students Attempted</div>
                <div className="text-xl font-black text-indigo-600">388 / 450</div>
                <span className="text-[10px] text-indigo-700 font-bold">86.2% Turnout</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-0.5">
                <div className="text-xs text-slate-500 font-semibold">Pass Percentage</div>
                <div className="text-xl font-black text-brand-600">89.2%</div>
                <span className="text-[10px] text-slate-400">Cutoff: 40%</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-grow max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by student name or roll..."
                  value={cohortSearch}
                  onChange={(e) => setCohortSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                Showing {filteredSubmissions.length} candidate scores
              </span>
            </div>

            {/* Candidate Submissions Roster */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                    <th className="py-2.5 px-3">Candidate</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Percentage</th>
                    <th className="py-2.5 px-3">Time Taken</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubmissions.map((sub, idx) => (
                    <tr key={sub.id || idx} className={`hover:bg-slate-50/80 ${sub.isCurrentStudent ? 'bg-indigo-50/40' : ''}`}>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{sub.candidateName}</span>
                          {sub.isCurrentStudent && (
                            <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded-md">
                              Logged-in Student
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">{sub.rollNo}</div>
                      </td>

                      <td className="py-3 px-3 font-bold text-slate-900">
                        {sub.score} / {sub.totalMarks || 100}
                      </td>

                      <td className="py-3 px-3 font-bold text-indigo-700">
                        {sub.percentage}%
                      </td>

                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                        {sub.timeTaken}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          sub.status === 'Pass'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {sub.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {sub.submittedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCohortTest(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

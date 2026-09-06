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
  BarChart2,
  ListOrdered,
  PlusCircle,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Edit3
} from 'lucide-react';
import { authService, USER_ROLES } from '../../services/authService';
import { catalogService } from '../../services/catalogService';
import { testService, initialCohortTestResults, sampleCbtQuestionBank } from '../../data/mockData';

const samplePresetQuestions = [
  {
    id: 'pq-1',
    vignette: 'A 62-year-old male with a history of hypertension and smoking presents to the emergency department with severe, crushing substernal chest pain radiating to his left jaw and arm for 90 minutes. ECG reveals 3 mm ST-segment elevation in leads V2-V5 with reciprocal ST depression in leads II, III, and aVF.',
    question: 'Which coronary artery is most likely occluded in this patient, and what is the definitive immediate reperfusion therapy of choice?',
    options: [
      { key: 'A', text: 'Left Anterior Descending (LAD) artery; Primary Percutaneous Coronary Intervention (PCI)' },
      { key: 'B', text: 'Right Coronary Artery (RCA); Intravenous Beta-blocker infusion' },
      { key: 'C', text: 'Left Circumflex (LCx) artery; Emergent Coronary Artery Bypass Grafting (CABG)' },
      { key: 'D', text: 'Left Main Coronary Artery; High-dose sublingual Nitroglycerin' }
    ],
    correct: 'A',
    explanation: 'ST elevation in leads V2-V5 indicates an acute anterior/anteroseptal STEMI, typically caused by occlusion of the Left Anterior Descending (LAD) coronary artery. The preferred guideline-directed reperfusion strategy is emergent Primary PCI performed within 90 minutes of medical contact.'
  },
  {
    id: 'pq-2',
    vignette: 'A 55-year-old female with long-standing poorly controlled type 2 diabetes presents with gradual onset of burning pain, numbness, and tingling in both feet in a "stocking" distribution. Physical examination shows decreased sensation to light touch, pinprick, and vibration over both lower extremities bilaterally.',
    question: 'What is the first-line pharmacotherapeutic agent approved for the symptomatic management of painful diabetic peripheral neuropathy?',
    options: [
      { key: 'A', text: 'Duloxetine or Pregabalin' },
      { key: 'B', text: 'Oral Prednisone pulse therapy' },
      { key: 'C', text: 'High-dose Indomethacin' },
      { key: 'D', text: 'Metformin titration' }
    ],
    correct: 'A',
    explanation: 'First-line FDA and ADA approved agents for painful diabetic peripheral neuropathy include SNRIs (such as Duloxetine) and Gabapentinoids (such as Pregabalin or Gabapentin). NSAIDs and corticosteroids are not effective for neuropathic pain.'
  },
  {
    id: 'pq-3',
    vignette: 'A 4-year-old boy is brought to the pediatric clinic with a 3-day history of high fever (39.5°C), barking cough, inspiratory stridor, and hoarseness. Symptoms worsen at night. An anteroposterior soft-tissue neck radiograph reveals classic subglottic narrowing known as the "steeple sign".',
    question: 'What is the most common etiology of this condition (Croup / Laryngotracheobronchitis), and what is the primary initial medical treatment for moderate-to-severe stridor?',
    options: [
      { key: 'A', text: 'Parainfluenza virus type 1; Single-dose oral/IM Dexamethasone plus Nebulized Epinephrine' },
      { key: 'B', text: 'Haemophilus influenzae type b; Intravenous Ceftriaxone' },
      { key: 'C', text: 'Respiratory Syncytial Virus (RSV); Inhaled Albuterol' },
      { key: 'D', text: 'Bordetella pertussis; Oral Azithromycin for 5 days' }
    ],
    correct: 'A',
    explanation: 'Croup (laryngotracheobronchitis) is most frequently caused by Parainfluenza virus type 1 (~75% of cases). The subglottic tracheal edema manifests as the steeple sign. Treatment of choice for moderate-to-severe croup is a single dose of oral or intramuscular Dexamethasone (0.6 mg/kg) along with nebulized racemic epinephrine for rapid reduction of mucosal edema.'
  }
];

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

  // Question Composer in Creation Form
  const [formQuestionsList, setFormQuestionsList] = useState([]);
  const [showQuestionComposer, setShowQuestionComposer] = useState(false);
  const [composerVignette, setComposerVignette] = useState('');
  const [composerQuestion, setComposerQuestion] = useState('');
  const [composerOptA, setComposerOptA] = useState('');
  const [composerOptB, setComposerOptB] = useState('');
  const [composerOptC, setComposerOptC] = useState('');
  const [composerOptD, setComposerOptD] = useState('');
  const [composerCorrect, setComposerCorrect] = useState('A');
  const [composerExplanation, setComposerExplanation] = useState('');

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

  // Questions Manager Modal for existing tests
  const [editingQuestionsTest, setEditingQuestionsTest] = useState(null);
  const [modalQuestionsList, setModalQuestionsList] = useState([]);
  const [showModalComposer, setShowModalComposer] = useState(false);
  const [modalVignette, setModalVignette] = useState('');
  const [modalQuestion, setModalQuestion] = useState('');
  const [modalOptA, setModalOptA] = useState('');
  const [modalOptB, setModalOptB] = useState('');
  const [modalOptC, setModalOptC] = useState('');
  const [modalOptD, setModalOptD] = useState('');
  const [modalCorrect, setModalCorrect] = useState('A');
  const [modalExplanation, setModalExplanation] = useState('');

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

  // Add question to creation form draft
  const handleAddQuestionToForm = (e) => {
    e.preventDefault();
    if (!composerQuestion.trim() || !composerOptA.trim() || !composerOptB.trim()) {
      alert('Please fill out the question text and at least Options A and B.');
      return;
    }

    const newQ = {
      id: `fq-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      vignette: composerVignette.trim(),
      question: composerQuestion.trim(),
      options: [
        { key: 'A', text: composerOptA.trim() },
        { key: 'B', text: composerOptB.trim() },
        { key: 'C', text: composerOptC.trim() || 'None of the above' },
        { key: 'D', text: composerOptD.trim() || 'All of the above' }
      ],
      correct: composerCorrect,
      explanation: composerExplanation.trim() || 'Standard clinical guideline justification.'
    };

    const updated = [...formQuestionsList, newQ];
    setFormQuestionsList(updated);
    setFormQuestions(updated.length);
    // Reset composer inputs
    setComposerVignette('');
    setComposerQuestion('');
    setComposerOptA('');
    setComposerOptB('');
    setComposerOptC('');
    setComposerOptD('');
    setComposerExplanation('');
    showToast(`Added Question #${updated.length} to assessment draft!`);
  };

  const handleLoadSamplePresetToForm = () => {
    setFormQuestionsList(samplePresetQuestions);
    setFormQuestions(samplePresetQuestions.length);
    showToast('Loaded 3 sample high-yield clinical vignette questions!');
  };

  const handleRemoveFormQuestion = (id) => {
    const updated = formQuestionsList.filter(q => q.id !== id);
    setFormQuestionsList(updated);
    setFormQuestions(updated.length > 0 ? updated.length : 25);
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
      totalQuestions: formQuestionsList.length > 0 ? formQuestionsList.length : Number(formQuestions),
      totalMarks: Number(formTotalMarks),
      questions: formQuestionsList
    });

    setFormTestName('');
    setFormQuestionsList([]);
    setShowQuestionComposer(false);
    showToast(`✅ CBT Assessment "${created.name}" published with ${created.questionsCount} questions! Visible on Student Dashboards.`);
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

  // Open Questions Manager for an existing test
  const handleOpenQuestionsModal = (test) => {
    setEditingQuestionsTest(test);
    if (test.questions && Array.isArray(test.questions) && test.questions.length > 0) {
      setModalQuestionsList(test.questions);
    } else if (test.id === 'test-cardio-01') {
      setModalQuestionsList(sampleCbtQuestionBank);
    } else {
      setModalQuestionsList([]);
    }
    setShowModalComposer(false);
  };

  const handleAddModalQuestion = (e) => {
    e.preventDefault();
    if (!modalQuestion.trim() || !modalOptA.trim() || !modalOptB.trim()) {
      alert('Please provide the question and at least Options A & B.');
      return;
    }

    const newQ = {
      id: `mq-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      vignette: modalVignette.trim(),
      question: modalQuestion.trim(),
      options: [
        { key: 'A', text: modalOptA.trim() },
        { key: 'B', text: modalOptB.trim() },
        { key: 'C', text: modalOptC.trim() || 'None of the above' },
        { key: 'D', text: modalOptD.trim() || 'All of the above' }
      ],
      correct: modalCorrect,
      explanation: modalExplanation.trim() || 'Clinical reasoning rationale.'
    };

    const updated = [...modalQuestionsList, newQ];
    setModalQuestionsList(updated);
    setModalVignette('');
    setModalQuestion('');
    setModalOptA('');
    setModalOptB('');
    setModalOptC('');
    setModalOptD('');
    setModalExplanation('');
    setShowModalComposer(false);

    // Save immediately
    testService.updateTestQuestions(editingQuestionsTest.id, updated);
    showToast(`Added question #${updated.length} to ${editingQuestionsTest.name}!`);
  };

  const handleDeleteModalQuestion = (id) => {
    const updated = modalQuestionsList.filter(q => q.id !== id);
    setModalQuestionsList(updated);
    testService.updateTestQuestions(editingQuestionsTest.id, updated);
    showToast(`Question removed from assessment.`);
  };

  const handleSeedModalQuestions = () => {
    setModalQuestionsList(samplePresetQuestions);
    testService.updateTestQuestions(editingQuestionsTest.id, samplePresetQuestions);
    showToast(`Seeded 3 clinical questions into ${editingQuestionsTest.name}!`);
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

            {/* Question Authoring & Syllabus Content Builder */}
            <div className="border border-slate-200 rounded-2xl bg-white p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900 text-xs">
                    Assessment Questions & Clinical Vignettes ({formQuestionsList.length} Drafted)
                  </span>
                  {formQuestionsList.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Active Questions
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSamplePresetToForm}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 transition-colors text-[11px] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>⚡ Load 3 High-Yield Questions</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuestionComposer(!showQuestionComposer)}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 transition-colors text-[11px] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3 h-3 text-emerald-600" />
                    <span>{showQuestionComposer ? 'Hide Composer' : '+ Author Question'}</span>
                  </button>
                </div>
              </div>

              {/* Collapsible Question Composer Form */}
              {showQuestionComposer && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 animate-in fade-in">
                  <div className="text-[11px] font-bold text-slate-700">
                    Draft New Clinical MCQ (Single Best Answer)
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">
                      Clinical Vignette / Patient Presentation (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. A 45-year-old male with acute retrosternal chest pain and diaphoresis..."
                      value={composerVignette}
                      onChange={(e) => setComposerVignette(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Question Prompt / Interrogative Statement *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Which of the following is the most appropriate initial diagnostic investigation?"
                      value={composerQuestion}
                      onChange={(e) => setComposerQuestion(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { key: 'A', val: composerOptA, set: setComposerOptA },
                      { key: 'B', val: composerOptB, set: setComposerOptB },
                      { key: 'C', val: composerOptC, set: setComposerOptC },
                      { key: 'D', val: composerOptD, set: setComposerOptD }
                    ].map(({ key, val, set }) => (
                      <div key={key} className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200">
                        <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-700 text-xs shrink-0 px-1">
                          <input
                            type="radio"
                            name="composerCorrect"
                            checked={composerCorrect === key}
                            onChange={() => setComposerCorrect(key)}
                            className="accent-emerald-600 cursor-pointer"
                          />
                          <span>{key}:</span>
                        </label>
                        <input
                          type="text"
                          placeholder={`Option ${key} text`}
                          value={val}
                          onChange={(e) => set(e.target.value)}
                          className="w-full text-xs font-medium text-slate-900 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    * Select the radio button corresponding to the correct answer.
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">
                      Clinical Explanation & Reference Rationale
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Why is this answer correct? Provide the underlying pathophysiology or guideline reference..."
                      value={composerExplanation}
                      onChange={(e) => setComposerExplanation(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddQuestionToForm}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Question to Test Draft</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Drafted Questions List */}
              {formQuestionsList.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {formQuestionsList.map((q, idx) => (
                    <div key={q.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                            Q{idx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            Correct: Option {q.correct}
                          </span>
                        </div>
                        {q.vignette && (
                          <p className="text-[11px] text-slate-600 italic line-clamp-1">
                            {q.vignette}
                          </p>
                        )}
                        <p className="font-bold text-slate-900">
                          {q.question}
                        </p>
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 pt-0.5">
                          {q.options.map(opt => (
                            <span key={opt.key} className={opt.key === q.correct ? 'font-bold text-emerald-700' : ''}>
                              <strong>{opt.key}:</strong> {opt.text}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFormQuestion(q.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Remove Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl text-center text-slate-400 text-xs">
                  No custom questions drafted yet. If left blank, the assessment automatically uses the MedPrep Clinical Question Bank. Click <strong>"+ Author Question"</strong> or <strong>"⚡ Load 3 High-Yield Questions"</strong> to customize.
                </div>
              )}
            </div>

            {/* Helper Note Banner */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-950 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Scoping Rule 9:</span> This test will be visible only to <strong>{formBatch}</strong> of <strong>{selectedExamName}</strong> on their Student Dashboard's <em>"Upcoming Test"</em> card. Questions will be delivered via the Computer Based Test (CBT) engine.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer text-xs"
              >
                <FileText className="w-4 h-4" />
                <span>Schedule Proctored CBT Test ({formQuestionsList.length > 0 ? formQuestionsList.length : formQuestions} Qs)</span>
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
                          onClick={() => handleOpenQuestionsModal(test)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 transition-colors cursor-pointer text-xs inline-flex items-center gap-1"
                          title="Manage Questions & Clinical Scenarios"
                        >
                          <ListOrdered className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Questions ({test.questions?.length || (test.id === 'test-cardio-01' ? 20 : test.questionsCount || 0)})</span>
                        </button>
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

      {/* ------------------------------------------------------------------- */}
      {/* PART B.4: MANAGE ASSESSMENT QUESTIONS MODAL (FACULTY / ADMIN)       */}
      {/* ------------------------------------------------------------------- */}
      {editingQuestionsTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-4xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <ListOrdered className="w-3.5 h-3.5" />
                    <span>CBT Question Bank Manager</span>
                  </span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {modalQuestionsList.length} Questions
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {editingQuestionsTest.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Track: {editingQuestionsTest.course || editingQuestionsTest.courseId.toUpperCase()} • Batch: {editingQuestionsTest.batch} • Passing Criteria: 50%
                </p>
              </div>

              <button
                onClick={() => setEditingQuestionsTest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="text-xs text-slate-600">
                All questions configured here appear directly in the student's live proctored CBT examination interface.
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSeedModalQuestions}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl border border-amber-200 text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>⚡ Seed Preset Questions</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowModalComposer(!showModalComposer)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{showModalComposer ? 'Hide Form' : '+ Add Question'}</span>
                </button>
              </div>
            </div>

            {/* Modal Composer (Add New Question) */}
            {showModalComposer && (
              <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in">
                <div className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Author New Clinical Vignette MCQ</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Clinical Vignette / Case Background (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. A 28-year-old primigravida at 34 weeks gestation presents with acute onset headache, visual blurriness, and RUQ pain..."
                    value={modalVignette}
                    onChange={(e) => setModalVignette(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    Question Prompt *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. What is the most immediate life-saving medical therapy indicated?"
                    value={modalQuestion}
                    onChange={(e) => setModalQuestion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: 'A', val: modalOptA, set: setModalOptA },
                    { key: 'B', val: modalOptB, set: setModalOptB },
                    { key: 'C', val: modalOptC, set: setModalOptC },
                    { key: 'D', val: modalOptD, set: setModalOptD }
                  ].map(({ key, val, set }) => (
                    <div key={key} className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200">
                      <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800 text-xs shrink-0 px-1">
                        <input
                          type="radio"
                          name="modalCorrectRadio"
                          checked={modalCorrect === key}
                          onChange={() => setModalCorrect(key)}
                          className="accent-emerald-600 cursor-pointer"
                        />
                        <span>{key}:</span>
                      </label>
                      <input
                        type="text"
                        placeholder={`Option ${key} text`}
                        value={val}
                        onChange={(e) => set(e.target.value)}
                        className="w-full text-xs font-medium text-slate-900 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-[10px] text-slate-500">
                  * Select the radio button corresponding to the correct answer.
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Clinical Explanation / Rationale
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Comprehensive explanation of correct choice and review of distractors..."
                    value={modalExplanation}
                    onChange={(e) => setModalExplanation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowModalComposer(false)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddModalQuestion}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Question to Assessment</span>
                  </button>
                </div>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-3">
              <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                <span>Assessment Items ({modalQuestionsList.length})</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Auto-saved to CBT Test Series Engine
                </span>
              </div>

              {modalQuestionsList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
                  <p>No questions currently linked to this assessment.</p>
                  <button
                    type="button"
                    onClick={handleSeedModalQuestions}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-200 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Seed High-Yield Preset Questions</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1 divide-y divide-slate-100">
                  {modalQuestionsList.map((q, idx) => (
                    <div key={q.id || idx} className="pt-3 first:pt-0 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-grow">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                              Question {idx + 1}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              Correct Option: {q.correct}
                            </span>
                          </div>

                          {q.vignette && (
                            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 italic leading-relaxed">
                              {q.vignette}
                            </p>
                          )}

                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            {q.question}
                          </h4>

                          {/* Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                            {q.options?.map((opt) => {
                              const isCorrect = opt.key === q.correct;
                              return (
                                <div
                                  key={opt.key}
                                  className={`p-2 rounded-xl text-xs flex items-center gap-2 border ${
                                    isCorrect
                                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold'
                                      : 'bg-white border-slate-200 text-slate-700'
                                  }`}
                                >
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                    isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {opt.key}
                                  </span>
                                  <span className="text-[11px] leading-tight">{opt.text}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation Box */}
                          {q.explanation && (
                            <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-[11px] text-indigo-950 mt-1.5">
                              <span className="font-bold text-indigo-900 block mb-0.5">Guideline Rationale:</span>
                              {q.explanation}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteModalQuestion(q.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0 mt-0.5"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-400">
                Changes persist immediately to local storage and CBT test engine.
              </span>
              <button
                type="button"
                onClick={() => setEditingQuestionsTest(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Done Managing Questions
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

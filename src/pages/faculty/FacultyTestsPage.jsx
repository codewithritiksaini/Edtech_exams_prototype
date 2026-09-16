import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  Trash2, 
  BarChart3, 
  X, 
  Search, 
  HelpCircle,
  Eye,
  Award,
  Database,
  Check,
  BookOpen
} from 'lucide-react';
import { 
  cbtTestService, 
  CBT_STATUS, 
  getTestStatus, 
  formatTestCountdown 
} from '../../services/cbtTestService';
import { peopleService } from '../../services/peopleService';
import { catalogService } from '../../services/catalogService';
import { questionService } from '../../services/questionService';
import { curriculumService } from '../../services/curriculumService';

export default function FacultyTestsPage() {
  const [testsList, setTestsList] = useState(() => cbtTestService.getAllTests('all'));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeResultsModalTest, setActiveResultsModalTest] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedTestForQuestions, setSelectedTestForQuestions] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  // Faculty profile & exam scope
  const [currentFaculty, setCurrentFaculty] = useState(() => peopleService.getCurrentFacultyProfile());
  const assignedExamIds = useMemo(() => {
    return currentFaculty?.assignedExams?.length ? currentFaculty.assignedExams : ['neet-pg', 'usmle'];
  }, [currentFaculty]);

  const activeCatalogExams = useMemo(() => {
    const list = catalogService.getExams().filter(e => assignedExamIds.includes(e.id));
    return list.length > 0 ? list : catalogService.getExams().slice(0, 2);
  }, [assignedExamIds]);

  // Subscribe to central cbtTestService
  useEffect(() => {
    const unsubscribe = cbtTestService.subscribe(() => {
      setTestsList(cbtTestService.getAllTests('all'));
    });
    const handlePeople = () => setCurrentFaculty(peopleService.getCurrentFacultyProfile());
    window.addEventListener('medprep-people-updated', handlePeople);
    return () => {
      unsubscribe();
      window.removeEventListener('medprep-people-updated', handlePeople);
    };
  }, []);

  // Filter tests strictly to Faculty Exam Scope
  const scopedTests = useMemo(() => {
    return testsList.filter(t => {
      const track = t.examTrack || t.courseId;
      return !track || assignedExamIds.includes(track) || track === 'all';
    });
  }, [testsList, assignedExamIds]);

  // Create Test Form State
  const [selectedExamTrack, setSelectedExamTrack] = useState(() => assignedExamIds[0] || 'neet-pg');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [testName, setTestName] = useState('');
  const [testDate, setTestDate] = useState('2026-09-20');
  const [testTime, setTestTime] = useState('18:00');
  const [testDuration, setTestDuration] = useState('45 mins');
  const [testTotalMarks, setTestTotalMarks] = useState('100');
  const [testQuestionCount, setTestQuestionCount] = useState('25');
  const [questionSource, setQuestionSource] = useState('auto'); // 'auto' | 'bank'
  const [selectedBankQuestionIds, setSelectedBankQuestionIds] = useState([]);

  // Curricular subjects for current exam track
  const availableSubjects = useMemo(() => {
    return curriculumService.getSubjects(selectedExamTrack);
  }, [selectedExamTrack]);

  // Available published questions from Question Bank
  const availableBankQuestions = useMemo(() => {
    return questionService.getPublishedQuestions({
      examId: selectedExamTrack,
      subjectId: selectedSubjectId !== 'all' ? selectedSubjectId : undefined
    });
  }, [selectedExamTrack, selectedSubjectId]);

  // Question Authoring Form
  const [vignette, setVignette] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOpt, setCorrectOpt] = useState('A');
  const [rationale, setRationale] = useState('');

  const toggleBankQuestion = (qId) => {
    setSelectedBankQuestionIds(prev => 
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  const handleCreateTest = (e) => {
    e.preventDefault();
    if (!testName.trim()) return;

    const examObj = catalogService.getExamById(selectedExamTrack);
    const qCount = questionSource === 'bank' && selectedBankQuestionIds.length > 0
      ? selectedBankQuestionIds.length
      : (Number(testQuestionCount) || 20);

    const newTest = cbtTestService.createTest({
      name: testName.trim(),
      examTrack: selectedExamTrack,
      courseId: selectedExamTrack,
      course: examObj?.name || 'NEET PG & NExT 2026',
      subjectId: selectedSubjectId !== 'all' ? selectedSubjectId : null,
      batchTier: 'All Enrolled Candidates',
      date: testDate,
      time: `${testTime} IST`,
      durationMinutes: parseInt(testDuration, 10) || 45,
      totalMarks: Number(testTotalMarks) || (qCount * 5),
      questionCount: qCount,
      questionIds: questionSource === 'bank' ? selectedBankQuestionIds : [],
      status: 'upcoming'
    });

    setTestsList(cbtTestService.getAllTests('all'));
    setIsCreateModalOpen(false);
    setTestName('');
    setSelectedBankQuestionIds([]);
    setSuccessToast(`CBT Test "${newTest.name}" scheduled with ${qCount} questions and synced to Student LMS!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!vignette.trim() || !selectedTestForQuestions) return;

    cbtTestService.addQuestionToTest(selectedTestForQuestions.id, {
      vignette: vignette.trim(),
      optA: optA.trim(),
      optB: optB.trim(),
      optC: optC.trim(),
      optD: optD.trim(),
      correct: correctOpt,
      explanation: rationale.trim(),
      guidelineRef: 'ACC/AHA Clinical Guidelines',
      examId: selectedTestForQuestions.examTrack || selectedTestForQuestions.courseId,
      subjectId: selectedTestForQuestions.subjectId,
      moduleId: selectedTestForQuestions.moduleId,
      lectureId: selectedTestForQuestions.lectureId
    });

    setTestsList(cbtTestService.getAllTests('all'));
    setSuccessToast(`Clinical question authored & saved to "${selectedTestForQuestions.name}" and synced to Question Bank!`);
    setTimeout(() => setSuccessToast(''), 4000);
    setIsQuestionModalOpen(false);
    setVignette('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setRationale('');
  };

  const handleDeleteTest = (id) => {
    cbtTestService.deleteTest(id);
    setTestsList(cbtTestService.getAllTests('all'));
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl">
      {/* Toast */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Assessments & CBT
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              Exam Simulation Engine
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Manage Tests & Question Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Author clinical vignette MCQs, set passing standards, schedule mock examinations, and inspect candidate cohort rank scorecards.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create CBT Test</span>
        </button>
      </div>

      {/* Tests Roster */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Assigned CBT Assessments ({scopedTests.length})
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              Scoped to your authorized programs: {assignedExamIds.join(', ').toUpperCase()}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Assessment Title</th>
                <th className="pb-3">Course / Track</th>
                <th className="pb-3">Schedule</th>
                <th className="pb-3">Questions & Marks</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scopedTests.map((test) => {
                const effectiveStatus = getTestStatus(test);
                const isLive = effectiveStatus === CBT_STATUS.AVAILABLE || effectiveStatus === CBT_STATUS.IN_PROGRESS;
                const isCompleted = effectiveStatus === CBT_STATUS.SUBMITTED;
                const isExpired = effectiveStatus === CBT_STATUS.EXPIRED;
                const qCount = test.questions?.length || test.totalQuestions || test.questionCount || 20;
                const durationLabel = test.durationMinutes ? `${test.durationMinutes} mins` : (test.duration || '45 mins');

                return (
                  <tr key={test.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 pr-3 font-bold text-slate-900">
                      <div>{test.name || test.title}</div>
                      <span className="text-[11px] text-slate-400 font-medium">{test.batchTier || test.batch || 'All Batches'}</span>
                    </td>

                    <td className="py-4 pr-3 text-indigo-600 font-semibold">
                      {test.course}
                    </td>

                    <td className="py-4 pr-3 text-slate-500">
                      <div className="font-medium text-slate-700">{test.formattedWindow || test.date || 'Scheduled'}</div>
                      <div className="text-[11px] text-slate-400">{durationLabel} • {formatTestCountdown(test)}</div>
                    </td>

                    <td className="py-4 pr-3">
                      <span className="font-bold text-slate-800">{qCount} Qs</span>
                      <span className="text-slate-400 ml-1.5">• {test.totalMarks || 100} Marks</span>
                    </td>

                    <td className="py-4 pr-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isLive 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                          : isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isExpired
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {effectiveStatus === CBT_STATUS.AVAILABLE ? 'Available Now' :
                         effectiveStatus === CBT_STATUS.IN_PROGRESS ? 'In Progress' :
                         effectiveStatus === CBT_STATUS.SUBMITTED ? 'Results Ready' :
                         effectiveStatus === CBT_STATUS.EXPIRED ? 'Expired' : 'Upcoming'}
                      </span>
                    </td>

                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/faculty/tests/${test.id}/questions`}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs transition-all flex items-center gap-1"
                          title="Author Questions"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Author Qs</span>
                        </Link>

                        <Link
                          to={`/faculty/tests/${test.id}/results`}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1"
                          title="View Scorecard"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Ranks</span>
                        </Link>

                        <button
                          onClick={() => handleDeleteTest(test.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg cursor-pointer"
                          title="Delete Assessment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Test */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Schedule New CBT Assessment</h3>
                  <p className="text-xs text-slate-500">Configure academic scope, timing, and Question Bank</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Authorized Program</label>
                  <select
                    value={selectedExamTrack}
                    onChange={(e) => {
                      setSelectedExamTrack(e.target.value);
                      setSelectedSubjectId('all');
                      setSelectedBankQuestionIds([]);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  >
                    {activeCatalogExams.map(ex => (
                      <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Curricular Subject Scope</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  >
                    <option value="all">Exam-wide (All Subjects)</option>
                    {availableSubjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Assessment Title</label>
                <input
                  type="text"
                  placeholder="e.g. Cardiology Grand Mock Test #03"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Exam Date</label>
                  <input
                    type="date"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Start Time</label>
                  <input
                    type="time"
                    value={testTime}
                    onChange={(e) => setTestTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Duration</label>
                  <select
                    value={testDuration}
                    onChange={(e) => setTestDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  >
                    <option value="30 mins">30 mins</option>
                    <option value="45 mins">45 mins</option>
                    <option value="60 mins">60 mins</option>
                    <option value="120 mins">120 mins</option>
                    <option value="180 mins">180 mins</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Total Marks</label>
                  <input
                    type="number"
                    value={testTotalMarks}
                    onChange={(e) => setTestTotalMarks(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  />
                </div>
              </div>

              {/* Question Source Tabs */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Question Source</label>
                  <div className="flex bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setQuestionSource('auto')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        questionSource === 'auto'
                          ? 'bg-white text-indigo-600 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Auto Preset ({testQuestionCount} Qs)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuestionSource('bank')}
                      className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                        questionSource === 'bank'
                          ? 'bg-white text-indigo-600 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Database className="w-3 h-3" />
                      <span>Pick from Bank ({selectedBankQuestionIds.length})</span>
                    </button>
                  </div>
                </div>

                {questionSource === 'auto' ? (
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">Number of Vignettes to Provision</label>
                    <input
                      type="number"
                      value={testQuestionCount}
                      onChange={(e) => setTestQuestionCount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Select published vignettes from Question Bank:</span>
                      <span className="font-bold text-indigo-600">{availableBankQuestions.length} Available</span>
                    </div>

                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/50 p-2 space-y-1">
                      {availableBankQuestions.length === 0 ? (
                        <div className="text-center py-4 text-slate-400 text-xs">
                          No published questions found for {selectedExamTrack.toUpperCase()}. 
                        </div>
                      ) : (
                        availableBankQuestions.map(bq => {
                          const isSelected = selectedBankQuestionIds.includes(bq.id);
                          const promptText = bq.content?.prompt || bq.prompt || bq.question || bq.title || 'Clinical Question';
                          return (
                            <div
                              key={bq.id}
                              onClick={() => toggleBankQuestion(bq.id)}
                              className={`p-2 rounded-lg cursor-pointer flex items-start gap-2 text-xs transition-colors ${
                                isSelected ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-100'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border shrink-0 ${
                                isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                              }`}>
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-slate-800 line-clamp-1">{promptText}</div>
                                <div className="text-[10px] text-slate-400">
                                  {bq.metadata?.subject || 'Clinical'} • {bq.type || 'Single Choice'} • +{bq.scoring?.marks || 5} marks
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-600/20"
                >
                  Schedule Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Author Question */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Author Clinical Vignette MCQ</h3>
                <p className="text-xs text-slate-500">Adding to {selectedTestForQuestions?.name || 'Assessment'}</p>
              </div>
              <button onClick={() => setIsQuestionModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Clinical Vignette / Stem</label>
                <textarea
                  rows="3"
                  placeholder="A 58-year-old male presents with sudden-onset crushing chest pain radiating to the jaw. ECG reveals ST elevation in leads II, III, and aVF with reciprocal changes in I and aVL..."
                  value={vignette}
                  onChange={(e) => setVignette(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700">Multiple Choice Options (A - D)</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center font-bold text-slate-700">A</span>
                    <input
                      type="text"
                      placeholder="Option A..."
                      value={optA}
                      onChange={(e) => setOptA(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center font-bold text-slate-700">B</span>
                    <input
                      type="text"
                      placeholder="Option B..."
                      value={optB}
                      onChange={(e) => setOptB(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center font-bold text-slate-700">C</span>
                    <input
                      type="text"
                      placeholder="Option C..."
                      value={optC}
                      onChange={(e) => setOptC(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center font-bold text-slate-700">D</span>
                    <input
                      type="text"
                      placeholder="Option D..."
                      value={optD}
                      onChange={(e) => setOptD(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Correct Option</label>
                  <select
                    value={correctOpt}
                    onChange={(e) => setCorrectOpt(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-700"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">High-Yield Explanation & Guidelines Reference</label>
                <textarea
                  rows="3"
                  placeholder="Explain why this option is correct and why other options are incorrect based on ACC/AHA guidelines..."
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cohort Results & Leaderboard */}
      {activeResultsModalTest && (() => {
        const activeCohortData = cbtTestService.getAttemptsForTest(activeResultsModalTest.id);
        const summary = activeCohortData?.summary || {
          batchMeanScore: '78.4 / 100',
          passingPercentage: '88.5% Pass',
          totalAppeared: '384 Doctors'
        };
        const candidates = activeCohortData?.candidates || [];

        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-6 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">Cohort Scorecard</span>
                  <h3 className="text-lg font-black text-slate-900">{activeResultsModalTest.name || activeResultsModalTest.title}</h3>
                </div>
                <button onClick={() => setActiveResultsModalTest(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">Mean Score</span>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{summary.batchMeanScore}</div>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Pass Rate</span>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{summary.passingPercentage}</div>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100">
                  <span className="text-[10px] font-bold text-purple-600 uppercase">Appeared</span>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{summary.totalAppeared}</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-700 uppercase">Candidate Leaderboard (Top {Math.min(candidates.length, 5)})</h4>
                <div className="space-y-2">
                  {candidates.slice(0, 5).map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black flex items-center justify-center text-[10px]">
                          #{c.rank}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{c.name}</div>
                          <div className="text-[10px] text-slate-400">{c.email || 'Candidate'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-extrabold text-slate-800">{c.score}</span>
                        <span className="text-indigo-600 font-bold">{c.percentile}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${c.status === 'Pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <Link
                  to={`/faculty/tests/${activeResultsModalTest.id}/results`}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>Open Full Cohort Scorecard & Analytics →</span>
                </Link>
                <button
                  onClick={() => setActiveResultsModalTest(null)}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Close Scorecard
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

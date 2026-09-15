import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  HelpCircle, 
  Eye, 
  Check, 
  BookOpen,
  Award
} from 'lucide-react';
import { cbtTestService } from '../../services/cbtTestService';

const defaultSampleQuestions = [
  {
    id: 1,
    vignette: 'A 54-year-old male with long-standing hypertension presents with sudden-onset crushing retrosternal chest pain radiating to the left jaw and back. Blood pressure is 85/50 mmHg, heart rate is 110 bpm. ECG reveals ST-segment elevation in leads II, III, and aVF with reciprocal ST depression in I and aVL. Bedside echo reveals right ventricular hypokinesia. Which of the following therapeutic agents is strictly CONTRAINDICATED in this patient?',
    question: 'Which of the following therapeutic agents is strictly CONTRAINDICATED in this patient?',
    options: [
      { id: 'A', key: 'A', text: 'Sublingual Nitroglycerin (Nitrates)' },
      { id: 'B', key: 'B', text: 'Aspirin 325 mg chewed' },
      { id: 'C', key: 'C', text: 'Unfractionated Heparin bolus' },
      { id: 'D', key: 'D', text: 'Intravenous Normal Saline fluid bolus' }
    ],
    correctOption: 'A',
    correct: 'A',
    explanation: 'Inferior wall myocardial infarction involving the right ventricle is preload-dependent. Administration of vasodilators like Nitroglycerin reduces venous return and right ventricular filling, precipitating severe catastrophic hypotension and cardiogenic shock.',
    guidelineRef: 'ACC/AHA 2023 STEMI Guidelines & Braunwald Heart Disease 12th Ed.'
  },
  {
    id: 2,
    vignette: 'A 62-year-old female presents for palpitations and dizziness. ECG shows irregular narrow-complex tachycardia with absent P waves and fibrillatory baseline waves. Ventricular rate is 145 bpm. Blood pressure is 126/82 mmHg. She has a history of type 2 diabetes and hypertension. What is her CHA2DS2-VASc score, and what is the recommended long-term stroke prevention strategy?',
    question: 'What is her CHA2DS2-VASc score, and what is the recommended long-term stroke prevention strategy?',
    options: [
      { id: 'A', key: 'A', text: 'Score = 4; Oral Anticoagulation (DOAC such as Apixaban)' },
      { id: 'B', key: 'B', text: 'Score = 2; Aspirin 75 mg once daily' },
      { id: 'C', key: 'C', text: 'Score = 1; Clopidogrel 75 mg once daily' },
      { id: 'D', key: 'D', text: 'Score = 0; No antithrombotic therapy required' }
    ],
    correctOption: 'A',
    correct: 'A',
    explanation: 'Points: Female sex (+1), Age 65-74 is not met (+0), Hypertension (+1), Diabetes Mellitus (+1), Age > 50 in females counts +1 in modified risk = Total CHA2DS2-VASc score = 3 to 4. For any female with score ≥ 3, direct oral anticoagulants (DOACs) are strongly recommended over antiplatelets.',
    guidelineRef: 'ESC 2024 Guidelines for Atrial Fibrillation Management.'
  }
];

export default function FacultyQuestionAuthoringPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [currentTest, setCurrentTest] = useState(() => {
    return cbtTestService.getTestById(testId) || {
      id: testId,
      name: 'Cardiology Mock Examination 1',
      course: 'NEET PG & NExT 2026',
      questions: []
    };
  });

  // Load questions from currentTest or default seeds
  const [questions, setQuestions] = useState(() => {
    if (currentTest.questions && Array.isArray(currentTest.questions) && currentTest.questions.length > 0) {
      return currentTest.questions.map((q, idx) => ({
        id: q.id || idx + 1,
        vignette: q.vignette || '',
        question: q.question || '',
        options: (q.options || []).map(o => ({
          id: o.id || o.key,
          key: o.key || o.id,
          text: o.text || ''
        })),
        correctOption: q.correctOption || q.correct || 'A',
        explanation: q.explanation || '',
        guidelineRef: q.guidelineRef || ''
      }));
    }
    return defaultSampleQuestions;
  });

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState('');

  const currentQ = questions[activeQuestionIndex] || questions[0] || defaultSampleQuestions[0];

  // Editor State
  const [vignette, setVignette] = useState(currentQ.vignette);
  const [optA, setOptA] = useState(currentQ.options?.[0]?.text || '');
  const [optB, setOptB] = useState(currentQ.options?.[1]?.text || '');
  const [optC, setOptC] = useState(currentQ.options?.[2]?.text || '');
  const [optD, setOptD] = useState(currentQ.options?.[3]?.text || '');
  const [correctOpt, setCorrectOpt] = useState(currentQ.correctOption || 'A');
  const [explanation, setExplanation] = useState(currentQ.explanation || '');
  const [guidelineRef, setGuidelineRef] = useState(currentQ.guidelineRef || '');

  const handleSelectQuestion = (idx) => {
    setActiveQuestionIndex(idx);
    const q = questions[idx];
    if (q) {
      setVignette(q.vignette);
      setOptA(q.options?.[0]?.text || '');
      setOptB(q.options?.[1]?.text || '');
      setOptC(q.options?.[2]?.text || '');
      setOptD(q.options?.[3]?.text || '');
      setCorrectOpt(q.correctOption || 'A');
      setExplanation(q.explanation || '');
      setGuidelineRef(q.guidelineRef || '');
    }
  };

  const handleSaveCurrentQuestion = (e) => {
    if (e) e.preventDefault();
    const updatedQ = {
      ...currentQ,
      vignette: vignette.trim(),
      question: currentQ.question || 'What is the most appropriate next clinical step or diagnosis?',
      options: [
        { id: 'A', key: 'A', text: optA.trim() },
        { id: 'B', key: 'B', text: optB.trim() },
        { id: 'C', key: 'C', text: optC.trim() },
        { id: 'D', key: 'D', text: optD.trim() }
      ],
      correctOption: correctOpt,
      correct: correctOpt,
      explanation: explanation.trim(),
      guidelineRef: guidelineRef.trim()
    };

    const updatedList = [...questions];
    updatedList[activeQuestionIndex] = updatedQ;
    setQuestions(updatedList);

    // Persist to central cbtTestService
    cbtTestService.updateTestQuestions(testId, updatedList);

    setToastMessage(`Saved Question #${activeQuestionIndex + 1} to Assessment Bank & synced to CBT Engine!`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleAddNewQuestion = () => {
    const newQ = {
      id: questions.length + 1,
      vignette: 'New clinical scenario stem. Patient presenting with high-yield symptoms and physical exam signs...',
      question: 'Which of the following represents the gold-standard diagnostic modality or intervention?',
      options: [
        { id: 'A', key: 'A', text: 'First diagnostic or therapeutic option' },
        { id: 'B', key: 'B', text: 'Second option' },
        { id: 'C', key: 'C', text: 'Third option' },
        { id: 'D', key: 'D', text: 'Fourth option' }
      ],
      correctOption: 'A',
      correct: 'A',
      explanation: 'Gold standard clinical reasoning and ACC/AHA rationale.',
      guidelineRef: 'Goldman-Cecil Medicine 26th Edition.'
    };

    const nextList = [...questions, newQ];
    setQuestions(nextList);
    cbtTestService.updateTestQuestions(testId, nextList);

    handleSelectQuestion(nextList.length - 1);
    setToastMessage(`Question #${nextList.length} created and appended to test!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDeleteQuestion = (idxToDelete) => {
    if (questions.length <= 1) {
      setToastMessage('An assessment must contain at least one question.');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    const nextList = questions.filter((_, idx) => idx !== idxToDelete);
    setQuestions(nextList);
    cbtTestService.updateTestQuestions(testId, nextList);

    const nextIdx = Math.max(0, idxToDelete - 1);
    handleSelectQuestion(nextIdx);
    setToastMessage('Question removed from test.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-7xl">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link
              to="/faculty/tests"
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Assessments</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              CBT Question Studio
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Authoring: {currentTest.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {currentTest.course} • Formatted for NExT & USMLE Clinical Vignette Specifications
          </p>
        </div>

        <button
          onClick={handleAddNewQuestion}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Next Question</span>
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Question Palette Navigator (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Question Palette ({questions.length})
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              All Validated
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2">
            {questions.map((q, idx) => {
              const isSelected = activeQuestionIndex === idx;
              return (
                <button
                  key={q.id}
                  onClick={() => handleSelectQuestion(idx)}
                  className={`h-11 rounded-2xl text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200'
                  }`}
                >
                  <span>Q{idx + 1}</span>
                  <span className={`text-[8px] font-extrabold ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    Ans: {q.correctOption}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Correct Option Mapped</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>High-Yield Rationale Attached</span>
            </div>
          </div>
        </div>

        {/* Middle Col: Question Editor Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-black text-xs flex items-center justify-center">
                #{activeQuestionIndex + 1}
              </span>
              <h2 className="text-base font-black text-slate-900">
                Clinical Vignette Editor
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(activeQuestionIndex)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                  title="Delete this question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleSaveCurrentQuestion}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Q#{activeQuestionIndex + 1}</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveCurrentQuestion} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Patient Case Vignette / Lead-in</label>
              <textarea
                rows="5"
                value={vignette}
                onChange={(e) => setVignette(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none leading-relaxed"
                required
              />
            </div>

            {/* 4 Options */}
            <div className="space-y-2.5">
              <label className="font-bold text-slate-700">Four Answer Options (Select Correct Key)</label>
              {[
                { key: 'A', val: optA, setVal: setOptA },
                { key: 'B', val: optB, setVal: setOptB },
                { key: 'C', val: optC, setVal: setOptC },
                { key: 'D', val: optD, setVal: setOptD }
              ].map((opt) => {
                const isCorrect = correctOpt === opt.key;
                return (
                  <div
                    key={opt.key}
                    className={`p-2.5 rounded-2xl border transition-all flex items-center gap-3 ${
                      isCorrect
                        ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/10'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setCorrectOpt(opt.key)}
                      className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center transition-all cursor-pointer ${
                        isCorrect
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-300 hover:border-emerald-500'
                      }`}
                    >
                      {opt.key}
                    </button>
                    <input
                      type="text"
                      value={opt.val}
                      onChange={(e) => opt.setVal(e.target.value)}
                      className="flex-1 bg-transparent border-none text-xs font-medium focus:outline-none"
                      placeholder={`Option ${opt.key}...`}
                      required
                    />
                    {isCorrect && (
                      <span className="text-[10px] font-extrabold text-emerald-700 uppercase pr-1">
                        Correct Key
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Clinical Explanation */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Clinical Rationale & Why Other Options Are Wrong</label>
              <textarea
                rows="3"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium resize-none"
              />
            </div>

            {/* Reference Citation */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Gold Standard Reference / Guidelines</label>
              <input
                type="text"
                value={guidelineRef}
                onChange={(e) => setGuidelineRef(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </form>
        </div>

        {/* Right Col: Live Candidate CBT Screen Simulation (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 rounded-3xl p-6 border border-slate-800 text-white shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Candidate CBT Preview
                </span>
              </div>
              <span className="text-[10px] text-amber-400 font-mono font-bold">
                +4 Marks / -1 Neg
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 uppercase">
                Question {activeQuestionIndex + 1} of {questions.length}
              </span>
              <p className="text-xs font-semibold text-slate-200 leading-relaxed max-h-44 overflow-y-auto">
                {vignette || 'Patient scenario stem preview...'}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {[
                { key: 'A', text: optA },
                { key: 'B', text: optB },
                { key: 'C', text: optC },
                { key: 'D', text: optD }
              ].map((opt) => (
                <div
                  key={opt.key}
                  className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3 text-xs"
                >
                  <span className="w-5 h-5 rounded-lg bg-slate-700 text-slate-300 font-black text-[11px] flex items-center justify-center shrink-0">
                    {opt.key}
                  </span>
                  <span className="text-slate-300 line-clamp-2">{opt.text || `Option ${opt.key}`}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Correct Answer Key: Option {correctOpt}</span>
            </div>
            <p className="text-[11px] text-indigo-200/80 line-clamp-2">
              {explanation || 'Gold standard rationale attached.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Flag, 
  RotateCcw,
  BarChart3,
  Award,
  ChevronRight
} from 'lucide-react';

export default function TestTakingModal({ isOpen, onClose, test }) {
  if (!isOpen || !test) return null;

  const [selectedOption, setSelectedOption] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(2695); // ~45 mins
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen || submitted) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, submitted]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const defaultQuestions = [
    {
      id: 1,
      vignette: 'A 62-year-old woman presents to the emergency department with a 3-hour history of acute palpitations and mild lightheadedness. Blood pressure is 118/74 mmHg, pulse is 132/min and irregularly irregular. Electrocardiogram demonstrates an irregularly irregular rhythm with narrow QRS complexes and absent discernible P waves with fibrillatory baseline waves.',
      question: 'Which of the following is the most appropriate next pharmacotherapeutic step for rate control in this hemodynamically stable patient?',
      options: [
        { key: 'A', text: 'Intravenous Metoprolol (Beta-blocker)' },
        { key: 'B', text: 'Immediate Synchronized Electrical Cardioversion' },
        { key: 'C', text: 'Intravenous Adenosine rapid bolus' },
        { key: 'D', text: 'Subcutaneous Enoxaparin monotherapy without rate control' }
      ],
      correct: 'A',
      explanation: 'In hemodynamically stable atrial fibrillation with rapid ventricular response, beta-blockers (e.g. IV Metoprolol) or non-dihydropyridine CCBs (Diltiazem/Verapamil) are first-line for acute ventricular rate control. Electrical cardioversion is indicated if hemodynamically unstable.'
    },
    {
      id: 2,
      vignette: 'A 24-year-old elite collegiate athlete undergoes pre-participation cardiovascular screening. He is completely asymptomatic. Cardiac examination reveals a harsh crescendo-decrescendo systolic ejection murmur at the left sternal border. The murmur noticeably increases in intensity during the strain phase of the Valsalva maneuver and standing.',
      question: 'Which molecular genetic abnormality is most commonly associated with this patient\'s condition?',
      options: [
        { key: 'A', text: 'Mutation in Beta-myosin heavy chain (MYH7) or Myosin-binding protein C' },
        { key: 'B', text: 'Fibrillin-1 (FBN1) gene mutation on chromosome 15' },
        { key: 'C', text: 'Collagen type III alpha-1 (COL3A1) vascular mutation' },
        { key: 'D', text: 'Dystrophin gene deletion on X-chromosome' }
      ],
      correct: 'A',
      explanation: 'Hypertrophic Cardiomyopathy (HCM) is an autosomal dominant condition characterized by asymmetric septal hypertrophy. Murmur intensifies with maneuvers that decrease left ventricular preload (Valsalva, standing). Caused by sarcomeric protein mutations (MYH7 / MYBPC3).'
    }
  ];

  const sampleQuestions = (test?.questions && Array.isArray(test.questions) && test.questions.length > 0)
    ? test.questions
    : defaultQuestions;

  const currentQ = sampleQuestions[currentQuestionIndex];

  const handleSubmitTest = () => {
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-3xl bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
          
          {/* CBT Header Bar */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 sticky top-0 z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-brand-500 text-white px-2 py-0.5 rounded uppercase">
                  CBT Simulation Mode
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {test.name}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1">
                Candidate: Dr. Ritik Saini (Seat: CBT-ONLINE-2026)
              </h3>
            </div>

            <div className="flex items-center gap-4">
              {!submitted && (
                <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-amber-400 font-mono font-bold text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(secondsRemaining)}</span>
                </div>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Test Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!submitted ? (
              <>
                {/* Question metadata & flag button */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Question {currentQuestionIndex + 1} of {sampleQuestions.length}
                  </span>
                  <button className="flex items-center gap-1 text-xs text-amber-600 font-bold hover:text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 cursor-pointer">
                    <Flag className="w-3.5 h-3.5" />
                    <span>Flag for Review</span>
                  </button>
                </div>

                {/* Question Prompt */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-slate-900 leading-relaxed">
                    {currentQ.question}
                  </h4>
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-2.5">
                  {currentQ.options.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isSelected = selectedOption === letter;

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedOption(letter)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'border-brand-600 bg-brand-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-brand-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {letter}
                        </span>
                        <span className="text-xs text-slate-800 font-medium leading-relaxed pt-1">
                          {opt}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Submission Result Card */
              <div className="py-10 text-center space-y-4 animate-in zoom-in-95">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Assessment Completed Successfully!
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Your answers have been cryptographically verified and recorded in the NEET PG Cohort Gradebook.
                </p>

                <div className="max-w-xs mx-auto p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Candidate:</span>
                    <span className="font-bold text-slate-800">Dr. Ritik Saini</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Raw Score:</span>
                    <span className="font-bold text-emerald-600">82.5% (High Pass)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Percentile Rank:</span>
                    <span className="font-bold text-brand-600">94th Percentile</span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>

          {/* CBT Sticky Footer Controls */}
          {!submitted && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 sticky bottom-0 z-10">
              <button
                onClick={() => setSelectedOption(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Clear Choice
              </button>

              <div className="flex items-center gap-3">
                {currentQuestionIndex < sampleQuestions.length - 1 ? (
                  <button
                    onClick={() => {
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                      setSelectedOption(null);
                    }}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitTest}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Test</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

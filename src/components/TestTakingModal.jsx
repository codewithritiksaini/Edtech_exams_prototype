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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-3xl w-full max-w-4xl h-[90vh] max-h-[740px] overflow-hidden shadow-2xl flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* CBT Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-brand-500 text-white px-2 py-0.5 rounded uppercase">
                CBT Simulation Mode
              </span>
              <span className="text-xs font-semibold text-slate-300">
                {test.name}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-0.5">
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
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Test Body */}
        <div className="flex-grow overflow-y-auto p-6 sm:p-8">
          {!submitted ? (
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* Question Index & Status */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-extrabold text-brand-700 uppercase tracking-wider">
                  Question {currentQuestionIndex + 1} of {sampleQuestions.length}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  +4 Marks | -1 Negative Marking
                </span>
              </div>

              {/* Patient Clinical Vignette Box */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 text-sm sm:text-base leading-relaxed font-sans font-medium">
                {currentQ.vignette}
              </div>

              {/* Specific Question Prompt */}
              <h4 className="text-base font-bold text-slate-900">
                {currentQ.question}
              </h4>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((option) => {
                  const isSelected = selectedOption === option.key;
                  return (
                    <button
                      key={option.key}
                      onClick={() => setSelectedOption(option.key)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3.5 ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/70 text-brand-900 shadow-sm ring-1 ring-brand-500/30'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-800'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center shrink-0 text-xs transition-colors ${
                        isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {option.key}
                      </span>
                      <span className="text-sm font-medium leading-snug">
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>
          ) : (
            /* Result Screen */
            <div className="max-w-xl mx-auto text-center py-6 space-y-6 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <Award className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Test Completed Successfully
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  Score Report & Analytics
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Exam: {test.name}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 block">Marks Obtained</span>
                  <span className="text-2xl font-black text-slate-900">8 / 8</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">National Percentile</span>
                  <span className="text-2xl font-black text-brand-600">99.4%ile</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Accuracy</span>
                  <span className="text-2xl font-black text-emerald-600">100%</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs text-left border border-emerald-200 leading-relaxed">
                <span className="font-bold">Clinical Feedback:</span> Excellent grasp of acute rate control algorithms and sarcomeric gene mutations in hypertrophic cardiomyopathy.
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* CBT Footer Controls */}
        {!submitted && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              onClick={() => setSelectedOption(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
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
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitTest}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
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
  );
}

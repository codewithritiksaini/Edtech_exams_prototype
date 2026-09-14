import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Award, 
  Filter, 
  Sparkles, 
  HelpCircle,
  BarChart3,
  Calendar,
  AlertCircle,
  Lock,
  Play,
  Pause,
  ShieldCheck,
  X,
  AlertTriangle
} from 'lucide-react';
import { 
  cbtTestService, 
  CBT_STATUS, 
  getTestStatus, 
  formatTestCountdown, 
  getTestTimes 
} from '../../services/cbtTestService';

export default function StudentTestsPage() {
  const navigate = useNavigate();

  // Reactive time updated every 10 seconds
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [tests, setTests] = useState(() => cbtTestService.getAllTests('neet-pg'));
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'available' | 'upcoming' | 'completed' | 'expired'
  const [selectedTestForStart, setSelectedTestForStart] = useState(null);
  const [infoToast, setInfoToast] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Subscribe to central service
  useEffect(() => {
    const unsubscribe = cbtTestService.subscribe((updatedTests) => {
      setTests(cbtTestService.getAllTests('neet-pg'));
    });
    return unsubscribe;
  }, []);

  const showToast = (msg) => {
    setInfoToast(msg);
    setTimeout(() => setInfoToast(''), 4500);
  };

  // Compute status counts dynamically from currentTime
  const counts = useMemo(() => {
    let available = 0;
    let inProgress = 0;
    let upcoming = 0;
    let completed = 0;
    let expired = 0;

    tests.forEach(test => {
      const st = getTestStatus(test, currentTime);
      if (st === CBT_STATUS.AVAILABLE) available++;
      else if (st === CBT_STATUS.IN_PROGRESS || st === CBT_STATUS.PAUSED) inProgress++;
      else if (st === CBT_STATUS.UPCOMING) upcoming++;
      else if (st === CBT_STATUS.SUBMITTED) completed++;
      else if (st === CBT_STATUS.EXPIRED) expired++;
    });

    return {
      all: tests.length,
      available: available + inProgress,
      upcoming,
      completed,
      expired
    };
  }, [tests, currentTime]);

  // Filter and sort tests: Available/In-Progress/Paused first, Upcoming second, Completed third, Expired last
  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const st = getTestStatus(test, currentTime);
      if (activeFilter === 'available') return st === CBT_STATUS.AVAILABLE || st === CBT_STATUS.IN_PROGRESS || st === CBT_STATUS.PAUSED;
      if (activeFilter === 'upcoming') return st === CBT_STATUS.UPCOMING;
      if (activeFilter === 'completed') return st === CBT_STATUS.SUBMITTED;
      if (activeFilter === 'expired') return st === CBT_STATUS.EXPIRED;
      return true;
    }).sort((a, b) => {
      const rank = {
        [CBT_STATUS.PAUSED]: 1,
        [CBT_STATUS.IN_PROGRESS]: 1,
        [CBT_STATUS.AVAILABLE]: 2,
        [CBT_STATUS.UPCOMING]: 3,
        [CBT_STATUS.SUBMITTED]: 4,
        [CBT_STATUS.EXPIRED]: 5
      };
      const rankA = rank[getTestStatus(a, currentTime)] || 99;
      const rankB = rank[getTestStatus(b, currentTime)] || 99;
      return rankA - rankB;
    });
  }, [tests, activeFilter, currentTime]);

  const handleStartConfirmed = () => {
    if (!selectedTestForStart) return;
    const testId = selectedTestForStart.id;
    // Start attempt in service (initializes timestamps)
    cbtTestService.startAttempt(testId);
    setSelectedTestForStart(null);
    navigate(`/test/${testId}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* Toast Notification */}
      {infoToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 border border-slate-700 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{infoToast}</span>
          </div>
          <button 
            onClick={() => setInfoToast('')}
            className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>National Medical CBT Assessment Center • NEET PG & NExT 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            CBT Test Series & Mock Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Strict timed examinations with All India Rank (AIR), percentile metrics, and question-by-question clinical rationales. Tests unlock strictly during their scheduled window.
          </p>
        </div>

        {/* Live status badge */}
        <div className="flex items-center gap-2 shrink-0">
          {counts.available > 0 ? (
            <span className="px-4 py-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs font-bold text-brand-700 shadow-xs flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-ping" />
              <span><strong>{counts.available} Test Window Open Now</strong></span>
            </span>
          ) : (
            <span className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>{counts.upcoming} Upcoming Tests Scheduled</span>
            </span>
          )}
        </div>
      </div>

      {/* Test List Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        
        {/* Filters Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">National Medical Mock Assessments</h3>
            <p className="text-xs text-slate-500 mt-0.5">Time-enforced examination lifecycle: Scheduled → Available → Attempt → Review</p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setActiveFilter('available')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'available' ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
              <span>Available Now ({counts.available})</span>
            </button>
            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeFilter === 'upcoming' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upcoming ({counts.upcoming})
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeFilter === 'completed' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({counts.completed})
            </button>
            <button
              onClick={() => setActiveFilter('expired')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeFilter === 'expired' ? 'bg-white text-slate-700 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Closed ({counts.expired})
            </button>
          </div>
        </div>

        {/* Tests Listing */}
        {filteredTests.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No tests in this category</p>
            <p className="text-xs text-slate-400">Switch filter tabs above to view available and upcoming tests.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTests.map((test) => {
              const status = getTestStatus(test, currentTime);
              const isAvailable = status === CBT_STATUS.AVAILABLE;
              const isInProgress = status === CBT_STATUS.IN_PROGRESS;
              const isPaused = status === CBT_STATUS.PAUSED;
              const isUpcoming = status === CBT_STATUS.UPCOMING;
              const isCompleted = status === CBT_STATUS.SUBMITTED;
              const isExpired = status === CBT_STATUS.EXPIRED;

              const completedAttempt = cbtTestService.getCompletedAttempt(test.id);
              const activeAttempt = cbtTestService.getActiveAttempt(test.id);
              const countdownText = formatTestCountdown(test, currentTime);

              return (
                <div
                  key={test.id}
                  className={`py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3 sm:p-4 rounded-2xl transition-all ${
                    isAvailable || isInProgress || isPaused
                      ? 'bg-blue-50/40 border border-brand-200 shadow-2xs'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isPaused
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs'
                        : isInProgress 
                          ? 'bg-amber-100 text-amber-700 border border-amber-300'
                          : isAvailable
                            ? 'bg-brand-100 text-brand-700 border border-brand-300 shadow-xs'
                            : isCompleted 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                              : isUpcoming
                                ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : isPaused ? (
                        <Pause className="w-6 h-6 fill-current text-amber-600" />
                      ) : isInProgress ? (
                        <Play className="w-6 h-6 fill-current" />
                      ) : isAvailable ? (
                        <Sparkles className="w-6 h-6 text-brand-600" />
                      ) : isUpcoming ? (
                        <Clock className="w-6 h-6" />
                      ) : (
                        <Lock className="w-6 h-6" />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-slate-900">
                          {test.name}
                        </h4>

                        {/* Status Pills */}
                        {isPaused ? (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider shadow-2xs flex items-center gap-1">
                            <Pause className="w-3 h-3 fill-current" />
                            <span>PAUSED • RESUME</span>
                          </span>
                        ) : isInProgress ? (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider shadow-2xs animate-pulse">
                            IN PROGRESS • RESUME
                          </span>
                        ) : isAvailable ? (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-brand-600 text-white uppercase tracking-wider shadow-2xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            AVAILABLE NOW
                          </span>
                        ) : isUpcoming ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-600" />
                            {countdownText}
                          </span>
                        ) : isCompleted ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✓ COMPLETED
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600">
                            WINDOW CLOSED
                          </span>
                        )}

                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {test.course || 'NEET PG & NExT 2026'}
                        </span>
                      </div>

                      {/* Details row */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {test.formattedWindow || test.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {test.durationMinutes || 45} mins
                        </span>
                        <span>•</span>
                        <span>📝 {test.totalQuestions || test.questionsCount || 20} Questions</span>
                        <span>•</span>
                        <span className="text-slate-600 font-medium">
                          +{test.marksPerCorrect || 5} / {test.marksPerIncorrect || -1} Marking
                        </span>

                        {isCompleted && completedAttempt && (
                          <>
                            <span>•</span>
                            <span className="font-bold text-emerald-600">
                              Score: {completedAttempt.score} / {completedAttempt.totalMarks} ({completedAttempt.percentile})
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Column (Uniform Width & Height Alignment) */}
                  <div className="w-full sm:w-auto flex items-center justify-end shrink-0 pt-2 sm:pt-0">
                    {isPaused || isInProgress ? (
                      // Case 1: In Progress or Paused -> Resume Test
                      <button
                        onClick={() => navigate(`/test/${test.id}`)}
                        className="w-full sm:w-48 py-2.5 px-4 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume Test →</span>
                      </button>
                    ) : isAvailable ? (
                      // Case 2: Available Now -> Start Test Confirmation Modal
                      <button
                        onClick={() => setSelectedTestForStart(test)}
                        className="w-full sm:w-48 py-2.5 px-4 text-xs font-black text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-xs shadow-brand-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <span>Start Test</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : isUpcoming ? (
                      // Case 3: Upcoming -> STRICTLY NO JOIN/START BUTTON!
                      <button
                        type="button"
                        onClick={() => showToast(`"${test.name}" is scheduled for ${test.formattedWindow || 'a later date'}. The exam opens automatically at start time.`)}
                        className="w-full sm:w-48 py-2.5 px-3 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        title="Test opens at scheduled time"
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{countdownText}</span>
                      </button>
                    ) : isCompleted ? (
                      // Case 4: Completed -> View Result & Read-Only Review
                      <button
                        onClick={() => navigate(`/test/${test.id}`)}
                        className="w-full sm:w-48 py-2.5 px-3 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                      >
                        <span>View Result & Review</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    ) : (
                      // Case 5: Expired / Closed -> No Start Button!
                      <div className="w-full sm:w-48 py-2.5 px-3 rounded-lg text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 flex items-center justify-center text-center">
                        <span>Test Window Closed</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CBT Engine Guide Banner */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
        <div className="space-y-1.5">
          <span className="font-bold text-slate-900 block flex items-center gap-1.5 text-sm">
            <Award className="w-4 h-4 text-brand-600" />
            Negative Marking Scheme
          </span>
          <p className="text-slate-600 leading-relaxed">
            +5 Marks for every correct clinical response, -1 Mark penalty for incorrect answers. Unanswered questions receive 0 penalty.
          </p>
        </div>

        <div className="space-y-1.5">
          <span className="font-bold text-slate-900 block flex items-center gap-1.5 text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Strict Window Enforcement
          </span>
          <p className="text-slate-600 leading-relaxed">
            Examinations cannot be opened before their start time or after closing. Refreshing the exam will not reset your timer.
          </p>
        </div>

        <div className="space-y-1.5">
          <span className="font-bold text-slate-900 block flex items-center gap-1.5 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Navigation Protection
          </span>
          <p className="text-slate-600 leading-relaxed">
            Leaving an active examination via browser back or tab exit will automatically submit your attempt.
          </p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL: EXAM START CONFIRMATION (NO TIMER STARTS UNTIL CONFIRMED)       */}
      {/* ===================================================================== */}
      {selectedTestForStart && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                  Timed CBT Examination
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Start {selectedTestForStart.name}?
                </h3>
              </div>
              <button
                onClick={() => setSelectedTestForStart(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Questions</span>
                <span className="text-lg font-black text-slate-900">{selectedTestForStart.totalQuestions || 20}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Duration</span>
                <span className="text-lg font-black text-amber-600">{selectedTestForStart.durationMinutes || 45} mins</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Marking</span>
                <span className="text-lg font-black text-slate-900">+{selectedTestForStart.marksPerCorrect || 5} / {selectedTestForStart.marksPerIncorrect || -1}</span>
              </div>
            </div>

            {/* Critical Exam Rules */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
              <span className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Important Examination Rules:
              </span>
              <ul className="space-y-1 text-slate-700 list-disc list-inside leading-relaxed text-[11px]">
                <li>The countdown timer starts immediately once you confirm.</li>
                <li>You can pause the test at any time to freeze the timer and resume later.</li>
                <li>Answers are automatically saved in real-time as you select them.</li>
                <li>Attempting to leave or click back will allow you to pause or submit.</li>
                <li>When remaining time reaches 00:00, the test will submit automatically.</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTestForStart(null)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartConfirmed}
                className="px-6 py-2.5 text-xs font-black text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-md shadow-brand-600/25 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Confirm & Start Examination</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

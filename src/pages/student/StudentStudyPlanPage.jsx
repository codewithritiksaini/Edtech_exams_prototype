import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Play, 
  CheckCircle2, 
  Lock, 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  Radio, 
  FileText, 
  Layers, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { studyPlanWeeks } from '../../data/mockData';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';

export default function StudentStudyPlanPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const completedDayParam = searchParams.get('completedDay');
  const examParam = searchParams.get('exam');

  const [selectedExamTrack, setSelectedExamTrack] = useState(() => {
    if (examParam === 'usmle' || examParam === 'usmle-step1') return 'usmle';
    if (examParam === 'plab' || examParam === 'plab-ukmla') return 'plab';
    if (examParam === 'europe' || examParam === 'europe-licensing') return 'europe';
    return 'neet-pg';
  });

  // Completed Days store
  const [completedDaysList, setCompletedDaysList] = useState([1, 2]);
  const [completionBanner, setCompletionBanner] = useState('');

  useEffect(() => {
    if (completedDayParam) {
      const dayNum = parseInt(completedDayParam, 10);
      setCompletedDaysList((prev) => Array.from(new Set([...prev, dayNum])));
      setCompletionBanner(`🎉 Great job! Day ${dayNum} curriculum milestone marked as Completed.`);
      const timer = setTimeout(() => setCompletionBanner(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [completedDayParam]);

  // Reactive Curriculum Data
  const [curriculumSubjects, setCurriculumSubjects] = useState(() => curriculumService.getSubjects(selectedExamTrack));
  const [curriculumChapters, setCurriculumChapters] = useState(() => curriculumService.getChapters(null, selectedExamTrack));
  const [curriculumSchedule, setCurriculumSchedule] = useState(() => curriculumService.getSchedule(selectedExamTrack));

  useEffect(() => {
    const unsubC = curriculumService.subscribeCurriculum(() => {
      setCurriculumSubjects(curriculumService.getSubjects(selectedExamTrack));
      setCurriculumChapters(curriculumService.getChapters(null, selectedExamTrack));
    });
    const unsubS = curriculumService.subscribeSchedule(() => {
      setCurriculumSchedule(curriculumService.getSchedule(selectedExamTrack));
    });
    return () => {
      unsubC();
      unsubS();
    };
  }, [selectedExamTrack]);

  useEffect(() => {
    setCurriculumSubjects(curriculumService.getSubjects(selectedExamTrack));
    setCurriculumChapters(curriculumService.getChapters(null, selectedExamTrack));
    setCurriculumSchedule(curriculumService.getSchedule(selectedExamTrack));
  }, [selectedExamTrack]);

  // Week Expansion state
  const [expandedWeeks, setExpandedWeeks] = useState({ 1: true, 2: false, 3: false, 4: false });

  const toggleWeek = (weekNum) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekNum]: !prev[weekNum]
    }));
  };

  // Dynamically resolve study plan weeks
  const resolvedStudyPlanWeeks = useMemo(() => {
    if (!curriculumSchedule || curriculumSchedule.length === 0) {
      return studyPlanWeeks;
    }

    const weekMap = {};
    curriculumSchedule.forEach((slot) => {
      const wk = slot.weekNumber || 1;
      if (!weekMap[wk]) {
        weekMap[wk] = [];
      }
      weekMap[wk].push(slot);
    });

    const sortedWeeks = Object.keys(weekMap).map(Number).sort((a, b) => a - b);
    const allTopics = curriculumService.getTopics();

    return sortedWeeks.map((wkNum) => {
      const slots = weekMap[wkNum].sort((a, b) => a.dayNumber - b.dayNumber);
      const firstSlot = slots[0];
      const subject = curriculumSubjects.find((s) => s.id === firstSlot?.subjectId);
      const chapter = curriculumChapters.find((c) => c.id === firstSlot?.chapterId);

      const days = slots.map((s) => {
        const isMarkedCompleted = completedDaysList.includes(s.dayNumber);
        let status = 'available';
        if (s.status === 'Locked') {
          status = 'locked';
        } else if (isMarkedCompleted || (selectedExamTrack === 'neet-pg' && s.dayNumber < 3)) {
          status = 'completed';
        } else if (selectedExamTrack === 'neet-pg' && s.dayNumber === 3) {
          status = 'in-progress';
        } else if (s.status === 'Active') {
          status = 'available';
        } else if (s.status === 'Scheduled') {
          status = 'scheduled';
        } else {
          status = 'available';
        }

        const linkedTopics = (s.topicIds || []).map((tId) => {
          const top = allTopics.find((t) => t.id === tId);
          return { id: tId, title: top?.title || tId };
        });

        return {
          dayNumber: s.dayNumber,
          title: s.dayTitle,
          duration: s.estimatedTime || '1.5 hours',
          status,
          score: s.dayNumber === 1 ? '18/20 (90%)' : s.dayNumber === 2 ? '17/20 (85%)' : undefined,
          topics: linkedTopics,
          hasLive: s.hasLive,
          hasTest: s.hasTest,
          subjectId: s.subjectId,
          chapterId: s.chapterId,
          firstTopicId: s.topicIds?.[0]
        };
      });

      const completedCount = days.filter((d) => d.status === 'completed').length;
      const completionRate = `${Math.round((completedCount / (days.length || 1)) * 100)}%`;

      return {
        weekNumber: wkNum,
        title: subject ? subject.name : `Week ${wkNum} Core Curriculum`,
        description: chapter ? chapter.title : 'High-Yield Clinical Module',
        badge: wkNum === 1 ? 'Active Track' : 'Upcoming Track',
        status: wkNum === 1 ? 'current' : 'upcoming',
        completionRate,
        days
      };
    });
  }, [curriculumSchedule, curriculumSubjects, curriculumChapters, completedDaysList, selectedExamTrack]);

  const handleDayClick = (day) => {
    if (day.status === 'locked') return;
    navigate(`/day/${day.dayNumber}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {completionBanner && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span className="font-bold text-xs sm:text-sm">{completionBanner}</span>
          </div>
          <button 
            onClick={() => setCompletionBanner('')}
            className="text-white/80 hover:text-white text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            <span>Drip-Fed Structured Syllabus</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your Clinical Study Plan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Structured week-by-week clinical curriculum designed by national exam faculties. Click on any unlocked Day to access video lectures, clinical pearls, ECG strips, and active spaced-repetition flashcards.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs self-start sm:self-auto">
          <span className="flex items-center gap-1 font-semibold text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Completed
          </span>
          <span className="flex items-center gap-1 font-semibold text-brand-700">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
            In Progress
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-400">
            <Lock className="w-3 h-3" />
            Locked
          </span>
        </div>
      </div>

      {/* Study Plan Program Track Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-1 shrink-0 flex items-center gap-1.5 mr-1">
          <Layers className="w-3.5 h-3.5" />
          Exam Track:
        </span>
        {[
          { id: 'neet-pg', name: 'NEET PG & NExT', flag: '🇮🇳' },
          { id: 'usmle', name: 'USMLE Step 1 & 2', flag: '🇺🇸' },
          { id: 'plab', name: 'PLAB 1 & 2 / UKMLA', flag: '🇬🇧' },
          { id: 'europe', name: 'Europe Licensing (FSP)', flag: '🇪🇺' }
        ].map(track => (
          <button
            key={track.id}
            onClick={() => setSelectedExamTrack(track.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              selectedExamTrack === track.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <span>{track.flag}</span>
            <span>{track.name}</span>
          </button>
        ))}
      </div>

      {/* Expandable Week Cards */}
      <div className="space-y-4">
        {resolvedStudyPlanWeeks.map((week) => {
          const isExpanded = expandedWeeks[week.weekNumber];
          const isCurrentWeek = week.status === 'current';

          return (
            <div
              key={week.weekNumber}
              className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                isCurrentWeek
                  ? 'border-brand-300 shadow-md ring-1 ring-brand-500/10'
                  : 'border-slate-200 shadow-xs'
              }`}
            >
              
              {/* Week Header Accordion Bar */}
              <div
                onClick={() => toggleWeek(week.weekNumber)}
                className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-extrabold text-base ${
                    isCurrentWeek 
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    W{week.weekNumber}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Week {week.weekNumber} — {week.title}
                      </h3>
                      {isCurrentWeek && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 uppercase tracking-wide">
                          Active Week
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {week.description} • <span className="font-semibold text-brand-700">{week.badge}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                    Progress: {week.completionRate}
                  </span>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                    isExpanded ? 'bg-slate-100 rotate-180' : 'bg-slate-50'
                  }`}>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </span>
                </div>
              </div>

              {/* Week Days List (When Expanded) */}
              {isExpanded && (
                <div className="border-t border-slate-100 divide-y divide-slate-100 bg-slate-50/40">
                  {week.days.map((day) => {
                    const isMarkedCompleted = completedDaysList.includes(day.dayNumber);
                    const isCompleted = day.status === 'completed' || isMarkedCompleted;
                    const isInProgress = !isCompleted && day.status === 'in-progress';
                    const isAvailable = !isCompleted && !isInProgress && (day.status === 'available' || day.status === 'scheduled');
                    const isLocked = !isCompleted && !isInProgress && !isAvailable && day.status === 'locked';

                    return (
                      <div
                        key={day.dayNumber}
                        onClick={() => handleDayClick(day)}
                        className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                          isLocked
                            ? 'opacity-60 bg-slate-50/80 cursor-not-allowed'
                            : isInProgress
                              ? 'bg-brand-50/50 hover:bg-brand-50 cursor-pointer border-l-4 border-brand-500'
                              : 'hover:bg-white cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3.5">
                          
                          {/* Status Indicator Icon */}
                          <div className="shrink-0 mt-0.5 sm:mt-0">
                            {isCompleted && (
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-2xs">
                                <CheckCircle2 className="w-5 h-5" />
                              </div>
                            )}
                            {isInProgress && (
                              <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-xs shadow-brand-500/30 animate-pulse">
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              </div>
                            )}
                            {isAvailable && (
                              <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-200">
                                <BookOpen className="w-4 h-4" />
                              </div>
                            )}
                            {isLocked && (
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center">
                                <Lock className="w-4 h-4" />
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-400 uppercase">
                                Day {day.dayNumber}
                              </span>
                              {isInProgress && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-600 text-white uppercase tracking-wider">
                                  Current Day
                                </span>
                              )}
                              {isCompleted && day.score && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                  Drill Score: {day.score}
                                </span>
                              )}
                              {day.hasLive && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1">
                                  <Radio className="w-3 h-3 text-purple-600" />
                                  <span>Live Rounds</span>
                                </span>
                              )}
                              {day.hasTest && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1">
                                  <FileText className="w-3 h-3 text-amber-600" />
                                  <span>CBT Test</span>
                                </span>
                              )}
                            </div>

                            <h4 className={`text-sm sm:text-base font-bold mt-0.5 ${
                              isLocked ? 'text-slate-500' : 'text-slate-900 hover:text-brand-600'
                            }`}>
                              {day.title}
                            </h4>

                            {day.topics && day.topics.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                {day.topics.map((t, idx) => (
                                  <span 
                                    key={idx} 
                                    className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200/60"
                                  >
                                    {t.title || t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Action Button */}
                        <div className="flex items-center justify-end gap-3 shrink-0">
                          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            {day.duration}
                          </span>

                          {!isLocked ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDayClick(day);
                                }}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                                  isCompleted
                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    : isInProgress
                                      ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
                                      : 'bg-white hover:bg-brand-50 hover:text-brand-700 text-slate-700 border border-slate-200'
                                }`}
                              >
                                <span>{isCompleted ? 'Review Day' : isInProgress ? 'Resume Day' : 'Start Study'}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded-lg">
                              Locked
                            </span>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}

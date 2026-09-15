import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Play, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  Radio, 
  FileText, 
  Layers, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X,
  RotateCw,
  Video,
  Image as ImageIcon,
  Brain,
  HelpCircle,
  Check,
  Eye,
  Info
} from 'lucide-react';
import { dashboardUserData } from '../../data/mockData';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import { learningProgressService } from '../../services/learningProgressService';
import { studyPlan28DaysCurriculum } from '../../data/studyPlanCurriculumData';

export default function StudentStudyPlanPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const completedDayParam = searchParams.get('completedDay');

  // Enrolled Exam determination from student enrollment data (NO track switcher)
  const enrolledExamId = dashboardUserData.examCategory || 'neet-pg';
  const enrolledExamObj = catalogService.getExamById(enrolledExamId) || {
    id: enrolledExamId,
    name: dashboardUserData.enrolledCourse || 'NEET PG & NExT 2026',
    fullName: 'National Eligibility cum Entrance Test for Postgraduate (NEET PG & NExT)'
  };
  const enrolledProgramTier = dashboardUserData.packageTier || 'Standard • 6 Month Program';

  // 28-day delivery plan loaded from curriculumService (single delivery source of truth)
  const [deliveryPlan, setDeliveryPlan] = useState(() => curriculumService.getDeliveryPlan(enrolledExamId));

  // Completed Days store connected to learningProgressService
  const [completedDaysList, setCompletedDaysList] = useState(() => learningProgressService.getCompletedDays());
  const [highestUnlockedDay, setHighestUnlockedDay] = useState(() => learningProgressService.getHighestUnlockedDay());
  const [completionBanner, setCompletionBanner] = useState('');

  // Gating Guidance Modal State (for optional non-blocking alerts)
  const [gatingModalInfo, setGatingModalInfo] = useState(null);

  // Subscribe to curriculumService delivery updates and learningProgressService reactivity
  useEffect(() => {
    const updateDelivery = () => {
      setDeliveryPlan(curriculumService.getDeliveryPlan(enrolledExamId));
    };
    updateDelivery();
    const unsubDelivery = curriculumService.subscribeDeliveryPlan(updateDelivery);
    const unsubProgress = learningProgressService.subscribe(() => {
      setCompletedDaysList(learningProgressService.getCompletedDays());
      setHighestUnlockedDay(learningProgressService.getHighestUnlockedDay());
    });

    return () => {
      unsubDelivery();
      unsubProgress();
    };
  }, [enrolledExamId]);

  useEffect(() => {
    if (completedDayParam) {
      const dayNum = parseInt(completedDayParam, 10);
      setCompletionBanner(`🎉 Outstanding work! Day ${dayNum} curriculum milestone marked as Completed.`);
      const timer = setTimeout(() => setCompletionBanner(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [completedDayParam]);

  // Week Accordion state: default active week to open
  const currentWeekNumber = useMemo(() => {
    if (highestUnlockedDay <= 7) return 1;
    if (highestUnlockedDay <= 14) return 2;
    if (highestUnlockedDay <= 21) return 3;
    return 4;
  }, [highestUnlockedDay]);

  const [expandedWeeks, setExpandedWeeks] = useState({
    1: true,
    2: currentWeekNumber === 2,
    3: currentWeekNumber === 3,
    4: currentWeekNumber === 4
  });

  const toggleWeek = (weekNum) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekNum]: !prev[weekNum]
    }));
  };

  // Expandable Day Cards state: current active day is open by default for immediate preview
  const [expandedDays, setExpandedDays] = useState(() => ({
    [learningProgressService.getHighestUnlockedDay()]: true
  }));

  const toggleDay = (dayNumber, e) => {
    if (e) e.stopPropagation();
    setExpandedDays(prev => ({
      ...prev,
      [dayNumber]: !prev[dayNumber]
    }));
  };

  // Find title of current active day for guidance modal
  const currentDayTitle = useMemo(() => {
    for (const week of deliveryPlan) {
      const found = week.days.find(d => d.dayNumber === highestUnlockedDay);
      if (found) return found.title;
    }
    return `Cardiology & Hemodynamics`;
  }, [deliveryPlan, highestUnlockedDay]);

  // Handle Day or Lecture click:
  // Navigate directly to /day/:dayNumber for ALL days (Completed, Current, and Upcoming for Inspection)
  const handleContentAction = (day, lecture = null) => {
    navigate(`/day/${day.dayNumber}`);
  };

  // Quick dev testing tool handlers
  const handleFastForwardDay = () => {
    const next = highestUnlockedDay + 1;
    if (next <= 28) {
      learningProgressService.setDayCompleted(highestUnlockedDay, true);
      setCompletionBanner(`⚡ Fast-forwarded! Day ${highestUnlockedDay} completed. Day ${next} is now active.`);
      setExpandedDays(prev => ({ ...prev, [next]: true }));
      const targetWk = Math.ceil(next / 7);
      setExpandedWeeks(prev => ({ ...prev, [targetWk]: true }));
    }
  };

  const handleResetRoadmap = () => {
    learningProgressService.resetProgress();
    setCompletionBanner(`🔄 Roadmap reset to default progression (Days 1 & 2 completed, Day 3 active).`);
    setExpandedDays({ 3: true });
    setExpandedWeeks({ 1: true, 2: false, 3: false, 4: false });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      
      {/* Toast Notification */}
      {completionBanner && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <span className="font-bold text-xs sm:text-sm">{completionBanner}</span>
          </div>
          <button 
            onClick={() => setCompletionBanner('')}
            className="text-white/80 hover:text-white text-xs font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Bar — Enrolled Exam Only */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider border border-brand-200">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              <span>Drip-Fed Structured Syllabus</span>
            </div>
            
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Your Clinical Study Plan
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                {enrolledExamObj.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                {enrolledProgramTier}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Your personalized 28-day clinical preparation roadmap.
              </span>
            </div>
          </div>

          {/* Status Legend: Completed ✓, Current ▶, Upcoming ○ (No Locked Tag) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start sm:self-auto shrink-0">
            <div className="flex items-center gap-3.5 text-xs bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Completed</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5 text-brand-700">
                <Play className="w-3.5 h-3.5 fill-current text-brand-600" />
                <span>Current</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-3 h-3 rounded-full border-2 border-slate-400" />
                <span>Upcoming</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Week Accordion Roadmap — All 28 Days Visible */}
      <div className="space-y-5">
        {deliveryPlan.map((week) => {
          const isExpanded = expandedWeeks[week.weekNumber];
          const isCurrentWeek = week.weekNumber === currentWeekNumber;
          const completedInWeek = week.days.filter(d => completedDaysList.includes(d.dayNumber)).length;
          const weekProgressPct = Math.round((completedInWeek / (week.days.length || 7)) * 100);

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
                className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-base ${
                    isCurrentWeek 
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    W{week.weekNumber}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        Week {week.weekNumber} — {week.title}
                      </h3>
                      {isCurrentWeek && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 uppercase tracking-wide border border-brand-200">
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
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-700">
                      Progress: {weekProgressPct}%
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {completedInWeek} of {week.days.length} days completed
                    </span>
                  </div>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                    isExpanded ? 'bg-slate-100 rotate-180' : 'bg-slate-50'
                  }`}>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </span>
                </div>
              </div>

              {/* Week Days List — All 7 Days Rendered with Expandable Drawers */}
              {isExpanded && (
                <div className="border-t border-slate-100 divide-y divide-slate-100 bg-slate-50/30">
                  {week.days.map((day) => {
                    const isCompleted = completedDaysList.includes(day.dayNumber);
                    const isCurrent = !isCompleted && day.dayNumber === highestUnlockedDay;
                    const isUpcoming = !isCompleted && !isCurrent;
                    const isDayExpanded = Boolean(expandedDays[day.dayNumber]);

                    // Aggregate counts for summary pill
                    const totalLectures = day.modules.reduce((acc, m) => acc + m.lectures.length, 0);
                    const totalTopics = day.modules.reduce((acc, m) => 
                      acc + m.lectures.reduce((lAcc, l) => lAcc + l.topics.length, 0), 0
                    );

                    return (
                      <div
                        key={day.dayNumber}
                        className={`transition-all ${
                          isCompleted
                            ? 'bg-white'
                            : isCurrent
                              ? 'bg-brand-50/40 border-l-4 border-brand-600'
                              : 'bg-white'
                        }`}
                      >
                        {/* Day Header Row (Summary View) */}
                        <div
                          onClick={(e) => toggleDay(day.dayNumber, e)}
                          className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors`}
                        >
                          <div className="flex items-start sm:items-center gap-3.5">
                            
                            {/* 3 Status Icons: Completed (Check), Current (Play), Upcoming (Circle) */}
                            <div className="shrink-0 mt-0.5 sm:mt-0">
                              {isCompleted && (
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs border border-emerald-200">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                </div>
                              )}
                              {isCurrent && (
                                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-xs shadow-brand-500/30 animate-pulse">
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                </div>
                              )}
                              {isUpcoming && (
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-300">
                                  <span className="w-2.5 h-2.5 rounded-full border-2 border-slate-400" />
                                </div>
                              )}
                            </div>

                            {/* Main Day Info */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                                  Day {day.dayNumber}
                                </span>

                                {isCurrent && (
                                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-600 text-white uppercase tracking-wider shadow-2xs">
                                    ▶ Current Day
                                  </span>
                                )}

                                {isCompleted && (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    ✓ Completed
                                  </span>
                                )}

                                {isUpcoming && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                    ○ Upcoming
                                  </span>
                                )}

                                {isCompleted && day.score && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
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

                              <h4 className="text-sm sm:text-base font-black text-slate-900">
                                {day.title}
                              </h4>

                              {/* Teaser Pills & Academic Counts */}
                              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                <span className="text-[11px] font-bold text-brand-700 bg-brand-50/80 px-2 py-0.5 rounded border border-brand-100/80">
                                  {day.modules.length} {day.modules.length === 1 ? 'Module' : 'Modules'} • {totalLectures} Lectures • {totalTopics} Topics
                                </span>

                                {day.summaryPills?.map((pill, pIdx) => (
                                  <span 
                                    key={pIdx} 
                                    className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200/70"
                                  >
                                    {pill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Right Controls & Primary Actions */}
                          <div className="flex items-center justify-end gap-3 shrink-0 pt-2 lg:pt-0">
                            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium mr-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{day.duration}</span>
                            </span>

                            {/* View Day Content Drawer Toggle Button */}
                            <button
                              type="button"
                              onClick={(e) => toggleDay(day.dayNumber, e)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isDayExpanded
                                  ? 'bg-slate-200 text-slate-800'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              <span>{isDayExpanded ? 'Collapse Content' : 'View Day Content'}</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDayExpanded ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Primary Action Button (Appears on ALL days: Completed, Current, or Upcoming for Inspection) */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleContentAction(day);
                              }}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                                isCompleted
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  : isCurrent
                                    ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                              }`}
                            >
                              <span>
                                {isCompleted ? 'Review Day' : isCurrent ? 'Resume Day' : 'Inspect Day'}
                              </span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* ========================================================= */}
                        {/* EXPANDABLE DAY CONTENT PREVIEW DRAWER                     */}
                        {/* Full Academic Hierarchy: Modules -> Lectures -> Topics -> Resources */}
                        {/* ========================================================= */}
                        {isDayExpanded && (
                          <div className="border-t border-slate-200/80 bg-gradient-to-b from-slate-50/60 to-slate-100/30 p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
                            
                            {/* Drawer Status Banner */}
                            <div className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs ${
                              isCompleted 
                                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                                : isCurrent
                                  ? 'bg-brand-50 text-brand-900 border border-brand-200'
                                  : 'bg-white text-slate-700 border border-slate-200 shadow-2xs'
                            }`}>
                              <div className="flex items-center gap-2.5">
                                {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                                {isCurrent && <Play className="w-4 h-4 fill-current text-brand-600 shrink-0" />}
                                {isUpcoming && <Info className="w-4 h-4 text-slate-400 shrink-0" />}
                                
                                <span className="font-semibold">
                                  {isCompleted && `✓ Completed Day Milestone — You can freely review all lectures, guides, and questions.`}
                                  {isCurrent && `▶ Active Learning Day — Complete each required lecture and resource to unlock Day ${day.dayNumber + 1}.`}
                                  {isUpcoming && `○ Upcoming Academic Curriculum — Complete Day ${highestUnlockedDay} first to unlock this content for study.`}
                                </span>
                              </div>

                              <span className="text-[11px] font-bold text-slate-400 hidden sm:inline uppercase tracking-wider">
                                {day.duration} Total Duration
                              </span>
                            </div>

                            {/* Scheduled Canonical Lectures Section (if linked by Faculty) */}
                            {day.lectures && day.lectures.length > 0 && (
                              <div className="bg-brand-50/40 rounded-2xl p-4 sm:p-5 border border-brand-200/80 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between border-b border-brand-100 pb-2">
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-brand-600" />
                                    <span className="text-xs font-black uppercase tracking-wider text-brand-900">
                                      Canonical Curriculum Lectures ({day.lectures.length})
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-bold text-brand-600 bg-brand-100/60 px-2 py-0.5 rounded-full">
                                    Assigned by Faculty
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {day.lectures.map((cl) => (
                                    <div key={cl.id} className="p-3 bg-white rounded-xl border border-brand-100 flex items-center justify-between gap-3 text-xs">
                                      <div>
                                        <div className="font-bold text-slate-900">{cl.title}</div>
                                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                          <span>{cl.duration || '45 mins'}</span>
                                          <span>•</span>
                                          <span className="text-brand-700 font-semibold">{cl.difficulty || 'High-Yield'}</span>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleContentAction(day)}
                                        className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg font-bold text-xs shrink-0 cursor-pointer"
                                      >
                                        Inspect →
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Modules List */}
                            <div className="space-y-4">
                              {day.modules.map((module) => (
                                <div 
                                  key={module.id} 
                                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5"
                                >
                                  {/* Module Title Header */}
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                        Module {module.moduleNumber}
                                      </span>
                                      <h5 className="text-xs sm:text-sm font-black text-slate-900">
                                        {module.title}
                                      </h5>
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                      {module.lectures.length} {module.lectures.length === 1 ? 'Lecture' : 'Lectures'}
                                    </span>
                                  </div>

                                  {/* Lectures inside this Module */}
                                  <div className="space-y-3 pt-1">
                                    {module.lectures.map((lecture, lIdx) => {
                                      // Determine individual lecture state
                                      let lectureStatus = 'upcoming';
                                      if (isCompleted) {
                                        lectureStatus = 'completed';
                                      } else if (isCurrent) {
                                        if (lIdx === 0) {
                                          lectureStatus = 'current';
                                        } else {
                                          lectureStatus = 'upcoming';
                                        }
                                      } else {
                                        lectureStatus = 'upcoming';
                                      }

                                      return (
                                        <div
                                          key={lecture.id}
                                          className={`p-4 rounded-xl border transition-all ${
                                            lectureStatus === 'completed'
                                              ? 'bg-slate-50/50 border-slate-200'
                                              : lectureStatus === 'current'
                                                ? 'bg-brand-50/30 border-brand-200 ring-1 ring-brand-500/10'
                                                : 'bg-white border-slate-200/90'
                                          }`}
                                        >
                                          {/* Lecture Card Header */}
                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                            <div className="space-y-1">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                  Lecture {lecture.lectureNumber}
                                                </span>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                                  <Clock className="w-3 h-3 text-slate-400" />
                                                  {lecture.duration}
                                                </span>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                                  {lecture.difficulty || 'High-Yield'}
                                                </span>

                                                {/* Lecture Status Tag */}
                                                {lectureStatus === 'completed' && (
                                                  <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                    ✓ Completed
                                                  </span>
                                                )}
                                                {lectureStatus === 'current' && (
                                                  <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-brand-600 text-white">
                                                    ▶ Ready to Study
                                                  </span>
                                                )}
                                                {lectureStatus === 'upcoming' && (
                                                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                                    ○ Upcoming • Available after Day {highestUnlockedDay}
                                                  </span>
                                                )}
                                              </div>

                                              <h6 className="text-xs sm:text-sm font-bold text-slate-900">
                                                {lecture.title}
                                              </h6>
                                            </div>

                                            {/* Action Button (Available on all lectures: Completed, Current, or Upcoming for Inspection) */}
                                            <div className="shrink-0 self-start sm:self-auto">
                                              <button
                                                type="button"
                                                onClick={() => handleContentAction(day, lecture)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs ${
                                                  lectureStatus === 'completed'
                                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                    : lectureStatus === 'current'
                                                      ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
                                                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}
                                              >
                                                <span>
                                                  {lectureStatus === 'completed' ? 'Review Lecture' : lectureStatus === 'current' ? 'Start Lecture' : 'Inspect Day'}
                                                </span>
                                                <ChevronRight className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>

                                          {/* Topics Covered (Bullet List) */}
                                          {lecture.topics && lecture.topics.length > 0 && (
                                            <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                                              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                                Topics Covered:
                                              </p>
                                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-slate-600">
                                                {lecture.topics.map((t, tIdx) => (
                                                  <li key={tIdx} className="flex items-start gap-1.5">
                                                    <span className="text-brand-500 font-bold">•</span>
                                                    <span>{t}</span>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}

                                          {/* Resource Badges */}
                                          {lecture.resources && lecture.resources.length > 0 && (
                                            <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                                              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                                Learning Resources:
                                              </p>
                                              <div className="flex flex-wrap items-center gap-1.5">
                                                {lecture.resources.map((res, rIdx) => {
                                                  let IconComp = FileText;
                                                  let colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
                                                  
                                                  if (res.type === 'video') {
                                                    IconComp = Video;
                                                    colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                                                  } else if (res.type === 'images') {
                                                    IconComp = ImageIcon;
                                                    colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
                                                  } else if (res.type === 'flashcards') {
                                                    IconComp = Brain;
                                                    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                                  } else if (res.type === 'live') {
                                                    IconComp = Radio;
                                                    colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
                                                  } else if (res.type === 'test') {
                                                    IconComp = CheckCircle2;
                                                    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
                                                  }

                                                  return (
                                                    <span
                                                      key={rIdx}
                                                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${colorClasses}`}
                                                    >
                                                      <IconComp className="w-3.5 h-3.5 shrink-0" />
                                                      <span>{res.label}</span>
                                                    </span>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          )}

                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>

                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Sequential Progression Modal Alert (When Upcoming Content is Clicked) */}
      {gatingModalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <button
                onClick={() => setGatingModalInfo(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Upcoming Learning Content
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Complete your current day first before starting this content for active study.
              </p>

              {/* Active Clinical Milestone */}
              <div className="p-3.5 rounded-2xl bg-brand-50 border border-brand-200 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-brand-700">
                  Active Clinical Milestone:
                </div>
                <div className="text-xs font-bold text-brand-950">
                  Day {gatingModalInfo.currentDayNumber} — {gatingModalInfo.currentDayTitle}
                </div>
              </div>

              {/* Attempted Content */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-0.5 text-xs text-slate-600">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Requested Target:
                </div>
                <div className="font-bold text-slate-800">
                  Day {gatingModalInfo.attemptedDayNumber} — {gatingModalInfo.attemptedDayTitle}
                </div>
                {gatingModalInfo.attemptedLectureTitle && (
                  <div className="text-[11px] text-slate-500 italic">
                    Lecture: {gatingModalInfo.attemptedLectureTitle}
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                MedPrep Pro enforces strict sequential mastery so that candidates retain core physiology and pharmacology before advancing to higher-order clinical cases.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setGatingModalInfo(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-all"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const targetDay = gatingModalInfo.currentDayNumber;
                  setGatingModalInfo(null);
                  navigate(`/day/${targetDay}`);
                }}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-brand-600/20 cursor-pointer transition-all"
              >
                <span>Go to Day {gatingModalInfo.currentDayNumber}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dev / Testing Quick-Bar */}
      <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
          <span>Study Plan Simulator • Highest Unlocked Day: <strong className="text-slate-900">Day {highestUnlockedDay}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFastForwardDay}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-brand-50 text-brand-700 border border-slate-200 font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="Complete current day and unlock the next day"
          >
            <span>Advance Day (+1)</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={handleResetRoadmap}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-all cursor-pointer"
            title="Reset to Day 3 active"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}

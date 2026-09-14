import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Brain, 
  Radio, 
  Download, 
  Maximize2, 
  Play, 
  Pause, 
  RotateCw, 
  Volume2, 
  Lock, 
  Sparkles, 
  Clock, 
  Check, 
  HelpCircle, 
  Bookmark, 
  Save, 
  Maximize, 
  ExternalLink,
  Info,
  Award,
  AlertCircle,
  X,
  Calendar,
  Layers,
  BookOpen,
  FileCheck
} from 'lucide-react';
import DashboardNavbar from '../components/DashboardNavbar';
import DashboardSidebar from '../components/DashboardSidebar';
import ImageLightboxModal from '../components/ImageLightboxModal';
import AskDoubtModal from '../components/AskDoubtModal';
import LiveSessionModal from '../components/LiveSessionModal';
import { dayContentStore } from '../data/mockData';
import { curriculumService } from '../services/curriculumService';
import { getStudyPlanDay } from '../data/studyPlanCurriculumData';
import { 
  learningProgressService, 
  RESOURCE_STATUS, 
  RESOURCE_TITLES 
} from '../services/learningProgressService';

export default function DayContentView() {
  const { dayId = '3' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const requestedTab = searchParams.get('tab');

  const currentNum = parseInt(dayId, 10) || 1;

  // Day Gate: Verify if this day is unlocked
  const isThisDayUnlocked = learningProgressService.isDayUnlocked(currentNum);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Direct URL bypass protection: Redirect if Day is not accessible
  useEffect(() => {
    if (!isThisDayUnlocked) {
      const highest = learningProgressService.getHighestUnlockedDay();
      showToast(`Complete Day ${highest} first before starting Day ${currentNum}.`);
      const timer = setTimeout(() => {
        navigate(`/day/${highest}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentNum, isThisDayUnlocked, navigate]);

  // Load day data dynamically from curriculumService with studyPlanCurriculumData & mockData fallback
  const studyPlanDay = useMemo(() => getStudyPlanDay(currentNum), [currentNum]);

  const [currentDayData, setCurrentDayData] = useState(() => {
    const resolved = curriculumService.getDayResolvedContent(dayId) || dayContentStore[dayId] || dayContentStore['3'];
    return {
      ...resolved,
      ...(studyPlanDay || {})
    };
  });

  useEffect(() => {
    const loadDayData = () => {
      const resolved = curriculumService.getDayResolvedContent(dayId) || dayContentStore[dayId] || dayContentStore['3'];
      setCurrentDayData({
        ...resolved,
        ...(studyPlanDay || {})
      });
    };

    loadDayData();
    const unsubCurriculum = curriculumService.subscribeCurriculum(loadDayData);
    const unsubSchedule = curriculumService.subscribeSchedule(loadDayData);

    return () => {
      unsubCurriculum();
      unsubSchedule();
    };
  }, [dayId, studyPlanDay]);

  // Reactive subscription to learning progress
  const [progressVersion, setProgressVersion] = useState(0);
  useEffect(() => {
    const unsub = learningProgressService.subscribe(() => {
      setProgressVersion(v => v + 1);
    });
    return unsub;
  }, []);

  // Determine whether an actual live session exists for this Day/Lecture
  const hasLiveSession = Boolean(
    studyPlanDay 
      ? studyPlanDay.hasLive 
      : (currentDayData.hasLive && currentDayData.live?.hasSession !== false)
  );

  // Mandatory sequential resources for this day
  const mandatorySequence = useMemo(() => {
    return learningProgressService.getMandatorySequence(currentDayData);
  }, [currentDayData]);

  // Tab state — automatically set to active incomplete resource or requested tab if unlocked
  const [activeTab, setActiveTab] = useState(() => {
    if (requestedTab && learningProgressService.isResourceUnlocked(dayId, requestedTab, currentDayData)) {
      return requestedTab;
    }
    return learningProgressService.getCurrentActiveResource(dayId, currentDayData);
  });

  // Guard activeTab if it becomes locked or if URL has an unauthorized tab
  useEffect(() => {
    const isMandatory = mandatorySequence.includes(activeTab);
    if (isMandatory) {
      const isUnlocked = learningProgressService.isResourceUnlocked(dayId, activeTab, currentDayData);
      if (!isUnlocked) {
        const activeRes = learningProgressService.getCurrentActiveResource(dayId, currentDayData);
        setActiveTab(activeRes);
        showToast(`This resource is not available yet. Complete ${RESOURCE_TITLES[activeRes] || activeRes} first.`);
      }
    }
  }, [dayId, currentDayData, mandatorySequence, progressVersion, activeTab]);

  // Handle Tab Selection with Strict Sequential Check
  const handleSelectTab = (tabKey) => {
    // If Live session (optional non-mandatory)
    if (tabKey === 'live') {
      if (hasLiveSession) {
        setActiveTab('live');
      }
      return;
    }

    const state = learningProgressService.getResourceState(dayId, tabKey, currentDayData);

    // If resource is completed: allowed for review
    if (state.status === RESOURCE_STATUS.COMPLETED) {
      setActiveTab(tabKey);
      return;
    }

    // If resource is unlocked (available or in-progress): allowed to study
    if (learningProgressService.isResourceUnlocked(dayId, tabKey, currentDayData)) {
      setActiveTab(tabKey);
      return;
    }

    // If resource is upcoming/locked: block access and show friendly notification
    const currentActive = learningProgressService.getCurrentActiveResource(dayId, currentDayData);
    showToast(`This resource is not available yet. Complete ${RESOURCE_TITLES[currentActive] || 'current resource'} first.`);
  };

  // Day Completion status
  const isDayFullyCompleted = learningProgressService.isDayCompleted(dayId, currentDayData);
  const completedMandatoryCount = mandatorySequence.filter(key => 
    learningProgressService.isResourceCompleted(dayId, key, currentDayData)
  ).length;
  const completionPercentage = mandatorySequence.length > 0 
    ? Math.round((completedMandatoryCount / mandatorySequence.length) * 100) 
    : 0;

  // Active resource determination
  const currentActiveResource = learningProgressService.getCurrentActiveResource(dayId, currentDayData);
  const activeResourceState = learningProgressService.getResourceState(dayId, activeTab, currentDayData);
  const isActiveTabCompleted = activeResourceState.status === RESOURCE_STATUS.COMPLETED;

  // Active day status
  const highestUnlockedDay = learningProgressService.getHighestUnlockedDay();
  const isCurrentActiveDay = currentNum === highestUnlockedDay && !isDayFullyCompleted;

  // Clinical Description
  const dayDescription = currentDayData.description || currentDayData.summary || 
    `Master ${currentDayData.title.toLowerCase()}, high-yield clinical patterns, and evidence-based diagnostic management through structured clinical cases.`;

  // Module & Lecture counts for metadata row
  const modulesCount = currentDayData.modules?.length || 1;
  const lecturesCount = currentDayData.modules?.reduce((acc, m) => acc + (m.lectures?.length || 0), 0) || currentDayData.lectures?.length || 2;

  // Progress supporting text
  const progressSupportingText = useMemo(() => {
    if (isDayFullyCompleted) {
      return '✓ All required learning resources completed.';
    }
    if (completedMandatoryCount === 0) {
      return "Let's get started. Complete each resource in sequence.";
    }
    if (completedMandatoryCount >= mandatorySequence.length - 1) {
      return "You're almost there. Finish the current resource to complete today's learning.";
    }
    return 'Keep going. Complete the current resource to unlock the next one.';
  }, [isDayFullyCompleted, completedMandatoryCount, mandatorySequence.length]);

  // Resume Current Resource action
  const handleResumeCurrent = () => {
    setActiveTab(currentActiveResource);
  };

  // Previous & Next Day Navigation Calculation
  const allScheduledDays = useMemo(() => {
    const list = curriculumService.getAllScheduledDayNumbers();
    return list && list.length > 0 ? list : Array.from({ length: 28 }, (_, i) => i + 1);
  }, []);

  const currentIndex = allScheduledDays.indexOf(currentNum);
  const prevDayNum = currentIndex > 0 
    ? allScheduledDays[currentIndex - 1] 
    : (currentNum > 1 ? currentNum - 1 : null);
  const nextDayNum = currentIndex >= 0 && currentIndex < allScheduledDays.length - 1 
    ? allScheduledDays[currentIndex + 1] 
    : (currentNum < 28 ? currentNum + 1 : null);

  const handleNextDayClick = () => {
    if (!isDayFullyCompleted) {
      showToast(`Complete Day ${currentNum} first. Finish all required learning resources in the current day before moving to Day ${nextDayNum}.`);
      return;
    }
    if (nextDayNum) {
      navigate(`/day/${nextDayNum}`);
    }
  };

  // ---------------------------------------------------------------------------
  // Resource Viewer States & Handlers
  // ---------------------------------------------------------------------------
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Video State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x');
  const videoResourceState = learningProgressService.getResourceState(dayId, 'video', currentDayData);
  const [videoProgress, setVideoProgress] = useState(() => videoResourceState.progress || 0);

  useEffect(() => {
    let interval;
    if (isPlaying && activeTab === 'video') {
      interval = setInterval(() => {
        setVideoProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          const next = Math.min(100, prev + 2);
          learningProgressService.saveResourceProgress(dayId, 'video', { progress: next }, currentDayData);
          if (next >= 95 && prev < 95) {
            handleCompleteResource('video');
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeTab, dayId, currentDayData]);

  // PDF State
  const [selectedPdfIndex, setSelectedPdfIndex] = useState(0);
  const activePdf = (currentDayData.pdfList && currentDayData.pdfList[selectedPdfIndex]) || currentDayData.pdf || {
    title: 'High-Yield Clinical Notes',
    fileName: 'clinical-notes.pdf',
    pages: 24,
    size: '4.8 MB',
    author: 'Dr. Siddharth V. (AIIMS)'
  };
  const totalPdfPages = activePdf?.pages || 24;
  const pdfResourceState = learningProgressService.getResourceState(dayId, 'notes', currentDayData);
  const [pdfPage, setPdfPage] = useState(() => pdfResourceState.currentPage || 1);

  const handlePdfNextPage = () => {
    if (pdfPage < totalPdfPages) {
      const nextPage = pdfPage + 1;
      setPdfPage(nextPage);
      const pageProgress = Math.round((nextPage / totalPdfPages) * 100);
      learningProgressService.saveResourceProgress(dayId, 'notes', { currentPage: nextPage, progress: pageProgress }, currentDayData);
    }
  };

  const handlePdfPrevPage = () => {
    if (pdfPage > 1) {
      setPdfPage(pdfPage - 1);
    }
  };

  // ECG / Images State
  const imagesResourceState = learningProgressService.getResourceState(dayId, 'images', currentDayData);
  const [viewedImageIds, setViewedImageIds] = useState(() => new Set(imagesResourceState.viewedIds || []));
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxActiveIndex, setLightboxActiveIndex] = useState(0);

  const handleInspectImage = (imgId, idx) => {
    setLightboxActiveIndex(idx);
    setLightboxOpen(true);
    const updated = new Set(viewedImageIds);
    updated.add(imgId);
    setViewedImageIds(updated);

    const totalImages = currentDayData.images?.length || 2;
    const progress = Math.round((updated.size / totalImages) * 100);
    learningProgressService.saveResourceProgress(dayId, 'images', { viewedIds: Array.from(updated), progress }, currentDayData);
  };

  // Flashcards State
  const flashcardsList = currentDayData.flashcards || [];
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [reviewedCardIndices, setReviewedCardIndices] = useState(() => new Set());

  const handleFlipFlashcard = () => {
    setFlashcardFlipped(!flashcardFlipped);
    const updated = new Set(reviewedCardIndices);
    updated.add(currentFlashcardIndex);
    setReviewedCardIndices(updated);
    const progress = Math.round((updated.size / Math.max(flashcardsList.length, 1)) * 100);
    learningProgressService.saveResourceProgress(dayId, 'flashcards', { reviewedCount: updated.size, progress }, currentDayData);
  };

  const handleNextFlashcard = () => {
    if (currentFlashcardIndex < flashcardsList.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
      setFlashcardFlipped(false);
      const updated = new Set(reviewedCardIndices);
      updated.add(currentFlashcardIndex + 1);
      setReviewedCardIndices(updated);
    }
  };

  const handlePrevFlashcard = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(currentFlashcardIndex - 1);
      setFlashcardFlipped(false);
    }
  };

  // Generic Completion Handler for any active resource
  const handleCompleteResource = (resourceKey) => {
    learningProgressService.completeResource(dayId, resourceKey, currentDayData);
    
    // Check if day is now fully completed
    const isNowDayDone = learningProgressService.isDayCompleted(dayId, currentDayData);

    if (isNowDayDone) {
      showToast(`🎉 Outstanding work! All learning resources completed. Day ${currentNum} is now complete!`);
    } else {
      const resTitle = RESOURCE_TITLES[resourceKey] || 'Resource';
      showToast(`🎉 ${resTitle} completed! Next resource unlocked.`);
      
      // Smoothly advance to newly unlocked next resource
      const nextRes = learningProgressService.getCurrentActiveResource(dayId, currentDayData);
      if (nextRes && nextRes !== resourceKey) {
        setActiveTab(nextRes);
      }
    }
  };

  // Modals state
  const [doubtModalOpen, setDoubtModalOpen] = useState(false);
  const [liveModalOpen, setLiveModalOpen] = useState(false);
  const [fullscreenPdfOpen, setFullscreenPdfOpen] = useState(false);

  // Personal Study Notepad State
  const storageKeyNotes = `medprep_student_notes_day_${dayId}`;
  const [studentNotes, setStudentNotes] = useState(() => {
    return localStorage.getItem(storageKeyNotes) || 
      'Key takeaway: Always assess hemodynamics first in wide QRS tachycardia. If unstable -> synchronized cardioversion. If stable -> Brugada criteria algorithm.';
  });
  const [notesSaved, setNotesSaved] = useState(false);

  const handleSaveNotes = () => {
    localStorage.setItem(storageKeyNotes, studentNotes);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  // Developer / Prototype Simulator tool handlers
  const handleSimulateAdvanceResource = () => {
    handleCompleteResource(activeTab);
  };

  const handleSimulateResetDay = () => {
    learningProgressService.ensureDayRecord(dayId, currentDayData);
    const dayStr = String(dayId);
    if (learningProgressService.store.days[dayStr]) {
      learningProgressService.store.days[dayStr].completed = false;
      mandatorySequence.forEach((k, idx) => {
        learningProgressService.store.days[dayStr].resources[k] = {
          status: idx === 0 ? RESOURCE_STATUS.AVAILABLE : RESOURCE_STATUS.LOCKED,
          progress: 0
        };
      });
      learningProgressService.store.completedDays = learningProgressService.store.completedDays.filter(d => d !== currentNum);
      learningProgressService.saveStore(learningProgressService.store);
      setActiveTab(mandatorySequence[0] || 'video');
      showToast(`🔄 Day ${currentNum} reset to initial progression.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* 1. Top Navbar */}
      <DashboardNavbar 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex-grow flex">
        
        {/* Persistent Left Sidebar */}
        <DashboardSidebar 
          activeTab="plan" 
          onSelectTab={(tabId) => {
            if (tabId === 'dashboard') navigate('/dashboard');
            else navigate(`/dashboard#${tabId}`);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6 pb-20">
          
          {/* ========================================================================= */}
          {/* 2. Breadcrumb Navigation                                                  */}
          {/* ========================================================================= */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <Link to="/student/study-plan" className="hover:text-brand-600 transition-colors flex items-center gap-1 font-bold">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Study Plan</span>
              </Link>
              <span className="text-slate-300">•</span>
              <span>Week {currentDayData.weekNumber} • {currentDayData.subjectName || 'Cardiology & Hemodynamics'}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-bold">Day {currentDayData.dayNumber}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                Daily Study Mode
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. Day Header Card — Unified Academic Overview & Learning Progress        */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            
            {/* Top Grid: Left Column (Academic Context & Meta) + Right Column (Progress Panel) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* Left / Primary Column (7 cols) */}
              <div className="lg:col-span-7 space-y-3.5">
                
                {/* Academic Context Row */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-brand-600">
                    Week {currentDayData.weekNumber || 1} • {currentDayData.subjectName || currentDayData.subject || 'Cardiology & Hemodynamics'}
                  </span>
                  <span className="text-slate-300 select-none">•</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>Day {currentDayData.dayNumber || currentNum} of 7</span>
                  </span>
                  
                  {isDayFullyCompleted ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Completed Day</span>
                    </span>
                  ) : isCurrentActiveDay ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
                      <span>Current Day</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                      <span>○ Upcoming Day</span>
                    </span>
                  )}
                </div>

                {/* Main Day Title */}
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                  Day {currentDayData.dayNumber || currentNum} — {currentDayData.title}
                </h1>

                {/* Short Day Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                  {dayDescription}
                </p>

                {/* Academic Metadata Row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>{modulesCount} {modulesCount === 1 ? 'Module' : 'Modules'}</span>
                  </div>
                  <span className="text-slate-300 hidden sm:inline select-none">|</span>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>{lecturesCount} {lecturesCount === 1 ? 'Lecture' : 'Lectures'}</span>
                  </div>
                  <span className="text-slate-300 hidden sm:inline select-none">|</span>
                  <div className="flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{mandatorySequence.length} Learning Resources</span>
                  </div>
                  <span className="text-slate-300 hidden sm:inline select-none">|</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Estimated {currentDayData.estimatedTime || '2.0 hours'}</span>
                  </div>
                </div>

              </div>

              {/* Right / Supporting Column: Learning Progress Panel (5 cols) */}
              <div className="lg:col-span-5">
                <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200/90 space-y-3.5 shadow-2xs">
                  
                  {/* Progress Header Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isDayFullyCompleted ? 'bg-emerald-500' : 'bg-brand-600 animate-pulse'}`} />
                      <span>Learning Progress</span>
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {completedMandatoryCount} of {mandatorySequence.length} completed
                    </span>
                  </div>

                  {/* Horizontal Progress Bar with Percentage */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-extrabold">
                      <span className="text-slate-500 font-medium text-[11px]">Today's Completion</span>
                      <span className={isDayFullyCompleted ? 'text-emerald-700' : 'text-brand-700'}>
                        {completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-200/80 overflow-hidden p-0.5">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          isDayFullyCompleted ? 'bg-emerald-600' : 'bg-brand-600'
                        }`}
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Progress Supporting Text */}
                  <p className={`text-xs ${isDayFullyCompleted ? 'text-emerald-700 font-bold' : 'text-slate-600 font-medium'}`}>
                    {progressSupportingText}
                  </p>

                  {/* Current Resource Information */}
                  <div className="pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      {isDayFullyCompleted ? 'Milestone:' : completedMandatoryCount === 0 ? 'Next up:' : 'Currently studying:'}
                    </span>
                    {isDayFullyCompleted ? (
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>All Content Reviewed</span>
                      </span>
                    ) : (
                      <span className="font-bold text-brand-700 flex items-center gap-1.5 truncate max-w-[200px]" title={RESOURCE_TITLES[currentActiveResource] || currentActiveResource}>
                        <Play className="w-2.5 h-2.5 fill-current text-brand-600 shrink-0" />
                        <span className="truncate">{RESOURCE_TITLES[currentActiveResource] || currentActiveResource}</span>
                      </span>
                    )}
                  </div>

                </div>
              </div>

            </div>

            {/* Bottom Row: Navigation Actions & Optional Live Session Banner */}
            <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Left Action: Previous Day */}
              <button
                type="button"
                onClick={() => prevDayNum && navigate(`/day/${prevDayNum}`)}
                disabled={!prevDayNum}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shrink-0 ${
                  prevDayNum
                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 cursor-pointer shadow-2xs'
                    : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                }`}
                title={prevDayNum ? `Review Day ${prevDayNum}` : 'No previous day'}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Day</span>
              </button>

              {/* Center / Right: Live Session Quick Pill (if scheduled) + Primary Resume + Next Day */}
              <div className="flex flex-wrap items-center gap-3">
                
                {/* CONDITIONAL Live Session badge (ONLY IF hasLiveSession is true!) */}
                {hasLiveSession && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                    <span>Live Session Today</span>
                    <span className="text-rose-400">•</span>
                    <span className="font-normal text-[11px] text-rose-700">{currentDayData.live?.time || '8:00 PM IST'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('live');
                        setLiveModalOpen(true);
                      }}
                      className="ml-1 text-rose-700 hover:text-rose-900 underline font-bold cursor-pointer"
                    >
                      Join →
                    </button>
                  </div>
                )}

                {/* Primary Action Button: Day Completed vs Resume Current */}
                {isDayFullyCompleted ? (
                  <button
                    type="button"
                    onClick={handleResumeCurrent}
                    className="px-5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Review Day Resources</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleResumeCurrent}
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm shadow-brand-600/20 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume Current Resource</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Next Day Button (Progression Enforced) */}
                <button
                  type="button"
                  onClick={handleNextDayClick}
                  disabled={!nextDayNum}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shrink-0 ${
                    !nextDayNum
                      ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                      : isDayFullyCompleted
                        ? 'bg-brand-600 hover:bg-brand-700 text-white border-brand-600 shadow-sm shadow-brand-600/20 cursor-pointer'
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 cursor-pointer'
                  }`}
                  title={isDayFullyCompleted ? `Advance to Day ${nextDayNum}` : `Complete Day ${currentNum} to unlock Day ${nextDayNum}`}
                >
                  <span>Next Day</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

              </div>
            </div>

          </div>



          {/* ========================================================================= */}
          {/* 5. Resource Navigation Bar                                                */}
          {/* Pill navigation + CONDITIONAL Live Session (Only if actually scheduled)   */}
          {/* ========================================================================= */}
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2 overflow-x-auto">
            
            {/* Video Lecture */}
            {mandatorySequence.includes('video') && (() => {
              const isDone = learningProgressService.isResourceCompleted(dayId, 'video', currentDayData);
              const isUnlocked = learningProgressService.isResourceUnlocked(dayId, 'video', currentDayData);
              const isActive = activeTab === 'video';
              return (
                <button
                  type="button"
                  onClick={() => handleSelectTab('video')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-xs'
                      : isDone
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        : isUnlocked
                          ? 'text-slate-700 hover:bg-slate-100'
                          : 'text-slate-400 bg-slate-50 border border-dashed border-slate-200 hover:bg-slate-100/70'
                  }`}
                  title={isDone ? 'Completed (Click to review)' : isUnlocked ? 'Available to study' : 'Locked: complete prior resources'}
                >
                  <Video className="w-4 h-4" />
                  <span>Video Lecture</span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {!isDone && !isUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
                </button>
              );
            })()}

            {/* Clinical PDF Notes */}
            {mandatorySequence.includes('notes') && (() => {
              const isDone = learningProgressService.isResourceCompleted(dayId, 'notes', currentDayData);
              const isUnlocked = learningProgressService.isResourceUnlocked(dayId, 'notes', currentDayData);
              const isActive = activeTab === 'notes';
              return (
                <button
                  type="button"
                  onClick={() => handleSelectTab('notes')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-xs'
                      : isDone
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        : isUnlocked
                          ? 'text-slate-700 hover:bg-slate-100'
                          : 'text-slate-400 bg-slate-50 border border-dashed border-slate-200 hover:bg-slate-100/70'
                  }`}
                  title={isDone ? 'Completed (Click to review)' : isUnlocked ? 'Available to study' : 'Locked: complete prior resources'}
                >
                  <FileText className="w-4 h-4" />
                  <span>Clinical PDF Notes</span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {!isDone && !isUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
                </button>
              );
            })()}

            {/* ECG & Clinical Diagrams */}
            {mandatorySequence.includes('images') && (() => {
              const isDone = learningProgressService.isResourceCompleted(dayId, 'images', currentDayData);
              const isUnlocked = learningProgressService.isResourceUnlocked(dayId, 'images', currentDayData);
              const isActive = activeTab === 'images';
              return (
                <button
                  type="button"
                  onClick={() => handleSelectTab('images')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-xs'
                      : isDone
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        : isUnlocked
                          ? 'text-slate-700 hover:bg-slate-100'
                          : 'text-slate-400 bg-slate-50 border border-dashed border-slate-200 hover:bg-slate-100/70'
                  }`}
                  title={isDone ? 'Completed (Click to review)' : isUnlocked ? 'Available to study' : 'Locked: complete prior resources'}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>ECG & Clinical Diagrams</span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {!isDone && !isUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
                </button>
              );
            })()}

            {/* Flashcards */}
            {mandatorySequence.includes('flashcards') && (() => {
              const isDone = learningProgressService.isResourceCompleted(dayId, 'flashcards', currentDayData);
              const isUnlocked = learningProgressService.isResourceUnlocked(dayId, 'flashcards', currentDayData);
              const isActive = activeTab === 'flashcards';
              return (
                <button
                  type="button"
                  onClick={() => handleSelectTab('flashcards')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-xs'
                      : isDone
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        : isUnlocked
                          ? 'text-slate-700 hover:bg-slate-100'
                          : 'text-slate-400 bg-slate-50 border border-dashed border-slate-200 hover:bg-slate-100/70'
                  }`}
                  title={isDone ? 'Completed (Click to review)' : isUnlocked ? 'Available to study' : 'Locked: complete prior resources'}
                >
                  <Brain className="w-4 h-4" />
                  <span>Flashcards</span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {!isDone && !isUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
                </button>
              );
            })()}

            {/* Clinical Assessment (if day has test) */}
            {mandatorySequence.includes('test') && (() => {
              const isDone = learningProgressService.isResourceCompleted(dayId, 'test', currentDayData);
              const isUnlocked = learningProgressService.isResourceUnlocked(dayId, 'test', currentDayData);
              const isActive = activeTab === 'test';
              return (
                <button
                  type="button"
                  onClick={() => handleSelectTab('test')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-xs'
                      : isDone
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : isUnlocked
                          ? 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                          : 'text-slate-400 bg-slate-50 border border-dashed border-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  <span>CBT Test Series</span>
                  {!isDone && !isUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
                </button>
              );
            })()}

            {/* CONDITIONAL Live Session (Only rendered if hasLiveSession is true!) */}
            {hasLiveSession && (
              <button
                type="button"
                onClick={() => handleSelectTab('live')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'live'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>🔴 Live Session</span>
              </button>
            )}

          </div>

          {/* ========================================================================= */}
          {/* 6. Main Study Area — Single Focused Resource Viewer                       */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
            
            {/* Context Sub-header Banner */}
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    {isActiveTabCompleted ? 'Reviewing Completed Resource' : 'Current Active Resource'}
                  </span>
                  {isActiveTabCompleted && (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Completed</span>
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {activeTab === 'video' && (currentDayData.video?.title || `Video Masterclass: ${currentDayData.title}`)}
                  {activeTab === 'notes' && (activePdf?.title || `Clinical PDF Notes: ${currentDayData.title}`)}
                  {activeTab === 'images' && `ECG & High-Resolution Clinical Diagrams`}
                  {activeTab === 'flashcards' && `Spaced-Repetition Active Recall Flashcards`}
                  {activeTab === 'live' && (currentDayData.live?.title || `Live Clinical Grand Rounds`)}
                  {activeTab === 'test' && `Subject CBT Clinical Examination`}
                </h3>
              </div>

              {/* Status Info on Right */}
              <div className="text-right">
                {activeTab === 'video' && (
                  <span className="text-xs text-slate-500 font-medium">
                    Duration: {currentDayData.video?.duration || '42 mins'}
                  </span>
                )}
                {activeTab === 'notes' && (
                  <span className="text-xs text-slate-500 font-medium">
                    Page {pdfPage} of {totalPdfPages}
                  </span>
                )}
                {activeTab === 'images' && (
                  <span className="text-xs text-slate-500 font-medium">
                    {viewedImageIds.size} of {currentDayData.images?.length || 2} Inspected
                  </span>
                )}
                {activeTab === 'flashcards' && (
                  <span className="text-xs text-slate-500 font-medium">
                    Card {currentFlashcardIndex + 1} of {Math.max(flashcardsList.length, 1)}
                  </span>
                )}
                {activeTab === 'live' && (
                  <span className="text-xs font-bold text-rose-600">
                    Tonight • 08:00 PM IST
                  </span>
                )}
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* Tab 1: Video Player Viewer                                            */}
            {/* --------------------------------------------------------------------- */}
            {activeTab === 'video' && (
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Simulated High-Definition Video Player Container */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex flex-col justify-between p-4 shadow-inner">
                  
                  {/* Top Video Overlay Bar */}
                  <div className="flex items-center justify-between text-white/90 z-10 text-xs">
                    <span className="bg-black/60 backdrop-blur-xs px-3 py-1 rounded-full font-semibold">
                      {currentDayData.video?.title || currentDayData.title}
                    </span>
                    <span className="bg-brand-600/90 text-white font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                      4K Ultra-Clear
                    </span>
                  </div>

                  {/* Center Play/Pause Trigger */}
                  <div className="flex items-center justify-center my-auto z-10">
                    <button
                      type="button"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-16 h-16 rounded-full bg-brand-600/90 hover:bg-brand-600 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-105 cursor-pointer"
                    >
                      {isPlaying ? (
                        <Pause className="w-7 h-7" />
                      ) : (
                        <Play className="w-7 h-7 fill-current ml-1" />
                      )}
                    </button>
                  </div>

                  {/* Bottom Video Controls & Playback Track */}
                  <div className="space-y-2 z-10 text-white bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 rounded-xl">
                    <div className="w-full bg-white/30 h-2 rounded-full overflow-hidden cursor-pointer">
                      <div 
                        className="bg-brand-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${videoProgress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <button 
                          type="button" 
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="hover:text-brand-400 font-bold cursor-pointer"
                        >
                          {isPlaying ? 'Pause' : 'Play'}
                        </button>
                        <span className="text-white/70">
                          {Math.floor((videoProgress * 42) / 100)} mins / 42 mins ({videoProgress}%)
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-white/70">
                          Playback Speed:
                        </span>
                        {['1.0x', '1.5x', '2.0x'].map((spd) => (
                          <button
                            key={spd}
                            type="button"
                            onClick={() => setPlaybackSpeed(spd)}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              playbackSpeed === spd ? 'bg-brand-600 text-white' : 'bg-white/20 text-white/80'
                            }`}
                          >
                            {spd}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Video Description & Bottom Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">
                      Instructor: {currentDayData.facultyName || 'Dr. Siddharth V. (AIIMS New Delhi)'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Watch at least 95% of the masterclass to automatically fulfill this milestone, or complete below.
                    </p>
                  </div>

                  {/* Resource Completion Action */}
                  <div className="shrink-0">
                    {isActiveTabCompleted ? (
                      <div className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center gap-2 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Video Masterclass Completed ✓</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCompleteResource('video')}
                        className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-brand-600/20 cursor-pointer"
                      >
                        <span>Mark Video Complete & Advance</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* Tab 2: PDF Document Viewer                                            */}
            {/* --------------------------------------------------------------------- */}
            {activeTab === 'notes' && (
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* PDF Page View Card */}
                <div className="bg-slate-100/90 rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-6 min-h-[420px] flex flex-col justify-between shadow-inner">
                  
                  {/* Top Document Metadata Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-rose-600" />
                        <h4 className="text-sm font-bold text-slate-900">
                          {activePdf.fileName || 'Clinical_Revision_Guide.pdf'}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Author: {activePdf.author || 'Dr. Siddharth V.'} • Size: {activePdf.size || '4.8 MB'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFullscreenPdfOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Maximize className="w-3.5 h-3.5" />
                        <span>Fullscreen</span>
                      </button>
                    </div>
                  </div>

                  {/* Simulated Reading Page Content */}
                  <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-4 my-auto max-w-3xl mx-auto w-full">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-black uppercase text-brand-700">
                        Section {pdfPage}: High-Yield Clinical Guidelines
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        Page {pdfPage} / {totalPdfPages}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <p className="font-bold text-slate-900">
                        Hemodynamic Diagnostics: Valvular Stenosis vs Regurgitation
                      </p>
                      <p>
                        In severe aortic stenosis, the valve orifice area narrows to less than 1.0 cm² (or index &lt; 0.6 cm²/m²), producing a mean pressure gradient exceeding 40 mmHg. Patients typically experience the classic symptom triad: Dyspnea (2-year survival), Syncope (3-year survival), and Angina (5-year survival).
                      </p>
                      <p className="p-3 bg-brand-50/60 rounded-xl border border-brand-100 text-brand-950 font-medium">
                        Pearls: Handgrip isometric exercise increases systemic vascular resistance, accentuating regurgitant murmurs (MR, AR) while softening the ejection systolic murmur of AS.
                      </p>
                    </div>
                  </div>

                  {/* Page Navigation Controls */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 text-xs">
                    <button
                      type="button"
                      onClick={handlePdfPrevPage}
                      disabled={pdfPage <= 1}
                      className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 border ${
                        pdfPage > 1
                          ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 cursor-pointer shadow-2xs'
                          : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous Page</span>
                    </button>

                    <span className="font-bold text-slate-700">
                      Page {pdfPage} of {totalPdfPages}
                    </span>

                    <button
                      type="button"
                      onClick={handlePdfNextPage}
                      disabled={pdfPage >= totalPdfPages}
                      className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 border ${
                        pdfPage < totalPdfPages
                          ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 cursor-pointer shadow-2xs'
                          : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      <span>Next Page</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

                {/* PDF Bottom Completion Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-800">
                      Reading Milestone: Page {pdfPage} of {totalPdfPages}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Progress is saved automatically so you can resume where you left off.
                    </p>
                  </div>

                  <div className="shrink-0">
                    {isActiveTabCompleted ? (
                      <div className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center gap-2 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>PDF Notes Completed ✓</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCompleteResource('notes')}
                        className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-brand-600/20 cursor-pointer"
                      >
                        <span>Complete Reading & Advance</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* Tab 3: ECG & Clinical Diagrams Viewer                                 */}
            {/* --------------------------------------------------------------------- */}
            {activeTab === 'images' && (
              <div className="p-6 sm:p-8 space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Interactive Clinical ECG Lightbox & Auscultation Loops
                    </h4>
                    <p className="text-xs text-slate-500">
                      Click any case diagram below to open in ultra-high resolution zoom.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-xl border border-brand-200">
                    {viewedImageIds.size} of {(currentDayData.images?.length || 2)} Inspected
                  </span>
                </div>

                {/* Cases Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(currentDayData.images || [
                    { id: 1, title: 'Wiggers Hemodynamic Diagram', caption: 'Ventricular pressure curves and heart sound timings.' },
                    { id: 2, title: 'Color Doppler Echo: Severe MR', caption: 'Regurgitant jet reaching left atrial posterior wall.' }
                  ]).map((img, idx) => {
                    const isInspected = viewedImageIds.has(img.id || idx + 1);

                    return (
                      <div
                        key={img.id || idx}
                        onClick={() => handleInspectImage(img.id || idx + 1, idx)}
                        className={`group rounded-2xl border p-4 transition-all cursor-pointer space-y-3 ${
                          isInspected
                            ? 'bg-slate-50/70 border-emerald-200 shadow-2xs hover:border-emerald-300'
                            : 'bg-white border-slate-200 shadow-xs hover:border-brand-400 hover:shadow-sm'
                        }`}
                      >
                        {/* Image Thumbnail Preview */}
                        <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 flex items-center justify-center">
                          <img
                            src={img.url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80'}
                            alt={img.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <span className="w-10 h-10 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Maximize2 className="w-4 h-4" />
                            </span>
                          </div>

                          {isInspected && (
                            <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Inspected</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <h5 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                            Case #{idx + 1}: {img.title}
                          </h5>
                          <p className="text-[11px] text-slate-500 leading-snug">
                            {img.caption || 'Click to examine clinical findings and diagnostic markers.'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Images Bottom Completion Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-800">
                      Inspected: {viewedImageIds.size} of {(currentDayData.images?.length || 2)} diagrams
                    </h4>
                    <p className="text-xs text-slate-500">
                      Examine all clinical cases to complete this milestone.
                    </p>
                  </div>

                  <div className="shrink-0">
                    {isActiveTabCompleted ? (
                      <div className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center gap-2 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>All Cases Inspected ✓</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCompleteResource('images')}
                        className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-brand-600/20 cursor-pointer"
                      >
                        <span>Complete Diagrams & Advance</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* Tab 4: Flashcards Spaced Repetition Viewer                             */}
            {/* --------------------------------------------------------------------- */}
            {activeTab === 'flashcards' && (
              <div className="p-6 sm:p-8 space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Spaced-Repetition Active Recall
                    </h4>
                    <p className="text-xs text-slate-500">
                      Tap the card to reveal the diagnostic criteria and pharmacology rationale.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                    Card {currentFlashcardIndex + 1} of {Math.max(flashcardsList.length, 1)}
                  </span>
                </div>

                {/* Flip Card Container */}
                <div
                  onClick={handleFlipFlashcard}
                  className="rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/70 p-8 sm:p-12 min-h-[260px] flex flex-col justify-between cursor-pointer hover:border-brand-400 hover:shadow-md transition-all shadow-xs select-none"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold border-b border-slate-100 pb-3">
                    <span className="uppercase tracking-wider">
                      {flashcardFlipped ? 'Answer & Rationale' : 'Clinical Prompt'}
                    </span>
                    <span className="text-brand-600 font-bold">
                      Click Card to Flip ⟳
                    </span>
                  </div>

                  <div className="my-auto py-6 text-center">
                    {flashcardFlipped ? (
                      <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed max-w-xl mx-auto animate-in fade-in">
                        {flashcardsList[currentFlashcardIndex]?.answer || 'Valsalva maneuver strain phase and standing up.'}
                      </p>
                    ) : (
                      <p className="text-base sm:text-lg font-black text-slate-800 leading-relaxed max-w-xl mx-auto">
                        {flashcardsList[currentFlashcardIndex]?.question || 'Which physical exam maneuver uniquely increases the murmur of HCM and MVP?'}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400">
                    <span>Card #{currentFlashcardIndex + 1}</span>
                    <span>Reviewed: {reviewedCardIndices.size} of {Math.max(flashcardsList.length, 1)}</span>
                  </div>
                </div>

                {/* Flashcard Next/Prev Controls */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrevFlashcard}
                    disabled={currentFlashcardIndex <= 0}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      currentFlashcardIndex > 0
                        ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 cursor-pointer shadow-2xs'
                        : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextFlashcard}
                    disabled={currentFlashcardIndex >= flashcardsList.length - 1}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      currentFlashcardIndex < flashcardsList.length - 1
                        ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 cursor-pointer shadow-2xs'
                        : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <span>Next Card</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Flashcards Bottom Completion Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-800">
                      Reviewed: {reviewedCardIndices.size} of {Math.max(flashcardsList.length, 1)} cards
                    </h4>
                    <p className="text-xs text-slate-500">
                      Flip through all flashcards to cement active recall.
                    </p>
                  </div>

                  <div className="shrink-0">
                    {isActiveTabCompleted ? (
                      <div className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center gap-2 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Flashcard Deck Completed ✓</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCompleteResource('flashcards')}
                        className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-brand-600/20 cursor-pointer"
                      >
                        <span>Complete Flashcards & Advance</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* Tab 5: Live Session Viewer (CONDITIONAL — ONLY IF SCHEDULED)           */}
            {/* --------------------------------------------------------------------- */}
            {activeTab === 'live' && hasLiveSession && (
              <div className="p-6 sm:p-8 space-y-6">
                
                <div className="rounded-3xl bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-brand-500/10 p-6 sm:p-8 border border-rose-200 shadow-2xs space-y-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                    <span className="text-xs font-black uppercase tracking-wider text-rose-700">
                      Live Clinical Grand Rounds
                    </span>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 ml-auto">
                      Interactive Live Session
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {currentDayData.live?.title || `Live Case Presentation: ${currentDayData.title}`}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Led by: {currentDayData.live?.faculty || currentDayData.facultyName || 'Dr. Siddharth V. (Clinical Specialist)'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700 pt-1">
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                      <Clock className="w-3.5 h-3.5 text-rose-600" />
                      <span>Tonight • 08:00 PM - 09:00 PM IST</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                      <Radio className="w-3.5 h-3.5 text-purple-600" />
                      <span>Platform: Zoom Live Interactive</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 space-y-2 text-xs text-slate-600">
                    <p className="font-bold text-slate-800">
                      Session Agenda:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Real patient hemodynamic auscultation audio and phonocardiograms</li>
                      <li>High-yield diagnostic traps frequently tested in NEET PG / NExT</li>
                      <li>Live two-way doubt clearance and question breakdown</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2">
                    <p className="text-[11px] text-slate-500 italic">
                      Note: Clinical grand rounds conducted live by faculty.
                    </p>

                    <button
                      type="button"
                      onClick={() => setLiveModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-rose-600/20 cursor-pointer shrink-0"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Join Live Session</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* Tab 6: Test Series Viewer                                             */}
            {/* --------------------------------------------------------------------- */}
            {activeTab === 'test' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="rounded-3xl bg-amber-50 p-6 sm:p-8 border border-amber-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-black text-amber-950">
                      Grand Mock Test & Clinical Assessment
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Test your mastery on clinical vignettes under official timed examination constraints with AI-powered weak-subject diagnosis and percentile analytics.
                  </p>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                    <span>50 Multi-Step Questions</span>
                    <span>•</span>
                    <span>60 Minutes</span>
                    <span>•</span>
                    <span>NExT / NEET PG Aligned</span>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/test/test-${currentNum}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm"
                    >
                      <span>Launch CBT Assessment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ========================================================================= */}
          {/* 7. Secondary Study Tools: Personal Notepad & Ask Faculty Doubt             */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            
            {/* Tool 1: Personal Study Notepad */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-brand-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Personal Study Notepad
                  </h4>
                </div>
                {notesSaved && (
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3 h-3" />
                    <span>Saved!</span>
                  </span>
                )}
              </div>

              <textarea
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                placeholder="Write down high-yield clinical notes and reminders for this study day..."
                rows={4}
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none font-medium"
              />

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Saved locally in your browser session</span>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Notes</span>
                </button>
              </div>
            </div>

            {/* Tool 2: Ask a Doubt to Faculty */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Ask a Doubt to Faculty
                  </h4>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Confused about a hemodynamic murmur, ECG lead criteria, or clinical guideline? Submit a question directly to specialist faculty.
                </p>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs text-slate-600">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Assigned Faculty:</span>
                  <p className="font-bold text-slate-800">
                    {currentDayData.facultyName || 'Dr. Siddharth V. (MD Cardiology)'}
                  </p>
                  <p className="text-[11px] text-slate-500">Average response time: &lt; 2 hours</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setDoubtModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Submit a Question / Doubt</span>
                </button>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 8. Discreet Developer Simulator Bar (For Testing)                          */}
          {/* ========================================================================= */}
          <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Study Room Simulator • Active: <strong className="text-slate-900">{RESOURCE_TITLES[activeTab] || activeTab}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSimulateAdvanceResource}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-brand-50 text-brand-700 border border-slate-200 font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Complete active resource and advance sequence"
              >
                <span>Advance Resource (+1)</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={handleSimulateResetDay}
                className="p-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-all cursor-pointer"
                title="Reset Day progression"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </main>
      </div>

      {/* ========================================================================= */}
      {/* 9. Lightbox & Auxiliary Modals                                            */}
      {/* ========================================================================= */}
      {lightboxOpen && (
        <ImageLightboxModal
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          images={currentDayData.images || []}
          initialIndex={lightboxActiveIndex}
        />
      )}

      {doubtModalOpen && (
        <AskDoubtModal
          isOpen={doubtModalOpen}
          onClose={() => setDoubtModalOpen(false)}
          dayNumber={currentNum}
          dayTitle={currentDayData.title}
        />
      )}

      {liveModalOpen && (
        <LiveSessionModal
          isOpen={liveModalOpen}
          onClose={() => setLiveModalOpen(false)}
          session={currentDayData.live}
        />
      )}

    </div>
  );
}

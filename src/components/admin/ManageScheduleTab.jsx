import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Layers, 
  FolderTree, 
  Sparkles, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  Eye, 
  ArrowRight, 
  Filter, 
  Video, 
  Brain, 
  FileText, 
  Check, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  List,
  RotateCcw,
  Activity,
  Play,
  Maximize2,
  FileCheck,
  CheckSquare,
  Square
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';

export default function ManageScheduleTab() {
  const [exams, setExams] = useState(() => catalogService.getExams());
  const [selectedExamId, setSelectedExamId] = useState('neet-pg');

  const [subjects, setSubjects] = useState(() => curriculumService.getSubjects());
  const [chapters, setChapters] = useState(() => curriculumService.getChapters());
  const [topics, setTopics] = useState(() => curriculumService.getTopics());
  const [schedule, setSchedule] = useState(() => curriculumService.getSchedule('neet-pg'));

  const [selectedWeek, setSelectedWeek] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (7-day matrix) | 'list' (tabular)
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modal State for Schedule Slot Editor
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  // Form State
  const [formWeekNumber, setFormWeekNumber] = useState(1);
  const [formDayNumber, setFormDayNumber] = useState(1);
  const [formDayTitle, setFormDayTitle] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formChapterId, setFormChapterId] = useState('');
  const [formSelectedTopicIds, setFormSelectedTopicIds] = useState([]);
  const [formDate, setFormDate] = useState('2026-09-08');
  const [formDuration, setFormDuration] = useState('1.5 hours');
  const [formHasLive, setFormHasLive] = useState(false);
  const [formHasTest, setFormHasTest] = useState(false);
  const [formStatus, setFormStatus] = useState('Active');

  // Preview Modal State (In-page Student LMS Experience)
  const [previewSlot, setPreviewSlot] = useState(null);
  const [previewActiveTab, setPreviewActiveTab] = useState('notes');
  const [previewCardFlipped, setPreviewCardFlipped] = useState(false);
  const [previewCardIdx, setPreviewCardIdx] = useState(0);

  // Delete Confirmation State
  const [deletingSlot, setDeletingSlot] = useState(null);

  // Synchronize state from services
  useEffect(() => {
    const unsubCurriculum = curriculumService.subscribeCurriculum(() => {
      setSubjects(curriculumService.getSubjects());
      setChapters(curriculumService.getChapters());
      setTopics(curriculumService.getTopics());
    });
    const unsubSchedule = curriculumService.subscribeSchedule(() => {
      setSchedule(curriculumService.getSchedule(selectedExamId));
    });
    return () => {
      unsubCurriculum();
      unsubSchedule();
    };
  }, [selectedExamId]);

  // Update schedule when exam selector changes
  useEffect(() => {
    setSchedule(curriculumService.getSchedule(selectedExamId));
    setSelectedWeek(1);
  }, [selectedExamId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const selectedExam = useMemo(() => {
    return exams.find(e => e.id === selectedExamId) || exams[0];
  }, [exams, selectedExamId]);

  // Available weeks for this exam (e.g. 1 to 4 or max from exam)
  const availableWeeks = useMemo(() => {
    const maxWeeks = Math.min(selectedExam.weeks || 4, 12);
    return Array.from({ length: maxWeeks }, (_, i) => i + 1);
  }, [selectedExam]);

  // All slots for the active exam
  const examSchedule = useMemo(() => {
    return schedule.filter(s => s.examId === selectedExamId);
  }, [schedule, selectedExamId]);

  // Slots for the currently selected week
  const weekSlots = useMemo(() => {
    return examSchedule.filter(s => s.weekNumber === selectedWeek);
  }, [examSchedule, selectedWeek]);

  // 7 Days of the currently selected week (Day 1..7 for Week 1, Day 8..14 for Week 2, etc.)
  const weekDayNumbers = useMemo(() => {
    const startDay = (selectedWeek - 1) * 7 + 1;
    return Array.from({ length: 7 }, (_, i) => startDay + i);
  }, [selectedWeek]);

  // Available subjects for the active exam
  const examSubjects = useMemo(() => {
    return subjects.filter(s => s.examId === selectedExamId);
  }, [subjects, selectedExamId]);

  // Available chapters based on formSubjectId
  const subjectChapters = useMemo(() => {
    if (!formSubjectId) return [];
    return chapters.filter(c => c.subjectId === formSubjectId);
  }, [chapters, formSubjectId]);

  // Available topics based on formChapterId
  const chapterTopics = useMemo(() => {
    if (!formChapterId) return [];
    return topics.filter(t => t.chapterId === formChapterId);
  }, [topics, formChapterId]);

  // Metrics computation for KPI Banner
  const metrics = useMemo(() => {
    const totalDays = examSchedule.length;
    const allLinkedTopicIds = new Set();
    let totalMinutes = 0;
    let totalPdfs = 0;
    let totalImages = 0;
    let totalCards = 0;

    examSchedule.forEach(slot => {
      (slot.topicIds || []).forEach(tid => allLinkedTopicIds.add(tid));
      
      // Parse duration
      const durMatch = (slot.estimatedTime || '').match(/([\d.]+)\s*hour/i);
      if (durMatch) {
        totalMinutes += parseFloat(durMatch[1]) * 60;
      } else {
        totalMinutes += 90;
      }
    });

    topics.filter(t => allLinkedTopicIds.has(t.id)).forEach(t => {
      if (t.content) {
        totalPdfs += (t.content.pdfList?.length || (t.content.pdf ? 1 : 0));
        totalImages += (t.content.images?.length || 0);
        totalCards += (t.content.flashcards?.length || 0);
      }
    });

    return {
      scheduledDays: totalDays,
      targetDays: selectedExam.weeks ? selectedExam.weeks * 7 : 28,
      activeTopics: allLinkedTopicIds.size,
      studyHours: (totalMinutes / 60).toFixed(1),
      totalPdfs,
      totalImages,
      totalCards
    };
  }, [examSchedule, selectedExam, topics]);

  // Open Modal for Schedule Day
  const handleOpenModal = (slot = null, targetDay = null) => {
    if (slot) {
      setEditingSlot(slot);
      setFormWeekNumber(slot.weekNumber);
      setFormDayNumber(slot.dayNumber);
      setFormDayTitle(slot.dayTitle);
      setFormSubjectId(slot.subjectId || examSubjects[0]?.id || '');
      setFormChapterId(slot.chapterId || '');
      setFormSelectedTopicIds(slot.topicIds || []);
      setFormDate(slot.scheduledDate || new Date().toISOString().split('T')[0]);
      setFormDuration(slot.estimatedTime || '1.5 hours');
      setFormHasLive(Boolean(slot.hasLive));
      setFormHasTest(Boolean(slot.hasTest));
      setFormStatus(slot.status || 'Active');
    } else {
      setEditingSlot(null);
      const dayNum = targetDay || ((selectedWeek - 1) * 7 + (weekSlots.length + 1));
      setFormWeekNumber(selectedWeek);
      setFormDayNumber(dayNum);
      
      const defaultSub = examSubjects[0]?.id || '';
      setFormSubjectId(defaultSub);
      const defaultChaps = chapters.filter(c => c.subjectId === defaultSub);
      const defaultChap = defaultChaps[0] || null;
      setFormChapterId(defaultChap?.id || '');

      const defaultTopics = defaultChap ? topics.filter(t => t.chapterId === defaultChap.id) : [];
      setFormSelectedTopicIds(defaultTopics.slice(0, 1).map(t => t.id));
      
      setFormDayTitle(
        defaultChap 
          ? `Day ${dayNum} — ${defaultChap.title}` 
          : `Day ${dayNum} — Clinical Diagnostic Study`
      );

      // Default date computed by day offset
      const baseDate = new Date('2026-09-08');
      baseDate.setDate(baseDate.getDate() + (dayNum - 1));
      setFormDate(baseDate.toISOString().split('T')[0]);

      setFormDuration('1.5 hours');
      setFormHasLive(dayNum % 3 === 0);
      setFormHasTest(dayNum % 7 === 0);
      setFormStatus('Active');
    }
    setIsModalOpen(true);
  };

  const handleToggleTopicSelection = (topicId) => {
    setFormSelectedTopicIds(prev => 
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    );
  };

  const handleSelectAllTopics = () => {
    const allIds = chapterTopics.map(t => t.id);
    setFormSelectedTopicIds(allIds);
  };

  const handleClearAllTopics = () => {
    setFormSelectedTopicIds([]);
  };

  const handleAutoFillTitleFromChapter = () => {
    const chap = chapters.find(c => c.id === formChapterId);
    if (chap) {
      setFormDayTitle(`Day ${formDayNumber} — ${chap.title}`);
    }
  };

  const handleSaveSlot = (e) => {
    e.preventDefault();
    if (!formDayNumber || !formSubjectId) {
      alert('Please specify day number and subject.');
      return;
    }

    const saved = curriculumService.saveScheduleSlot({
      ...(editingSlot ? { id: editingSlot.id } : {}),
      examId: selectedExamId,
      weekNumber: Number(formWeekNumber),
      weekTitle: `Week ${formWeekNumber}`,
      dayNumber: Number(formDayNumber),
      dayTitle: formDayTitle.trim() || `Day ${formDayNumber}`,
      subjectId: formSubjectId,
      chapterId: formChapterId,
      topicIds: formSelectedTopicIds,
      scheduledDate: formDate,
      estimatedTime: formDuration,
      hasLive: formHasLive,
      hasTest: formHasTest,
      status: formStatus
    });

    setSchedule(curriculumService.getSchedule(selectedExamId));
    setIsModalOpen(false);
    showToast(editingSlot ? `Day ${formDayNumber} schedule updated!` : `Day ${formDayNumber} scheduled with ${formSelectedTopicIds.length} topics!`);
  };

  const handleDeleteSlot = () => {
    if (!deletingSlot) return;
    curriculumService.deleteScheduleSlot(deletingSlot.id);
    setSchedule(curriculumService.getSchedule(selectedExamId));
    setDeletingSlot(null);
    showToast('Schedule slot removed.');
  };

  // Open In-Page Student Learning Room Preview
  const handleOpenPreview = (slot) => {
    setPreviewSlot(slot);
    setPreviewActiveTab('notes');
    setPreviewCardFlipped(false);
    setPreviewCardIdx(0);
  };

  // Resolved Preview Content
  const resolvedPreviewContent = useMemo(() => {
    if (!previewSlot) return null;
    return curriculumService.getDayResolvedContent(previewSlot.dayNumber, selectedExamId);
  }, [previewSlot, selectedExamId]);

  // List View Filtered Slots
  const filteredListSlots = useMemo(() => {
    return examSchedule.filter(slot => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const sub = subjects.find(s => s.id === slot.subjectId);
      const chap = chapters.find(c => c.id === slot.chapterId);
      return (
        slot.dayTitle.toLowerCase().includes(q) ||
        String(slot.dayNumber).includes(q) ||
        (sub?.name || '').toLowerCase().includes(q) ||
        (chap?.title || '').toLowerCase().includes(q)
      );
    });
  }, [examSchedule, searchQuery, subjects, chapters]);

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
            <Calendar className="w-3.5 h-3.5" />
            <span>Academic Schedule & Day Mapping Planner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Study Schedule & Drip Planner
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Link subjects, chapters, and clinical topics to specific Weeks and Days. Students automatically unlock these exact PDFs, high-yield diagnostic diagrams, video lectures, and flashcards in their daily study plan.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            id="btn-schedule-day"
            onClick={() => handleOpenModal(null)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition-all hover:shadow-emerald-500/20 active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Schedule Day / Link Topic</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Dashboard Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Metric 1: Track */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            Active Track
          </span>
          <div className="text-sm sm:text-base font-black text-slate-900 truncate">
            {selectedExam.flag} {selectedExam.name}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {selectedExam.weeks || 4} Weeks Curriculum
          </div>
        </div>

        {/* Metric 2: Scheduled Days */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            Scheduled Days
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            {metrics.scheduledDays} <span className="text-xs text-slate-400 font-normal">/ {metrics.targetDays}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.round((metrics.scheduledDays / metrics.targetDays) * 100))}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Active Topics Linked */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-sky-500" />
            Active Topics
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            {metrics.activeTopics} <span className="text-xs text-slate-400 font-normal">Topics</span>
          </div>
          <div className="text-[10px] text-sky-600 font-bold">
            Assigned to study slots
          </div>
        </div>

        {/* Metric 4: Planned Study Hours */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Study Duration
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            {metrics.studyHours} <span className="text-xs text-slate-400 font-normal">Hours</span>
          </div>
          <div className="text-[10px] text-amber-700 font-bold">
            Total curriculum load
          </div>
        </div>

        {/* Metric 5: Sync Status */}
        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            LMS Live Sync
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black text-emerald-700">Synchronized</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Feeds /day/:dayNumber dynamically
          </div>
        </div>

      </div>

      {/* Control Navigation Toolbar: Exam Pills + Week Pills + View Mode */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        
        {/* Row 1: Exam Track Selector */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-1 shrink-0 flex items-center gap-1.5 mr-1">
              <Filter className="w-3 h-3" />
              Exam Track:
            </span>
            {exams.map(exam => (
              <button
                key={exam.id}
                onClick={() => setSelectedExamId(exam.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  selectedExamId === exam.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{exam.flag}</span>
                <span>{exam.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedExamId === exam.id ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-600'
                }`}>
                  {exam.enrolledStudents || 0} students
                </span>
              </button>
            ))}
          </div>

          {/* View Mode Toggle Switch */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>7-Day Week Matrix</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Slots List ({examSchedule.length})</span>
            </button>
          </div>
        </div>

        {/* Row 2: Week Selector Pills */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-1 shrink-0 flex items-center gap-1.5 mr-1">
              <Calendar className="w-3 h-3" />
              Select Week:
            </span>
            {availableWeeks.map(wk => {
              const count = examSchedule.filter(s => s.weekNumber === wk).length;
              return (
                <button
                  key={wk}
                  onClick={() => setSelectedWeek(wk)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                    selectedWeek === wk
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>Week {wk}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    selectedWeek === wk 
                      ? 'bg-emerald-700 text-emerald-100' 
                      : count > 0 ? 'bg-slate-200 text-slate-700' : 'bg-slate-200/60 text-slate-400'
                  }`}>
                    {count}/7 Days
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={selectedWeek <= 1}
              onClick={() => setSelectedWeek(prev => Math.max(1, prev - 1))}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700">
              Week {selectedWeek} of {availableWeeks.length}
            </span>
            <button
              disabled={selectedWeek >= availableWeeks.length}
              onClick={() => setSelectedWeek(prev => Math.min(availableWeeks.length, prev + 1))}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: 7-DAY WEEK MATRIX (DEFAULT GRID MODE)                             */}
      {/* ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Week {selectedWeek} Schedule Board</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {weekSlots.length} of 7 Days Scheduled
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Days {weekDayNumbers[0]} to {weekDayNumbers[6]} • Click any empty day to assign chapters & clinical topics
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="hidden sm:inline italic">Tip: Click "Preview Student View" to inspect the day's study room</span>
            </div>
          </div>

          {/* 7-Day Calendar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {weekDayNumbers.map((dayNum, index) => {
              const slot = weekSlots.find(s => Number(s.dayNumber) === Number(dayNum));
              const dayOfWeekNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
              const weekday = dayOfWeekNames[index % 7];

              // If slot exists, render the rich Scheduled Day Card
              if (slot) {
                const subject = subjects.find(s => s.id === slot.subjectId);
                const chapter = chapters.find(c => c.id === slot.chapterId);
                const linkedTopics = topics.filter(t => (slot.topicIds || []).includes(t.id));

                // Compute total content assets
                let totalPdfs = 0;
                let totalImgs = 0;
                let hasVideo = false;
                let totalCards = 0;

                linkedTopics.forEach(t => {
                  if (t.content) {
                    totalPdfs += (t.content.pdfList?.length || (t.content.pdf ? 1 : 0));
                    totalImgs += (t.content.images?.length || 0);
                    if (t.content.video) hasVideo = true;
                    totalCards += (t.content.flashcards?.length || 0);
                  }
                });

                return (
                  <div
                    key={slot.id || dayNum}
                    className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-emerald-300"
                  >
                    <div className="p-5 space-y-3.5">
                      
                      {/* Top Header: Day Pill + Weekday + Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-900 text-white shadow-2xs">
                            Day {slot.dayNumber}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">
                            {weekday}
                          </span>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          slot.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : slot.status === 'Scheduled'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          {slot.status}
                        </span>
                      </div>

                      {/* Day Title & Duration */}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                          {slot.dayTitle}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{slot.estimatedTime || '1.5 hours'}</span>
                          <span>•</span>
                          <span>{slot.scheduledDate}</span>
                        </span>
                      </div>

                      {/* Hierarchy Badge: Subject -> Chapter */}
                      <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 flex items-center gap-1 truncate">
                          <Layers className="w-3 h-3 shrink-0" />
                          <span className="truncate">{subject?.name || slot.subjectName || 'Unassigned Subject'}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1 truncate">
                          <FolderTree className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{chapter?.title || slot.chapterTitle || 'Unassigned Chapter'}</span>
                        </div>
                      </div>

                      {/* Linked Topics Snippet */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                          <span>Topics Linked ({linkedTopics.length})</span>
                        </div>

                        {linkedTopics.length === 0 ? (
                          <p className="text-[11px] text-amber-600 italic flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            No topics linked to this day.
                          </p>
                        ) : (
                          <div className="space-y-1">
                            {linkedTopics.slice(0, 2).map(t => (
                              <div key={t.id} className="text-[11px] font-semibold text-slate-800 bg-white border border-slate-200 px-2 py-1 rounded-lg truncate">
                                • {t.title}
                              </div>
                            ))}
                            {linkedTopics.length > 2 && (
                              <div className="text-[10px] text-slate-400 font-bold pl-1">
                                + {linkedTopics.length - 2} more topic(s)
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Content Assets Summary Pills */}
                      <div className="flex items-center gap-1 flex-wrap pt-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                          <FileText className="w-2.5 h-2.5" />
                          {totalPdfs} PDF
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100">
                          {totalImgs} Img
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                          hasVideo ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <Video className="w-2.5 h-2.5" />
                          {hasVideo ? 'Video' : 'No Vid'}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                          <Brain className="w-2.5 h-2.5" />
                          {totalCards} Cards
                        </span>

                        {slot.hasLive && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                            🔴 Live
                          </span>
                        )}
                        {slot.hasTest && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                            📝 CBT
                          </span>
                        )}
                      </div>

                    </div>

                    {/* Card Actions Footer */}
                    <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenModal(slot)}
                          title="Edit Day Schedule"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenPreview(slot)}
                          title="Quick Preview Student View"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingSlot(slot)}
                          title="Remove Day Schedule"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Direct Student View External Link */}
                      <a
                        href={`/day/${slot.dayNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
                        title="Open full learning room in new tab"
                      >
                        <span>Student View</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              }

              // If slot DOES NOT exist, render the Clean Dashed "Unscheduled Day" Card
              return (
                <div
                  key={dayNum}
                  className="bg-slate-50/60 rounded-3xl border-2 border-dashed border-slate-200 p-5 flex flex-col justify-between hover:border-emerald-400 hover:bg-emerald-50/20 transition-all group min-h-[310px]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-200 text-slate-700">
                          Day {dayNum}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          {weekday}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-500">
                        Unscheduled
                      </span>
                    </div>

                    <div className="pt-4 text-center space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 group-hover:text-emerald-600 group-hover:border-emerald-300 transition-all shadow-2xs">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-700">
                        Rest / Self-Study Slot
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed max-w-[200px] mx-auto">
                        No chapters or topics assigned to Day {dayNum} yet.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-dashed border-slate-200 text-center">
                    <button
                      onClick={() => handleOpenModal(null, dayNum)}
                      className="w-full py-2 px-3 bg-white hover:bg-emerald-600 hover:text-white border border-slate-200 hover:border-emerald-600 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Schedule Day {dayNum}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: LIST / TABLE VIEW                                                 */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          
          {/* Table Search Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-grow max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Day #, Title, Subject, or Chapter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Showing {filteredListSlots.length} of {examSchedule.length} scheduled slots in {selectedExam.name}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Day</th>
                  <th className="py-3 px-4">Week</th>
                  <th className="py-3 px-4">Day Title</th>
                  <th className="py-3 px-4">Subject & Chapter</th>
                  <th className="py-3 px-4">Topics</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredListSlots.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400">
                      No schedule slots match your search query.
                    </td>
                  </tr>
                ) : (
                  filteredListSlots.map(slot => {
                    const subject = subjects.find(s => s.id === slot.subjectId);
                    const chapter = chapters.find(c => c.id === slot.chapterId);
                    const topicCount = (slot.topicIds || []).length;

                    return (
                      <tr key={slot.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-black text-slate-900">
                          <span className="px-2 py-1 rounded-lg bg-slate-900 text-white text-[11px]">
                            Day {slot.dayNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-600">
                          Week {slot.weekNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 max-w-xs truncate">
                            {slot.dayTitle}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {slot.scheduledDate}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-indigo-600 font-bold truncate max-w-xs">
                            {subject?.name || slot.subjectName || 'Unassigned'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium truncate max-w-xs">
                            {chapter?.title || slot.chapterTitle || 'Unassigned'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100 font-bold text-[10px]">
                            {topicCount} Topics
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {slot.estimatedTime || '1.5 hrs'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            slot.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {slot.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenPreview(slot)}
                              title="Quick Preview"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenModal(slot)}
                              title="Edit Slot"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={`/day/${slot.dayNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Preview Student View in New Tab"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => setDeletingSlot(slot)}
                              title="Delete Slot"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SCHEDULE DAY / LINK CHAPTER & TOPICS                             */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingSlot ? `Edit Schedule Slot — Day ${editingSlot.dayNumber}` : `Schedule New Day Slot`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Exam: <span className="font-bold text-slate-700">{selectedExam.name}</span> • Week {formWeekNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4">
              
              {/* Step 1: Week, Day & Release Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Week Number
                  </label>
                  <select
                    value={formWeekNumber}
                    onChange={(e) => setFormWeekNumber(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {availableWeeks.map(w => (
                      <option key={w} value={w}>Week {w}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Day Number *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formDayNumber}
                    onChange={(e) => setFormDayNumber(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Release Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Step 2: Day Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Day Title *
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoFillTitleFromChapter}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Fill from Chapter</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Day 3 — Cardiac Arrhythmias & ECG Interpretation"
                  value={formDayTitle}
                  onChange={(e) => setFormDayTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Step 3: Cascading Selection: Subject -> Chapter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    1. Select Subject *
                  </label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => {
                      const newSubId = e.target.value;
                      setFormSubjectId(newSubId);
                      const chaps = chapters.filter(c => c.subjectId === newSubId);
                      const firstChapId = chaps[0]?.id || '';
                      setFormChapterId(firstChapId);
                      const topList = topics.filter(t => t.chapterId === firstChapId);
                      setFormSelectedTopicIds(topList.slice(0, 1).map(t => t.id));
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {examSubjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FolderTree className="w-3.5 h-3.5 text-sky-600" />
                    2. Select Chapter *
                  </label>
                  <select
                    value={formChapterId}
                    onChange={(e) => {
                      const newChapId = e.target.value;
                      setFormChapterId(newChapId);
                      const topList = topics.filter(t => t.chapterId === newChapId);
                      setFormSelectedTopicIds(topList.map(t => t.id));
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Choose Chapter --</option>
                    {subjectChapters.map(c => (
                      <option key={c.id} value={c.id}>Ch {c.chapterNumber}: {c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 4: Link Topics Multi-Select with Quick Actions */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>3. Link Topics to this Day ({formSelectedTopicIds.length} Selected)</span>
                  </label>
                  
                  {chapterTopics.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllTopics}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={handleClearAllTopics}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {chapterTopics.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-400 space-y-1">
                    <p>No topics created under this chapter yet.</p>
                    <p className="text-[11px] text-slate-500">
                      Use the "Chapters & Topics" menu on the sidebar to add topics and clinical content.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    {chapterTopics.map(top => {
                      const isSelected = formSelectedTopicIds.includes(top.id);
                      
                      // Count content assets in this topic
                      const pdfCount = top.content?.pdfList?.length || (top.content?.pdf ? 1 : 0);
                      const imgCount = top.content?.images?.length || 0;
                      const hasVid = Boolean(top.content?.video);
                      const cardCount = top.content?.flashcards?.length || 0;

                      return (
                        <label
                          key={top.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-300 shadow-2xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleTopicSelection(top.id)}
                            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="min-w-0 flex-grow">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-xs font-bold text-slate-900 truncate">{top.title}</div>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                                {top.duration}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                              <span>Topic {top.topicNumber}</span>
                              <span>•</span>
                              <span className="text-emerald-700 font-medium">{top.difficulty}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1 text-slate-500">
                                <span>📄 {pdfCount}</span>
                                <span>🖼️ {imgCount}</span>
                                <span>🎥 {hasVid ? 'Yes' : '0'}</span>
                                <span>🧠 {cardCount}</span>
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 5: Duration & Add-ons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Study Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1.5 hours"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formHasLive}
                    onChange={(e) => setFormHasLive(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Live Rounds</div>
                    <div className="text-[10px] text-slate-400">Faculty interactive Zoom</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formHasTest}
                    onChange={(e) => setFormHasTest(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">CBT Mock Test</div>
                    <div className="text-[10px] text-slate-400">Clinical vignette exam</div>
                  </div>
                </label>
              </div>

              {/* Step 6: Drip Release Status */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Drip Status
                </label>
                <div className="flex items-center gap-4">
                  {['Active', 'Scheduled', 'Locked'].map(st => (
                    <label key={st} className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="slotStatus"
                        checked={formStatus === st}
                        onChange={() => setFormStatus(st)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{st}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingSlot ? 'Save Changes' : 'Publish to Schedule'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: IN-PAGE STUDENT VIEW QUICK PREVIEW                               */}
      {/* ========================================================================= */}
      {previewSlot && resolvedPreviewContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-black text-xs">
                  Day {previewSlot.dayNumber}
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Student LMS Experience Preview
                  </h3>
                  <p className="text-xs text-slate-500">
                    {resolvedPreviewContent.subject} • {resolvedPreviewContent.unit}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/day/${previewSlot.dayNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 hover:bg-emerald-100"
                >
                  <span>Open Full Screen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setPreviewSlot(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Day Title Banner */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Daily Study Session
              </div>
              <h4 className="text-lg font-black text-white">
                {resolvedPreviewContent.title}
              </h4>
              <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {resolvedPreviewContent.estimatedTime}
                </span>
                <span>•</span>
                <span>Status: {previewSlot.status}</span>
              </div>
            </div>

            {/* In-Preview Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 overflow-x-auto scrollbar-none">
              {resolvedPreviewContent.notesPdf && (
                <button
                  onClick={() => setPreviewActiveTab('notes')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    previewActiveTab === 'notes' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Study Notes ({resolvedPreviewContent.notesPdf.pages}p)</span>
                </button>
              )}

              {resolvedPreviewContent.galleryImages && resolvedPreviewContent.galleryImages.length > 0 && (
                <button
                  onClick={() => setPreviewActiveTab('images')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    previewActiveTab === 'images' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Diagnostic Diagrams ({resolvedPreviewContent.galleryImages.length})</span>
                </button>
              )}

              {resolvedPreviewContent.videoData && (
                <button
                  onClick={() => setPreviewActiveTab('video')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    previewActiveTab === 'video' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video Lecture</span>
                </button>
              )}

              {resolvedPreviewContent.flashcards && resolvedPreviewContent.flashcards.length > 0 && (
                <button
                  onClick={() => setPreviewActiveTab('flashcards')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    previewActiveTab === 'flashcards' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Flashcards ({resolvedPreviewContent.flashcards.length})</span>
                </button>
              )}
            </div>

            {/* Tab Contents */}
            <div className="min-h-[220px]">
              {/* Tab 1: Notes */}
              {previewActiveTab === 'notes' && resolvedPreviewContent.notesPdf && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{resolvedPreviewContent.notesPdf.title}</div>
                      <div className="text-[11px] text-slate-400">
                        {resolvedPreviewContent.notesPdf.fileName} • {resolvedPreviewContent.notesPdf.pages} Pages • {resolvedPreviewContent.notesPdf.size}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl">
                    PDF Attached
                  </span>
                </div>
              )}

              {/* Tab 2: Clinical Diagrams */}
              {previewActiveTab === 'images' && resolvedPreviewContent.galleryImages && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {resolvedPreviewContent.galleryImages.map((img, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900">
                      <img src={img.url} alt={img.title} className="w-full h-36 object-cover" />
                      <div className="p-2.5 bg-white space-y-0.5">
                        <div className="text-xs font-bold text-slate-900 truncate">{img.title}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{img.caption}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Video Lecture */}
              {previewActiveTab === 'video' && resolvedPreviewContent.videoData && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-900">{resolvedPreviewContent.videoData.title}</div>
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      {resolvedPreviewContent.videoData.duration}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Instructor: {resolvedPreviewContent.videoData.instructor}
                  </div>
                  <div className="relative rounded-xl overflow-hidden bg-slate-900 h-40 flex items-center justify-center">
                    <img src={resolvedPreviewContent.videoData.thumbnail} alt="video thumb" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-white translate-x-0.5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Interactive Flashcards */}
              {previewActiveTab === 'flashcards' && resolvedPreviewContent.flashcards && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Card {previewCardIdx + 1} of {resolvedPreviewContent.flashcards.length}</span>
                    <button
                      onClick={() => setPreviewCardFlipped(!previewCardFlipped)}
                      className="text-emerald-600 hover:text-emerald-700 cursor-pointer"
                    >
                      Click card to flip
                    </button>
                  </div>

                  <div
                    onClick={() => setPreviewCardFlipped(!previewCardFlipped)}
                    className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-[160px] flex flex-col justify-between cursor-pointer shadow-md hover:ring-2 hover:ring-emerald-500 transition-all"
                  >
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                      {previewCardFlipped ? 'Answer' : 'Clinical Vignette / Question'}
                    </div>
                    <div className="text-sm font-semibold leading-relaxed my-2">
                      {previewCardFlipped 
                        ? resolvedPreviewContent.flashcards[previewCardIdx]?.answer 
                        : resolvedPreviewContent.flashcards[previewCardIdx]?.question
                      }
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {previewCardFlipped ? '✓ Tap to view question' : '⚡ Tap to reveal high-yield answer'}
                    </div>
                  </div>

                  {resolvedPreviewContent.flashcards.length > 1 && (
                    <div className="flex items-center justify-between pt-1">
                      <button
                        disabled={previewCardIdx <= 0}
                        onClick={() => {
                          setPreviewCardIdx(prev => prev - 1);
                          setPreviewCardFlipped(false);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 cursor-pointer"
                      >
                        Previous Card
                      </button>
                      <button
                        disabled={previewCardIdx >= resolvedPreviewContent.flashcards.length - 1}
                        onClick={() => {
                          setPreviewCardIdx(prev => prev + 1);
                          setPreviewCardFlipped(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                      >
                        Next Card
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Changes saved in the planner take effect immediately.
              </span>
              <button
                onClick={() => setPreviewSlot(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DELETE CONFIRMATION                                              */}
      {/* ========================================================================= */}
      {deletingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Remove Day Schedule?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove the schedule slot for <span className="font-bold text-slate-800">Day {deletingSlot.dayNumber}</span>?
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                Topics and content in your repository will not be deleted, only unlinked from this day.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSlot(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSlot}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Delete Slot
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

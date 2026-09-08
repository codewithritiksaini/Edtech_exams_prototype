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
  Square,
  Award,
  Tv
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';
import { authService, USER_ROLES } from '../../services/authService';

const SUBJECT_COLOR_MAP = {
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', tag: 'bg-rose-600', badge: 'bg-rose-100 text-rose-800' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', tag: 'bg-purple-600', badge: 'bg-purple-100 text-purple-800' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', tag: 'bg-sky-600', badge: 'bg-sky-100 text-sky-800' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', tag: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-800' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', tag: 'bg-amber-600', badge: 'bg-amber-100 text-amber-800' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', tag: 'bg-indigo-600', badge: 'bg-indigo-100 text-indigo-800' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', tag: 'bg-cyan-600', badge: 'bg-cyan-100 text-cyan-800' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', tag: 'bg-blue-600', badge: 'bg-blue-100 text-blue-800' },
};

export default function ManageScheduleTab({
  isAdmin: propIsAdmin,
  currentUser: propCurrentUser,
  initialExamId,
  initialSubjectId
}) {
  const [currentUser] = useState(() => propCurrentUser || authService.getCurrentUser());
  const isAdmin = propIsAdmin !== undefined ? propIsAdmin : (currentUser?.role === USER_ROLES.ADMIN);
  const isFaculty = currentUser?.role === USER_ROLES.FACULTY;
  const facultyAllowedExams = ['neet-pg', 'usmle'];

  const allCatalogExams = useMemo(() => catalogService.getExams(), []);
  const availableExams = useMemo(() => {
    if (isAdmin) return allCatalogExams;
    return allCatalogExams.filter(e => facultyAllowedExams.includes(e.id));
  }, [isAdmin, allCatalogExams]);

  const [selectedExamId, setSelectedExamId] = useState(() => {
    if (initialExamId && availableExams.some(e => e.id === initialExamId)) return initialExamId;
    return availableExams[0]?.id || 'neet-pg';
  });

  const [subjects, setSubjects] = useState(() => curriculumService.getSubjects());
  const [chapters, setChapters] = useState(() => curriculumService.getChapters());
  const [topics, setTopics] = useState(() => curriculumService.getTopics());
  const [schedule, setSchedule] = useState(() => curriculumService.getSchedule(selectedExamId));

  // Hierarchical Breakdown States
  const [selectedSubjectId, setSelectedSubjectId] = useState(() => initialSubjectId || 'all');
  const [selectedChapterId, setSelectedChapterId] = useState('all');

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
  const [formLectureTimeSlot, setFormLectureTimeSlot] = useState('09:00 AM - 10:30 AM IST');
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
    setSelectedSubjectId('all');
    setSelectedChapterId('all');
    setSelectedWeek(1);
  }, [selectedExamId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const selectedExam = useMemo(() => {
    return availableExams.find(e => e.id === selectedExamId) || availableExams[0] || allCatalogExams[0];
  }, [availableExams, selectedExamId, allCatalogExams]);

  // Available weeks for this exam (e.g. 1 to 4 or max from exam)
  const availableWeeks = useMemo(() => {
    const maxWeeks = Math.min(selectedExam?.weeks || 4, 12);
    return Array.from({ length: maxWeeks }, (_, i) => i + 1);
  }, [selectedExam]);

  // Available subjects for the active exam (Scoped for Faculty vs Admin)
  const examSubjects = useMemo(() => {
    const subs = subjects.filter(s => s.examId === selectedExamId);
    if (isAdmin) return subs;
    // For Faculty: only show assigned subjects
    return subs.filter(s => {
      if (s.facultyEmail === currentUser?.email) return true;
      if (s.id === 'sub-neet-cardio' || s.id === 'sub-neet-pharma' || s.id === 'sub-usmle-cvs') return true;
      return false;
    });
  }, [subjects, selectedExamId, isAdmin, currentUser]);

  // Active Subject Object
  const activeSubject = useMemo(() => {
    if (selectedSubjectId === 'all') return null;
    return examSubjects.find(s => s.id === selectedSubjectId) || null;
  }, [examSubjects, selectedSubjectId]);

  // Available chapters for the active selection
  const availableChapters = useMemo(() => {
    if (selectedSubjectId === 'all') {
      const allowedSubIds = new Set(examSubjects.map(s => s.id));
      return chapters.filter(c => c.examId === selectedExamId && allowedSubIds.has(c.subjectId));
    }
    return chapters.filter(c => c.subjectId === selectedSubjectId);
  }, [chapters, selectedExamId, selectedSubjectId, examSubjects]);

  // Active Chapter Object
  const activeChapter = useMemo(() => {
    if (selectedChapterId === 'all') return null;
    return availableChapters.find(c => c.id === selectedChapterId) || null;
  }, [availableChapters, selectedChapterId]);

  // Available chapters based on formSubjectId (inside Modal)
  const subjectChapters = useMemo(() => {
    if (!formSubjectId) return [];
    return chapters.filter(c => c.subjectId === formSubjectId);
  }, [chapters, formSubjectId]);

  // Available topics based on formChapterId (inside Modal)
  const chapterTopics = useMemo(() => {
    if (!formChapterId) return [];
    return topics.filter(t => t.chapterId === formChapterId);
  }, [topics, formChapterId]);

  // All slots for the active exam
  const examSchedule = useMemo(() => {
    return schedule.filter(s => s.examId === selectedExamId);
  }, [schedule, selectedExamId]);

  // Subject-filtered slots
  const subjectSchedule = useMemo(() => {
    if (selectedSubjectId === 'all') {
      if (!isAdmin) {
        const allowedSubIds = new Set(examSubjects.map(s => s.id));
        return examSchedule.filter(s => allowedSubIds.has(s.subjectId));
      }
      return examSchedule;
    }
    return examSchedule.filter(s => s.subjectId === selectedSubjectId);
  }, [examSchedule, selectedSubjectId, isAdmin, examSubjects]);

  // Chapter-filtered slots
  const chapterSchedule = useMemo(() => {
    if (selectedChapterId === 'all') return subjectSchedule;
    return subjectSchedule.filter(s => s.chapterId === selectedChapterId);
  }, [subjectSchedule, selectedChapterId]);

  // Slots for the currently selected week
  const weekSlots = useMemo(() => {
    return chapterSchedule.filter(s => s.weekNumber === selectedWeek);
  }, [chapterSchedule, selectedWeek]);

  // 7 Days of the currently selected week (Day 1..7 for Week 1, Day 8..14 for Week 2, etc.)
  const weekDayNumbers = useMemo(() => {
    const startDay = (selectedWeek - 1) * 7 + 1;
    return Array.from({ length: 7 }, (_, i) => startDay + i);
  }, [selectedWeek]);

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
      targetDays: selectedExam?.weeks ? selectedExam.weeks * 7 : 28,
      activeTopics: allLinkedTopicIds.size,
      studyHours: (totalMinutes / 60).toFixed(1),
      totalPdfs,
      totalImages,
      totalCards
    };
  }, [examSchedule, selectedExam, topics]);

  // Open Modal for Schedule Day
  const handleOpenModal = (slot = null, targetDay = null, targetSubjectId = null) => {
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
      setFormLectureTimeSlot(slot.lectureTimeSlot || '09:00 AM - 10:30 AM IST');
      setFormHasLive(Boolean(slot.hasLive));
      setFormHasTest(Boolean(slot.hasTest));
      setFormStatus(slot.status || 'Active');
    } else {
      setEditingSlot(null);
      const dayNum = targetDay || ((selectedWeek - 1) * 7 + (weekSlots.length + 1));
      setFormWeekNumber(selectedWeek);
      setFormDayNumber(dayNum);
      
      // Pick subject: either targetSubjectId, currently filtered subject, or first assigned
      const defaultSubId = targetSubjectId || (selectedSubjectId !== 'all' ? selectedSubjectId : (examSubjects[0]?.id || ''));
      const defaultSubObj = examSubjects.find(s => s.id === defaultSubId) || examSubjects[0];
      setFormSubjectId(defaultSubId);

      // Default lecture time slot from chosen subject!
      setFormLectureTimeSlot(defaultSubObj?.defaultTimeSlot || '09:00 AM - 10:30 AM IST');

      const defaultChaps = chapters.filter(c => c.subjectId === defaultSubId);
      const defaultChap = (selectedChapterId !== 'all' && defaultChaps.find(c => c.id === selectedChapterId)) || defaultChaps[0] || null;
      setFormChapterId(defaultChap?.id || '');

      const defaultTopics = defaultChap ? topics.filter(t => t.chapterId === defaultChap.id) : [];
      setFormSelectedTopicIds(defaultTopics.slice(0, 1).map(t => t.id));
      
      setFormDayTitle(
        defaultChap 
          ? `Day ${dayNum} — ${defaultChap.title}` 
          : `Day ${dayNum} — ${defaultSubObj?.name || 'Clinical Study'}`
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

    const subObj = examSubjects.find(s => s.id === formSubjectId);
    const chapObj = chapters.find(c => c.id === formChapterId);

    const saved = curriculumService.saveScheduleSlot({
      ...(editingSlot ? { id: editingSlot.id } : {}),
      examId: selectedExamId,
      weekNumber: Number(formWeekNumber),
      weekTitle: `Week ${formWeekNumber}`,
      dayNumber: Number(formDayNumber),
      dayTitle: formDayTitle.trim() || `Day ${formDayNumber}`,
      subjectId: formSubjectId,
      subjectName: subObj?.name || 'Medical Subject',
      subjectCode: subObj?.code || '',
      subjectColor: subObj?.color || 'rose',
      chapterId: formChapterId,
      chapterTitle: chapObj?.title || 'Clinical Chapter',
      topicIds: formSelectedTopicIds,
      scheduledDate: formDate,
      estimatedTime: formDuration,
      lectureTimeSlot: formLectureTimeSlot,
      facultyName: subObj?.assignedFacultyName || currentUser?.name || 'Lead Specialist',
      hasLive: formHasLive,
      hasTest: formHasTest,
      status: formStatus
    });

    setSchedule(curriculumService.getSchedule(selectedExamId));
    setIsModalOpen(false);
    showToast(editingSlot 
      ? `Day ${formDayNumber} [${subObj?.name || 'Subject'}] schedule updated!` 
      : `Day ${formDayNumber} scheduled for ${subObj?.name || 'Subject'} at ${formLectureTimeSlot}!`
    );
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
    setPreviewCardFlipped(false);
    setPreviewCardIdx(0);
    const resolved = curriculumService.getDayResolvedContent(slot.dayNumber, selectedExamId, slot.id);
    if (resolved?.activeTabs && resolved.activeTabs.length > 0) {
      setPreviewActiveTab(resolved.activeTabs[0]);
    } else {
      setPreviewActiveTab('notes');
    }
  };

  // Resolved Preview Content
  const resolvedPreviewContent = useMemo(() => {
    if (!previewSlot) return null;
    return curriculumService.getDayResolvedContent(previewSlot.dayNumber, selectedExamId, previewSlot.id);
  }, [previewSlot, selectedExamId]);

  // List View Filtered Slots
  const filteredListSlots = useMemo(() => {
    return chapterSchedule.filter(slot => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const sub = subjects.find(s => s.id === slot.subjectId);
      const chap = chapters.find(c => c.id === slot.chapterId);
      return (
        slot.dayTitle.toLowerCase().includes(q) ||
        String(slot.dayNumber).includes(q) ||
        (slot.lectureTimeSlot || '').toLowerCase().includes(q) ||
        (slot.facultyName || '').toLowerCase().includes(q) ||
        (sub?.name || '').toLowerCase().includes(q) ||
        (chap?.title || '').toLowerCase().includes(q)
      );
    });
  }, [chapterSchedule, searchQuery, subjects, chapters]);

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-white text-slate-900 px-5 py-3 rounded-2xl shadow-xl border border-emerald-300 flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
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

      {/* Control Navigation Toolbar: Full Multi-Tier Hierarchy */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
        
        {/* Tier 1: Exam Track Selector + View Switch */}
        <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-1 shrink-0 flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5 text-indigo-500" />
              1. Exam Track:
            </span>
            {availableExams.map(exam => (
              <button
                key={exam.id}
                onClick={() => setSelectedExamId(exam.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  selectedExamId === exam.id
                    ? 'bg-indigo-50/90 border-2 border-indigo-600 text-indigo-950 shadow-xs ring-2 ring-indigo-500/15'
                    : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
                }`}
              >
                <span>{exam.flag}</span>
                <span>{exam.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  selectedExamId === exam.id ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {exam.enrolledStudents || 0} enrolled
                </span>
                {!isAdmin && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedExamId === exam.id ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    Assigned
                  </span>
                )}
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
              <span>Slots List ({chapterSchedule.length})</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Assigned Subjects Breakdown Cards & Switcher */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-rose-500" />
              <span>2. Breakdown by Assigned Subject:</span>
              <span className="text-slate-400 font-normal">
                {isAdmin ? `(${examSubjects.length} subjects available)` : `(${examSubjects.length} assigned to your faculty scope)`}
              </span>
            </span>

            {selectedSubjectId !== 'all' && (
              <button
                onClick={() => {
                  setSelectedSubjectId('all');
                  setSelectedChapterId('all');
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Show All Subjects Master Grid</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Master "All Subjects" Card (For Admin or combined view) */}
            <button
              onClick={() => {
                setSelectedSubjectId('all');
                setSelectedChapterId('all');
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                selectedSubjectId === 'all'
                  ? 'bg-white border-2 border-indigo-600 shadow-md ring-2 ring-indigo-500/15 text-slate-900'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    selectedSubjectId === 'all' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 truncate">All Subjects Master View</div>
                    <div className="text-[10px] text-slate-500">
                      Combined Timetable
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  selectedSubjectId === 'all' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {examSchedule.length} slots
                </span>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] flex items-center justify-between text-slate-500">
                <span className="font-semibold text-slate-600">{examSubjects.length} Subjects Active</span>
                <span className="font-medium text-indigo-600">Master Overview</span>
              </div>
            </button>

            {/* Individual Subject Cards */}
            {examSubjects.map(sub => {
              const colorInfo = SUBJECT_COLOR_MAP[sub.color] || SUBJECT_COLOR_MAP.rose;
              const isSelected = selectedSubjectId === sub.id;
              const subSlots = examSchedule.filter(s => s.subjectId === sub.id);
              const subChaps = chapters.filter(c => c.subjectId === sub.id);

              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubjectId(sub.id);
                    setSelectedChapterId('all');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${colorInfo.bg} ${colorInfo.text} border ${colorInfo.border}`}>
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 truncate">
                          {sub.name}
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-400">
                          {sub.code}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${colorInfo.badge}`}>
                      {subSlots.length} days
                    </span>
                  </div>

                  {/* Lecture Timing Slot & Faculty Specialty */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1 text-[10px]">
                    <div className="flex items-center justify-between text-indigo-700 font-bold bg-indigo-50/60 px-2 py-1 rounded-lg">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span>Slot:</span>
                      </span>
                      <span className="font-extrabold truncate">{sub.defaultTimeSlot || '09:00 AM - 10:30 AM IST'}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500 font-medium px-1">
                      <span className="truncate">Mentor: {sub.assignedFacultyName || 'Assigned Lead'}</span>
                      <span className="text-slate-400 font-bold shrink-0">{subChaps.length} Chaps</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tier 3: Chapter / Module Breakdown Pills (Level 3) */}
        {availableChapters.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-sky-500" />
                <span>3. Filter by Chapter / Topic Module:</span>
              </span>

              {selectedChapterId !== 'all' && (
                <button
                  onClick={() => setSelectedChapterId('all')}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Show All Chapters</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedChapterId('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                  selectedChapterId === 'all'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>All Chapters ({availableChapters.length})</span>
              </button>

              {availableChapters.map(chap => {
                const chapSlots = subjectSchedule.filter(s => s.chapterId === chap.id);
                const isSelected = selectedChapterId === chap.id;

                return (
                  <button
                    key={chap.id}
                    onClick={() => setSelectedChapterId(chap.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="truncate max-w-[200px]">Ch {chap.chapterNumber}: {chap.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-sky-700 text-sky-100' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {chapSlots.length} d
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tier 4: Active Hierarchy Context Breadcrumb Banner */}
        <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 flex-wrap">
            <span className="text-slate-400 font-medium">Active Hierarchy:</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-900 font-black text-[11px] shadow-2xs">
              {selectedExam.flag} {selectedExam.name}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
              activeSubject ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' : 'bg-white border border-slate-200 text-slate-700'
            }`}>
              {activeSubject ? `${activeSubject.name} (${activeSubject.code})` : 'All Subjects (Master View)'}
            </span>
            {activeSubject && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{activeSubject.defaultTimeSlot}</span>
                </span>
              </>
            )}
            {activeChapter && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200 font-bold text-[11px]">
                  Ch {activeChapter.chapterNumber}: {activeChapter.title}
                </span>
              </>
            )}
          </div>

          {(selectedSubjectId !== 'all' || selectedChapterId !== 'all') && (
            <button
              onClick={() => {
                setSelectedSubjectId('all');
                setSelectedChapterId('all');
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Hierarchy Filters</span>
            </button>
          )}
        </div>

        {/* Tier 5: Week Selector Pills */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-1 shrink-0 flex items-center gap-1.5 mr-1">
              <Calendar className="w-3 h-3 text-emerald-500" />
              4. Select Week:
            </span>
            {availableWeeks.map(wk => {
              const count = chapterSchedule.filter(s => s.weekNumber === wk).length;
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
                    {count} Sessions
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
                  {weekSlots.length} Study Sessions in Week {selectedWeek}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Days {weekDayNumbers[0]} to {weekDayNumbers[6]} • Click any slot to edit or preview, or add multi-subject sessions per day
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="hidden sm:inline italic">Tip: Multi-subject faculty can schedule distinct lecture slots per day</span>
            </div>
          </div>

          {/* 7-Day Calendar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weekDayNumbers.map((dayNum, index) => {
              const daySlots = weekSlots.filter(s => Number(s.dayNumber) === Number(dayNum));
              const dayOfWeekNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
              const weekday = dayOfWeekNames[index % 7];

              // If 1 or more slots exist for this day:
              if (daySlots.length > 0) {
                return (
                  <div
                    key={dayNum}
                    className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-emerald-300"
                  >
                    <div className="p-5 space-y-3.5">
                      
                      {/* Top Header: Day Pill + Weekday + Session count */}
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 shadow-2xs">
                            Day {dayNum}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">
                            {weekday}
                          </span>
                        </div>

                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {daySlots.length} {daySlots.length === 1 ? 'Session' : 'Sessions'}
                        </span>
                      </div>

                      {/* Sessions List on this Day */}
                      <div className="space-y-3">
                        {daySlots.map(slot => {
                          const subject = subjects.find(s => s.id === slot.subjectId);
                          const chapter = chapters.find(c => c.id === slot.chapterId);
                          const linkedTopics = topics.filter(t => (slot.topicIds || []).includes(t.id));
                          const colorInfo = SUBJECT_COLOR_MAP[slot.subjectColor || subject?.color] || SUBJECT_COLOR_MAP.rose;

                          // Compute assets count
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
                              key={slot.id} 
                              className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${colorInfo.bg} ${colorInfo.border} hover:shadow-xs`}
                            >
                              {/* Subject Badge & Lecture Time Slot */}
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md text-white ${colorInfo.tag}`}>
                                  {slot.subjectCode || subject?.code || 'SUB'}: {slot.subjectName || subject?.name}
                                </span>

                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 flex items-center gap-1 shadow-2xs">
                                  <Clock className="w-2.5 h-2.5 text-indigo-500" />
                                  <span>{slot.lectureTimeSlot || '09:00 AM - 10:30 AM IST'}</span>
                                </span>
                              </div>

                              {/* Chapter & Day Title */}
                              <div>
                                <div className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1 truncate">
                                  <FolderTree className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{chapter?.title || slot.chapterTitle || 'Clinical Chapter'}</span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mt-0.5">
                                  {slot.dayTitle}
                                </h4>
                              </div>

                              {/* Mentor & Duration */}
                              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                                <span className="truncate">👨‍⚕️ {slot.facultyName || subject?.assignedFacultyName || 'Faculty Lead'}</span>
                                <span className="text-slate-400 font-bold shrink-0">{slot.estimatedTime || '1.5 hrs'}</span>
                              </div>

                              {/* Assets summary pills */}
                              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 flex items-center gap-0.5">
                                  <FileText className="w-2.5 h-2.5 text-indigo-500" />
                                  {totalPdfs} PDF
                                </span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                                  {totalImgs} Img
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                                  hasVideo ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-white border border-slate-200 text-slate-400'
                                }`}>
                                  <Video className="w-2.5 h-2.5" />
                                  {hasVideo ? 'Video' : 'No Vid'}
                                </span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 flex items-center gap-0.5">
                                  <Brain className="w-2.5 h-2.5 text-purple-500" />
                                  {totalCards} Cards
                                </span>
                                {slot.hasLive && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                                    🔴 Live
                                  </span>
                                )}
                                {slot.hasTest && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                    📝 CBT
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons for this session */}
                              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleOpenModal(slot)}
                                    title="Edit This Session"
                                    className="p-1 rounded-md text-slate-500 hover:text-emerald-600 hover:bg-white transition-all cursor-pointer"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenPreview(slot)}
                                    title="Quick Preview Student View"
                                    className="p-1 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-white transition-all cursor-pointer"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingSlot(slot)}
                                    title="Remove This Session"
                                    className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-white transition-all cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>

                                <a
                                  href={`/day/${slot.dayNumber}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-800 cursor-pointer"
                                >
                                  <span>Student View</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>

                            </div>
                          );
                        })}
                      </div>

                    </div>

                    {/* Bottom of Day Card: Add Another Session Button */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                      <button
                        onClick={() => handleOpenModal(null, dayNum)}
                        className="w-full py-1.5 px-2.5 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-xl shadow-2xs transition-all cursor-pointer inline-flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Add Subject Session</span>
                      </button>
                    </div>

                  </div>
                );
              }

              // Unscheduled Rest Day Slot
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
                  <th className="py-3 px-4">Lecture Time Slot</th>
                  <th className="py-3 px-4">Day Title</th>
                  <th className="py-3 px-4">Subject & Mentor</th>
                  <th className="py-3 px-4">Chapter</th>
                  <th className="py-3 px-4">Topics</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredListSlots.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-8 text-center text-slate-400">
                      No schedule slots match your search query.
                    </td>
                  </tr>
                ) : (
                  filteredListSlots.map(slot => {
                    const subject = subjects.find(s => s.id === slot.subjectId);
                    const chapter = chapters.find(c => c.id === slot.chapterId);
                    const topicCount = (slot.topicIds || []).length;
                    const colorInfo = SUBJECT_COLOR_MAP[slot.subjectColor || subject?.color] || SUBJECT_COLOR_MAP.rose;

                    return (
                      <tr key={slot.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-black text-slate-900">
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] font-bold">
                            Day {slot.dayNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-600">
                          Week {slot.weekNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[11px] shadow-2xs">
                            <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span>{slot.lectureTimeSlot || '09:00 AM - 10:30 AM IST'}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {slot.scheduledDate}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 max-w-xs truncate">
                            {slot.dayTitle}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded text-white ${colorInfo.tag}`}>
                              {slot.subjectCode || subject?.code || 'SUB'}
                            </span>
                            <span className="text-slate-900 font-bold truncate max-w-xs">
                              {subject?.name || slot.subjectName || 'Unassigned'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            👨‍⚕️ {slot.facultyName || subject?.assignedFacultyName || 'Lead Mentor'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-[11px] text-slate-600 font-bold truncate max-w-xs">
                            {chapter?.title || slot.chapterTitle || 'Unassigned Chapter'}
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
                      const subObj = examSubjects.find(s => s.id === newSubId);
                      if (subObj?.defaultTimeSlot) {
                        setFormLectureTimeSlot(subObj.defaultTimeSlot);
                      }
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

              {/* Step 5: Lecture Time Slot & Batch Timing */}
              <div className="space-y-2 p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    Lecture Time Slot & Batch Timing *
                  </label>
                  {(() => {
                    const selSub = examSubjects.find(s => s.id === formSubjectId);
                    return selSub?.assignedFacultyName ? (
                      <span className="text-[11px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                        Faculty: {selSub.assignedFacultyName}
                      </span>
                    ) : null;
                  })()}
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Morning (09:00 - 10:30 AM)', val: '09:00 AM - 10:30 AM IST' },
                    { label: 'Midday (11:30 AM - 01:00 PM)', val: '11:30 AM - 01:00 PM IST' },
                    { label: 'Evening (04:00 - 05:30 PM)', val: '04:00 PM - 05:30 PM IST' },
                    { label: 'Night (07:30 - 09:00 PM)', val: '07:30 PM - 09:00 PM IST' }
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setFormLectureTimeSlot(preset.val)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-medium border transition-all cursor-pointer ${
                        formLectureTimeSlot === preset.val
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09:00 AM - 10:30 AM IST"
                    value={formLectureTimeSlot}
                    onChange={(e) => setFormLectureTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Multiple subjects can be scheduled on the same day by assigning distinct time slots (e.g. Cardiology Morning + Pharmacology Evening).
                </p>
              </div>

              {/* Step 6: Duration & Add-ons */}
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
                <span className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-black text-xs">
                  Day {previewSlot.dayNumber}
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Student LMS Experience Preview
                  </h3>
                  <p className="text-xs text-slate-500">
                    {resolvedPreviewContent.subjectName || resolvedPreviewContent.subject || previewSlot.subjectName || 'Clinical Subject'} • {resolvedPreviewContent.chapterTitle || resolvedPreviewContent.unit || previewSlot.chapterTitle || 'Clinical Chapter'}
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
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-white to-emerald-50/50 border border-slate-200 text-slate-900 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Daily Study Session
              </div>
              <h4 className="text-lg font-black text-slate-900">
                {resolvedPreviewContent.title}
              </h4>
              <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{resolvedPreviewContent.estimatedTime || '1.5 hours'}</span>
                </span>
                <span>•</span>
                <span>Slot: {previewSlot.lectureTimeSlot || '09:00 AM - 10:30 AM IST'}</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px]">
                  Status: {previewSlot.status}
                </span>
              </div>
            </div>

            {/* In-Preview Tabs */}
            {(() => {
              const previewPdfs = (resolvedPreviewContent.pdfList && resolvedPreviewContent.pdfList.length > 0)
                ? resolvedPreviewContent.pdfList
                : (resolvedPreviewContent.pdf || resolvedPreviewContent.notesPdf ? [resolvedPreviewContent.pdf || resolvedPreviewContent.notesPdf] : []);
              
              const previewImages = (resolvedPreviewContent.images && resolvedPreviewContent.images.length > 0)
                ? resolvedPreviewContent.images
                : (resolvedPreviewContent.galleryImages || []);

              const previewVideo = resolvedPreviewContent.video || resolvedPreviewContent.videoData || null;
              const previewFlashcards = resolvedPreviewContent.flashcards || [];
              const previewLive = resolvedPreviewContent.live || (resolvedPreviewContent.hasLive ? { hasSession: true, title: resolvedPreviewContent.title } : null);
              const previewHasTest = Boolean(resolvedPreviewContent.hasTest || previewSlot.hasTest);

              return (
                <>
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2 overflow-x-auto scrollbar-none">
                    {previewPdfs.length > 0 && (
                      <button
                        onClick={() => setPreviewActiveTab('notes')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                          previewActiveTab === 'notes' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Study Notes ({previewPdfs.length})</span>
                      </button>
                    )}

                    {previewImages.length > 0 && (
                      <button
                        onClick={() => setPreviewActiveTab('images')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                          previewActiveTab === 'images' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Diagnostic Figures ({previewImages.length})</span>
                      </button>
                    )}

                    {previewVideo && (
                      <button
                        onClick={() => setPreviewActiveTab('video')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                          previewActiveTab === 'video' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Video Lecture</span>
                      </button>
                    )}

                    {previewFlashcards.length > 0 && (
                      <button
                        onClick={() => setPreviewActiveTab('flashcards')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                          previewActiveTab === 'flashcards' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Brain className="w-3.5 h-3.5" />
                        <span>Flashcards ({previewFlashcards.length})</span>
                      </button>
                    )}

                    {previewLive && (
                      <button
                        onClick={() => setPreviewActiveTab('live')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                          previewActiveTab === 'live' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span>Live Grand Rounds</span>
                      </button>
                    )}

                    {previewHasTest && (
                      <button
                        onClick={() => setPreviewActiveTab('test')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                          previewActiveTab === 'test' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>CBT Assessment</span>
                      </button>
                    )}
                  </div>

                  {/* Tab Contents */}
                  <div className="min-h-[220px]">
                    {/* Tab 1: Notes (All PDFs) */}
                    {previewActiveTab === 'notes' && (
                      <div className="space-y-3">
                        {previewPdfs.map((pdfItem, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4 hover:bg-slate-100/70 transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                                <FileText className="w-6 h-6" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                  {pdfItem.title || pdfItem.fileName}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {pdfItem.fileName} • {pdfItem.pages || 18} Pages • {pdfItem.size || '3.5 MB'}
                                </div>
                                {pdfItem.author && (
                                  <div className="text-[10px] text-indigo-600 font-medium">
                                    Author: {pdfItem.author}
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="text-[11px] font-bold px-3 py-1.5 bg-white text-indigo-700 border border-indigo-200 rounded-xl shrink-0 shadow-2xs">
                              PDF Attached
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tab 2: Clinical Diagrams */}
                    {previewActiveTab === 'images' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {previewImages.map((img, i) => (
                          <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                            <img src={img.url} alt={img.title} className="w-full h-36 object-cover" />
                            <div className="p-3 bg-white space-y-1">
                              <div className="text-xs font-bold text-slate-900 truncate">{img.title}</div>
                              <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{img.caption}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tab 3: Video Lecture */}
                    {previewActiveTab === 'video' && previewVideo && (
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-slate-900">{previewVideo.title}</div>
                            <div className="text-[11px] text-slate-500">
                              Instructor: {previewVideo.instructor || 'Dr. Siddharth V. (Clinical Faculty Lead)'}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                            {previewVideo.duration || '45:00 mins'}
                          </span>
                        </div>

                        <div className="relative rounded-2xl overflow-hidden bg-slate-100 h-44 flex items-center justify-center border border-slate-200">
                          <img
                            src={previewVideo.thumbnail || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80'}
                            alt="video thumb"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-900/25 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl cursor-pointer transition-transform hover:scale-105">
                              <Play className="w-6 h-6 fill-white translate-x-0.5" />
                            </div>
                          </div>
                        </div>

                        {previewVideo.chapters && previewVideo.chapters.length > 0 && (
                          <div className="pt-1">
                            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                              Video Timeline Chapters:
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {previewVideo.chapters.map((ch, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 text-xs">
                                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                                    {ch.time}
                                  </span>
                                  <span className="text-slate-700 font-medium truncate">{ch.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 4: Interactive Flashcards (Light Theme!) */}
                    {previewActiveTab === 'flashcards' && previewFlashcards.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span>Card {previewCardIdx + 1} of {previewFlashcards.length}</span>
                          <button
                            onClick={() => setPreviewCardFlipped(!previewCardFlipped)}
                            className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                          >
                            Click card to flip
                          </button>
                        </div>

                        <div
                          onClick={() => setPreviewCardFlipped(!previewCardFlipped)}
                          className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-emerald-50/50 border-2 border-indigo-200 text-slate-900 min-h-[170px] flex flex-col justify-between cursor-pointer shadow-sm hover:border-indigo-400 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                              {previewCardFlipped ? 'Verified High-Yield Answer' : 'Clinical Question / Vignette'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {previewCardFlipped ? 'Front ➔ Back' : 'Tap to Flip'}
                            </span>
                          </div>
                          
                          <div className="text-sm font-semibold text-slate-900 leading-relaxed my-3">
                            {previewCardFlipped 
                              ? (previewFlashcards[previewCardIdx]?.answer || previewFlashcards[previewCardIdx]?.back)
                              : (previewFlashcards[previewCardIdx]?.question || previewFlashcards[previewCardIdx]?.front)
                            }
                          </div>

                          <div className="text-[10px] text-slate-500 font-medium">
                            {previewCardFlipped ? '✓ Tap to view vignette question again' : '⚡ Tap anywhere to reveal clinical answer'}
                          </div>
                        </div>

                        {previewFlashcards.length > 1 && (
                          <div className="flex items-center justify-between pt-1">
                            <button
                              disabled={previewCardIdx <= 0}
                              onClick={() => {
                                setPreviewCardIdx(prev => prev - 1);
                                setPreviewCardFlipped(false);
                              }}
                              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs"
                            >
                              Previous Card
                            </button>
                            <button
                              disabled={previewCardIdx >= previewFlashcards.length - 1}
                              onClick={() => {
                                setPreviewCardIdx(prev => prev + 1);
                                setPreviewCardFlipped(false);
                              }}
                              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-40 cursor-pointer shadow-xs"
                            >
                              Next Card
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 5: Live Grand Rounds */}
                    {previewActiveTab === 'live' && previewLive && (
                      <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Live Grand Rounds</span>
                          </span>
                          <span className="text-xs font-bold text-slate-600">
                            Slot: {previewSlot.lectureTimeSlot || '09:00 AM - 10:30 AM IST'}
                          </span>
                        </div>
                        <div>
                          <h5 className="text-sm font-black text-slate-900">
                            {previewLive.title || `Live Case Discussions: ${resolvedPreviewContent.title}`}
                          </h5>
                          <p className="text-xs text-slate-600 mt-1">
                            Faculty: <strong>{previewLive.faculty || previewSlot.facultyName || 'Dr. Siddharth V. (Clinical Faculty Lead)'}</strong>
                          </p>
                        </div>
                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-medium">
                            👥 {previewLive.attendeesCount || 340} Registered Candidates
                          </span>
                          <button
                            type="button"
                            onClick={() => alert('Starting live stream conference room...')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Tv className="w-3.5 h-3.5" />
                            <span>Launch Live Classroom</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Tab 6: CBT Mock Test */}
                    {previewActiveTab === 'test' && (
                      <div className="p-5 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                            CBT Proctored Assessment
                          </span>
                          <span className="text-xs font-bold text-slate-600">
                            Duration: 45 mins • 30 Vignette MCQs
                          </span>
                        </div>
                        <div>
                          <h5 className="text-sm font-black text-slate-900">
                            Day {previewSlot.dayNumber} Clinical Benchmark Examination
                          </h5>
                          <p className="text-xs text-slate-600 mt-1">
                            High-yield clinical vignette examination with timed negative marking and AI diagnostic analytics.
                          </p>
                        </div>
                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-medium">
                            Passing Benchmark: 75% Score
                          </span>
                          <button
                            type="button"
                            onClick={() => alert('Opening CBT test simulation engine...')}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Start Practice Test</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </>
              );
            })()}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Changes saved in the planner take effect immediately.
              </span>
              <button
                onClick={() => setPreviewSlot(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
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

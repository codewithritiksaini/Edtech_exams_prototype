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
  ArrowLeft,
  Download,
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
  Tv,
  Users,
  CalendarCheck,
  CalendarX,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';
import { authService, USER_ROLES } from '../../services/authService';
import { peopleService } from '../../services/peopleService';
import FacultySlotMatrixView from './schedule/FacultySlotMatrixView';
import FacultySlotDetailModal from './schedule/FacultySlotDetailModal';
import { STANDARD_TIME_SLOTS, getSlotsAvailabilityForFaculty } from '../../utils/scheduleSlotUtils';

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
  const [modules, setModules] = useState(() => curriculumService.getModules());
  const [lectures, setLectures] = useState(() => curriculumService.getLectures());
  const [schedule, setSchedule] = useState(() => curriculumService.getSchedule(selectedExamId));

  // Hierarchical Breakdown States
  const [selectedSubjectId, setSelectedSubjectId] = useState(() => initialSubjectId || 'all');
  const [selectedModuleId, setSelectedModuleId] = useState('all');

  const [selectedWeek, setSelectedWeek] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'faculty'
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
  const [formModuleId, setFormModuleId] = useState('');
  const [formSelectedLectureIds, setFormSelectedLectureIds] = useState([]);
  const [formDate, setFormDate] = useState('2026-09-08');
  const [formDuration, setFormDuration] = useState('1.5 hours');
  const [formLectureTimeSlot, setFormLectureTimeSlot] = useState('09:00 AM - 10:30 AM IST');
  const [formHasLive, setFormHasLive] = useState(false);
  const [formHasTest, setFormHasTest] = useState(false);
  const [formStatus, setFormStatus] = useState('Active');
  // Available-slots-only toggle for the scheduling drawer
  const [formShowAvailableOnly, setFormShowAvailableOnly] = useState(true);

  // Faculty Slot Detail Modal State
  const [inspectingFaculty, setInspectingFaculty] = useState(null);

  // Preview In-Page Student LMS Experience States
  const [previewSlot, setPreviewSlot] = useState(null);
  const [previewActiveTab, setPreviewActiveTab] = useState('notes');
  const [previewCardFlipped, setPreviewCardFlipped] = useState(false);
  const [previewCardIdx, setPreviewCardIdx] = useState(0);
  const [previewPdfIdx, setPreviewPdfIdx] = useState(0);
  const [previewChapterIdx, setPreviewChapterIdx] = useState(0);

  // Delete Confirmation State
  const [deletingSlot, setDeletingSlot] = useState(null);

  // Synchronize state from services
  useEffect(() => {
    const unsubCurriculum = curriculumService.subscribeCurriculum(() => {
      setSubjects(curriculumService.getSubjects());
      setModules(curriculumService.getModules());
      setLectures(curriculumService.getLectures());
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
    setSelectedModuleId('all');
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

  // Available modules for the active selection
  const availableModules = useMemo(() => {
    if (selectedSubjectId === 'all') {
      const allowedSubIds = new Set(examSubjects.map(s => s.id));
      return modules.filter(c => c.examId === selectedExamId && allowedSubIds.has(c.subjectId));
    }
    return modules.filter(c => c.subjectId === selectedSubjectId);
  }, [modules, selectedExamId, selectedSubjectId, examSubjects]);

  // Active Module Object
  const activeModule = useMemo(() => {
    if (selectedModuleId === 'all') return null;
    return availableModules.find(c => c.id === selectedModuleId) || null;
  }, [availableModules, selectedModuleId]);

  // Available modules based on formSubjectId (inside Modal)
  const subjectModules = useMemo(() => {
    if (!formSubjectId) return [];
    return modules.filter(c => c.subjectId === formSubjectId);
  }, [modules, formSubjectId]);

  // Available lectures based on formModuleId (inside Modal)
  const moduleLectures = useMemo(() => {
    if (!formModuleId) return [];
    return lectures.filter(t => t.moduleId === formModuleId);
  }, [lectures, formModuleId]);

  // All slots for the active exam
  const examSchedule = useMemo(() => {
    return schedule.filter(s => s.examId === selectedExamId);
  }, [schedule, selectedExamId]);

  // Faculty double-booking check for the slot being scheduled/edited in the modal:
  // does this subject's faculty already have another session on the chosen day?
  const facultyConflictForForm = useMemo(() => {
    const subObj = examSubjects.find(s => s.id === formSubjectId);
    if (!subObj?.facultyEmail) return null;
    const facSubjectIds = new Set(
      subjects
        .filter(s => s.examId === selectedExamId && s.facultyEmail?.toLowerCase() === subObj.facultyEmail.toLowerCase())
        .map(s => s.id)
    );
    return examSchedule.find(s =>
      Number(s.dayNumber) === Number(formDayNumber) &&
      facSubjectIds.has(s.subjectId) &&
      (!editingSlot || s.id !== editingSlot.id)
    ) || null;
  }, [examSubjects, formSubjectId, subjects, selectedExamId, examSchedule, formDayNumber, editingSlot]);

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

  // Module-filtered slots
  const moduleSchedule = useMemo(() => {
    if (selectedModuleId === 'all') return subjectSchedule;
    return subjectSchedule.filter(s => s.moduleId === selectedModuleId);
  }, [subjectSchedule, selectedModuleId]);

  // Slots for the currently selected week
  const weekSlots = useMemo(() => {
    return moduleSchedule.filter(s => s.weekNumber === selectedWeek);
  }, [moduleSchedule, selectedWeek]);

  // 7 Days of the currently selected week (Day 1..7 for Week 1, Day 8..14 for Week 2, etc.)
  const weekDayNumbers = useMemo(() => {
    const startDay = (selectedWeek - 1) * 7 + 1;
    return Array.from({ length: 7 }, (_, i) => startDay + i);
  }, [selectedWeek]);

  // Unfiltered (by subject/module) slots for the selected week — used for faculty availability,
  // since admin needs to see every faculty's bookings regardless of the active subject/module filter
  const examWeekSlots = useMemo(() => {
    return examSchedule.filter(s => Number(s.weekNumber) === Number(selectedWeek));
  }, [examSchedule, selectedWeek]);

  // Faculty Availability for the selected week: who's booked on which day, and who's free
  const facultyAvailability = useMemo(() => {
    const allFaculty = peopleService.getFacultyList();
    const examFacultyEmails = new Set(
      subjects
        .filter(s => s.examId === selectedExamId && s.facultyEmail)
        .map(s => s.facultyEmail.toLowerCase())
    );
    const relevantFaculty = allFaculty.filter(f => f.email && examFacultyEmails.has(f.email.toLowerCase()));

    return relevantFaculty.map(fac => {
      const facSubjectIds = new Set(
        subjects
          .filter(s => s.examId === selectedExamId && s.facultyEmail?.toLowerCase() === fac.email.toLowerCase())
          .map(s => s.id)
      );
      const slotsByDay = {};
      examWeekSlots.forEach(slot => {
        if (facSubjectIds.has(slot.subjectId)) {
          slotsByDay[Number(slot.dayNumber)] = slot;
        }
      });
      return {
        email: fac.email,
        name: fac.name,
        specialty: fac.specialty,
        bookedCount: Object.keys(slotsByDay).length,
        slotsByDay
      };
    });
  }, [subjects, selectedExamId, examWeekSlots]);

  // Metrics computation for KPI Banner
  const metrics = useMemo(() => {
    const totalDays = examSchedule.length;
    const allLinkedLectureIds = new Set();
    let totalMinutes = 0;
    let totalPdfs = 0;
    let totalImages = 0;
    let totalCards = 0;

    examSchedule.forEach(slot => {
      (slot.lectureIds || []).forEach(tid => allLinkedLectureIds.add(tid));
      
      // Parse duration
      const durMatch = (slot.estimatedTime || '').match(/([\d.]+)\s*hour/i);
      if (durMatch) {
        totalMinutes += parseFloat(durMatch[1]) * 60;
      } else {
        totalMinutes += 90;
      }
    });

    lectures.filter(t => allLinkedLectureIds.has(t.id)).forEach(t => {
      if (t.content) {
        totalPdfs += (t.content.pdfList?.length || (t.content.pdf ? 1 : 0));
        totalImages += (t.content.images?.length || 0);
        totalCards += (t.content.flashcards?.length || 0);
      }
    });

    return {
      scheduledDays: totalDays,
      targetDays: selectedExam?.weeks ? selectedExam.weeks * 7 : 28,
      activeLectures: allLinkedLectureIds.size,
      studyHours: (totalMinutes / 60).toFixed(1),
      totalPdfs,
      totalImages,
      totalCards
    };
  }, [examSchedule, selectedExam, lectures]);

  // Open Modal for Schedule Day
  // Signature extended: handleOpenModal(slot, targetDay, targetSubjectId, targetTimeSlot, targetFacultyEmail)
  const handleOpenModal = (slot = null, targetDay = null, targetSubjectId = null, targetTimeSlot = null, targetFacultyEmail = null) => {
    if (slot) {
      setEditingSlot(slot);
      setFormWeekNumber(slot.weekNumber);
      setFormDayNumber(slot.dayNumber);
      setFormDayTitle(slot.dayTitle);
      setFormSubjectId(slot.subjectId || examSubjects[0]?.id || '');
      setFormModuleId(slot.moduleId || '');
      setFormSelectedLectureIds(slot.lectureIds || []);
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
      // If targetFacultyEmail is set, prefer subjects taught by that faculty
      let defaultSubId = targetSubjectId || (selectedSubjectId !== 'all' ? selectedSubjectId : '');
      if (!defaultSubId && targetFacultyEmail) {
        const facSub = examSubjects.find(s => s.facultyEmail?.toLowerCase() === targetFacultyEmail.toLowerCase());
        defaultSubId = facSub?.id || examSubjects[0]?.id || '';
      }
      if (!defaultSubId) defaultSubId = examSubjects[0]?.id || '';
      const defaultSubObj = examSubjects.find(s => s.id === defaultSubId) || examSubjects[0];
      setFormSubjectId(defaultSubId);

      // Default lecture time slot: use targetTimeSlot if provided (from empty slot click), else subject default
      const resolvedTimeSlot = targetTimeSlot || defaultSubObj?.defaultTimeSlot || '09:00 AM - 10:30 AM IST';
      setFormLectureTimeSlot(resolvedTimeSlot);

      const defaultChaps = modules.filter(c => c.subjectId === defaultSubId);
      const defaultChap = (selectedModuleId !== 'all' && defaultChaps.find(c => c.id === selectedModuleId)) || defaultChaps[0] || null;
      setFormModuleId(defaultChap?.id || '');

      const defaultLectures = defaultChap ? lectures.filter(t => t.moduleId === defaultChap.id) : [];
      setFormSelectedLectureIds(defaultLectures.slice(0, 1).map(t => t.id));
      
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
    setFormShowAvailableOnly(true);
    setIsModalOpen(true);
  };

  const handleToggleLectureSelection = (lectureId) => {
    setFormSelectedLectureIds(prev => 
      prev.includes(lectureId) ? prev.filter(id => id !== lectureId) : [...prev, lectureId]
    );
  };

  const handleSelectAllLectures = () => {
    const allIds = moduleLectures.map(t => t.id);
    setFormSelectedLectureIds(allIds);
  };

  const handleClearAllLectures = () => {
    setFormSelectedLectureIds([]);
  };

  const handleAutoFillTitleFromModule = () => {
    const chap = modules.find(c => c.id === formModuleId);
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
    const chapObj = modules.find(c => c.id === formModuleId);

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
      moduleId: formModuleId,
      moduleTitle: chapObj?.title || 'Clinical Module',
      lectureIds: formSelectedLectureIds,
      scheduledDate: formDate,
      estimatedTime: formDuration,
      lectureTimeSlot: formLectureTimeSlot,
      facultyName: subObj?.assignedFacultyName || currentUser?.name || 'Lead Specialist',
      facultyEmail: subObj?.facultyEmail || '',
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

  // Open In-Page Student Learning Room Preview (Direct Dedicated Page)
  const handleOpenPreview = (slot) => {
    setPreviewSlot(slot);
    setPreviewCardFlipped(false);
    setPreviewCardIdx(0);
    setPreviewPdfIdx(0);
    setPreviewChapterIdx(0);
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
    return moduleSchedule.filter(slot => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const sub = subjects.find(s => s.id === slot.subjectId);
      const chap = modules.find(c => c.id === slot.moduleId);
      return (
        slot.dayTitle.toLowerCase().includes(q) ||
        String(slot.dayNumber).includes(q) ||
        (slot.lectureTimeSlot || '').toLowerCase().includes(q) ||
        (slot.facultyName || '').toLowerCase().includes(q) ||
        (sub?.name || '').toLowerCase().includes(q) ||
        (chap?.title || '').toLowerCase().includes(q)
      );
    });
  }, [moduleSchedule, searchQuery, subjects, modules]);

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-white text-slate-900 px-5 py-3 rounded-2xl shadow-xl border border-emerald-300 flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONDITIONAL MAIN VIEW: DEDICATED IN-PAGE STUDENT LMS VIEW vs PLANNER      */}
      {/* ========================================================================= */}
      {previewSlot && resolvedPreviewContent ? (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Bar / Navigation Header */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                id="btn-back-to-planner"
                onClick={() => setPreviewSlot(null)}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-indigo-600" />
                <span>Back to Schedule Planner</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>/</span>
                <span className="text-slate-600 font-bold">{selectedExam.name}</span>
                <span>/</span>
                <span className="text-slate-600 font-bold">Week {previewSlot.weekNumber || 1}</span>
                <span>/</span>
                <span className="text-indigo-600 font-black">
                  Day {previewSlot.dayNumber} Preview
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => handleOpenModal(previewSlot)}
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Edit This Slot</span>
              </button>

              <a
                href={`/day/${previewSlot.dayNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <span>Open Live Student LMS</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

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
            
            const activePdf = previewPdfs[previewPdfIdx] || previewPdfs[0] || {
              title: 'High-Yield Clinical Notes',
              fileName: 'clinical-notes.pdf',
              pages: 18,
              size: '3.4 MB',
              author: 'Faculty Lead'
            };

            const subObj = subjects.find(s => s.id === previewSlot.subjectId) || null;
            const subColor = SUBJECT_COLOR_MAP[subObj?.color || 'indigo'] || SUBJECT_COLOR_MAP.indigo;

            return (
              <div className="space-y-6">
                {/* Hero Session Overview Card */}
                <div className="bg-gradient-to-r from-indigo-50/70 via-white to-emerald-50/50 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3.5 py-1 bg-indigo-600 text-white text-xs font-black rounded-xl shadow-2xs">
                      Day {previewSlot.dayNumber}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200">
                      Week {previewSlot.weekNumber || 1}
                    </span>
                    <span className={`px-3 py-1 text-xs font-black rounded-xl border ${subColor.badge} ${subColor.border}`}>
                      {resolvedPreviewContent.subjectName || previewSlot.subjectName || 'Clinical Subject'}
                    </span>
                    <span className="px-3 py-1 bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs">
                      {resolvedPreviewContent.moduleTitle || previewSlot.moduleTitle || 'Clinical Module'}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Status: {previewSlot.status || 'Active'}</span>
                    </span>
                  </div>

                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {resolvedPreviewContent.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
                      High-yield daily study module configured for students. Includes verified faculty study notes, diagnostic figures atlas, masterclass video lecture, and clinical flashcards.
                    </p>
                  </div>

                  {/* Metadata Chips Bar */}
                  <div className="flex items-center gap-3 sm:gap-6 text-xs text-slate-600 pt-3 flex-wrap border-t border-slate-200/80">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>Slot: {previewSlot.lectureTimeSlot || '09:00 AM - 10:30 AM IST'}</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <span>Duration: {resolvedPreviewContent.estimatedTime || '1.5 hours'}</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span>Faculty: {previewSlot.facultyName || 'Dr. Siddharth V. (Clinical Faculty Lead)'}</span>
                    </span>
                  </div>

                  {/* Linked Lectures Badges */}
                  {previewSlot.lectureIds && previewSlot.lectureIds.length > 0 && (
                    <div className="pt-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Linked Clinical Lectures ({previewSlot.lectureIds.length}):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {previewSlot.lectureIds.map(tid => {
                          const lectureObj = lectures.find(t => t.id === tid);
                          return (
                            <span
                              key={tid}
                              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>{lectureObj?.title || tid}</span>
                              {lectureObj?.code && (
                                <span className="text-[10px] text-slate-400 font-mono">({lectureObj.code})</span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct In-Page Tabs Bar */}
                <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none sticky top-2 z-20">
                  {previewPdfs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPreviewActiveTab('notes')}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
                        previewActiveTab === 'notes'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Study Notes & Handouts ({previewPdfs.length})</span>
                    </button>
                  )}

                  {previewImages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPreviewActiveTab('images')}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
                        previewActiveTab === 'images'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      <span>Diagnostic Figures ({previewImages.length})</span>
                    </button>
                  )}

                  {previewVideo && (
                    <button
                      type="button"
                      onClick={() => setPreviewActiveTab('video')}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
                        previewActiveTab === 'video'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>Video Masterclass</span>
                    </button>
                  )}

                  {previewFlashcards.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPreviewActiveTab('flashcards')}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
                        previewActiveTab === 'flashcards'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <Brain className="w-4 h-4" />
                      <span>Clinical Flashcards ({previewFlashcards.length})</span>
                    </button>
                  )}

                  {previewLive && (
                    <button
                      type="button"
                      onClick={() => setPreviewActiveTab('live')}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
                        previewActiveTab === 'live'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
                      }`}
                    >
                      <Tv className="w-4 h-4" />
                      <span>Live Grand Rounds</span>
                    </button>
                  )}

                  {previewHasTest && (
                    <button
                      type="button"
                      onClick={() => setPreviewActiveTab('test')}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
                        previewActiveTab === 'test'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60'
                      }`}
                    >
                      <Award className="w-4 h-4" />
                      <span>CBT Assessment</span>
                    </button>
                  )}
                </div>

                {/* Direct In-Page Tab Content Panels */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs min-h-[450px]">
                  
                  {/* TAB 1: STUDY NOTES & HANDOUTS */}
                  {previewActiveTab === 'notes' && (
                    <div className="space-y-6">
                      {previewPdfs.length > 1 && (
                        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 overflow-x-auto scrollbar-none">
                          <span className="text-xs font-bold text-slate-400 shrink-0">Available Documents:</span>
                          {previewPdfs.map((pdf, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setPreviewPdfIdx(idx)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                                previewPdfIdx === idx
                                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-2xs'
                                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
                              }`}
                            >
                              {pdf.title || pdf.fileName || `Notes #${idx + 1}`}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Document Overview Banner */}
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 shadow-2xs">
                            <FileText className="w-7 h-7" />
                          </div>
                          <div>
                            <div className="text-sm sm:text-base font-bold text-slate-900">
                              {activePdf.title || activePdf.fileName}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {activePdf.fileName} • {activePdf.pages || 18} Pages • {activePdf.size || '3.4 MB'} • Verified PDF Handout
                            </div>
                            {activePdf.author && (
                              <div className="text-xs text-indigo-600 font-semibold mt-1">
                                Author: {activePdf.author}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => showToast(`Downloaded "${activePdf.fileName}"`)}
                            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 shadow-2xs cursor-pointer transition-all"
                          >
                            <Download className="w-4 h-4 text-indigo-600" />
                            <span>Download Notes PDF</span>
                          </button>
                        </div>
                      </div>

                      {/* Interactive Document Reader Canvas */}
                      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-xs">
                        {/* Reader Bar */}
                        <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap text-xs">
                          <div className="flex items-center gap-2 font-bold text-slate-700">
                            <FileCheck className="w-4 h-4 text-emerald-600" />
                            <span>Document Reader Preview</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-500 font-normal">Page 1 of {activePdf.pages || 18}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[11px]">100% Zoom</span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                              High-Yield NEET-PG / USMLE
                            </span>
                          </div>
                        </div>

                        {/* Document Sheet */}
                        <div className="p-6 sm:p-8 bg-white max-w-4xl mx-auto my-4 rounded-xl border border-slate-200 shadow-sm space-y-6">
                          <div className="border-b border-slate-100 pb-4">
                            <div className="text-[11px] font-black uppercase tracking-wider text-indigo-600">
                              Clinical Module Study Handout
                            </div>
                            <h2 className="text-xl font-black text-slate-900 mt-1">
                              {resolvedPreviewContent.title}
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                              Subject: {resolvedPreviewContent.subjectName} • Module: {resolvedPreviewContent.moduleTitle}
                            </p>
                          </div>

                          {/* Section 1: Diagnostic Algorithms */}
                          <div className="space-y-2">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>1. High-Yield Diagnostic Algorithm & Clinical Criteria</span>
                            </h3>
                            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 space-y-2">
                              <p className="font-semibold text-indigo-950">
                                Pathognomonic Clinical Manifestations & Diagnostic Workup:
                              </p>
                              <ul className="list-disc list-inside space-y-1 text-slate-600 leading-relaxed">
                                <li><strong>Initial Evaluation:</strong> Baseline 12-lead ECG within 10 minutes of presentation + bedside echocardiography for wall motion abnormalities.</li>
                                <li><strong>Biomarker Kinetics:</strong> High-sensitivity cardiac Troponin I rises at 3-4 hours, peaks at 12-24 hours, and persists for 7-10 days. CK-MB is optimal for detecting re-infarction due to rapid 48-hour normalization.</li>
                                <li><strong>Hemodynamic Stratification:</strong> Killip classification to guide inotropic vs diuretic therapy in cardiogenic decompensation.</li>
                              </ul>
                            </div>
                          </div>

                          {/* Section 2: Clinical Decision Table */}
                          <div className="space-y-2">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                              <Activity className="w-3.5 h-3.5 text-emerald-500" />
                              <span>2. Stepwise Pharmacotherapy & Interventional Protocols</span>
                            </h3>
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                                  <tr>
                                    <th className="px-3.5 py-2.5">Clinical Scenario</th>
                                    <th className="px-3.5 py-2.5">First-Line Diagnostic</th>
                                    <th className="px-3.5 py-2.5">Definitive Pharmacotherapy</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-600">
                                  <tr>
                                    <td className="px-3.5 py-2 font-medium text-slate-900">Acute STEMI &lt;12h</td>
                                    <td className="px-3.5 py-2">Immediate Coronary Angio</td>
                                    <td className="px-3.5 py-2">Primary PCI + Dual Antiplatelet + Heparin</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3.5 py-2 font-medium text-slate-900">Stanford Type A Dissection</td>
                                    <td className="px-3.5 py-2">Contrast CT Aortogram</td>
                                    <td className="px-3.5 py-2">IV Beta-Blocker (Esmolol) + Emergent Surgery</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3.5 py-2 font-medium text-slate-900">Acute Pulmonary Embolism</td>
                                    <td className="px-3.5 py-2">CT Pulmonary Angiogram</td>
                                    <td className="px-3.5 py-2">LMWH / UFH; Thrombolysis if Hemodynamically Unstable</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Section 3: High-Yield Pearl */}
                          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                            <div className="font-bold flex items-center gap-1.5 text-amber-800">
                              <AlertCircle className="w-4 h-4" />
                              <span>High-Yield Board Pearl:</span>
                            </div>
                            <p className="leading-relaxed text-amber-800">
                              In acute inferior wall MI (ST elevation in II, III, aVF), always obtain right-sided leads (V4R). If right ventricular infarction is present, nitrates and diuretics are strictly contraindicated as they drastically drop preload.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: DIAGNOSTIC FIGURES & CLINICAL ATLAS */}
                  {previewActiveTab === 'images' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            Diagnostic Figures & Clinical Atlas
                          </h3>
                          <p className="text-xs text-slate-500">
                            High-resolution radiological plates, 12-lead ECGs, and histopathology slides linked to this day.
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                          {previewImages.length} Diagnostic Plates
                        </span>
                      </div>

                      {/* 3 cards per row on large screens */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {previewImages.map((img, i) => (
                          <div
                            key={i}
                            className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
                          >
                            <div>
                              <div className="relative overflow-hidden bg-slate-100 aspect-video">
                                <img
                                  src={img.url}
                                  alt={img.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-2 right-2">
                                  <span className="px-2 py-1 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold rounded-lg shadow-2xs">
                                    Fig #{i + 1}
                                  </span>
                                </div>
                              </div>

                              <div className="p-4 space-y-2">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                                  {img.title}
                                </h4>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                  {img.caption}
                                </p>
                              </div>
                            </div>

                            <div className="p-4 pt-0">
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 font-medium">
                                💡 <strong>Board Question Clue:</strong> Look for classic diagnostic criteria and compare reciprocal changes.
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: VIDEO MASTERCLASS */}
                  {previewActiveTab === 'video' && previewVideo && (
                    <div className="space-y-6 max-w-4xl mx-auto">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{previewVideo.title}</h3>
                          <p className="text-xs text-slate-500">
                            Instructor: {previewVideo.instructor || 'Dr. Siddharth V. (Clinical Faculty Lead)'} • High-Definition Masterclass
                          </p>
                        </div>
                        <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                          {previewVideo.duration || '45:00 mins'}
                        </span>
                      </div>

                      {/* Video Player Canvas */}
                      <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-video shadow-xl border border-slate-200">
                        <img
                          src={previewVideo.thumbnail || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&auto=format&fit=crop&q=80'}
                          alt="video poster"
                          className="w-full h-full object-cover opacity-85"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 flex flex-col justify-between p-6">
                          <div className="flex items-center justify-between text-white text-xs font-semibold">
                            <span className="px-3 py-1 bg-red-600 text-white rounded-full font-bold">
                              4K Ultra-HD Lecture
                            </span>
                            <span className="bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
                              {previewVideo.duration || '45:00'}
                            </span>
                          </div>

                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => showToast('Playing clinical masterclass lecture...')}
                              className="w-18 h-18 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl cursor-pointer transition-all hover:scale-110 active:scale-95"
                            >
                              <Play className="w-8 h-8 fill-white translate-x-1" />
                            </button>
                          </div>

                          {/* Scrubber controls */}
                          <div className="space-y-2">
                            <div className="w-full bg-white/30 h-1.5 rounded-full overflow-hidden cursor-pointer">
                              <div className="w-1/3 bg-red-500 h-full rounded-full"></div>
                            </div>
                            <div className="flex items-center justify-between text-white/90 text-xs">
                              <span>15:00 / {previewVideo.duration || '45:00'}</span>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold">1.0x Speed</span>
                                <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold">Subtitles: EN</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Video Timeline Chapters */}
                      {previewVideo.chapters && previewVideo.chapters.length > 0 && (
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <Layers className="w-4 h-4 text-indigo-600" />
                            <span>Lecture Timeline Chapters & Milestones:</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {previewVideo.chapters.map((ch, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setPreviewChapterIdx(idx);
                                  showToast(`Jumped to chapter: ${ch.label}`);
                                }}
                                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                                  previewChapterIdx === idx
                                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs font-bold'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/80'
                                }`}
                              >
                                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 shrink-0">
                                  {ch.time}
                                </span>
                                <span className="truncate">{ch.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: HIGH-YIELD FLASHCARDS */}
                  {previewActiveTab === 'flashcards' && previewFlashcards.length > 0 && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                      {/* Card tracker and tips */}
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-indigo-600" />
                          <span>Card {previewCardIdx + 1} of {previewFlashcards.length}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewCardFlipped(!previewCardFlipped)}
                          className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Click card or button to flip</span>
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.round(((previewCardIdx + 1) / previewFlashcards.length) * 100)}%` }}
                        />
                      </div>

                      {/* Interactive 3D Flip Card (Clean Light Aesthetic) */}
                      <div
                        onClick={() => setPreviewCardFlipped(!previewCardFlipped)}
                        className="p-8 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-emerald-50/40 border-2 border-indigo-200 text-slate-900 min-h-[260px] flex flex-col justify-between cursor-pointer shadow-sm hover:border-indigo-400 hover:shadow-md transition-all select-none"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border ${
                            previewCardFlipped 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}>
                            {previewCardFlipped ? 'Verified High-Yield Answer & Management' : 'Clinical Vignette / Patient Presentation'}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            {previewCardFlipped ? 'Answer View' : 'Question View'}
                          </span>
                        </div>

                        <div className="my-6">
                          <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                            {previewCardFlipped 
                              ? (previewFlashcards[previewCardIdx]?.answer || previewFlashcards[previewCardIdx]?.back)
                              : (previewFlashcards[previewCardIdx]?.question || previewFlashcards[previewCardIdx]?.front)
                            }
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-3 border-t border-slate-200/60">
                          <span>{previewCardFlipped ? '✓ Click to view vignette question again' : '⚡ Tap anywhere to reveal verified clinical answer'}</span>
                          <span className="text-indigo-600 font-bold">Flip Card ➔</span>
                        </div>
                      </div>

                      {/* Flashcard Navigation Controls */}
                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          disabled={previewCardIdx <= 0}
                          onClick={() => {
                            setPreviewCardIdx(prev => prev - 1);
                            setPreviewCardFlipped(false);
                          }}
                          className="px-5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs transition-all"
                        >
                          ← Previous Card
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewCardFlipped(!previewCardFlipped)}
                          className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Flip</span>
                        </button>

                        <button
                          type="button"
                          disabled={previewCardIdx >= previewFlashcards.length - 1}
                          onClick={() => {
                            setPreviewCardIdx(prev => prev + 1);
                            setPreviewCardFlipped(false);
                          }}
                          className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-40 cursor-pointer shadow-xs transition-all"
                        >
                          Next Card →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: LIVE GRAND ROUNDS */}
                  {previewActiveTab === 'live' && previewLive && (
                    <div className="p-6 sm:p-8 bg-emerald-50/60 border border-emerald-200 rounded-3xl space-y-5 max-w-3xl mx-auto">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Live Grand Rounds Scheduled</span>
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          Slot: {previewSlot.lectureTimeSlot || '09:00 AM - 10:30 AM IST'}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xl font-black text-slate-900">
                          {previewLive.title || `Live Case Discussions: ${resolvedPreviewContent.title}`}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          Interactive live grand rounds broadcast featuring differential diagnostic reasoning, real-time student MCQ polling, and faculty clinical pearls.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-emerald-100 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Session Host & Faculty Lead
                          </div>
                          <div className="text-sm font-bold text-slate-900 mt-0.5">
                            {previewLive.faculty || previewSlot.facultyName || 'Dr. Siddharth V. (Clinical Lead)'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Enrolled Candidates
                          </div>
                          <div className="text-sm font-black text-emerald-700 mt-0.5">
                            👥 {previewLive.attendeesCount || 340}+ Doctors
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                        <span className="text-xs text-slate-500 font-medium">
                          Interactive Q&A and doubt resolution enabled for enrolled students.
                        </span>
                        <button
                          type="button"
                          onClick={() => showToast('Connecting to live grand rounds stream...')}
                          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-xs cursor-pointer inline-flex items-center gap-2 transition-all"
                        >
                          <Tv className="w-4 h-4" />
                          <span>Launch Live Classroom</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 6: CBT ASSESSMENT */}
                  {previewActiveTab === 'test' && (
                    <div className="p-6 sm:p-8 bg-purple-50/60 border border-purple-200 rounded-3xl space-y-5 max-w-3xl mx-auto">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-purple-700" />
                          <span>CBT Benchmark Examination</span>
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          Duration: 45 Mins • 30 Vignette MCQs
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xl font-black text-slate-900">
                          Day {previewSlot.dayNumber} Clinical Benchmark Assessment
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          Rigorous clinical vignette assessment testing the specific concepts covered in {resolvedPreviewContent.title}. Full proctored timer, negative marking (-0.25), and percentile diagnostics.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 bg-white rounded-xl border border-purple-100 text-center">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Total Questions</div>
                          <div className="text-base font-black text-slate-900 mt-0.5">30 MCQs</div>
                        </div>
                        <div className="p-3.5 bg-white rounded-xl border border-purple-100 text-center">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Passing Benchmark</div>
                          <div className="text-base font-black text-emerald-600 mt-0.5">75% Score</div>
                        </div>
                        <div className="p-3.5 bg-white rounded-xl border border-purple-100 text-center">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Marking Scheme</div>
                          <div className="text-base font-black text-purple-700 mt-0.5">+4 / -1 Mark</div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                        <span className="text-xs text-slate-500 font-medium">
                          Automated AI analytics report generated immediately upon test submission.
                        </span>
                        <button
                          type="button"
                          onClick={() => showToast('Starting CBT exam simulation engine...')}
                          className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-2xl shadow-xs cursor-pointer inline-flex items-center gap-2 transition-all"
                        >
                          <Award className="w-4 h-4" />
                          <span>Start CBT Benchmark Test</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* Bottom Navigation / Action Footer */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between gap-4 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPreviewSlot(null)}
                    className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-indigo-600" />
                    <span>Return to Schedule Planner</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(previewSlot)}
                      className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Edit Day {previewSlot.dayNumber} Slot</span>
                    </button>

                    <a
                      href={`/day/${previewSlot.dayNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <span>Open in Student LMS</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

              </div>
            );
          })()}
        </div>
      ) : (
        <>
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
            Link subjects, modules, and clinical lectures to specific Weeks and Days. Students automatically unlock these exact PDFs, high-yield diagnostic diagrams, video lectures, and flashcards in their daily study plan.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            id="btn-schedule-day"
            onClick={() => handleOpenModal(null)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition-all hover:shadow-emerald-500/20 active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Day / Link Lecture</span>
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

        {/* Metric 3: Active Lectures Linked */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-sky-500" />
            Active Lectures
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            {metrics.activeLectures} <span className="text-xs text-slate-400 font-normal">Lectures</span>
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
              Exam Track:
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
                {/* Enrolled-count / Assigned badges: belong to enrollment & subject-management pages, not the scheduler. Disabled, not deleted, per request. */}
                {false && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    selectedExamId === exam.id ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {exam.enrolledStudents || 0} enrolled
                  </span>
                )}
                {false && !isAdmin && (
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
              <span>7-Day Matrix</span>
            </button>
            <button
              onClick={() => setViewMode('faculty')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'faculty'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Faculty Slots</span>
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
              <span>List ({moduleSchedule.length})</span>
            </button>
          </div>
        </div>

        {/* Compact Subject / Module Filters (replaces the old card-grid + pill-row + breadcrumb banner below, which are disabled, not deleted) */}
        <div className="flex items-center gap-2.5 flex-wrap pb-3 border-b border-slate-100">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-rose-500" />
            Filters:
          </span>

          <select
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              setSelectedModuleId('all');
            }}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Subjects</option>
            {examSubjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
            ))}
          </select>

          {availableModules.length > 0 && (
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              <option value="all">All Modules</option>
              {availableModules.map(chap => (
                <option key={chap.id} value={chap.id}>Ch {chap.moduleNumber}: {chap.title}</option>
              ))}
            </select>
          )}

          {(selectedSubjectId !== 'all' || selectedModuleId !== 'all') && (
            <button
              onClick={() => {
                setSelectedSubjectId('all');
                setSelectedModuleId('all');
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          <span className="text-[11px] text-slate-400 font-medium ml-auto">
            Showing:{' '}
            <span className="text-slate-700 font-bold">
              {activeSubject
                ? `${activeSubject.name}${activeModule ? ` → Ch ${activeModule.moduleNumber}: ${activeModule.title}` : ''}`
                : 'All Subjects'}
            </span>
          </span>
        </div>

        {/* Tier 2: Assigned Subjects Breakdown Cards & Switcher — disabled (replaced by the compact filters above), kept for reference/rollback */}
        {false && (
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
                  setSelectedModuleId('all');
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
                setSelectedModuleId('all');
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
              const subChaps = modules.filter(c => c.subjectId === sub.id);

              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubjectId(sub.id);
                    setSelectedModuleId('all');
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
        )}

        {/* Tier 3: Module / Module Breakdown Pills (Level 3) — disabled (replaced by the compact filters above), kept for reference/rollback */}
        {false && availableModules.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-sky-500" />
                <span>3. Filter by Module / Lecture Module:</span>
              </span>

              {selectedModuleId !== 'all' && (
                <button
                  onClick={() => setSelectedModuleId('all')}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Show All Modules</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedModuleId('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                  selectedModuleId === 'all'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>All Modules ({availableModules.length})</span>
              </button>

              {availableModules.map(chap => {
                const chapSlots = subjectSchedule.filter(s => s.moduleId === chap.id);
                const isSelected = selectedModuleId === chap.id;

                return (
                  <button
                    key={chap.id}
                    onClick={() => setSelectedModuleId(chap.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="truncate max-w-[200px]">Ch {chap.moduleNumber}: {chap.title}</span>
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

        {/* Tier 4: Active Hierarchy Context Breadcrumb Banner — disabled (folded into the compact filter row above), kept for reference/rollback */}
        {false && (
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
            {activeModule && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200 font-bold text-[11px]">
                  Ch {activeModule.moduleNumber}: {activeModule.title}
                </span>
              </>
            )}
          </div>

          {(selectedSubjectId !== 'all' || selectedModuleId !== 'all') && (
            <button
              onClick={() => {
                setSelectedSubjectId('all');
                setSelectedModuleId('all');
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Hierarchy Filters</span>
            </button>
          )}
        </div>
        )}

        {/* Tier 5: Week Selector Pills */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-1 shrink-0 flex items-center gap-1.5 mr-1">
              <Calendar className="w-3 h-3 text-emerald-500" />
              4. Select Week:
            </span>
            {availableWeeks.map(wk => {
              const count = moduleSchedule.filter(s => s.weekNumber === wk).length;
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

      {/* Faculty Availability Panel: enhanced with slot details, Inspect button */}
      {viewMode === 'faculty' && facultyAvailability.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Faculty Slot Overview — Week {selectedWeek}</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">
                {facultyAvailability.length} faculty · 6 slots/day
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {facultyAvailability.map(fac => {
              // Count booked sessions across all 6 standard slots (by day)
              const facSubjectIds = new Set(
                subjects
                  .filter(s => s.examId === selectedExamId && s.facultyEmail?.toLowerCase() === fac.email?.toLowerCase())
                  .map(s => s.id)
              );
              // Get all sessions for this faculty in this week
              const facWeekSessions = examWeekSlots.filter(s =>
                s.facultyEmail?.toLowerCase() === fac.email?.toLowerCase() ||
                facSubjectIds.has(s.subjectId)
              );
              const facSubjects = subjects.filter(s =>
                s.examId === selectedExamId &&
                s.facultyEmail?.toLowerCase() === fac.email?.toLowerCase()
              );

              return (
                <div key={fac.email} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 truncate">{fac.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{fac.specialty}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {facSubjects.slice(0, 2).map(s => (
                          <span key={s.id} className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                            {s.code}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                        facWeekSessions.length >= 7 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {facWeekSessions.length} / 42 Booked
                      </span>
                      <button
                        onClick={() => setInspectingFaculty(fac)}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-2.5 h-2.5" /> Inspect Slots
                      </button>
                    </div>
                  </div>

                  {/* Day-by-day with booked slot time info */}
                  <div className="grid grid-cols-7 gap-1">
                    {weekDayNumbers.map((dayNum, idx) => {
                      const daySessions = facWeekSessions.filter(s => Number(s.dayNumber) === dayNum);
                      const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                      const hasAny = daySessions.length > 0;

                      return (
                        <div
                          key={dayNum}
                          title={hasAny
                            ? daySessions.map(s => `${s.lectureTimeSlot}: ${s.dayTitle || s.subjectName}`).join(' | ')
                            : `Day ${dayNum}: All 6 slots free`
                          }
                          className={`rounded-lg py-1.5 px-1 text-center cursor-pointer transition-all hover:scale-105 ${
                            hasAny
                              ? 'bg-indigo-50 border border-indigo-200'
                              : 'bg-white border border-dashed border-slate-200'
                          }`}
                          onClick={() => setInspectingFaculty(fac)}
                        >
                          <div className={`text-[8px] font-black ${
                            hasAny ? 'text-indigo-600' : 'text-slate-300'
                          }`}>{dayLetters[idx]}</div>
                          <div className="text-[8px] font-bold text-slate-500">{dayNum}</div>
                          {hasAny
                            ? <div className="flex flex-col gap-0.5 mt-0.5">
                                {[0,1,2,3,4,5].map(si => {
                                  // crude check: map sessions to approximate slot index by time
                                  const matched = daySessions.some(s => {
                                    if (!s.lectureTimeSlot) return false;
                                    const hr = parseInt(s.lectureTimeSlot.split(':')[0]);
                                    const slots = [9, 11, 14, 16, 18, 19];
                                    return Math.abs(hr - (s.lectureTimeSlot.includes('PM') && hr !== 12 ? slots[si] + (si >= 2 ? 0 : 0) : slots[si])) < 2;
                                  });
                                  return <div key={si} className={`w-full h-0.5 rounded-full ${si < daySessions.length ? 'bg-indigo-400' : 'bg-slate-100'}`} />;
                                })}
                              </div>
                            : <div className="text-[8px] text-emerald-400 mt-0.5">✓</div>
                          }
                        </div>
                      );
                    })}
                  </div>

                  {/* Booked sessions listing */}
                  {facWeekSessions.length > 0 && (
                    <div className="space-y-1">
                      {facWeekSessions.slice(0, 3).map(session => (
                        <div key={session.id} className="flex items-center gap-2 text-[10px] text-slate-600 bg-white rounded-lg px-2 py-1 border border-slate-100">
                          <span className="font-bold text-slate-800 shrink-0">D{session.dayNumber}</span>
                          <span className="text-indigo-600 font-bold shrink-0">{session.lectureTimeSlot?.split(' - ')[0]}</span>
                          <span className="truncate font-medium text-slate-500">{session.subjectName}</span>
                        </div>
                      ))}
                      {facWeekSessions.length > 3 && (
                        <button
                          onClick={() => setInspectingFaculty(fac)}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                        >
                          +{facWeekSessions.length - 3} more sessions → View All
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                          const module = modules.find(c => c.id === slot.moduleId);
                          const linkedLectures = lectures.filter(t => (slot.lectureIds || []).includes(t.id));
                          const colorInfo = SUBJECT_COLOR_MAP[slot.subjectColor || subject?.color] || SUBJECT_COLOR_MAP.rose;

                          // Compute assets count
                          let totalPdfs = 0;
                          let totalImgs = 0;
                          let hasVideo = false;
                          let totalCards = 0;

                          linkedLectures.forEach(t => {
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

                              {/* Module & Day Title */}
                              <div>
                                <div className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1 truncate">
                                  <FolderTree className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{module?.title || slot.moduleTitle || 'Clinical Module'}</span>
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
                        <span>Add Subject Session</span>
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
                        No modules or lectures assigned to Day {dayNum} yet.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-dashed border-slate-200 text-center">
                    <button
                      onClick={() => handleOpenModal(null, dayNum)}
                      className="w-full py-2 px-3 bg-white hover:bg-emerald-600 hover:text-white border border-slate-200 hover:border-emerald-600 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Schedule Day {dayNum}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: FACULTY SLOT TIMETABLE                                            */}
      {/* ========================================================================= */}
      {viewMode === 'faculty' && (
        <FacultySlotMatrixView
          facultyAvailability={facultyAvailability}
          subjects={subjects}
          schedule={examSchedule}
          weekNumber={selectedWeek}
          selectedExamId={selectedExamId}
          weekDayNumbers={weekDayNumbers}
          onOpenModal={handleOpenModal}
          onEditSlot={(slot) => handleOpenModal(slot)}
          onDeleteSlot={(slot) => setDeletingSlot(slot)}
          onPreviewSlot={handleOpenPreview}
          onInspectFaculty={(fac) => setInspectingFaculty(fac)}
        />
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
                placeholder="Search by Day #, Title, Subject, or Module..."
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
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Lectures</th>
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
                    const module = modules.find(c => c.id === slot.moduleId);
                    const lectureCount = (slot.lectureIds || []).length;
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
                            {module?.title || slot.moduleTitle || 'Unassigned Module'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100 font-bold text-[10px]">
                            {lectureCount} Lectures
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
      </>
    )}

      {/* ========================================================================= */}
      {/* SLIDE-OVER DRAWER: SCHEDULE DAY / LINK MODULE & LECTURES                  */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
          />

          {/* Slide-over Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
            <div className="w-screen max-w-xl sm:max-w-2xl bg-white shadow-2xl flex flex-col pointer-events-auto animate-in slide-in-from-right duration-300">

              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {editingSlot ? `Edit Schedule Slot — Day ${editingSlot.dayNumber}` : `Schedule New Day Slot`}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Exam: <span className="font-bold text-slate-700">{selectedExam.name}</span> • Week {formWeekNumber}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Close Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <form onSubmit={handleSaveSlot} id="schedule-drawer-form" className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              
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
                    onClick={handleAutoFillTitleFromModule}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Fill from Module</span>
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

              {/* Step 3: Cascading Selection: Subject -> Module */}
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
                      const chaps = modules.filter(c => c.subjectId === newSubId);
                      const firstChapId = chaps[0]?.id || '';
                      setFormModuleId(firstChapId);
                      const topList = lectures.filter(t => t.moduleId === firstChapId);
                      setFormSelectedLectureIds(topList.slice(0, 1).map(t => t.id));
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
                    2. Select Module *
                  </label>
                  <select
                    value={formModuleId}
                    onChange={(e) => {
                      const newChapId = e.target.value;
                      setFormModuleId(newChapId);
                      const topList = lectures.filter(t => t.moduleId === newChapId);
                      setFormSelectedLectureIds(topList.map(t => t.id));
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Choose Module --</option>
                    {subjectModules.map(c => (
                      <option key={c.id} value={c.id}>Ch {c.moduleNumber}: {c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 4: Link Lectures Multi-Select with Quick Actions */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>3. Link Lectures to this Day ({formSelectedLectureIds.length} Selected)</span>
                  </label>
                  
                  {moduleLectures.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllLectures}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={handleClearAllLectures}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {moduleLectures.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-400 space-y-1">
                    <p>No lectures created under this module yet.</p>
                    <p className="text-[11px] text-slate-500">
                      Use the "Modules & Lectures" menu on the sidebar to add lectures and clinical content.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    {moduleLectures.map(top => {
                      const isSelected = formSelectedLectureIds.includes(top.id);
                      
                      // Count content assets in this lecture
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
                            onChange={() => handleToggleLectureSelection(top.id)}
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
                              <span>Lecture {top.lectureNumber}</span>
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

                {facultyConflictForForm && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {examSubjects.find(s => s.id === formSubjectId)?.assignedFacultyName || 'This faculty'} is already booked on Day {formDayNumber}
                      {' '}for {facultyConflictForForm.subjectName || 'another subject'} at {facultyConflictForForm.lectureTimeSlot}.
                    </span>
                  </div>
                )}

                {/* Available Slots Only Toggle */}
                {(() => {
                  const selSub = examSubjects.find(s => s.id === formSubjectId);
                  const selFacultyEmail = selSub?.facultyEmail || '';
                  const slotAvailability = selFacultyEmail
                    ? getSlotsAvailabilityForFaculty(
                        selFacultyEmail, formDayNumber, selectedExamId,
                        examSchedule, subjects, editingSlot?.id || null
                      )
                    : STANDARD_TIME_SLOTS.map(sl => ({ slotInfo: sl, status: 'empty', session: null }));

                  const availableCount = slotAvailability.filter(s => s.status === 'empty').length;
                  const visibleSlots = formShowAvailableOnly
                    ? slotAvailability.filter(s => s.status === 'empty')
                    : slotAvailability;

                  return (
                    <>
                      {/* Toggle Header */}
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-indigo-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {availableCount} / {STANDARD_TIME_SLOTS.length} slots free for {selSub?.assignedFacultyName?.split(' ')[0] || 'faculty'} on Day {formDayNumber}
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormShowAvailableOnly(v => !v)}
                          className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                            formShowAvailableOnly
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {formShowAvailableOnly
                            ? <><CheckCircle2 className="w-3 h-3" /> Available Only</>
                            : <><AlertCircle className="w-3 h-3" /> Show All Slots</>
                          }
                        </button>
                      </div>

                      {/* Slot Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {visibleSlots.map(({ slotInfo, status, session }) => {
                          const isBooked = status === 'booked';
                          const isSelected = formLectureTimeSlot === slotInfo.timeRange;

                          return (
                            <button
                              key={slotInfo.id}
                              type="button"
                              disabled={isBooked}
                              onClick={() => !isBooked && setFormLectureTimeSlot(slotInfo.timeRange)}
                              title={isBooked && session
                                ? `Booked: ${session.subjectName} — ${session.dayTitle}`
                                : `Select ${slotInfo.label}: ${slotInfo.timeRange}`
                              }
                              className={`relative p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                isBooked
                                  ? 'bg-rose-50 border-rose-200 opacity-75 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                  : `${slotInfo.bgClass} ${slotInfo.borderClass} hover:border-indigo-400 hover:shadow-xs`
                              }`}
                            >
                              <div className={`text-[10px] font-black flex items-center gap-1 ${
                                isBooked ? 'text-rose-700' : isSelected ? 'text-white' : slotInfo.textClass
                              }`}>
                                <span>{slotInfo.icon}</span>
                                <span>{slotInfo.label}</span>
                                {isBooked && <span className="ml-auto text-rose-600">🚫</span>}
                                {isSelected && !isBooked && <CheckCircle2 className="w-2.5 h-2.5 ml-auto text-white" />}
                              </div>
                              <div className={`text-[9px] font-medium mt-0.5 ${
                                isBooked ? 'text-rose-500' : isSelected ? 'text-indigo-200' : 'text-slate-500'
                              }`}>
                                {isBooked && session
                                  ? `${session.subjectCode || 'Booked'}: ${session.subjectName?.split(' ')[0] || ''}`
                                  : slotInfo.timeRange
                                }
                              </div>
                              {isBooked && (
                                <div className="text-[8px] text-rose-400 font-bold mt-0.5 truncate">
                                  Already scheduled
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {formShowAvailableOnly && availableCount === 0 && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-semibold flex items-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          All 6 standard slots on Day {formDayNumber} are booked for this faculty. Toggle "Show All Slots" to override.
                        </div>
                      )}
                    </>
                  );
                })()}
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

              </form>

              {/* Drawer Sticky Footer */}
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/90 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-200/60 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="schedule-drawer-form"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingSlot ? 'Save Changes' : 'Publish to Schedule'}</span>
                </button>
              </div>

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
                Lectures and content in your repository will not be deleted, only unlinked from this day.
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

      {/* ========================================================================= */}
      {/* FACULTY SLOT DETAIL MODAL                                                 */}
      {/* ========================================================================= */}
      <FacultySlotDetailModal
        isOpen={Boolean(inspectingFaculty)}
        onClose={() => setInspectingFaculty(null)}
        faculty={inspectingFaculty}
        subjects={subjects}
        lectures={lectures}
        schedule={examSchedule}
        weekNumber={selectedWeek}
        selectedExamId={selectedExamId}
        weekDayNumbers={weekDayNumbers}
        onOpenModal={handleOpenModal}
        onEditSlot={(slot) => { setInspectingFaculty(null); handleOpenModal(slot); }}
        onDeleteSlot={(slot) => { setInspectingFaculty(null); setDeletingSlot(slot); }}
        onPreviewSlot={(slot) => { setInspectingFaculty(null); handleOpenPreview(slot); }}
      />

    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Clock, 
  Sparkles, 
  FolderTree, 
  Layers,
  Video, 
  Image as ImageIcon, 
  Brain, 
  Radio, 
  GripVertical,
  AlertTriangle,
  LayoutGrid,
  Table as TableIcon,
  Calendar
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';
import { peopleService } from '../../services/peopleService';

export default function FacultyLecturesPage() {
  const { examId: routeExamId, subjectId, moduleId } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(() => curriculumService.getSubjectById(subjectId));
  const effectiveExamId = routeExamId || subject?.examId || 'neet-pg';
  const [exam, setExam] = useState(() => catalogService.getExamById(effectiveExamId) || { id: effectiveExamId, name: effectiveExamId.toUpperCase(), flag: '🩺' });
  const [module, setModule] = useState(() => curriculumService.getModuleById(moduleId));
  const [lectures, setLectures] = useState(() => curriculumService.getLectures(moduleId, subjectId, effectiveExamId));

  const currentFaculty = peopleService.getCurrentFacultyProfile();
  const assignedSubjectIds = currentFaculty?.assignedSubjects || [];

  // Strictly check if current subject is assigned to this faculty
  const isAssigned = useMemo(() => {
    if (!subjectId) return false;
    const cleanFacultyName = currentFaculty?.name ? currentFaculty.name.replace(/^Dr\.\s*/i, '').toLowerCase().trim() : '';
    if (assignedSubjectIds.includes(subjectId)) return true;
    if (currentFaculty?.email && subject?.facultyEmail === currentFaculty.email) return true;
    if (cleanFacultyName && subject?.assignedFacultyName && subject.assignedFacultyName.toLowerCase().includes(cleanFacultyName)) return true;
    return false;
  }, [subjectId, assignedSubjectIds, subject, currentFaculty]);

  // View Mode & Filters
  const [viewMode, setViewMode] = useState('table'); // Default Table View
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  // Drag & Drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [deletingLecture, setDeletingLecture] = useState(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formNumber, setFormNumber] = useState(1);
  const [formDuration, setFormDuration] = useState('45 mins');
  const [formDifficulty, setFormDifficulty] = useState('High-Yield');
  const [formStatus, setFormStatus] = useState('Published');

  useEffect(() => {
    const unsub = curriculumService.subscribeCurriculum(() => {
      const sub = curriculumService.getSubjectById(subjectId);
      setSubject(sub);
      const exId = routeExamId || sub?.examId || 'neet-pg';
      setModule(curriculumService.getModuleById(moduleId));
      setLectures(curriculumService.getLectures(moduleId, subjectId, exId));
    });
    return unsub;
  }, [moduleId, subjectId, routeExamId]);

  useEffect(() => {
    const sub = curriculumService.getSubjectById(subjectId);
    if (sub) {
      setSubject(sub);
      const exId = routeExamId || sub.examId || 'neet-pg';
      const foundExam = catalogService.getExamById(exId);
      if (foundExam) setExam(foundExam);
      setLectures(curriculumService.getLectures(moduleId, subjectId, exId));
    }
    const foundChap = curriculumService.getModuleById(moduleId);
    if (foundChap) setModule(foundChap);
  }, [routeExamId, subjectId, moduleId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Filtered and sorted lectures
  const filteredLectures = useMemo(() => {
    return lectures
      .filter(t => {
        if (difficultyFilter !== 'all' && t.difficulty !== difficultyFilter) return false;
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return t.title.toLowerCase().includes(q);
      })
      .sort((a, b) => (a.lectureNumber || 0) - (b.lectureNumber || 0));
  }, [lectures, searchQuery, difficultyFilter, statusFilter]);

  // Drag and Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...filteredLectures];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);

    const orderedIds = reordered.map(t => t.id);
    curriculumService.reorderLectures(moduleId, orderedIds);
    showToast(`Lecture #${targetIndex + 1}: "${draggedItem.title}" reordered.`);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleOpenCreateModal = () => {
    setEditingLecture(null);
    setFormTitle('');
    setFormNumber(lectures.length + 1);
    setFormDuration('45 mins');
    setFormDifficulty('High-Yield');
    setFormStatus('Published');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lecture) => {
    setEditingLecture(lecture);
    setFormTitle(lecture.title);
    setFormNumber(lecture.lectureNumber || 1);
    setFormDuration(lecture.duration || '45 mins');
    setFormDifficulty(lecture.difficulty || 'High-Yield');
    setFormStatus(lecture.status || 'Published');
    setIsModalOpen(true);
  };

  const handleSaveLecture = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingLecture) {
      curriculumService.saveLecture({
        ...editingLecture,
        title: formTitle.trim(),
        lectureNumber: Number(formNumber),
        duration: formDuration.trim() || '45 mins',
        difficulty: formDifficulty,
        status: formStatus
      });
      showToast(`Lecture "${formTitle}" updated!`);
    } else {
      curriculumService.saveLecture({
        moduleId,
        subjectId,
        examId: effectiveExamId,
        title: formTitle.trim(),
        lectureNumber: Number(formNumber),
        duration: formDuration.trim() || '45 mins',
        difficulty: formDifficulty,
        status: formStatus,
        content: {
          pdfList: [],
          images: [],
          video: null,
          flashcards: [],
          liveClasses: [],
          clinicalNotes: 'Comprehensive clinical pearls, diagnostic criteria, and high-yield examination notes.'
        }
      });
      showToast(`New lecture "${formTitle}" added!`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteClick = (lecture) => {
    setDeletingLecture(lecture);
  };

  const handleConfirmDelete = () => {
    if (!deletingLecture) return;
    curriculumService.deleteLecture(deletingLecture.id);
    showToast(`Lecture "${deletingLecture.title}" deleted.`);
    setDeletingLecture(null);
  };

  const handleMoveOrder = (lectureId, direction) => {
    curriculumService.moveLectureOrder(lectureId, direction);
  };

  // Delivery Plan Planning State & Handlers
  const [deliveryModalLecture, setDeliveryModalLecture] = useState(null);
  const [targetWeek, setTargetWeek] = useState(1);
  const [targetDay, setTargetDay] = useState(1);
  const [, setScheduleVersion] = useState(0);

  useEffect(() => {
    const unsub = curriculumService.subscribeDeliveryPlan(() => {
      setScheduleVersion(v => v + 1);
    });
    return unsub;
  }, []);

  const getLectureDeliveryDays = (lectureId) => {
    const slots = curriculumService.getSchedule(effectiveExamId);
    return slots.filter(s =>
      (s.deliveryItems && s.deliveryItems.some(i => i.type === 'lecture' && i.lectureId === lectureId)) ||
      (s.lectureIds && s.lectureIds.includes(lectureId))
    );
  };

  const handleOpenDeliveryModal = (lecture) => {
    setDeliveryModalLecture(lecture);
    const assigned = getLectureDeliveryDays(lecture.id);
    if (assigned.length > 0) {
      setTargetWeek(assigned[0].weekNumber || 1);
      setTargetDay(assigned[0].dayNumber || 1);
    } else {
      setTargetWeek(1);
      setTargetDay(1);
    }
  };

  const handleAssignToDeliveryPlan = (e) => {
    e.preventDefault();
    if (!deliveryModalLecture) return;
    const slot = curriculumService.linkLectureToDay(
      effectiveExamId,
      Number(targetWeek),
      Number(targetDay),
      deliveryModalLecture.id
    );
    if (slot) {
      showToast(`✓ "${deliveryModalLecture.title}" assigned to Week ${targetWeek} · Day ${targetDay}`);
      setDeliveryModalLecture(null);
    }
  };

  const handleUnlinkFromDay = (dayNumber) => {
    if (!deliveryModalLecture) return;
    curriculumService.unlinkLectureFromDay(effectiveExamId, dayNumber, deliveryModalLecture.id);
    showToast(`Removed lecture from Day ${dayNumber}`);
    setScheduleVersion(v => v + 1);
  };

  const getContentStudioUrl = (lectureId) => {
    return `/faculty/exams/${effectiveExamId}/subjects/${subjectId}/modules/${moduleId}/lectures/${lectureId}/content`;
  };

  // 1. Guard: Subject not found
  if (!subject) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-2xs text-center max-w-lg mx-auto my-12 space-y-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Subject Not Found</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The requested subject does not exist or has been removed from the academic curriculum.
        </p>
        <div className="pt-2">
          <Link
            to={routeExamId ? `/faculty/exams/${routeExamId}/subjects` : "/faculty/subjects"}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <span>Return to Subjects</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // 2. Guard: Module not found
  if (!module) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-2xs text-center max-w-lg mx-auto my-12 space-y-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Module Not Found</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The requested curriculum module does not exist or has been removed.
        </p>
        <div className="pt-2">
          <Link
            to={`/faculty/exams/${effectiveExamId}/subjects/${subjectId}/modules`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <span>Return to Modules Roster</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // 3. Guard: Hierarchy Mismatches
  const isExamSubjectMismatch = routeExamId && subject.examId && subject.examId !== routeExamId;
  const isModuleSubjectMismatch = module.subjectId && module.subjectId !== subject.id;
  const isModuleExamMismatch = routeExamId && module.examId && module.examId !== routeExamId;

  if (isExamSubjectMismatch || isModuleSubjectMismatch || isModuleExamMismatch) {
    let errorDetail = '';
    if (isExamSubjectMismatch) {
      errorDetail = `Subject "${subject.name}" belongs to program ${subject.examId?.toUpperCase()}, but was accessed under route ${routeExamId?.toUpperCase()}.`;
    } else if (isModuleSubjectMismatch) {
      errorDetail = `Module "${module.title}" belongs to subject ID "${module.subjectId}", not "${subject.name}" (${subject.id}).`;
    } else if (isModuleExamMismatch) {
      errorDetail = `Module "${module.title}" belongs to program ${module.examId?.toUpperCase()}, but was accessed under route ${routeExamId?.toUpperCase()}.`;
    }

    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-rose-200/80 shadow-2xs text-center max-w-lg mx-auto my-12 space-y-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Invalid Academic Hierarchy Context</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          {errorDetail}
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={`/faculty/exams/${effectiveExamId}/subjects/${subjectId}/modules`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <span>Back to Valid Modules</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to={routeExamId ? `/faculty/exams/${routeExamId}/subjects` : "/faculty/subjects"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            <span>Return to Subjects</span>
          </Link>
        </div>
      </div>
    );
  }

  // 4. Guard: If subject is not assigned to current faculty, restrict access
  if (!isAssigned) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-2xs text-center max-w-lg mx-auto my-12 space-y-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          You do not have assigned permissions for this subject. In the faculty portal, you can only view and manage lectures for subjects explicitly assigned to your faculty roster.
        </p>
        <div className="pt-2">
          <Link
            to={effectiveExamId ? `/faculty/exams/${effectiveExamId}/subjects` : "/faculty/subjects"}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <span>Return to My Assigned Subjects</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-3">
          <div>
            <Link 
              to={`/faculty/exams/${effectiveExamId}/subjects/${subjectId}/modules`}
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Modules</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-extrabold text-[10px] border border-indigo-100">
                  Unit {module?.moduleNumber || '•'}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {subject?.name} • {exam?.flag} {exam?.name}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1 ml-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Assigned Unit • Full Lecture Access</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                {module?.title || 'Module'} — Lectures Roster
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Lecture</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Total Lectures</span>
          <div className="text-2xl font-black text-slate-900">{lectures.length}</div>
          <span className="text-[11px] text-slate-400 font-medium">In this module</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Est. Study Time</span>
          <div className="text-2xl font-black text-slate-900">
            {lectures.length * 45} mins
          </div>
          <span className="text-[11px] text-slate-400 font-medium">~45m / lecture pace</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">High-Yield Concepts</span>
          <div className="text-2xl font-black text-amber-600">
            {lectures.filter(t => t.difficulty === 'High-Yield').length}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Core exam priority</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Content Modules</span>
          <div className="text-2xl font-black text-indigo-600">5 Types</div>
          <span className="text-[11px] text-slate-400 font-medium">PDF, Video, Flashcards & More</span>
        </div>
      </div>

      {/* Filter & View Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search lecture title or key concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
            {['all', 'High-Yield', 'Core Fundamental', 'Advanced'].map(diff => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  difficultyFilter === diff 
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {diff === 'all' ? 'All Yields' : diff}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
              {filteredLectures.length} Lectures
            </span>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400'
              }`}
              title="Table View (List)"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400'
              }`}
              title="Grid View (Cards)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* LECTURES TABLE VIEW (DEFAULT LIST) */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 w-20 text-center">Lecture #</th>
                <th className="py-3 px-4">Lecture Title & Clinical Assets</th>
                <th className="py-3 px-4 text-center">Yield / Level</th>
                <th className="py-3 px-4 text-center">Duration</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLectures.map((top, idx) => {
                const pdfCount = top.content?.pdfList?.length || (top.content?.pdf ? 1 : 0);
                const imgCount = top.content?.images?.length || 0;
                const hasVideo = Boolean(top.content?.video);
                const flashcardCount = top.content?.flashcards?.length || 0;
                const hasLive = (top.content?.liveClasses?.length || 0) > 0;
                const isDragging = draggedIndex === idx;
                const isDragOver = dragOverIndex === idx;
                const contentUrl = getContentStudioUrl(top.id);

                return (
                  <tr
                    key={top.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`transition-all ${
                      isDragging 
                        ? 'opacity-40 bg-slate-100' 
                        : isDragOver
                          ? 'bg-indigo-50/70 border-t-2 border-indigo-500'
                          : 'hover:bg-indigo-50/30'
                    }`}
                  >
                    {/* Drag Handle & Lecture # */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          className="text-slate-300 hover:text-indigo-600 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-100 transition-colors"
                          title="Drag to reorder lecture"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center border border-indigo-100 shadow-2xs shrink-0">
                          {top.lectureNumber || idx + 1}
                        </span>
                      </div>
                    </td>

                    {/* Lecture Title & Content Assets */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5">
                        <Link
                          to={contentUrl}
                          className="font-extrabold text-slate-900 hover:text-indigo-600 transition-colors text-xs block"
                        >
                          {top.title}
                        </Link>

                        {/* Content Asset Indicators Row */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          {pdfCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-semibold text-[10.5px] border border-sky-200/60">
                              <FileText className="w-3 h-3 text-sky-600" />
                              <span>{pdfCount} PDF{pdfCount > 1 ? 's' : ''}</span>
                            </span>
                          )}

                          {imgCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10.5px] border border-emerald-200/60">
                              <ImageIcon className="w-3 h-3 text-emerald-600" />
                              <span>{imgCount} Diagram{imgCount > 1 ? 's' : ''}</span>
                            </span>
                          )}

                          {hasVideo && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[10.5px] border border-purple-200/60">
                              <Video className="w-3 h-3 text-purple-600" />
                              <span>Lecture Video</span>
                            </span>
                          )}

                          {flashcardCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold text-[10.5px] border border-amber-200/60">
                              <Brain className="w-3 h-3 text-amber-600" />
                              <span>{flashcardCount} Cards</span>
                            </span>
                          )}

                          {hasLive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold text-[10.5px] border border-rose-200/60">
                              <Radio className="w-3 h-3 text-rose-600 animate-pulse" />
                              <span>Live Broadcast</span>
                            </span>
                          )}

                          {pdfCount === 0 && imgCount === 0 && !hasVideo && flashcardCount === 0 && !hasLive && (
                            <span className="text-[10.5px] text-slate-400 italic">
                              No learning assets uploaded yet
                            </span>
                          )}

                          {(() => {
                            const assigned = getLectureDeliveryDays(top.id);
                            if (assigned.length === 0) return null;
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-extrabold text-[10px] border border-indigo-200">
                                <Calendar className="w-3 h-3 text-indigo-600" />
                                <span>Delivered: {assigned.map(d => `Day ${d.dayNumber}`).join(', ')}</span>
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </td>

                    {/* Yield / Difficulty */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                        top.difficulty === 'High-Yield'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : top.difficulty === 'Advanced'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {top.difficulty || 'High-Yield'}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{top.duration || '45 mins'}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        top.status === 'Draft'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      }`}>
                        {top.status || 'Published'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(top)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Lecture Meta"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(top)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Lecture"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center border-l border-slate-200 pl-1.5 ml-1 space-x-0.5">
                          <button
                            onClick={() => handleMoveOrder(top.id, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleMoveOrder(top.id, 'down')}
                            disabled={idx === filteredLectures.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {/* PLAN DELIVERY BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleOpenDeliveryModal(top)}
                          className="inline-flex items-center gap-1.5 ml-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-xs transition-all cursor-pointer border border-slate-200"
                          title="Add to Week/Day Delivery Plan"
                        >
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="hidden xl:inline">Delivery Plan</span>
                        </button>

                        {/* MANAGE CONTENT BUTTON */}
                        <Link
                          to={contentUrl}
                          className="inline-flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                          title="Manage Content Studio"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Manage Content</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredLectures.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-xs text-slate-600">No lectures found</p>
                      <button
                        onClick={handleOpenCreateModal}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer"
                      >
                        + Add Lecture
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid (Cards) View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLectures.map((top, idx) => {
            const pdfCount = top.content?.pdfList?.length || (top.content?.pdf ? 1 : 0);
            const imgCount = top.content?.images?.length || 0;
            const hasVideo = Boolean(top.content?.video);
            const flashcardCount = top.content?.flashcards?.length || 0;
            const hasLive = (top.content?.liveClasses?.length || 0) > 0;
            const contentUrl = getContentStudioUrl(top.id);

            return (
              <div
                key={top.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between overflow-hidden group p-5"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center border border-indigo-100 shadow-2xs">
                      #{top.lectureNumber || idx + 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      top.status === 'Draft'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    }`}>
                      {top.status || 'Published'}
                    </span>
                  </div>

                  <div>
                    <Link
                      to={contentUrl}
                      className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors block"
                    >
                      {top.title}
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      top.difficulty === 'High-Yield'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {top.difficulty || 'High-Yield'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{top.duration || '45 mins'}</span>
                    </span>
                  </div>

                  {/* Asset Chips */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 text-[10.5px]">
                    {pdfCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-semibold border border-sky-100 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>{pdfCount} PDF</span>
                      </span>
                    )}
                    {hasVideo && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold border border-purple-100 flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        <span>Video</span>
                      </span>
                    )}
                    {flashcardCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-100 flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        <span>{flashcardCount} Cards</span>
                      </span>
                    )}
                    {hasLive && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold border border-rose-100 flex items-center gap-1">
                        <Radio className="w-3 h-3 text-rose-500" />
                        <span>Live</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(top)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Edit Lecture"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDeliveryModal(top)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="Add to Week/Day Delivery Plan"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(top)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Lecture"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    to={contentUrl}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <span>Manage Content</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL: ADD / EDIT LECTURE                                               */}
      {/* ======================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingLecture ? 'Edit Lecture' : 'Add New Lecture'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define learning lecture title, duration, yield, and sequence
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLecture} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Order #
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Lecture Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aortic Stenosis Gradient Criteria & Hemodynamics"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Est. Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 45 mins"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Yield / Difficulty Level
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="High-Yield">High-Yield</option>
                    <option value="Core Fundamental">Core Fundamental</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Status
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="facultyLectureStatus"
                      value="Published"
                      checked={formStatus === 'Published'}
                      onChange={() => setFormStatus('Published')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Published (Visible to students)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="facultyLectureStatus"
                      value="Draft"
                      checked={formStatus === 'Draft'}
                      onChange={() => setFormStatus('Draft')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Draft (Faculty only)</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {editingLecture ? 'Save Changes' : 'Create Lecture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* DELETE MODAL                                                            */}
      {/* ======================================================================= */}
      {deletingLecture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">
                Delete Lecture?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{deletingLecture.title}"</span>? All attached content assets will be permanently removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeletingLecture(null)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm shadow-rose-600/20 transition-all cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL: DELIVERY PLANNING (ADD TO WEEK/DAY)                             */}
      {/* ======================================================================= */}
      {deliveryModalLecture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-indigo-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-600/30">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-indigo-700">
                    Delivery Schedule Layer
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    Add to Delivery Plan
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setDeliveryModalLecture(null)}
                className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-600 flex items-center justify-center border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignToDeliveryPlan} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              {/* Lecture Context Info */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>{subject?.name}</span>
                  <span>•</span>
                  <span>Unit {module?.moduleNumber}: {module?.title}</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900">
                  {deliveryModalLecture.title}
                </div>
                <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 font-medium">
                  <span>{deliveryModalLecture.duration || '45 mins'}</span>
                  <span>•</span>
                  <span className="font-bold text-indigo-600">{deliveryModalLecture.difficulty}</span>
                </div>
              </div>

              {/* Current Schedule Status */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Delivery Assignments
                </label>
                {(() => {
                  const assigned = getLectureDeliveryDays(deliveryModalLecture.id);
                  if (assigned.length === 0) {
                    return (
                      <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
                        Not yet assigned to any study day. Select a week and day below to plan its delivery.
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-1.5">
                      {assigned.map(s => (
                        <div key={s.id || s.dayNumber} className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/70 text-xs font-semibold text-indigo-950">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-[11px] flex items-center justify-center">
                              D{s.dayNumber}
                            </span>
                            <span>Week {s.weekNumber} · Day {s.dayNumber}: {s.dayTitle || s.title || 'Curriculum Slot'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUnlinkFromDay(s.dayNumber)}
                            className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Week Selector */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Select Delivery Week
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(w => (
                    <button
                      type="button"
                      key={w}
                      onClick={() => {
                        setTargetWeek(w);
                        setTargetDay((w - 1) * 7 + 1);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer text-center ${
                        Number(targetWeek) === w
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      Week {w}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day Selector */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  2. Select Calendar Day
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 7 }, (_, i) => {
                    const dNum = (Number(targetWeek) - 1) * 7 + i + 1;
                    const isSelected = Number(targetDay) === dNum;
                    return (
                      <button
                        type="button"
                        key={dNum}
                        onClick={() => setTargetDay(dNum)}
                        className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className="text-[9px] opacity-75">Day</span>
                        <span>{dNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic pt-1">
                Architectural rule: Day references this canonical lecture by ID. Changes to lecture title, clinical notes, or resources will reflect immediately without duplication.
              </p>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryModalLecture(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save to Week {targetWeek} · Day {targetDay}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

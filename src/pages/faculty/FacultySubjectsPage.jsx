import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Layers, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  FolderTree, 
  ArrowRight, 
  ArrowLeft,
  Heart, 
  Brain, 
  Wind, 
  Droplet, 
  Activity, 
  Pill, 
  Microscope, 
  Shield, 
  BookOpen, 
  Clock, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';
import { peopleService } from '../../services/peopleService';

const AVAILABLE_ICONS = [
  { name: 'Heart', icon: Heart, label: 'Cardiology / Vascular' },
  { name: 'Wind', icon: Wind, label: 'Pulmonology / Respiratory' },
  { name: 'Droplet', icon: Droplet, label: 'Renal / Nephrology' },
  { name: 'Activity', icon: Activity, label: 'Gastroenterology / Surgery' },
  { name: 'Brain', icon: Brain, label: 'Neurology / Psychiatry' },
  { name: 'Pill', icon: Pill, label: 'Clinical Pharmacology' },
  { name: 'Microscope', icon: Microscope, label: 'Pathology / Hematology' },
  { name: 'Shield', icon: Shield, label: 'Emergency / Ethics' },
  { name: 'BookOpen', icon: BookOpen, label: 'General Medicine' }
];

const AVAILABLE_COLORS = [
  { id: 'rose', name: 'Rose Red', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
  { id: 'sky', name: 'Sky Blue', bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200' },
  { id: 'amber', name: 'Warm Amber', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  { id: 'indigo', name: 'Indigo', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  { id: 'purple', name: 'Purple', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' }
];

export default function FacultySubjectsPage() {
  const { examId: routeExamId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [exams, setExams] = useState(() => catalogService.getExams());
  const [subjects, setSubjects] = useState(() => curriculumService.getSubjects());
  const [chapters, setChapters] = useState(() => curriculumService.getChapters());
  const [topics, setTopics] = useState(() => curriculumService.getTopics());

  const currentFaculty = peopleService.getCurrentFacultyProfile();
  const facultyAssignedSubjectIds = currentFaculty?.assignedSubjects || [];
  const assignedExamsList = currentFaculty?.assignedExams || [];

  // Helper: Strictly check if a subject is assigned to current faculty
  const isSubjectAssigned = (s) => {
    if (!s) return false;
    const cleanFacultyName = currentFaculty?.name ? currentFaculty.name.replace(/^Dr\.\s*/i, '').toLowerCase().trim() : '';
    return (
      facultyAssignedSubjectIds.includes(s.id) ||
      (currentFaculty?.email && s.facultyEmail && s.facultyEmail.toLowerCase() === currentFaculty.email.toLowerCase()) ||
      (cleanFacultyName && s.assignedFacultyName && s.assignedFacultyName.toLowerCase().includes(cleanFacultyName))
    );
  };

  // Only exams that are assigned to the faculty or have assigned subjects
  const assignedExams = useMemo(() => {
    return exams.filter(e => {
      const assignedInList = assignedExamsList.includes(e.id);
      const hasAssignedSubject = subjects.some(s => s.examId === e.id && isSubjectAssigned(s));
      return assignedInList || hasAssignedSubject;
    });
  }, [exams, subjects, assignedExamsList, facultyAssignedSubjectIds, currentFaculty]);

  // Selected exam filter: default to 'all' as requested by user
  const initialExamFilter = searchParams.get('exam') || 'all';
  const [selectedExamFilter, setSelectedExamFilter] = useState(initialExamFilter);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');

  // If accessed via /faculty/exams/:examId/subjects, normalize cleanly to /faculty/subjects
  useEffect(() => {
    if (routeExamId) {
      navigate('/faculty/subjects', { replace: true });
    }
  }, [routeExamId, navigate]);

  // If selectedExamFilter is neither 'all' nor in assignedExams, reset to 'all'
  useEffect(() => {
    if (selectedExamFilter !== 'all' && assignedExams.length > 0 && !assignedExams.some(e => e.id === selectedExamFilter)) {
      setSelectedExamFilter('all');
    }
  }, [selectedExamFilter, assignedExams]);

  // View & Filter State
  const [viewMode, setViewMode] = useState('table');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deletingSubject, setDeletingSubject] = useState(null);

  // Form State
  const [formExamId, setFormExamId] = useState(assignedExams[0]?.id || 'neet-pg');
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('Heart');
  const [formColor, setFormColor] = useState('rose');
  const [formStatus, setFormStatus] = useState('Active');
  const [formFacultyName, setFormFacultyName] = useState(currentFaculty?.name || 'Dr. Siddharth V.');

  useEffect(() => {
    const unsubCurriculum = curriculumService.subscribeCurriculum(() => {
      setSubjects(curriculumService.getSubjects());
      setChapters(curriculumService.getChapters());
      setTopics(curriculumService.getTopics());
    });
    const unsubCatalog = catalogService.subscribe((payload) => {
      setExams(payload.exams);
    });
    return () => {
      unsubCurriculum();
      unsubCatalog();
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleExamFilterChange = (newExamId) => {
    setSelectedExamFilter(newExamId);
    setSelectedSubjectFilter('all');
  };

  // Available subjects for subject filter dropdown (relative to chosen exam filter)
  const availableSubjectsForFilter = useMemo(() => {
    return subjects.filter(s => {
      if (!isSubjectAssigned(s)) return false;
      if (selectedExamFilter !== 'all' && s.examId !== selectedExamFilter) return false;
      return true;
    });
  }, [subjects, selectedExamFilter, facultyAssignedSubjectIds, currentFaculty]);

  // Reset subject filter if it's no longer in the filtered exam
  useEffect(() => {
    if (selectedSubjectFilter !== 'all') {
      const exists = availableSubjectsForFilter.some(s => s.id === selectedSubjectFilter);
      if (!exists) {
        setSelectedSubjectFilter('all');
      }
    }
  }, [availableSubjectsForFilter, selectedSubjectFilter]);

  // Filtered Subjects: STRICTLY scoped to assigned subjects only
  const filteredSubjects = useMemo(() => {
    return subjects
      .filter(s => {
        // Must be assigned to this faculty
        if (!isSubjectAssigned(s)) return false;

        // Filter by Exam Track
        if (selectedExamFilter !== 'all' && s.examId !== selectedExamFilter) return false;

        // Filter by Subject
        if (selectedSubjectFilter !== 'all' && s.id !== selectedSubjectFilter) return false;

        // Filter by Status
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;
        
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        const examObj = exams.find(e => e.id === s.examId);
        const examName = examObj?.name?.toLowerCase() || '';

        return (
          s.name.toLowerCase().includes(q) || 
          (s.code && s.code.toLowerCase().includes(q)) ||
          examName.includes(q) ||
          (s.assignedFacultyName && s.assignedFacultyName.toLowerCase().includes(q)) ||
          (s.description && s.description.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [subjects, selectedExamFilter, selectedSubjectFilter, statusFilter, searchQuery, exams, facultyAssignedSubjectIds, currentFaculty]);

  // Overall Statistics for current assigned scope
  const stats = useMemo(() => {
    const currentSubjects = subjects.filter(s => {
      if (!isSubjectAssigned(s)) return false;
      if (selectedExamFilter !== 'all' && s.examId !== selectedExamFilter) return false;
      if (selectedSubjectFilter !== 'all' && s.id !== selectedSubjectFilter) return false;
      return true;
    });
    const currentSubjectIds = currentSubjects.map(s => s.id);
    const currentChapters = chapters.filter(c => currentSubjectIds.includes(c.subjectId));
    const currentChapterIds = currentChapters.map(c => c.id);
    const currentTopics = topics.filter(t => currentChapterIds.includes(t.chapterId));

    return {
      totalSubjects: currentSubjects.length,
      totalChapters: currentChapters.length,
      totalTopics: currentTopics.length,
      assignedCount: currentSubjects.length
    };
  }, [subjects, chapters, topics, selectedExamFilter, selectedSubjectFilter, facultyAssignedSubjectIds, currentFaculty]);

  const totalAssignedSubjectsCount = useMemo(() => {
    return subjects.filter(isSubjectAssigned).length;
  }, [subjects, facultyAssignedSubjectIds, currentFaculty]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedExamFilter !== 'all' || selectedSubjectFilter !== 'all' || statusFilter !== 'all';

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedExamFilter('all');
    setSelectedSubjectFilter('all');
    setStatusFilter('all');
  };

  const handleOpenCreateModal = () => {
    setEditingSubject(null);
    const targetExam = selectedExamFilter !== 'all' ? selectedExamFilter : (exams[0]?.id || 'neet-pg');
    setFormExamId(targetExam);
    setFormName('');
    setFormCode(`${targetExam.toUpperCase().slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`);
    setFormDescription('');
    setFormIcon('Heart');
    setFormColor('rose');
    setFormStatus('Active');
    setFormFacultyName(currentFaculty?.name || 'Dr. Siddharth V.');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sub) => {
    setEditingSubject(sub);
    setFormExamId(sub.examId);
    setFormName(sub.name);
    setFormCode(sub.code || '');
    setFormDescription(sub.description || '');
    setFormIcon(sub.iconName || 'Heart');
    setFormColor(sub.colorTheme || 'indigo');
    setFormStatus(sub.status || 'Active');
    setFormFacultyName(sub.assignedFacultyName || currentFaculty?.name || 'Dr. Siddharth V.');
    setIsModalOpen(true);
  };

  const handleSaveSubject = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter a subject name');
      return;
    }

    const payload = {
      examId: formExamId,
      name: formName.trim(),
      code: formCode.trim() || `${formExamId.toUpperCase().slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`,
      description: formDescription.trim(),
      iconName: formIcon,
      colorTheme: formColor,
      status: formStatus,
      assignedFacultyName: formFacultyName.trim()
    };

    if (editingSubject) {
      curriculumService.updateSubject(editingSubject.id, payload);
      showToast(`Subject "${payload.name}" updated successfully.`);
    } else {
      const newSubjectId = `sub-${formExamId.slice(0, 4)}-${Date.now().toString(36)}`;
      curriculumService.createSubject({
        id: newSubjectId,
        ...payload,
        facultyEmail: currentFaculty?.email || 'faculty@demo.com'
      });
      // Auto-assign new subject to current faculty profile
      if (currentFaculty) {
        const updatedAssigned = Array.from(new Set([...(currentFaculty.assignedSubjects || []), newSubjectId]));
        peopleService.updateFaculty(currentFaculty.id, { assignedSubjects: updatedAssigned });
      }
      showToast(`Subject "${payload.name}" created and assigned to your roster successfully.`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteSubject = () => {
    if (!deletingSubject) return;
    const result = curriculumService.deleteSubject(deletingSubject.id);
    if (!result.success) {
      alert(result.reason);
      return;
    }
    showToast(`Subject "${deletingSubject.name}" deleted.`);
    setDeletingSubject(null);
  };

  const handleToggleStatus = (sub) => {
    const nextStatus = sub.status === 'Draft' ? 'Active' : 'Draft';
    curriculumService.updateSubject(sub.id, { status: nextStatus });
    showToast(`Subject status changed to ${nextStatus}.`);
  };

  const getActiveExam = () => {
    return exams.find(e => e.id === selectedExamFilter) || null;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}


      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Link 
              to="/faculty/exams"
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Exams</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Level 2 • Subjects Directory
            </span>
            {getActiveExam() && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-bold text-slate-700">
                  {getActiveExam().flag} {getActiveExam().name}
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {getActiveExam() ? `${getActiveExam().name} • Subjects & Units` : 'All Medical Subjects & Curriculum Units'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Manage clinical and pre-clinical subjects, assign chapter syllabus, and oversee study flow for your teaching track.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Subject</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Total Subjects</span>
          <div className="text-2xl font-black text-slate-900">{stats.totalSubjects}</div>
          <span className="text-[11px] text-slate-400 font-medium">Curriculum disciplines</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Chapters Count</span>
          <div className="text-2xl font-black text-slate-900">{stats.totalChapters}</div>
          <span className="text-[11px] text-slate-400 font-medium">Syllabus unit blocks</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Topics Roster</span>
          <div className="text-2xl font-black text-slate-900">{stats.totalTopics}</div>
          <span className="text-[11px] text-slate-400 font-medium">Granular learning concepts</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Assigned to You</span>
          <div className="text-2xl font-black text-indigo-600">{stats.assignedCount}</div>
          <span className="text-[11px] text-slate-400 font-medium">Under your specialty scope</span>
        </div>
      </div>

      {/* Toolbar: Search, Exam Dropdown Filter, Subject Filter, Status Filter, View Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto flex-wrap">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search subjects, codes, overview..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="w-4 h-4 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center"
                title="Clear search text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Exam Program Filter Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedExamFilter}
              onChange={(e) => handleExamFilterChange(e.target.value)}
              className={`w-full sm:w-auto pl-3.5 pr-8 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer appearance-none transition-all ${
                selectedExamFilter !== 'all'
                  ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <option value="all">🌐 All Assigned Programs ({totalAssignedSubjectsCount})</option>
              {assignedExams.map((exam) => {
                const count = subjects.filter(s => s.examId === exam.id && isSubjectAssigned(s)).length;
                return (
                  <option key={exam.id} value={exam.id}>
                    {exam.flag} {exam.name} ({count})
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Subject Filter Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className={`w-full sm:w-auto pl-3.5 pr-8 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer appearance-none transition-all ${
                selectedSubjectFilter !== 'all'
                  ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <option value="all">📚 All Subjects ({availableSubjectsForFilter.length})</option>
              {availableSubjectsForFilter.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs font-bold text-slate-500 hover:text-indigo-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            {['all', 'Active', 'Draft'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                  statusFilter === st
                    ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Subject Cards or Table View */}
      {filteredSubjects.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Subjects Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No subjects match your current search or filter criteria. Try resetting filters or add a new subject.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Subject</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((sub) => {
            const examObj = exams.find(e => e.id === sub.examId);
            const subChapters = chapters.filter(c => c.subjectId === sub.id);
            const subChapterIds = subChapters.map(c => c.id);
            const subTopics = topics.filter(t => subChapterIds.includes(t.chapterId));
            const isAssigned = facultyAssignedSubjectIds.includes(sub.id);

            const iconDef = AVAILABLE_ICONS.find(i => i.name === sub.iconName) || AVAILABLE_ICONS[0];
            const IconComp = iconDef.icon;
            const colorDef = AVAILABLE_COLORS.find(c => c.id === sub.colorTheme) || AVAILABLE_COLORS[4];

            return (
              <div
                key={sub.id}
                className={`bg-white rounded-3xl border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group ${
                  isAssigned ? 'border-indigo-200 ring-1 ring-indigo-50 hover:border-indigo-400' : 'border-slate-200/90 hover:border-indigo-300'
                }`}
              >
                <div className="p-6 space-y-4">
                  {/* Top Bar: Icon, Code & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${colorDef.bg} ${colorDef.text}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                          {sub.code || 'MED-01'}
                        </span>
                        {isAssigned && (
                          <span className="ml-1.5 text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                            Assigned
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(sub)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition-colors ${
                        sub.status === 'Draft'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      }`}
                    >
                      {sub.status || 'Active'}
                    </button>
                  </div>

                  {/* Title & Exam tag */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {sub.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                      <span>{examObj?.flag || '🩺'}</span>
                      <span>{examObj?.name || sub.examId}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {sub.description || 'Clinical foundations, diagnostic criteria, and board review curriculum.'}
                  </p>

                  {/* Units info */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Chapters</span>
                      <span className="text-xs font-extrabold text-slate-800">{subChapters.length} Units</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Topics</span>
                      <span className="text-xs font-extrabold text-slate-800">{subTopics.length} Concepts</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(sub)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors cursor-pointer"
                      title="Edit Subject"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingSubject(sub)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    to={`/faculty/exams/${sub.examId || selectedExamFilter}/subjects/${sub.id}/chapters`}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <span>Manage Chapters</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Subject & Curriculum Scope</th>
                <th className="py-3 px-4">Exam Track</th>
                <th className="py-3 px-4 text-center">Hierarchy Units</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubjects.map((sub) => {
                const examObj = exams.find(e => e.id === sub.examId);
                const subChapters = chapters.filter(c => c.subjectId === sub.id);
                const subChapterIds = subChapters.map(c => c.id);
                const subTopics = topics.filter(t => subChapterIds.includes(t.chapterId));
                const isAssigned = facultyAssignedSubjectIds.includes(sub.id);

                const iconDef = AVAILABLE_ICONS.find(i => i.name === sub.iconName) || AVAILABLE_ICONS[0];
                const IconComp = iconDef.icon;
                const colorDef = AVAILABLE_COLORS.find(c => c.id === sub.colorTheme) || AVAILABLE_COLORS[4];

                return (
                  <tr key={sub.id} className="hover:bg-indigo-50/30 transition-colors">
                    {/* Subject info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${colorDef.bg} ${colorDef.text}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/faculty/exams/${sub.examId || selectedExamFilter}/subjects/${sub.id}/chapters`}
                              className="font-extrabold text-slate-900 hover:text-indigo-600 transition-colors text-xs"
                            >
                              {sub.name}
                            </Link>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {sub.code || 'MED-01'}
                            </span>
                            {isAssigned && (
                              <span className="text-[9.5px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                                Assigned
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 max-w-md">
                            {sub.description || 'Clinical curriculum module'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Exam Track */}
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <span>{examObj?.flag || '🩺'}</span>
                        <span>{examObj?.name || sub.examId}</span>
                      </div>
                    </td>

                    {/* Units Count */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {subChapters.length} Chapters
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {subTopics.length} Topics
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(sub)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition-colors ${
                          sub.status === 'Draft'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        }`}
                      >
                        {sub.status || 'Active'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(sub)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Subject"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingSubject(sub)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          to={`/faculty/exams/${sub.examId || selectedExamFilter}/subjects/${sub.id}/chapters`}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-[11px] transition-colors ml-1 inline-flex items-center gap-1"
                        >
                          <span>Chapters</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL: ADD / EDIT SUBJECT                                               */}
      {/* ======================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure curriculum discipline, unit code, color styling, and departmental assignment
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

            {/* Form */}
            <form onSubmit={handleSaveSubject} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Exam Program */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Target Exam Track <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formExamId}
                  onChange={(e) => setFormExamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  {assignedExams.map(e => (
                    <option key={e.id} value={e.id}>{e.flag} {e.name}</option>
                  ))}
                </select>
              </div>

              {/* Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Subject Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cardiovascular Medicine & ECG"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NEET-CARDIO"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Icon Selector */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1.5">
                  Discipline Category Icon
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_ICONS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = formIcon === item.name;
                    return (
                      <button
                        type="button"
                        key={item.name}
                        onClick={() => setFormIcon(item.name)}
                        className={`p-2 rounded-xl flex items-center gap-2 border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 ring-2 ring-indigo-500/10'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-[11px] font-bold truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1.5">
                  Color Accent Theme
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map((clr) => {
                    const isSelected = formColor === clr.id;
                    return (
                      <button
                        type="button"
                        key={clr.id}
                        onClick={() => setFormColor(clr.id)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                          isSelected 
                            ? `${clr.bg} ${clr.text} ${clr.border} ring-2 ring-indigo-500/20`
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${clr.bg} border ${clr.border}`} />
                        <span>{clr.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Subject Overview & Clinical Scope
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline high-yield clinical systems, diagnostic pearls, and syllabus objectives..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
                />
              </div>

              {/* Status */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Publication Status
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="facultySubStatus"
                      value="Active"
                      checked={formStatus === 'Active'}
                      onChange={() => setFormStatus('Active')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Active (Visible in Curriculum)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="facultySubStatus"
                      value="Draft"
                      checked={formStatus === 'Draft'}
                      onChange={() => setFormStatus('Draft')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Draft (Under Review)</span>
                  </label>
                </div>
              </div>

              {/* Footer */}
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
                  {editingSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                               */}
      {/* ======================================================================= */}
      {deletingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">
                Delete Subject?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{deletingSubject.name}"</span>? Any chapters or topics under this subject may also be removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeletingSubject(null)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm shadow-rose-600/20 transition-all cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

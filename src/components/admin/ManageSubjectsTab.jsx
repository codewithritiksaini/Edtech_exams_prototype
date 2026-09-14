import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  Layers, 
  FolderTree, 
  ArrowRight, 
  Sparkles,
  Heart,
  Brain,
  Wind,
  Droplet,
  Activity,
  Pill,
  Microscope,
  Shield,
  HelpCircle,
  Clock,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Eye,
  Check,
  FileText,
  AlertCircle
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';
import { authService, USER_ROLES } from '../../services/authService';

const AVAILABLE_ICONS = [
  { name: 'Heart', icon: Heart, label: 'Cardio / Vascular' },
  { name: 'Wind', icon: Wind, label: 'Pulmonology / Resp' },
  { name: 'Droplet', icon: Droplet, label: 'Renal / Nephrology' },
  { name: 'Activity', icon: Activity, label: 'Gastro / General' },
  { name: 'Brain', icon: Brain, label: 'Neuro / Psych' },
  { name: 'Pill', icon: Pill, label: 'Pharmacology' },
  { name: 'Microscope', icon: Microscope, label: 'Pathology / Micro' },
  { name: 'Shield', icon: Shield, label: 'Emergency / Ethics' },
  { name: 'BookOpen', icon: BookOpen, label: 'General Medicine' }
];

const AVAILABLE_COLORS = [
  { id: 'rose', name: 'Rose Red', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', ring: 'ring-rose-500' },
  { id: 'sky', name: 'Sky Blue', bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200', ring: 'ring-sky-500' },
  { id: 'amber', name: 'Warm Amber', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', ring: 'ring-amber-500' },
  { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', ring: 'ring-emerald-500' },
  { id: 'indigo', name: 'Indigo', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', ring: 'ring-indigo-500' },
  { id: 'purple', name: 'Purple', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', ring: 'ring-purple-500' },
  { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', ring: 'ring-cyan-500' }
];

export default function ManageSubjectsTab({ onNavigateToModules }) {
  const [currentUser] = useState(() => authService.getCurrentUser());
  const [exams, setExams] = useState(() => catalogService.getExams());
  const [selectedExamId, setSelectedExamId] = useState('neet-pg');
  const [subjects, setSubjects] = useState(() => curriculumService.getSubjects());
  const [modules, setModules] = useState(() => curriculumService.getModules());
  const [lectures, setLectures] = useState(() => curriculumService.getLectures());

  // View & Filter State
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Active' | 'Draft'
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  // Form State
  const [formExamId, setFormExamId] = useState('neet-pg');
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('Heart');
  const [formColor, setFormColor] = useState('rose');
  const [formStatus, setFormStatus] = useState('Active');

  // Safety Delete Modal
  const [deletingSubject, setDeletingSubject] = useState(null);

  // Sync from catalog & curriculum service
  useEffect(() => {
    const unsubCurriculum = curriculumService.subscribeCurriculum(() => {
      setSubjects(curriculumService.getSubjects());
      setModules(curriculumService.getModules());
      setLectures(curriculumService.getLectures());
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

  const selectedExam = useMemo(() => {
    return exams.find(e => e.id === selectedExamId) || exams[0];
  }, [exams, selectedExamId]);

  // Filter subjects for the selected exam, status & search query
  const filteredSubjects = useMemo(() => {
    return subjects
      .filter(s => s.examId === selectedExamId)
      .filter(s => {
        if (statusFilter === 'all') return true;
        return s.status === statusFilter;
      })
      .filter(s => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) ||
               s.code.toLowerCase().includes(q) ||
               (s.description && s.description.toLowerCase().includes(q));
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [subjects, selectedExamId, statusFilter, searchQuery]);

  // Counts for KPI
  const stats = useMemo(() => {
    const examSubs = subjects.filter(s => s.examId === selectedExamId);
    const examChaps = modules.filter(c => c.examId === selectedExamId);
    const examTops = lectures.filter(t => t.examId === selectedExamId);
    const activeSubs = examSubs.filter(s => s.status === 'Active');
    const draftSubs = examSubs.filter(s => s.status === 'Draft');

    return {
      subjectsCount: examSubs.length,
      activeCount: activeSubs.length,
      draftCount: draftSubs.length,
      modulesCount: examChaps.length,
      lecturesCount: examTops.length
    };
  }, [subjects, modules, lectures, selectedExamId]);

  const handleOpenCreateModal = () => {
    setEditingSubject(null);
    setFormExamId(selectedExamId);
    setFormName('');
    setFormCode(`SUB-${Math.floor(100 + Math.random() * 900)}`);
    setFormDescription('Comprehensive clinical modules, diagnostic criteria, and case vignettes.');
    setFormIcon('BookOpen');
    setFormColor('indigo');
    setFormStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sub) => {
    setEditingSubject(sub);
    setFormExamId(sub.examId);
    setFormName(sub.name);
    setFormCode(sub.code);
    setFormDescription(sub.description || '');
    setFormIcon(sub.icon || 'BookOpen');
    setFormColor(sub.color || 'indigo');
    setFormStatus(sub.status || 'Active');
    setIsModalOpen(true);
  };

  const handleSaveSubject = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter a subject name.');
      return;
    }

    const payload = {
      ...(editingSubject ? { id: editingSubject.id } : {}),
      examId: formExamId,
      name: formName.trim(),
      code: formCode.trim() || `SUB-${Date.now().toString().slice(-3)}`,
      description: formDescription.trim(),
      icon: formIcon,
      color: formColor,
      status: formStatus
    };

    curriculumService.saveSubject(payload);
    setSubjects(curriculumService.getSubjects());
    setIsModalOpen(false);
    showToast(editingSubject ? `Subject "${formName}" updated successfully!` : `New subject "${formName}" created under ${selectedExam.name}!`);
  };

  const handleDeleteSubject = () => {
    if (!deletingSubject) return;
    curriculumService.deleteSubject(deletingSubject.id);
    setSubjects(curriculumService.getSubjects());
    setDeletingSubject(null);
    showToast(`Subject "${deletingSubject.name}" and associated modules removed.`);
  };

  const handleToggleStatus = (sub, e) => {
    if (e) e.stopPropagation();
    const updated = curriculumService.toggleSubjectStatus(sub.id);
    setSubjects(curriculumService.getSubjects());
    showToast(`Subject "${sub.name}" is now ${updated.status}.`);
  };

  const handleMoveOrder = (sub, direction, e) => {
    if (e) e.stopPropagation();
    curriculumService.moveSubjectOrder(sub.id, direction);
    setSubjects(curriculumService.getSubjects());
    showToast(`Reordered "${sub.name}" ${direction}.`);
  };

  const renderSubjectIcon = (iconName, colorId) => {
    const iconObj = AVAILABLE_ICONS.find(i => i.name === iconName) || AVAILABLE_ICONS[0];
    const colorObj = AVAILABLE_COLORS.find(c => c.id === colorId) || AVAILABLE_COLORS[0];
    const IconComponent = iconObj.icon;
    return (
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${colorObj.bg} ${colorObj.text} ${colorObj.border} shadow-2xs`}>
        <IconComponent className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>Academic Hierarchy Level 1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Subjects & Discipline Setup
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Manage academic medical subjects for each examination track: <span className="font-semibold text-slate-800">Exams → Subjects → Modules → Lectures → Content</span>. Configure curriculum modules, inspect assigned modules, and adjust publishing status.
          </p>
        </div>

        <button
          id="btn-add-subject"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition-all hover:shadow-indigo-500/20 active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Subject</span>
        </button>
      </div>

      {/* Exam Selector Tabs & Top Control Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        
        {/* Row 1: Exam Track Selector */}
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 pl-1 shrink-0 flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5" />
              Exam Track:
            </span>
            {exams.map(exam => {
              const examSubCount = subjects.filter(s => s.examId === exam.id).length;
              return (
                <button
                  key={exam.id}
                  id={`exam-tab-${exam.id}`}
                  onClick={() => {
                    setSelectedExamId(exam.id);
                    setExpandedSubjectId(null);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                    selectedExamId === exam.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{exam.flag}</span>
                  <span>{exam.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    selectedExamId === exam.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {examSubCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Toggle: Grid vs Table */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              id="view-mode-grid"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-white text-indigo-700 shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              id="view-mode-table"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-white text-indigo-700 shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Roster Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>

        {/* Row 2: Status Filters + Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Status Filter Pills */}
          <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({stats.subjectsCount})
            </button>
            <button
              onClick={() => setStatusFilter('Active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Active ({stats.activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('Draft')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'Draft'
                  ? 'bg-slate-200 text-slate-800 border border-slate-300'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Draft ({stats.draftCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-subjects-input"
              type="text"
              placeholder="Search subject, code, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

      </div>

      {/* KPI Stats Quick Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Active Subjects</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats.activeCount} <span className="text-xs font-semibold text-slate-400">/ {stats.subjectsCount}</span></div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Modules</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats.modulesCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
            <FolderTree className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Active Lectures</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats.lecturesCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Draft / Pending</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats.draftCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* VIEW MODE 1: GRID CARDS                                               */}
      {/* ===================================================================== */}
      {viewMode === 'grid' && (
        <>
          {filteredSubjects.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No subjects found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No subjects found for {selectedExam.name} matching your search or filter. Click below to add a new subject.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Subject</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSubjects.map((sub, idx) => {
                const subModules = modules.filter(c => c.subjectId === sub.id);
                const subLectures = lectures.filter(t => t.subjectId === sub.id);
                const isExpanded = expandedSubjectId === sub.id;

                return (
                  <div
                    key={sub.id}
                    className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden group ${
                      isExpanded 
                        ? 'border-indigo-300 ring-2 ring-indigo-500/10 shadow-md' 
                        : 'border-slate-200 shadow-xs hover:shadow-md'
                    }`}
                  >
                    <div className="p-5 space-y-4">
                      {/* Top row: Icon + Code + Reorder + Inline Toggle */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {renderSubjectIcon(sub.icon, sub.color)}
                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {sub.code}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 mt-1 truncate" title={sub.name}>
                              {sub.name}
                            </h3>
                          </div>
                        </div>

                        {/* Inline Status Toggle Switch */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleToggleStatus(sub, e)}
                            title={`Click to switch to ${sub.status === 'Active' ? 'Draft' : 'Active'}`}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                              sub.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span>{sub.status}</span>
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {sub.description || 'Core clinical curriculum module covering diagnostic criteria and licensing vignettes.'}
                      </p>

                      {/* Badges: Modules & Lectures counts */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
                            <FolderTree className="w-3.5 h-3.5" />
                            <span>{subModules.length} Modules</span>
                          </div>

                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{subLectures.length} Lectures</span>
                          </div>
                        </div>

                        {/* Sequence reorder buttons */}
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={(e) => handleMoveOrder(sub, 'up', e)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move subject up in syllabus order"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === filteredSubjects.length - 1}
                            onClick={(e) => handleMoveOrder(sub, 'down', e)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move subject down in syllabus order"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Quick Module Preview Accordion */}
                      {subModules.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setExpandedSubjectId(isExpanded ? null : sub.id)}
                            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-600 hover:text-indigo-600 py-1 transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>{isExpanded ? 'Hide Module List' : `Preview ${subModules.length} Modules`}</span>
                            </span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {subModules.map(chap => {
                                const chapLectures = lectures.filter(t => t.moduleId === chap.id);
                                return (
                                  <div 
                                    key={chap.id}
                                    className="p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs flex items-center justify-between gap-2"
                                  >
                                    <div className="min-w-0">
                                      <div className="font-bold text-slate-800 truncate">
                                        Ch {chap.moduleNumber || '•'}: {chap.title}
                                      </div>
                                      <div className="text-[10px] text-slate-400">
                                        {chapLectures.length} lecture{chapLectures.length !== 1 ? 's' : ''} inside
                                      </div>
                                    </div>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white text-indigo-700 font-bold border border-slate-200 shrink-0">
                                      Level 2
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(sub)}
                          title="Edit Subject"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingSubject(sub)}
                          title="Delete Subject"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Primary Link: Jump to Modules & Lectures */}
                      <button
                        onClick={() => {
                          if (onNavigateToModules) {
                            onNavigateToModules(selectedExamId, sub.id);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Manage Modules</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ===================================================================== */}
      {/* VIEW MODE 2: TABLE ROSTER                                             */}
      {/* ===================================================================== */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {filteredSubjects.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500">No subjects matching your filter in {selectedExam.name}.</p>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                + Add Subject
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Subject & Discipline</th>
                    <th className="py-3 px-4">Subject Code</th>
                    <th className="py-3 px-4 text-center">Modules</th>
                    <th className="py-3 px-4 text-center">Lectures</th>
                    <th className="py-3 px-4 text-center">Publish Status</th>
                    <th className="py-3 px-4 text-center">Sequence</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredSubjects.map((sub, idx) => {
                    const subModules = modules.filter(c => c.subjectId === sub.id);
                    const subLectures = lectures.filter(t => t.subjectId === sub.id);

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors group">
                        
                        {/* Sequence index */}
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Subject info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {renderSubjectIcon(sub.icon, sub.color)}
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 text-sm">{sub.name}</div>
                              <div className="text-slate-400 text-[11px] truncate max-w-xs">
                                {sub.description || 'Clinical modules & vignette questions'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">
                            {sub.code}
                          </span>
                        </td>

                        {/* Modules Count */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
                            <FolderTree className="w-3 h-3" />
                            <span>{subModules.length}</span>
                          </span>
                        </td>

                        {/* Lectures Count */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                            <Sparkles className="w-3 h-3" />
                            <span>{subLectures.length}</span>
                          </span>
                        </td>

                        {/* Status with 1-click Toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => handleToggleStatus(sub, e)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                              sub.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                            }`}
                            title="Click to toggle status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span>{sub.status}</span>
                          </button>
                        </td>

                        {/* Sequence Reorder */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={(e) => handleMoveOrder(sub, 'up', e)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 disabled:opacity-20 cursor-pointer"
                              title="Move up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === filteredSubjects.length - 1}
                              onClick={(e) => handleMoveOrder(sub, 'down', e)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 disabled:opacity-20 cursor-pointer"
                              title="Move down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(sub)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
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
                            <button
                              onClick={() => {
                                if (onNavigateToModules) {
                                  onNavigateToModules(selectedExamId, sub.id);
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="View and manage modules"
                            >
                              <span>Modules</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT SUBJECT                                                 */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingSubject ? 'Edit Medical Subject' : 'Add New Subject'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hierarchy Level 1: Under Exam {selectedExam.name}
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

            <form onSubmit={handleSaveSubject} className="space-y-4">
              {/* Target Exam */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Examination Track
                </label>
                <select
                  value={formExamId}
                  onChange={(e) => setFormExamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>{e.flag} {e.name}</option>
                  ))}
                </select>
              </div>

              {/* Subject Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Subject Name *
                  </label>
                  <input
                    id="input-subject-name"
                    type="text"
                    required
                    placeholder="e.g. Cardiology & Hemodynamics"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Subject Code
                  </label>
                  <input
                    id="input-subject-code"
                    type="text"
                    placeholder="CARD-101"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Icon & Theme Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Discipline Icon
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {AVAILABLE_ICONS.map(i => {
                      const IconC = i.icon;
                      const isSel = formIcon === i.name;
                      return (
                        <button
                          key={i.name}
                          type="button"
                          onClick={() => setFormIcon(i.name)}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-[10px] font-bold transition-all cursor-pointer ${
                            isSel 
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-400/20' 
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <IconC className="w-4 h-4" />
                          <span className="truncate w-full text-center">{i.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Color Accent
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_COLORS.map(c => {
                      const isSel = formColor === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setFormColor(c.id)}
                          className={`px-2.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            isSel 
                              ? `${c.bg} ${c.text} ${c.border} ring-2 ${c.ring}` 
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-full ${c.bg} border ${c.border}`} />
                          <span className="text-[11px] truncate">{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Description & Syllabus Scope
                </label>
                <textarea
                  id="input-subject-description"
                  rows={3}
                  placeholder="Overview of high-yield clinical areas covered in this subject..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Status
                </label>
                <div className="flex items-center gap-3">
                  {['Active', 'Draft'].map(st => (
                    <label key={st} className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="subStatus"
                        checked={formStatus === st}
                        onChange={() => setFormStatus(st)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{st}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-subject"
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                                */}
      {/* ========================================================================= */}
      {deletingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Subject?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{deletingSubject.name}"</span>?
                This will cascade delete all its assigned modules and lectures!
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSubject(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-delete-subject"
                onClick={handleDeleteSubject}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Delete Subject
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

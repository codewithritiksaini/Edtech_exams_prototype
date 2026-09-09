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
  ArrowUp,
  ArrowDown,
  AlertTriangle
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';

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

export default function AdminSubjectsPage() {
  const { examId: routeExamId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [exams, setExams] = useState(() => catalogService.getExams());
  const [subjects, setSubjects] = useState(() => curriculumService.getSubjects());
  const [chapters, setChapters] = useState(() => curriculumService.getChapters());
  const [topics, setTopics] = useState(() => curriculumService.getTopics());

  // If accessed via old route /admin/exams/:examId/subjects, normalize cleanly to /admin/subjects?exam=:examId
  useEffect(() => {
    if (routeExamId) {
      navigate(`/admin/subjects?exam=${routeExamId}`, { replace: true });
    }
  }, [routeExamId, navigate]);

  // Selected exam filter: from URL query param ?exam=..., default to 'all'
  const initialExamFilter = searchParams.get('exam') || (routeExamId || 'all');
  const [selectedExamFilter, setSelectedExamFilter] = useState(initialExamFilter);

  useEffect(() => {
    const q = searchParams.get('exam') || 'all';
    setSelectedExamFilter(q);
  }, [searchParams]);

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
  const [formExamId, setFormExamId] = useState('neet-pg');
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('Heart');
  const [formColor, setFormColor] = useState('rose');
  const [formStatus, setFormStatus] = useState('Active');
  const [formFacultyName, setFormFacultyName] = useState('Dr. Siddharth V. (AIIMS)');

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
    if (newExamId === 'all') {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('exam');
      setSearchParams(newParams);
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('exam', newExamId);
      setSearchParams(newParams);
    }
  };

  // Filter subjects globally or by selected exam
  const filteredSubjects = useMemo(() => {
    return subjects
      .filter(s => {
        if (selectedExamFilter !== 'all' && s.examId !== selectedExamFilter) return false;
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const examObj = exams.find(e => e.id === s.examId);
          const examName = examObj?.name?.toLowerCase() || '';
          return (
            s.name.toLowerCase().includes(q) || 
            (s.code && s.code.toLowerCase().includes(q)) ||
            examName.includes(q) ||
            (s.assignedFacultyName && s.assignedFacultyName.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [subjects, selectedExamFilter, statusFilter, searchQuery, exams]);

  const handleOpenCreateModal = () => {
    setEditingSubject(null);
    const targetExam = selectedExamFilter !== 'all' ? selectedExamFilter : (exams[0]?.id || 'neet-pg');
    setFormExamId(targetExam);
    setFormName('');
    setFormCode(`${targetExam.toUpperCase().slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`);
    setFormDescription('Comprehensive clinical pathophysiology, emergency management, pharmacotherapy, and grand round case vignettes.');
    setFormIcon('Heart');
    setFormColor('rose');
    setFormStatus('Active');
    setFormFacultyName('Dr. Siddharth V. (AIIMS)');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subject) => {
    setEditingSubject(subject);
    setFormExamId(subject.examId || 'neet-pg');
    setFormName(subject.name);
    setFormCode(subject.code || '');
    setFormDescription(subject.description || '');
    setFormIcon(subject.icon || 'Heart');
    setFormColor(subject.color || 'rose');
    setFormStatus(subject.status || 'Active');
    setFormFacultyName(subject.assignedFacultyName || 'Dr. Siddharth V. (AIIMS)');
    setIsModalOpen(true);
  };

  const handleSaveSubject = (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingSubject) {
      curriculumService.saveSubject({
        ...editingSubject,
        examId: formExamId,
        name: formName.trim(),
        code: formCode.trim(),
        description: formDescription.trim(),
        icon: formIcon,
        color: formColor,
        status: formStatus,
        assignedFacultyName: formFacultyName
      });
      showToast(`Subject "${formName}" updated successfully!`);
    } else {
      curriculumService.saveSubject({
        examId: formExamId,
        name: formName.trim(),
        code: formCode.trim(),
        description: formDescription.trim(),
        icon: formIcon,
        color: formColor,
        status: formStatus,
        assignedFacultyName: formFacultyName
      });
      showToast(`New subject "${formName}" added successfully!`);
    }
    setIsModalOpen(false);
  };

  const handleMoveOrder = (subjectId, direction) => {
    curriculumService.moveSubjectOrder(subjectId, direction);
  };

  // Helper to resolve icon component
  const getSubjectIcon = (iconName) => {
    const item = AVAILABLE_ICONS.find(i => i.name === iconName);
    return item ? item.icon : BookOpen;
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

      {/* Global Subjects Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Curriculum Architecture • Level 2</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-slate-400">
              Master Academic Repository
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Curriculum Subjects & Modules
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Central repository for medical discipline modules across all licensing tracks
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed pt-1">
            Browse and organize subject modules, faculty leads, and syllabus chapters. Click <strong>"Manage Chapters ➡️"</strong> to drill down into chapter units and clinical topics.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject Module</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search, Exam Dropdown Filter, Status Filter, View Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subjects, codes, faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Exam Dropdown Filter */}
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedExamFilter}
              onChange={(e) => handleExamFilterChange(e.target.value)}
              className="w-full sm:w-auto pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer appearance-none transition-colors"
            >
              <option value="all">🌐 All Exam Tracks ({subjects.length})</option>
              {exams.map(exam => {
                const count = subjects.filter(s => s.examId === exam.id).length;
                return (
                  <option key={exam.id} value={exam.id}>
                    {exam.flag} {exam.name} ({count})
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
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
                {st === 'all' ? 'All Status' : st}
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
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((subject, idx) => {
            const IconComponent = getSubjectIcon(subject.icon);
            const subjectChapters = chapters.filter(c => c.subjectId === subject.id);
            const subjectTopics = topics.filter(t => t.subjectId === subject.id);
            const colorMeta = AVAILABLE_COLORS.find(c => c.id === subject.color) || AVAILABLE_COLORS[0];
            const exam = exams.find(e => e.id === subject.examId);
            const targetExamId = subject.examId || 'neet-pg';

            return (
              <div
                key={subject.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-4">
                  {/* Top: Icon + Code + Reorder + Status */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${colorMeta.bg} ${colorMeta.text} border ${colorMeta.border} flex items-center justify-center shadow-2xs shrink-0`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60 inline-flex items-center gap-1">
                            <span>{exam?.flag}</span>
                            <span className="truncate max-w-[90px]">{exam?.name || subject.examId}</span>
                          </span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">
                            {subject.code || `MOD-0${idx + 1}`}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {subject.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveOrder(subject.id, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-300 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(subject.id, 'down')}
                        disabled={idx === filteredSubjects.length - 1}
                        className="p-1 rounded text-slate-300 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {subject.description || 'Clinical module covering core pathophysiology and cases.'}
                  </p>

                  {/* Faculty Specialist Assignment */}
                  <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Assigned Faculty Lead
                    </span>
                    <div className="font-bold text-slate-800 text-xs truncate">
                      {subject.assignedFacultyName || 'Dr. Siddharth V. (AIIMS)'}
                    </div>
                  </div>

                  {/* Counts Row */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="bg-indigo-50/50 p-2 rounded-xl border border-indigo-100/60">
                      <span className="text-[10px] text-indigo-700 font-bold block uppercase">Chapters</span>
                      <span className="text-xs font-extrabold text-indigo-900">{subjectChapters.length} Units</span>
                    </div>
                    <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/60">
                      <span className="text-[10px] text-emerald-700 font-bold block uppercase">Topics</span>
                      <span className="text-xs font-extrabold text-emerald-900">{subjectTopics.length} Topics</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(subject)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors cursor-pointer"
                      title="Edit Subject"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingSubject(subject)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* LEVEL 3 DRILLDOWN ACTION */}
                  <Link
                    to={`/admin/exams/${targetExamId}/subjects/${subject.id}/chapters`}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <span>Manage Chapters</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}

          {filteredSubjects.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <Layers className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">No Subject Modules Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No subjects match your selected filters. Try changing your search query or exam track.
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                + Add Subject Module
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Subject Module</th>
                <th className="py-3 px-4">Exam Track</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Faculty Lead</th>
                <th className="py-3 px-4 text-center">Chapters</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubjects.map((subject) => {
                const IconComponent = getSubjectIcon(subject.icon);
                const colorMeta = AVAILABLE_COLORS.find(c => c.id === subject.color) || AVAILABLE_COLORS[0];
                const count = chapters.filter(c => c.subjectId === subject.id).length;
                const exam = exams.find(e => e.id === subject.examId);
                const targetExamId = subject.examId || 'neet-pg';

                return (
                  <tr key={subject.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${colorMeta.bg} ${colorMeta.text} flex items-center justify-center shrink-0`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <Link
                            to={`/admin/exams/${targetExamId}/subjects/${subject.id}/chapters`}
                            className="font-extrabold hover:text-indigo-600 transition-colors block text-xs"
                          >
                            {subject.name}
                          </Link>
                          {subject.description && (
                            <span className="text-[10px] text-slate-400 font-normal line-clamp-1 max-w-xs">
                              {subject.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                        <span>{exam?.flag || '📚'}</span>
                        <span className="truncate max-w-[130px]">{exam?.name || subject.examId}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-500 font-mono text-[11px]">{subject.code}</td>
                    <td className="py-3.5 px-4 text-slate-700">{subject.assignedFacultyName || 'Faculty Lead'}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-indigo-600">{count} Units</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        subject.status === 'Draft'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      }`}>
                        {subject.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(subject)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Subject"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingSubject(subject)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/admin/exams/${targetExamId}/subjects/${subject.id}/chapters`}
                          className="inline-flex items-center gap-1 ml-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 hover:text-indigo-800 transition-colors text-xs"
                          title="Manage Chapters"
                        >
                          <span>Manage Chapters</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredSubjects.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-xs text-slate-600">No subjects found matching filters</p>
                      <button
                        onClick={handleOpenCreateModal}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer"
                      >
                        + Add Subject Module
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">
                {editingSubject ? 'Edit Subject Module' : 'Add New Subject Module'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Exam Track *</label>
                  <select
                    value={formExamId}
                    onChange={(e) => setFormExamId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {exams.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.flag} {e.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiology & Hemodynamics"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Subject Code</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. CARD-101"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Color Theme</label>
                  <select
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800"
                  >
                    {AVAILABLE_COLORS.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Icon Representative</label>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_ICONS.map(i => {
                    const IconComp = i.icon;
                    const isSelected = formIcon === i.name;
                    return (
                      <button
                        key={i.name}
                        type="button"
                        onClick={() => setFormIcon(i.name)}
                        className={`p-2 rounded-xl border flex items-center gap-2 transition-all text-left cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold ring-2 ring-indigo-500/10' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <IconComp className="w-4 h-4 shrink-0" />
                        <span className="text-[10px] truncate">{i.label.split('/')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Assigned Faculty Specialist</label>
                <input
                  type="text"
                  value={formFacultyName}
                  onChange={(e) => setFormFacultyName(e.target.value)}
                  placeholder="e.g. Dr. Siddharth V. (AIIMS)"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm cursor-pointer"
                >
                  {editingSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Subject Confirmation Modal */}
      {deletingSubject && (() => {
        const subChapters = chapters.filter(c => c.subjectId === deletingSubject.id);
        const subTopics = topics.filter(t => t.subjectId === deletingSubject.id);
        const deletingExam = exams.find(e => e.id === deletingSubject.examId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Delete Subject Module?
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    This will permanently remove this subject and all its syllabus content.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-black text-xs border border-indigo-100">
                  {deletingSubject.code ? deletingSubject.code.slice(0, 4) : 'SUB'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {deletingExam?.flag} {deletingExam?.name || deletingSubject.examId}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{deletingSubject.code}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{deletingSubject.name}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{deletingSubject.assignedFacultyName || 'Assigned Faculty'}</p>
                </div>
              </div>

              {(subChapters.length > 0 || subTopics.length > 0) && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Associated Syllabus Units Detected</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    This module currently contains <strong>{subChapters.length} chapters/units</strong> and <strong>{subTopics.length} clinical topics</strong>. Deleting this subject will also erase all associated chapters and question tags.
                  </p>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeletingSubject(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    curriculumService.deleteSubject(deletingSubject.id);
                    showToast(`Subject "${deletingSubject.name}" deleted successfully.`);
                    setDeletingSubject(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 transition-all cursor-pointer"
                >
                  Delete Subject
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

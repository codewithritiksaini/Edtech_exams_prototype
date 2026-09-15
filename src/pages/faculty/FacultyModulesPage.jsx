import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FolderTree, 
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
  Layers,
  BookOpen,
  FileText,
  Clock,
  Sparkles,
  GripVertical,
  AlertTriangle,
  LayoutGrid,
  Table as TableIcon,
  FileCheck,
  GraduationCap
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';
import { samplePaperService } from '../../services/samplePaperService';
import { peopleService } from '../../services/peopleService';

export default function FacultyModulesPage() {
  const { examId: routeExamId, subjectId } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(() => curriculumService.getSubjectById(subjectId));
  const effectiveExamId = routeExamId || subject?.examId || 'neet-pg';
  const [exam, setExam] = useState(() => catalogService.getExamById(effectiveExamId) || { id: effectiveExamId, name: effectiveExamId.toUpperCase(), flag: '🩺' });
  const [modules, setModules] = useState(() => curriculumService.getModules(subjectId, effectiveExamId));
  const [lectures, setLectures] = useState(() => curriculumService.getLectures(null, subjectId, effectiveExamId));
  
  const currentFaculty = peopleService.getCurrentFacultyProfile();
  const assignedSubjectIds = currentFaculty?.assignedSubjects || [];

  // Strictly check if current subject is assigned to this faculty
  const isAssigned = useMemo(() => {
    if (!subjectId) return false;
    const cleanFacultyName = currentFaculty?.name ? currentFaculty.name.replace(/^Dr\.\s*/i, '').toLowerCase().trim() : '';
    if (assignedSubjectIds.includes(subjectId)) return true;
    if (currentFaculty?.email && subject?.facultyEmail && subject.facultyEmail.toLowerCase() === currentFaculty.email.toLowerCase()) return true;
    if (cleanFacultyName && subject?.assignedFacultyName && subject.assignedFacultyName.toLowerCase().includes(cleanFacultyName)) return true;
    return false;
  }, [subjectId, assignedSubjectIds, subject, currentFaculty]);

  // View & Filter State
  const [viewMode, setViewMode] = useState('table'); // Default Table View
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  // Drag & Drop State
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Add / Edit Module Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [deletingModule, setDeletingModule] = useState(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formNumber, setFormNumber] = useState(1);
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('Active');

  useEffect(() => {
    const unsub = curriculumService.subscribeCurriculum(() => {
      const sub = curriculumService.getSubjectById(subjectId);
      setSubject(sub);
      const exId = routeExamId || sub?.examId || 'neet-pg';
      setModules(curriculumService.getModules(subjectId, exId));
      setLectures(curriculumService.getLectures(null, subjectId, exId));
    });
    return unsub;
  }, [subjectId, routeExamId]);

  useEffect(() => {
    const sub = curriculumService.getSubjectById(subjectId);
    if (sub) {
      setSubject(sub);
      const exId = routeExamId || sub.examId || 'neet-pg';
      const foundExam = catalogService.getExamById(exId);
      if (foundExam) setExam(foundExam);
      setModules(curriculumService.getModules(subjectId, exId));
      setLectures(curriculumService.getLectures(null, subjectId, exId));
    }
  }, [subjectId, routeExamId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Filtered and sorted modules
  const filteredModules = useMemo(() => {
    return modules
      .filter(c => {
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return c.title.toLowerCase().includes(q) || 
               (c.description && c.description.toLowerCase().includes(q));
      })
      .sort((a, b) => (a.moduleNumber || 0) - (b.moduleNumber || 0));
  }, [modules, searchQuery, statusFilter]);

  // Statistics
  const facultyPapersCount = useMemo(() => {
    return samplePaperService.getSamplePapers({ role: 'faculty', subjectId }).length;
  }, [subjectId]);

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

    const reordered = [...filteredModules];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);

    const orderedIds = reordered.map(c => c.id);
    curriculumService.reorderModules(subjectId, orderedIds);
    showToast(`Module #${targetIndex + 1}: "${draggedItem.title}" reordered.`);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleOpenCreateModal = () => {
    setEditingModule(null);
    setFormTitle('');
    setFormNumber(modules.length + 1);
    setFormDesc('');
    setFormStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (chap) => {
    setEditingModule(chap);
    setFormTitle(chap.title);
    setFormNumber(chap.moduleNumber || 1);
    setFormDesc(chap.description || '');
    setFormStatus(chap.status || 'Active');
    setIsModalOpen(true);
  };

  const handleSaveModule = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Please enter a module title');
      return;
    }

    const payload = {
      subjectId,
      examId: effectiveExamId,
      title: formTitle.trim(),
      moduleNumber: Number(formNumber) || 1,
      description: formDesc.trim(),
      status: formStatus
    };

    if (editingModule) {
      curriculumService.saveModule({ id: editingModule.id, ...payload });
      showToast(`Module "${payload.title}" updated.`);
    } else {
      curriculumService.saveModule({
        id: `mod-${effectiveExamId.slice(0, 4)}-${Date.now().toString(36)}`,
        ...payload
      });
      showToast(`Module "${payload.title}" created.`);
    }
    setIsModalOpen(false);
  };

  const handleOpenDeleteModal = (chap) => {
    setDeletingModule(chap);
  };

  const handleConfirmDelete = () => {
    if (!deletingModule) return;
    curriculumService.deleteModule(deletingModule.id);
    showToast(`Module "${deletingModule.title}" deleted.`);
    setDeletingModule(null);
  };

  const handleMoveOrder = (chapId, direction) => {
    curriculumService.moveModuleOrder(chapId, direction);
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

  // 2. Guard: Hierarchy Mismatch (subject.examId !== routeExamId)
  if (routeExamId && subject.examId && subject.examId !== routeExamId) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-rose-200/80 shadow-2xs text-center max-w-lg mx-auto my-12 space-y-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Invalid Academic Hierarchy Context</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Subject <strong className="text-slate-800 font-semibold">{subject.name}</strong> belongs to program <strong className="text-slate-800 font-semibold">{subject.examId?.toUpperCase()}</strong>, but was accessed through the route for <strong className="text-rose-600 font-semibold">{routeExamId?.toUpperCase()}</strong>.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={`/faculty/exams/${subject.examId}/subjects/${subject.id}/modules`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <span>Switch to {subject.examId.toUpperCase()} Context</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to={`/faculty/exams/${routeExamId}/subjects`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            <span>Back to {routeExamId.toUpperCase()} Subjects</span>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Guard: If subject is not assigned to current faculty, restrict access
  if (!isAssigned) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-2xs text-center max-w-lg mx-auto my-12 space-y-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Department Access Restricted</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          You do not have assigned permissions for this subject. In the faculty portal, you can only view and manage modules and lectures for subjects explicitly assigned to your faculty roster.
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
              to={`/faculty/exams/${effectiveExamId}/subjects`}
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Subjects</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Assigned Subject • Full Module & Lecture Access</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {subject?.name || 'Subject'} — Modules & Lectures
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Exam Track: <strong className="text-slate-700">{exam?.flag} {exam?.name}</strong> • Subject Code: <strong className="text-slate-700 font-mono">{subject?.code || 'N/A'}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Module</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Total Modules</span>
          <div className="text-2xl font-black text-slate-900">{modules.length}</div>
          <span className="text-[11px] text-slate-400 font-medium">Syllabus units</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Total Lectures</span>
          <div className="text-2xl font-black text-slate-900">{lectures.length}</div>
          <span className="text-[11px] text-slate-400 font-medium">Under this subject</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">My Sample Papers</span>
          <div className="text-2xl font-black text-purple-700">{facultyPapersCount}</div>
          <span className="text-[11px] text-slate-400 font-medium">Authored practice PDFs</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Specialty Faculty</span>
          <div className="text-sm font-extrabold text-indigo-700 truncate mt-1">
            {currentFaculty?.name || 'Dr. Siddharth V.'}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Subject Specialist</span>
        </div>
      </div>

      {/* Filter & View Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search modules, high-yield focus, overview..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="relative w-full sm:w-36">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Cards
          </button>
        </div>
      </div>

      {/* Modules Table View (List) */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 w-20 text-center">Unit #</th>
                <th className="py-3 px-4">Syllabus Module & Overview</th>
                <th className="py-3 px-4 text-center">Lectures & Sample Papers</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredModules.map((chap, idx) => {
                const chapLectures = lectures.filter(t => t.moduleId === chap.id);
                const isDragging = draggedIndex === idx;
                const isDragOver = dragOverIndex === idx;
                const samplePaperCount = samplePaperService.getSamplePapersCountByModule(chap.id, { role: 'faculty' });

                return (
                  <tr
                    key={chap.id}
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
                    {/* Unit # and Drag Handle */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          className="text-slate-300 hover:text-indigo-600 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-100 transition-colors"
                          title="Drag to reorder module"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center border border-indigo-100 shadow-2xs shrink-0">
                          {chap.moduleNumber || idx + 1}
                        </span>
                      </div>
                    </td>

                    {/* Module Title & Description */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <Link
                          to={`/faculty/exams/${effectiveExamId}/subjects/${subjectId}/modules/${chap.id}/lectures`}
                          className="font-extrabold text-slate-900 hover:text-indigo-600 transition-colors text-xs block"
                        >
                          {chap.title}
                        </Link>
                        {chap.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xl leading-relaxed">
                            {chap.description}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Lectures & Sample Papers Count */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Link
                          to={`/faculty/exams/${effectiveExamId}/subjects/${subjectId}/modules/${chap.id}/lectures`}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 transition-colors"
                          title="View Lectures"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{chapLectures.length} Lectures</span>
                        </Link>
                        <Link
                          to={`/faculty/sample-papers?examId=${effectiveExamId}&subjectId=${subjectId}&moduleId=${chap.id}`}
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
                          title="Manage Module Sample Papers"
                        >
                          <FileCheck className="w-3 h-3 text-purple-600" />
                          <span>{samplePaperCount > 0 ? `${samplePaperCount} Sample Paper${samplePaperCount > 1 ? 's' : ''}` : '+ Sample Paper'}</span>
                        </Link>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        chap.status === 'Draft'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      }`}>
                        {chap.status || 'Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(chap)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Module"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(chap)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Module"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center border-l border-slate-200 pl-1.5 ml-1 space-x-0.5">
                          <button
                            onClick={() => handleMoveOrder(chap.id, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleMoveOrder(chap.id, 'down')}
                            disabled={idx === filteredModules.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        <Link
                          to={`/faculty/exams/${effectiveExamId}/subjects/${subjectId}/modules/${chap.id}/lectures`}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-[11px] transition-colors ml-1.5 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Lectures</span>
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
      ) : (
        /* Modules Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((chap, idx) => {
            const chapLectures = lectures.filter(t => t.moduleId === chap.id);
            const samplePaperCount = samplePaperService.getSamplePapersCountByModule(chap.id, { role: 'faculty' });

            return (
              <div
                key={chap.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between overflow-hidden group p-5"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center border border-indigo-100 shadow-2xs">
                      #{chap.moduleNumber || idx + 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      chap.status === 'Draft'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    }`}>
                      {chap.status || 'Active'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {chap.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {chap.description || 'Clinical lectures, diagnostic pearls, and active recall practice.'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 font-semibold flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-indigo-700 font-bold">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{chapLectures.length} Lectures</span>
                    </span>
                    <Link
                      to={`/faculty/sample-papers?examId=${effectiveExamId}&subjectId=${subjectId}&moduleId=${chap.id}`}
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
                      title="Manage Module Sample Papers"
                    >
                      <FileCheck className="w-3 h-3 text-purple-600" />
                      <span>{samplePaperCount > 0 ? `${samplePaperCount} Sample Paper${samplePaperCount > 1 ? 's' : ''}` : '+ Sample Paper'}</span>
                    </Link>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(chap)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Edit Module"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(chap)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Module"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    to={`/faculty/exams/${effectiveExamId}/subjects/${subjectId}/modules/${chap.id}/lectures`}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <span>Manage Lectures</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL: ADD / EDIT MODULE                                                */}
      {/* ======================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingModule ? 'Edit Module' : 'Add New Module'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure curriculum module details and sequence
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

            <form onSubmit={handleSaveModule} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Unit #
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
                    Module Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Valvular Heart Disease & Murmurs"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Module Overview / Clinical Focus
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline high-yield clinical systems, diagnostic pearls, and syllabus objectives..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Status
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="facultyChapStatus"
                      value="Active"
                      checked={formStatus === 'Active'}
                      onChange={() => setFormStatus('Active')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Active (Published)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="facultyChapStatus"
                      value="Draft"
                      checked={formStatus === 'Draft'}
                      onChange={() => setFormStatus('Draft')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Draft</span>
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
                  {editingModule ? 'Save Changes' : 'Create Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* DELETE MODAL                                                            */}
      {/* ======================================================================= */}
      {deletingModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">
                Delete Module?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{deletingModule.title}"</span>? Any lectures under this module will also be removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeletingModule(null)}
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
    </div>
  );
}

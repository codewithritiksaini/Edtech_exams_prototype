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
  FileCheck
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';
import { samplePaperService } from '../../services/samplePaperService';

export default function AdminModulesPage() {
  const { examId: routeExamId, subjectId } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(() => curriculumService.getSubjectById(subjectId));
  const effectiveExamId = routeExamId || subject?.examId || 'neet-pg';
  const [exam, setExam] = useState(() => catalogService.getExamById(effectiveExamId) || { id: effectiveExamId, name: effectiveExamId.toUpperCase(), flag: '🩺' });
  const [modules, setModules] = useState(() => curriculumService.getModules(subjectId, effectiveExamId));
  const [lectures, setLectures] = useState(() => curriculumService.getLectures(null, subjectId, effectiveExamId));

  // View & Filter State
  const [viewMode, setViewMode] = useState('table');
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
    showToast(`Unit #${targetIndex + 1}: "${draggedItem.title}" moved.`);

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
    setFormDesc('Core clinical unit focusing on diagnostic pearls, pathophysiology, and case management.');
    setFormStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (mod) => {
    setEditingModule(mod);
    setFormTitle(mod.title);
    setFormNumber(mod.moduleNumber || 1);
    setFormDesc(mod.description || '');
    setFormStatus(mod.status || 'Active');
    setIsModalOpen(true);
  };

  const handleSaveModule = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingModule) {
      curriculumService.saveModule({
        ...editingModule,
        title: formTitle.trim(),
        moduleNumber: Number(formNumber),
        description: formDesc.trim(),
        status: formStatus
      });
      showToast(`Module "${formTitle}" updated successfully!`);
    } else {
      curriculumService.saveModule({
        examId: effectiveExamId,
        subjectId,
        title: formTitle.trim(),
        moduleNumber: Number(formNumber),
        description: formDesc.trim(),
        status: formStatus
      });
      showToast(`New module "${formTitle}" created successfully!`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteModule = (mod) => {
    setDeletingModule(mod);
  };

  const handleConfirmDelete = () => {
    if (!deletingModule) return;
    curriculumService.deleteModule(deletingModule.id);
    showToast(`Module "${deletingModule.title}" deleted.`);
    setDeletingModule(null);
  };

  const handleMoveOrder = (modId, direction) => {
    curriculumService.moveModuleOrder(modId, direction);
  };

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
              to={effectiveExamId ? `/admin/subjects?exam=${effectiveExamId}` : '/admin/subjects'}
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
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Module Unit</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search, Status Filter, Total Stats, View Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search module title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
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
                {st === 'all' ? 'All Units' : st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
              {filteredModules.length} Units
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
              {lectures.length} Lectures
            </span>
          </div>

          {/* View Mode Toggle */}
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
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400'
              }`}
              title="Grid View (Cards)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
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
              {filteredModules.map((mod, idx) => {
                const modLectures = lectures.filter(t => t.moduleId === mod.id);
                const isDragging = draggedIndex === idx;
                const isDragOver = dragOverIndex === idx;

                return (
                  <tr
                    key={mod.id}
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
                          {mod.moduleNumber || idx + 1}
                        </span>
                      </div>
                    </td>

                    {/* Module Title & Description */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <Link
                          to={`/admin/subjects/${subjectId}/modules/${mod.id}/lectures`}
                          className="font-extrabold text-slate-900 hover:text-indigo-600 transition-colors text-xs block"
                        >
                          {mod.title}
                        </Link>
                        {mod.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xl leading-relaxed">
                            {mod.description}
                          </p>
                        )}
                        {modLectures.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            {modLectures.slice(0, 3).map((t) => (
                              <span key={t.id} className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60 font-medium">
                                {t.lectureNumber ? `#${t.lectureNumber}: ` : ''}{t.title}
                              </span>
                            ))}
                            {modLectures.length > 3 && (
                              <span className="text-[10px] text-slate-400 font-bold">
                                +{modLectures.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Lectures & Sample Papers Count */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{modLectures.length} Lectures</span>
                        </span>
                        <Link
                          to={`/admin/sample-papers?examId=${effectiveExamId}&subjectId=${subjectId}&moduleId=${mod.id}`}
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
                          title="Manage Module Sample Papers"
                        >
                          <FileCheck className="w-3 h-3 text-purple-600" />
                          <span>{samplePaperService.getSamplePapersCountByModule(mod.id) > 0 ? `${samplePaperService.getSamplePapersCountByModule(mod.id)} Sample Paper${samplePaperService.getSamplePapersCountByModule(mod.id) > 1 ? 's' : ''}` : '+ Sample Paper'}</span>
                        </Link>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        mod.status === 'Draft'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      }`}>
                        {mod.status || 'Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(mod)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Module"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteModule(mod)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Module"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/admin/subjects/${subjectId}/modules/${mod.id}/lectures`}
                          className="inline-flex items-center gap-1 ml-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                          title="Manage Lectures"
                        >
                          <span>Manage Lectures</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredModules.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <FolderTree className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-xs text-slate-600">No modules found</p>
                      <button
                        onClick={handleOpenCreateModal}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer"
                      >
                        + Add Module Unit
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Cards View (Grid) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModules.map((mod, idx) => {
            const modLectures = lectures.filter(t => t.moduleId === mod.id);

            return (
              <div
                key={mod.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all p-5 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-indigo-700 shrink-0 shadow-2xs">
                        <span className="text-[9px] font-black uppercase text-indigo-400">Unit</span>
                        <span className="text-sm font-black leading-tight">{mod.moduleNumber || idx + 1}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {mod.status || 'Active'}
                        </span>
                        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors mt-0.5">
                          {mod.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                      <button
                        onClick={() => handleMoveOrder(mod.id, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(mod.id, 'down')}
                        disabled={idx === filteredModules.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {mod.description || 'Clinical topics, diagnostic pearls, and active recall practice.'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 font-semibold flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-indigo-700 font-bold">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{modLectures.length} Lectures</span>
                    </span>
                    <Link
                      to={`/admin/sample-papers?examId=${effectiveExamId}&subjectId=${subjectId}&moduleId=${mod.id}`}
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
                      title="Manage Module Sample Papers"
                    >
                      <FileCheck className="w-3 h-3 text-purple-600" />
                      <span>{samplePaperService.getSamplePapersCountByModule(mod.id) > 0 ? `${samplePaperService.getSamplePapersCountByModule(mod.id)} Sample Paper${samplePaperService.getSamplePapersCountByModule(mod.id) > 1 ? 's' : ''}` : '+ Sample Paper'}</span>
                    </Link>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(mod)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Edit Module"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteModule(mod)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Module"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    to={`/admin/subjects/${subjectId}/modules/${mod.id}/lectures`}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <span>Manage Lectures</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}

          {filteredModules.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <FolderTree className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">No Modules Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No syllabus modules currently exist under {subject?.name || 'this subject'}.
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                + Add Module Unit
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Module Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
          />

          {/* Slide-over Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-12 pointer-events-none">
            <div className="w-screen max-w-lg sm:max-w-xl bg-white shadow-2xl flex flex-col pointer-events-auto animate-in slide-in-from-right duration-300">

              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      {editingModule ? 'Edit Module Unit' : `Add Module to ${subject?.name}`}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500">Fill in the details to {editingModule ? 'update' : 'create'} this module unit.</p>
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
              <form onSubmit={handleSaveModule} id="module-drawer-form" className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1.5 col-span-1">
                    <label className="font-bold text-slate-700">Unit #</label>
                    <input
                      type="number"
                      min="1"
                      value={formNumber}
                      onChange={(e) => setFormNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 text-center"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-3">
                    <label className="font-bold text-slate-700">Module Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acute Coronary Syndromes & STEMI Pathways"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Learning Description</label>
                  <textarea
                    rows={4}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Outline key learning objectives, clinical maneuvers, guidelines..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </form>

              {/* Drawer Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="module-drawer-form"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm cursor-pointer text-xs"
                >
                  {editingModule ? 'Save Changes' : 'Create Module'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Module Confirmation Modal */}
      {deletingModule && (() => {
        const modLectures = lectures.filter(t => t.moduleId === deletingModule.id);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Delete Module Unit?
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    This will permanently remove this syllabus unit and its lectures.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-black text-xs border border-indigo-100">
                  Unit {deletingModule.moduleNumber || 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{deletingModule.title}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{modLectures.length} Associated Lectures</p>
                </div>
              </div>

              {modLectures.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Associated Lectures Detected</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    This module currently contains <strong>{modLectures.length} learning lectures</strong>. Deleting this module will also erase all associated notes and content.
                  </p>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeletingModule(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 transition-all cursor-pointer"
                >
                  Delete Module
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

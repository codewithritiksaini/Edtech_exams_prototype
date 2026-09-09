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
  Table as TableIcon
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';

export default function AdminChaptersPage() {
  const { examId: routeExamId, subjectId } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(() => curriculumService.getSubjectById(subjectId));
  const effectiveExamId = routeExamId || subject?.examId || 'neet-pg';
  const [exam, setExam] = useState(() => catalogService.getExamById(effectiveExamId) || { id: effectiveExamId, name: effectiveExamId.toUpperCase(), flag: '🩺' });
  const [chapters, setChapters] = useState(() => curriculumService.getChapters(subjectId, effectiveExamId));
  const [topics, setTopics] = useState(() => curriculumService.getTopics(null, subjectId, effectiveExamId));

  // View & Filter State
  const [viewMode, setViewMode] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  // Drag & Drop State
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Add / Edit Chapter Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [deletingChapter, setDeletingChapter] = useState(null);

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
      setChapters(curriculumService.getChapters(subjectId, exId));
      setTopics(curriculumService.getTopics(null, subjectId, exId));
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
      setChapters(curriculumService.getChapters(subjectId, exId));
      setTopics(curriculumService.getTopics(null, subjectId, exId));
    }
  }, [subjectId, routeExamId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Filtered and sorted chapters
  const filteredChapters = useMemo(() => {
    return chapters
      .filter(c => {
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return c.title.toLowerCase().includes(q) || 
               (c.description && c.description.toLowerCase().includes(q));
      })
      .sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
  }, [chapters, searchQuery, statusFilter]);

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

    const reordered = [...filteredChapters];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);

    const orderedIds = reordered.map(c => c.id);
    curriculumService.reorderChapters(subjectId, orderedIds);
    showToast(`Unit #${targetIndex + 1}: "${draggedItem.title}" moved.`);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleOpenCreateModal = () => {
    setEditingChapter(null);
    setFormTitle('');
    setFormNumber(chapters.length + 1);
    setFormDesc('Core clinical unit focusing on diagnostic pearls, pathophysiology, and case management.');
    setFormStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (chap) => {
    setEditingChapter(chap);
    setFormTitle(chap.title);
    setFormNumber(chap.chapterNumber || 1);
    setFormDesc(chap.description || '');
    setFormStatus(chap.status || 'Active');
    setIsModalOpen(true);
  };

  const handleSaveChapter = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingChapter) {
      curriculumService.saveChapter({
        ...editingChapter,
        title: formTitle.trim(),
        chapterNumber: Number(formNumber),
        description: formDesc.trim(),
        status: formStatus
      });
      showToast(`Chapter "${formTitle}" updated successfully!`);
    } else {
      curriculumService.saveChapter({
        examId: effectiveExamId,
        subjectId,
        title: formTitle.trim(),
        chapterNumber: Number(formNumber),
        description: formDesc.trim(),
        status: formStatus
      });
      showToast(`New chapter "${formTitle}" created successfully!`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteChapter = (chap) => {
    setDeletingChapter(chap);
  };

  const handleConfirmDelete = () => {
    if (!deletingChapter) return;
    curriculumService.deleteChapter(deletingChapter.id);
    showToast(`Chapter "${deletingChapter.title}" deleted.`);
    setDeletingChapter(null);
  };

  const handleMoveOrder = (chapId, direction) => {
    curriculumService.moveChapterOrder(chapId, direction);
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
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link 
              to={effectiveExamId ? `/admin/subjects?exam=${effectiveExamId}` : '/admin/subjects'}
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Subjects</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Level 3 • Chapters & Topics
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <FolderTree className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {subject?.name || 'Subject'} — Chapters & Topics
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Exam Track: <strong className="text-slate-700">{exam?.flag} {exam?.name}</strong> • Subject Code: <strong className="text-slate-700 font-mono">{subject?.code || 'N/A'}</strong>
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed pt-1">
            Organize study units and clinical syllabus chapters for <strong>{subject?.name}</strong>. 
            Drag and drop rows to adjust chapter order, or click <strong>"Manage Topics ➡️"</strong> to author clinical pearls and video lessons.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Chapter Unit</span>
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
              placeholder="Search chapter title or keyword..."
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
              {filteredChapters.length} Units
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
              {topics.length} Topics
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

      {/* Chapters Table View (List) */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 w-20 text-center">Unit #</th>
                <th className="py-3 px-4">Syllabus Chapter & Overview</th>
                <th className="py-3 px-4 text-center">Topics</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-24">Reorder</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChapters.map((chap, idx) => {
                const chapTopics = topics.filter(t => t.chapterId === chap.id);
                const isDragging = draggedIndex === idx;
                const isDragOver = dragOverIndex === idx;

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
                          title="Drag to reorder chapter"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center border border-indigo-100 shadow-2xs shrink-0">
                          {chap.chapterNumber || idx + 1}
                        </span>
                      </div>
                    </td>

                    {/* Chapter Title & Description */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <Link
                          to={`/admin/subjects/${subjectId}/chapters/${chap.id}/topics`}
                          className="font-extrabold text-slate-900 hover:text-indigo-600 transition-colors text-xs block"
                        >
                          {chap.title}
                        </Link>
                        {chap.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xl leading-relaxed">
                            {chap.description}
                          </p>
                        )}
                        {chapTopics.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            {chapTopics.slice(0, 3).map((t) => (
                              <span key={t.id} className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60 font-medium">
                                {t.topicNumber ? `#${t.topicNumber}: ` : ''}{t.title}
                              </span>
                            ))}
                            {chapTopics.length > 3 && (
                              <span className="text-[10px] text-slate-400 font-bold">
                                +{chapTopics.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Topics Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{chapTopics.length} Topics</span>
                      </span>
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

                    {/* Order Up/Down buttons */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                        <button
                          onClick={() => handleMoveOrder(chap.id, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                          title="Move Unit Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveOrder(chap.id, 'down')}
                          disabled={idx === filteredChapters.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                          title="Move Unit Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(chap)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Chapter"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteChapter(chap)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Chapter"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/admin/subjects/${subjectId}/chapters/${chap.id}/topics`}
                          className="inline-flex items-center gap-1 ml-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                          title="Manage Topics"
                        >
                          <span>Manage Topics</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredChapters.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <FolderTree className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-xs text-slate-600">No chapters found</p>
                      <button
                        onClick={handleOpenCreateModal}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer"
                      >
                        + Add Chapter Unit
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
          {filteredChapters.map((chap, idx) => {
            const chapTopics = topics.filter(t => t.chapterId === chap.id);

            return (
              <div
                key={chap.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all p-5 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-indigo-700 shrink-0 shadow-2xs">
                        <span className="text-[9px] font-black uppercase text-indigo-400">Unit</span>
                        <span className="text-sm font-black leading-tight">{chap.chapterNumber || idx + 1}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {chap.status || 'Active'}
                        </span>
                        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors mt-0.5">
                          {chap.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                      <button
                        onClick={() => handleMoveOrder(chap.id, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(chap.id, 'down')}
                        disabled={idx === filteredChapters.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {chap.description || 'Clinical topics, diagnostic pearls, and active recall practice.'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 font-semibold flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-indigo-700 font-bold">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{chapTopics.length} Topics</span>
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(chap)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Edit Chapter"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteChapter(chap)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Chapter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    to={`/admin/subjects/${subjectId}/chapters/${chap.id}/topics`}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <span>Manage Topics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}

          {filteredChapters.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <FolderTree className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">No Chapters Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No syllabus chapters currently exist under {subject?.name || 'this subject'}.
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                + Add Chapter Unit
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Chapter Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">
                {editingChapter ? 'Edit Chapter Unit' : `Add Chapter to ${subject?.name}`}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChapter} className="space-y-4 text-xs">
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
                  <label className="font-bold text-slate-700">Chapter Title</label>
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
                  rows={3}
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
                  {editingChapter ? 'Save Changes' : 'Create Chapter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Chapter Confirmation Modal */}
      {deletingChapter && (() => {
        const chapTopics = topics.filter(t => t.chapterId === deletingChapter.id);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Delete Chapter Unit?
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    This will permanently remove this syllabus unit and its topics.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-black text-xs border border-indigo-100">
                  Unit {deletingChapter.chapterNumber || 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{deletingChapter.title}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{chapTopics.length} Associated Topics</p>
                </div>
              </div>

              {chapTopics.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Associated Topics Detected</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    This chapter currently contains <strong>{chapTopics.length} learning topics</strong>. Deleting this chapter will also erase all associated notes and content.
                  </p>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeletingChapter(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 transition-all cursor-pointer"
                >
                  Delete Chapter
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

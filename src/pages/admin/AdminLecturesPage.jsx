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
  Table as TableIcon
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';

export default function AdminLecturesPage() {
  const { examId: routeExamId, subjectId, moduleId } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(() => curriculumService.getSubjectById(subjectId));
  const effectiveExamId = routeExamId || subject?.examId || 'neet-pg';
  const [exam, setExam] = useState(() => catalogService.getExamById(effectiveExamId) || { id: effectiveExamId, name: effectiveExamId.toUpperCase(), flag: '🩺' });
  const [module, setModule] = useState(() => curriculumService.getModuleById(moduleId));
  const [lectures, setLectures] = useState(() => curriculumService.getLectures(moduleId, subjectId, effectiveExamId));

  // View Mode & Filters
  const [viewMode, setViewMode] = useState('table');
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
    const foundModule = curriculumService.getModuleById(moduleId);
    if (foundModule) setModule(foundModule);
  }, [routeExamId, subjectId, moduleId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Filtered and sorted lectures
  const filteredLectures = useMemo(() => {
    return lectures
      .filter(l => {
        if (difficultyFilter !== 'all' && l.difficulty !== difficultyFilter) return false;
        if (statusFilter !== 'all' && l.status !== statusFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return l.title.toLowerCase().includes(q);
      })
      .sort((a, b) => (a.lectureNumber || 0) - (b.lectureNumber || 0));
  }, [lectures, difficultyFilter, statusFilter, searchQuery]);

  // Drag & Drop Handlers
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

    const orderedIds = reordered.map(l => l.id);
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

  const handleOpenEditModal = (lec) => {
    setEditingLecture(lec);
    setFormTitle(lec.title);
    setFormNumber(lec.lectureNumber || 1);
    setFormDuration(lec.duration || '45 mins');
    setFormDifficulty(lec.difficulty || 'High-Yield');
    setFormStatus(lec.status || 'Published');
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
        duration: formDuration,
        difficulty: formDifficulty,
        status: formStatus
      });
      showToast(`Lecture "${formTitle}" updated successfully!`);
    } else {
      curriculumService.saveLecture({
        examId: effectiveExamId,
        subjectId,
        moduleId,
        title: formTitle.trim(),
        lectureNumber: Number(formNumber),
        duration: formDuration,
        difficulty: formDifficulty,
        status: formStatus,
        content: {
          pdfList: [],
          images: [],
          video: null,
          flashcards: [],
          liveClasses: [],
          topics: [],
          clinicalNotes: ''
        }
      });
      showToast(`New lecture "${formTitle}" created successfully!`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (lec) => {
    setDeletingLecture(lec);
  };

  const handleConfirmDelete = () => {
    if (!deletingLecture) return;
    curriculumService.deleteLecture(deletingLecture.id);
    showToast(`Lecture "${deletingLecture.title}" deleted.`);
    setDeletingLecture(null);
  };

  const handleMoveOrder = (lecId, direction) => {
    curriculumService.moveLectureOrder(lecId, direction);
  };

  const getContentStudioUrl = (lectureId) => {
    return routeExamId
      ? `/admin/exams/${effectiveExamId}/subjects/${subjectId}/modules/${moduleId}/lectures/${lectureId}/content`
      : `/admin/subjects/${subjectId}/modules/${moduleId}/lectures/${lectureId}/content`;
  };

  const backModulesUrl = routeExamId
    ? `/admin/exams/${effectiveExamId}/subjects/${subjectId}/modules`
    : `/admin/subjects/${subjectId}/modules`;

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
              to={backModulesUrl}
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
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {module?.title || 'Module'} — Lectures
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Subject: <strong className="text-slate-700">{subject?.name}</strong> • Unit #{module?.moduleNumber || 1} • Track: <strong className="text-slate-700">{exam?.flag} {exam?.name}</strong>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lecture</span>
        </button>
      </div>

      {/* Toolbar: Search, Filters, Stats, View Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search lectures by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            {['all', 'High-Yield', 'Core Clinical', 'Advanced'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                  difficultyFilter === diff
                    ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
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
              {filteredLectures.map((lec, idx) => {
                const pdfCount = lec.content?.pdfList?.length || (lec.content?.pdf ? 1 : 0);
                const imgCount = lec.content?.images?.length || 0;
                const hasVideo = Boolean(lec.content?.video);
                const flashcardCount = lec.content?.flashcards?.length || 0;
                const hasLive = (lec.content?.liveClasses?.length || 0) > 0;
                const isDragging = draggedIndex === idx;
                const isDragOver = dragOverIndex === idx;
                const contentUrl = getContentStudioUrl(lec.id);

                return (
                  <tr
                    key={lec.id}
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
                          {lec.lectureNumber || idx + 1}
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
                          {lec.title}
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
                        </div>
                      </div>
                    </td>

                    {/* Yield / Difficulty */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                        lec.difficulty === 'High-Yield'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : lec.difficulty === 'Advanced'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {lec.difficulty || 'High-Yield'}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{lec.duration || '45 mins'}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        lec.status === 'Draft'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      }`}>
                        {lec.status || 'Published'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(lec)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Lecture Meta"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(lec)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Lecture"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* MANAGE CONTENT BUTTON (Replaced Launch Content Studio) */}
                        <Link
                          to={contentUrl}
                          className="inline-flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                          title="Manage Content"
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
          {filteredLectures.map((lec, idx) => {
            const pdfCount = lec.content?.pdfList?.length || (lec.content?.pdf ? 1 : 0);
            const imgCount = lec.content?.images?.length || 0;
            const hasVideo = Boolean(lec.content?.video);
            const flashcardCount = lec.content?.flashcards?.length || 0;
            const hasLive = (lec.content?.liveClasses?.length || 0) > 0;
            const contentUrl = getContentStudioUrl(lec.id);

            return (
              <div
                key={lec.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all p-5 flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center border border-indigo-100 shadow-2xs">
                        #{lec.lectureNumber || idx + 1}
                      </span>
                      <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${
                        lec.difficulty === 'High-Yield'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {lec.difficulty || 'High-Yield'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(lec)}
                        className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(lec)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {lec.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{lec.duration || '45 mins'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Content Asset Indicators Row */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
                    {pdfCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-semibold text-[10.5px] border border-sky-200/60">
                        <FileText className="w-3 h-3 text-sky-600" />
                        <span>{pdfCount} PDF</span>
                      </span>
                    )}

                    {imgCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10.5px] border border-emerald-200/60">
                        <ImageIcon className="w-3 h-3 text-emerald-600" />
                        <span>{imgCount} Diagrams</span>
                      </span>
                    )}

                    {hasVideo && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[10.5px] border border-purple-200/60">
                        <Video className="w-3 h-3 text-purple-600" />
                        <span>Video</span>
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
                        <span>Live</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                    <button
                      onClick={() => handleMoveOrder(lec.id, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(lec.id, 'down')}
                      disabled={idx === filteredLectures.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <Link
                    to={contentUrl}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Manage Content</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingLecture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900">Delete Lecture?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete lecture <strong className="text-slate-800">"{deletingLecture.title}"</strong>? All uploaded PDFs, diagram assets, and flashcards associated with this lecture will be removed.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingLecture(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                Yes, Delete Lecture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Lecture Drawer */}
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
                      {editingLecture ? 'Edit Lecture Meta' : `Add Lecture to Unit ${module?.moduleNumber || 1}`}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500">Fill in the details to {editingLecture ? 'update' : 'create'} this lecture.</p>
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
              <form onSubmit={handleSaveLecture} id="lecture-drawer-form" className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Lecture Title / Clinical Presentation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aortic Stenosis & Regurgitation Auscultation Pearls"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Lecture Order #</label>
                    <input
                      type="number"
                      min="1"
                      value={formNumber}
                      onChange={(e) => setFormNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 text-center"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Estimated Duration</label>
                    <input
                      type="text"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      placeholder="45 mins"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Yield / Level</label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800"
                    >
                      <option value="High-Yield">High-Yield</option>
                      <option value="Core Clinical">Core Clinical</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Publishing Status</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormStatus('Published')}
                      className={`py-2.5 px-3 rounded-xl border font-bold text-center cursor-pointer transition-all ${
                        formStatus === 'Published'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Published
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStatus('Draft')}
                      className={`py-2.5 px-3 rounded-xl border font-bold text-center cursor-pointer transition-all ${
                        formStatus === 'Draft'
                          ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Draft
                    </button>
                  </div>
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
                  form="lecture-drawer-form"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm cursor-pointer text-xs"
                >
                  {editingLecture ? 'Save Changes' : 'Create Lecture'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
import { peopleService } from '../../services/peopleService';

export default function FacultyTopicsPage() {
  const { examId: routeExamId, subjectId, chapterId } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(() => curriculumService.getSubjectById(subjectId));
  const effectiveExamId = routeExamId || subject?.examId || 'neet-pg';
  const [exam, setExam] = useState(() => catalogService.getExamById(effectiveExamId) || { id: effectiveExamId, name: effectiveExamId.toUpperCase(), flag: '🩺' });
  const [chapter, setChapter] = useState(() => curriculumService.getChapterById(chapterId));
  const [topics, setTopics] = useState(() => curriculumService.getTopics(chapterId, subjectId, effectiveExamId));

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
  const [editingTopic, setEditingTopic] = useState(null);
  const [deletingTopic, setDeletingTopic] = useState(null);

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
      setChapter(curriculumService.getChapterById(chapterId));
      setTopics(curriculumService.getTopics(chapterId, subjectId, exId));
    });
    return unsub;
  }, [chapterId, subjectId, routeExamId]);

  useEffect(() => {
    const sub = curriculumService.getSubjectById(subjectId);
    if (sub) {
      setSubject(sub);
      const exId = routeExamId || sub.examId || 'neet-pg';
      const foundExam = catalogService.getExamById(exId);
      if (foundExam) setExam(foundExam);
      setTopics(curriculumService.getTopics(chapterId, subjectId, exId));
    }
    const foundChap = curriculumService.getChapterById(chapterId);
    if (foundChap) setChapter(foundChap);
  }, [routeExamId, subjectId, chapterId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Filtered and sorted topics
  const filteredTopics = useMemo(() => {
    return topics
      .filter(t => {
        if (difficultyFilter !== 'all' && t.difficulty !== difficultyFilter) return false;
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return t.title.toLowerCase().includes(q);
      })
      .sort((a, b) => (a.topicNumber || 0) - (b.topicNumber || 0));
  }, [topics, searchQuery, difficultyFilter, statusFilter]);

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

    const reordered = [...filteredTopics];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);

    const orderedIds = reordered.map(t => t.id);
    curriculumService.reorderTopics(chapterId, orderedIds);
    showToast(`Topic #${targetIndex + 1}: "${draggedItem.title}" reordered.`);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleOpenCreateModal = () => {
    setEditingTopic(null);
    setFormTitle('');
    setFormNumber(topics.length + 1);
    setFormDuration('45 mins');
    setFormDifficulty('High-Yield');
    setFormStatus('Published');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (topic) => {
    setEditingTopic(topic);
    setFormTitle(topic.title);
    setFormNumber(topic.topicNumber || 1);
    setFormDuration(topic.duration || '45 mins');
    setFormDifficulty(topic.difficulty || 'High-Yield');
    setFormStatus(topic.status || 'Published');
    setIsModalOpen(true);
  };

  const handleSaveTopic = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTopic) {
      curriculumService.saveTopic({
        ...editingTopic,
        title: formTitle.trim(),
        topicNumber: Number(formNumber),
        duration: formDuration.trim() || '45 mins',
        difficulty: formDifficulty,
        status: formStatus
      });
      showToast(`Topic "${formTitle}" updated!`);
    } else {
      curriculumService.saveTopic({
        chapterId,
        subjectId,
        examId: effectiveExamId,
        title: formTitle.trim(),
        topicNumber: Number(formNumber),
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
      showToast(`New topic "${formTitle}" added!`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteClick = (topic) => {
    setDeletingTopic(topic);
  };

  const handleConfirmDelete = () => {
    if (!deletingTopic) return;
    curriculumService.deleteTopic(deletingTopic.id);
    showToast(`Topic "${deletingTopic.title}" deleted.`);
    setDeletingTopic(null);
  };

  const handleMoveOrder = (topicId, direction) => {
    curriculumService.moveTopicOrder(topicId, direction);
  };

  const getContentStudioUrl = (topicId) => {
    return `/faculty/exams/${effectiveExamId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}/content`;
  };

  // If subject is not assigned to current faculty, restrict access
  if (!isAssigned) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-2xs text-center max-w-lg mx-auto my-12 space-y-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          You do not have assigned permissions for this subject. In the faculty portal, you can only view and manage topics for subjects explicitly assigned to your faculty roster.
        </p>
        <div className="pt-2">
          <Link
            to="/faculty/subjects"
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
              to={`/faculty/exams/${effectiveExamId}/subjects/${subjectId}/chapters`}
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Chapters</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-extrabold text-[10px] border border-indigo-100">
                  Unit {chapter?.chapterNumber || '•'}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {subject?.name} • {exam?.flag} {exam?.name}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1 ml-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Assigned Unit • Full Topic Access</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                {chapter?.title || 'Chapter'} — Topics Roster
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
            <span>+ Add Topic</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Total Topics</span>
          <div className="text-2xl font-black text-slate-900">{topics.length}</div>
          <span className="text-[11px] text-slate-400 font-medium">In this chapter</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Est. Study Time</span>
          <div className="text-2xl font-black text-slate-900">
            {topics.length * 45} mins
          </div>
          <span className="text-[11px] text-slate-400 font-medium">~45m / topic pace</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">High-Yield Concepts</span>
          <div className="text-2xl font-black text-amber-600">
            {topics.filter(t => t.difficulty === 'High-Yield').length}
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
              placeholder="Search topic title or key concepts..."
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
              {filteredTopics.length} Topics
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

      {/* TOPICS TABLE VIEW (DEFAULT LIST) */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 w-20 text-center">Topic #</th>
                <th className="py-3 px-4">Topic Title & Clinical Assets</th>
                <th className="py-3 px-4 text-center">Yield / Level</th>
                <th className="py-3 px-4 text-center">Duration</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTopics.map((top, idx) => {
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
                    {/* Drag Handle & Topic # */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          className="text-slate-300 hover:text-indigo-600 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-100 transition-colors"
                          title="Drag to reorder topic"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center border border-indigo-100 shadow-2xs shrink-0">
                          {top.topicNumber || idx + 1}
                        </span>
                      </div>
                    </td>

                    {/* Topic Title & Content Assets */}
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
                          title="Edit Topic Meta"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(top)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Topic"
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
                            disabled={idx === filteredTopics.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                        
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

              {filteredTopics.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-xs text-slate-600">No topics found</p>
                      <button
                        onClick={handleOpenCreateModal}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer"
                      >
                        + Add Topic
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
          {filteredTopics.map((top, idx) => {
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
                      #{top.topicNumber || idx + 1}
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
                      title="Edit Topic"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(top)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Topic"
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
      {/* MODAL: ADD / EDIT TOPIC                                                 */}
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
                    {editingTopic ? 'Edit Topic' : 'Add New Topic'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define learning topic title, duration, yield, and sequence
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

            <form onSubmit={handleSaveTopic} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
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
                    Topic Title <span className="text-rose-500">*</span>
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
                      name="facultyTopicStatus"
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
                      name="facultyTopicStatus"
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
                  {editingTopic ? 'Save Changes' : 'Create Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* DELETE MODAL                                                            */}
      {/* ======================================================================= */}
      {deletingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">
                Delete Topic?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{deletingTopic.title}"</span>? All attached content assets will be permanently removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeletingTopic(null)}
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

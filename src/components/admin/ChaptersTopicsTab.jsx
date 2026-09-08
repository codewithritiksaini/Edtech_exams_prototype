import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderTree, 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  FileText, 
  Video, 
  Image as ImageIcon, 
  Brain, 
  Clock, 
  Sparkles, 
  Layers, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  ExternalLink, 
  UploadCloud, 
  Check, 
  Filter, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown, 
  HelpCircle, 
  Play, 
  RotateCw, 
  ZoomIn, 
  Calendar,
  Maximize2
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';

export default function ChaptersTopicsTab({ initialExamId = 'neet-pg', initialSubjectId = null }) {
  const [exams, setExams] = useState(() => catalogService.getExams());
  const [selectedExamId, setSelectedExamId] = useState(initialExamId || 'neet-pg');
  
  const [subjects, setSubjects] = useState(() => curriculumService.getSubjects());
  const [selectedSubjectId, setSelectedSubjectId] = useState(() => {
    if (initialSubjectId) return initialSubjectId;
    const examSubs = curriculumService.getSubjects(initialExamId || 'neet-pg');
    return examSubs[0]?.id || 'sub-neet-cardio';
  });

  const [chapters, setChapters] = useState(() => curriculumService.getChapters());
  const [topics, setTopics] = useState(() => curriculumService.getTopics());

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all'); // 'all' | 'High-Yield' | 'Core Clinical' | 'Advanced'
  const [collapsedChapters, setCollapsedChapters] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  // Chapter Modal State
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapTitle, setChapTitle] = useState('');
  const [chapNumber, setChapNumber] = useState(1);
  const [chapDesc, setChapDesc] = useState('');

  // Topic Modal State
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [targetChapterForTopic, setTargetChapterForTopic] = useState(null);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicNumber, setTopicNumber] = useState(1);
  const [topicDuration, setTopicDuration] = useState('45 mins');
  const [topicDifficulty, setTopicDifficulty] = useState('High-Yield');

  // Topic Content Manager Modal State
  const [contentModalTopic, setContentModalTopic] = useState(null);
  const [contentActiveTab, setContentActiveTab] = useState('pdf'); // 'pdf' | 'images' | 'video' | 'flashcards' | 'notes'

  // Image Lightbox Modal State
  const [lightboxImage, setLightboxImage] = useState(null);

  // Sub-forms inside Content Manager
  // 1. PDF Form
  const [newPdfTitle, setNewPdfTitle] = useState('');
  const [newPdfFile, setNewPdfFile] = useState('Clinical_Study_Notes.pdf');
  const [newPdfPages, setNewPdfPages] = useState(20);
  const [newPdfAuthor, setNewPdfAuthor] = useState('Dr. Siddharth V.');

  // 2. Image Form
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80');
  const [newImageCaption, setNewImageCaption] = useState('');

  // 3. Video Form
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState('35:00');
  const [videoInstructor, setVideoInstructor] = useState('Dr. Siddharth V.');

  // 4. Flashcard Form
  const [newCardQ, setNewCardQ] = useState('');
  const [newCardA, setNewCardA] = useState('');

  // 5. Clinical Notes
  const [clinicalNotesText, setClinicalNotesText] = useState('');

  // Delete Confirmations
  const [deletingChapter, setDeletingChapter] = useState(null);
  const [deletingTopic, setDeletingTopic] = useState(null);

  // Sync with service
  useEffect(() => {
    const unsubCurriculum = curriculumService.subscribeCurriculum(() => {
      setSubjects(curriculumService.getSubjects());
      setChapters(curriculumService.getChapters());
      setTopics(curriculumService.getTopics());
    });
    return unsubCurriculum;
  }, []);

  // Sync selectedSubjectId if exam changes or initialSubjectId changes
  useEffect(() => {
    if (initialSubjectId && subjects.some(s => s.id === initialSubjectId)) {
      setSelectedSubjectId(initialSubjectId);
    }
  }, [initialSubjectId, subjects]);

  useEffect(() => {
    const currentSubs = subjects.filter(s => s.examId === selectedExamId);
    if (currentSubs.length > 0 && !currentSubs.some(s => s.id === selectedSubjectId)) {
      setSelectedSubjectId(currentSubs[0].id);
    }
  }, [selectedExamId, subjects, selectedSubjectId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const selectedExam = useMemo(() => {
    return exams.find(e => e.id === selectedExamId) || exams[0];
  }, [exams, selectedExamId]);

  const availableSubjectsForExam = useMemo(() => {
    return subjects.filter(s => s.examId === selectedExamId);
  }, [subjects, selectedExamId]);

  const activeSubject = useMemo(() => {
    return subjects.find(s => s.id === selectedSubjectId) || availableSubjectsForExam[0] || null;
  }, [subjects, selectedSubjectId, availableSubjectsForExam]);

  // Filter chapters for this subject
  const subjectChapters = useMemo(() => {
    if (!activeSubject) return [];
    return chapters
      .filter(c => c.subjectId === activeSubject.id)
      .sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
  }, [chapters, activeSubject]);

  // Accordion toggle
  const toggleChapterCollapse = (chapId) => {
    setCollapsedChapters(prev => ({
      ...prev,
      [chapId]: !prev[chapId]
    }));
  };

  const handleCollapseAll = () => {
    const nextState = {};
    subjectChapters.forEach(c => { nextState[c.id] = true; });
    setCollapsedChapters(nextState);
  };

  const handleExpandAll = () => {
    setCollapsedChapters({});
  };

  // Reordering handlers
  const handleMoveChapter = (chap, direction, e) => {
    if (e) e.stopPropagation();
    curriculumService.moveChapterOrder(chap.id, direction);
    setChapters(curriculumService.getChapters());
    showToast(`Chapter reordered ${direction}.`);
  };

  const handleMoveTopic = (top, direction, e) => {
    if (e) e.stopPropagation();
    curriculumService.moveTopicOrder(top.id, direction);
    setTopics(curriculumService.getTopics());
    showToast(`Topic reordered ${direction}.`);
  };

  // Open Chapter Modal
  const handleOpenChapterModal = (chap = null) => {
    if (chap) {
      setEditingChapter(chap);
      setChapTitle(chap.title);
      setChapNumber(chap.chapterNumber);
      setChapDesc(chap.description || '');
    } else {
      setEditingChapter(null);
      setChapTitle('');
      setChapNumber(subjectChapters.length + 1);
      setChapDesc('');
    }
    setIsChapterModalOpen(true);
  };

  const handleSaveChapter = (e) => {
    e.preventDefault();
    if (!chapTitle.trim()) return;

    curriculumService.saveChapter({
      ...(editingChapter ? { id: editingChapter.id } : {}),
      examId: selectedExamId,
      subjectId: activeSubject.id,
      title: chapTitle.trim(),
      chapterNumber: Number(chapNumber),
      description: chapDesc.trim(),
      status: 'Active'
    });

    setChapters(curriculumService.getChapters());
    setIsChapterModalOpen(false);
    showToast(editingChapter ? `Chapter updated successfully!` : `New chapter "${chapTitle}" created!`);
  };

  const handleDeleteChapter = () => {
    if (!deletingChapter) return;
    curriculumService.deleteChapter(deletingChapter.id);
    setChapters(curriculumService.getChapters());
    setTopics(curriculumService.getTopics());
    setDeletingChapter(null);
    showToast('Chapter and associated topics removed.');
  };

  // Open Topic Modal
  const handleOpenTopicModal = (chapter, topic = null) => {
    setTargetChapterForTopic(chapter);
    if (topic) {
      setEditingTopic(topic);
      setTopicTitle(topic.title);
      setTopicNumber(topic.topicNumber);
      setTopicDuration(topic.duration || '45 mins');
      setTopicDifficulty(topic.difficulty || 'High-Yield');
    } else {
      setEditingTopic(null);
      const chTopics = topics.filter(t => t.chapterId === chapter.id);
      setTopicTitle('');
      setTopicNumber(chTopics.length + 1);
      setTopicDuration('45 mins');
      setTopicDifficulty('High-Yield');
    }
    setIsTopicModalOpen(true);
  };

  const handleSaveTopic = (e) => {
    e.preventDefault();
    if (!topicTitle.trim() || !targetChapterForTopic) return;

    curriculumService.saveTopic({
      ...(editingTopic ? { id: editingTopic.id } : {}),
      examId: selectedExamId,
      subjectId: activeSubject.id,
      chapterId: targetChapterForTopic.id,
      title: topicTitle.trim(),
      topicNumber: Number(topicNumber),
      duration: topicDuration,
      difficulty: topicDifficulty,
      status: 'Published'
    });

    setTopics(curriculumService.getTopics());
    setIsTopicModalOpen(false);
    showToast(editingTopic ? `Topic updated successfully!` : `Topic "${topicTitle}" added to chapter!`);
  };

  const handleDeleteTopic = () => {
    if (!deletingTopic) return;
    curriculumService.deleteTopic(deletingTopic.id);
    setTopics(curriculumService.getTopics());
    setDeletingTopic(null);
    showToast('Topic deleted.');
  };

  // Open Topic Content Modal
  const handleOpenContentModal = (topic) => {
    setContentModalTopic(topic);
    setContentActiveTab('pdf');
    const content = topic.content || {};
    
    // Reset forms
    setNewPdfTitle(`${topic.title} Clinical Summary`);
    setNewPdfFile(`${topic.title.replace(/[^a-zA-Z0-9]/g, '_')}_Notes.pdf`);
    setNewPdfPages(24);
    setNewPdfAuthor('Dr. Siddharth V.');

    setNewImageTitle(`${topic.title} Clinical Diagram`);
    setNewImageUrl('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80');
    setNewImageCaption('Diagnostic ECG rhythm strip / biopsy specimen with annotations.');

    setVideoTitle(content.video?.title || `${topic.title}: Masterclass`);
    setVideoUrl(content.video?.url || 'https://www.youtube.com/embed/dQw4w9WgXcQ');
    setVideoDuration(content.video?.duration || '35:00');
    setVideoInstructor(content.video?.instructor || 'Dr. Siddharth V.');

    setNewCardQ('');
    setNewCardA('');
    setClinicalNotesText(content.clinicalNotes || '');
  };

  // Content Sub-actions
  const handleAddPdf = (e) => {
    e.preventDefault();
    if (!newPdfTitle || !contentModalTopic) return;
    curriculumService.addTopicPdf(contentModalTopic.id, {
      title: newPdfTitle,
      fileName: newPdfFile,
      pages: Number(newPdfPages),
      author: newPdfAuthor
    });
    const updated = curriculumService.getTopicById(contentModalTopic.id);
    setContentModalTopic(updated);
    showToast('PDF Notes uploaded to topic!');
  };

  const handleDeletePdf = (pdfId) => {
    if (!contentModalTopic) return;
    curriculumService.deleteTopicPdf(contentModalTopic.id, pdfId);
    const updated = curriculumService.getTopicById(contentModalTopic.id);
    setContentModalTopic(updated);
    showToast('PDF removed.');
  };

  const handleAddImage = (e) => {
    e.preventDefault();
    if (!newImageTitle || !contentModalTopic) return;
    curriculumService.addTopicImage(contentModalTopic.id, {
      title: newImageTitle,
      url: newImageUrl,
      caption: newImageCaption
    });
    const updated = curriculumService.getTopicById(contentModalTopic.id);
    setContentModalTopic(updated);
    showToast('Clinical Diagram / Image added to topic!');
  };

  const handleDeleteImage = (imgId) => {
    if (!contentModalTopic) return;
    curriculumService.deleteTopicImage(contentModalTopic.id, imgId);
    const updated = curriculumService.getTopicById(contentModalTopic.id);
    setContentModalTopic(updated);
    showToast('Image removed.');
  };

  const handleSaveVideo = (e) => {
    e.preventDefault();
    if (!contentModalTopic) return;
    curriculumService.saveTopicVideo(contentModalTopic.id, {
      title: videoTitle,
      url: videoUrl,
      duration: videoDuration,
      instructor: videoInstructor
    });
    const updated = curriculumService.getTopicById(contentModalTopic.id);
    setContentModalTopic(updated);
    showToast('Video Lecture details updated!');
  };

  const handleAddFlashcard = (e) => {
    e.preventDefault();
    if (!newCardQ || !newCardA || !contentModalTopic) return;
    curriculumService.addTopicFlashcard(contentModalTopic.id, {
      question: newCardQ,
      answer: newCardA
    });
    const updated = curriculumService.getTopicById(contentModalTopic.id);
    setContentModalTopic(updated);
    setNewCardQ('');
    setNewCardA('');
    showToast('Flashcard added to topic!');
  };

  const handleDeleteFlashcard = (cardId) => {
    if (!contentModalTopic) return;
    curriculumService.deleteTopicFlashcard(contentModalTopic.id, cardId);
    const updated = curriculumService.getTopicById(contentModalTopic.id);
    setContentModalTopic(updated);
    showToast('Flashcard deleted.');
  };

  const handleSaveClinicalNotes = () => {
    if (!contentModalTopic) return;
    curriculumService.saveTopicContent(contentModalTopic.id, {
      clinicalNotes: clinicalNotesText
    });
    const updated = curriculumService.getTopicById(contentModalTopic.id);
    setContentModalTopic(updated);
    showToast('Clinical Pearls saved!');
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-bold">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Academic Hierarchy Level 2 & 3</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Chapters, Topics & Content Hub
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Structure your syllabus by dividing subjects into chapters and high-yield topics. Add educational assets (PDFs, Images, Videos, Flashcards) directly inside each topic.
          </p>
        </div>

        {activeSubject && (
          <button
            id="btn-add-chapter"
            onClick={() => handleOpenChapterModal(null)}
            className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition-all hover:shadow-indigo-500/20 active:scale-98 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Chapter</span>
          </button>
        )}
      </div>

      {/* Dual Cascading Filter: 1. Exam -> 2. Subject */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        
        {/* Tier 1: Exam Track Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-1 shrink-0 flex items-center gap-1.5 mr-1">
            <Filter className="w-3 h-3" />
            1. Exam Track:
          </span>
          {exams.map(exam => (
            <button
              key={exam.id}
              id={`exam-filter-${exam.id}`}
              onClick={() => setSelectedExamId(exam.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                selectedExamId === exam.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{exam.flag}</span>
              <span>{exam.name}</span>
            </button>
          ))}
        </div>

        {/* Tier 2: Subject Selector */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-1 shrink-0 flex items-center gap-1.5 mr-1">
            <Layers className="w-3 h-3" />
            2. Subject:
          </span>
          {availableSubjectsForExam.length === 0 ? (
            <span className="text-xs text-slate-400 italic">No subjects configured for this exam track.</span>
          ) : (
            availableSubjectsForExam.map(sub => (
              <button
                key={sub.id}
                id={`sub-filter-${sub.id}`}
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  selectedSubjectId === sub.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{sub.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                  selectedSubjectId === sub.id ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-600'
                }`}>
                  {chapters.filter(c => c.subjectId === sub.id).length}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Tier 3: Search & Difficulty Filter Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 overflow-x-auto self-start sm:self-auto">
            <button
              onClick={() => setDifficultyFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                difficultyFilter === 'all'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Topics
            </button>
            <button
              onClick={() => setDifficultyFilter('High-Yield')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                difficultyFilter === 'High-Yield'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              High-Yield
            </button>
            <button
              onClick={() => setDifficultyFilter('Core Clinical')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                difficultyFilter === 'Core Clinical'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Core Clinical
            </button>
            <button
              onClick={() => setDifficultyFilter('Advanced / Super-Specialty')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                difficultyFilter === 'Advanced / Super-Specialty'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Advanced
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-topics-input"
                type="text"
                placeholder="Search topic title or term..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleExpandAll}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Expand All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Main Content Area: Chapters & Topics Tree */}
      {!activeSubject ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
          <p className="text-sm text-slate-500">Please select an exam and subject above to view its curriculum.</p>
        </div>
      ) : subjectChapters.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
          <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto">
            <FolderTree className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No chapters in {activeSubject.name}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Start structuring this subject by creating Chapter 1. Then you can add topics and upload PDFs, videos, and flashcards.
          </p>
          <button
            onClick={() => handleOpenChapterModal(null)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Chapter</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {subjectChapters.map((chap, cIdx) => {
            const isCollapsed = collapsedChapters[chap.id];
            const rawTopics = topics.filter(t => t.chapterId === chap.id).sort((a, b) => (a.topicNumber || 0) - (b.topicNumber || 0));
            
            const q = searchQuery.trim().toLowerCase();
            const chapterMatches = !q || chap.title.toLowerCase().includes(q) || (chap.description && chap.description.toLowerCase().includes(q));

            const filteredTopics = rawTopics.filter(t => {
              if (difficultyFilter !== 'all' && t.difficulty !== difficultyFilter) return false;
              if (q) {
                return chapterMatches || t.title.toLowerCase().includes(q);
              }
              return true;
            });

            if (q && !chapterMatches && filteredTopics.length === 0) {
              return null;
            }

            return (
              <div
                key={chap.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                {/* Chapter Banner Header */}
                <div 
                  onClick={() => toggleChapterCollapse(chap.id)}
                  className="p-5 sm:p-6 bg-slate-50/90 hover:bg-slate-100/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-800 shrink-0"
                    >
                      {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                          Chapter {chap.chapterNumber}
                        </span>
                        <span className="text-xs text-slate-400 font-bold">•</span>
                        <span className="text-xs font-bold text-slate-500">
                          {rawTopics.length} {rawTopics.length === 1 ? 'Topic' : 'Topics'}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 truncate">
                        {chap.title}
                      </h2>
                      {chap.description && (
                        <p className="text-xs text-slate-500 line-clamp-1">{chap.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions on Header */}
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Chapter reorder buttons */}
                    <div className="flex items-center gap-0.5 mr-1 bg-white p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        disabled={cIdx === 0}
                        onClick={(e) => handleMoveChapter(chap, 'up', e)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                        title="Move Chapter Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={cIdx === subjectChapters.length - 1}
                        onClick={(e) => handleMoveChapter(chap, 'down', e)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                        title="Move Chapter Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      id={`btn-add-topic-${chap.id}`}
                      onClick={() => handleOpenTopicModal(chap, null)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Topic</span>
                    </button>
                    <button
                      onClick={() => handleOpenChapterModal(chap)}
                      title="Edit Chapter"
                      className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingChapter(chap)}
                      title="Delete Chapter"
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Topics Container (Collapsible) */}
                {!isCollapsed && (
                  <div className="p-4 sm:p-6">
                    {filteredTopics.length === 0 ? (
                      <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                        <p className="text-xs text-slate-400 font-medium">
                          {rawTopics.length === 0 
                            ? 'No topics under this chapter yet.' 
                            : 'No topics match the search or filter.'}
                        </p>
                        <button
                          onClick={() => handleOpenTopicModal(chap, null)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                        >
                          + Add Topic
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {filteredTopics.map((top, tIdx) => {
                          const content = top.content || {};
                          const pdfCount = content.pdfList?.length || (content.pdf ? 1 : 0);
                          const imgCount = content.images?.length || 0;
                          const hasVid = Boolean(content.video);
                          const fcCount = content.flashcards?.length || 0;

                          return (
                            <div
                              key={top.id}
                              className="bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-indigo-200 rounded-2xl p-4 transition-all shadow-2xs hover:shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                            >
                              {/* Topic Title & Badges */}
                              <div className="space-y-1.5 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                                    Topic {top.topicNumber}
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                    {top.difficulty || 'High-Yield'}
                                  </span>
                                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                                    <Clock className="w-3 h-3" />
                                    {top.duration || '45 mins'}
                                  </span>
                                </div>

                                <h4 className="text-sm font-bold text-slate-900 truncate">
                                  {top.title}
                                </h4>

                                {/* Asset Indicators */}
                                <div className="flex items-center gap-2 pt-1 flex-wrap">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                                    pdfCount > 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-400'
                                  }`}>
                                    <FileText className="w-3 h-3" />
                                    {pdfCount > 0 ? `${pdfCount} PDF` : '0 PDF'}
                                  </span>

                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                                    imgCount > 0 ? 'bg-sky-50 text-sky-700 border border-sky-100' : 'bg-slate-100 text-slate-400'
                                  }`}>
                                    <ImageIcon className="w-3 h-3" />
                                    {imgCount > 0 ? `${imgCount} Diagrams` : '0 Images'}
                                  </span>

                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                                    hasVid ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-slate-100 text-slate-400'
                                  }`}>
                                    <Video className="w-3 h-3" />
                                    {hasVid ? 'Video' : 'No Video'}
                                  </span>

                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                                    fcCount > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'
                                  }`}>
                                    <Brain className="w-3 h-3" />
                                    {fcCount > 0 ? `${fcCount} Cards` : '0 Cards'}
                                  </span>
                                </div>
                              </div>

                              {/* Topic Actions & Reorder */}
                              <div className="flex items-center gap-2 shrink-0">
                                
                                {/* Topic Reorder Arrows */}
                                <div className="flex items-center gap-0.5 bg-white p-1 rounded-xl border border-slate-200">
                                  <button
                                    type="button"
                                    disabled={tIdx === 0}
                                    onClick={(e) => handleMoveTopic(top, 'up', e)}
                                    className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                    title="Move Topic Up"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={tIdx === filteredTopics.length - 1}
                                    onClick={(e) => handleMoveTopic(top, 'down', e)}
                                    className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                    title="Move Topic Down"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                </div>

                                <button
                                  id={`btn-manage-content-${top.id}`}
                                  onClick={() => handleOpenContentModal(top)}
                                  className="px-3.5 py-2 bg-white hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 border border-slate-200 hover:border-indigo-300 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Manage Content</span>
                                </button>

                                <button
                                  onClick={() => handleOpenTopicModal(chap, top)}
                                  title="Edit Topic Details"
                                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => setDeletingTopic(top)}
                                  title="Delete Topic"
                                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CHAPTER                                                 */}
      {/* ========================================================================= */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingChapter ? 'Edit Chapter' : 'Add Chapter'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Under Subject: {activeSubject?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChapterModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChapter} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Chap #
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={chapNumber}
                    onChange={(e) => setChapNumber(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-3 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Chapter Title *
                  </label>
                  <input
                    id="input-chapter-title"
                    type="text"
                    required
                    placeholder="e.g. Cardiac Arrhythmias & Conduction Disorders"
                    value={chapTitle}
                    onChange={(e) => setChapTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Description / Sub-areas
                </label>
                <textarea
                  id="input-chapter-description"
                  rows={3}
                  placeholder="Outline key pathologies or syllabus modules in this chapter..."
                  value={chapDesc}
                  onChange={(e) => setChapDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsChapterModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-chapter"
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingChapter ? 'Save Changes' : 'Create Chapter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT TOPIC                                                   */}
      {/* ========================================================================= */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingTopic ? 'Edit Topic' : 'Add Topic'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Under: Chapter {targetChapterForTopic?.chapterNumber} — {targetChapterForTopic?.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTopicModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTopic} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Topic #
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={topicNumber}
                    onChange={(e) => setTopicNumber(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-3 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Topic Title *
                  </label>
                  <input
                    id="input-topic-title"
                    type="text"
                    required
                    placeholder="e.g. Ventricular Tachycardias & Brugada Criteria"
                    value={topicTitle}
                    onChange={(e) => setTopicTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Estimated Time
                  </label>
                  <input
                    type="text"
                    placeholder="45 mins"
                    value={topicDuration}
                    onChange={(e) => setTopicDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Exam Weightage
                  </label>
                  <select
                    value={topicDifficulty}
                    onChange={(e) => setTopicDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="High-Yield">High-Yield (Must-Know)</option>
                    <option value="Core Clinical">Core Clinical</option>
                    <option value="Advanced / Super-Specialty">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-topic"
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingTopic ? 'Save Changes' : 'Add Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TOPIC CONTENT MANAGER (PDF, Images, Video, Flashcards)            */}
      {/* ========================================================================= */}
      {contentModalTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] flex flex-col justify-between overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    Topic Content Studio
                  </span>
                  <span className="text-xs text-slate-400 font-bold">•</span>
                  <span className="text-xs font-bold text-slate-500">Topic {contentModalTopic.topicNumber}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate mt-0.5">
                  {contentModalTopic.title}
                </h3>
              </div>
              <button
                onClick={() => setContentModalTopic(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Tabs Navigation */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto shrink-0 scrollbar-none">
              {[
                { id: 'pdf', label: 'PDF Notes', icon: FileText, count: contentModalTopic.content?.pdfList?.length || (contentModalTopic.content?.pdf ? 1 : 0) },
                { id: 'images', label: 'Clinical Images & ECG', icon: ImageIcon, count: contentModalTopic.content?.images?.length || 0 },
                { id: 'video', label: 'Video Lecture', icon: Video, count: contentModalTopic.content?.video ? 1 : 0 },
                { id: 'flashcards', label: 'Flashcards Deck', icon: Brain, count: contentModalTopic.content?.flashcards?.length || 0 },
                { id: 'notes', label: 'Clinical Pearls', icon: Sparkles, count: contentModalTopic.content?.clinicalNotes ? 'Yes' : 0 }
              ].map(tab => {
                const IconC = tab.icon;
                const isActive = contentActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-content-${tab.id}`}
                    onClick={() => setContentActiveTab(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <IconC className="w-4 h-4" />
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Content Tab Body */}
            <div className="overflow-y-auto flex-grow pr-1 space-y-4">
              
              {/* TAB 1: PDF NOTES */}
              {contentActiveTab === 'pdf' && (
                <div className="space-y-4">
                  {/* Add PDF Box */}
                  <form onSubmit={handleAddPdf} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-indigo-600" />
                      Attach New PDF Study Module
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">PDF Title *</label>
                        <input
                          id="input-pdf-title"
                          type="text"
                          required
                          value={newPdfTitle}
                          onChange={(e) => setNewPdfTitle(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">File Name</label>
                        <input
                          id="input-pdf-filename"
                          type="text"
                          value={newPdfFile}
                          onChange={(e) => setNewPdfFile(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Pages</label>
                        <input
                          id="input-pdf-pages"
                          type="number"
                          value={newPdfPages}
                          onChange={(e) => setNewPdfPages(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-600">Faculty Author</label>
                        <input
                          id="input-pdf-author"
                          type="text"
                          value={newPdfAuthor}
                          onChange={(e) => setNewPdfAuthor(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        id="btn-upload-pdf"
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload & Attach PDF</span>
                      </button>
                    </div>
                  </form>

                  {/* PDF List */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Attached PDF Documents ({contentModalTopic.content?.pdfList?.length || 0})
                    </h4>
                    {(!contentModalTopic.content?.pdfList || contentModalTopic.content.pdfList.length === 0) ? (
                      <p className="text-xs text-slate-400 italic">No PDF notes attached yet.</p>
                    ) : (
                      contentModalTopic.content.pdfList.map((pdf) => (
                        <div
                          key={pdf.id}
                          className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 truncate">{pdf.title}</div>
                              <div className="text-[10px] text-slate-400">
                                {pdf.fileName} • {pdf.pages} Pages • By {pdf.author}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeletePdf(pdf.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Remove PDF"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: CLINICAL IMAGES */}
              {contentActiveTab === 'images' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddImage} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-sky-600" />
                      Add Diagnostic ECG / Histology Image
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Image Title *</label>
                        <input
                          id="input-image-title"
                          type="text"
                          required
                          value={newImageTitle}
                          onChange={(e) => setNewImageTitle(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Image Web URL *</label>
                        <input
                          id="input-image-url"
                          type="text"
                          required
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Diagnostic Annotation / Caption</label>
                      <input
                        id="input-image-caption"
                        type="text"
                        value={newImageCaption}
                        onChange={(e) => setNewImageCaption(e.target.value)}
                        placeholder="Pathology findings, wave vectors, or clinical pearls..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        id="btn-add-image"
                        type="submit"
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Add Clinical Image</span>
                      </button>
                    </div>
                  </form>

                  {/* Image Grid */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Attached Diagnostic Images ({contentModalTopic.content?.images?.length || 0})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {contentModalTopic.content?.images?.map((img) => (
                        <div
                          key={img.id}
                          className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-2 group"
                        >
                          <div 
                            className="h-32 bg-slate-100 overflow-hidden relative cursor-pointer"
                            onClick={() => setLightboxImage(img)}
                          >
                            <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <ZoomIn className="w-6 h-6" />
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteImage(img.id);
                              }}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/70 hover:bg-rose-600 text-white cursor-pointer z-10"
                              title="Delete image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="p-3 space-y-1">
                            <div className="text-xs font-bold text-slate-900 truncate">{img.title}</div>
                            <div className="text-[10px] text-slate-500 line-clamp-2">{img.caption}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: VIDEO LECTURE */}
              {contentActiveTab === 'video' && (
                <form onSubmit={handleSaveVideo} className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-red-600" />
                    Video Lecture Stream
                  </h4>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Lecture Title</label>
                    <input
                      id="input-video-title"
                      type="text"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Video Embed URL (YouTube/Vimeo)</label>
                      <input
                        id="input-video-url"
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Duration</label>
                        <input
                          id="input-video-duration"
                          type="text"
                          value={videoDuration}
                          onChange={(e) => setVideoDuration(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Faculty</label>
                        <input
                          id="input-video-instructor"
                          type="text"
                          value={videoInstructor}
                          onChange={(e) => setVideoInstructor(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      id="btn-save-video"
                      type="submit"
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      Save Video Lecture
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 4: FLASHCARDS DECK */}
              {contentActiveTab === 'flashcards' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddFlashcard} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-emerald-600" />
                      Add Active-Recall Flashcard
                    </h4>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600">Question / Clinical Prompt *</label>
                      <input
                        id="input-card-q"
                        type="text"
                        required
                        placeholder="e.g. Hallmark of AV dissociation on rhythm strip?"
                        value={newCardQ}
                        onChange={(e) => setNewCardQ(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600">Answer / Core Medical Pearl *</label>
                      <textarea
                        id="input-card-a"
                        rows={2}
                        required
                        placeholder="e.g. Independent sinus P waves marching across wide QRS complexes with capture/fusion beats."
                        value={newCardA}
                        onChange={(e) => setNewCardA(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        id="btn-add-flashcard"
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                      >
                        + Add Card to Deck
                      </button>
                    </div>
                  </form>

                  {/* Cards List */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Topic Cards ({contentModalTopic.content?.flashcards?.length || 0})
                    </h4>
                    {(!contentModalTopic.content?.flashcards || contentModalTopic.content.flashcards.length === 0) ? (
                      <p className="text-xs text-slate-400 italic">No flashcards in this deck yet.</p>
                    ) : (
                      contentModalTopic.content.flashcards.map((card, idx) => (
                        <div
                          key={card.id || idx}
                          className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs relative group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-xs font-bold text-indigo-700">Q: {card.question}</span>
                            <button
                              onClick={() => handleDeleteFlashcard(card.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                              title="Delete Card"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl">
                            <span className="font-bold text-slate-800">A:</span> {card.answer}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: CLINICAL PEARLS & NOTES */}
              {contentActiveTab === 'notes' && (
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    High-Yield Clinical Pearls Summary
                  </h4>
                  <textarea
                    id="input-clinical-notes"
                    rows={6}
                    value={clinicalNotesText}
                    onChange={(e) => setClinicalNotesText(e.target.value)}
                    placeholder="Key diagnostic algorithms, must-know clinical triads, treatment guidelines..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                  />
                  <div className="flex justify-end pt-1">
                    <button
                      id="btn-save-pearls"
                      onClick={handleSaveClinicalNotes}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      Save Clinical Pearls
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end shrink-0">
              <button
                id="btn-close-content-modal"
                onClick={() => setContentModalTopic(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Done / Close Editor
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIGHTBOX MODAL: FULL CLINICAL IMAGE PREVIEW                               */}
      {/* ========================================================================= */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in cursor-zoom-out"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white rounded-3xl max-w-2xl w-full p-5 shadow-2xl space-y-3 cursor-default"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">{lightboxImage.title}</h4>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-100 max-h-[60vh] flex items-center justify-center">
              <img src={lightboxImage.url} alt={lightboxImage.title} className="w-full h-auto object-contain max-h-[60vh]" />
            </div>
            {lightboxImage.caption && (
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900">Clinical Finding:</span> {lightboxImage.caption}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CHAPTER CONFIRMATION                                        */}
      {/* ========================================================================= */}
      {deletingChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Chapter?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <span className="font-bold text-slate-800">"Chapter {deletingChapter.chapterNumber}: {deletingChapter.title}"</span>?
                This will also delete all topics inside this chapter.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingChapter(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-delete-chapter"
                onClick={handleDeleteChapter}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Delete Chapter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE TOPIC CONFIRMATION                                          */}
      {/* ========================================================================= */}
      {deletingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Topic?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{deletingTopic.title}"</span>?
                All uploaded content under this topic will be removed.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTopic(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-delete-topic"
                onClick={handleDeleteTopic}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Delete Topic
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

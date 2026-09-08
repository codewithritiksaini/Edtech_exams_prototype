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
  ArrowLeft,
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
    return 'all';
  });

  const [chapters, setChapters] = useState(() => curriculumService.getChapters());
  const [topics, setTopics] = useState(() => curriculumService.getTopics());

  // Dedicated Chapter Profile Drill-down View State
  const [activeChapterProfile, setActiveChapterProfile] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all'); // 'all' | 'High-Yield' | 'Core Clinical' | 'Advanced'
  const [collapsedChapters, setCollapsedChapters] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  // Chapter Modal State with Cascading Dropdowns
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [modalExamId, setModalExamId] = useState(initialExamId || 'neet-pg');
  const [modalSubjectId, setModalSubjectId] = useState(() => {
    const subs = curriculumService.getSubjects(initialExamId || 'neet-pg');
    return subs[0]?.id || '';
  });
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

  // Sync selectedSubjectId if initialSubjectId prop changes
  useEffect(() => {
    if (initialSubjectId && subjects.some(s => s.id === initialSubjectId)) {
      setSelectedSubjectId(initialSubjectId);
    }
  }, [initialSubjectId, subjects]);

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
    if (selectedSubjectId === 'all') return null;
    return subjects.find(s => s.id === selectedSubjectId) || null;
  }, [subjects, selectedSubjectId]);

  // Clean Chapters List for Main View
  const displayedChapters = useMemo(() => {
    return chapters.filter(chap => {
      const chapSubject = subjects.find(s => s.id === chap.subjectId);
      const matchesExam = chap.examId === selectedExamId || chapSubject?.examId === selectedExamId;
      if (!matchesExam) return false;

      if (selectedSubjectId !== 'all' && chap.subjectId !== selectedSubjectId) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = chap.title?.toLowerCase().includes(q);
        const matchesDesc = chap.description?.toLowerCase().includes(q);
        const matchesSubName = chapSubject?.name?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSubName) return false;
      }

      return true;
    }).sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
  }, [chapters, subjects, selectedExamId, selectedSubjectId, searchQuery]);

  // Dedicated Chapter Profile Drill-down View Selectors
  const profileSubject = useMemo(() => {
    if (!activeChapterProfile) return null;
    return subjects.find(s => s.id === activeChapterProfile.subjectId) || null;
  }, [subjects, activeChapterProfile]);

  const profileTopics = useMemo(() => {
    if (!activeChapterProfile) return [];
    return topics
      .filter(t => t.chapterId === activeChapterProfile.id)
      .sort((a, b) => (a.topicNumber || 0) - (b.topicNumber || 0));
  }, [topics, activeChapterProfile]);

  const profileFilteredTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return profileTopics.filter(t => {
      if (difficultyFilter !== 'all' && t.difficulty !== difficultyFilter) return false;
      if (q) {
        return t.title?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [profileTopics, difficultyFilter, searchQuery]);

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

  // Cascading Handlers inside Chapter Modal
  const handleModalExamChange = (newExamId) => {
    setModalExamId(newExamId);
    const examSubs = curriculumService.getSubjects(newExamId);
    const firstSub = examSubs[0]?.id || '';
    setModalSubjectId(firstSub);
    const count = chapters.filter(c => c.subjectId === firstSub).length;
    setChapNumber(count + 1);
  };

  const handleModalSubjectChange = (newSubId) => {
    setModalSubjectId(newSubId);
    const count = chapters.filter(c => c.subjectId === newSubId).length;
    setChapNumber(count + 1);
  };

  // Open Chapter Modal
  const handleOpenChapterModal = (chap = null) => {
    if (chap) {
      setEditingChapter(chap);
      const exId = chap.examId || selectedExamId || 'neet-pg';
      setModalExamId(exId);
      setModalSubjectId(chap.subjectId);
      setChapTitle(chap.title);
      setChapNumber(chap.chapterNumber);
      setChapDesc(chap.description || '');
    } else {
      setEditingChapter(null);
      const exId = selectedExamId || 'neet-pg';
      setModalExamId(exId);
      const examSubs = curriculumService.getSubjects(exId);
      const defSub = (selectedSubjectId !== 'all' && selectedSubjectId && examSubs.some(s => s.id === selectedSubjectId))
        ? selectedSubjectId
        : (examSubs[0]?.id || '');
      setModalSubjectId(defSub);
      setChapTitle('');
      const count = chapters.filter(c => c.subjectId === defSub).length;
      setChapNumber(count + 1);
      setChapDesc('');
    }
    setIsChapterModalOpen(true);
  };

  const handleSaveChapter = (e) => {
    e.preventDefault();
    if (!chapTitle.trim()) {
      showToast('Please enter a Chapter Name.');
      return;
    }
    if (!modalSubjectId) {
      showToast('Please select a Subject for this chapter.');
      return;
    }

    const saved = curriculumService.saveChapter({
      ...(editingChapter ? { id: editingChapter.id } : {}),
      examId: modalExamId,
      subjectId: modalSubjectId,
      title: chapTitle.trim(),
      chapterNumber: Number(chapNumber),
      description: chapDesc.trim(),
      status: 'Active'
    });

    setChapters(curriculumService.getChapters());
    if (activeChapterProfile && editingChapter && activeChapterProfile.id === editingChapter.id) {
      setActiveChapterProfile(saved);
    }
    setIsChapterModalOpen(false);
    showToast(editingChapter ? `Chapter updated successfully!` : `New chapter "${chapTitle}" created!`);
  };

  const handleDeleteChapter = () => {
    if (!deletingChapter) return;
    curriculumService.deleteChapter(deletingChapter.id);
    setChapters(curriculumService.getChapters());
    setTopics(curriculumService.getTopics());
    if (activeChapterProfile && activeChapterProfile.id === deletingChapter.id) {
      setActiveChapterProfile(null);
    }
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
        <div className="fixed top-20 right-6 z-50 bg-white text-slate-900 px-5 py-3 rounded-2xl shadow-xl border border-slate-200 flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DEDICATED CHAPTER PROFILE & TOPICS VIEW (When a Chapter is Selected)   */}
      {/* ========================================================================= */}
      {activeChapterProfile ? (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Back Button & Breadcrumbs Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
              <button
                onClick={() => setActiveChapterProfile(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Chapters List</span>
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-slate-600">{profileSubject?.name || 'Subject'}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-bold">
                Chapter {activeChapterProfile.chapterNumber}: {activeChapterProfile.title}
              </span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => handleOpenChapterModal(activeChapterProfile)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Chapter Profile</span>
              </button>
              <button
                onClick={() => handleOpenTopicModal(activeChapterProfile, null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Topic</span>
              </button>
            </div>
          </div>

          {/* Chapter Profile Banner Card (Light Modern Theme) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-5 relative overflow-hidden">
            {/* Subtle background ambient corner tint */}
            <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-bl from-indigo-50/60 via-sky-50/20 to-transparent rounded-bl-full pointer-events-none" />

            <div className="flex flex-wrap items-center gap-2 relative z-10">
              <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-black">
                Chapter {activeChapterProfile.chapterNumber} Profile
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                {profileSubject?.name} ({profileSubject?.code})
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold">
                {selectedExam.flag} {selectedExam.name}
              </span>
            </div>

            <div className="space-y-1.5 max-w-3xl relative z-10">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {activeChapterProfile.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {activeChapterProfile.description || 'Structured medical curriculum chapter. Add sub-topics and link high-yield clinical assets below.'}
              </p>
            </div>

            {/* Chapter Metrics Overview */}
            {(() => {
              let totalPdfs = 0;
              let totalVideos = 0;
              let totalCards = 0;
              let totalImages = 0;

              profileTopics.forEach(t => {
                const c = t.content || {};
                totalPdfs += (c.pdfs?.length || 0);
                totalImages += (c.images?.length || 0);
                if (c.video?.url || c.video?.title) totalVideos += 1;
                totalCards += (c.flashcards?.length || 0);
              });

              return (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 relative z-10">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center transition-all hover:bg-slate-100/70">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Topics</span>
                    <span className="text-xl font-black text-slate-900">{profileTopics.length}</span>
                  </div>
                  <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-3 text-center transition-all hover:bg-rose-50">
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">PDF Notes</span>
                    <span className="text-xl font-black text-rose-700">{totalPdfs}</span>
                  </div>
                  <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3 text-center transition-all hover:bg-sky-50">
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">Videos</span>
                    <span className="text-xl font-black text-sky-700">{totalVideos}</span>
                  </div>
                  <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-3 text-center transition-all hover:bg-amber-50">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Flashcards</span>
                    <span className="text-xl font-black text-amber-700">{totalCards}</span>
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 text-center transition-all hover:bg-emerald-50">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Clinical Imgs</span>
                    <span className="text-xl font-black text-emerald-700">{totalImages}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Topics in this Chapter Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <span>Topics in this Chapter ({profileTopics.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sub-topics, clinical competencies, and high-yield study assets inside Chapter {activeChapterProfile.chapterNumber}.
                </p>
              </div>

              <button
                onClick={() => handleOpenTopicModal(activeChapterProfile, null)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Topic</span>
              </button>
            </div>

            {/* Topic Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto self-start sm:self-auto">
                {['all', 'High-Yield', 'Core Clinical', 'Advanced / Super-Specialty'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                      difficultyFilter === diff
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {diff === 'all' ? 'All Difficulties' : diff}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search topic title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Topics List */}
            {profileFilteredTopics.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No topics in this chapter yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Start adding high-yield topics to Chapter {activeChapterProfile.chapterNumber} to link PDFs, videos, and flashcards.
                </p>
                <button
                  onClick={() => handleOpenTopicModal(activeChapterProfile, null)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-2 mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add First Topic</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {profileFilteredTopics.map((top, tIdx) => {
                  const content = top.content || {};
                  const pdfCount = content.pdfs?.length || 0;
                  const imageCount = content.images?.length || 0;
                  const hasVideo = Boolean(content.video?.url || content.video?.title);
                  const flashCount = content.flashcards?.length || 0;

                  return (
                    <div 
                      key={top.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-indigo-200 hover:shadow-xs transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0 border border-slate-200">
                            {activeChapterProfile.chapterNumber}.{top.topicNumber || tIdx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm sm:text-base font-bold text-slate-900">{top.title}</h4>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                top.difficulty === 'High-Yield'
                                  ? 'bg-amber-100 text-amber-800'
                                  : top.difficulty === 'Advanced / Super-Specialty'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-sky-100 text-sky-800'
                              }`}>
                                {top.difficulty || 'High-Yield'}
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium">
                                ⏱️ {top.duration || '45 mins'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => handleOpenContentModal(top)}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-indigo-200/60"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Manage Content ({pdfCount + imageCount + (hasVideo ? 1 : 0) + flashCount})</span>
                          </button>

                          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                            <button
                              onClick={(e) => handleMoveTopic(top, 'up', e)}
                              title="Move Up"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleMoveTopic(top, 'down', e)}
                              title="Move Down"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenTopicModal(activeChapterProfile, top)}
                              title="Edit Topic"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingTopic(top)}
                              title="Delete Topic"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Educational Assets Badges */}
                      <div className="flex items-center gap-2 flex-wrap text-xs pt-1 border-t border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Bound Assets:</span>
                        {pdfCount > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[11px] flex items-center gap-1 border border-rose-100">
                            <FileText className="w-3 h-3" />
                            {pdfCount} PDF Notes
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No PDFs</span>
                        )}
                        {hasVideo ? (
                          <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-bold text-[11px] flex items-center gap-1 border border-sky-100">
                            <Video className="w-3 h-3" />
                            Video Lecture
                          </span>
                        ) : null}
                        {flashCount > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[11px] flex items-center gap-1 border border-amber-100">
                            <Brain className="w-3 h-3" />
                            {flashCount} Flashcards
                          </span>
                        ) : null}
                        {imageCount > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px] flex items-center gap-1 border border-emerald-100">
                            <ImageIcon className="w-3 h-3" />
                            {imageCount} Clinical Imgs
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* ========================================================================= */
        /* 2. MAIN CHAPTERS STUDIO LIST VIEW (Clean Uncluttered Chapters Roster)     */
        /* ========================================================================= */
        <div className="space-y-6">

          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-bold">
                <FolderTree className="w-3.5 h-3.5" />
                <span>Academic Hierarchy Level 2</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Chapters Studio
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Manage syllabus chapters across medical disciplines. Open any chapter's profile to add and configure high-yield topics, clinical notes, and multimedia.
              </p>
            </div>

            <button
              id="btn-add-chapter"
              onClick={() => handleOpenChapterModal(null)}
              className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition-all hover:shadow-indigo-500/20 active:scale-98 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Chapter</span>
            </button>
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
                  onClick={() => {
                    setSelectedExamId(exam.id);
                    setSelectedSubjectId('all');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                    selectedExamId === exam.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{exam.flag}</span>
                  <span>{exam.name}</span>
                </button>
              ))}
            </div>

            {/* Tier 2: Subject Selector with "All Disciplines" */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-1 shrink-0 flex items-center gap-1.5 mr-1">
                <Layers className="w-3 h-3" />
                2. Subject:
              </span>
              <button
                onClick={() => setSelectedSubjectId('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  selectedSubjectId === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>All Disciplines</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                  selectedSubjectId === 'all' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-600'
                }`}>
                  {chapters.filter(c => {
                    const sub = subjects.find(s => s.id === c.subjectId);
                    return c.examId === selectedExamId || sub?.examId === selectedExamId;
                  }).length}
                </span>
              </button>

              {availableSubjectsForExam.map(sub => {
                const subChapCount = chapters.filter(c => c.subjectId === sub.id).length;
                return (
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
                      {subChapCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tier 3: Search Bar */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="relative w-full max-w-md">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search chapters by title, description, or discipline..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <span className="text-xs font-bold text-slate-400 shrink-0">
                {displayedChapters.length} {displayedChapters.length === 1 ? 'Chapter' : 'Chapters'} Listed
              </span>
            </div>

          </div>

          {/* Clean Chapters List Cards */}
          {displayedChapters.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <FolderTree className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No chapters found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No chapters match your current search and filter criteria. Create a new chapter to begin structuring the syllabus.
              </p>
              <button
                onClick={() => handleOpenChapterModal(null)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Chapter</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedChapters.map((chap) => {
                const chapSubject = subjects.find(s => s.id === chap.subjectId);
                const chapTopics = topics.filter(t => t.chapterId === chap.id);
                
                let pdfCount = 0;
                let videoCount = 0;
                let flashCount = 0;
                let imageCount = 0;
                
                chapTopics.forEach(t => {
                  const c = t.content || {};
                  pdfCount += (c.pdfs?.length || 0);
                  imageCount += (c.images?.length || 0);
                  if (c.video?.url || c.video?.title) videoCount += 1;
                  flashCount += (c.flashcards?.length || 0);
                });

                return (
                  <div
                    key={chap.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                          Chapter {chap.chapterNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {chapSubject?.name || 'Subject'}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          {selectedExam.flag} {selectedExam.shortName || selectedExam.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 self-end sm:self-auto">
                        <button 
                          onClick={(e) => handleMoveChapter(chap, 'up', e)}
                          title="Move Up"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleMoveChapter(chap, 'down', e)}
                          title="Move Down"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenChapterModal(chap)}
                          title="Edit Chapter"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeletingChapter(chap)}
                          title="Delete Chapter"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-slate-900 leading-snug">
                        {chap.title}
                      </h3>
                      {chap.description && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {chap.description}
                        </p>
                      )}
                    </div>

                    {/* Clinical Assets & Topics Summary + Profile Button */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-bold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-100">
                          📚 {chapTopics.length} {chapTopics.length === 1 ? 'Topic' : 'Topics'}
                        </span>
                        {pdfCount > 0 && (
                          <span className="font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px]">
                            📄 {pdfCount} PDFs
                          </span>
                        )}
                        {videoCount > 0 && (
                          <span className="font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[11px]">
                            🎥 {videoCount} Videos
                          </span>
                        )}
                        {flashCount > 0 && (
                          <span className="font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px]">
                            🧠 {flashCount} Flashcards
                          </span>
                        )}
                        {imageCount > 0 && (
                          <span className="font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px]">
                            🖼️ {imageCount} Images
                          </span>
                        )}
                      </div>

                      {/* Prominent Chapter Profile Button */}
                      <button
                        onClick={() => setActiveChapterProfile(chap)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer ml-auto"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Chapter Profile & Topics ({chapTopics.length}) ➔</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CHAPTER (Cascading Dropdowns: Exam -> Subject -> Chapter) */}
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
                    {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define exam, subject, and chapter syllabus module.
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
              {/* Dropdown 1: Exam Track */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1. Select Exam Track *</span>
                </label>
                <select
                  value={modalExamId}
                  onChange={(e) => handleModalExamChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  {exams.map(exam => (
                    <option key={exam.id} value={exam.id}>
                      {exam.flag} {exam.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown 2: Subject (Cascading from Exam) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>2. Select Subject *</span>
                </label>
                <select
                  value={modalSubjectId}
                  onChange={(e) => handleModalSubjectChange(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  {curriculumService.getSubjects(modalExamId).length === 0 ? (
                    <option value="" disabled>No subjects found for this exam</option>
                  ) : (
                    curriculumService.getSubjects(modalExamId).map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.code})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Chapter Number & Chapter Name */}
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
                    Chapter Name *
                  </label>
                  <input
                    id="input-chapter-title"
                    type="text"
                    required
                    placeholder="e.g. Cardiac Arrhythmias"
                    value={chapTitle}
                    onChange={(e) => setChapTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Description / Sub-areas (Optional)
                </label>
                <textarea
                  id="input-chapter-description"
                  rows={3}
                  placeholder="Outline key pathologies or clinical competencies covered in this chapter..."
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
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingChapter ? 'Save Changes' : 'Create Chapter'}</span>
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
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
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

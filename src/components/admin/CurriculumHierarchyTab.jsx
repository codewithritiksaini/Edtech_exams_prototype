import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  BookOpen, 
  Calendar, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown, 
  Video, 
  FileText, 
  Image as ImageIcon, 
  Presentation, 
  Radio, 
  Sparkles, 
  RotateCcw, 
  ExternalLink,
  Tag,
  AlertCircle,
  FolderPlus,
  Compass
} from 'lucide-react';
import { curriculumHierarchyService } from '../../services/curriculumHierarchyService';

export default function CurriculumHierarchyTab({ onOpenAddContentModal }) {
  const [exams, setExams] = useState(() => curriculumHierarchyService.getExams());
  const [selectedExamId, setSelectedExamId] = useState(() => exams[0]?.id || 'exam-neet-pg');
  
  // Curriculums for selected exam
  const [curriculums, setCurriculums] = useState(() => curriculumHierarchyService.getCurriculums(selectedExamId));
  const [selectedCurriculumId, setSelectedCurriculumId] = useState(() => curriculums[0]?.id || '');

  // Chapters & Hierarchy Tree
  const [chapters, setChapters] = useState(() => 
    selectedCurriculumId ? curriculumHierarchyService.getChapters(selectedCurriculumId) : []
  );
  const [expandedChapters, setExpandedChapters] = useState({});
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  // Modals state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingChapterSchedule, setEditingChapterSchedule] = useState(null);
  const [scheduleFormData, setScheduleFormData] = useState({
    start_date: '',
    end_date: '',
    recommended_study_hours: 14,
    target_duration_days: 7,
    milestone_name: ''
  });

  const [newCurriculumModalOpen, setNewCurriculumModalOpen] = useState(false);
  const [curriculumTitle, setCurriculumTitle] = useState('');
  const [curriculumVersion, setCurriculumVersion] = useState('v1.0');
  const [curriculumDesc, setCurriculumDesc] = useState('');

  const [newChapterModalOpen, setNewChapterModalOpen] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterDesc, setChapterDesc] = useState('');
  const [chapterHours, setChapterHours] = useState(14);

  const [newTopicModalOpen, setNewTopicModalOpen] = useState(false);
  const [targetChapterForTopic, setTargetChapterForTopic] = useState(null);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicSummary, setTopicSummary] = useState('');
  const [topicMinutes, setTopicMinutes] = useState(90);

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Sync state
  const reloadData = () => {
    const updatedExams = curriculumHierarchyService.getExams();
    setExams(updatedExams);
    const updatedCurrs = curriculumHierarchyService.getCurriculums(selectedExamId);
    setCurriculums(updatedCurrs);
    if (!updatedCurrs.some(c => c.id === selectedCurriculumId)) {
      setSelectedCurriculumId(updatedCurrs[0]?.id || '');
    }
    if (selectedCurriculumId) {
      setChapters(curriculumHierarchyService.getChapters(selectedCurriculumId));
    }
  };

  useEffect(() => {
    const unsubscribe = curriculumHierarchyService.subscribe(() => {
      reloadData();
    });
    return unsubscribe;
  }, [selectedExamId, selectedCurriculumId]);

  useEffect(() => {
    const currs = curriculumHierarchyService.getCurriculums(selectedExamId);
    setCurriculums(currs);
    const defaultCurr = currs.find(c => c.is_default) || currs[0];
    setSelectedCurriculumId(defaultCurr?.id || '');
  }, [selectedExamId]);

  useEffect(() => {
    if (selectedCurriculumId) {
      const chaps = curriculumHierarchyService.getChapters(selectedCurriculumId);
      setChapters(chaps);
      // Auto expand first chapter
      if (chaps[0] && Object.keys(expandedChapters).length === 0) {
        setExpandedChapters({ [chaps[0].id]: true });
      }
    } else {
      setChapters([]);
    }
  }, [selectedCurriculumId]);

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  // Schedule Handler
  const handleOpenScheduleModal = (chapter) => {
    const sched = curriculumHierarchyService.getChapterSchedule(chapter.id);
    setEditingChapterSchedule({ chapter, schedule: sched });
    setScheduleFormData({
      start_date: sched.start_date || '',
      end_date: sched.end_date || '',
      recommended_study_hours: sched.recommended_study_hours || 14,
      target_duration_days: sched.target_duration_days || 7,
      milestone_name: sched.milestone_name || ''
    });
    setScheduleModalOpen(true);
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    if (!editingChapterSchedule) return;
    curriculumHierarchyService.setChapterSchedule(
      editingChapterSchedule.chapter.id,
      scheduleFormData
    );
    setScheduleModalOpen(false);
    showToast(`Schedule saved for Chapter: "${editingChapterSchedule.chapter.title}"`);
    reloadData();
  };

  // Curriculum Creation
  const handleCreateCurriculum = (e) => {
    e.preventDefault();
    if (!curriculumTitle.trim()) return;
    const created = curriculumHierarchyService.createCurriculum({
      exam_id: selectedExamId,
      title: curriculumTitle.trim(),
      version: curriculumVersion.trim() || 'v1.0',
      description: curriculumDesc.trim()
    });
    setSelectedCurriculumId(created.id);
    setNewCurriculumModalOpen(false);
    setCurriculumTitle('');
    setCurriculumDesc('');
    showToast(`Curriculum "${created.title}" created successfully!`);
    reloadData();
  };

  // Chapter Creation
  const handleCreateChapter = (e) => {
    e.preventDefault();
    if (!chapterTitle.trim() || !selectedCurriculumId) return;
    const created = curriculumHierarchyService.createChapter({
      curriculum_id: selectedCurriculumId,
      title: chapterTitle.trim(),
      description: chapterDesc.trim(),
      estimated_duration_hours: Number(chapterHours) || 12
    });
    setNewChapterModalOpen(false);
    setChapterTitle('');
    setChapterDesc('');
    setExpandedChapters(prev => ({ ...prev, [created.id]: true }));
    showToast(`Chapter "${created.title}" created with 1:1 Schedule!`);
    reloadData();
  };

  // Topic Creation
  const handleCreateTopic = (e) => {
    e.preventDefault();
    if (!topicTitle.trim() || !targetChapterForTopic) return;
    const created = curriculumHierarchyService.createTopic({
      chapter_id: targetChapterForTopic.id,
      title: topicTitle.trim(),
      summary: topicSummary.trim(),
      estimated_minutes: Number(topicMinutes) || 90
    });
    setNewTopicModalOpen(false);
    setTopicTitle('');
    setTopicSummary('');
    setSelectedTopicId(created.id);
    showToast(`Topic "${created.title}" created successfully!`);
    reloadData();
  };

  const handleDeleteContent = (contentId, contentTitle) => {
    if (window.confirm(`Delete content item "${contentTitle}"?`)) {
      curriculumHierarchyService.deleteContent(contentId);
      showToast('Content item removed.');
      reloadData();
    }
  };

  const handleResetSeed = () => {
    if (window.confirm('Reset hierarchy store to default seed dataset across all 5 content types?')) {
      curriculumHierarchyService.resetToSeed();
      showToast('Reset to original seed data complete!');
      reloadData();
    }
  };

  const activeCurriculum = curriculums.find(c => c.id === selectedCurriculumId);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner & Breadcrumbs */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Target Product Hierarchy Model
              </span>
              <span className="text-xs text-slate-400">Exam ➔ Curriculum ➔ Chapter ➔ Topic ➔ Content</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Curriculum & Schedule Architect
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Organize syllabus modules, attach 1:1 Chapter Schedules, and assemble mixed content types (Video, Photo, PDF, PPT, Live Session) under topics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleResetSeed}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all flex items-center gap-1.5"
              title="Reset to default seed dataset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Seed</span>
            </button>

            {onOpenAddContentModal && (
              <button
                onClick={() => onOpenAddContentModal({ examId: selectedExamId, curriculumId: selectedCurriculumId })}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/30 transition-all flex items-center gap-2 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Upload Content Item</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Level 1 & 2 Selectors: Exam & Curriculum */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          
          {/* Exam Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exam:</span>
            <div className="flex flex-wrap gap-2">
              {exams.map(exam => (
                <button
                  key={exam.id}
                  onClick={() => setSelectedExamId(exam.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    selectedExamId === exam.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{exam.country === 'India' ? '🇮🇳' : '🇺🇸'}</span>
                  <span>{exam.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* New Curriculum Button */}
          <button
            onClick={() => setNewCurriculumModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-all flex items-center gap-1.5 self-start lg:self-auto"
          >
            <FolderPlus className="w-4 h-4 text-brand-600" />
            <span>+ New Curriculum Track</span>
          </button>
        </div>

        {/* Curriculum Versions Tabs */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-brand-600" />
              Active Curriculums for {exams.find(e => e.id === selectedExamId)?.title}:
            </span>
            <span className="text-xs text-slate-400">
              {curriculums.length} Curriculum {curriculums.length === 1 ? 'Version' : 'Versions'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {curriculums.map(curr => {
              const isSelected = selectedCurriculumId === curr.id;
              const chapsCount = curriculumHierarchyService.getChapters(curr.id).length;

              return (
                <div
                  key={curr.id}
                  onClick={() => setSelectedCurriculumId(curr.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-50/50 border-brand-400 shadow-xs ring-1 ring-brand-500/20'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{curr.title}</h4>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                          {curr.version}
                        </span>
                        {curr.is_default && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{curr.description}</p>
                    </div>

                    <span className="text-xs font-bold text-slate-600 shrink-0 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                      {chapsCount} Chapters
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Level 3 & 4: Chapters with 1:1 Schedules and Topics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Chapters & 1:1 Schedules</span>
              <span className="text-xs font-medium text-slate-500">
                (Under: <span className="font-semibold text-brand-700">{activeCurriculum?.title}</span>)
              </span>
            </h3>
          </div>

          <button
            onClick={() => setNewChapterModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-brand-700 bg-white hover:bg-brand-50 border border-brand-200 shadow-2xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-brand-600" />
            <span>+ Add Chapter & Schedule</span>
          </button>
        </div>

        {/* Chapters Accordion List */}
        <div className="space-y-4">
          {chapters.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No chapters configured for this curriculum yet.</p>
              <p className="text-xs text-slate-400 mt-1">Click "+ Add Chapter & Schedule" to create your first syllabus module.</p>
            </div>
          ) : (
            chapters.map((chapter) => {
              const schedule = curriculumHierarchyService.getChapterSchedule(chapter.id);
              const topics = curriculumHierarchyService.getTopics(chapter.id);
              const isExpanded = Boolean(expandedChapters[chapter.id]);

              return (
                <div
                  key={chapter.id}
                  className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                    isExpanded ? 'border-brand-200 shadow-sm' : 'border-slate-200'
                  }`}
                >
                  {/* Chapter Header Card */}
                  <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white">
                    <div className="flex items-start gap-4 cursor-pointer flex-grow" onClick={() => toggleChapter(chapter.id)}>
                      <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 border border-brand-100 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] uppercase font-bold text-brand-500">Chap</span>
                        <span className="text-base font-black leading-none">{chapter.chapter_number}</span>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900">{chapter.title}</h4>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {chapter.estimated_duration_hours} Hours Module
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{chapter.description}</p>
                      </div>
                    </div>

                    {/* Schedule Badge & Actions */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      
                      {/* Chapter 1:1 Schedule Pill */}
                      <div 
                        onClick={() => handleOpenScheduleModal(chapter)}
                        className="px-3.5 py-2 rounded-xl bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/80 cursor-pointer transition-all flex items-center gap-2.5 group"
                        title="Click to edit 1:1 Chapter Schedule"
                      >
                        <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-amber-900">
                              {schedule.start_date} ➔ {schedule.end_date}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-800 font-bold">
                              {schedule.recommended_study_hours}h Target
                            </span>
                          </div>
                          <p className="text-[10px] text-amber-700 font-medium line-clamp-1">
                            {schedule.milestone_name || 'Milestone Assessment'}
                          </p>
                        </div>
                        <Edit3 className="w-3.5 h-3.5 text-amber-600 opacity-60 group-hover:opacity-100 transition-opacity ml-1" />
                      </div>

                      {/* Add Topic Action */}
                      <button
                        onClick={() => {
                          setTargetChapterForTopic(chapter);
                          setNewTopicModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Topic</span>
                      </button>

                      {/* Accordion Arrow */}
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Chapter Topics & Content Drawer */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-5 sm:p-6 bg-slate-50/50 space-y-4">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <span>Topics in Chapter {chapter.chapter_number} ({topics.length} Total):</span>
                        <span className="text-slate-400">Mixed Content Supported (Video, Photo, PDF, PPT, Live)</span>
                      </div>

                      {topics.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-white border border-dashed border-slate-200 text-center">
                          <p className="text-xs text-slate-500 font-semibold">No topics created in this chapter yet.</p>
                          <button
                            onClick={() => {
                              setTargetChapterForTopic(chapter);
                              setNewTopicModalOpen(true);
                            }}
                            className="mt-2 text-xs font-bold text-brand-600 hover:text-brand-700"
                          >
                            + Create Topic 1 now
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {topics.map((topic) => {
                            const contents = curriculumHierarchyService.getContents(topic.id);

                            return (
                              <div
                                key={topic.id}
                                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-brand-600 uppercase">
                                        Topic {topic.topic_number}
                                      </span>
                                      <span className="text-slate-300">•</span>
                                      <h5 className="text-sm font-bold text-slate-900">{topic.title}</h5>
                                      <span className="text-[11px] text-slate-400 font-medium">
                                        (~{topic.estimated_minutes} mins)
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">{topic.summary}</p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {onOpenAddContentModal && (
                                      <button
                                        onClick={() => onOpenAddContentModal({
                                          examId: selectedExamId,
                                          curriculumId: selectedCurriculumId,
                                          chapterId: chapter.id,
                                          topicId: topic.id
                                        })}
                                        className="px-3 py-1 rounded-lg text-xs font-bold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors flex items-center gap-1"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add Asset</span>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Content Items Pills under Topic */}
                                <div>
                                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Content Items ({contents.length}):
                                  </div>

                                  {contents.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">No content items attached yet.</p>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                      {contents.map((item) => {
                                        return (
                                          <div
                                            key={item.id}
                                            className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-slate-300 transition-all flex items-start justify-between gap-2 group"
                                          >
                                            <div className="flex items-start gap-2.5 min-w-0">
                                              <div className="mt-0.5 shrink-0">
                                                {item.content_type === 'video' && (
                                                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                                                    <Video className="w-3.5 h-3.5" />
                                                  </div>
                                                )}
                                                {item.content_type === 'photo' && (
                                                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                                    <ImageIcon className="w-3.5 h-3.5" />
                                                  </div>
                                                )}
                                                {item.content_type === 'pdf' && (
                                                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                                                    <FileText className="w-3.5 h-3.5" />
                                                  </div>
                                                )}
                                                {item.content_type === 'ppt' && (
                                                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                                                    <Presentation className="w-3.5 h-3.5" />
                                                  </div>
                                                )}
                                                {item.content_type === 'live_session' && (
                                                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                                                    <Radio className="w-3.5 h-3.5" />
                                                  </div>
                                                )}
                                              </div>

                                              <div className="min-w-0">
                                                <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                                                  {item.content_type.replace('_', ' ')}
                                                </span>
                                                <h6 className="text-xs font-bold text-slate-900 truncate">
                                                  {item.title}
                                                </h6>
                                                <p className="text-[10px] text-slate-500 mt-0.5">
                                                  {item.content_type === 'video' && item.meta?.duration && `Duration: ${item.meta.duration}`}
                                                  {item.content_type === 'pdf' && item.meta?.page_count && `${item.meta.page_count} Pages`}
                                                  {item.content_type === 'ppt' && item.meta?.slide_count && `${item.meta.slide_count} Slides`}
                                                  {item.content_type === 'photo' && item.meta?.specimen_type && item.meta.specimen_type}
                                                  {item.content_type === 'live_session' && item.meta?.duration && `Duration: ${item.meta.duration}`}
                                                </p>
                                              </div>
                                            </div>

                                            <button
                                              onClick={() => handleDeleteContent(item.id, item.title)}
                                              className="text-slate-400 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                              title="Delete content item"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
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
            })
          )}
        </div>
      </div>

      {/* ======================================================================= */}
      {/* MODAL 1: 1:1 Chapter Schedule Editor                                    */}
      {/* ======================================================================= */}
      {scheduleModalOpen && editingChapterSchedule && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Configure Chapter Schedule</h3>
                  <p className="text-xs text-slate-500">1:1 Rule: Linked to {editingChapterSchedule.chapter.title}</p>
                </div>
              </div>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={scheduleFormData.start_date}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, start_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={scheduleFormData.end_date}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, end_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Study Target (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={scheduleFormData.recommended_study_hours}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, recommended_study_hours: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={scheduleFormData.target_duration_days}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, target_duration_days: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Milestone Benchmark Name</label>
                <input
                  type="text"
                  value={scheduleFormData.milestone_name}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, milestone_name: e.target.value })}
                  placeholder="e.g. Week 1 Clinical Core: Cardiovascular Benchmark"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL 2: New Curriculum Modal                                           */}
      {/* ======================================================================= */}
      {newCurriculumModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Create Curriculum Track</h3>
            <p className="text-xs text-slate-500 mb-4">Add a new curriculum track or version under {exams.find(e => e.id === selectedExamId)?.title}.</p>
            
            <form onSubmit={handleCreateCurriculum} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Curriculum Title</label>
                <input
                  type="text"
                  value={curriculumTitle}
                  onChange={(e) => setCurriculumTitle(e.target.value)}
                  placeholder="e.g. 60-Day Rapid Revision Track"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Version</label>
                <input
                  type="text"
                  value={curriculumVersion}
                  onChange={(e) => setCurriculumVersion(e.target.value)}
                  placeholder="v1.0"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={curriculumDesc}
                  onChange={(e) => setCurriculumDesc(e.target.value)}
                  placeholder="Brief summary of the curriculum goals..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewCurriculumModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20"
                >
                  Create Curriculum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL 3: New Chapter Modal                                              */}
      {/* ======================================================================= */}
      {newChapterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Chapter Module</h3>
            <p className="text-xs text-slate-500 mb-4">Adds a new chapter and automatically creates its 1:1 Schedule.</p>

            <form onSubmit={handleCreateChapter} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chapter Title</label>
                <input
                  type="text"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="e.g. Respiratory Pathology & Acid-Base"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Hours</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={chapterHours}
                  onChange={(e) => setChapterHours(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={chapterDesc}
                  onChange={(e) => setChapterDesc(e.target.value)}
                  placeholder="Clinical topics and syllabus coverage..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewChapterModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20"
                >
                  Create Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL 4: New Topic Modal                                                */}
      {/* ======================================================================= */}
      {newTopicModalOpen && targetChapterForTopic && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Topic</h3>
            <p className="text-xs text-slate-500 mb-4">Adding topic under Chapter: {targetChapterForTopic.title}</p>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Topic Title</label>
                <input
                  type="text"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder="e.g. Acute Coronary Syndromes & Cardiac Biomarkers"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Minutes</label>
                <input
                  type="number"
                  min="15"
                  max="400"
                  step="15"
                  value={topicMinutes}
                  onChange={(e) => setTopicMinutes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Summary</label>
                <textarea
                  rows={2}
                  value={topicSummary}
                  onChange={(e) => setTopicSummary(e.target.value)}
                  placeholder="Clinical learning outcomes..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewTopicModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20"
                >
                  Create Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

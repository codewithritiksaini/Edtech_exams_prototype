import React, { useState, useEffect, useMemo } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Video, 
  Image as ImageIcon, 
  Brain, 
  Radio, 
  CheckCircle2, 
  X, 
  Plus, 
  Trash2, 
  Eye, 
  Sparkles, 
  Layers, 
  Calendar, 
  Clock, 
  ExternalLink, 
  AlertCircle, 
  Check, 
  Link as LinkIcon, 
  Film, 
  ChevronRight,
  Maximize2,
  Lock,
  Edit3,
  BookOpen,
  PlusCircle,
  HelpCircle,
  Search,
  Filter,
  ArrowRight,
  RotateCcw,
  Presentation
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import { authService, USER_ROLES } from '../../services/authService';
import { catalogService } from '../../services/catalogService';
import { curriculumHierarchyService } from '../../services/curriculumHierarchyService';
import CurriculumHierarchyTab from './CurriculumHierarchyTab';

export default function ContentManagementTab() {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [activeCatalogExams, setActiveCatalogExams] = useState(() => catalogService.getActiveExams());
  
  // Scoping: Admin sees all exams; Faculty sees only assigned exams
  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;
  const isFaculty = currentUser?.role === USER_ROLES.FACULTY;
  const facultyAllowedExams = ['neet-pg', 'usmle'];

  // Available Exams based on permissions
  const availableExams = isAdmin 
    ? activeCatalogExams 
    : activeCatalogExams.filter(e => facultyAllowedExams.includes(e.id));

  // ---------------------------------------------------------------------------
  // View Modes:
  // 'hierarchy' -> 5-Tier Product Hierarchy & Schedules (DEFAULT TARGET MODEL)
  // 'list'      -> All Uploaded Content Library
  // 'editor'    -> Day Content Manager (Step-by-step day inspector)
  // 'matrix'    -> Curriculum Completeness Matrix
  // ---------------------------------------------------------------------------
  const [activeViewMode, setActiveViewMode] = useState('hierarchy');

  // ---------------------------------------------------------------------------
  // Master Content List & Search / Filter State
  // ---------------------------------------------------------------------------
  const [contentList, setContentList] = useState(() => contentService.getAllContentList());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Toast notification
  const [toastMessage, setToastMessage] = useState('');

  // ---------------------------------------------------------------------------
  // Fresh Add Content Form State (Modal)
  // Step-by-step: Course -> Week -> Day -> Content Type -> Form Fields
  // ---------------------------------------------------------------------------
  const [isAddContentModalOpen, setIsAddContentModalOpen] = useState(false);
  
  // Hierarchy selection for the Add Form
  const [addCourse, setAddCourse] = useState(() => availableExams[0]?.id || 'neet-pg');
  const [addCurriculum, setAddCurriculum] = useState(() => contentService.getCurriculumStructure(addCourse));
  const [addWeek, setAddWeek] = useState(() => addCurriculum.weeks[0]?.id || '1');
  const currentAddWeekObj = addCurriculum.weeks.find(w => w.id === String(addWeek)) || addCurriculum.weeks[0];
  const [addDay, setAddDay] = useState(() => currentAddWeekObj?.days[0]?.id || '1');

  // Content Type selection: 'pdf' | 'video' | 'image' | 'flashcards' | 'live'
  const [selectedContentType, setSelectedContentType] = useState('pdf');

  // Form Fields:
  // 1. PDF Form State
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfFileName, setPdfFileName] = useState('Clinical_Cardiology_Summary.pdf');
  const [pdfPages, setPdfPages] = useState(24);
  const [pdfAuthor, setPdfAuthor] = useState(() => currentUser?.name || 'Dr. Siddharth V.');

  // 2. Video Form State
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDuration, setVideoDuration] = useState('45 mins');
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [videoInstructor, setVideoInstructor] = useState(() => currentUser?.name || 'Dr. Siddharth V.');

  // 3. Clinical Diagram / Image Form State
  const [imageTitle, setImageTitle] = useState('Diagnostic ECG Rhythm Strip');
  const [imageCaption, setImageCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80');

  // 4. Flashcards Form State
  const [cardQuestion, setCardQuestion] = useState('');
  const [cardAnswer, setCardAnswer] = useState('');
  const [queuedCards, setQueuedCards] = useState([]);

  // 5. Live Session Form State
  const [liveTitle, setLiveTitle] = useState('');
  const [liveFaculty, setLiveFaculty] = useState(() => currentUser?.name || 'Dr. Siddharth V.');
  const [liveTime, setLiveTime] = useState('Today, 7:30 PM IST');
  const [liveDuration, setLiveDuration] = useState('60 mins');
  const [liveZoomUrl, setLiveZoomUrl] = useState('https://zoom.us/j/9876543210');
  const [liveDescription, setLiveDescription] = useState('High-Yield Case Discussion & Interactive Problem Solving');

  // 6. PPT Presentation Form State
  const [pptTitle, setPptTitle] = useState('');
  const [pptFileName, setPptFileName] = useState('Clinical_Grand_Rounds_Deck.pptx');
  const [pptSlideCount, setPptSlideCount] = useState(36);
  const [pptPresenter, setPptPresenter] = useState(() => currentUser?.name || 'Dr. Siddharth V.');
  const [pptUrl, setPptUrl] = useState('https://view.officeapps.live.com/op/view.aspx?src=sample_deck.pptx');
  const [pptNotes, setPptNotes] = useState('High-yield clinical grand rounds case presentation.');

  // ---------------------------------------------------------------------------
  // Hierarchy State for the Day Editor View (Inspection)
  // ---------------------------------------------------------------------------
  const [selectedExam, setSelectedExam] = useState(() => availableExams[0]?.id || 'neet-pg');
  const [curriculum, setCurriculum] = useState(() => contentService.getCurriculumStructure(selectedExam));
  const [selectedWeek, setSelectedWeek] = useState(() => curriculum.weeks[0]?.id || '1');
  const currentWeekObj = curriculum.weeks.find(w => w.id === String(selectedWeek)) || curriculum.weeks[0];
  const [selectedDay, setSelectedDay] = useState(() => currentWeekObj?.days[0]?.id || '1');
  const [dayData, setDayData] = useState(() => contentService.getDayContent(selectedDay));

  // Previews & Management Modals
  const [previewPdfModal, setPreviewPdfModal] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideoModal, setPreviewVideoModal] = useState(null);
  const [previewFlashcardsModal, setPreviewFlashcardsModal] = useState(null);
  const [previewLiveModal, setPreviewLiveModal] = useState(null);

  const [isAddWeekModalOpen, setIsAddWeekModalOpen] = useState(false);
  const [isAddDayModalOpen, setIsAddDayModalOpen] = useState(false);
  const [newWeekTitle, setNewWeekTitle] = useState('');
  const [newDayTitle, setNewDayTitle] = useState('');

  // ---------------------------------------------------------------------------
  // Synchronization with contentService
  // ---------------------------------------------------------------------------
  const refreshContentList = () => {
    setContentList(contentService.getAllContentList());
    setDayData(contentService.getDayContent(selectedDay));
  };

  useEffect(() => {
    const unsubscribe = contentService.subscribe(() => {
      refreshContentList();
    });
    return unsubscribe;
  }, [selectedDay]);

  // Sync Add Form Hierarchy when Course changes
  useEffect(() => {
    const cur = contentService.getCurriculumStructure(addCourse);
    setAddCurriculum(cur);
    const firstWeek = cur.weeks[0];
    setAddWeek(firstWeek?.id || '');
    setAddDay(firstWeek?.days[0]?.id || '');
  }, [addCourse]);

  // Sync Add Form Hierarchy when Week changes
  useEffect(() => {
    const weekObj = addCurriculum.weeks.find(w => w.id === String(addWeek));
    if (weekObj?.days?.length > 0) {
      setAddDay(weekObj.days[0].id);
    } else {
      setAddDay('');
    }
  }, [addWeek, addCurriculum]);

  // Sync Day Editor Hierarchy when selectedExam changes
  useEffect(() => {
    const cur = contentService.getCurriculumStructure(selectedExam);
    setCurriculum(cur);
    const firstWeek = cur.weeks[0];
    setSelectedWeek(firstWeek?.id || '');
    setSelectedDay(firstWeek?.days[0]?.id || '');
  }, [selectedExam]);

  // Sync Day Editor Hierarchy when selectedWeek changes
  useEffect(() => {
    const weekObj = curriculum.weeks.find(w => w.id === String(selectedWeek));
    if (weekObj?.days?.length > 0) {
      setSelectedDay(weekObj.days[0].id);
    } else {
      setSelectedDay('');
    }
  }, [selectedWeek, curriculum]);

  // Sync Day Editor data when selectedDay changes
  useEffect(() => {
    if (selectedDay) {
      setDayData(contentService.getDayContent(selectedDay));
    }
  }, [selectedDay]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  // Open Add Content Modal
  const handleOpenAddModal = (presetType = 'pdf') => {
    setSelectedContentType(presetType);
    setPdfTitle('');
    setVideoTitle('');
    setImageCaption('');
    setQueuedCards([]);
    setLiveTitle('');
    setIsAddContentModalOpen(true);
  };

  // ---------------------------------------------------------------------------
  // Action Handlers for Saving New Content
  // After saving: close form and redirect back to LIST view
  // ---------------------------------------------------------------------------
  const handleSaveContentSubmit = (e) => {
    e.preventDefault();

    const selectedCourseObj = availableExams.find(ex => ex.id === addCourse);
    const selectedWeekObj = addCurriculum.weeks.find(w => w.id === String(addWeek));
    const selectedDayObj = selectedWeekObj?.days?.find(d => d.id === String(addDay));
    const locationStr = `${selectedCourseObj?.name || addCourse} ➔ ${selectedWeekObj?.title || `Week ${addWeek}`} ➔ ${selectedDayObj?.title || `Day ${addDay}`}`;

    if (selectedContentType === 'pdf') {
      if (!pdfTitle.trim()) {
        alert('Please enter a Document Title for the PDF notes.');
        return;
      }
      contentService.uploadPdf(addDay, {
        fileName: pdfFileName,
        title: pdfTitle.trim(),
        pages: Number(pdfPages) || 18,
        author: pdfAuthor.trim() || currentUser?.name || 'Faculty Specialist'
      });
      showToast(`✅ PDF Notes "${pdfTitle}" successfully uploaded to ${locationStr}!`);
    } else if (selectedContentType === 'video') {
      if (!videoTitle.trim()) {
        alert('Please enter a Title for the Video Lecture.');
        return;
      }
      contentService.saveVideo(addDay, {
        title: videoTitle.trim(),
        duration: videoDuration.trim() || '45 mins',
        url: videoUrl.trim(),
        instructor: videoInstructor.trim() || currentUser?.name || 'Faculty Specialist'
      });
      showToast(`✅ Video Masterclass "${videoTitle}" published to ${locationStr}!`);
    } else if (selectedContentType === 'image') {
      if (!imageTitle.trim()) {
        alert('Please enter a Title for the Clinical Diagram.');
        return;
      }
      contentService.uploadImage(addDay, {
        title: imageTitle.trim(),
        caption: imageCaption.trim() || 'High-yield clinical diagnostic illustration and anatomic landmarks.',
        url: imageUrl.trim()
      });
      showToast(`✅ Clinical Diagram "${imageTitle}" uploaded to ${locationStr}!`);
    } else if (selectedContentType === 'flashcards') {
      const cardsToSave = [...queuedCards];
      if (cardQuestion.trim() && cardAnswer.trim()) {
        cardsToSave.push({ question: cardQuestion.trim(), answer: cardAnswer.trim() });
      }
      if (cardsToSave.length === 0) {
        alert('Please add at least one question and answer to create flashcards.');
        return;
      }
      cardsToSave.forEach(card => {
        contentService.addFlashcard(addDay, card);
      });
      showToast(`✅ ${cardsToSave.length} Smart Flashcards saved to ${locationStr}!`);
    } else if (selectedContentType === 'live') {
      if (!liveTitle.trim()) {
        alert('Please enter a Topic/Title for the Live Interactive Session.');
        return;
      }
      contentService.saveLiveSession(addDay, {
        title: liveTitle.trim(),
        faculty: liveFaculty.trim() || currentUser?.name || 'Dr. Siddharth V.',
        time: liveTime.trim() || '7:30 PM IST',
        duration: liveDuration.trim() || '60 mins',
        zoomUrl: liveZoomUrl.trim(),
        description: liveDescription.trim()
      });
      showToast(`✅ Live Session "${liveTitle}" scheduled for ${locationStr}!`);
    } else if (selectedContentType === 'ppt') {
      if (!pptTitle.trim()) {
        alert('Please enter a Presentation Title.');
        return;
      }
      curriculumHierarchyService.createContent({
        topic_id: 'top-valvular-disorders',
        content_type: 'ppt',
        title: pptTitle.trim(),
        description: pptNotes.trim() || 'Clinical slide deck',
        media_url: pptUrl.trim(),
        meta: {
          file_name: pptFileName.trim() || 'Clinical_Deck.pptx',
          slide_count: Number(pptSlideCount) || 30,
          presenter: pptPresenter.trim() || currentUser?.name || 'Faculty Lead',
          keyNotes: pptNotes.trim()
        }
      });
      showToast(`✅ PPT Presentation "${pptTitle}" saved to curriculum!`);
    }

    // Reset and redirect back to LIST view
    setIsAddContentModalOpen(false);
    setActiveViewMode('list');
    refreshContentList();
  };

  // Add card to queue in Flashcards form
  const handleQueueCard = () => {
    if (!cardQuestion.trim() || !cardAnswer.trim()) {
      alert('Please enter both a Question and an Answer before queuing.');
      return;
    }
    setQueuedCards(prev => [...prev, { question: cardQuestion.trim(), answer: cardAnswer.trim() }]);
    setCardQuestion('');
    setCardAnswer('');
    showToast('Card queued! You can queue more or click Save below.');
  };

  // Delete Content Item from List
  const handleDeleteContentItem = (item) => {
    if (window.confirm(`Are you sure you want to remove "${item.title}" from ${item.dayTitle}?`)) {
      contentService.deleteContentItem(item.type, item.dayId, item.id);
      refreshContentList();
      showToast(`Removed "${item.title}" from ${item.dayTitle}.`);
    }
  };

  // Quick Add Week in Hierarchy
  const handleAddWeekSubmit = (e) => {
    e.preventDefault();
    if (!newWeekTitle.trim()) return;
    const targetExam = isAddContentModalOpen ? addCourse : selectedExam;
    const added = contentService.addWeek(targetExam, newWeekTitle.trim());
    if (isAddContentModalOpen) {
      const updated = contentService.getCurriculumStructure(targetExam);
      setAddCurriculum(updated);
      setAddWeek(added.id);
      setAddDay(added.days[0].id);
    } else {
      const updated = contentService.getCurriculumStructure(targetExam);
      setCurriculum(updated);
      setSelectedWeek(added.id);
      setSelectedDay(added.days[0].id);
    }
    setNewWeekTitle('');
    setIsAddWeekModalOpen(false);
    showToast(`✅ Created "${added.title}" with Day 1 initialized!`);
  };

  // Quick Add Day in Hierarchy
  const handleAddDaySubmit = (e) => {
    e.preventDefault();
    if (!newDayTitle.trim()) return;
    const targetExam = isAddContentModalOpen ? addCourse : selectedExam;
    const targetWeek = isAddContentModalOpen ? addWeek : selectedWeek;
    const added = contentService.addDay(targetExam, targetWeek, newDayTitle.trim());
    if (isAddContentModalOpen) {
      const updated = contentService.getCurriculumStructure(targetExam);
      setAddCurriculum(updated);
      if (added) setAddDay(added.id);
    } else {
      const updated = contentService.getCurriculumStructure(targetExam);
      setCurriculum(updated);
      if (added) setSelectedDay(added.id);
    }
    setNewDayTitle('');
    setIsAddDayModalOpen(false);
    showToast(`✅ Created "${added?.title}"!`);
  };

  // ---------------------------------------------------------------------------
  // Filtered Content List
  // ---------------------------------------------------------------------------
  const filteredContentList = useMemo(() => {
    return contentList.filter(item => {
      // 1. Course Filter
      if (filterCourse !== 'all' && item.examId !== filterCourse) {
        return false;
      }
      // 2. Type Filter
      if (filterType !== 'all' && item.type !== filterType) {
        return false;
      }
      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchSub = item.subtitle?.toLowerCase().includes(q);
        const matchAuthor = item.author?.toLowerCase().includes(q);
        const matchDay = item.dayTitle?.toLowerCase().includes(q);
        const matchExam = item.examName?.toLowerCase().includes(q);
        if (!matchTitle && !matchSub && !matchAuthor && !matchDay && !matchExam) {
          return false;
        }
      }
      return true;
    });
  }, [contentList, filterCourse, filterType, searchQuery]);

  // Metrics summary counts
  const totalCount = contentList.length;
  const pdfCount = contentList.filter(i => i.type === 'pdf').length;
  const videoCount = contentList.filter(i => i.type === 'video').length;
  const imageCount = contentList.filter(i => i.type === 'image').length;
  const flashcardCount = contentList.filter(i => i.type === 'flashcards').length;
  const liveCount = contentList.filter(i => i.type === 'live').length;

  // Content Type Pill Component
  const renderTypeBadge = (type) => {
    switch (type) {
      case 'pdf':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>PDF Notes</span>
          </span>
        );
      case 'video':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Video className="w-3.5 h-3.5 text-purple-600" />
            <span>Video Masterclass</span>
          </span>
        );
      case 'image':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Clinical Diagram</span>
          </span>
        );
      case 'flashcards':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Brain className="w-3.5 h-3.5 text-amber-600" />
            <span>Flashcards</span>
          </span>
        );
      case 'live':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>Live Session</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Matrix Days for matrix view
  const matrixDays = contentService.getCurriculumOverview(selectedExam, selectedWeek);

  return (
    <div className="space-y-6 animate-in fade-in min-w-0 max-w-full">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold shadow-xs transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 min-w-0 max-w-full overflow-hidden">
        
        {/* ===================================================================== */}
        {/* HEADER BAR & PRIMARY ACTIONS                                          */}
        {/* ===================================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
              <span>Direct Curriculum Upload Hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Curriculum Content Library
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
              All added curriculum study materials are listed below. Click <strong>"+ Add / Upload Content"</strong> to open a fresh form, select Course ➔ Week ➔ Day ➔ Content Type, and publish directly to students.
            </p>
          </div>

          {/* Top Right Action Controls: "+ Add / Upload Content" & View Switcher */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => handleOpenAddModal('pdf')}
              className="px-4 sm:px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm hover:shadow-indigo-100 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add / Upload Content</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex flex-wrap items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold gap-1">
              <button
                onClick={() => setActiveViewMode('hierarchy')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewMode === 'hierarchy' 
                    ? 'bg-brand-600 text-white shadow-xs' 
                    : 'text-brand-700 hover:text-brand-900 bg-brand-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>5-Tier Hierarchy & Schedules</span>
              </button>
              <button
                onClick={() => setActiveViewMode('list')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeViewMode === 'list' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Content Library
              </button>
              <button
                onClick={() => setActiveViewMode('editor')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeViewMode === 'editor' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Day Inspector
              </button>
              <button
                onClick={() => setActiveViewMode('matrix')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeViewMode === 'matrix' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completeness Matrix
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* STATS METRIC SUMMARY STRIP                                            */}
        {/* ===================================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Assets</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{totalCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Across all tracks</div>
          </div>

          <div 
            onClick={() => { setActiveViewMode('list'); setFilterType(filterType === 'pdf' ? 'all' : 'pdf'); }}
            className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 hover:border-blue-300 transition-all cursor-pointer"
          >
            <div className="text-[11px] font-bold text-blue-700 flex items-center justify-between">
              <span>PDF Notes</span>
              <FileText className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-xl font-black text-blue-900 mt-0.5">{pdfCount}</div>
            <div className="text-[10px] text-blue-600 mt-0.5">Clinical handouts</div>
          </div>

          <div 
            onClick={() => { setActiveViewMode('list'); setFilterType(filterType === 'video' ? 'all' : 'video'); }}
            className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 hover:border-purple-300 transition-all cursor-pointer"
          >
            <div className="text-[11px] font-bold text-purple-700 flex items-center justify-between">
              <span>Video Lectures</span>
              <Video className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-xl font-black text-purple-900 mt-0.5">{videoCount}</div>
            <div className="text-[10px] text-purple-600 mt-0.5">Masterclass streams</div>
          </div>

          <div 
            onClick={() => { setActiveViewMode('list'); setFilterType(filterType === 'image' ? 'all' : 'image'); }}
            className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 hover:border-emerald-300 transition-all cursor-pointer"
          >
            <div className="text-[11px] font-bold text-emerald-700 flex items-center justify-between">
              <span>Diagrams</span>
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-900 mt-0.5">{imageCount}</div>
            <div className="text-[10px] text-emerald-600 mt-0.5">ECG & Pathology</div>
          </div>

          <div 
            onClick={() => { setActiveViewMode('list'); setFilterType(filterType === 'flashcards' ? 'all' : 'flashcards'); }}
            className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 hover:border-amber-300 transition-all cursor-pointer"
          >
            <div className="text-[11px] font-bold text-amber-700 flex items-center justify-between">
              <span>Flashcard Sets</span>
              <Brain className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-xl font-black text-amber-900 mt-0.5">{flashcardCount}</div>
            <div className="text-[10px] text-amber-600 mt-0.5">Active recall decks</div>
          </div>

          <div 
            onClick={() => { setActiveViewMode('list'); setFilterType(filterType === 'live' ? 'all' : 'live'); }}
            className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 hover:border-rose-300 transition-all cursor-pointer"
          >
            <div className="text-[11px] font-bold text-rose-700 flex items-center justify-between">
              <span>Live Sessions</span>
              <Radio className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="text-xl font-black text-rose-900 mt-0.5">{liveCount}</div>
            <div className="text-[10px] text-rose-600 mt-0.5">Interactive rounds</div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* VIEW 0: 5-TIER PRODUCT HIERARCHY & SCHEDULES (PRIMARY)                */}
        {/* ===================================================================== */}
        {activeViewMode === 'hierarchy' && (
          <CurriculumHierarchyTab onOpenAddContentModal={(opts) => {
            if (opts?.examId) setAddCourse(opts.examId === 'exam-usmle' ? 'usmle' : 'neet-pg');
            setIsAddContentModalOpen(true);
          }} />
        )}

        {/* ===================================================================== */}
        {/* VIEW 1: MASTER CONTENT LIBRARY (DEFAULT)                              */}
        {/* SBSE PEHLE LIST AANI CHAIYE JO CONTENT ADD KIYA GYA HAI               */}
        {/* ===================================================================== */}
        {activeViewMode === 'list' && (
          <div className="space-y-4">
            
            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by asset title, instructor, module, or document name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white font-medium text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                
                {/* Course Filter */}
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 cursor-pointer focus:outline-none"
                >
                  <option value="all">All Courses / Exams</option>
                  {availableExams.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.flag} {ex.name}</option>
                  ))}
                </select>

                {/* Content Type Filter Pills */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 cursor-pointer focus:outline-none"
                >
                  <option value="all">All Content Types</option>
                  <option value="pdf">PDF Notes</option>
                  <option value="video">Video Lectures</option>
                  <option value="image">Clinical Diagrams</option>
                  <option value="flashcards">Flashcards</option>
                  <option value="live">Live Sessions</option>
                </select>

                {(filterCourse !== 'all' || filterType !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setFilterCourse('all');
                      setFilterType('all');
                      setSearchQuery('');
                    }}
                    className="px-2.5 py-2 text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 hover:bg-slate-200/60 rounded-xl transition-colors"
                    title="Reset Filters"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* List Table / Content Cards */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Content Asset</th>
                      <th className="py-3 px-4">Curriculum Hierarchy</th>
                      <th className="py-3 px-4">Content Type</th>
                      <th className="py-3 px-4">Details / Scope</th>
                      <th className="py-3 px-4">Faculty / Author</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                    {filteredContentList.length > 0 ? (
                      filteredContentList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          
                          {/* 1. Content Asset Title */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                item.type === 'pdf' ? 'bg-blue-100 text-blue-700' :
                                item.type === 'video' ? 'bg-purple-100 text-purple-700' :
                                item.type === 'image' ? 'bg-emerald-100 text-emerald-700' :
                                item.type === 'flashcards' ? 'bg-amber-100 text-amber-700' :
                                'bg-rose-100 text-rose-700'
                              }`}>
                                {item.type === 'pdf' && <FileText className="w-4 h-4" />}
                                {item.type === 'video' && <Video className="w-4 h-4" />}
                                {item.type === 'image' && <ImageIcon className="w-4 h-4" />}
                                {item.type === 'flashcards' && <Brain className="w-4 h-4" />}
                                {item.type === 'live' && <Radio className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0 max-w-xs sm:max-w-sm">
                                <span className="font-bold text-slate-900 block truncate text-xs sm:text-sm">
                                  {item.title}
                                </span>
                                <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                                  {item.subtitle}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 2. Hierarchy Path */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] inline-block">
                                {item.examName}
                              </span>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                                <span>{item.weekTitle.split('—')[0]}</span>
                                <span>➔</span>
                                <span className="font-bold text-indigo-700">{item.dayTitle.split('—')[0]}</span>
                              </div>
                            </div>
                          </td>

                          {/* 3. Type Badge */}
                          <td className="py-3 px-4">
                            {renderTypeBadge(item.type)}
                          </td>

                          {/* 4. Details / Scope */}
                          <td className="py-3 px-4">
                            <span className="font-mono text-slate-600 font-bold bg-slate-50 px-2 py-1 rounded-md border border-slate-100 text-[11px]">
                              {item.details}
                            </span>
                          </td>

                          {/* 5. Author / Faculty */}
                          <td className="py-3 px-4 text-slate-600">
                            <span className="truncate block font-semibold">{item.author}</span>
                          </td>

                          {/* 6. Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Preview Button */}
                              <button
                                onClick={() => {
                                  if (item.type === 'pdf') setPreviewPdfModal(item.raw);
                                  else if (item.type === 'image') setPreviewImage(item.raw);
                                  else if (item.type === 'video') setPreviewVideoModal(item.raw);
                                  else if (item.type === 'flashcards') setPreviewFlashcardsModal({ title: item.title, cards: item.raw });
                                  else if (item.type === 'live') setPreviewLiveModal(item.raw);
                                }}
                                className="px-2.5 py-1.5 rounded-lg text-indigo-700 hover:bg-indigo-50 font-bold border border-indigo-200 transition-colors text-xs inline-flex items-center gap-1 cursor-pointer"
                                title="Preview Content Asset"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview</span>
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteContentItem(item)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete Asset"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <UploadCloud className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="font-bold text-slate-700 text-sm">No curriculum content found matching filters.</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            Try resetting your search query or click below to upload new verified curriculum content.
                          </p>
                          <button
                            onClick={() => handleOpenAddModal('pdf')}
                            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Upload First Content Asset</span>
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* List Footer Count */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Showing <strong>{filteredContentList.length}</strong> of {totalCount} total published curriculum assets</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAddModal('pdf')}
                  className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add More Content</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 2: STEP-BY-STEP DAY CONTENT INSPECTOR (ALTERNATIVE VIEW)         */}
        {/* ===================================================================== */}
        {activeViewMode === 'editor' && (
          <div className="space-y-6">
            
            {/* Hierarchy Selector Strip */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Inspect Day by Day</span>
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Select Exam ➔ Week ➔ Day
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* 1. Exam */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs">1. Exam Track</label>
                  <select
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white text-xs cursor-pointer"
                  >
                    {availableExams.map((exam) => (
                      <option key={exam.id} value={exam.id}>{exam.flag} {exam.name}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Week */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs">2. Week</label>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white text-xs cursor-pointer"
                  >
                    {curriculum.weeks.map((w) => (
                      <option key={w.id} value={w.id}>{w.title}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Day */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs">3. Day</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white text-xs cursor-pointer"
                  >
                    {currentWeekObj?.days?.map((d) => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Inspecting: <strong>{curriculum?.name}</strong> ➔ <strong>{currentWeekObj?.title}</strong> ➔ <strong className="text-indigo-700">{dayData?.title || `Day ${selectedDay}`}</strong>
                </span>
                <button
                  onClick={() => {
                    setAddCourse(selectedExam);
                    setAddWeek(selectedWeek);
                    setAddDay(selectedDay);
                    handleOpenAddModal('pdf');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add to this Day</span>
                </button>
              </div>
            </div>

            {/* Day Assets Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* PDF Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">PDF Notes ({dayData?.pdfList?.length || (dayData?.pdf ? 1 : 0)})</h4>
                      <p className="text-[10px] text-slate-400">High-yield clinical summaries</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAddCourse(selectedExam);
                      setAddWeek(selectedWeek);
                      setAddDay(selectedDay);
                      handleOpenAddModal('pdf');
                    }}
                    className="text-blue-600 hover:text-blue-800 font-bold text-xs cursor-pointer"
                  >
                    + Upload
                  </button>
                </div>

                {dayData?.pdfList && dayData.pdfList.length > 0 ? (
                  <div className="space-y-1.5">
                    {dayData.pdfList.map((pdf, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 truncate pr-2">{pdf.title}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => setPreviewPdfModal(pdf)} className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px]">View</button>
                          <button onClick={() => { contentService.deletePdf(selectedDay, pdf.id); refreshContentList(); }} className="text-slate-400 hover:text-rose-600 ml-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No PDF notes attached for this day.</p>
                )}
              </div>

              {/* Video Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">Video Masterclass ({dayData?.video ? '1' : '0'})</h4>
                      <p className="text-[10px] text-slate-400">Recorded clinical lecture</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAddCourse(selectedExam);
                      setAddWeek(selectedWeek);
                      setAddDay(selectedDay);
                      handleOpenAddModal('video');
                    }}
                    className="text-purple-600 hover:text-purple-800 font-bold text-xs cursor-pointer"
                  >
                    + Attach
                  </button>
                </div>

                {dayData?.video ? (
                  <div className="p-3 bg-purple-50/40 rounded-xl border border-purple-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{dayData.video.title}</span>
                      <span className="text-[11px] text-slate-500">{dayData.video.duration} • {dayData.video.instructor}</span>
                    </div>
                    <button onClick={() => setPreviewVideoModal(dayData.video)} className="text-purple-700 hover:text-purple-900 font-bold text-[11px] shrink-0">
                      Watch
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No video lecture attached for this day.</p>
                )}
              </div>

              {/* Diagrams Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">Clinical Diagrams ({dayData?.images?.length || 0})</h4>
                      <p className="text-[10px] text-slate-400">ECG strips & histology</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAddCourse(selectedExam);
                      setAddWeek(selectedWeek);
                      setAddDay(selectedDay);
                      handleOpenAddModal('image');
                    }}
                    className="text-emerald-600 hover:text-emerald-800 font-bold text-xs cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                {dayData?.images && dayData.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {dayData.images.map((img, idx) => (
                      <div key={idx} onClick={() => setPreviewImage(img)} className="p-2 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:border-emerald-300">
                        <img src={img.url} alt={img.title} className="h-16 w-full object-cover rounded-lg" />
                        <span className="text-[11px] font-bold text-slate-800 block truncate mt-1">{img.title}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No clinical diagrams uploaded for this day.</p>
                )}
              </div>

              {/* Flashcards Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">Smart Flashcards ({dayData?.flashcards?.length || 0})</h4>
                      <p className="text-[10px] text-slate-400">Active recall question cards</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAddCourse(selectedExam);
                      setAddWeek(selectedWeek);
                      setAddDay(selectedDay);
                      handleOpenAddModal('flashcards');
                    }}
                    className="text-amber-600 hover:text-amber-800 font-bold text-xs cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                {dayData?.flashcards && dayData.flashcards.length > 0 ? (
                  <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{dayData.flashcards.length} Cards in Deck</span>
                      <span className="text-[11px] text-slate-500">Spaced repetition enabled</span>
                    </div>
                    <button 
                      onClick={() => setPreviewFlashcardsModal({ title: dayData.title, cards: dayData.flashcards })}
                      className="text-amber-700 hover:text-amber-900 font-bold text-[11px] shrink-0"
                    >
                      Practice
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No flashcards created for this day.</p>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 3: CURRICULUM OVERVIEW MATRIX                                    */}
        {/* ===================================================================== */}
        {activeViewMode === 'matrix' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Curriculum Completeness Matrix</h3>
                <p className="text-xs text-slate-500">View upload status and verified content assets across each day.</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-xs cursor-pointer"
                >
                  {availableExams.map((e) => (
                    <option key={e.id} value={e.id}>{e.flag} {e.name}</option>
                  ))}
                </select>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-xs cursor-pointer"
                >
                  {curriculum.weeks.map((w) => (
                    <option key={w.id} value={w.id}>{w.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs min-w-[640px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500">
                    <th className="py-3 px-4">Day Topic</th>
                    <th className="py-3 px-4 text-center">PDF Notes</th>
                    <th className="py-3 px-4 text-center">Video</th>
                    <th className="py-3 px-4 text-center">Diagrams</th>
                    <th className="py-3 px-4 text-center">Flashcards</th>
                    <th className="py-3 px-4 text-center">Live Session</th>
                    <th className="py-3 px-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matrixDays.map((m) => (
                    <tr key={m.dayId} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-slate-900">{m.title}</td>
                      <td className="py-3 px-4 text-center">{m.hasPdf ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <span className="text-slate-300">—</span>}</td>
                      <td className="py-3 px-4 text-center">{m.hasVideo ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <span className="text-slate-300">—</span>}</td>
                      <td className="py-3 px-4 text-center">{m.hasImages ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <span className="text-slate-300">—</span>}</td>
                      <td className="py-3 px-4 text-center">{m.hasFlashcards ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <span className="text-slate-300">—</span>}</td>
                      <td className="py-3 px-4 text-center">{m.hasLive ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <span className="text-slate-300">—</span>}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setAddCourse(selectedExam);
                            setAddWeek(selectedWeek);
                            setAddDay(m.dayId);
                            handleOpenAddModal('pdf');
                          }}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 text-xs"
                        >
                          + Upload
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ===================================================================== */}
      {/* FRESH ADD CONTENT FORM MODAL (REQUESTED SPECIFICATION)               */}
      {/* 1. SELECT COURSE -> 2. SELECT WEEK -> 3. SELECT DAY ->               */}
      {/* 4. SELECT CONTENT TYPE -> 5. TAILORED FORM -> 6. REDIRECT TO LIST    */}
      {/* ===================================================================== */}
      {isAddContentModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsAddContentModalOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
              
              {/* Drawer Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold mb-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>Fresh Curriculum Upload Drawer</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    Add & Publish Curriculum Content
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select <strong>Course ➔ Week ➔ Day</strong>, choose content type, fill details, and save to publish.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddContentModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">

            {/* ================================================================= */}
            {/* STEP 1-3 HIERARCHY SELECTORS: COURSE -> WEEK -> DAY               */}
            {/* ================================================================= */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1. Hierarchy Selection</span>
                </span>
                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                
                {/* 1. Select Course */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Step 1: Course / Exam *</label>
                  <select
                    value={addCourse}
                    onChange={(e) => setAddCourse(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {availableExams.map((exam) => (
                      <option key={exam.id} value={exam.id}>{exam.flag} {exam.name}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Select Week */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 block">Step 2: Week *</label>
                    <button
                      type="button"
                      onClick={() => setIsAddWeekModalOpen(true)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold"
                    >
                      + New
                    </button>
                  </div>
                  <select
                    value={addWeek}
                    onChange={(e) => setAddWeek(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {addCurriculum.weeks.map((w) => (
                      <option key={w.id} value={w.id}>{w.title}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Select Day */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 block">Step 3: Day *</label>
                    <button
                      type="button"
                      onClick={() => setIsAddDayModalOpen(true)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold"
                    >
                      + New
                    </button>
                  </div>
                  <select
                    value={addDay}
                    onChange={(e) => setAddDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {currentAddWeekObj?.days?.map((d) => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Active Hierarchy Path Badge */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] text-slate-600">
                <span className="font-bold text-slate-400">Target:</span>
                <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {addCurriculum.name}
                </span>
                <span>➔</span>
                <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {currentAddWeekObj?.title?.split('—')[0] || `Week ${addWeek}`}
                </span>
                <span>➔</span>
                <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {currentAddWeekObj?.days?.find(d => d.id === String(addDay))?.title || `Day ${addDay}`}
                </span>
              </div>
            </div>

            {/* ================================================================= */}
            {/* STEP 4: SELECT CONTENT TYPE                                       */}
            {/* ================================================================= */}
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                Step 4: Select Content Type to Upload *
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                
                {/* 1. PDF Notes */}
                <button
                  type="button"
                  onClick={() => setSelectedContentType('pdf')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedContentType === 'pdf'
                      ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <FileText className={`w-4 h-4 ${selectedContentType === 'pdf' ? 'text-blue-600' : 'text-slate-400'}`} />
                    {selectedContentType === 'pdf' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                  <span className="font-bold text-slate-900 text-xs block">PDF Notes</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Clinical handout</span>
                </button>

                {/* 2. Video Lecture */}
                <button
                  type="button"
                  onClick={() => setSelectedContentType('video')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedContentType === 'video'
                      ? 'border-purple-500 bg-purple-50/70 shadow-xs ring-1 ring-purple-500'
                      : 'border-slate-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Video className={`w-4 h-4 ${selectedContentType === 'video' ? 'text-purple-600' : 'text-slate-400'}`} />
                    {selectedContentType === 'video' && <Check className="w-3.5 h-3.5 text-purple-600" />}
                  </div>
                  <span className="font-bold text-slate-900 text-xs block">Video Lecture</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Masterclass stream</span>
                </button>

                {/* 3. Clinical Diagram */}
                <button
                  type="button"
                  onClick={() => setSelectedContentType('image')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedContentType === 'image'
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <ImageIcon className={`w-4 h-4 ${selectedContentType === 'image' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    {selectedContentType === 'image' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <span className="font-bold text-slate-900 text-xs block">Diagram / ECG</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Clinical image</span>
                </button>

                {/* 4. Flashcards Deck */}
                <button
                  type="button"
                  onClick={() => setSelectedContentType('flashcards')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedContentType === 'flashcards'
                      ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-1 ring-amber-500'
                      : 'border-slate-200 bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Brain className={`w-4 h-4 ${selectedContentType === 'flashcards' ? 'text-amber-600' : 'text-slate-400'}`} />
                    {selectedContentType === 'flashcards' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <span className="font-bold text-slate-900 text-xs block">Flashcards</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Active recall</span>
                </button>

                {/* 5. Live Session */}
                <button
                  type="button"
                  onClick={() => setSelectedContentType('live')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedContentType === 'live'
                      ? 'border-rose-500 bg-rose-50/70 shadow-xs ring-1 ring-rose-500'
                      : 'border-slate-200 bg-white hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Radio className={`w-4 h-4 ${selectedContentType === 'live' ? 'text-rose-600' : 'text-slate-400'}`} />
                    {selectedContentType === 'live' && <Check className="w-3.5 h-3.5 text-rose-600" />}
                  </div>
                  <span className="font-bold text-slate-900 text-xs block">Live Session</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Interactive round</span>
                </button>

                {/* 6. PPT Presentation */}
                <button
                  type="button"
                  onClick={() => setSelectedContentType('ppt')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedContentType === 'ppt'
                      ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-1 ring-amber-500'
                      : 'border-slate-200 bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Presentation className={`w-4 h-4 ${selectedContentType === 'ppt' ? 'text-amber-600' : 'text-slate-400'}`} />
                    {selectedContentType === 'ppt' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <span className="font-bold text-slate-900 text-xs block">PPT Deck</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Slide deck</span>
                </button>

              </div>
            </div>

            {/* ================================================================= */}
            {/* STEP 5: DYNAMIC TAILORED FORM (ONLY RENDERS SELECTED TYPE)        */}
            {/* ================================================================= */}
            <div className="pt-2 border-t border-slate-100">
              <form onSubmit={handleSaveContentSubmit} className="space-y-4 text-xs">
                
                {/* 1. PDF Form */}
                {selectedContentType === 'pdf' && (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900 bg-blue-50 p-2.5 rounded-xl border border-blue-200">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>PDF Document Upload</span>
                    </div>

                    <div 
                      onClick={() => showToast('Selected document: Clinical_High_Yield_Notes.pdf')}
                      className="p-5 border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 rounded-2xl text-center space-y-1 cursor-pointer transition-colors"
                    >
                      <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                      <span className="font-bold text-slate-700 block">Click or drag & drop PDF file here</span>
                      <span className="text-[10px] text-slate-400">PDF documents up to 50 MB supported</span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Document Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Arrhythmias & ECG Clinical Pearls Master Handbook"
                        value={pdfTitle}
                        onChange={(e) => setPdfTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">File Name</label>
                        <input
                          type="text"
                          value={pdfFileName}
                          onChange={(e) => setPdfFileName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Page Count</label>
                        <input
                          type="number"
                          value={pdfPages}
                          onChange={(e) => setPdfPages(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Faculty / Author</label>
                        <input
                          type="text"
                          value={pdfAuthor}
                          onChange={(e) => setPdfAuthor(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Video Form */}
                {selectedContentType === 'video' && (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-900 bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                      <Video className="w-4 h-4 text-purple-600" />
                      <span>Video Masterclass Details</span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Video Lecture Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ECG Interpretation & Hemodynamic Pathways"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Video Duration</label>
                        <input
                          type="text"
                          placeholder="e.g. 45 mins"
                          value={videoDuration}
                          onChange={(e) => setVideoDuration(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Instructor / Specialist</label>
                        <input
                          type="text"
                          value={videoInstructor}
                          onChange={(e) => setVideoInstructor(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Video Embed URL / Stream Link *</label>
                      <input
                        type="url"
                        required
                        placeholder="https://www.youtube.com/embed/..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-900 bg-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                )}

                {/* 3. Clinical Diagram Form */}
                {selectedContentType === 'image' && (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <span>Clinical Diagram / ECG Specimen</span>
                    </div>

                    <div 
                      onClick={() => showToast('Selected image: high_res_ecg_specimen.png')}
                      className="p-5 border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50 rounded-2xl text-center space-y-1 cursor-pointer transition-colors"
                    >
                      <ImageIcon className="w-6 h-6 text-slate-400 mx-auto" />
                      <span className="font-bold text-slate-700 block">Click or drag & drop high-res diagram / ECG strip</span>
                      <span className="text-[10px] text-slate-400">PNG, JPG, SVG up to 20 MB</span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Diagram / Image Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Diagnostic Rhythm Strip — Ventricular Tachycardia vs SVT"
                        value={imageTitle}
                        onChange={(e) => setImageTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Image Source URL</label>
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Clinical Caption & Diagnostic Pearl *</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Explain key findings: QRS width, AV dissociation, fusion beats, and immediate ACLS protocol..."
                        value={imageCaption}
                        onChange={(e) => setImageCaption(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* 4. Flashcards Form */}
                {selectedContentType === 'flashcards' && (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      <Brain className="w-4 h-4 text-amber-600" />
                      <span>Smart Active-Recall Flashcards</span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Question / Clinical Vignette (Front) *</label>
                        <textarea
                          rows={2}
                          placeholder="e.g. What is the classic triad of symptoms seen in severe calcific Aortic Stenosis?"
                          value={cardQuestion}
                          onChange={(e) => setCardQuestion(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Answer & Clinical Rationale (Back) *</label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Angina, Syncope, and Exertional Dyspnea (mnemonic: SAD). Once symptomatic, 2-year mortality exceeds 50% without valve replacement."
                          value={cardAnswer}
                          onChange={(e) => setCardAnswer(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleQueueCard}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Queue This Card</span>
                        </button>
                      </div>
                    </div>

                    {/* Queued cards list */}
                    {queuedCards.length > 0 && (
                      <div className="space-y-2">
                        <span className="font-bold text-slate-700 block">
                          Queued to Publish ({queuedCards.length} Cards):
                        </span>
                        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                          {queuedCards.map((qc, i) => (
                            <div key={i} className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-[11px]">
                              <div>
                                <span className="font-bold text-slate-900 block">{qc.question}</span>
                                <span className="text-slate-500 line-clamp-1">{qc.answer}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setQueuedCards(prev => prev.filter((_, idx) => idx !== i))}
                                className="p-1 text-slate-400 hover:text-rose-600"
>
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Live Session Form */}
                {selectedContentType === 'live' && (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-900 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                      <Radio className="w-4 h-4 text-rose-600" />
                      <span>Live Interactive Masterclass</span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Live Session Topic *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Grand Round: Valvular Surgery Timing & TAVI Case Reviews"
                        value={liveTitle}
                        onChange={(e) => setLiveTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Faculty Specialist</label>
                        <input
                          type="text"
                          value={liveFaculty}
                          onChange={(e) => setLiveFaculty(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Scheduled Time</label>
                        <input
                          type="text"
                          value={liveTime}
                          onChange={(e) => setLiveTime(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Duration</label>
                        <input
                          type="text"
                          value={liveDuration}
                          onChange={(e) => setLiveDuration(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Live Stream / Zoom Link *</label>
                      <input
                        type="url"
                        required
                        value={liveZoomUrl}
                        onChange={(e) => setLiveZoomUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-900 bg-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                )}

                {/* 6. PPT Presentation Form */}
                {selectedContentType === 'ppt' && (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      <Presentation className="w-4 h-4 text-amber-600" />
                      <span>PPT Clinical Presentation Deck</span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Presentation Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Clinical Case: Severe Aortic Stenosis Grand Rounds"
                        value={pptTitle}
                        onChange={(e) => setPptTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">File Name</label>
                        <input
                          type="text"
                          value={pptFileName}
                          onChange={(e) => setPptFileName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Slide Count</label>
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={pptSlideCount}
                          onChange={(e) => setPptSlideCount(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Presenter / Faculty</label>
                        <input
                          type="text"
                          value={pptPresenter}
                          onChange={(e) => setPptPresenter(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Speaker Notes & Key Case Takeaway</label>
                      <textarea
                        rows={2}
                        value={pptNotes}
                        onChange={(e) => setPptNotes(e.target.value)}
                        placeholder="High-yield examination takeaway for candidates..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Form Footer Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddContentModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save & Publish to Curriculum</span>
                  </button>
                </div>

              </form>
            </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PREVIEW DRAWERS                                                       */}
      {/* ===================================================================== */}
      {/* 1. PDF Preview Drawer */}
      {previewPdfModal && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setPreviewPdfModal(null)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{previewPdfModal.title}</h3>
                  <span className="text-xs text-slate-400">{previewPdfModal.fileName} • {previewPdfModal.pages} Pages</span>
                </div>
                <button
                  onClick={() => setPreviewPdfModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                  <FileText className="w-12 h-12 text-blue-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">Interactive PDF Clinical Viewer</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Demonstration document configured. In the production build, this embeds a full-featured PDF.js viewer with bookmarking, highlighting, and clinical note search.
                  </p>
                </div>
              </div>
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 flex justify-end shrink-0">
                <button
                  onClick={() => setPreviewPdfModal(null)}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Image Enlarge Drawer */}
      {previewImage && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setPreviewImage(null)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-3xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <h3 className="text-base font-bold text-slate-900">{previewImage.title}</h3>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-black flex items-center justify-center min-h-[300px]">
                  <img src={previewImage.url} alt={previewImage.title} className="max-h-[65vh] w-auto object-contain" />
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">{previewImage.caption}</p>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50/90 flex justify-end shrink-0">
                <button
                  onClick={() => setPreviewImage(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Video Player Preview Drawer */}
      {previewVideoModal && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setPreviewVideoModal(null)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div>
                  <h3 className="text-base font-black text-slate-900">{previewVideoModal.title}</h3>
                  <span className="text-xs text-slate-400">{previewVideoModal.duration} • Instructor: {previewVideoModal.instructor}</span>
                </div>
                <button
                  onClick={() => setPreviewVideoModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center text-white overflow-hidden relative shadow-md">
                  <iframe
                    src={previewVideoModal.url}
                    title={previewVideoModal.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50/90 flex justify-end shrink-0">
                <button
                  onClick={() => setPreviewVideoModal(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Close Player
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Flashcards Preview Drawer */}
      {previewFlashcardsModal && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setPreviewFlashcardsModal(null)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div>
                  <h3 className="text-base font-black text-slate-900">{previewFlashcardsModal.title}</h3>
                  <span className="text-xs text-slate-400">{previewFlashcardsModal.cards.length} Interactive Flashcards</span>
                </div>
                <button
                  onClick={() => setPreviewFlashcardsModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
                {previewFlashcardsModal.cards.map((card, idx) => (
                  <div key={idx} className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/80 space-y-2">
                    <div className="text-xs font-bold text-amber-900">
                      <span className="text-amber-600 font-mono mr-1.5">Q{idx + 1}:</span>
                      {card.question}
                    </div>
                    <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-amber-100">
                      <span className="text-emerald-700 font-bold font-mono mr-1.5">Answer:</span>
                      {card.answer}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50/90 flex justify-end shrink-0">
                <button
                  onClick={() => setPreviewFlashcardsModal(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Close Deck
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Live Session Preview Drawer */}
      {previewLiveModal && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setPreviewLiveModal(null)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                  <h3 className="text-base font-black text-slate-900">Live Interactive Masterclass</h3>
                </div>
                <button
                  onClick={() => setPreviewLiveModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                <div className="space-y-3 p-4 bg-rose-50/40 rounded-2xl border border-rose-100">
                  <div>
                    <span className="text-xs font-bold text-rose-900 block">{previewLiveModal.title}</span>
                    <span className="text-[11px] text-slate-500 mt-1 block">Instructor: {previewLiveModal.faculty}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-700">
                    <span className="font-semibold">⏰ {previewLiveModal.time}</span>
                    <span>•</span>
                    <span className="font-semibold">⏱️ {previewLiveModal.duration}</span>
                  </div>
                  {previewLiveModal.zoomUrl && (
                    <div className="pt-2">
                      <a
                        href={previewLiveModal.zoomUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>Join Interactive Round (Zoom / Stream)</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50/90 flex justify-end shrink-0">
                <button
                  onClick={() => setPreviewLiveModal(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Add Week Drawer */}
      {isAddWeekModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsAddWeekModalOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <h3 className="text-base font-bold text-slate-900">Add New Curriculum Week</h3>
                <button onClick={() => setIsAddWeekModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddWeekSubmit} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Week Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Week 4 — High-Yield Grand Mocks"
                      value={newWeekTitle}
                      onChange={(e) => setNewWeekTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50/90 flex justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddWeekModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
                  >
                    Create Week
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 7. Add Day Drawer */}
      {isAddDayModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsAddDayModalOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <h3 className="text-base font-bold text-slate-900">Add New Day to Week</h3>
                <button onClick={() => setIsAddDayModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddDaySubmit} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Day Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Day 10 — Acute Pulmonary Embolism & DVT"
                      value={newDayTitle}
                      onChange={(e) => setNewDayTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50/90 flex justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddDayModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
                  >
                    Create Day
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

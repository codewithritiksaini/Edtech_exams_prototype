import React, { useState, useEffect } from 'react';
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
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import { authService, USER_ROLES } from '../../services/authService';
import { catalogService } from '../../services/catalogService';

export default function ContentManagementTab() {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [activeCatalogExams, setActiveCatalogExams] = useState(() => catalogService.getActiveExams());
  
  // Scoping: Admin sees all exams; Faculty sees only assigned exams (Rule 2 & Phase 5.1 routing)
  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;
  const isFaculty = currentUser?.role === USER_ROLES.FACULTY;
  const facultyAllowedExams = ['neet-pg', 'usmle'];

  // 1. Exam Options
  const availableExams = isAdmin 
    ? activeCatalogExams 
    : activeCatalogExams.filter(e => facultyAllowedExams.includes(e.id));

  // Hierarchy Selection State (Rule 5: Exam -> Week -> Day -> Content)
  const [selectedExam, setSelectedExam] = useState(() => availableExams[0]?.id || 'neet-pg');

  // 2. Week Options based on Exam
  const [curriculum, setCurriculum] = useState(() => contentService.getCurriculumStructure(selectedExam));
  const [selectedWeek, setSelectedWeek] = useState(() => curriculum.weeks[0]?.id || '1');
  
  // 3. Day Options based on Week
  const currentWeekObj = curriculum.weeks.find(w => w.id === String(selectedWeek)) || curriculum.weeks[0];
  const [selectedDay, setSelectedDay] = useState(() => currentWeekObj?.days[0]?.id || '1');

  // Hierarchy validation flag: All 3 must be selected to unlock content panels
  const isHierarchySelected = Boolean(selectedExam && selectedWeek && selectedDay);

  // Current Day Content Data
  const [dayData, setDayData] = useState(() => contentService.getDayContent(selectedDay));
  
  // View Toggle: 'editor' (Single Day Upload) | 'matrix' (Curriculum Completeness Matrix)
  const [activeViewMode, setActiveViewMode] = useState('editor');

  // Toast notification
  const [toastMessage, setToastMessage] = useState('');

  // ---------------------------------------------------------------------------
  // Upload Form States
  // ---------------------------------------------------------------------------
  // 1. PDF Form
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfFileName, setPdfFileName] = useState('Clinical_Cardiology_Summary.pdf');
  const [pdfPages, setPdfPages] = useState(24);

  // 2. Image Form
  const [imageCaption, setImageCaption] = useState('');
  const [imageTitle, setImageTitle] = useState('Diagnostic ECG Rhythm Strip');

  // 3. Video Form
  const [videoMode, setVideoMode] = useState('link'); // 'link' | 'file'
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDuration, setVideoDuration] = useState('45 mins');
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');

  // 4. Flashcards Form (Repeatable mini-form)
  const [cardQuestion, setCardQuestion] = useState('');
  const [cardAnswer, setCardAnswer] = useState('');
  const [queuedCards, setQueuedCards] = useState([]);

  // Modals
  const [previewImage, setPreviewImage] = useState(null);
  const [previewPdfModal, setPreviewPdfModal] = useState(null);
  const [isAddWeekModalOpen, setIsAddWeekModalOpen] = useState(false);
  const [isAddDayModalOpen, setIsAddDayModalOpen] = useState(false);
  const [newWeekTitle, setNewWeekTitle] = useState('');
  const [newDayTitle, setNewDayTitle] = useState('');

  // Sync with contentService updates
  useEffect(() => {
    const unsubscribeContent = contentService.subscribe(() => {
      setDayData(contentService.getDayContent(selectedDay));
    });
    return unsubscribeContent;
  }, [selectedDay]);

  // When Exam changes, re-sync Week and Day
  useEffect(() => {
    const cur = contentService.getCurriculumStructure(selectedExam);
    setCurriculum(cur);
    const firstWeek = cur.weeks[0];
    setSelectedWeek(firstWeek?.id || '');
    setSelectedDay(firstWeek?.days[0]?.id || '');
  }, [selectedExam]);

  // When Week changes, re-sync Day
  useEffect(() => {
    const weekObj = curriculum.weeks.find(w => w.id === String(selectedWeek));
    if (weekObj?.days?.length > 0) {
      setSelectedDay(weekObj.days[0].id);
    } else {
      setSelectedDay('');
    }
  }, [selectedWeek, curriculum]);

  // When Day changes, fetch day content
  useEffect(() => {
    if (selectedDay) {
      setDayData(contentService.getDayContent(selectedDay));
    }
  }, [selectedDay]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------
  // 1. Upload PDF
  const handleUploadPdf = (e) => {
    e.preventDefault();
    if (!pdfTitle.trim()) {
      alert('Please enter a PDF document title.');
      return;
    }
    contentService.uploadPdf(selectedDay, {
      fileName: pdfFileName,
      title: pdfTitle.trim(),
      pages: Number(pdfPages),
      author: currentUser?.name || 'Dr. Siddharth V.'
    });
    setPdfTitle('');
    showToast(`✅ PDF "${pdfTitle}" uploaded and published to Day ${selectedDay}!`);
  };

  const handleDeletePdf = (pdfId) => {
    contentService.deletePdf(selectedDay, pdfId);
    showToast('PDF notes document removed.');
  };

  // 2. Upload Image
  const handleUploadImage = (e) => {
    e.preventDefault();
    contentService.uploadImage(selectedDay, {
      title: imageTitle.trim() || 'Clinical Diagram',
      caption: imageCaption.trim() || 'Clinical high-yield reference diagram with labeled anatomic landmarks.',
      url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80'
    });
    setImageCaption('');
    showToast(`✅ Clinical diagram uploaded to Day ${selectedDay}!`);
  };

  const handleDeleteImage = (imgId) => {
    contentService.deleteImage(selectedDay, imgId);
    showToast('Clinical image removed.');
  };

  // 3. Save Video
  const handleSaveVideo = (e) => {
    e.preventDefault();
    if (!videoTitle.trim()) {
      alert('Please enter a video lecture title.');
      return;
    }
    contentService.saveVideo(selectedDay, {
      title: videoTitle.trim(),
      duration: videoDuration,
      url: videoUrl,
      instructor: currentUser?.name || 'Dr. Siddharth V.'
    });
    setVideoTitle('');
    showToast(`✅ Video masterclass published for Day ${selectedDay}!`);
  };

  const handleDeleteVideo = () => {
    contentService.deleteVideo(selectedDay);
    showToast('Video lecture removed.');
  };

  // 4. Flashcards Form (Repeatable mini-form)
  const handleQueueCard = () => {
    if (!cardQuestion.trim() || !cardAnswer.trim()) {
      alert('Please enter both a Question and an Answer before queuing.');
      return;
    }
    setQueuedCards(prev => [...prev, { question: cardQuestion.trim(), answer: cardAnswer.trim() }]);
    setCardQuestion('');
    setCardAnswer('');
    showToast('Card queued! Click "+ Add Another Flashcard" or "Save Flashcard Set" to publish.');
  };

  const handleSaveFlashcardSet = () => {
    if (queuedCards.length === 0 && !cardQuestion.trim()) {
      alert('Please add at least one flashcard before saving.');
      return;
    }

    const cardsToSave = [...queuedCards];
    if (cardQuestion.trim() && cardAnswer.trim()) {
      cardsToSave.push({ question: cardQuestion.trim(), answer: cardAnswer.trim() });
    }

    cardsToSave.forEach(card => {
      contentService.addFlashcard(selectedDay, card);
    });

    setQueuedCards([]);
    setCardQuestion('');
    setCardAnswer('');
    showToast(`✅ ${cardsToSave.length} smart flashcards saved to Day ${selectedDay}!`);
  };

  const handleDeleteFlashcard = (cardId) => {
    contentService.deleteFlashcard(selectedDay, cardId);
    showToast('Flashcard removed.');
  };

  // Quick Add Week
  const handleAddWeekSubmit = (e) => {
    e.preventDefault();
    if (!newWeekTitle.trim()) return;
    const added = contentService.addWeek(selectedExam, newWeekTitle.trim());
    const updatedCurriculum = contentService.getCurriculumStructure(selectedExam);
    setCurriculum(updatedCurriculum);
    setSelectedWeek(added.id);
    setSelectedDay(added.days[0].id);
    setNewWeekTitle('');
    setIsAddWeekModalOpen(false);
    showToast(`✅ Created "${added.title}" with Day 1 initialized!`);
  };

  // Quick Add Day
  const handleAddDaySubmit = (e) => {
    e.preventDefault();
    if (!newDayTitle.trim()) return;
    const added = contentService.addDay(selectedExam, selectedWeek, newDayTitle.trim());
    const updatedCurriculum = contentService.getCurriculumStructure(selectedExam);
    setCurriculum(updatedCurriculum);
    if (added) {
      setSelectedDay(added.id);
    }
    setNewDayTitle('');
    setIsAddDayModalOpen(false);
    showToast(`✅ Created "${added?.title}" under ${currentWeekObj?.title}!`);
  };

  // Completeness stats for summary panel
  const hasPdf = Boolean(dayData?.pdf || (dayData?.pdfList && dayData?.pdfList.length > 0));
  const pdfCount = dayData?.pdfList?.length || (dayData?.pdf ? 1 : 0);
  const imagesCount = dayData?.images?.length || 0;
  const hasVideo = Boolean(dayData?.video);
  const flashcardCount = dayData?.flashcards?.length || 0;
  const hasLive = Boolean(dayData?.live?.hasSession);

  // Overview Matrix data
  const matrixDays = contentService.getCurriculumOverview(selectedExam, selectedWeek);

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold shadow-xs transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        
        {/* Header Bar with View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
              <span>Direct Student Bridge (Phase 5.4)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Day-Wise Content Management & Uploads
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rule 5 Enforced: Content follows strict hierarchy (<strong>Exam → Week → Day → Content Type</strong>). Whatever is published here is what students unlock in their Day Content View.
            </p>
          </div>

          {/* View Mode Toggle: Day Editor vs Overview Matrix */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => setActiveViewMode('editor')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeViewMode === 'editor' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Day Upload Editor
            </button>
            <button
              onClick={() => setActiveViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeViewMode === 'matrix' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Curriculum Overview Matrix
            </button>
          </div>
        </div>

        {/* STEP-BY-STEP HIERARCHY SELECTOR (RULE 5) */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Step-by-Step Curriculum Hierarchy (Strict Rule 5)</span>
            </span>
            <div className="flex items-center gap-2">
              {isFaculty && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Faculty Scoped
                </span>
              )}
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Rule 5: Exam → Week → Day
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* 1. Exam Track (Auto-Scoped for Faculty) */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 text-xs flex items-center justify-between">
                <span>1. Select Exam Track *</span>
                {isFaculty && <span className="text-[10px] text-emerald-600 font-bold">Scoped</span>}
              </label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="" disabled>-- Select Exam Track --</option>
                {availableExams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.flag} {exam.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Select Week */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 text-xs">2. Select Week *</label>
                <button
                  type="button"
                  onClick={() => setIsAddWeekModalOpen(true)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Week</span>
                </button>
              </div>
              <select
                value={selectedWeek}
                disabled={!selectedExam}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border font-bold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  selectedExam 
                    ? 'border-slate-200 text-slate-900 bg-white' 
                    : 'border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed'
                }`}
              >
                <option value="" disabled>-- Select Week --</option>
                {curriculum.weeks.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Select Day */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 text-xs">3. Select Day *</label>
                <button
                  type="button"
                  onClick={() => setIsAddDayModalOpen(true)}
                  disabled={!selectedWeek}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Day</span>
                </button>
              </div>
              <select
                value={selectedDay}
                disabled={!selectedWeek}
                onChange={(e) => setSelectedDay(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border font-black text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  selectedWeek 
                    ? 'border-indigo-300 text-indigo-950 bg-white ring-1 ring-indigo-500/20' 
                    : 'border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed'
                }`}
              >
                <option value="" disabled>-- Select Day --</option>
                {currentWeekObj?.days.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* ===================================================================== */}
        {/* VIEW 1: DAY UPLOAD EDITOR (MAIN CMS WORKSPACE)                         */}
        {/* ===================================================================== */}
        {activeViewMode === 'editor' && (
          <div className="relative">
            
            {/* Disabled Overlay if Hierarchy is not fully selected */}
            {!isHierarchySelected && (
              <div className="mb-6 p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Upload Panel Locked by Hierarchy (Rule 5)</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Please select <strong>Exam → Week → Day</strong> using the step-by-step selector above to activate content upload sections.
                </p>
              </div>
            )}

            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 items-start ${!isHierarchySelected ? 'opacity-40 pointer-events-none select-none' : ''}`}>
              
              {/* Left 2 Columns: 4 Independent Upload Panels */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* ------------------------------------------------------------- */}
                {/* PANEL 1: PDF NOTES SECTION                                    */}
                {/* ------------------------------------------------------------- */}
                <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">1. PDF Clinical Notes</h3>
                        <p className="text-[11px] text-slate-400">High-yield annotated PDF summaries for mobile & web viewing</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {pdfCount} Published
                    </span>
                  </div>

                  <form onSubmit={handleUploadPdf} className="space-y-3 text-xs">
                    {/* Drag-and-drop dummy box */}
                    <div 
                      onClick={() => showToast('PDF file selected: Cardiology_High_Yield_Notes.pdf (4.8 MB)')}
                      className="p-4 border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/20 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all text-center"
                    >
                      <UploadCloud className="w-6 h-6 text-slate-400" />
                      <span className="font-bold text-slate-700">Click or drag & drop PDF notes file here</span>
                      <span className="text-[10px] text-slate-400">Max file size: 50 MB • Formats: .pdf</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="font-bold text-slate-700">Document Title *</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. Arrhythmias & ECG Clinical Pearls"
                          value={pdfTitle}
                          onChange={(e) => setPdfTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Page Count</label>
                        <input 
                          type="number"
                          value={pdfPages}
                          onChange={(e) => setPdfPages(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload & Publish PDF</span>
                    </button>
                  </form>

                  {/* List of already uploaded PDFs */}
                  {dayData?.pdfList && dayData.pdfList.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Published Notes for Day {selectedDay}:
                      </span>
                      {dayData.pdfList.map((pdf, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <div>
                              <div className="font-bold text-slate-900">{pdf.title}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {pdf.fileName} • {pdf.pages} Pages • {pdf.size}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setPreviewPdfModal(pdf)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="Preview Document"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePdf(pdf.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remove PDF"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* PANEL 2: IMAGES SECTION                                       */}
                {/* ------------------------------------------------------------- */}
                <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">2. Clinical Diagrams & ECG Strips</h3>
                        <p className="text-[11px] text-slate-400">High-resolution anatomical schematics, ECGs, and histology slides</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {imagesCount} Diagrams
                    </span>
                  </div>

                  <form onSubmit={handleUploadImage} className="space-y-3 text-xs">
                    <div 
                      onClick={() => showToast('Image file selected: ecg_rhythm_strip_03.png (1920x1080)')}
                      className="p-3 border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/20 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                      <span className="font-bold text-slate-700">Click to upload ECG or Clinical Illustration</span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Caption & Diagnostic Pearl</label>
                      <input 
                        type="text"
                        placeholder="e.g. Fig 1: Ventricular Tachycardia with AV dissociation and capture beats"
                        value={imageCaption}
                        onChange={(e) => setImageCaption(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload Image Asset</span>
                    </button>
                  </form>

                  {/* Thumbnails grid with Preview & Delete */}
                  {dayData?.images && dayData.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
                      {dayData.images.map((img) => (
                        <div key={img.id} className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                          <img 
                            src={img.url} 
                            alt={img.title} 
                            className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => setPreviewImage(img)}
                          />
                          <div className="p-2 text-[10px] space-y-0.5">
                            <div className="font-bold text-slate-800 line-clamp-1">{img.title}</div>
                            <div className="text-slate-400 line-clamp-1">{img.caption}</div>
                          </div>
                          <button
                            onClick={() => handleDeleteImage(img.id)}
                            className="absolute top-1.5 right-1.5 p-1 rounded-md bg-white/90 text-rose-600 hover:bg-rose-50 shadow-xs cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* PANEL 3: VIDEO MASTERCLASS SECTION                            */}
                {/* ------------------------------------------------------------- */}
                <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <Film className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">3. Video Lecture Masterclass</h3>
                        <p className="text-[11px] text-slate-400">Streamed video lesson with dynamic chapter bookmarks</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      hasVideo ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {hasVideo ? '1 Active Stream' : 'No Video'}
                    </span>
                  </div>

                  <form onSubmit={handleSaveVideo} className="space-y-3 text-xs">
                    {/* Toggle between Link and File */}
                    <div className="flex items-center gap-2 pb-1">
                      <button
                        type="button"
                        onClick={() => setVideoMode('link')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          videoMode === 'link' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Paste Video Link (YouTube / Vimeo / CDN)
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoMode('file')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          videoMode === 'file' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Upload Video File (.mp4)
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="font-bold text-slate-700">Lesson Title *</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. Dynamic Auscultation & Clinical Murmurs"
                          value={videoTitle}
                          onChange={(e) => setVideoTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Duration</label>
                        <input 
                          type="text"
                          value={videoDuration}
                          onChange={(e) => setVideoDuration(e.target.value)}
                          placeholder="e.g. 35 mins"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">
                        {videoMode === 'link' ? 'Video Stream URL / Embed Link' : 'Select Local Video File (.mp4 / .webm)'}
                      </label>
                      <div className="relative">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Publish Video Lesson</span>
                    </button>
                  </form>

                  {/* Currently live video banner */}
                  {dayData?.video && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs pt-2">
                      <div className="flex items-center gap-2.5">
                        <Video className="w-4 h-4 text-purple-600 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">{dayData.video.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Duration: {dayData.video.duration} • Instructor: {dayData.video.instructor}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleDeleteVideo}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove Video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* PANEL 4: FLASHCARDS DECK SECTION                              */}
                {/* ------------------------------------------------------------- */}
                <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">4. Active Recall Flashcards</h3>
                        <p className="text-[11px] text-slate-400">Anki-style Q&A flashcards for high-yield diagnostic retention</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      {flashcardCount} Active Cards
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Question / Clinical Clue *</label>
                      <textarea 
                        rows={2}
                        placeholder="e.g. Which maneuver uniquely INCREASES the murmur of HCM and MVP?"
                        value={cardQuestion}
                        onChange={(e) => setCardQuestion(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Answer / Diagnostic Rationale *</label>
                      <textarea 
                        rows={2}
                        placeholder="e.g. Valsalva maneuver (strain) and sudden standing from squatting position."
                        value={cardAnswer}
                        onChange={(e) => setCardAnswer(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <button
                        type="button"
                        onClick={handleQueueCard}
                        className="px-3.5 py-2 border border-slate-300 hover:bg-slate-100 font-bold rounded-xl text-slate-700 cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Another Flashcard</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveFlashcardSet}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <Brain className="w-3.5 h-3.5" />
                        <span>Save Flashcard Set</span>
                      </button>

                      {queuedCards.length > 0 && (
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                          {queuedCards.length} in queue ready to save
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Existing Flashcards Table Format */}
                  {dayData?.flashcards && dayData.flashcards.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Published Flashcard Set ({dayData.flashcards.length} cards total):
                        </span>
                      </div>
                      
                      <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold sticky top-0 border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3 w-1/2">Question</th>
                              <th className="py-2 px-3 w-1/2">Answer</th>
                              <th className="py-2 px-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {dayData.flashcards.map((card, idx) => (
                              <tr key={card.id || idx} className="hover:bg-slate-50/70">
                                <td className="py-2.5 px-3 font-bold text-slate-800 align-top">
                                  {card.question}
                                </td>
                                <td className="py-2.5 px-3 text-slate-600 align-top">
                                  {card.answer}
                                </td>
                                <td className="py-2.5 px-3 text-right align-top">
                                  <button
                                    onClick={() => handleDeleteFlashcard(card.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                    title="Delete card"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* ------------------------------------------------------------- */}
              {/* RIGHT COLUMN: DAY CONTENT SUMMARY PANEL (PART C)             */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-4 sticky top-20">
                
                <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-lg space-y-4">
                  
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Day Live Status Panel (Part C)</span>
                    </div>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                      Day {selectedDay || '—'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-white">
                      {dayData?.title || `Day ${selectedDay} Overview`}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Curriculum Track: {curriculum?.name}
                    </p>
                  </div>

                  {/* Real-time Status List */}
                  <div className="space-y-2.5 text-xs pt-1">
                    
                    {/* PDF */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-800">
                      <span className="flex items-center gap-2">
                        <FileText className={`w-3.5 h-3.5 ${hasPdf ? 'text-blue-400' : 'text-slate-500'}`} />
                        <span className={hasPdf ? 'text-slate-200' : 'text-slate-500'}>PDF Notes</span>
                      </span>
                      <span className={`font-bold text-[11px] ${hasPdf ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {hasPdf ? `✅ Active (${pdfCount} file)` : '❌ None'}
                      </span>
                    </div>

                    {/* Images */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-800">
                      <span className="flex items-center gap-2">
                        <ImageIcon className={`w-3.5 h-3.5 ${imagesCount > 0 ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span className={imagesCount > 0 ? 'text-slate-200' : 'text-slate-500'}>Images</span>
                      </span>
                      <span className={`font-bold text-[11px] ${imagesCount > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {imagesCount > 0 ? `✅ Active (${imagesCount} images)` : '❌ None'}
                      </span>
                    </div>

                    {/* Video */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-800">
                      <span className="flex items-center gap-2">
                        <Video className={`w-3.5 h-3.5 ${hasVideo ? 'text-purple-400' : 'text-slate-500'}`} />
                        <span className={hasVideo ? 'text-slate-200' : 'text-slate-500'}>Video</span>
                      </span>
                      <span className={`font-bold text-[11px] ${hasVideo ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {hasVideo ? `✅ Active (1 video, ${dayData.video?.duration})` : '❌ None'}
                      </span>
                    </div>

                    {/* Flashcards */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-800">
                      <span className="flex items-center gap-2">
                        <Brain className={`w-3.5 h-3.5 ${flashcardCount > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
                        <span className={flashcardCount > 0 ? 'text-slate-200' : 'text-slate-500'}>Flashcards</span>
                      </span>
                      <span className={`font-bold text-[11px] ${flashcardCount > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {flashcardCount > 0 ? `✅ Active (${flashcardCount} cards)` : '❌ None'}
                      </span>
                    </div>

                    {/* Live Session */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-800">
                      <span className="flex items-center gap-2">
                        <Radio className={`w-3.5 h-3.5 ${hasLive ? 'text-rose-400' : 'text-slate-500'}`} />
                        <span className={hasLive ? 'text-slate-200' : 'text-slate-500'}>Live Session</span>
                      </span>
                      <span className={`font-bold text-[11px] ${hasLive ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {hasLive ? '✅ Scheduled' : '❌ Not Scheduled'}
                      </span>
                    </div>

                  </div>

                  {/* Direct Preview Button (Phase 4 Bridge) */}
                  <Link
                    to={`/day-content/${selectedDay}?exam=${selectedExam}`}
                    target="_blank"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm block text-center"
                  >
                    <span>Preview in Student LMS (Phase 4)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                </div>

                {/* Quick Presentation Helper */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Presentation Cue:
                  </span>
                  <p className="text-amber-800 leading-relaxed">
                    "Notice how whatever is uploaded here immediately updates in the Day Live Status Panel. When a student opens Day {selectedDay}, these are the exact materials unlocked."
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 2: BULK OVERVIEW MATRIX (PART D)                                 */}
        {/* ===================================================================== */}
        {activeViewMode === 'matrix' && (
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Course Completeness Matrix — {currentWeekObj?.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Bird's-eye view of published learning materials across all days in this week.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                    <th className="py-3 px-4">Day</th>
                    <th className="py-3 px-4">Topic</th>
                    <th className="py-3 px-4 text-center">PDF</th>
                    <th className="py-3 px-4 text-center">Images</th>
                    <th className="py-3 px-4 text-center">Video</th>
                    <th className="py-3 px-4 text-center">Flashcards</th>
                    <th className="py-3 px-4 text-center">Live</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matrixDays.map((row) => (
                    <tr key={row.dayId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        Day {row.dayId}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {row.title}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-xs font-bold ${row.hasPdf ? 'text-emerald-600' : 'text-slate-300'}`}>
                          {row.hasPdf ? '✅' : '❌'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-xs font-bold ${row.hasImages ? 'text-emerald-600' : 'text-slate-300'}`}>
                          {row.hasImages ? '✅' : '❌'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-xs font-bold ${row.hasVideo ? 'text-emerald-600' : 'text-slate-300'}`}>
                          {row.hasVideo ? '✅' : '❌'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-xs font-bold ${row.hasFlashcards ? 'text-emerald-600' : 'text-slate-300'}`}>
                          {row.hasFlashcards ? '✅' : '❌'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-xs font-bold ${row.hasLive ? 'text-emerald-600' : 'text-slate-300'}`}>
                          {row.hasLive ? '✅' : '❌'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedDay(row.dayId);
                            setActiveViewMode('editor');
                          }}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors cursor-pointer text-xs"
                        >
                          Edit Day {row.dayId}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

      {/* MODAL 1: Lightbox Preview for Image Assets */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-slate-200 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-sm">{previewImage.title}</h4>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img 
              src={previewImage.url} 
              alt={previewImage.title} 
              className="w-full rounded-2xl border border-slate-200 max-h-96 object-contain bg-slate-900" 
            />
            <p className="text-xs text-slate-600 font-medium">
              {previewImage.caption}
            </p>
          </div>
        </div>
      )}

      {/* MODAL 2: Simulated PDF Reader Preview */}
      {previewPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{previewPdfModal.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {previewPdfModal.fileName} • {previewPdfModal.pages} Pages
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewPdfModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
              <BookOpen className="w-10 h-10 text-blue-500 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">Medical High-Yield PDF Document Preview</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Author: {previewPdfModal.author} • Document is ready and unlocked for enrolled students on Day {selectedDay}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: + Add New Week Modal */}
      {isAddWeekModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-sm">+ Add New Curriculum Week</h4>
              <button
                onClick={() => setIsAddWeekModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddWeekSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Week Title / Module Theme *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Week 4 — Respiratory & ICU Critical Care"
                  value={newWeekTitle}
                  onChange={(e) => setNewWeekTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddWeekModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Create Week
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: + Add New Day Modal */}
      {isAddDayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-sm">+ Add New Day to {currentWeekObj?.title}</h4>
              <button
                onClick={() => setIsAddDayModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddDaySubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Day Title / Clinical Topic *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Day 10 — Acute Pulmonary Embolism & Thrombolysis"
                  value={newDayTitle}
                  onChange={(e) => setNewDayTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDayModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Create Day
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

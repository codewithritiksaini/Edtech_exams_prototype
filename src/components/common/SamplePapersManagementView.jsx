import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  FileCheck, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Eye, 
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  BookOpen, 
  FolderTree, 
  Award, 
  HelpCircle, 
  UploadCloud, 
  X, 
  Sparkles, 
  GraduationCap, 
  ShieldCheck, 
  LayoutGrid, 
  Table as TableIcon,
  ExternalLink
} from 'lucide-react';
import { samplePaperService } from '../../services/samplePaperService';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';
import { peopleService } from '../../services/peopleService';
import { authService } from '../../services/authService';

export default function SamplePapersManagementView({ mode = 'admin' }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isFaculty = mode === 'faculty';
  const currentFaculty = isFaculty ? peopleService.getCurrentFacultyProfile() : null;
  const facultyAssignedExams = currentFaculty?.assignedExams || [];
  const facultyAssignedSubjects = currentFaculty?.assignedSubjects || [];

  // All catalog exams
  const allExams = catalogService.getExams();
  // Filter available exams if faculty
  const availableExams = isFaculty && facultyAssignedExams.length > 0
    ? allExams.filter(e => facultyAssignedExams.includes(e.id))
    : allExams;

  // Filter States
  const paramExamId = searchParams.get('examId');
  const paramSubjectId = searchParams.get('subjectId');
  const paramChapterId = searchParams.get('chapterId');

  const defaultExamId = paramExamId || (availableExams.length > 0 ? availableExams[0].id : 'all');
  const [selectedExamId, setSelectedExamId] = useState(defaultExamId);
  const [selectedSubjectId, setSelectedSubjectId] = useState(paramSubjectId || 'all');
  const [selectedChapterId, setSelectedChapterId] = useState(paramChapterId || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [toastMessage, setToastMessage] = useState('');

  // Sample Papers list state
  const [samplePapers, setSamplePapers] = useState(() => 
    samplePaperService.getSamplePapers({ role: isFaculty ? 'faculty' : 'admin' })
  );

  // Modal / Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState(null);
  const [deletingPaper, setDeletingPaper] = useState(null);
  const [viewingPaper, setViewingPaper] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  // Prevent background scrolling when viewing full-page PDF
  useEffect(() => {
    if (viewingPaper) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [viewingPaper]);

  // Form Fields
  const [formExamId, setFormExamId] = useState(availableExams.length > 0 ? availableExams[0].id : 'neet-pg');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formChapterId, setFormChapterId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFileName, setFormFileName] = useState('');
  const [formFileSize, setFormFileSize] = useState('');
  const [formPageCount, setFormPageCount] = useState(15);
  const [formTotalMarks, setFormTotalMarks] = useState(100);
  const [formQuestionsCount, setFormQuestionsCount] = useState(25);
  const [formDurationMinutes, setFormDurationMinutes] = useState(45);
  const [formStatus, setFormStatus] = useState('Published');

  const pdfFileInputRef = useRef(null);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const handlePdfFileSelect = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a valid PDF document (.pdf)');
      return;
    }
    setFormFileName(file.name);
    setFormFileSize(formatFileSize(file.size));
    if (!formTitle.trim()) {
      const cleanName = file.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');
      setFormTitle(cleanName);
    }
  };

  // Sync papers on reactive updates
  useEffect(() => {
    const unsub = samplePaperService.subscribe(() => {
      setSamplePapers(samplePaperService.getSamplePapers({ role: isFaculty ? 'faculty' : 'admin' }));
    });
    return unsub;
  }, [isFaculty]);

  // Derived available subjects for the selected exam in the filter
  const filterAvailableSubjects = (() => {
    const subs = curriculumService.getSubjects(selectedExamId !== 'all' ? selectedExamId : null);
    if (isFaculty && facultyAssignedSubjects.length > 0) {
      return subs.filter(s => facultyAssignedSubjects.includes(s.id));
    }
    return subs;
  })();

  // Derived available chapters for the selected subject in the filter
  const filterAvailableChapters = (() => {
    if (selectedSubjectId === 'all') return [];
    return curriculumService.getChapters(selectedSubjectId, selectedExamId !== 'all' ? selectedExamId : null);
  })();

  // Form Cascading Options
  const formSubjects = (() => {
    const subs = curriculumService.getSubjects(formExamId);
    if (isFaculty && facultyAssignedSubjects.length > 0) {
      return subs.filter(s => facultyAssignedSubjects.includes(s.id));
    }
    return subs;
  })();

  const formChapters = (() => {
    if (!formSubjectId) return [];
    return curriculumService.getChapters(formSubjectId, formExamId);
  })();

  // Automatically update form cascading defaults when formExamId changes
  useEffect(() => {
    if (formSubjects.length > 0) {
      if (!formSubjects.some(s => s.id === formSubjectId)) {
        setFormSubjectId(formSubjects[0].id);
      }
    } else {
      setFormSubjectId('');
    }
  }, [formExamId]);

  // Automatically update form chapter default when formSubjectId changes
  useEffect(() => {
    if (formChapters.length > 0) {
      if (!formChapters.some(c => c.id === formChapterId)) {
        setFormChapterId(formChapters[0].id);
      }
    } else {
      setFormChapterId('');
    }
  }, [formSubjectId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleOpenCreateDrawer = (presetChapterId = null) => {
    setEditingPaper(null);
    const initialExam = availableExams.length > 0 ? availableExams[0].id : 'neet-pg';
    setFormExamId(initialExam);

    const initialSubs = curriculumService.getSubjects(initialExam);
    const validSubs = isFaculty && facultyAssignedSubjects.length > 0
      ? initialSubs.filter(s => facultyAssignedSubjects.includes(s.id))
      : initialSubs;
    
    const initialSubId = validSubs.length > 0 ? validSubs[0].id : '';
    setFormSubjectId(initialSubId);

    const initialChaps = initialSubId ? curriculumService.getChapters(initialSubId, initialExam) : [];
    const targetChapId = presetChapterId || (initialChaps.length > 0 ? initialChaps[0].id : '');
    setFormChapterId(targetChapId);

    setFormTitle('');
    setFormDescription('');
    setFormFileName('');
    setFormFileSize('');
    setFormPageCount(15);
    setFormTotalMarks(100);
    setFormQuestionsCount(25);
    setFormDurationMinutes(45);
    setFormStatus('Published');
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (paper) => {
    setEditingPaper(paper);
    setFormExamId(paper.examId);
    setFormSubjectId(paper.subjectId);
    setFormChapterId(paper.chapterId);
    setFormTitle(paper.title);
    setFormDescription(paper.description || '');
    setFormFileName(paper.fileName);
    setFormFileSize(paper.fileSize || '2.8 MB');
    setFormPageCount(paper.pageCount || 14);
    setFormTotalMarks(paper.totalMarks || 100);
    setFormQuestionsCount(paper.questionsCount || 25);
    setFormDurationMinutes(paper.durationMinutes || 45);
    setFormStatus(paper.status || 'Published');
    setIsDrawerOpen(true);
  };

  const handleSavePaper = (e) => {
    e.preventDefault();
    if (!formChapterId) {
      alert('Please select a target Chapter for this sample paper.');
      return;
    }
    if (!formFileName.trim()) {
      alert('Please upload a Question Paper PDF file.');
      return;
    }

    const chap = curriculumService.getChapterById(formChapterId);
    const sub = curriculumService.getSubjectById(formSubjectId);

    const currentUser = authService.getCurrentUser();
    const currentFacultyProfile = isFaculty ? peopleService.getCurrentFacultyProfile() : null;
    const uploaderName = isFaculty
      ? (currentFacultyProfile?.name || currentUser?.name || 'Faculty Specialist')
      : 'Academic Editorial Board';
    const uploaderEmail = isFaculty
      ? (currentFacultyProfile?.email || currentUser?.email || 'faculty@demo.com')
      : (currentUser?.email || 'admin@demo.com');
    const uploaderId = isFaculty
      ? (currentFacultyProfile?.id || currentUser?.id || 'fac-1')
      : (currentUser?.id || 'admin-1');

    const paperData = {
      ...(editingPaper || {}),
      examId: formExamId,
      subjectId: formSubjectId,
      chapterId: formChapterId,
      title: formTitle.trim() || `${chap?.title || 'Chapter'} Comprehensive Practice Paper`,
      description: formDescription.trim(),
      fileName: formFileName.trim() || 'Medical_Sample_Paper.pdf',
      fileSize: formFileSize,
      pageCount: Number(formPageCount) || 12,
      totalMarks: Number(formTotalMarks) || 100,
      questionsCount: Number(formQuestionsCount) || 25,
      durationMinutes: Number(formDurationMinutes) || 45,
      difficulty: 'Standard',
      hasAnswerKey: false,
      answerKeyFileName: '',
      answerKeyFileSize: '',
      uploadedByRole: isFaculty ? 'faculty' : 'admin',
      uploadedByName: uploaderName,
      uploadedByEmail: uploaderEmail,
      uploadedById: uploaderId,
      facultyId: isFaculty ? uploaderId : (editingPaper?.facultyId || null),
      status: formStatus
    };

    samplePaperService.saveSamplePaper(paperData);
    setSamplePapers(samplePaperService.getSamplePapers({ role: isFaculty ? 'faculty' : 'admin' }));
    setIsDrawerOpen(false);
    showToast(editingPaper ? 'Sample Paper updated successfully!' : 'New Sample Paper published for this chapter!');
  };

  const handleDeletePaper = (paperId) => {
    samplePaperService.deleteSamplePaper(paperId);
    setSamplePapers(samplePaperService.getSamplePapers({ role: isFaculty ? 'faculty' : 'admin' }));
    setDeletingPaper(null);
    showToast('Sample Paper removed.');
  };

  // Filtered List for Display
  const filteredPapers = samplePapers.filter(paper => {
    // If faculty, strictly ensure this paper belongs to current faculty
    if (isFaculty) {
      if (paper.uploadedByRole === 'admin') return false;

      const fEmail = (currentFaculty?.email || 'faculty@demo.com').toLowerCase().trim();
      const fId = currentFaculty?.id || 'fac-1';
      const fName = (currentFaculty?.name || '').toLowerCase().trim();

      const pEmail = (paper.uploadedByEmail || '').toLowerCase().trim();
      const pId = paper.facultyId || paper.uploadedById;
      const pName = (paper.uploadedByName || '').toLowerCase().trim();

      const isMine = (fEmail && pEmail === fEmail) ||
                     (fId && pId === fId) ||
                     (fName && pName && (pName === fName || pName.includes(fName) || fName.includes(pName)));
      if (!isMine) return false;
    }

    if (selectedExamId !== 'all' && paper.examId !== selectedExamId) return false;
    if (selectedSubjectId !== 'all' && paper.subjectId !== selectedSubjectId) return false;
    if (selectedChapterId !== 'all' && paper.chapterId !== selectedChapterId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = paper.title.toLowerCase().includes(q);
      const matchDesc = paper.description && paper.description.toLowerCase().includes(q);
      const matchFile = paper.fileName.toLowerCase().includes(q);
      const chap = curriculumService.getChapterById(paper.chapterId);
      const matchChap = chap?.title?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchFile && !matchChap) return false;
    }
    return true;
  });

  const stats = samplePaperService.getStats(samplePapers);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-3 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isFaculty ? 'Faculty Authoring Studio' : 'Academic Content Management'}
            </span>
            <span className="text-slate-300">•</span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              isFaculty 
                ? 'text-indigo-700 bg-indigo-50 border-indigo-200' 
                : 'text-purple-700 bg-purple-50 border-purple-200'
            }`}>
              {isFaculty ? 'Assigned Courses & Chapters' : 'Platform-Wide Repository'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FileCheck className="w-7 h-7 text-indigo-600" />
            <span>Chapter Sample Papers & PDFs</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            {isFaculty 
              ? 'Upload, manage, and release chapter-specific practice PDFs and mock tests under your authorized teaching subjects.'
              : 'Upload and configure chapter-level sample question papers and explanatory solutions across all exam tracks and subjects.'}
          </p>

          {isFaculty && (
            <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-bold bg-indigo-50/60 px-3 py-1.5 rounded-xl border border-indigo-100/80 w-fit">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>
                Faculty Scope: {currentFaculty?.name || 'Faculty Member'} • Only your sample papers are shown
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={() => handleOpenCreateDrawer()}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Sample Paper</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Total Sample Papers</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalPapers}</div>
          <div className="text-[10px] text-slate-500 font-medium">Single or multiple per chapter</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Chapters Covered</span>
            <FolderTree className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.chaptersCovered}</div>
          <div className="text-[10px] text-slate-500 font-medium">Mapped to curriculum units</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Practice Questions</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalQuestions}+</div>
          <div className="text-[10px] text-slate-500 font-medium">High-yield clinical MCQs</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Exam Track Filter */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Filter by Exam Track</label>
            <select
              value={selectedExamId}
              onChange={(e) => {
                setSelectedExamId(e.target.value);
                setSelectedSubjectId('all');
                setSelectedChapterId('all');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Available Tracks ({availableExams.length})</option>
              {availableExams.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.flag} {ex.name}</option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Filter by Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedChapterId('all');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Subjects ({filterAvailableSubjects.length})</option>
              {filterAvailableSubjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code || 'SUB'})</option>
              ))}
            </select>
          </div>

          {/* Chapter Filter */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Filter by Chapter</label>
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              disabled={selectedSubjectId === 'all'}
              className={`w-full px-3 py-2 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                selectedSubjectId === 'all'
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-slate-50 border border-slate-200 text-slate-900'
              }`}
            >
              <option value="all">
                {selectedSubjectId === 'all' ? 'Select a Subject first...' : `All Chapters in Subject (${filterAvailableChapters.length})`}
              </option>
              {filterAvailableChapters.map(chap => (
                <option key={chap.id} value={chap.id}>Ch {chap.chapterNumber || '•'}: {chap.title}</option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Search Papers</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search title, chapter, or PDF..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        {/* View Switcher & Active Filter Summary */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="font-bold text-slate-700">{filteredPapers.length}</span>
            <span>Sample Papers match current filters</span>
            {(selectedExamId !== 'all' || selectedSubjectId !== 'all' || selectedChapterId !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedExamId('all');
                  setSelectedSubjectId('all');
                  setSelectedChapterId('all');
                  setSearchQuery('');
                }}
                className="text-indigo-600 font-bold hover:underline ml-2 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Papers Content */}
      {filteredPapers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Sample Papers Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFaculty 
              ? 'No sample papers currently match your filter or search under your assigned subjects. Click the button below to upload the first sample paper for a chapter.'
              : 'No sample papers found for the selected criteria. Upload a PDF sample paper to get started.'}
          </p>
          <button
            onClick={() => handleOpenCreateDrawer()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Sample Paper</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPapers.map((paper) => {
            const chap = curriculumService.getChapterById(paper.chapterId);
            const sub = curriculumService.getSubjectById(paper.subjectId);
            const exam = catalogService.getExamById(paper.examId);
            const siblingPapers = samplePaperService.getSamplePapersByChapter(paper.chapterId, { role: isFaculty ? 'faculty' : null });

            return (
              <div
                key={paper.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Chapter Tag & Exam Flag */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center gap-1.5 truncate max-w-[200px]">
                      <FolderTree className="w-3 h-3 text-indigo-600 shrink-0" />
                      <span className="truncate">
                        Ch {chap?.chapterNumber || '•'}: {chap?.title || 'Chapter'}
                      </span>
                    </span>

                    <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1">
                      <span>{exam?.flag || '🩺'}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500">{exam?.name || paper.examId}</span>
                    </span>
                  </div>

                  {/* Subject and Multiple Papers Indicator */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-500 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400" />
                      <span>{sub?.name || 'Subject'}</span>
                    </span>
                    {siblingPapers.length > 1 && (
                      <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        {siblingPapers.length} Sample Papers in Chapter
                      </span>
                    )}
                  </div>

                  {/* Paper Title */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {paper.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {paper.description || 'Chapter clinical question paper with high-yield case vignettes.'}
                    </p>
                    {/* PDF Document Viewer Trigger Box */}
                    <div 
                      onClick={() => setViewingPaper(paper)}
                      className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between group hover:border-indigo-300 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-rose-600 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                          PDF
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors" title={paper.fileName}>
                            {paper.fileName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {paper.fileSize} • {paper.pageCount} Pages
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] font-bold text-slate-600 pt-1">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-indigo-600" />
                      <span>{paper.questionsCount} MCQs</span>
                    </span>
                  </div>
                </div>

                {/* Footer Bar: Uploader info & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-[10px] text-slate-400">
                    <div>Uploaded by <span className="font-bold text-slate-700">{paper.uploadedByName}</span></div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingPaper(paper)}
                      title="View Sample Paper PDF"
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditDrawer(paper)}
                      title="Edit Paper Scope & PDF"
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingPaper(paper)}
                      title="Delete Sample Paper"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3.5 px-4">Sample Paper Title</th>
                  <th className="py-3.5 px-4">Linked Chapter</th>
                  <th className="py-3.5 px-4">Exam Track & Subject</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPapers.map(paper => {
                  const chap = curriculumService.getChapterById(paper.chapterId);
                  const sub = curriculumService.getSubjectById(paper.subjectId);
                  const exam = catalogService.getExamById(paper.examId);

                  return (
                    <tr key={paper.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-black text-slate-900 text-xs">{paper.title}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{paper.description}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg text-[11px] inline-block">
                          Ch {chap?.chapterNumber || '•'}: {chap?.title || 'Chapter'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-bold text-slate-800">
                          <span>{exam?.flag}</span>
                          <span>{exam?.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{sub?.name}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => setViewingPaper(paper)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer transition-colors"
                          title="View Sample Paper PDF"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditDrawer(paper)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                          title="Edit Sample Paper"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingPaper(paper)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                          title="Delete Sample Paper"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* DRAWER: UPLOAD / EDIT CHAPTER SAMPLE PAPER                              */}
      {/* ======================================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
              
              {/* Sticky Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {editingPaper ? 'Edit Sample Paper' : 'Upload Chapter Sample Paper'}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {editingPaper ? `Edit "${editingPaper.title}"` : 'Chapter Practice Paper Studio'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSavePaper} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
                  
                  {/* Step 1: Cascading Hierarchy Selectors (Exam -> Subject -> Chapter) */}
                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/80 space-y-3">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                      <FolderTree className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Step 1: Link to Course, Subject & Chapter *</span>
                    </div>

                    {/* 1. Exam Track */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">1. Exam Track *</label>
                      <select
                        value={formExamId}
                        onChange={(e) => setFormExamId(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        {availableExams.map(ex => (
                          <option key={ex.id} value={ex.id}>{ex.flag} {ex.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Subject */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">2. Medical Subject Module *</label>
                      <select
                        value={formSubjectId}
                        onChange={(e) => setFormSubjectId(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        {formSubjects.length === 0 ? (
                          <option value="">No subjects available for this track</option>
                        ) : (
                          formSubjects.map(sub => (
                            <option key={sub.id} value={sub.id}>{sub.name} ({sub.code || 'SUB'})</option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* 3. Chapter (The Anchor!) */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800 flex items-center justify-between">
                        <span>3. Target Chapter Syllabus Anchor *</span>
                        <span className="text-[10px] text-indigo-600 font-extrabold">1 or multiple papers per chapter</span>
                      </label>
                      <select
                        value={formChapterId}
                        onChange={(e) => setFormChapterId(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white border-2 border-indigo-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        {formChapters.length === 0 ? (
                          <option value="">No chapters configured in this subject yet</option>
                        ) : (
                          formChapters.map(chap => (
                            <option key={chap.id} value={chap.id}>
                              Ch {chap.chapterNumber || '•'}: {chap.title}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Step 2: Paper Title & Description */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Sample Paper Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sample Paper 1: Valvular Pathology & Murmurs Sprint"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Instructions / Clinical Focus</label>
                      <textarea
                        rows={2}
                        placeholder="Brief summary of high-yield topics, formulas, or cases covered in this paper..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                      />
                    </div>
                  </div>

                  {/* Step 3: Real PDF Document Uploader Area */}
                  <div className="space-y-2 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <UploadCloud className="w-4 h-4 text-indigo-600" />
                        <span>Question Paper PDF File *</span>
                      </label>
                      {formFileName && (
                        <span className="text-[10px] text-slate-500 font-mono font-medium">{formFileSize}</span>
                      )}
                    </div>

                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      ref={pdfFileInputRef}
                      accept=".pdf,application/pdf"
                      onChange={(e) => handlePdfFileSelect(e.target.files?.[0])}
                      className="hidden"
                    />

                    {formFileName ? (
                      /* Selected PDF Card */
                      <div className="p-3.5 rounded-xl bg-white border border-indigo-200 shadow-xs flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-black text-[11px] shrink-0">
                            PDF
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-xs truncate max-w-[230px] sm:max-w-sm">
                              {formFileName}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>{formFileSize || 'PDF Document'}</span>
                              <span>•</span>
                              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Ready to upload
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => pdfFileInputRef.current?.click()}
                            className="px-2.5 py-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          >
                            Change PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormFileName('');
                              setFormFileSize('');
                              if (pdfFileInputRef.current) pdfFileInputRef.current.value = '';
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove PDF"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Drag & Drop / Click Upload Box */
                      <div
                        onClick={() => pdfFileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingPdf(true);
                        }}
                        onDragLeave={() => setIsDraggingPdf(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingPdf(false);
                          handlePdfFileSelect(e.dataTransfer.files?.[0]);
                        }}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                          isDraggingPdf
                            ? 'border-indigo-500 bg-indigo-50/60'
                            : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2.5">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-slate-800 text-xs">
                          Click to upload Question Paper PDF
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          or drag and drop file here (Supports .pdf)
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 4: Questions Count */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Practice Questions (MCQs)</label>
                    <input
                      type="number"
                      value={formQuestionsCount}
                      onChange={(e) => setFormQuestionsCount(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white"
                    />
                  </div>

                  {/* Document Status Selector */}
                  <div className="space-y-1.5 pt-1">
                    <label className="font-bold text-slate-700 text-xs block">Document Status</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormStatus('Published')}
                        className={`py-2 px-3 rounded-xl border font-bold text-xs text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                          formStatus === 'Published'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${formStatus === 'Published' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        <span>Published</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormStatus('Draft')}
                        className={`py-2 px-3 rounded-xl border font-bold text-xs text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                          formStatus === 'Draft'
                            ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${formStatus === 'Draft' ? 'bg-amber-500' : 'bg-slate-300'}`}></span>
                        <span>Draft</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Sticky Drawer Footer */}
                <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-white shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    {editingPaper ? 'Save Changes' : 'Publish Sample Paper'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                              */}
      {/* ======================================================================= */}
      {deletingPaper && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Remove Sample Paper?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{deletingPaper.title}"</span>? Students will no longer be able to access this practice PDF from the LMS.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingPaper(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePaper(deletingPaper.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                Delete Paper
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* FULL-PAGE INTERNAL PLATFORM PDF VIEWER (LIGHT THEME & NO TOP GAP)       */}
      {/* ======================================================================= */}
      {viewingPaper && typeof document !== 'undefined' && createPortal((() => {
        const chap = curriculumService.getChapterById(viewingPaper.chapterId);
        const sub = curriculumService.getSubjectById(viewingPaper.subjectId);
        const exam = catalogService.getExamById(viewingPaper.examId);
        const totalPages = viewingPaper.pageCount || 12;

        return (
          <div className="fixed top-0 left-0 right-0 bottom-0 inset-0 z-[99999] bg-slate-200/80 text-slate-900 flex flex-col h-screen w-screen m-0 p-0 overflow-hidden font-sans">
            {/* Top Navigation Header (Light Theme) */}
            <div className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 shadow-xs">
              {/* Left: Back button & Document Metadata */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setViewingPaper(null)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline">Back to Papers</span>
                </button>

                <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                    PDF
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-900 text-xs sm:text-sm truncate max-w-[220px] sm:max-w-md">
                      {viewingPaper.title}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-medium truncate hidden md:block">
                      {exam?.name} • {sub?.name} • Chapter {chap?.chapterNumber || '•'}: {chap?.title || 'Chapter'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Center: Viewer Toolbar (Page Nav & Zoom) */}
              <div className="flex items-center gap-2.5">
                {/* Page Navigation */}
                <div className="flex items-center bg-slate-100 rounded-xl px-2 py-1 text-xs border border-slate-200/80">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage <= 1}
                    className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-500 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 font-bold text-xs text-slate-700">
                    Page {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage >= totalPages}
                    className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-500 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="hidden sm:flex items-center bg-slate-100 rounded-xl px-2 py-1 text-xs border border-slate-200/80">
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
                    className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-1.5 font-bold text-xs text-slate-700 min-w-[42px] text-center">
                    {zoomLevel}%
                  </span>
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
                    className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right: Security Badge & Close Button */}
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Platform Secure Reader</span>
                </div>

                <button
                  onClick={() => setViewingPaper(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                  title="Close Document"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable PDF Document Canvas (Light Neutral Canvas) */}
            <div className="flex-1 bg-slate-200/70 overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
              {/* Scale Container */}
              <div 
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }} 
                className="w-full max-w-4xl transition-transform duration-150 flex flex-col gap-8 pb-20"
              >
                {/* Page 1: Official Question Paper Sheet */}
                <div className="bg-white text-slate-900 rounded-lg shadow-xl p-8 sm:p-14 border border-slate-200/90 relative select-none min-h-[1050px] flex flex-col justify-between">
                  {/* Subtle Diagonal Protection Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                    <div className="text-slate-900/[0.03] text-4xl sm:text-5xl font-black rotate-[-30deg] tracking-widest uppercase text-center px-6 leading-tight select-none">
                      Britannica Overseas<br />Protected Digital Syllabus Copy
                    </div>
                  </div>

                  <div>
                    {/* Official Exam Header */}
                    <div className="border-b-2 border-slate-900 pb-5 mb-6 text-center space-y-1 relative">
                      <div className="text-[11px] font-black uppercase tracking-widest text-indigo-700">
                        Britannica Overseas Medical Education System
                      </div>
                      <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                        {exam?.name} — {sub?.name}
                      </h1>
                      <div className="text-sm font-bold text-slate-700">
                        Unit Assessment: Chapter {chap?.chapterNumber || '•'} — {chap?.title || 'Chapter Practice'}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 pt-1">
                        {viewingPaper.title}
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 pt-3 border-t border-slate-200 mt-4">
                        <span>Total Questions: {viewingPaper.questionsCount} MCQs</span>
                        <span className="text-indigo-700 font-black">Chapter Practice Assessment</span>
                        <span>Document ID: {viewingPaper.id}</span>
                      </div>
                    </div>

                    {/* Candidate Instructions */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl mb-6 text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-800">Instructions:</strong> This chapter test contains high-yield questions based on standard clinical guidelines. Select the single best answer for each question. External references are strictly prohibited.
                    </div>

                    {/* Questions Section - Page 1 */}
                    <div className="space-y-6 text-xs text-slate-800">
                      {/* Q1 */}
                      <div className="space-y-2">
                        <p className="font-bold leading-relaxed text-slate-900 text-xs">
                          <span className="text-indigo-700 mr-1.5 font-black">Q1.</span>
                          A 62-year-old male with long-standing hypertension presents with progressive dyspnea on exertion and orthopnea. Transthoracic echocardiogram demonstrates concentric left ventricular hypertrophy with preserved ejection fraction (LVEF 55%). Tissue Doppler imaging reveals an E/e' ratio of 16. Which of the following is the most appropriate next step in long-term pharmacological management?
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(A)</strong> Digoxin and high-dose furosemide</div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(B)</strong> SGLT2 inhibitor and blood pressure optimization with ACEi/ARB</div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(C)</strong> Immediate surgical mitral valve repair</div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(D)</strong> Intravenous milrinone infusion</div>
                        </div>
                      </div>

                      {/* Q2 */}
                      <div className="space-y-2 pt-3 border-t border-slate-100">
                        <p className="font-bold leading-relaxed text-slate-900 text-xs">
                          <span className="text-indigo-700 mr-1.5 font-black">Q2.</span>
                          A 45-year-old female presents to the emergency room with sharp retrosternal chest pain that improves when leaning forward and worsens on inspiration. Electrocardiogram reveals diffuse ST-segment elevation with PR-segment depression across leads I, II, aVF, and V2-V6. What is the standard first-line treatment regimen?
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(A)</strong> High-dose NSAID (e.g., Ibuprofen or Aspirin) plus Colchicine</div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(B)</strong> Immediate percutaneous coronary intervention (PCI)</div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(C)</strong> Systemic thrombolysis with Tenecteplase</div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(D)</strong> Oral prednisone monotherapy at 1 mg/kg</div>
                        </div>
                      </div>

                      {/* Q3 */}
                      <div className="space-y-2 pt-3 border-t border-slate-100">
                        <p className="font-bold leading-relaxed text-slate-900 text-xs">
                          <span className="text-indigo-700 mr-1.5 font-black">Q3.</span>
                          During auscultation of a 28-year-old asymptomatic male undergoing a sports physical exam, a midsystolic click followed by a late systolic murmur is heard at the apex. The click moves earlier in systole during standing or Valsalva maneuver. What is the fundamental anatomical mechanism of this condition?
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(A)</strong> Myxomatous degeneration of the mitral valve leaflets</div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(B)</strong> Rupture of the anterolateral papillary muscle</div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(C)</strong> Fibrous calcification of the aortic annulus</div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(D)</strong> Congenital bicuspid aortic leaflet fusion</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sheet Footer */}
                  <div className="pt-6 border-t-2 border-slate-900 flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>Britannica Overseas LMS Protected Edition</span>
                    <span>Page 1 of {totalPages}</span>
                    <span>{viewingPaper.fileName}</span>
                  </div>
                </div>

                {/* Page 2: Continuation Sheet */}
                <div className="bg-white text-slate-900 rounded-lg shadow-xl p-8 sm:p-14 border border-slate-200/90 relative select-none min-h-[1050px] flex flex-col justify-between">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                    <div className="text-slate-900/[0.03] text-4xl sm:text-5xl font-black rotate-[-30deg] tracking-widest uppercase text-center px-6 leading-tight select-none">
                      Britannica Overseas<br />Protected Digital Syllabus Copy
                    </div>
                  </div>

                  <div>
                    {/* Header on Page 2 */}
                    <div className="border-b border-slate-300 pb-3 mb-6 flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>{exam?.name} • {viewingPaper.title}</span>
                      <span>Chapter {chap?.chapterNumber || '•'}: {chap?.title}</span>
                    </div>

                    {/* Questions Continued */}
                    <div className="space-y-6 text-xs text-slate-800">
                      {/* Q4 */}
                      <div className="space-y-2">
                        <p className="font-bold leading-relaxed text-slate-900 text-xs">
                          <span className="text-indigo-700 mr-1.5 font-black">Q4.</span>
                          A 34-year-old male with a history of intravenous drug use presents with high fever, new heart murmur, and splinter hemorrhages in the nail beds. Blood cultures yield Staphylococcus aureus. Transesophageal echocardiogram shows a 1.2 cm vegetation on the tricuspid valve. Which of the following pulmonary complications is most typical in this clinical scenario?
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(A)</strong> Septic pulmonary emboli with cavitary lesions</div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(B)</strong> Non-cardiogenic pulmonary edema with bilateral bat-wing infiltrates</div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(C)</strong> Pleural mesothelioma with parietal pleural thickening</div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(D)</strong> Primary spontaneous pneumothorax</div>
                        </div>
                      </div>

                      {/* Q5 */}
                      <div className="space-y-2 pt-3 border-t border-slate-100">
                        <p className="font-bold leading-relaxed text-slate-900 text-xs">
                          <span className="text-indigo-700 mr-1.5 font-black">Q5.</span>
                          A 53-year-old female presents with recurrent episodes of lightheadedness. 12-lead ECG shows sinus bradycardia at 38 bpm alternating with paroxysms of atrial fibrillation. Echocardiogram is unremarkable. What is the most definitive therapeutic intervention for this sinus node dysfunction?
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(A)</strong> Permanent dual-chamber pacemaker implantation</div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(B)</strong> Long-term oral amiodarone therapy</div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(C)</strong> High-dose beta-blocker titration</div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(D)</strong> Surgical maze procedure</div>
                        </div>
                      </div>

                      {/* Q6 */}
                      <div className="space-y-2 pt-3 border-t border-slate-100">
                        <p className="font-bold leading-relaxed text-slate-900 text-xs">
                          <span className="text-indigo-700 mr-1.5 font-black">Q6.</span>
                          Which pharmacological agent is contraindicated in a patient presenting with acute ST-elevation myocardial infarction complicated by right ventricular infarction (hypotension, clear lungs, elevated JVP)?
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(A)</strong> Nitroglycerin (Nitrates) and Diuretics</div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(B)</strong> Intravenous 0.9% normal saline bolus</div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(C)</strong> Aspirin and Ticagrelor loading dose</div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><strong>(D)</strong> Unfractionated heparin anticoagulation</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sheet Footer */}
                  <div className="pt-6 border-t-2 border-slate-900 flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>Britannica Overseas LMS Protected Edition</span>
                    <span>Page 2 of {totalPages}</span>
                    <span>{viewingPaper.fileName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })(), document.body)}

    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Brain, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  Clock,
  Layers,
  ArrowRight,
  BookOpen,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import { peopleService } from '../../services/peopleService';

export default function FacultyDirectUploadPage() {
  const currentFaculty = peopleService.getCurrentFacultyProfile();
  const facultyEmail = currentFaculty?.email || 'faculty@demo.com';

  // 1. Cascading Curriculum Hierarchy Selectors
  const [exams, setExams] = useState(() => catalogService.getExams());
  const [selectedExamId, setSelectedExamId] = useState('neet-pg');
  
  const subjects = useMemo(() => {
    return curriculumService.getFacultyAssignedSubjects(facultyEmail, selectedExamId);
  }, [facultyEmail, selectedExamId]);

  const [selectedSubjectId, setSelectedSubjectId] = useState(() => subjects[0]?.id || 'sub-neet-cardio');

  useEffect(() => {
    if (subjects.length > 0 && !subjects.some(s => s.id === selectedSubjectId)) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  const modules = useMemo(() => {
    return selectedSubjectId ? curriculumService.getModules(selectedSubjectId) : [];
  }, [selectedSubjectId]);

  const [selectedModuleId, setSelectedModuleId] = useState(() => modules[0]?.id || 'mod-neet-valvular');

  useEffect(() => {
    if (modules.length > 0 && !modules.some(m => m.id === selectedModuleId)) {
      setSelectedModuleId(modules[0].id);
    }
  }, [modules, selectedModuleId]);

  const lectures = useMemo(() => {
    return selectedModuleId ? curriculumService.getLecturesByModule(selectedModuleId) : [];
  }, [selectedModuleId]);

  const [selectedLectureId, setSelectedLectureId] = useState(() => lectures[0]?.id || 'lec-valvular-murmurs');

  useEffect(() => {
    if (lectures.length > 0 && !lectures.some(l => l.id === selectedLectureId)) {
      setSelectedLectureId(lectures[0].id);
    }
  }, [lectures, selectedLectureId]);

  // Selected canonical lecture entity
  const selectedLecture = useMemo(() => {
    return curriculumService.getLectureById(selectedLectureId);
  }, [selectedLectureId, lectures]);

  // Determine delivery schedule for the selected lecture
  const deliveryDays = useMemo(() => {
    if (!selectedLectureId) return [];
    const slots = curriculumService.getSchedule(selectedExamId);
    return slots.filter(s => 
      (s.deliveryItems && s.deliveryItems.some(i => i.type === 'lecture' && i.lectureId === selectedLectureId)) ||
      (s.lectureIds && s.lectureIds.includes(selectedLectureId))
    );
  }, [selectedLectureId, selectedExamId]);

  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');

  // Form states for content asset types
  const [pdfTitle, setPdfTitle] = useState('Clinical ECG Mastery: Arrhythmias & AV Blocks');
  const [pdfFile, setPdfFile] = useState('ECG_Mastery_Arrhythmias_2026.pdf');
  const [imageCaption, setImageCaption] = useState('Fig: Monomorphic VT with AV Dissociation & Extreme Right Axis');
  const [videoTitle, setVideoTitle] = useState('Wide Complex Tachycardias: Brugada vs Vereckei Criteria');
  const [videoLink, setVideoLink] = useState('https://vimeo.com/medpreppro/cardio-day03-wct');

  const [flashcardList, setFlashcardList] = useState([
    { question: 'Hallmark of AV dissociation in VT?', answer: 'Independent sinus P waves marching across wide QRS complexes with capture & fusion beats.' },
    { question: 'Class III antiarrhythmic mechanism of action?', answer: 'Blocks outward K+ channels, prolonging action potential duration & QT interval.' }
  ]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const showToast = (msg) => {
    setUploadSuccessMessage(msg);
    setTimeout(() => setUploadSuccessMessage(''), 4000);
  };

  // 1. Handle PDF Upload to Canonical Lecture
  const handleUploadPdf = () => {
    if (!selectedLecture) {
      showToast('Please select a curriculum lecture first.');
      return;
    }
    const newPdf = {
      id: `pdf-${Date.now()}`,
      fileName: pdfFile.trim() || 'Clinical_Study_Guide.pdf',
      title: pdfTitle.trim() || 'High-Yield Clinical Notes',
      pages: 22,
      size: '4.8 MB',
      updated: 'Just now',
      author: currentFaculty?.name || 'Specialist Lead'
    };

    const currentPdfs = selectedLecture.content?.pdfList || (selectedLecture.content?.pdf ? [selectedLecture.content.pdf] : []);
    const updatedLecture = {
      ...selectedLecture,
      content: {
        ...(selectedLecture.content || {}),
        pdfList: [newPdf, ...currentPdfs]
      }
    };
    curriculumService.saveLecture(updatedLecture);
    showToast(`✓ PDF Guide saved into canonical lecture "${selectedLecture.title}"!`);
  };

  // 2. Handle Diagram Upload to Canonical Lecture
  const handleUploadImage = () => {
    if (!selectedLecture) {
      showToast('Please select a curriculum lecture first.');
      return;
    }
    const newImg = {
      id: `img-${Date.now()}`,
      title: 'Diagnostic ECG / Clinical Specimen',
      url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
      caption: imageCaption.trim() || 'Clinical diagnostic specimen & ECG rhythm strip.'
    };

    const currentImgs = Array.isArray(selectedLecture.content?.images) ? selectedLecture.content.images : [];
    const updatedLecture = {
      ...selectedLecture,
      content: {
        ...(selectedLecture.content || {}),
        images: [newImg, ...currentImgs]
      }
    };
    curriculumService.saveLecture(updatedLecture);
    showToast(`✓ Clinical diagram saved into canonical lecture "${selectedLecture.title}"!`);
  };

  // 3. Handle Video Update to Canonical Lecture
  const handleUploadVideo = () => {
    if (!selectedLecture) {
      showToast('Please select a curriculum lecture first.');
      return;
    }
    const updatedVideo = {
      title: videoTitle.trim() || 'Clinical Masterclass Video',
      url: videoLink.trim() || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '45 mins',
      instructor: currentFaculty?.name || 'Faculty Specialist',
      thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80'
    };

    const updatedLecture = {
      ...selectedLecture,
      content: {
        ...(selectedLecture.content || {}),
        video: updatedVideo
      }
    };
    curriculumService.saveLecture(updatedLecture);
    showToast(`✓ Video masterclass saved into canonical lecture "${selectedLecture.title}"!`);
  };

  // 4. Handle Flashcards Update to Canonical Lecture
  const handleAddFlashcard = (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim() || !selectedLecture) return;
    const newCard = { id: `fc-${Date.now()}`, question: newQuestion.trim(), answer: newAnswer.trim() };
    const currentCards = Array.isArray(selectedLecture.content?.flashcards) ? selectedLecture.content.flashcards : [];
    
    const updatedLecture = {
      ...selectedLecture,
      content: {
        ...(selectedLecture.content || {}),
        flashcards: [...currentCards, newCard]
      }
    };
    curriculumService.saveLecture(updatedLecture);
    setFlashcardList(prev => [...prev, newCard]);
    setNewQuestion('');
    setNewAnswer('');
    showToast(`✓ Flashcard added to canonical lecture "${selectedLecture.title}"!`);
  };

  const handleDeleteFlashcard = (index) => {
    if (!selectedLecture) return;
    const currentCards = Array.isArray(selectedLecture.content?.flashcards) ? selectedLecture.content.flashcards : [];
    const updated = currentCards.filter((_, idx) => idx !== index);
    const updatedLecture = {
      ...selectedLecture,
      content: {
        ...(selectedLecture.content || {}),
        flashcards: updated
      }
    };
    curriculumService.saveLecture(updatedLecture);
    setFlashcardList(prev => prev.filter((_, idx) => idx !== index));
    showToast('Flashcard removed.');
  };

  const primaryDeliveryDay = deliveryDays[0]?.dayNumber || null;

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl">
      {/* Toast Feedback */}
      {uploadSuccessMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{uploadSuccessMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Rapid Operations
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Quick Content Import
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Rapid Lecture Content Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Import notes, clinical diagrams, video masterclasses, and flashcard recall decks directly into a canonical curriculum lecture. Changes persist into the curriculum hierarchy and automatically reflect across all delivery days.
          </p>
        </div>

        {/* Links */}
        <div className="shrink-0 flex items-center gap-2 flex-wrap">
          {primaryDeliveryDay && (
            <Link
              to={`/day/${primaryDeliveryDay}`}
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all"
            >
              <span>Preview Day {primaryDeliveryDay} in LMS</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

          {selectedLecture && (
            <Link
              to={`/faculty/exams/${selectedExamId}/subjects/${selectedSubjectId}/modules/${selectedModuleId}/lectures/${selectedLectureId}/content`}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all"
            >
              <span>Open in Content Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Cascading Selector Box: Exam -> Subject -> Module -> Canonical Lecture */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Step 1: Select Target Academic Lecture</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">1. Target Exam Track</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {ex.flag} {ex.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">2. Subject (Assigned)</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">3. Module</label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {modules.map(m => (
                <option key={m.id} value={m.id}>
                  Unit {m.moduleNumber}: {m.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">4. Canonical Lecture</label>
            <select
              value={selectedLectureId}
              onChange={(e) => setSelectedLectureId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {lectures.map(l => (
                <option key={l.id} value={l.id}>
                  Lec {l.lectureNumber}: {l.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Canonical Target Context Banner */}
        <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900">
                Target: {selectedLecture ? `"${selectedLecture.title}"` : 'No lecture selected'}
              </span>
              <span className="text-slate-400 mx-2">•</span>
              <span className="text-slate-600">
                {selectedLecture?.duration || '45 mins'} • {selectedLecture?.difficulty || 'High-Yield'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {deliveryDays.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Delivered on: {deliveryDays.map(d => `Day ${d.dayNumber}`).join(', ')}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Not Yet Scheduled in Delivery Plan</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid of 4 Upload Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: PDF Notes */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">1. High-Yield PDF Study Guide</h3>
              <p className="text-xs text-slate-500">Attach clinical revision guide to canonical lecture</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Document Title</label>
              <input
                type="text"
                value={pdfTitle}
                onChange={(e) => setPdfTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/60 space-y-1">
              <UploadCloud className="w-6 h-6 text-indigo-500 mx-auto" />
              <p className="font-bold text-slate-700">{pdfFile}</p>
              <p className="text-[11px] text-slate-400">PDF, DOCX up to 25MB</p>
            </div>

            <button
              onClick={handleUploadPdf}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
            >
              Save PDF to Canonical Lecture
            </button>
          </div>
        </div>

        {/* CARD 2: Clinical Diagrams & ECG */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">2. Clinical ECG & Anatomy Diagrams</h3>
              <p className="text-xs text-slate-500">High-resolution strips with lightbox zoom</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Clinical Caption & Diagnostic Pearl</label>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/60 space-y-1">
              <ImageIcon className="w-6 h-6 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-700">ECG_VT_FusionBeats_HighRes.png</p>
              <p className="text-[11px] text-slate-400">PNG, JPG, DICOM up to 20MB</p>
            </div>

            <button
              onClick={handleUploadImage}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
            >
              Save Diagram to Canonical Lecture
            </button>
          </div>
        </div>

        {/* CARD 3: Video Lecture */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">3. Video Lecture Masterclass</h3>
              <p className="text-xs text-slate-500">High-definition stream URL</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Lecture Video Title</label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Stream URL (YouTube / Vimeo / Cloudflare)</label>
              <input
                type="text"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium font-mono text-[11px]"
              />
            </div>

            <button
              onClick={handleUploadVideo}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm shadow-blue-600/20 cursor-pointer"
            >
              Save Video to Canonical Lecture
            </button>
          </div>
        </div>

        {/* CARD 4: Flashcard Decks */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">4. Active Recall Flashcards</h3>
              <p className="text-xs text-slate-500">Spaced repetition question & answer cards</p>
            </div>
          </div>

          <form onSubmit={handleAddFlashcard} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Question / Prompt</label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="e.g. Mechanism of action of Ivabradine?"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Answer / Explanation</label>
              <textarea
                rows={2}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="e.g. Selective inhibition of funny channels (If) in the SA node."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-sm shadow-amber-600/20 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Card to Canonical Lecture</span>
            </button>
          </form>

          {/* Flashcards List */}
          {flashcardList.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100 max-h-36 overflow-y-auto">
              {flashcardList.map((card, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800 line-clamp-1">Q: {card.question}</p>
                    <p className="text-slate-500 text-[11px] line-clamp-1">A: {card.answer}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteFlashcard(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

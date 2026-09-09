import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';

export default function FacultyDirectUploadPage() {
  const [selectedCourse, setSelectedCourse] = useState('neet-pg');
  const [selectedWeek, setSelectedWeek] = useState('1');
  const [selectedDay, setSelectedDay] = useState('3');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');

  // Form states
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

  const handleTriggerUpload = (type) => {
    setUploadSuccessMessage(`Successfully updated ${type} for Day ${selectedDay} (Week ${selectedWeek})!`);
    setTimeout(() => setUploadSuccessMessage(''), 4000);
  };

  const handleAddFlashcard = (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setFlashcardList(prev => [...prev, { question: newQuestion.trim(), answer: newAnswer.trim() }]);
    setNewQuestion('');
    setNewAnswer('');
    handleTriggerUpload('Active Recall Flashcards');
  };

  const handleDeleteFlashcard = (index) => {
    setFlashcardList(prev => prev.filter((_, idx) => idx !== index));
    handleTriggerUpload('Active Recall Flashcards');
  };

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
              Direct Multi-Step Uploader
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Direct Curriculum Content Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Quickly upload notes, clinical diagrams, video masterclasses, and flashcard recall decks mapped directly into a specific study calendar day.
          </p>
        </div>

        {/* View on LMS */}
        <div className="shrink-0">
          <Link
            to={`/day/${selectedDay}`}
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all"
          >
            <span>Preview Day {selectedDay} in LMS</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Cascading Selector Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Step 1: Select Target Course, Week & Calendar Day</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">1. Target Exam Track</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="neet-pg">🇮🇳 NEET PG & NExT 2026</option>
              <option value="usmle">🇺🇸 USMLE Step 1 & 2 CK</option>
              <option value="plab">🇬🇧 PLAB 1 & 2 / UKMLA</option>
              <option value="europe">🇪🇺 Europe Medical Licensing</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">2. Curriculum Week</label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="1">Week 1: Cardiology & Hemodynamics</option>
              <option value="2">Week 2: Respiratory & Pulmonology</option>
              <option value="3">Week 3: Renal & Acid-Base Balance</option>
              <option value="4">Week 4: Gastroenterology & Liver</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">3. Calendar Day Slot</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="1">Day 1 — Valvular Heart Diseases & Murmurs</option>
              <option value="2">Day 2 — Heart Failure & Pharmacotherapy</option>
              <option value="3">Day 3 — Cardiac Arrhythmias & ECG</option>
              <option value="4">Day 4 — Acute Coronary Syndromes</option>
              <option value="5">Day 5 — Congenital Heart Defects</option>
              <option value="6">Day 6 — Active Recall Flashcards Sprint</option>
              <option value="7">Day 7 — Subject Grand Mock Test</option>
            </select>
          </div>
        </div>

        {/* Selected Day Status Bar */}
        <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-900">
              Active Target: Week {selectedWeek} • Day {selectedDay} (Clinical Arrhythmias & ECG)
            </span>
          </div>
          <span className="text-slate-500 font-medium">
            Published Live to 1,420 Enrolled Candidates
          </span>
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
              <p className="text-xs text-slate-500">Revision notes with clinical guidelines</p>
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
              onClick={() => handleTriggerUpload('PDF Notes')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm shadow-indigo-600/20"
            >
              Update PDF Notes
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
              onClick={() => handleTriggerUpload('Clinical ECG Strip')}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm shadow-emerald-600/20"
            >
              Update Diagram
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
              <h3 className="text-sm font-bold text-slate-900">3. Video Lecture URL</h3>
              <p className="text-xs text-slate-500">Vimeo or YouTube high-definition stream</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Lecture Topic Title</label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Embed Stream URL</label>
              <input
                type="url"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <button
              onClick={() => handleTriggerUpload('Video Lecture')}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm shadow-blue-600/20"
            >
              Update Video Stream
            </button>
          </div>
        </div>

        {/* CARD 4: Active Recall Flashcards */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">4. Active Recall Cards ({flashcardList.length})</h3>
                <p className="text-xs text-slate-500">Spaced repetition question & answer pairs</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleAddFlashcard} className="space-y-2 text-xs">
            <input
              type="text"
              placeholder="Question / Cue..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
            <input
              type="text"
              placeholder="Answer / Guideline pearl..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Card</span>
            </button>
          </form>

          {/* Existing flashcards list */}
          <div className="space-y-2 max-h-36 overflow-y-auto">
            {flashcardList.map((card, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 line-clamp-1">Q: {card.question}</div>
                  <div className="text-slate-500 line-clamp-1">A: {card.answer}</div>
                </div>
                <button
                  onClick={() => handleDeleteFlashcard(idx)}
                  className="text-slate-400 hover:text-rose-600 p-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

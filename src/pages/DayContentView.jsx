import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Brain, 
  Radio, 
  Download, 
  Maximize2, 
  Play, 
  Pause, 
  RotateCw, 
  Volume2, 
  Lock, 
  Sparkles, 
  Clock, 
  Check, 
  HelpCircle, 
  Bookmark, 
  Save, 
  Maximize, 
  ExternalLink,
  Info
} from 'lucide-react';
import DashboardNavbar from '../components/DashboardNavbar';
import DashboardSidebar from '../components/DashboardSidebar';
import ImageLightboxModal from '../components/ImageLightboxModal';
import AskDoubtModal from '../components/AskDoubtModal';
import LiveSessionModal from '../components/LiveSessionModal';
import { dayContentStore } from '../data/mockData';

export default function DayContentView() {
  const { dayId = '3' } = useParams();
  const navigate = useNavigate();

  // Load day data from store or fallback to Day 3
  const currentDayData = dayContentStore[dayId] || dayContentStore['3'];

  // Tab state - default to first available active tab
  const [activeTab, setActiveTab] = useState(
    currentDayData.activeTabs.includes('notes') 
      ? 'notes' 
      : currentDayData.activeTabs[0]
  );

  // When dayId changes, make sure activeTab is an allowed tab
  useEffect(() => {
    if (!currentDayData.activeTabs.includes(activeTab)) {
      setActiveTab(currentDayData.activeTabs[0] || 'notes');
    }
    setFlashcardFlipped(false);
    setCurrentFlashcardIndex(0);
  }, [dayId, currentDayData]);

  // UI Micro-states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x');
  
  // Flashcards state
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  // Modals state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxActiveIndex, setLightboxActiveIndex] = useState(0);
  const [doubtModalOpen, setDoubtModalOpen] = useState(false);
  const [liveModalOpen, setLiveModalOpen] = useState(false);
  const [fullscreenPdfOpen, setFullscreenPdfOpen] = useState(false);

  // Personal Notes state
  const [studentNotes, setStudentNotes] = useState(
    'Key takeaway: Always assess hemodynamics first in wide QRS tachycardia. If unstable -> synchronized cardioversion. If stable -> Brugada criteria algorithm.'
  );
  const [notesSaved, setNotesSaved] = useState(false);

  const handleSaveNotes = () => {
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  // Inter-day navigation
  const currentNum = parseInt(dayId, 10) || 3;
  const prevDayNum = currentNum > 1 ? currentNum - 1 : null;
  const nextDayNum = currentNum < 4 ? currentNum + 1 : null;

  const handleOpenLightbox = (index) => {
    setLightboxActiveIndex(index);
    setLightboxOpen(true);
  };

  // Flashcards navigation
  const flashcardsList = currentDayData.flashcards || [];
  const currentCard = flashcardsList[currentFlashcardIndex] || {
    question: 'No active recall flashcards assigned for this day.',
    answer: 'Complete the core video lecture and PDF notes first.'
  };

  const handleNextFlashcard = () => {
    if (currentFlashcardIndex < flashcardsList.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
      setFlashcardFlipped(false);
    }
  };

  const handlePrevFlashcard = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(currentFlashcardIndex - 1);
      setFlashcardFlipped(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* 1. Top Navbar (Logged-in version) */}
      <DashboardNavbar 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-grow flex">
        
        {/* Persistent Left Sidebar */}
        <DashboardSidebar 
          activeTab="plan" 
          onSelectTab={(tabId) => {
            if (tabId === 'dashboard') navigate('/dashboard');
            else navigate(`/dashboard#${tabId}`);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-8">
          
          {/* ========================================================================= */}
          {/* 2. Page Header                                                            */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            
            {/* Breadcrumb Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <Link to="/dashboard" className="hover:text-brand-600 transition-colors flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>
                <span>/</span>
                <span className="text-slate-600">Week {currentDayData.weekNumber} (Cardiology)</span>
                <span>/</span>
                <span className="text-slate-900 font-bold">Day {currentDayData.dayNumber}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  Daily Study Mode
                </span>
              </div>
            </div>

            {/* Main Day Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-extrabold text-brand-600 uppercase tracking-wider">
                      Week {currentDayData.weekNumber} • Clinical Module
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Estimated time: {currentDayData.estimatedTime}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Day {currentDayData.dayNumber} — {currentDayData.title}
                  </h1>
                </div>

                {/* Header Action Controls: Day Prev/Next + Mark as Complete */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  
                  {/* Previous / Next Day Arrows */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => prevDayNum && navigate(`/day/${prevDayNum}`)}
                      disabled={!prevDayNum}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        prevDayNum 
                          ? 'text-slate-700 hover:bg-white hover:shadow-xs' 
                          : 'text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Previous Day</span>
                    </button>

                    <div className="w-px h-4 bg-slate-300 mx-1" />

                    <button
                      onClick={() => nextDayNum && navigate(`/day/${nextDayNum}`)}
                      disabled={!nextDayNum}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        nextDayNum 
                          ? 'text-slate-700 hover:bg-white hover:shadow-xs' 
                          : 'text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <span className="hidden sm:inline">Next Day</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Mark as Complete Checkbox/Button (Phase 7 Navigation Flow) */}
                  <button
                    onClick={() => {
                      setIsCompleted(true);
                      setDoubtSuccessMessage(`Day ${currentDayNum} marked as Completed! Updating study plan...`);
                      setTimeout(() => {
                        navigate(`/dashboard?completedDay=${currentDayNum}`);
                      }, 900);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20 active:scale-98'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-600' : 'text-white'}`} />
                    <span>{isCompleted ? 'Completed ✅ (Updating...)' : 'Mark as Complete'}</span>
                  </button>

                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 3. Content Tabs Section (MAIN SECTION)                                    */}
          {/* ========================================================================= */}
          <div className="space-y-6">
            
            {/* 5 Horizontal Tabs with Active vs Disabled State */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
              
              {/* Tab 1: PDF Notes */}
              {(() => {
                const isEnabled = currentDayData.activeTabs.includes('notes');
                const isSelected = activeTab === 'notes';
                return (
                  <button
                    disabled={!isEnabled}
                    onClick={() => setActiveTab('notes')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                      !isEnabled 
                        ? 'opacity-40 bg-slate-50 text-slate-400 cursor-not-allowed border border-dashed border-slate-200' 
                        : isSelected
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>PDF Notes</span>
                    {!isEnabled && <Lock className="w-3 h-3 ml-0.5 text-slate-400" />}
                  </button>
                );
              })()}

              {/* Tab 2: Images */}
              {(() => {
                const isEnabled = currentDayData.activeTabs.includes('images');
                const isSelected = activeTab === 'images';
                return (
                  <button
                    disabled={!isEnabled}
                    onClick={() => setActiveTab('images')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                      !isEnabled 
                        ? 'opacity-40 bg-slate-50 text-slate-400 cursor-not-allowed border border-dashed border-slate-200' 
                        : isSelected
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Images & Diagrams</span>
                    {!isEnabled && <Lock className="w-3 h-3 ml-0.5 text-slate-400" />}
                  </button>
                );
              })()}

              {/* Tab 3: Video */}
              {(() => {
                const isEnabled = currentDayData.activeTabs.includes('video');
                const isSelected = activeTab === 'video';
                return (
                  <button
                    disabled={!isEnabled}
                    onClick={() => setActiveTab('video')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                      !isEnabled 
                        ? 'opacity-40 bg-slate-50 text-slate-400 cursor-not-allowed border border-dashed border-slate-200' 
                        : isSelected
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Video Lecture</span>
                    {!isEnabled && <Lock className="w-3 h-3 ml-0.5 text-slate-400" />}
                  </button>
                );
              })()}

              {/* Tab 4: Flashcards */}
              {(() => {
                const isEnabled = currentDayData.activeTabs.includes('flashcards');
                const isSelected = activeTab === 'flashcards';
                return (
                  <button
                    disabled={!isEnabled}
                    onClick={() => setActiveTab('flashcards')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                      !isEnabled 
                        ? 'opacity-40 bg-slate-50 text-slate-400 cursor-not-allowed border border-dashed border-slate-200' 
                        : isSelected
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Brain className="w-4 h-4" />
                    <span>Flashcards</span>
                    {!isEnabled && <Lock className="w-3 h-3 ml-0.5 text-slate-400" />}
                  </button>
                );
              })()}

              {/* Tab 5: Live Session */}
              {(() => {
                const isEnabled = currentDayData.activeTabs.includes('live');
                const isSelected = activeTab === 'live';
                return (
                  <button
                    disabled={!isEnabled}
                    onClick={() => setActiveTab('live')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                      !isEnabled 
                        ? 'opacity-40 bg-slate-50 text-slate-400 cursor-not-allowed border border-dashed border-slate-200' 
                        : isSelected
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'text-red-700 bg-red-50/70 hover:bg-red-100/70'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                    <span>Live Session</span>
                    {!isEnabled && <Lock className="w-3 h-3 ml-0.5 text-slate-400" />}
                  </button>
                );
              })()}

            </div>

            {/* ========================================================================= */}
            {/* 4. Tab Content Details Panels                                             */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm min-h-[460px]">
              
              {/* --------------------------------------------------------------------- */}
              {/* TAB 1: PDF NOTES                                                      */}
              {/* --------------------------------------------------------------------- */}
              {activeTab === 'notes' && (
                <div className="space-y-6 animate-in fade-in">
                  
                  {/* PDF Toolbar & Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-200">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {currentDayData.pdf?.title || 'High-Yield Clinical Notes'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {currentDayData.pdf?.fileName} • {currentDayData.pdf?.pages} Pages • {currentDayData.pdf?.size}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => alert(`Downloading ${currentDayData.pdf?.fileName}...`)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5 text-brand-600" />
                        <span>Download</span>
                      </button>

                      <button
                        onClick={() => setFullscreenPdfOpen(true)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>View Fullscreen</span>
                      </button>
                    </div>
                  </div>

                  {/* Embedded PDF Viewer / Preview Area */}
                  <div className="border border-slate-200 rounded-2xl p-6 sm:p-8 bg-slate-50/50 space-y-6">
                    
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Page 1 of {currentDayData.pdf?.pages} • Document Preview
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        Faculty Verified (2026 Curriculum)
                      </span>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5 text-slate-800 text-xs sm:text-sm leading-relaxed">
                      <div className="border-b border-slate-100 pb-3">
                        <h4 className="text-base font-extrabold text-slate-900">
                          Diagnostic Algorithm: Rapid Approach to Wide-Complex Tachycardias (WCT)
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Authored by {currentDayData.pdf?.author}
                        </p>
                      </div>

                      <div className="p-4 bg-brand-50/80 rounded-xl border border-brand-200/80 space-y-2">
                        <span className="text-xs font-extrabold text-brand-900 uppercase tracking-wider">
                          ★ Rule #1: Assume Ventricular Tachycardia (VT) Until Proven Otherwise
                        </span>
                        <p className="text-slate-700">
                          Over 80% of all wide-complex tachycardias (QRS &gt; 120 ms) are VT. In patients with prior myocardial infarction or structural heart disease, the probability exceeds 95%.
                        </p>
                      </div>

                      {/* Clinical Criteria Table in PDF */}
                      <div className="overflow-x-auto pt-2">
                        <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold">
                              <th className="p-2.5 border border-slate-200">Clinical Hallmark</th>
                              <th className="p-2.5 border border-slate-200">Favors VT</th>
                              <th className="p-2.5 border border-slate-200">Favors SVT with Aberrancy</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="p-2.5 border border-slate-200 font-semibold">AV Dissociation</td>
                              <td className="p-2.5 border border-slate-200 text-emerald-700 font-bold">Definitive (Capture / Fusion beats)</td>
                              <td className="p-2.5 border border-slate-200 text-slate-500">1:1 Retrograde or Antecedent P waves</td>
                            </tr>
                            <tr className="bg-slate-50/50">
                              <td className="p-2.5 border border-slate-200 font-semibold">Precordial Concordance</td>
                              <td className="p-2.5 border border-slate-200 text-emerald-700 font-bold">Positive or Negative in V1-V6</td>
                              <td className="p-2.5 border border-slate-200 text-slate-500">Normal precordial progression</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 border border-slate-200 font-semibold">QRS Axis</td>
                              <td className="p-2.5 border border-slate-200 text-emerald-700 font-bold">Extreme Right Axis (-90° to 180°)</td>
                              <td className="p-2.5 border border-slate-200 text-slate-500">Normal or Left Axis Deviation</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* --------------------------------------------------------------------- */}
              {/* TAB 2: IMAGES & CLINICAL DIAGRAMS                                     */}
              {/* --------------------------------------------------------------------- */}
              {activeTab === 'images' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        High-Yield Clinical Images & Rhythm Strips
                      </h3>
                      <p className="text-xs text-slate-500">
                        Click on any image to open the high-resolution clinical lightbox with zoom.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
                      {currentDayData.images?.length || 0} Figures Assigned
                    </span>
                  </div>

                  {/* Images Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(currentDayData.images || []).map((img, idx) => (
                      <div
                        key={img.id}
                        onClick={() => handleOpenLightbox(idx)}
                        className="group bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:border-brand-400 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="relative aspect-video overflow-hidden bg-slate-900">
                          <img
                            src={img.url}
                            alt={img.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="px-3 py-1.5 bg-black/70 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs">
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Enlarge</span>
                            </span>
                          </div>
                        </div>

                        <div className="p-4 bg-white flex-grow flex flex-col justify-between">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                            {img.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-snug">
                            {img.caption}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --------------------------------------------------------------------- */}
              {/* TAB 3: VIDEO LECTURE                                                  */}
              {/* --------------------------------------------------------------------- */}
              {activeTab === 'video' && (
                <div className="space-y-6 animate-in fade-in">
                  
                  {/* Video Player Box */}
                  <div className="relative aspect-video rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-between p-6 group">
                    <img
                      src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1000&auto=format&fit=crop&q=80"
                      alt="Clinical Video Lesson"
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />

                    {/* Top overlay in player */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-400" />
                        <span className="text-xs font-bold truncate max-w-sm">
                          {currentDayData.video?.title}
                        </span>
                      </div>
                      <span className="text-[11px] bg-black/60 text-slate-300 px-2.5 py-1 rounded-md font-mono">
                        1080p HD
                      </span>
                    </div>

                    {/* Center Play Button */}
                    <div className="relative z-10 text-center">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-18 h-18 rounded-full bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center mx-auto shadow-2xl hover:scale-108 transition-transform cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                      </button>
                    </div>

                    {/* Bottom Controls Bar */}
                    <div className="relative z-10 bg-black/75 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono">
                        <span>{isPlaying ? '14:20' : '00:00'} / {currentDayData.video?.duration}</span>
                        <span>Instructor: {currentDayData.video?.instructor}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden cursor-pointer">
                        <div className="h-full bg-brand-500 w-1/2 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Player Controls Underneath */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-700">Playback Speed:</span>
                      {['1.0x', '1.25x', '1.5x', '1.75x', '2.0x'].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => setPlaybackSpeed(speed)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                            playbackSpeed === speed
                              ? 'bg-brand-600 text-white'
                              : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {speed}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setIsWatched(!isWatched)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isWatched 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isWatched ? 'Watched ✓' : 'Mark as Watched'}</span>
                    </button>
                  </div>

                  {/* Video Chapters List */}
                  {currentDayData.video?.chapters && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Lecture Timestamps & Chapters:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentDayData.video.chapters.map((ch, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800">{ch.label}</span>
                            <span className="font-mono font-bold text-brand-600 bg-white px-2 py-0.5 rounded border border-slate-200">{ch.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* --------------------------------------------------------------------- */}
              {/* TAB 4: FLASHCARDS (3D INTERACTIVE FLIP)                                */}
              {/* --------------------------------------------------------------------- */}
              {activeTab === 'flashcards' && (
                <div className="space-y-6 animate-in fade-in max-w-2xl mx-auto py-2">
                  
                  {/* Flashcard Header Bar */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-brand-700 uppercase tracking-wider">
                        Spaced Repetition Active Recall Deck
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        Card {currentFlashcardIndex + 1} of {flashcardsList.length}
                      </h3>
                    </div>

                    <button
                      onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-xl text-xs font-bold border border-brand-200 hover:bg-brand-100 transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Click to Flip Card</span>
                    </button>
                  </div>

                  {/* 3D Flip Card Container */}
                  <div className="perspective-1000 w-full min-h-[260px] cursor-pointer" onClick={() => setFlashcardFlipped(!flashcardFlipped)}>
                    <div className={`relative w-full min-h-[260px] transition-transform duration-500 transform-style-preserve-3d ${
                      flashcardFlipped ? 'rotate-y-180' : ''
                    }`}>
                      
                      {/* FRONT OF CARD */}
                      <div className="absolute inset-0 backface-hidden bg-white border-2 border-brand-200 rounded-3xl p-8 flex flex-col justify-between shadow-md hover:border-brand-400 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold bg-brand-100 text-brand-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            QUESTION PROMPT
                          </span>
                          <span className="text-xs text-slate-400 font-semibold">Tap anywhere to flip</span>
                        </div>

                        <div className="text-center my-auto py-4">
                          <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                            {currentCard.question}
                          </p>
                        </div>

                        <div className="text-center text-[11px] text-slate-400">
                          Card #{currentCard.id || currentFlashcardIndex + 1} • High-Yield Active Recall
                        </div>
                      </div>

                      {/* BACK OF CARD */}
                      <div className="absolute inset-0 backface-hidden rotate-y-180 bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-8 flex flex-col justify-between shadow-md text-slate-900">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            CLINICAL RATIONALE & ANSWER
                          </span>
                          <span className="text-xs text-slate-500 font-semibold">Tap to flip back</span>
                        </div>

                        <div className="text-center my-auto py-4">
                          <p className="text-sm sm:text-base font-semibold text-emerald-950 leading-relaxed">
                            {currentCard.answer}
                          </p>
                        </div>

                        <div className="text-center text-[11px] text-slate-400">
                          Anki Spaced Repetition (SRS)
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Deck Navigation & Spaced Repetition Buttons */}
                  <div className="space-y-3 pt-2">
                    {flashcardFlipped && (
                      <div className="flex items-center justify-center gap-2 animate-in fade-in">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleNextFlashcard(); }}
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors"
                        >
                          Again (&lt; 10m)
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleNextFlashcard(); }}
                          className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl border border-amber-200 transition-colors"
                        >
                          Hard (1d)
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleNextFlashcard(); }}
                          className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors"
                        >
                          Good (3d)
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleNextFlashcard(); }}
                          className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-colors"
                        >
                          Easy (7d)
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <button
                        onClick={handlePrevFlashcard}
                        disabled={currentFlashcardIndex === 0}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          currentFlashcardIndex > 0
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous Card</span>
                      </button>

                      <span className="text-xs text-slate-500 font-semibold">
                        {currentFlashcardIndex + 1} / {flashcardsList.length} Cards
                      </span>

                      <button
                        onClick={handleNextFlashcard}
                        disabled={currentFlashcardIndex === flashcardsList.length - 1}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          currentFlashcardIndex < flashcardsList.length - 1
                            ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                            : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                        }`}
                      >
                        <span>Next Card</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* --------------------------------------------------------------------- */}
              {/* TAB 5: LIVE SESSION                                                   */}
              {/* --------------------------------------------------------------------- */}
              {activeTab === 'live' && (
                <div className="space-y-6 animate-in fade-in">
                  
                  {/* If Live Scheduled for Today (e.g. Day 3) */}
                  {currentDayData.live?.isScheduled && (
                    <div className="bg-gradient-to-r from-red-50 via-white to-amber-50 text-slate-900 rounded-3xl p-8 border border-red-200 shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          <span>{currentDayData.live.badge || 'Live Grand Rounds'}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-red-700 bg-red-100 border border-red-200 px-3 py-1 rounded-xl">
                          Starts @ {currentDayData.live.time}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                          {currentDayData.live.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                          Clinical case scenarios with <strong>{currentDayData.live.faculty}</strong>. Focus on acute coronary ECG recognition, door-to-balloon timelines, and live Q&A.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
                        <span className="text-xs text-slate-500 font-medium">
                          👥 {currentDayData.live.attendeesCount} Registered Candidates
                        </span>
                        <button
                          onClick={() => setLiveModalOpen(true)}
                          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center gap-2"
                        >
                          <Radio className="w-4 h-4" />
                          <span>Join Live Broadcast Room</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* If Recording Available (e.g. Day 1) */}
                  {currentDayData.live?.recordingAvailable && (
                    <div className="bg-white text-slate-900 rounded-3xl p-8 border border-slate-200 shadow-sm space-y-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Recorded Faculty Grand Round Available</span>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {currentDayData.live.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Taught by {currentDayData.live.faculty} • Duration: {currentDayData.live.duration}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <button
                          onClick={() => setLiveModalOpen(true)}
                          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Watch Session Recording</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* If No Live Session (e.g. Day 2) */}
                  {!currentDayData.live?.hasSession && (
                    <div className="text-center py-12 space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <Radio className="w-10 h-10 text-slate-400 mx-auto" />
                      <h4 className="text-base font-bold text-slate-800">
                        No Live Session Scheduled for This Day
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Faculty has allocated today's curriculum exclusively for video conceptual learning and high-yield PDF notes.
                      </p>
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>

          {/* ========================================================================= */}
          {/* 5. Bottom Section: Personal Notes + Ask a Doubt                           */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-brand-600" />
                  <span>Personal Study Notepad</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Jot down high-yield mnemonics and clinical points for Day {currentDayData.dayNumber}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDoubtModalOpen(true)}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ask a Doubt to Faculty</span>
                </button>
              </div>
            </div>

            {/* Notepad Area */}
            <div className="space-y-3">
              <textarea
                rows={3}
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                placeholder="Write your clinical notes here..."
                className="w-full p-4 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-brand-500 leading-relaxed font-sans"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Notes are stored for this session
                </span>
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{notesSaved ? 'Saved ✓' : 'Save Notes'}</span>
                </button>
              </div>
            </div>
          </section>

        </main>
      </div>

      {/* ========================================================================= */}
      {/* Lightbox & Interactive Modals                                             */}
      {/* ========================================================================= */}
      <ImageLightboxModal 
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={currentDayData.images || []}
        activeIndex={lightboxActiveIndex}
      />

      <AskDoubtModal 
        isOpen={doubtModalOpen}
        onClose={() => setDoubtModalOpen(false)}
        dayTitle={`Day ${currentDayData.dayNumber} — ${currentDayData.title}`}
      />

      <LiveSessionModal 
        isOpen={liveModalOpen}
        onClose={() => setLiveModalOpen(false)}
        session={{
          title: currentDayData.live?.title || 'Live Grand Rounds',
          faculty: currentDayData.live?.faculty || 'Dr. Siddharth V.',
          attendeesCount: currentDayData.live?.attendeesCount || 300
        }}
      />

      {/* DRAWER: Fullscreen PDF Reader */}
      {fullscreenPdfOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setFullscreenPdfOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
            <div className="w-screen max-w-4xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
              
              {/* Sticky Header */}
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 sticky top-0 z-10">
                <div>
                  <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">PDF Clinical Handout</span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{currentDayData.pdf?.title}</h4>
                </div>
                <button 
                  onClick={() => setFullscreenPdfOpen(false)} 
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable PDF Content */}
              <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-4 bg-slate-50 text-xs sm:text-sm text-slate-800 leading-relaxed">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h5 className="font-extrabold text-slate-900 text-base">Section 1: Clinical Electrophysiology</h5>
                  <p>Action potentials in cardiac pacemaker cells (SA node) are driven by Phase 4 spontaneous diastolic depolarization via If (funny) sodium currents, followed by Phase 0 Ca2+ influx.</p>
                  <p>Non-pacemaker ventricular myocytes rely on rapid Phase 0 Na+ influx (Nav1.5), followed by Phase 1 transient outward K+ current, Phase 2 plateau Ca2+ influx via L-type channels, and Phase 3 repolarization via IKr and IKs potassium channels.</p>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h5 className="font-extrabold text-slate-900 text-base">Section 2: High-Yield Antiarrhythmic Drug Classes</h5>
                  <p><strong>Class IA (Procainamide, Quinidine):</strong> Moderate Na+ channel block; prolongs repolarization (AP duration ↑, QT ↑). Indicated in atrial and ventricular arrhythmias.</p>
                  <p><strong>Class IB (Lidocaine, Mexiletine):</strong> Weak Na+ channel block; shortens repolarization (AP duration ↓). Highly ischemic tissue selective; post-MI VT.</p>
                  <p><strong>Class IC (Flecainide, Propafenone):</strong> Strong Na+ channel block with minimal AP duration effect. Contraindicated in structural heart disease (CAST trial).</p>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs shrink-0 sticky bottom-0 z-10">
                <span className="font-semibold text-slate-600">Page 1 of {currentDayData.pdf?.pages || 12}</span>
                <button 
                  onClick={() => setFullscreenPdfOpen(false)} 
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Exit Reader
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

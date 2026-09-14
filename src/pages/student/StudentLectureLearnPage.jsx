import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Video,
  Image as ImageIcon,
  Brain,
  Radio,
  Sparkles,
  CheckCircle2,
  Download,
  Clock,
  ZoomIn,
  X,
  RotateCw,
  Check,
  ChevronRight,
  Share2,
  Bookmark,
  Play,
  Award,
  Lock,
  Unlock
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import { learningProgressService } from '../../services/learningProgressService';

export default function StudentLectureLearnPage() {
  const { examId = 'neet-pg', subjectId, moduleId, lectureId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(() => catalogService.getExamById(examId) || { id: examId, name: examId.toUpperCase() });
  const [subject, setSubject] = useState(() => curriculumService.getSubjectById(subjectId));
  const [module, setModule] = useState(() => curriculumService.getModuleById(moduleId));
  const [lecture, setLecture] = useState(() => curriculumService.getLectureById(lectureId));

  // Channel Tabs: 'video' | 'pdf' | 'images' | 'flashcards' | 'live' | 'pearls'
  const [activeChannel, setActiveChannel] = useState('video');
  const [isCompleted, setIsCompleted] = useState(() => learningProgressService.isLectureCompleted(lectureId));
  const [toastMessage, setToastMessage] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState(new Set());

  // Module Lectures and sequential navigation
  const moduleLectures = useMemo(() => curriculumService.getLecturesByModule(moduleId) || [], [moduleId]);
  const sortedModuleLectures = useMemo(() => 
    [...moduleLectures].sort((a, b) => (a.lectureNumber || 0) - (b.lectureNumber || 0)),
    [moduleLectures]
  );
  const currentIndex = sortedModuleLectures.findIndex(l => l.id === lectureId);
  const prevLecture = currentIndex > 0 ? sortedModuleLectures[currentIndex - 1] : null;
  const nextLecture = currentIndex !== -1 && currentIndex < sortedModuleLectures.length - 1 ? sortedModuleLectures[currentIndex + 1] : null;
  const isLocked = !learningProgressService.isLectureUnlocked(moduleId, lectureId, sortedModuleLectures);

  useEffect(() => {
    const foundExam = catalogService.getExamById(examId);
    if (foundExam) setExam(foundExam);
    const foundSub = curriculumService.getSubjectById(subjectId);
    if (foundSub) setSubject(foundSub);
    const foundModule = curriculumService.getModuleById(moduleId);
    if (foundModule) setModule(foundModule);
    const foundLecture = curriculumService.getLectureById(lectureId);
    if (foundLecture) setLecture(foundLecture);
    setIsCompleted(learningProgressService.isLectureCompleted(lectureId));
  }, [examId, subjectId, moduleId, lectureId]);

  // Subscribe to lecture progress updates
  useEffect(() => {
    const unsub = learningProgressService.subscribeLectures(() => {
      setIsCompleted(learningProgressService.isLectureCompleted(lectureId));
    });
    return unsub;
  }, [lectureId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleToggleComplete = () => {
    if (isLocked) {
      showToast(`⚠️ Complete previous lectures sequentially first before marking this lecture as mastered.`);
      return;
    }
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    learningProgressService.markLectureCompleted(lectureId, nextState);
    if (nextState) {
      if (nextLecture) {
        showToast(`🎉 Lecture completed! Next lecture "${nextLecture.title}" is now unlocked.`);
      } else {
        showToast('🎉 Congratulations! All lectures in this unit are now completed.');
      }
    } else {
      showToast('Lecture marked as in-progress.');
    }
  };

  if (!lecture) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center space-y-4 max-w-2xl mx-auto">
        <h2 className="text-xl font-black text-slate-800">Lecture Study Room Not Found</h2>
        <Link
          to={`/student/courses/${examId}/subjects/${subjectId}/modules/${moduleId}/lectures`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lectures</span>
        </Link>
      </div>
    );
  }

  const pdfList = lecture.content?.pdfList || (lecture.content?.pdf ? [lecture.content.pdf] : []);
  const imagesList = lecture.content?.images || [];
  const flashcards = lecture.content?.flashcards || [
    { question: 'What is the hallmark finding of AV dissociation in Ventricular Tachycardia?', answer: 'Independent sinus P waves marching across wide QRS complexes with capture & fusion beats.' },
    { question: 'What is the initial emergency drug of choice for hemodynamically stable monomorphic VT?', answer: 'Intravenous Amiodarone (150 mg over 10 mins) or Procainamide.' }
  ];
  const videoData = lecture.content?.video || {
    title: lecture.title,
    url: 'https://vimeo.com/medpreppro/cardio-day03-wct',
    duration: '38:40',
    instructor: 'Dr. Sarah Jenkins (Cardiology Lead, MD DM)',
    chapters: [
      { time: '00:00', title: 'Pathophysiology & Clinical Presentation' },
      { time: '12:30', title: 'Diagnostic Criteria: Brugada vs Vereckei' },
      { time: '26:15', title: 'Emergency Antiarrhythmic Regimens & ACLS' }
    ]
  };

  const currentFlashcard = flashcards[cardIndex] || flashcards[0];

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb Header Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link
              to={`/student/courses/${examId}/subjects/${subjectId}/modules/${moduleId}/lectures`}
              className="text-xs font-bold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Lectures</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
              Level 5 • Lecture Study Room
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {lecture.title}
              </h1>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {lecture.difficulty || 'High-Yield'}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{lecture.duration || '45 mins'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {exam?.name} ➡️ {subject?.name} ➡️ Unit #{module?.moduleNumber || 1}: {module?.title}
            </p>
          </div>
        </div>

        {/* Completion Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleToggleComplete}
            disabled={isLocked}
            className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm ${
              isLocked
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : isCompleted
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20 cursor-pointer'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
            <span>{isLocked ? 'Locked for Study' : isCompleted ? 'Lecture Completed' : 'Mark as Mastered'}</span>
          </button>
        </div>
      </div>

      {/* Locked Alert Banner */}
      {isLocked && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border border-amber-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-amber-900">
                Sequential Gating Active
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                This lecture is locked until you complete Lecture #{prevLecture?.lectureNumber || currentIndex} ({prevLecture?.title || 'previous lecture'}).
              </p>
            </div>
          </div>
          {prevLecture && (
            <button
              onClick={() => navigate(`/student/courses/${examId}/subjects/${subjectId}/modules/${moduleId}/lectures/${prevLecture.id}`)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer transition-all shadow-xs"
            >
              Go to Lecture #{prevLecture.lectureNumber}
            </button>
          )}
        </div>
      )}

      {/* Next Lecture Unlocked Callout Banner */}
      {isCompleted && nextLecture && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-brand-500/10 to-indigo-500/10 border border-emerald-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm shadow-emerald-600/30">
              ✓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Current Lecture Completed
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  Next Session Unlocked:
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">
                Lecture #{nextLecture.lectureNumber}: {nextLecture.title}
              </h4>
            </div>
          </div>

          <button
            onClick={() => navigate(`/student/courses/${examId}/subjects/${subjectId}/modules/${moduleId}/lectures/${nextLecture.id}`)}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-brand-600/20 cursor-pointer self-start sm:self-auto shrink-0 transition-all active:scale-98"
          >
            <span>Proceed to Next Lecture</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 6-Channel Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'video', label: 'Video Masterclass', icon: Video },
          { id: 'pdf', label: 'PDF Study Notes', icon: FileText, count: pdfList.length },
          { id: 'images', label: 'Clinical ECG & Lightbox', icon: ImageIcon, count: imagesList.length },
          { id: 'flashcards', label: 'Active Recall Cards', icon: Brain, count: flashcards.length },
          { id: 'pearls', label: 'High-Yield Pearls', icon: Sparkles }
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isSelected = activeChannel === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveChannel(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                isSelected
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-600/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <TabIcon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isSelected ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* CHANNEL 1: VIDEO MASTERCLASS */}
      {activeChannel === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Main Video Screen (8 Cols) */}
          <div className="lg:col-span-8 bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between">
            <div className="relative aspect-video bg-slate-950 flex items-center justify-center group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80"
                alt="Lecture preview"
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-brand-600 group-hover:bg-brand-500 text-white flex items-center justify-center shadow-xl shadow-brand-600/40 group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 fill-current ml-1" />
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-semibold">
                <span>Lecture Stream • 1080p HD</span>
                <span>{videoData.duration || '38:40'}</span>
              </div>
            </div>

            <div className="p-6 bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                  Specialist Masterclass
                </span>
                <span className="text-xs text-slate-400">Speaker: {videoData.instructor}</span>
              </div>
              <h3 className="text-lg font-black">{videoData.title}</h3>
            </div>
          </div>

          {/* Chapter Timeline (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">Lecture Chapter Timestamps</h3>
                <p className="text-xs text-slate-500">Jump directly to diagnostic criteria</p>
              </div>

              <div className="space-y-2.5">
                {(videoData.chapters || [
                  { time: '00:00', title: 'Pathophysiology & Clinical Presentation' },
                  { time: '12:30', title: 'Diagnostic Criteria & ECG Recognition' },
                  { time: '26:15', title: 'Emergency Antiarrhythmic Regimens' }
                ]).map((chap, idx) => (
                  <button
                    key={idx}
                    onClick={() => showToast(`Seeked lecture to ${chap.time}`)}
                    className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-brand-50 border border-slate-200/80 hover:border-brand-200 text-left transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-extrabold text-brand-600 font-mono">{chap.time}</span>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                        {chap.title}
                      </h4>
                    </div>
                    <Play className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-100 text-xs space-y-1">
              <span className="font-bold text-brand-900">Faculty Specialist Note:</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Focus on the Brugada algorithm steps at 14:20. High frequency of repeat questions in NExT clinical vignettes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CHANNEL 2: PDF NOTES VIEWER */}
      {activeChannel === 'pdf' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">High-Yield Clinical Study Guide</h3>
              <p className="text-xs text-slate-500">Concise revision sheets formatted for rapid active recall</p>
            </div>

            <a
              href="/assets/docs/Clinical_Study_Guide.pdf"
              target="_blank"
              download
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF (Printable)</span>
            </a>
          </div>

          {/* Embedded Document Mock Reader */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-10 space-y-6 max-w-4xl mx-auto shadow-inner text-slate-800">
            <div className="border-b border-slate-200 pb-4 text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-brand-600 tracking-wider">
                MedPrep Pro Clinical Notes Series • 2026 Edition
              </span>
              <h2 className="text-xl font-black text-slate-900">{lecture.title}</h2>
              <p className="text-xs text-slate-400">Authored by Dr. Sarah Jenkins (Cardiology Lead)</p>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="font-bold text-amber-900 text-xs">🔴 HIGH-YIELD CLINICAL PEARL (GOLDMAN-CECIL):</span>
                <p className="text-amber-800">
                  Any wide complex tachycardia (QRS &gt; 120 ms) in a patient with a prior history of myocardial infarction or structural heart disease is <strong>Ventricular Tachycardia until proven otherwise (98% predictive value)</strong>. Never give Verapamil or Diltiazem to an undifferentiated wide complex tachycardia.
                </p>
              </div>

              <h4 className="font-black text-slate-900 text-sm pt-2">1. The 4-Step Brugada Diagnostic Criteria</h4>
              <ol className="list-decimal pl-5 space-y-2">
                <li><strong>Absence of RS complex in ALL precordial leads (V1-V6)?</strong> If YES ➡️ VT. (Precordial concordance).</li>
                <li><strong>RS interval &gt; 100 ms in any precordial lead?</strong> If YES ➡️ VT.</li>
                <li><strong>Presence of AV dissociation?</strong> (Capture beats, fusion beats, independent P waves). If YES ➡️ VT.</li>
                <li><strong>Morphology criteria for VT present in V1/V2 and V6?</strong> If YES ➡️ VT.</li>
              </ol>

              <h4 className="font-black text-slate-900 text-sm pt-2">2. Emergency Management Protocol</h4>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Hemodynamically Unstable (Hypotension, Pulmonary Edema, Altered Sensorium):</strong> Immediate Synchronized Cardioversion (100J - 200J biphasic).</li>
                <li><strong>Hemodynamically Stable:</strong> IV Amiodarone 150 mg over 10 minutes, followed by 1 mg/min maintenance infusion. Alternative: IV Procainamide 20-50 mg/min.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* CHANNEL 3: CLINICAL DIAGRAMS & ECG LIGHTBOX */}
      {activeChannel === 'images' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs">
            <h3 className="text-base font-black text-slate-900">Clinical ECG Strips & Lightbox Inspection</h3>
            <p className="text-xs text-slate-500">Click any diagnostic strip to enlarge with full-screen zoom and criteria annotations.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5">
              {(imagesList.length > 0 ? imagesList : [
                {
                  id: 'ecg-1',
                  title: '12-Lead ECG: Monomorphic VT with Fusion & Capture Beats',
                  url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
                  caption: 'Wide QRS tachycardia (~160 bpm) with extreme northwest axis deviation. Independent P waves can be seen at lead V1.'
                },
                {
                  id: 'ecg-2',
                  title: 'Echocardiogram: HFrEF with Severe Apical Hypokinesia',
                  url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=900&auto=format&fit=crop&q=80',
                  caption: 'Parasternal long axis view demonstrating left ventricular dilation and reduced ejection fraction of 28%.'
                }
              ]).map((img) => (
                <div
                  key={img.id}
                  onClick={() => setLightboxImage(img)}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold text-xs">
                      <ZoomIn className="w-5 h-5" />
                      <span>Enlarge High-Res Strip</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-1.5">
                    <h4 className="text-sm font-black text-slate-900 group-hover:text-brand-600 transition-colors">
                      {img.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{img.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHANNEL 4: ACTIVE RECALL FLASHCARDS */}
      {activeChannel === 'flashcards' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs text-center space-y-2">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              Spaced Repetition Active Recall
            </span>
            <h3 className="text-xl font-black text-slate-900">
              High-Yield Card #{cardIndex + 1} of {flashcards.length}
            </h3>
            <p className="text-xs text-slate-400">
              Test your memory retrieval before clicking to reveal the guideline answer.
            </p>
          </div>

          {/* Interactive 3D Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`min-h-[260px] p-8 rounded-3xl border shadow-md transition-all cursor-pointer flex flex-col justify-between select-none ${
              isFlipped
                ? 'bg-purple-900 text-white border-purple-800'
                : 'bg-white text-slate-900 border-slate-200 hover:border-brand-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider">
              <span className={isFlipped ? 'text-purple-300' : 'text-slate-400'}>
                {isFlipped ? 'Guideline Answer & Rationale' : 'Clinical Question'}
              </span>
              <span className="flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Click Card to Flip</span>
              </span>
            </div>

            <div className="py-6 text-center">
              <p className="text-base sm:text-lg font-bold leading-relaxed">
                {isFlipped ? currentFlashcard.answer : currentFlashcard.question}
              </p>
            </div>

            <div className="text-center text-xs text-slate-400">
              {isFlipped ? 'Ready for next flashcard?' : 'Think of your answer before flipping.'}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
              }}
              className="px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              Previous Card
            </button>

            <button
              onClick={() => {
                showToast('Card added to mastered memory pool! 🎉');
                setIsFlipped(false);
                setCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
              }}
              className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition-all cursor-pointer"
            >
              I Knew This (Next Card)
            </button>
          </div>
        </div>
      )}

      {/* CHANNEL 5: HIGH-YIELD PEARLS */}
      {activeChannel === 'pearls' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6 animate-in fade-in max-w-4xl mx-auto">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Clinical Guideline Pearls & Exam Traps</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Key mnemonic anchors and gold-standard treatment algorithms for NExT / USMLE.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="font-bold text-emerald-900">DRUG OF CHOICE (DOC) SUMMARY:</span>
              <p className="text-emerald-800">
                • Narrow complex SVT ➡️ <strong>IV Adenosine (6 mg rapid push)</strong>.<br />
                • Torsades de Pointes (Polymorphic VT) ➡️ <strong>IV Magnesium Sulfate (2 g)</strong>.<br />
                • WPW Syndrome with Atrial Fibrillation ➡️ <strong>IV Procainamide or DC Cardioversion</strong> (Avoid ABCD: Adenosine, Beta-blockers, CCB, Digoxin).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
              <span className="font-bold text-rose-900">COMMON CLINICAL EXAM PITFALLS:</span>
              <p className="text-rose-800">
                Do not confuse Ashman phenomenon with ventricular ectopy. Ashman phenomenon occurs after a long R-R interval followed by a short R-R interval and characteristically shows RBBB morphology without hemodynamic collapse.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 space-y-4 p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black">{lightboxImage.title}</h3>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black flex items-center justify-center overflow-hidden rounded-2xl">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <p className="text-xs text-slate-300">{lightboxImage.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}

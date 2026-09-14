import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FolderTree, 
  Layers, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  FileText, 
  Video, 
  Image as ImageIcon, 
  Brain, 
  Radio, 
  CheckCircle2, 
  Search,
  BookOpen,
  Play,
  Lock,
  Unlock,
  RotateCw
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import { learningProgressService } from '../../services/learningProgressService';

export default function StudentLecturesPage() {
  const { examId = 'neet-pg', subjectId = 'sub-neet-cardio', moduleId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(() => catalogService.getExamById(examId) || { id: examId, name: examId.toUpperCase() });
  const [subject, setSubject] = useState(() => curriculumService.getSubjectById(subjectId));
  const [module, setModule] = useState(() => curriculumService.getModuleById(moduleId));
  const [lectures, setLectures] = useState(() => curriculumService.getLecturesByModule(moduleId));
  const [completedLectures, setCompletedLectures] = useState(() => learningProgressService.getCompletedLectures());
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const foundExam = catalogService.getExamById(examId);
    if (foundExam) setExam(foundExam);
    const foundSubject = curriculumService.getSubjectById(subjectId);
    if (foundSubject) setSubject(foundSubject);
    const foundModule = curriculumService.getModuleById(moduleId);
    if (foundModule) setModule(foundModule);
    const lectureList = curriculumService.getLecturesByModule(moduleId);
    setLectures(lectureList || []);
  }, [examId, subjectId, moduleId]);

  // Subscribe to lecture progress updates
  useEffect(() => {
    const unsub = learningProgressService.subscribeLectures(() => {
      setCompletedLectures(learningProgressService.getCompletedLectures());
    });
    return unsub;
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const sortedLectures = [...lectures].sort((a, b) => (a.lectureNumber || 0) - (b.lectureNumber || 0));

  const filteredLectures = sortedLectures.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedCount = sortedLectures.filter(l => learningProgressService.isLectureCompleted(l.id)).length;
  const totalCount = sortedLectures.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleUnlockAll = () => {
    learningProgressService.unlockAllLecturesForModule(sortedLectures);
    showToast('🎉 All module lectures have been unlocked for open review!');
  };

  const handleResetProgress = () => {
    learningProgressService.resetLecturesForModule(sortedLectures);
    showToast('🔄 Module lecture progress reset. Lecture 1 is now active.');
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Link 
                to={`/student/courses/${examId}/subjects/${subjectId}/modules`}
                className="text-xs font-bold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-wider flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Modules</span>
              </Link>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
                Level 4 • Sequential Clinical Lectures
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-600 uppercase">
                  {exam.name} ➡️ {subject?.name} ➡️ Unit #{module?.moduleNumber || 1}: {module?.title}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Module Lectures & Clinical Study Rooms
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
                Complete each clinical lecture to unlock the next session. Every lecture features dedicated multi-channel resources including PDF guides, high-res ECG lightboxes, video masterclasses, and flashcard recall drills.
              </p>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search lectures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-full sm:w-56"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleUnlockAll}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
                title="Unlock all lectures in this module"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Unlock All</span>
              </button>

              <button
                onClick={handleResetProgress}
                className="p-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 cursor-pointer transition-all"
                title="Reset module progress to Lecture 1"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Module Sequential Progress Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">
              Module Sequential Progress:
            </span>
            <span className="text-xs font-extrabold text-brand-700">
              {completedCount} of {totalCount} Lectures Completed ({progressPct}%)
            </span>
          </div>

          <div className="w-full sm:w-64 bg-slate-200 h-2.5 rounded-full overflow-hidden shrink-0">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lectures List with Sequential Gating */}
      <div className="space-y-4">
        {filteredLectures.map((top, idx) => {
          const isDone = learningProgressService.isLectureCompleted(top.id);
          const isUnlocked = learningProgressService.isLectureUnlocked(moduleId, top.id, sortedLectures);
          const isLocked = !isUnlocked;
          const isInProgress = isUnlocked && !isDone;
          const prevLecture = idx > 0 ? sortedLectures[idx - 1] : null;

          const pdfCount = top.content?.pdfList?.length || (top.content?.pdf ? 1 : 0);
          const imgCount = top.content?.images?.length || 0;
          const hasVideo = Boolean(top.content?.video);
          const flashCount = top.content?.flashcards?.length || 0;

          return (
            <div
              key={top.id}
              className={`rounded-3xl p-5 sm:p-6 border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 group ${
                isDone
                  ? 'bg-white border-emerald-200 shadow-2xs hover:shadow-md hover:border-emerald-300'
                  : isInProgress
                    ? 'bg-white border-brand-300 shadow-xs hover:shadow-md ring-2 ring-brand-500/10'
                    : 'bg-slate-50/70 border-slate-200 opacity-75'
              }`}
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center border ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : isInProgress
                        ? 'bg-brand-100 text-brand-800 border-brand-300'
                        : 'bg-slate-200 text-slate-500 border-slate-300'
                  }`}>
                    {top.lectureNumber || idx + 1}
                  </span>

                  <h3 className={`text-base font-black transition-colors ${
                    isLocked 
                      ? 'text-slate-600' 
                      : 'text-slate-900 group-hover:text-brand-600'
                  }`}>
                    {top.title}
                  </h3>

                  {/* Status Badge */}
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Completed ✓
                    </span>
                  ) : isInProgress ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200 animate-pulse">
                      <Play className="w-2.5 h-2.5 fill-current" />
                      Up Next
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Locked • Complete Lecture {idx} first
                    </span>
                  )}

                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {top.difficulty || 'High-Yield'}
                  </span>
                </div>

                {/* Compact Metadata: Time Summary + Resource Badges */}
                {(() => {
                  const lStats = learningProgressService.getLectureTimeStats(top);
                  const totalDur = lStats.totalMins || 45;
                  const completedMins = isDone ? totalDur : (lStats.completedMins || 0);
                  const remainingMins = isDone ? 0 : Math.max(0, totalDur - completedMins);

                  return (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
                      {/* Inline Time Progress */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">{top.duration || `${totalDur} mins`}</span>
                        <span className="text-slate-300">•</span>
                        <span className={isDone ? 'font-medium text-emerald-700' : completedMins > 0 ? 'font-medium text-brand-700' : 'text-slate-500'}>
                          {completedMins} min completed
                        </span>
                        <span className="text-slate-300">•</span>
                        {isDone ? (
                          <span className="font-semibold text-emerald-700">Completed ✓</span>
                        ) : (
                          <span className="text-slate-500">
                            {remainingMins} min remaining
                          </span>
                        )}
                      </div>

                      <span className="text-slate-300 hidden sm:inline">•</span>

                      {/* Channels Status */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                          <FileText className="w-3 h-3" />
                          <span>{pdfCount} PDF Guide</span>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ImageIcon className="w-3 h-3" />
                          <span>{imgCount} Diagrams</span>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Video className="w-3 h-3" />
                          <span>{hasVideo ? 'Video Masterclass' : 'Video Available'}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <Brain className="w-3 h-3" />
                          <span>{flashCount} Flashcards</span>
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center gap-2">
                {isDone ? (
                  <Link
                    to={`/student/courses/${examId}/subjects/${subjectId}/modules/${moduleId}/lectures/${top.id}`}
                    className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-2 border border-emerald-200 shadow-2xs transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Review Lecture</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                  </Link>
                ) : isInProgress ? (
                  <Link
                    to={`/student/courses/${examId}/subjects/${subjectId}/modules/${moduleId}/lectures/${top.id}`}
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-brand-600/20 transition-all cursor-pointer group/btn active:scale-98"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Enter Study Room</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <button
                    onClick={() => showToast(`🔒 Complete Lecture ${idx} ("${prevLecture?.title || 'previous lecture'}") before unlocking this session.`)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center gap-1.5 border border-slate-200 cursor-not-allowed transition-all"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Locked</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

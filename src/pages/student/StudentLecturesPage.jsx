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
  Play
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';

export default function StudentLecturesPage() {
  const { examId = 'neet-pg', subjectId = 'sub-neet-cardio', moduleId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(() => catalogService.getExamById(examId) || { id: examId, name: examId.toUpperCase() });
  const [subject, setSubject] = useState(() => curriculumService.getSubjectById(subjectId));
  const [module, setModule] = useState(() => curriculumService.getModuleById(moduleId));
  const [lectures, setLectures] = useState(() => curriculumService.getLecturesByModule(moduleId));
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredLectures = lectures.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
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
              Level 4 • Lecture Modules
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-600 uppercase">
                {exam.name} ➡️ {subject?.name} ➡️ Unit #{module?.moduleNumber || 1}: {module?.title}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Select Study Lecture
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
              Every lecture features a dedicated multi-channel Study Room containing high-yield notes, ECG lightboxes, video masterclasses, and flashcard recall tests.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search lectures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Lectures List */}
      <div className="space-y-4">
        {filteredLectures.map((top, idx) => {
          const pdfCount = top.content?.pdfList?.length || (top.content?.pdf ? 1 : 0);
          const imgCount = top.content?.images?.length || 0;
          const hasVideo = Boolean(top.content?.video);
          const flashCount = top.content?.flashcards?.length || 0;

          return (
            <div
              key={top.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-brand-200 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 group"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-brand-600 transition-colors">
                    {top.title}
                  </h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {top.difficulty || 'High-Yield'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{top.duration || '45 mins'}</span>
                  </span>
                  <span>•</span>
                  {/* Channels Status */}
                  <div className="flex items-center gap-2">
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
                      <span>{hasVideo ? 'Video Lecture' : 'Video Available'}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      <Brain className="w-3 h-3" />
                      <span>{flashCount} Flashcards</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button: Enter Lecture Study Room */}
              <div className="shrink-0">
                <Link
                  to={`/student/courses/${examId}/subjects/${subjectId}/modules/${moduleId}/lectures/${top.id}`}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-brand-600/20 transition-all cursor-pointer group/btn"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Enter Study Room</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

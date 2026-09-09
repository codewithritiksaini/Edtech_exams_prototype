import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Layers, 
  FolderTree, 
  Clock, 
  Search, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  BookOpen,
  Award
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';

export default function StudentSubjectsPage() {
  const { examId = 'neet-pg' } = useParams();
  const navigate = useNavigate();

  const [exams] = useState(() => catalogService.getExams());
  const [exam, setExam] = useState(() => catalogService.getExamById(examId) || { id: examId, name: examId.toUpperCase() });
  const [subjects, setSubjects] = useState(() => curriculumService.getSubjectsByExam(examId));
  const [searchQuery, setSearchQuery] = useState('');

  // Simulated student progress per subject
  const progressMap = {
    'sub-neet-cardio': { progress: 85, completed: 7, total: 8, status: 'In Progress' },
    'sub-neet-pulmo': { progress: 40, completed: 3, total: 7, status: 'In Progress' },
    'sub-neet-nephro': { progress: 0, completed: 0, total: 6, status: 'Not Started' },
    'sub-neet-gi': { progress: 0, completed: 0, total: 8, status: 'Not Started' },
  };

  useEffect(() => {
    const foundExam = catalogService.getExamById(examId);
    if (foundExam) setExam(foundExam);
    const subList = curriculumService.getSubjectsByExam(examId);
    setSubjects(subList || []);
  }, [examId]);

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl">
      {/* Top Exam Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {exams.map((ex) => {
          const isCurrent = ex.id === examId;
          return (
            <button
              key={ex.id}
              onClick={() => navigate(`/student/courses/${ex.id}/subjects`)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 cursor-pointer border ${
                isCurrent
                  ? 'bg-white text-brand-700 border-brand-300 shadow-sm ring-2 ring-brand-500/10'
                  : 'bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900'
              }`}
            >
              <span className="text-base">{ex.flag}</span>
              <span>{ex.name}</span>
            </button>
          );
        })}
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link 
              to="/student/courses"
              className="text-xs font-bold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Courses</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
              Level 2 • Subjects Directory
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl">{exam.flag || '🎓'}</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {exam.name} — Clinical Subjects
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                Master individual specialty units. Click on any subject to explore chapters, clinical ECG diagrams, and topic study rooms.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-48 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSubjects.map((sub) => {
          const prog = progressMap[sub.id] || { progress: 0, completed: 0, total: 8, status: 'Not Started' };
          const chapters = curriculumService.getChaptersBySubject(sub.id) || [];

          return (
            <div
              key={sub.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-brand-200 transition-all flex flex-col justify-between group space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    prog.progress > 0
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {prog.progress > 0 ? `${prog.progress}% Mastered` : 'Not Started'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-brand-600 transition-colors">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {sub.description || 'Clinical foundations, diagnostic criteria, and guideline therapeutic regimens.'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full transition-all duration-500"
                      style={{ width: `${prog.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{prog.completed} of {chapters.length || prog.total} Chapters Finished</span>
                    <span>{sub.estimatedHours || 32} Hours</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100">
                <Link
                  to={`/student/courses/${examId}/subjects/${sub.id}/chapters`}
                  className="w-full py-2.5 rounded-xl bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs group/btn"
                >
                  <span>Open Chapters & Units</span>
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

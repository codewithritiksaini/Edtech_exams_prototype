import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Layers, 
  FolderTree, 
  BookOpen, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  GraduationCap,
  HelpCircle
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import { facultyProfileData } from '../../data/mockData';

export default function FacultySubjectsPage() {
  const { examId = 'neet-pg' } = useParams();
  const navigate = useNavigate();

  const [exams] = useState(() => catalogService.getExams());
  const [exam, setExam] = useState(() => catalogService.getExamById(examId) || { id: examId, name: examId.toUpperCase() });
  const [subjects, setSubjects] = useState(() => curriculumService.getSubjectsByExam(examId));
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="space-y-6 animate-in fade-in">
      {/* Top Navigation & Exam Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {exams.map((ex) => {
          const isCurrent = ex.id === examId;
          return (
            <button
              key={ex.id}
              onClick={() => navigate(`/faculty/exams/${ex.id}/subjects`)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 cursor-pointer border ${
                isCurrent
                  ? 'bg-white text-indigo-700 border-indigo-300 shadow-sm ring-2 ring-indigo-500/10'
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
              to="/faculty/exams"
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Exams</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Level 2 • Subjects Directory
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl">{exam.flag || '🎓'}</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {exam.name} — Subjects
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Departmental syllabus units under this licensing track. Your assigned department is highlighted with special authoring permissions.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSubjects.map((sub) => {
          const isCardio = sub.id?.includes('cardio') || sub.name?.toLowerCase().includes('cardio');
          const chapters = curriculumService.getChaptersBySubject(sub.id) || [];
          
          return (
            <div
              key={sub.id}
              className={`bg-white rounded-3xl p-6 border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group space-y-5 ${
                isCardio 
                  ? 'border-indigo-300 ring-2 ring-indigo-500/10' 
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                {/* Badge row */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  {isCardio ? (
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-600 text-white shadow-2xs flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      <span>Your Department Lead</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Standard Unit
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {sub.description || 'Clinical foundations, high-yield diagnostic algorithms and therapeutic guidelines.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-slate-600">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center gap-1">
                    <FolderTree className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{chapters.length || sub.chaptersCount || 8} Chapters</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{sub.estimatedHours || 32} Hours</span>
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100">
                <Link
                  to={`/faculty/exams/${examId}/subjects/${sub.id}/chapters`}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
                    isCardio
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                      : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200'
                  }`}
                >
                  <span>Manage Chapters & Syllabus</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

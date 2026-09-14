import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FolderTree, 
  Layers, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  Sparkles, 
  Search,
  Award
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';

export default function StudentChaptersPage() {
  const { examId = 'neet-pg', subjectId = 'sub-neet-cardio' } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(() => catalogService.getExamById(examId) || { id: examId, name: examId.toUpperCase() });
  const [subject, setSubject] = useState(() => curriculumService.getSubjectById(subjectId));
  const [chapters, setChapters] = useState(() => curriculumService.getChaptersBySubject(subjectId));
  const [searchQuery, setSearchQuery] = useState('');

  // Chapter completion simulation
  const completionMap = {
    'chap-1': { completed: true, score: '94% Recall', status: 'Mastered' },
    'chap-2': { completed: true, score: '88% Recall', status: 'Mastered' },
    'chap-3': { completed: false, score: 'In Progress', status: 'Active Today' },
  };

  useEffect(() => {
    const foundExam = catalogService.getExamById(examId);
    if (foundExam) setExam(foundExam);
    const foundSubject = curriculumService.getSubjectById(subjectId);
    if (foundSubject) setSubject(foundSubject);
    const chapList = curriculumService.getChaptersBySubject(subjectId);
    setChapters(chapList || []);
  }, [examId, subjectId]);

  const filteredChapters = chapters.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link 
              to={`/student/courses/${examId}/subjects`}
              className="text-xs font-bold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Subjects</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
              Level 3 • Unit Chapters
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-600 uppercase">
                {exam.name} • {subject?.name || 'Department Subject'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Unit Chapters & Clinical Syllabus
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
              Follow the recommended learning sequence. Each chapter contains focused clinical topics, video lectures, and active recall flashcards.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredChapters.map((chap, idx) => {
          const topics = curriculumService.getTopicsByChapter(chap.id) || [];
          const comp = completionMap[chap.id] || (idx < 2 ? { completed: true, score: '90% Recall', status: 'Mastered' } : { completed: false, score: 'Pending', status: 'Scheduled' });

          return (
            <div
              key={chap.id}
              className={`bg-white rounded-3xl p-6 border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group space-y-4 ${
                comp.completed
                  ? 'border-emerald-200 ring-1 ring-emerald-500/10'
                  : 'border-slate-200/80 hover:border-brand-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-3 py-1 rounded-xl bg-brand-50 text-brand-700 border border-brand-200/80">
                    Unit #{chap.chapterNumber || (idx + 1)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{chap.totalDuration || '3.5 hrs'}</span>
                    </span>
                    {comp.completed ? (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        {comp.status}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-brand-600 transition-colors">
                    {chap.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {chap.description || 'Clinical diagnostics, pathophysiology, guideline pharmacological regimens.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1 text-xs font-semibold text-slate-600">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                    <span>{topics.length || chap.topicsCount || 3} Study Topics</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-brand-600" />
                    <span>{comp.score}</span>
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Hierarchy Level 4 ➡️ Topics
                </span>
                <Link
                  to={`/student/courses/${examId}/subjects/${subjectId}/chapters/${chap.id}/topics`}
                  className="px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 group/btn cursor-pointer shadow-2xs"
                >
                  <span>Explore Topics</span>
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

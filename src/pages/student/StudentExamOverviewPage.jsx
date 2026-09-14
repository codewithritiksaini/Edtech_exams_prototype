import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  Layers, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Users, 
  Award, 
  Download, 
  FolderTree,
  FileText,
  Video
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import { dashboardUserData } from '../../data/mockData';

export default function StudentExamOverviewPage() {
  const { examId = 'neet-pg' } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(() => catalogService.getExamById(examId) || { id: examId, name: examId.toUpperCase() });
  const [subjects, setSubjects] = useState(() => curriculumService.getSubjectsByExam(examId));

  useEffect(() => {
    const foundExam = catalogService.getExamById(examId);
    if (foundExam) setExam(foundExam);
    const subList = curriculumService.getSubjectsByExam(examId);
    setSubjects(subList || []);
  }, [examId]);

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link 
              to="/student/courses"
              className="text-xs font-bold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to My Courses</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
              Level 1 • Track Overview
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-4xl">{exam.flag || '🎓'}</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {exam.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
                {exam.description || 'Master all 19 medical subjects with high-yield video lectures, spaced repetition recall cards, and clinical diagram lightboxes.'}
              </p>
            </div>
          </div>
        </div>

        <Link
          to={`/student/courses/${examId}/subjects`}
          className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-brand-600/25 transition-all cursor-pointer shrink-0"
        >
          <span>Browse All Subjects</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Track Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Subjects', val: `${subjects.length} Subjects`, icon: Layers, color: 'text-brand-600', bg: 'bg-brand-50 border-brand-200' },
          { label: 'Video Lectures', val: '180+ Hours', icon: Video, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Clinical Question Bank', val: '4,500+ MCQs', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
          { label: 'Target Passing Rate', val: '98.4%', icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                <div className={`w-8 h-8 rounded-xl ${stat.bg} border flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{stat.val}</div>
            </div>
          );
        })}
      </div>

      {/* Featured Clinical Subjects Quick View */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Curriculum Subjects Directory ({subjects.length})
            </h2>
            <p className="text-xs text-slate-500">
              Each subject provides sequenced modules, clinical ECG diagrams, and lecture study rooms.
            </p>
          </div>

          <Link
            to={`/student/courses/${examId}/subjects`}
            className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
          >
            <span>View Full Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subjects.slice(0, 6).map((sub) => {
            const isCardio = sub.id?.includes('cardio');
            return (
              <Link
                key={sub.id}
                to={`/student/courses/${examId}/subjects/${sub.id}/modules`}
                className="p-5 rounded-2xl bg-slate-50 hover:bg-brand-50/50 border border-slate-200/80 hover:border-brand-200 transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-600 font-bold text-xs">
                    <Layers className="w-4 h-4" />
                  </span>
                  {isCardio && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                      85% Mastered
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-brand-600 transition-colors">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {sub.description || 'Clinical foundations, diagnostic criteria, and treatment algorithms.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                  <span>{sub.modulesCount || 8} Modules</span>
                  <span className="font-bold text-brand-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

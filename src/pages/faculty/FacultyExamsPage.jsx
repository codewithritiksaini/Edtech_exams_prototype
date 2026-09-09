import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Layers, 
  FolderTree, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  Search,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import { facultyProfileData } from '../../data/mockData';

export default function FacultyExamsPage() {
  const navigate = useNavigate();
  const [exams] = useState(() => catalogService.getExams());
  const [searchQuery, setSearchQuery] = useState('');

  const assignedMap = {
    'neet-pg': { assigned: true, role: 'Lead Specialist', dept: 'Cardiology & Hemodynamics', authoredChaps: 8 },
    'usmle-step-1': { assigned: true, role: 'Contributing Lead', dept: 'Cardiovascular System', authoredChaps: 6 },
    'plab-1': { assigned: true, role: 'Clinical Examiner', dept: 'Cardiovascular Medicine', authoredChaps: 5 },
    'fmge': { assigned: false, role: 'Department Consultant', dept: 'Cardiology', authoredChaps: 3 }
  };

  const filteredExams = exams.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Academic Hierarchy • Level 1
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Assigned Licensing Tracks
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Curriculum & Exams Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Select an exam track to view and manage subjects, units, chapter syllabus, and topic content studios under your medical department.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search exam track..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredExams.map((exam) => {
          const subjects = curriculumService.getSubjectsByExam(exam.id) || [];
          const assignInfo = assignedMap[exam.id] || { assigned: false, role: 'Reviewer', dept: 'Medicine', authoredChaps: 0 };

          return (
            <div
              key={exam.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group space-y-6"
            >
              <div className="space-y-4">
                {/* Header with Flag & Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{exam.flag}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {exam.region}
                        </span>
                        {assignInfo.assigned && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <GraduationCap className="w-3 h-3 text-indigo-600" />
                            <span>{assignInfo.role}</span>
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {exam.name}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed">
                  {exam.description || 'Comprehensive medical licensing and clinical knowledge prep curriculum.'}
                </p>

                {/* Assigned Department Callout */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Specialty</span>
                    <div className="font-bold text-slate-800">{assignInfo.dept}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Authored Chapters</span>
                    <div className="font-bold text-indigo-600">{assignInfo.authoredChaps} Units</div>
                  </div>
                </div>

                {/* Stat pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                  <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{subjects.length} Subjects</span>
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{exam.studentCount || '1,400+ Candidates'}</span>
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Active Syllabus</span>
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  Hierarchy Level 2 ➡️ Subjects
                </span>
                <Link
                  to={`/faculty/exams/${exam.id}/subjects`}
                  className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs transition-all flex items-center gap-2 group/btn cursor-pointer shadow-2xs"
                >
                  <span>Explore Subjects</span>
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

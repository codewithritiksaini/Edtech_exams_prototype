import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Layers, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Award, 
  Download, 
  Users, 
  Calendar,
  GraduationCap
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import { dashboardUserData } from '../../data/mockData';

export default function StudentCoursesPage() {
  const navigate = useNavigate();
  const [exams] = useState(() => catalogService.getExams());

  // Student enrollments with progress
  const enrollmentMap = {
    'neet-pg': { enrolled: true, progress: 68, completedUnits: 14, totalUnits: 24, examDate: 'March 2026', batch: 'Elite Fast-Track 2026' },
    'usmle-step-1': { enrolled: true, progress: 42, completedUnits: 8, totalUnits: 19, examDate: 'June 2026', batch: 'First-Aid Core Pass Track' },
    'plab-1': { enrolled: false, progress: 0, completedUnits: 0, totalUnits: 16, examDate: 'November 2026', batch: 'NHS Clinical Readiness' },
    'fmge': { enrolled: false, progress: 0, completedUnits: 0, totalUnits: 18, examDate: 'December 2026', batch: 'Standard Track' }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Enrolled Curriculum Tracks
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
              Dr. {dashboardUserData.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Courses & Medical Licensing Tracks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Access your 5-level structured curriculum. Select a course track to navigate through subjects, units, chapter syllabus, and topic study rooms.
          </p>
        </div>

        {/* Quick Syllabus PDF */}
        <div className="shrink-0">
          <a
            href="/assets/docs/Clinical_Study_Guide.pdf"
            target="_blank"
            download
            className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Master Syllabus PDF</span>
          </a>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map((exam) => {
          const enroll = enrollmentMap[exam.id] || { enrolled: false, progress: 0, completedUnits: 0, totalUnits: 16 };
          const subjects = curriculumService.getSubjectsByExam(exam.id) || [];

          return (
            <div
              key={exam.id}
              className={`bg-white rounded-3xl p-6 sm:p-7 border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group space-y-6 ${
                enroll.enrolled ? 'border-brand-200 ring-2 ring-brand-500/10' : 'border-slate-200/80 opacity-90'
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{exam.flag}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {exam.region}
                        </span>
                        {enroll.enrolled ? (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Enrolled & Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            Available Course
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-brand-600 transition-colors">
                        {exam.name}
                      </h2>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {exam.description || 'Complete licensing exam curriculum with 19 clinical subjects, CBT test series, and live grand rounds.'}
                </p>

                {/* Progress Bar for Enrolled Courses */}
                {enroll.enrolled ? (
                  <div className="space-y-1.5 p-4 rounded-2xl bg-brand-50/60 border border-brand-100/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-brand-900">Syllabus Progress</span>
                      <span className="font-black text-brand-600">{enroll.progress}% Completed</span>
                    </div>
                    <div className="w-full h-2.5 bg-brand-100/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-600 rounded-full transition-all duration-500"
                        style={{ width: `${enroll.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>{enroll.completedUnits} of {enroll.totalUnits} Units Mastered</span>
                      <span>Target: {enroll.examDate}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Curriculum Structure</span>
                    <span className="font-bold text-slate-700">{subjects.length || 19} Subjects • 240+ Topics</span>
                  </div>
                )}

                {/* Quick Info Tags */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                  <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-brand-600" />
                    <span>{subjects.length} Subjects</span>
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    <span>180+ Video Hours</span>
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-brand-600" />
                    <span>CBT Simulated Engine</span>
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  Hierarchy Level 1 ➡️ Overview
                </span>

                <Link
                  to={`/student/courses/${exam.id}/subjects`}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all flex items-center gap-2 group/btn cursor-pointer shadow-sm shadow-brand-600/20"
                >
                  <span>Browse Subjects</span>
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

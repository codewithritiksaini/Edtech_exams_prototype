import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  BookOpen, 
  UploadCloud, 
  Video, 
  FileText, 
  Users, 
  BarChart3, 
  Clock, 
  Radio, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Layers,
  Star
} from 'lucide-react';
import { authService, USER_ROLES } from '../../services/authService';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import { peopleService } from '../../services/peopleService';
import { facultyProfileData, dashboardLiveSessions, testService } from '../../data/mockData';

export default function FacultyOverviewPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [exams] = useState(() => catalogService.getExams());
  const [liveSessions] = useState(dashboardLiveSessions);

  useEffect(() => {
    const unsub = authService.subscribe((u) => setCurrentUser(u));
    return unsub;
  }, []);

  const profile = facultyProfileData;
  const tonightSession = liveSessions.find(s => s.status === 'upcoming') || liveSessions[0];

  const currentFaculty = peopleService.getCurrentFacultyProfile();
  const assignedSubjectIds = currentFaculty?.assignedSubjects || [];
  const cleanFacultyName = currentFaculty?.name ? currentFaculty.name.replace(/^Dr\.\s*/i, '').toLowerCase().trim() : '';
  const allSubjects = curriculumService.getSubjects ? curriculumService.getSubjects() : [];
  const myAssignedSubjects = allSubjects.filter(s => 
    assignedSubjectIds.includes(s.id) || 
    (currentFaculty?.email && s.facultyEmail && s.facultyEmail.toLowerCase() === currentFaculty.email.toLowerCase()) ||
    (cleanFacultyName && s.assignedFacultyName && s.assignedFacultyName.toLowerCase().includes(cleanFacultyName))
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Hero Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Command Center
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>{profile.specialization}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, {profile.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            {profile.department} • {profile.degrees} • Department Rating: <span className="font-bold text-amber-600">★ {profile.rating}/5.0</span>
          </p>
        </div>

        {/* Quick Upload CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/faculty/upload"
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Fast Direct Upload</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Candidates', val: profile.stats?.activeStudents || '1,420', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
          { label: 'Questions Authored', val: '86 MCQs', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Live Masterclasses', val: `${profile.stats?.totalLectures || 48} Delivered`, icon: Video, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
          { label: 'Student Satisfaction', val: `${profile.rating || 4.9} / 5.0`, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                <div className={`w-8 h-8 rounded-xl ${kpi.bg} border flex items-center justify-center ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{kpi.val}</div>
            </div>
          );
        })}
      </div>

      {/* Tonight's Live Class Spotlight Card */}
      {tonightSession && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-indigo-500/20">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400">
                  Scheduled Live Masterclass • Tonight
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-indigo-300 font-semibold">{tonightSession.course || 'NEET PG 2026'}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {tonightSession.lecture}
              </h2>

              <p className="text-xs text-slate-300 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {tonightSession.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  {tonightSession.time} ({tonightSession.duration})
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  Expected Cohort: {tonightSession.registeredStudents || 420} Doctors
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={tonightSession.zoomLink || '#'}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Start Live Broadcast</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <Link
                to="/faculty/live-sessions"
                className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all cursor-pointer"
              >
                All Sessions
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Launchpad to Faculty Dedicated Flows */}
      <div className="space-y-3">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
          Faculty Workflows & Tools
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Curriculum & Hierarchy',
              desc: 'Browse exams, assigned subjects, units and manage module syllabus.',
              icon: BookOpen,
              route: '/faculty/exams',
              color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
            },
            {
              title: 'Fast Direct Upload',
              desc: 'Cascading course ➡️ week ➡️ day content uploader for notes & diagrams.',
              icon: UploadCloud,
              route: '/faculty/upload',
              color: 'text-blue-600 bg-blue-50 border-blue-200'
            },
            {
              title: 'Live Grand Rounds',
              desc: 'Schedule upcoming broadcast masterclasses, manage host rooms.',
              icon: Video,
              route: '/faculty/live-sessions',
              color: 'text-rose-600 bg-rose-50 border-rose-200'
            },
            {
              title: 'CBT Question Authoring',
              desc: 'Author clinical vignette MCQs with high-yield rationale and view ranks.',
              icon: FileText,
              route: '/faculty/tests',
              color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
            },
            {
              title: 'Candidate Directory',
              desc: 'Review 1,420 enrolled doctors, target exams and study readiness.',
              icon: Users,
              route: '/faculty/students',
              color: 'text-purple-600 bg-purple-50 border-purple-200'
            },
            {
              title: 'Teaching Analytics',
              desc: 'Cohort completion graphs, video watch drops, and subject accuracy.',
              icon: BarChart3,
              route: '/faculty/analytics',
              color: 'text-amber-600 bg-amber-50 border-amber-200'
            }
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <Link
                key={i}
                to={card.route}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-xl ${card.color} border flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  <span>Open Flow</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Faculty's Assigned Subjects Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Your Assigned Departments & Subjects
            </h3>
            <p className="text-xs text-slate-500">
              Specialist lead access configured for cardiology and emergency medicine across licensing boards.
            </p>
          </div>

          <Link
            to="/faculty/exams"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0"
          >
            <span>View All Exams & Curriculum</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {myAssignedSubjects.map((sub) => {
            const examObj = exams.find(e => e.id === sub.examId);
            const modulesCount = curriculumService.getModules ? curriculumService.getModules(sub.id, sub.examId).length : 0;
            const lecturesCount = curriculumService.getLectures ? curriculumService.getLectures(null, sub.id, sub.examId).length : 0;

            return (
              <div
                key={sub.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-white transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{examObj?.flag || '🩺'}</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Lead Specialist
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400">{examObj?.name || (sub.examId && sub.examId.toUpperCase())}</span>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {sub.name}
                  </h4>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold pt-1 border-t border-slate-200/60">
                  <span>{modulesCount} Modules</span>
                  <span>•</span>
                  <span>{lecturesCount} Lectures</span>
                </div>

                <div className="pt-2">
                  <Link
                    to={`/faculty/exams/${sub.examId}/subjects/${sub.id}/modules`}
                    className="w-full py-2 rounded-xl bg-white group-hover:bg-indigo-600 text-slate-700 group-hover:text-white border border-slate-200 group-hover:border-indigo-600 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>Manage Modules</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

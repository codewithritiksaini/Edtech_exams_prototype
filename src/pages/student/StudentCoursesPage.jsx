import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Download, 
  CheckCircle2, 
  Layers, 
  Calendar, 
  Award, 
  ArrowRight, 
  Play, 
  Sparkles, 
  Clock, 
  Users, 
  ShieldCheck, 
  ChevronRight, 
  GraduationCap, 
  X, 
  FileText, 
  Heart, 
  Wind, 
  Droplets, 
  Activity, 
  Brain, 
  Pill, 
  Microscope, 
  BarChart3,
  Flame,
  Check
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import { learningProgressService } from '../../services/learningProgressService';
import { dashboardUserData } from '../../data/mockData';

// Subject icon helper
const SUBJECT_ICONS = {
  Heart: Heart,
  Wind: Wind,
  Droplet: Droplets,
  Activity: Activity,
  Brain: Brain,
  Pill: Pill,
  Microscope: Microscope
};

// Subject color theme classes
const COLOR_THEMES = {
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    iconBg: 'bg-rose-100 text-rose-700',
    progress: 'bg-rose-600',
    badge: 'bg-rose-100/80 text-rose-800 border-rose-200'
  },
  sky: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-700',
    iconBg: 'bg-sky-100 text-sky-700',
    progress: 'bg-sky-600',
    badge: 'bg-sky-100/80 text-sky-800 border-sky-200'
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    iconBg: 'bg-amber-100 text-amber-700',
    progress: 'bg-amber-600',
    badge: 'bg-amber-100/80 text-amber-800 border-amber-200'
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    iconBg: 'bg-emerald-100 text-emerald-700',
    progress: 'bg-emerald-600',
    badge: 'bg-emerald-100/80 text-emerald-800 border-emerald-200'
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    iconBg: 'bg-indigo-100 text-indigo-700',
    progress: 'bg-indigo-600',
    badge: 'bg-indigo-100/80 text-indigo-800 border-indigo-200'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    iconBg: 'bg-purple-100 text-purple-700',
    progress: 'bg-purple-600',
    badge: 'bg-purple-100/80 text-purple-800 border-purple-200'
  },
  cyan: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-700',
    iconBg: 'bg-cyan-100 text-cyan-700',
    progress: 'bg-cyan-600',
    badge: 'bg-cyan-100/80 text-cyan-800 border-cyan-200'
  }
};

export default function StudentCoursesPage() {
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  // Toast state for syllabus download
  const [toastMessage, setToastMessage] = useState('');

  // Active student course data
  const activeExamId = 'neet-pg';
  const allExams = useMemo(() => catalogService.getExams(), []);
  const activeExam = useMemo(() => {
    return catalogService.getExamById(activeExamId) || allExams[0] || {
      id: 'neet-pg',
      name: 'NEET PG & NExT 2026',
      country: 'India'
    };
  }, [allExams, activeExamId]);

  // Other available tracks (excluding currently enrolled active exam)
  const otherExamTracks = useMemo(() => {
    return allExams.filter(exam => exam.id !== activeExamId);
  }, [allExams, activeExamId]);

  // Active enrolled course subjects from curriculum service
  const enrolledSubjects = useMemo(() => {
    const subs = curriculumService.getSubjects(activeExamId) || [];
    // Mock progression data per subject
    const progressLookup = {
      'sub-neet-cardio': { progress: 72, modulesCount: 8, lecturesCount: 32 },
      'sub-neet-pulmo': { progress: 45, modulesCount: 6, lecturesCount: 24 },
      'sub-neet-nephro': { progress: 20, modulesCount: 5, lecturesCount: 18 },
      'sub-neet-gastro': { progress: 60, modulesCount: 7, lecturesCount: 28 },
      'sub-neet-neuro': { progress: 15, modulesCount: 8, lecturesCount: 30 },
      'sub-neet-pharma': { progress: 35, modulesCount: 6, lecturesCount: 22 },
      'sub-neet-patho': { progress: 50, modulesCount: 7, lecturesCount: 26 },
    };

    return subs.map(sub => ({
      ...sub,
      progress: progressLookup[sub.id]?.progress ?? 25,
      modulesCount: progressLookup[sub.id]?.modulesCount ?? 6,
      lecturesCount: progressLookup[sub.id]?.lecturesCount ?? 20
    }));
  }, [activeExamId]);

  // Search filter
  const filteredSubjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return enrolledSubjects;
    return enrolledSubjects.filter(sub => 
      sub.name.toLowerCase().includes(q) ||
      sub.code.toLowerCase().includes(q) ||
      (sub.description && sub.description.toLowerCase().includes(q)) ||
      (sub.assignedFacultyName && sub.assignedFacultyName.toLowerCase().includes(q))
    );
  }, [enrolledSubjects, searchQuery]);

  const filteredOtherTracks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return otherExamTracks;
    return otherExamTracks.filter(exam =>
      exam.name.toLowerCase().includes(q) ||
      (exam.country && exam.country.toLowerCase().includes(q)) ||
      (exam.purpose && exam.purpose.toLowerCase().includes(q))
    );
  }, [otherExamTracks, searchQuery]);

  // Handle Download Master Syllabus
  const handleDownloadSyllabus = () => {
    setToastMessage(`Official Master Clinical Syllabus (${activeExam.name}) downloaded.`);
    setTimeout(() => setToastMessage(''), 4500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage('')}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-brand-600" />
            <span>Academic Curriculum Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Courses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Your medical exam preparation programs and clinical curriculum.
          </p>
        </div>

        {/* Right-side actions: Search & Download Syllabus */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search curriculum, subjects, codes..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Download Master Syllabus button */}
          <button
            onClick={handleDownloadSyllabus}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-300" />
            <span>Download Master Syllabus</span>
          </button>
        </div>
      </div>

      {/* Search Filter Alert if active */}
      {searchQuery && (
        <div className="bg-brand-50/70 border border-brand-200/80 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs text-brand-800">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-brand-600" />
            <span>
              Filtering by: <strong className="text-brand-900 font-bold">"{searchQuery}"</strong> • Found {filteredSubjects.length} subject{filteredSubjects.length === 1 ? '' : 's'}
            </span>
          </div>
          <button 
            onClick={() => setSearchQuery('')}
            className="text-brand-700 hover:text-brand-900 font-bold underline cursor-pointer text-[11px]"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* 2. Academic Summary Cards (4 Cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 — Enrolled Courses */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Enrolled Courses
            </span>
            <div className="w-9 h-9 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">1</div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Active Course Track</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{dashboardUserData.packageTier}</span>
          </div>
        </div>

        {/* Card 2 — Overall Progress */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Overall Progress
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">32%</div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Curriculum Complete</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '32%' }} />
          </div>
        </div>

        {/* Card 3 — Completed Units */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Completed Units
            </span>
            <div className="w-9 h-9 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              14 <span className="text-sm font-semibold text-slate-400">/ 44</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Units Completed</p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
            30 clinical units remaining
          </div>
        </div>

        {/* Card 4 — Target Exam */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Target Exam
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate" title="NEET PG & NExT">
              NEET PG & NExT
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">2026 Examination Cycle</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="font-bold text-amber-700">{dashboardUserData.daysLeft} Days to Exam</span>
            <span className="text-slate-400 font-medium">NBE Authority</span>
          </div>
        </div>
      </section>

      {/* 3. Active Course Hero Card (Visually Prominent) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Row: Course Title & Badges */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ACTIVE</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                  Standard • 6 Months
                </span>
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                  <span>Verified Medical Residency Prep Track</span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                NEET PG & NExT 2026
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                Your current preparation track • Comprehensive clinical curriculum tailored for India's National Board of Examinations (NBE) & NMC residency admissions.
              </p>
            </div>

            {/* Actions: Continue Learning & View Curriculum */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  const pos = learningProgressService.getCurrentLearningPosition();
                  navigate(`/day/${pos?.dayNumber || 3}?tab=${pos?.resourceKey || 'video'}`);
                }}
                className="px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-brand-600/20 transition-all cursor-pointer group"
              >
                <span>Continue Learning</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* View Curriculum button commented out for now as curriculum is shown directly on My Courses page
              <Link
                to={`/student/courses/${activeExamId}`}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-slate-200"
              >
                <BookOpen className="w-4 h-4 text-slate-600" />
                <span>View Curriculum</span>
              </Link>
              */}
            </div>
          </div>

          {/* Progress Bar & Milestone Status */}
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between text-xs gap-2">
              <span className="font-bold text-slate-700 flex items-center gap-2">
                <span>Curriculum Progression:</span>
                <strong className="text-brand-600 font-black">32% Complete</strong>
              </span>
              <span className="text-slate-500 font-semibold">
                <strong>14 / 44 Units Completed</strong> • 30 Units Remaining
              </span>
            </div>
            
            <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: '32%' }}
              />
            </div>
          </div>

          {/* 4 Metadata Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Exam</span>
              <div className="text-xs font-black text-slate-900">NEET PG & NExT 2026</div>
              <p className="text-[11px] text-slate-500">March 2026 National Cycle</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Plan</span>
              <div className="text-xs font-black text-slate-900">Standard — 6 Months</div>
              <p className="text-[11px] text-emerald-600 font-semibold">Full Q-Bank & CBT Included</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Next Learning</span>
              <div className="text-xs font-black text-brand-600 truncate" title="Day 3: Cardiac Arrhythmias & ECG">
                Day 3: Arrhythmias & ECG
              </div>
              <p className="text-[11px] text-slate-500">Cardiology & Hemodynamics</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Faculty</span>
              <div className="text-xs font-black text-slate-900">Dr. Siddharth V.</div>
              <p className="text-[11px] text-slate-500">+ 4 Clinical Faculty Leads</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Continue Learning Section */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Play className="w-4 h-4 text-brand-600 fill-brand-600" />
            <span>Continue Learning</span>
          </h2>
          <p className="text-xs text-slate-500">Pick up where you left off.</p>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-extrabold uppercase">
                Cardiology & Hemodynamics
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500">
                Module 2 • Arrhythmias & Electrophysiology
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Cardiac Arrhythmias & ECG
            </h3>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Narrow vs wide complex tachycardia, Brugada and Vereckei diagnostic criteria, and emergency antiarrhythmic pharmacology.
            </p>

            {/* Watch progress indicator */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-36 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-brand-600 h-full rounded-full" style={{ width: '68%' }} />
              </div>
              <span className="text-xs font-semibold text-slate-500">
                42 min • <strong className="text-brand-600 font-bold">68% watched</strong>
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => {
                const pos = learningProgressService.getCurrentLearningPosition();
                navigate(`/day/${pos?.dayNumber || 3}?tab=${pos?.resourceKey || 'video'}`);
              }}
              className="px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer group"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Resume Lecture</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Course Progress Overview (Quick Academic Breakdown) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-600" />
            <span>Course Progress</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Academic completion metrics across curriculum levels.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Subjects Progress */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Subjects</span>
              <span className="font-black text-slate-900">5 / 12</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-brand-600 h-full rounded-full" style={{ width: '41%' }} />
            </div>
            <p className="text-[11px] text-slate-500">41% subjects in active progress</p>
          </div>

          {/* Modules Progress */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Modules</span>
              <span className="font-black text-slate-900">14 / 38</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-sky-600 h-full rounded-full" style={{ width: '36%' }} />
            </div>
            <p className="text-[11px] text-slate-500">36% syllabus modules covered</p>
          </div>

          {/* Lectures Progress */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Lectures</span>
              <span className="font-black text-slate-900">46 / 142</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: '32%' }} />
            </div>
            <p className="text-[11px] text-slate-500">32% clinical lectures attended</p>
          </div>

          {/* Overall Completion */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-900">Overall</span>
              <span className="font-black text-emerald-700">32%</span>
            </div>
            <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '32%' }} />
            </div>
            <p className="text-[11px] text-emerald-800 font-semibold">On track for 2026 Examination</p>
          </div>
        </div>
      </section>

      {/* 6. Subject Curriculum Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-600" />
              <span>Course Curriculum</span>
            </h2>
            <p className="text-xs text-slate-500">
              Explore your subjects, modules, and lectures.
            </p>
          </div>

          <span className="text-xs font-semibold text-slate-400 self-start sm:self-auto">
            Showing {filteredSubjects.length} of {enrolledSubjects.length} Subjects
          </span>
        </div>

        {/* Subjects Grid */}
        {filteredSubjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSubjects.map((subject) => {
              const theme = COLOR_THEMES[subject.color] || COLOR_THEMES.indigo;
              const IconComponent = SUBJECT_ICONS[subject.icon] || BookOpen;

              return (
                <div
                  key={subject.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top row: Subject Icon & Code */}
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-2xl ${theme.iconBg} flex items-center justify-center`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
                        {subject.code}
                      </span>
                    </div>

                    {/* Subject Name & Description */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1" title={subject.name}>
                        {subject.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {subject.description || 'Clinical specialty modules, case drills, and high-yield examination pearls.'}
                      </p>
                    </div>

                    {/* Progress Percentage & Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Progress</span>
                        <span className="font-extrabold text-slate-800">{subject.progress}% Complete</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${theme.progress}`}
                          style={{ width: `${subject.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Modules, Lectures, Faculty Info */}
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Curriculum</span>
                        <span className="font-bold text-slate-700">{subject.modulesCount} Modules • {subject.lecturesCount} Lectures</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Lead Faculty</span>
                        <span className="font-bold text-slate-700 truncate block" title={subject.assignedFacultyName || 'AIIMS Faculty Lead'}>
                          {subject.assignedFacultyName || 'Dr. Siddharth V.'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Continue Action */}
                  <div className="pt-2 border-t border-slate-100">
                    <Link
                      to={`/student/courses/${activeExamId}/subjects/${subject.id}/modules`}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-200/80 hover:border-brand-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all group/btn"
                    >
                      <span>Explore Modules</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-2xs space-y-3">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No subjects match "{searchQuery}"</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try searching by subject name, code (e.g. CARD-101, PULM), or clear the search filter.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        )}
      </section>

      {/* 7. Available Exam Tracks ("Explore Other Exam Tracks") */}
      <section className="space-y-4 pt-4 border-t border-slate-200/80">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-brand-600" />
            <span>Explore Other Exam Tracks</span>
          </h2>
          <p className="text-xs text-slate-500">
            Prepare for additional national and international medical licensing pathways.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredOtherTracks.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl" role="img" aria-label={exam.country || 'Flag'}>
                    {exam.id === 'usmle' ? '🇺🇸' : exam.id === 'plab' ? '🇬🇧' : '🇩🇪'}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    Available Course
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {exam.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {exam.purpose || 'Comprehensive clinical medical licensure and residency assessment curriculum.'}
                  </p>
                </div>

                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 font-semibold">Region / Board:</span>
                    <span className="font-bold text-slate-800">{exam.country} • {exam.authority?.split('/')[0] || 'Medical Board'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 font-semibold">Format:</span>
                    <span className="font-semibold text-slate-700">{exam.stages || 2} Stages • CBT & Clinical</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <Link
                  to={`/student/courses/${exam.id}/subjects`}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all group/btn"
                >
                  <span>Explore Subjects</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Layers, 
  Sparkles,
  ArrowRight, 
  Filter, 
  GraduationCap, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  Building2, 
  Globe2, 
  FileText, 
  X,
  AlertTriangle,
  FolderTree,
  Check
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import { peopleService } from '../../services/peopleService';

const getDifficultyBadge = (difficulty) => {
  switch (difficulty) {
    case 'Very High':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'High':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'Moderate–High':
    case 'Moderate-High':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Moderate':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Low':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

export default function FacultyExamsPage() {
  const navigate = useNavigate();

  // Reactive data sources
  const [exams, setExams] = useState(() => catalogService.getExams());
  const [subjects, setSubjects] = useState(() => curriculumService.getSubjects());
  const [modules, setModules] = useState(() => curriculumService.getModules());
  const [lectures, setLectures] = useState(() => curriculumService.getLectures());
  const [currentFaculty, setCurrentFaculty] = useState(() => peopleService.getCurrentFacultyProfile());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [selectedExamDetails, setSelectedExamDetails] = useState(null);

  // Subscriptions to canonical services
  useEffect(() => {
    const unsubCatalog = catalogService.subscribe((payload) => {
      setExams(payload.exams);
    });
    const unsubCurriculum = curriculumService.subscribeCurriculum(() => {
      setSubjects(curriculumService.getSubjects());
      setModules(curriculumService.getModules());
      setLectures(curriculumService.getLectures());
    });
    const handlePeopleUpdated = () => {
      setCurrentFaculty(peopleService.getCurrentFacultyProfile());
    };
    window.addEventListener('medprep-people-updated', handlePeopleUpdated);

    return () => {
      unsubCatalog();
      unsubCurriculum();
      window.removeEventListener('medprep-people-updated', handlePeopleUpdated);
    };
  }, []);

  const assignedSubjectIds = currentFaculty?.assignedSubjects || [];
  const assignedExamsList = currentFaculty?.assignedExams || [];

  // Helper: check if a subject is assigned to current faculty
  const isSubjectAssigned = useMemo(() => {
    return (s) => {
      if (!s) return false;
      const cleanName = currentFaculty?.name ? currentFaculty.name.replace(/^Dr\.\s*/i, '').toLowerCase().trim() : '';
      return (
        assignedSubjectIds.includes(s.id) ||
        (currentFaculty?.email && s.facultyEmail && s.facultyEmail.toLowerCase() === currentFaculty.email.toLowerCase()) ||
        (cleanName && s.assignedFacultyName && s.assignedFacultyName.toLowerCase().includes(cleanName))
      );
    };
  }, [assignedSubjectIds, currentFaculty]);

  // Derived: Strictly Assigned Programs with curriculum metrics & content status counts
  const assignedPrograms = useMemo(() => {
    return exams
      .map(exam => {
        const examSubjects = subjects.filter(s => s.examId === exam.id);
        const myAssignedSubjects = examSubjects.filter(s => isSubjectAssigned(s));
        const examModules = modules.filter(m => m.examId === exam.id);
        const examLectures = lectures.filter(l => l.examId === exam.id);

        const isAssigned = assignedExamsList.includes(exam.id) || myAssignedSubjects.length > 0;
        if (!isAssigned) return null;

        // Content status counts from actual lectures
        const publishedCount = examLectures.filter(l => (l.status || 'Published').toLowerCase() === 'published').length;
        const inReviewCount = examLectures.filter(l => (l.status || '').toLowerCase() === 'in review').length;
        const draftCount = examLectures.filter(l => (l.status || '').toLowerCase() === 'draft').length;

        // Faculty scope description
        let scopeTitle = '';
        let scopeSubtitle = '';

        if (myAssignedSubjects.length > 0) {
          scopeTitle = myAssignedSubjects.map(s => s.name).join(' • ');
          scopeSubtitle = currentFaculty?.assignedWeeks || `${myAssignedSubjects.length} Assigned Subject${myAssignedSubjects.length > 1 ? 's' : ''}`;
        } else {
          scopeTitle = currentFaculty?.specialty || 'Clinical Department Track';
          scopeSubtitle = currentFaculty?.assignedWeeks || 'Full Program Teaching Scope';
        }

        return {
          ...exam,
          totalSubjectsCount: examSubjects.length,
          assignedSubjectsCount: myAssignedSubjects.length,
          myAssignedSubjects,
          totalModulesCount: examModules.length,
          totalLecturesCount: examLectures.length,
          publishedCount,
          inReviewCount,
          draftCount,
          scopeTitle,
          scopeSubtitle
        };
      })
      .filter(Boolean);
  }, [exams, subjects, modules, lectures, currentFaculty, assignedExamsList, isSubjectAssigned]);

  // Filtered assigned programs based on search and country filter
  const filteredPrograms = useMemo(() => {
    return assignedPrograms.filter(exam => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        (exam.name || '').toLowerCase().includes(q) ||
        (exam.fullName || '').toLowerCase().includes(q) ||
        (exam.authority || '').toLowerCase().includes(q) ||
        (exam.country || '').toLowerCase().includes(q) ||
        (exam.scopeTitle || '').toLowerCase().includes(q);

      const matchesCountry = 
        selectedCountryFilter === 'all' || 
        exam.country?.toLowerCase() === selectedCountryFilter.toLowerCase();

      return matchesSearch && matchesCountry;
    });
  }, [assignedPrograms, searchQuery, selectedCountryFilter]);

  // Countries present within the faculty's assigned programs
  const availableCountries = useMemo(() => {
    const set = new Set(assignedPrograms.map(e => e.country).filter(Boolean));
    return Array.from(set).sort();
  }, [assignedPrograms]);

  // Total summary metrics across all assigned tracks
  const totalAssignedSubjectsCount = useMemo(() => {
    return assignedPrograms.reduce((acc, p) => acc + p.assignedSubjectsCount, 0);
  }, [assignedPrograms]);

  const totalAssignedLecturesCount = useMemo(() => {
    return assignedPrograms.reduce((acc, p) => acc + p.totalLecturesCount, 0);
  }, [assignedPrograms]);

  return (
    <div className="space-y-6 animate-in fade-in max-w-7xl">
      {/* ======================================================================= */}
      {/* HEADER BANNER — ACADEMIC LAUNCHPAD FOR ASSIGNED PROGRAMS                */}
      {/* ======================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Academic Console
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{currentFaculty?.name || 'Faculty Member'}</span>
            </span>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {currentFaculty?.specialty || 'Clinical Specialist'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Assigned Programs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
            Explore the licensing programs, subjects, modules, and lectures assigned to your teaching scope.
          </p>
        </div>

        {/* Governance Info Pill */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-slate-600 text-xs flex items-center gap-3 shrink-0">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <div className="font-bold text-slate-900">Curriculum Scope</div>
            <div className="text-[11px] text-slate-400">Programs provisioned by Institutional Administration</div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* KPI METRIC STRIP                                                        */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Programs</span>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600">{assignedPrograms.length}</div>
          <span className="text-[11px] text-slate-400 font-medium">Active teaching tracks</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Subjects</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalAssignedSubjectsCount}</div>
          <span className="text-[11px] text-slate-400 font-medium">Departments under your lead</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Curriculum Lectures</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalAssignedLecturesCount}</div>
          <span className="text-[11px] text-slate-400 font-medium">Across assigned tracks</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Teaching Role</span>
          <div className="text-sm font-extrabold text-emerald-700 truncate mt-1">Lead Faculty</div>
          <span className="text-[11px] text-slate-400 font-medium">Curriculum & Content Author</span>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* TOOLBAR: SEARCH, COUNTRY FILTER & VIEW TOGGLE                          */}
      {/* ======================================================================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assigned programs, authority, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Country Filter (Scoped to assigned programs) */}
          {availableCountries.length > 1 && (
            <div className="relative w-full sm:w-44">
              <select
                value={selectedCountryFilter}
                onChange={(e) => setSelectedCountryFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Jurisdictions</option>
                {availableCountries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <span className="text-xs text-slate-400 font-medium hidden md:inline">
            Showing {filteredPrograms.length} of {assignedPrograms.length} Assigned {assignedPrograms.length === 1 ? 'Program' : 'Programs'}
          </span>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* EMPTY STATES                                                            */}
      {/* ======================================================================= */}
      {assignedPrograms.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs max-w-lg mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-slate-900">No Assigned Programs</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            You currently have no licensing programs assigned to your faculty profile. Please contact the institutional academic administrator to provision examination tracks for your department.
          </p>
        </div>
      )}

      {assignedPrograms.length > 0 && filteredPrograms.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs space-y-3">
          <Search className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching assigned programs</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No programs within your teaching assignment match the query <strong className="text-slate-700">"{searchQuery}"</strong>. Try clearing your search query or jurisdiction filter.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCountryFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Clear Search & Filters
            </button>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* CARDS VIEW — INFORMATION HIERARCHY AS SPECIFIED IN PHASE 1B             */}
      {/* ======================================================================= */}
      {viewMode === 'cards' && filteredPrograms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map(exam => (
            <div
              key={exam.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-indigo-200"
            >
              <div className="p-6 space-y-4">
                {/* Header: Flag, Title & Assigned Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10.5px] font-black border border-emerald-200 flex items-center gap-1">
                    <Award className="w-3 h-3 text-emerald-600" />
                    <span>Assigned Program</span>
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getDifficultyBadge(exam.difficulty)}`}>
                    {exam.difficulty || 'Moderate'}
                  </span>
                </div>

                {/* Exam Title & Authority */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {exam.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                      {exam.fullName}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                      {exam.authority || 'Official Medical Board'} • {exam.country || 'International'}
                    </p>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* FACULTY SCOPE SECTION                                         */}
                {/* ------------------------------------------------------------- */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100/90 space-y-1">
                  <span className="text-[9.5px] font-black tracking-wider text-indigo-500 uppercase block">
                    Faculty Scope
                  </span>
                  <div className="text-xs font-black text-indigo-950 line-clamp-1">
                    {exam.scopeTitle}
                  </div>
                  <div className="text-[11px] text-indigo-700/80 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span className="truncate">{exam.scopeSubtitle}</span>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* CURRICULUM METRICS SECTION                                    */}
                {/* ------------------------------------------------------------- */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Curriculum
                  </span>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Subjects</div>
                      <div className="text-sm font-black text-slate-900 mt-0.5 flex items-center justify-center gap-1">
                        <span>{exam.totalSubjectsCount}</span>
                        {exam.assignedSubjectsCount > 0 && (
                          <span className="text-[9px] text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded font-extrabold" title="Assigned to your department">
                            {exam.assignedSubjectsCount} Yours
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Modules</div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">{exam.totalModulesCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Lectures</div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">{exam.totalLecturesCount}</div>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* CONTENT STATUS SECTION                                        */}
                {/* ------------------------------------------------------------- */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Content Status
                  </span>
                  <div className="flex items-center gap-2 text-[11px] font-bold flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{exam.publishedCount} Published</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>{exam.inReviewCount} In Review</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      <span>{exam.draftCount} Draft</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* CARD FOOTER ACTIONS: DETAILS + EXPLORE SUBJECTS               */}
              {/* ------------------------------------------------------------- */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2.5">
                <button
                  onClick={() => setSelectedExamDetails(exam)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
                  title="View Exam Specifications"
                >
                  Details
                </button>
                <Link
                  to={`/faculty/exams/${exam.id}/subjects`}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <span>Explore Subjects</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================================= */}
      {/* TABLE VIEW — CANONICAL MODEL COLUMNS AS SPECIFIED IN PHASE 1B          */}
      {/* ======================================================================= */}
      {viewMode === 'table' && filteredPrograms.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[1080px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3.5 pl-3">Program</th>
                <th className="pb-3.5 px-3">Jurisdiction & Authority</th>
                <th className="pb-3.5 px-3">Faculty Scope</th>
                <th className="pb-3.5 px-3">Curriculum Size</th>
                <th className="pb-3.5 px-3">Content Status</th>
                <th className="pb-3.5 text-right pr-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrograms.map(exam => (
                <tr key={exam.id} className="hover:bg-slate-50/70 transition-colors group">
                  {/* Program Column (Clean Academic Avatar, Name & Full Title) */}
                  <td className="py-4.5 pl-3 pr-3 font-bold text-slate-900 min-w-[260px] max-w-[320px]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-100/70 transition-colors">
                        <GraduationCap className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/faculty/exams/${exam.id}/subjects`}
                          className="hover:text-indigo-600 transition-colors font-black text-slate-900 text-sm line-clamp-1 block"
                        >
                          {exam.name}
                        </Link>
                        <div className="text-[11px] text-slate-500 font-medium line-clamp-1 leading-tight mt-0.5">
                          {exam.fullName}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 font-medium mt-0.5">
                          ID: {exam.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Jurisdiction & Authority */}
                  <td className="py-4.5 px-3 text-slate-600 min-w-[180px]">
                    <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Globe2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{exam.country || 'International'}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {exam.authority || 'Official Medical Board'}
                    </div>
                  </td>

                  {/* Faculty Scope */}
                  <td className="py-4.5 px-3 min-w-[220px]">
                    <div className="space-y-1">
                      <div className="font-bold text-indigo-950 text-xs line-clamp-1">
                        {exam.scopeTitle}
                      </div>
                      <div className="text-[11px] text-indigo-700/80 font-medium flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="truncate">{exam.scopeSubtitle}</span>
                      </div>
                    </div>
                  </td>

                  {/* Curriculum Size */}
                  <td className="py-4.5 px-3 min-w-[180px] whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{exam.totalSubjectsCount} Subjects</span>
                        {exam.assignedSubjectsCount > 0 && (
                          <span className="text-[9.5px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-extrabold border border-emerald-200/60">
                            {exam.assignedSubjectsCount} Yours
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {exam.totalModulesCount} Modules • {exam.totalLecturesCount} Lectures
                      </div>
                    </div>
                  </td>

                  {/* Content Status Chips */}
                  <td className="py-4.5 px-3 min-w-[210px] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{exam.publishedCount} Pub</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/70 text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span>{exam.inReviewCount} Rev</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        <span>{exam.draftCount} Draft</span>
                      </span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-4.5 pl-3 pr-3 text-right min-w-[210px] whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedExamDetails(exam)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                        title="View Syllabus & Authority Metadata"
                      >
                        Details
                      </button>
                      <Link
                        to={`/faculty/exams/${exam.id}/subjects`}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all inline-flex items-center gap-1.5 shadow-xs shadow-indigo-600/20 cursor-pointer"
                      >
                        <span>Explore Subjects</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================================================= */}
      {/* PROGRAM DETAILS MODAL (STRICTLY READ-ONLY EDUCATIONAL SPECIFICATION)    */}
      {/* ======================================================================= */}
      {selectedExamDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {selectedExamDetails.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedExamDetails.fullName}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Jurisdiction: {selectedExamDetails.country || 'Global'} • {selectedExamDetails.authority || 'Governing Authority'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedExamDetails(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Difficulty Standard</span>
                  <div className="font-extrabold text-slate-900">{selectedExamDetails.difficulty || 'Moderate'}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Examination Stages</span>
                  <div className="font-extrabold text-slate-900">{selectedExamDetails.stages || 1} Testing Stages</div>
                </div>
              </div>

              {/* Faculty Responsibility */}
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-1 text-indigo-950">
                <div className="font-black text-xs flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Your Departmental Responsibility</span>
                </div>
                <p className="text-xs font-bold text-indigo-900">
                  {selectedExamDetails.scopeTitle}
                </p>
                <p className="text-[11px] text-indigo-700/80">
                  {selectedExamDetails.scopeSubtitle}
                </p>
              </div>

              {selectedExamDetails.purpose && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Academic Purpose</label>
                  <p className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-slate-700 leading-relaxed">
                    {selectedExamDetails.purpose}
                  </p>
                </div>
              )}

              {selectedExamDetails.examStructure && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Exam Structure & Format</label>
                  <p className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-slate-700 leading-relaxed">
                    {selectedExamDetails.examStructure}
                  </p>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1 text-slate-700">
                <div className="font-black text-xs flex items-center gap-1.5 text-slate-900">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Curriculum Allocation in LMS</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  This track contains {selectedExamDetails.totalSubjectsCount} academic subjects, {selectedExamDetails.totalModulesCount} syllabus modules, and {selectedExamDetails.totalLecturesCount} structured clinical lectures.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 shrink-0">
              <button
                onClick={() => setSelectedExamDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              <Link
                to={`/faculty/exams/${selectedExamDetails.id}/subjects`}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm shadow-indigo-600/20 cursor-pointer"
              >
                <span>Explore Assigned Subjects</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

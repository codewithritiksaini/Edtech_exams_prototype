import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  UploadCloud, 
  Users, 
  Video, 
  FileText, 
  FileCheck,
  BarChart3, 
  ChevronDown, 
  ChevronRight, 
  Pin, 
  PinOff, 
  X, 
  GraduationCap,
  HelpCircle,
  Clock 
} from 'lucide-react';
import { peopleService } from '../services/peopleService';
import { curriculumService } from '../services/curriculumService';
import { doubtsService } from '../services/doubtsService';

export default function FacultySidebar({ 
  activeTab, 
  onSelectTab, 
  isPinned = true, 
  onTogglePin, 
  isOpenMobile, 
  onCloseMobile,
  isOpen,
  onClose 
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    academic: false,
    teaching: false,
    assessments: false,
    students: false
  });

  // Support both external onTogglePin and local internal toggle fallback
  const [internalPinned, setInternalPinned] = useState(isPinned);
  const effectivePinned = onTogglePin ? isPinned : internalPinned;
  const togglePin = () => {
    if (onTogglePin) {
      onTogglePin();
    } else {
      setInternalPinned(prev => !prev);
    }
  };

  const isMobileOpen = isOpenMobile !== undefined ? isOpenMobile : (isOpen || false);
  const handleClose = onCloseMobile || onClose;

  // The sidebar is expanded if it is pinned OR currently hovered
  const isExpanded = effectivePinned || isHovered;

  const currentFaculty = peopleService.getCurrentFacultyProfile();
  const assignedSubjectIds = currentFaculty?.assignedSubjects || [];
  const allSubjects = curriculumService.getSubjects ? curriculumService.getSubjects() : [];
  const myAssignedSubjects = allSubjects.filter(s => assignedSubjectIds.includes(s.id));
  const assignedNames = myAssignedSubjects.map(s => s.name);
  const displayAssignmentTitle = assignedNames.length > 0 
    ? (assignedNames.slice(0, 2).join(' & ') + (assignedNames.length > 2 ? ` +${assignedNames.length - 2} more` : ''))
    : (currentFaculty?.specialty || 'General Faculty Scope');
  const facultyExamCount = currentFaculty?.assignedExams?.length || 1;
  const facultySubjectCount = assignedSubjectIds.length || myAssignedSubjects.length || 1;

  const toggleSection = (sectionKey) => {
    if (!isExpanded) return;
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const TAB_ROUTES = {
    overview: '/faculty/dashboard',
    dashboard: '/faculty/dashboard',
    exams: '/faculty/exams',
    schedule: '/faculty/schedule',
    availability: '/faculty/availability',
    upload: '/faculty/upload',
    students: '/faculty/students',
    doubts: '/faculty/doubts',
    live: '/faculty/live-sessions',
    tests: '/faculty/tests',
    questions: '/faculty/questions',
    samplePapers: '/faculty/sample-papers',
    analytics: '/faculty/analytics',
  };

  const isTabActive = (tabId) => {
    if (activeTab) {
      if (tabId === 'overview' || tabId === 'dashboard') {
        return activeTab === 'overview' || activeTab === 'dashboard';
      }
      return activeTab === tabId;
    }
    const p = location.pathname;
    if (tabId === 'overview' || tabId === 'dashboard') {
      return p === '/faculty' || p === '/faculty/dashboard' || p === '/faculty/legacy';
    }
    if (tabId === 'exams') return p.startsWith('/faculty/exams');
    if (tabId === 'schedule') return p.startsWith('/faculty/schedule');
    if (tabId === 'availability') return p.startsWith('/faculty/availability');
    if (tabId === 'upload') return p.startsWith('/faculty/upload');
    if (tabId === 'students') return p.startsWith('/faculty/students');
    if (tabId === 'doubts') return p.startsWith('/faculty/doubts');
    if (tabId === 'live') return p.startsWith('/faculty/live-sessions');
    if (tabId === 'tests') return p.startsWith('/faculty/tests');
    if (tabId === 'questions') return p.startsWith('/faculty/questions');
    if (tabId === 'samplePapers') return p.startsWith('/faculty/sample-papers');
    if (tabId === 'analytics') return p.startsWith('/faculty/analytics');
    return false;
  };

  const handleTabClick = (tabId) => {
    if (onSelectTab) {
      onSelectTab(tabId);
    }
    if (TAB_ROUTES[tabId]) {
      navigate(TAB_ROUTES[tabId]);
    }
    if (handleClose) handleClose();
    if (!effectivePinned) {
      setIsHovered(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={handleClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Desktop Layout Spacer */}
      <div 
        className={`hidden lg:block shrink-0 transition-all duration-200 ease-in-out ${
          effectivePinned ? 'w-[305px]' : 'w-20'
        }`}
      />

      {/* Persistent Sidebar / Floating Rail */}
      <aside 
        onMouseEnter={() => !effectivePinned && setIsHovered(true)}
        onMouseLeave={() => !effectivePinned && setIsHovered(false)}
        className={`fixed top-0 lg:top-16 left-0 z-50 h-screen lg:h-[calc(100vh-4rem)] bg-white border-r border-slate-200 transition-all duration-200 ease-in-out flex flex-col justify-between ${
          isExpanded 
            ? 'w-[305px]' 
            : 'w-20'
        } ${
          !effectivePinned && isHovered 
            ? 'shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/5' 
            : effectivePinned 
              ? 'shadow-none' 
              : 'shadow-xs'
        } ${
          isMobileOpen 
            ? 'translate-x-0' 
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        
        {/* Navigation Items Area */}
        <div className="p-2.5 space-y-2 overflow-y-auto custom-sidebar-scroll flex-grow overflow-x-hidden">
          
          {/* Mobile Close Bar */}
          <div className="flex lg:hidden items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Portal
            </span>
            <button
              onClick={handleClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop Pin / Unpin Toolbar */}
          <div className="hidden lg:flex items-center justify-between pb-2 border-b border-slate-100 min-h-[36px]">
            {isExpanded ? (
              <>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 pl-1.5 whitespace-nowrap">
                  Command Center
                </span>
                <button
                  id="btn-faculty-sidebar-pin-toggle"
                  type="button"
                  onClick={togglePin}
                  className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    effectivePinned 
                      ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-2xs' 
                      : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/60 border border-transparent hover:border-indigo-100'
                  }`}
                  title={effectivePinned ? 'Sidebar is Pinned' : 'Sidebar is Unpinned'}
                >
                  {effectivePinned ? (
                    <>
                      <Pin className="w-3.5 h-3.5 text-indigo-600 rotate-45 shrink-0" />
                      <span className="text-[10px] font-bold whitespace-nowrap">Pinned</span>
                    </>
                  ) : (
                    <>
                      <PinOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">Unpinned</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="w-full flex justify-center">
                <button
                  id="btn-faculty-sidebar-pin-rail-toggle"
                  type="button"
                  onClick={togglePin}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                  title="Click to Pin sidebar open"
                >
                  <PinOff className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* SECTION 1: COMMAND CENTER (DASHBOARD) */}
          <div className="space-y-1">
            <button
              onClick={() => handleTabClick('overview')}
              title={!isExpanded ? 'Dashboard Overview' : undefined}
              className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isExpanded ? 'gap-3 px-3 py-2' : 'justify-center p-2.5'
              } ${
                isTabActive('overview')
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${isTabActive('overview') ? 'text-indigo-600' : 'text-slate-400'}`} />
              {isExpanded && <span className="whitespace-nowrap">Dashboard</span>}
            </button>
          </div>

          {/* SECTION 2: ACADEMIC (MY PROGRAMS) */}
          <div className="space-y-1 pt-1.5 border-t border-slate-100">
            {isExpanded ? (
              <button
                onClick={() => toggleSection('academic')}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="whitespace-nowrap">Academic</span>
                {collapsedSections.academic ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="my-1 border-t border-slate-100" />
            )}

            {(!collapsedSections.academic || !isExpanded) && (
              <div className="space-y-1">
                {/* My Programs */}
                <button
                  onClick={() => handleTabClick('exams')}
                  title={!isExpanded ? 'My Programs (Assigned Curriculum)' : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
                  } ${
                    isTabActive('exams')
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                    <BookOpen className={`w-4 h-4 shrink-0 ${isTabActive('exams') ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {isExpanded && <span className="whitespace-nowrap shrink-0">My Programs</span>}
                  </div>
                  {isExpanded && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                      Assigned
                    </span>
                  )}
                </button>

                {/* Quick Content Import */}
                <button
                  onClick={() => handleTabClick('upload')}
                  title={!isExpanded ? 'Quick Content Import' : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
                  } ${
                    isTabActive('upload')
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                    <UploadCloud className={`w-4 h-4 shrink-0 ${isTabActive('upload') ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {isExpanded && <span className="whitespace-nowrap shrink-0">Quick Content Import</span>}
                  </div>
                  {isExpanded && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                      Import
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* SECTION 3: TEACHING */}
          <div className="space-y-1 pt-1.5 border-t border-slate-100">
            {isExpanded ? (
              <button
                onClick={() => toggleSection('teaching')}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="whitespace-nowrap">Teaching</span>
                {collapsedSections.teaching ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="my-1 border-t border-slate-100" />
            )}

            {(!collapsedSections.teaching || !isExpanded) && (
              <div className="space-y-1">
                {/* Teaching Schedule */}
                <button
                  onClick={() => handleTabClick('schedule')}
                  title={!isExpanded ? 'My Schedule (Classes)' : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
                  } ${
                    isTabActive('schedule')
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                    <Calendar className={`w-4 h-4 shrink-0 ${isTabActive('schedule') ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {isExpanded && <span className="whitespace-nowrap shrink-0">My Schedule</span>}
                  </div>
                  {isExpanded && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                      Classes
                    </span>
                  )}
                </button>

                {/* My Availability */}
                <button
                  onClick={() => handleTabClick('availability')}
                  title={!isExpanded ? 'My Availability (Slots)' : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
                  } ${
                    isTabActive('availability')
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                    <Clock className={`w-4 h-4 shrink-0 ${isTabActive('availability') ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {isExpanded && <span className="whitespace-nowrap shrink-0">My Availability</span>}
                  </div>
                  {isExpanded && (
                    <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                      Slots
                    </span>
                  )}
                </button>

                {/* Live Sessions */}
                <button
                  onClick={() => handleTabClick('live')}
                  title={!isExpanded ? 'Live Sessions' : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
                  } ${
                    isTabActive('live')
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                    <Video className={`w-4 h-4 shrink-0 ${isTabActive('live') ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {isExpanded && <span className="whitespace-nowrap shrink-0">Live Sessions</span>}
                  </div>
                  {isExpanded && (
                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                      Live
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* SECTION 4: ASSESSMENTS */}
          <div className="space-y-1 pt-1.5 border-t border-slate-100">
            {isExpanded ? (
              <button
                onClick={() => toggleSection('assessments')}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="whitespace-nowrap">Assessments</span>
                {collapsedSections.assessments ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="my-1 border-t border-slate-100" />
            )}

            {(!collapsedSections.assessments || !isExpanded) && (
              <div className="space-y-1">
                {/* Tests */}
                <button
                  onClick={() => handleTabClick('tests')}
                  title={!isExpanded ? 'Tests & CBT Engine' : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
                  } ${
                    isTabActive('tests')
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                    <FileText className={`w-4 h-4 shrink-0 ${isTabActive('tests') ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {isExpanded && <span className="whitespace-nowrap shrink-0">Tests</span>}
                  </div>
                  {isExpanded && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                      CBT Engine
                    </span>
                  )}
                </button>

                {/* Question Bank */}
                <button
                  onClick={() => handleTabClick('questions')}
                  title={!isExpanded ? 'Question Bank (Item Repository)' : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
                  } ${
                    isTabActive('questions')
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                    <HelpCircle className={`w-4 h-4 shrink-0 ${isTabActive('questions') ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {isExpanded && <span className="whitespace-nowrap shrink-0">Question Bank</span>}
                  </div>
                  {isExpanded && (
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                      Item Bank
                    </span>
                  )}
                </button>

                {/* Sample Papers */}
                <button
                  onClick={() => handleTabClick('samplePapers')}
                  title={!isExpanded ? 'Sample Papers & PDFs' : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
                  } ${
                    isTabActive('samplePapers')
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                    <FileCheck className={`w-4 h-4 shrink-0 ${isTabActive('samplePapers') ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {isExpanded && <span className="whitespace-nowrap shrink-0">Sample Papers</span>}
                  </div>
                  {isExpanded && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                      PDFs
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* SECTION 5: STUDENTS */}
          <div className="space-y-1 pt-1.5 border-t border-slate-100">
            {isExpanded ? (
              <button
                onClick={() => toggleSection('students')}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="whitespace-nowrap">Students</span>
                {collapsedSections.students ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="my-1 border-t border-slate-100" />
            )}

            {(!collapsedSections.students || !isExpanded) && (
              <div className="space-y-1">
                {/* My Students */}
                <button
                  onClick={() => handleTabClick('students')}
                  title={!isExpanded ? `My Students (${peopleService.getStudentsForScope(currentFaculty?.assignedExams || []).length})` : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
                  } ${
                    isTabActive('students')
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                    <Users className={`w-4 h-4 shrink-0 ${isTabActive('students') ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {isExpanded && <span className="whitespace-nowrap shrink-0">My Students</span>}
                  </div>
                  {isExpanded && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                      {peopleService.getStudentsForScope(currentFaculty?.assignedExams || []).length}
                    </span>
                  )}
                </button>

                {/* Doubts & Q&A */}
                <button
                  onClick={() => handleTabClick('doubts')}
                  title={!isExpanded ? 'Doubts & Q&A Hub' : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
                  } ${
                    isTabActive('doubts')
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                    <HelpCircle className={`w-4 h-4 shrink-0 ${isTabActive('doubts') ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {isExpanded && <span className="whitespace-nowrap shrink-0">Doubts & Q&A</span>}
                  </div>
                  {isExpanded && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto ${
                      (doubtsService.getDoubtStatsForScope ? doubtsService.getDoubtStatsForScope(currentFaculty?.assignedExams || []).unresolved : 0) > 0
                        ? 'bg-rose-100 text-rose-700 font-black'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {(doubtsService.getDoubtStatsForScope ? doubtsService.getDoubtStatsForScope(currentFaculty?.assignedExams || []).unresolved : 0) > 0
                        ? `${doubtsService.getDoubtStatsForScope(currentFaculty?.assignedExams || []).unresolved} Open`
                        : 'Resolved'}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* SECTION 6: INSIGHTS (ANALYTICS) */}
          <div className="space-y-1 pt-1.5 border-t border-slate-100">
            <button
              onClick={() => handleTabClick('analytics')}
              title={!isExpanded ? 'Analytics & Performance' : undefined}
              className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
              } ${
                isTabActive('analytics')
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                <BarChart3 className={`w-4 h-4 shrink-0 ${isTabActive('analytics') ? 'text-indigo-600' : 'text-slate-400'}`} />
                {isExpanded && <span className="whitespace-nowrap shrink-0">Analytics</span>}
              </div>
              {isExpanded && (
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                  KPIs
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Bottom Sidebar Box: Teaching Assignment Scope Card */}
        <div className="p-2.5 border-t border-slate-100 bg-slate-50/70">
          {isExpanded ? (
            <div className="p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-200/80 shadow-2xs space-y-1 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="whitespace-nowrap uppercase text-[10px] tracking-wider text-indigo-700 font-extrabold">
                  Teaching Assignment
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 truncate" title={displayAssignmentTitle}>
                {displayAssignmentTitle}
              </div>
              <p className="text-[10.5px] text-slate-600 leading-snug">
                {facultySubjectCount} Subject{facultySubjectCount > 1 ? 's' : ''} • {facultyExamCount} Exam Track{facultyExamCount > 1 ? 's' : ''}
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div 
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs cursor-pointer hover:border-indigo-300 transition-colors"
                title={`Teaching Assignment: ${displayAssignmentTitle} (${facultySubjectCount} Subjects • ${facultyExamCount} Exams)`}
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
          )}
        </div>

      </aside>
    </>
  );
}

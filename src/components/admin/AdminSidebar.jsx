import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Layers,
  FolderTree,
  Calendar,
  Package, 
  Users, 
  GraduationCap, 
  UploadCloud, 
  Video, 
  FileText, 
  BarChart3, 
  ChevronDown, 
  ChevronRight, 
  Crown, 
  X, 
  Pin, 
  PinOff 
} from 'lucide-react';
import { authService, USER_ROLES } from '../../services/authService';

export default function AdminSidebar({ 
  activeTab, 
  onSelectTab, 
  isPinned = true, 
  onTogglePin, 
  isOpenMobile, 
  onCloseMobile 
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [isHovered, setIsHovered] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    courseSetup: false,
    people: false,
    contentSchedule: false
  });

  useEffect(() => {
    const unsubscribe = authService.subscribe((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;

  // The sidebar is expanded if it is pinned OR currently hovered
  const isExpanded = isPinned || isHovered;

  const toggleSection = (sectionKey) => {
    // Only allow collapsing sub-sections when expanded
    if (!isExpanded) return;
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const TAB_ROUTES = {
    dashboard: '/admin/dashboard',
    exams: '/admin/exams',
    subjects: '/admin/exams/neet-pg/subjects',
    curriculum: '/admin/exams/neet-pg/subjects/sub-neet-cardio/chapters',
    schedule: '/admin/schedule/neet-pg',
    packages: '/admin/packages',
    faculty: '/admin/faculty',
    students: '/admin/students',
    content: '/admin/content-repository',
    live: '/admin/live-sessions',
    tests: '/admin/tests',
    analytics: '/admin/analytics',
  };

  const isTabActive = (tabId) => {
    if (activeTab) return activeTab === tabId;
    const p = location.pathname;
    if (tabId === 'dashboard') return p === '/admin' || p === '/admin/dashboard';
    if (tabId === 'exams') return p === '/admin/exams' || (p.startsWith('/admin/exams') && !p.includes('/subjects'));
    if (tabId === 'subjects') return p.includes('/subjects') && !p.includes('/chapters');
    if (tabId === 'curriculum') return p.includes('/chapters') || p.includes('/topics');
    if (tabId === 'schedule') return p.startsWith('/admin/schedule');
    if (tabId === 'packages') return p.startsWith('/admin/packages');
    if (tabId === 'faculty') return p.startsWith('/admin/faculty');
    if (tabId === 'students') return p.startsWith('/admin/students');
    if (tabId === 'content') return p.startsWith('/admin/content-repository');
    if (tabId === 'live') return p.startsWith('/admin/live-sessions');
    if (tabId === 'tests') return p.startsWith('/admin/tests');
    if (tabId === 'analytics') return p.startsWith('/admin/analytics');
    return false;
  };

  const handleTabClick = (tabId) => {
    if (onSelectTab) {
      onSelectTab(tabId);
    } else if (TAB_ROUTES[tabId]) {
      navigate(TAB_ROUTES[tabId]);
    }
    if (onCloseMobile) onCloseMobile();
    // If not pinned, collapse back on tab selection
    if (!isPinned) {
      setIsHovered(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Desktop Layout Spacer:
          When pinned: takes full 305px in document flow.
          When unpinned: takes compact 80px rail space so content doesn't jump on hover! */}
      <div 
        className={`hidden lg:block shrink-0 transition-all duration-200 ease-in-out ${
          isPinned ? 'w-[305px]' : 'w-20'
        }`}
      />

      {/* Persistent Sidebar / Floating Rail */}
      <aside 
        onMouseEnter={() => !isPinned && setIsHovered(true)}
        onMouseLeave={() => !isPinned && setIsHovered(false)}
        className={`fixed top-0 lg:top-16 left-0 z-50 h-screen lg:h-[calc(100vh-4rem)] bg-white border-r border-slate-200 transition-all duration-200 ease-in-out flex flex-col justify-between ${
          isExpanded 
            ? 'w-[305px]' 
            : 'w-20'
        } ${
          !isPinned && isHovered 
            ? 'shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/5' 
            : isPinned 
              ? 'shadow-none' 
              : 'shadow-xs'
        } ${
          isOpenMobile 
            ? 'translate-x-0' 
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        
        {/* Navigation Items Area with Sleek Custom Scrollbar */}
        <div className="p-2.5 space-y-2 overflow-y-auto custom-sidebar-scroll flex-grow overflow-x-hidden">
          
          {/* Mobile Close Bar (Mobile Only) */}
          <div className="flex lg:hidden items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isAdmin ? 'Admin Portal' : 'Faculty Portal'}
            </span>
            <button
              onClick={onCloseMobile}
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
                  {isAdmin ? 'Administration' : 'Faculty Console'}
                </span>
                <button
                  id="btn-sidebar-pin-toggle"
                  type="button"
                  onClick={onTogglePin}
                  className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isPinned 
                      ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-2xs' 
                      : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/60 border border-transparent hover:border-indigo-100'
                  }`}
                  title={isPinned ? 'Sidebar is Pinned (Click to Unpin & auto-collapse)' : 'Sidebar is Unpinned (Click to Pin open)'}
                >
                  {isPinned ? (
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
                  id="btn-sidebar-pin-rail-toggle"
                  type="button"
                  onClick={onTogglePin}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                  title="Click to Pin sidebar open (or hover to extend)"
                >
                  <PinOff className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* SECTION 1: DASHBOARD OVERVIEW */}
          <div className="space-y-1">
            <button
              onClick={() => handleTabClick('dashboard')}
              title={!isExpanded ? 'Dashboard Overview' : undefined}
              className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isExpanded ? 'gap-3 px-3 py-2' : 'justify-center p-2.5'
              } ${
                isTabActive('dashboard')
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${isTabActive('dashboard') ? 'text-indigo-600' : 'text-slate-400'}`} />
              {isExpanded && <span className="whitespace-nowrap">Dashboard</span>}
            </button>
          </div>

          {/* SECTION 2: COURSE SETUP (Exams for both Faculty & Admin, Packages for Admin) */}
          <div className="space-y-1 pt-1.5 border-t border-slate-100">
            {isExpanded ? (
              <button
                onClick={() => toggleSection('courseSetup')}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="whitespace-nowrap">{isAdmin ? 'Course Setup' : 'Exams & Curriculum'}</span>
                {collapsedSections.courseSetup ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="my-1 border-t border-slate-100" />
            )}

            {(!collapsedSections.courseSetup || !isExpanded) && (
              <div className="space-y-1">
                {/* Manage Exams (Accessible to both Admin & Faculty) */}
                <button
                  onClick={() => handleTabClick('exams')}
                  title={!isExpanded ? (isAdmin ? 'Manage Exams (4 Live)' : 'Exams & Courses (4 Live)') : undefined}
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
                    {isExpanded && <span className="whitespace-nowrap shrink-0">{isAdmin ? 'Manage Exams' : 'Exams & Courses'}</span>}
                  </div>
                  {isExpanded && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                      4 Live
                    </span>
                  )}
                </button>

                {/* Manage Subjects (NEW - Level 1 Academic Hierarchy) */}
                <button
                  onClick={() => handleTabClick('subjects')}
                  title={!isExpanded ? 'Manage Subjects' : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
                  } ${
                    isTabActive('subjects')
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                    <Layers className={`w-4 h-4 shrink-0 ${isTabActive('subjects') ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {isExpanded && <span className="whitespace-nowrap shrink-0">Subjects</span>}
                  </div>
                  {isExpanded && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                      Modules
                    </span>
                  )}
                </button>

                {/* Chapters & Topics (NEW - Level 2 & 3 Hierarchy & Content Hub) */}
                <button
                  onClick={() => handleTabClick('curriculum')}
                  title={!isExpanded ? 'Chapters, Topics & Content' : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
                  } ${
                    isTabActive('curriculum')
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                    <FolderTree className={`w-4 h-4 shrink-0 ${isTabActive('curriculum') ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {isExpanded && <span className="whitespace-nowrap shrink-0">Chapters & Topics</span>}
                  </div>
                  {isExpanded && (
                    <span className="text-[10px] bg-sky-100 text-sky-700 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                      Content
                    </span>
                  )}
                </button>

                {/* Study Schedule / Planner (NEW - Drip Release Planner) */}
                <button
                  onClick={() => handleTabClick('schedule')}
                  title={!isExpanded ? 'Study Schedule & Day Mapping' : undefined}
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
                    {isExpanded && <span className="whitespace-nowrap shrink-0">Study Schedule</span>}
                  </div>
                  {isExpanded && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                      Planner
                    </span>
                  )}
                </button>

                {/* Manage Packages (Admin Only) */}
                {isAdmin && (
                  <button
                    onClick={() => handleTabClick('packages')}
                    title={!isExpanded ? 'Manage Packages (12 Tiers)' : undefined}
                    className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
                    } ${
                      isTabActive('packages')
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                      <Package className={`w-4 h-4 shrink-0 ${isTabActive('packages') ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {isExpanded && <span className="whitespace-nowrap shrink-0">Manage Packages</span>}
                    </div>
                    {isExpanded && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                        12 Tiers
                      </span>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* SECTION 3: PEOPLE (Faculty admin-only, Students scoped) */}
          <div className="space-y-1 pt-1.5 border-t border-slate-100">
            {isExpanded ? (
              <button
                onClick={() => toggleSection('people')}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="whitespace-nowrap">People</span>
                {collapsedSections.people ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="my-1 border-t border-slate-100" />
            )}

            {(!collapsedSections.people || !isExpanded) && (
              <div className="space-y-1">
                {/* Manage Faculty (Admin Only) */}
                {isAdmin && (
                  <button
                    onClick={() => handleTabClick('faculty')}
                    title={!isExpanded ? 'Manage Faculty Specialists' : undefined}
                    className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
                    } ${
                      isTabActive('faculty')
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                      <GraduationCap className={`w-4 h-4 shrink-0 ${isTabActive('faculty') ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {isExpanded && <span className="whitespace-nowrap shrink-0">Manage Faculty</span>}
                    </div>
                    {isExpanded && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                        8 Leads
                      </span>
                    )}
                  </button>
                )}

                {/* Manage Students */}
                <button
                  onClick={() => handleTabClick('students')}
                  title={!isExpanded ? (isAdmin ? 'Manage Students' : 'Enrolled Students') : undefined}
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
                    {isExpanded && (
                      <span className="whitespace-nowrap shrink-0">{isAdmin ? 'Manage Students' : 'Enrolled Students'}</span>
                    )}
                  </div>
                  {isExpanded && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                      {isAdmin ? '1.4k All' : '680 Cardio'}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* SECTION 4: CONTENT & SCHEDULE */}
          <div className="space-y-1 pt-1.5 border-t border-slate-100">
            {isExpanded ? (
              <button
                onClick={() => toggleSection('contentSchedule')}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="whitespace-nowrap">Content & Schedule</span>
                {collapsedSections.contentSchedule ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="my-1 border-t border-slate-100" />
            )}

            {(!collapsedSections.contentSchedule || !isExpanded) && (
              <div className="space-y-1">
                {/* Content Management - Admin Only (Faculty uses Study Schedule instead) */}
                {isAdmin && (
                  <button
                    onClick={() => handleTabClick('content')}
                    title={!isExpanded ? 'Day-Wise Content Management' : undefined}
                    className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
                    } ${
                      isTabActive('content')
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                      <UploadCloud className={`w-4 h-4 shrink-0 ${isTabActive('content') ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {isExpanded && (
                        <span className="whitespace-nowrap shrink-0">Content Management</span>
                      )}
                    </div>
                    {isExpanded && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                        Drip Feed
                      </span>
                    )}
                  </button>
                )}

                {/* Live Sessions */}
                <button
                  onClick={() => handleTabClick('live')}
                  title={!isExpanded ? 'Live Grand Rounds Scheduler' : undefined}
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
                      Tonight
                    </span>
                  )}
                </button>

                {/* Manage Tests */}
                <button
                  onClick={() => handleTabClick('tests')}
                  title={!isExpanded ? 'CBT Mock Assessment Scheduler' : undefined}
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
                    {isExpanded && <span className="whitespace-nowrap shrink-0">Manage Tests</span>}
                  </div>
                  {isExpanded && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                      CBT Engine
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* SECTION 5: REPORTS & ANALYTICS (Admin Only) */}
          {isAdmin && (
            <div className="space-y-1 pt-1.5 border-t border-slate-100">
              <button
                onClick={() => handleTabClick('analytics')}
                title={!isExpanded ? 'Executive Reports & Analytics' : undefined}
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
                  {isExpanded && <span className="whitespace-nowrap shrink-0">Reports & Analytics</span>}
                </div>
                {isExpanded && (
                  <span className="text-[10px] bg-brand-100 text-brand-700 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                    KPIs
                  </span>
                )}
              </button>
            </div>
          )}

        </div>

        {/* Bottom Sidebar Box: Current Scope Display */}
        <div className="p-2.5 border-t border-slate-100 bg-slate-50/70">
          {isExpanded ? (
            isAdmin ? (
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Crown className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="whitespace-nowrap">Super Admin Account</span>
                </div>
                <p className="text-[10.5px] text-slate-500 leading-snug">
                  Full Platform Authority across all 4 exam tracks, 12 packages & reports.
                </p>
              </div>
            ) : (
              <div className="p-2.5 bg-purple-50/70 rounded-xl border border-purple-200/80 shadow-2xs space-y-1 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="whitespace-nowrap">Faculty Assigned Scope</span>
                </div>
                <p className="text-[10.5px] text-purple-700 leading-snug">
                  Assigned: <strong>NEET PG & USMLE Cardio</strong>. Only assigned exams visible.
                </p>
              </div>
            )
          ) : (
            <div className="flex justify-center">
              <div 
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs cursor-pointer"
                title={isAdmin ? 'Super Admin Account (Full Platform Authority)' : 'Faculty Assigned Scope (NEET PG / USMLE)'}
              >
                {isAdmin ? (
                  <Crown className="w-4 h-4 text-indigo-600" />
                ) : (
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                )}
              </div>
            </div>
          )}
        </div>

      </aside>
    </>
  );
}

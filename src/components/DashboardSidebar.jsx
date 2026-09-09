import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Video, 
  FileText, 
  BarChart3, 
  Settings, 
  Flame, 
  ChevronDown, 
  ChevronRight, 
  Pin, 
  PinOff, 
  X 
} from 'lucide-react';

export default function DashboardSidebar({ 
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
    academics: false,
    liveAssessments: false,
    performance: false
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

  const toggleSection = (sectionKey) => {
    if (!isExpanded) return;
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const TAB_ROUTES = {
    dashboard: '/student/dashboard',
    courses: '/student/courses',
    plan: '/student/study-plan',
    live: '/student/live-sessions',
    tests: '/student/tests',
    progress: '/student/progress',
    settings: '/student/settings',
  };

  const isTabActive = (tabId) => {
    if (activeTab) {
      return activeTab === tabId;
    }
    const p = location.pathname;
    if (tabId === 'dashboard') {
      return p === '/student' || p === '/student/dashboard' || p === '/dashboard';
    }
    if (tabId === 'courses') {
      return p.startsWith('/student/courses') || p.startsWith('/courses');
    }
    if (tabId === 'plan') {
      return p.startsWith('/student/study-plan') || p.startsWith('/day/');
    }
    if (tabId === 'live') {
      return p.startsWith('/student/live-sessions');
    }
    if (tabId === 'tests') {
      return p.startsWith('/student/tests') || p.startsWith('/test/');
    }
    if (tabId === 'progress') {
      return p.startsWith('/student/progress');
    }
    if (tabId === 'settings') {
      return p.startsWith('/student/settings');
    }
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

      {/* Desktop Layout Spacer:
          When pinned: takes full 305px in document flow.
          When unpinned: takes compact 80px rail space so content doesn't jump on hover! */}
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
        
        {/* Navigation Items Area with Sleek Custom Scrollbar */}
        <div className="p-2.5 space-y-2 overflow-y-auto custom-sidebar-scroll flex-grow overflow-x-hidden">
          
          {/* Mobile Close Bar (Mobile Only) */}
          <div className="flex lg:hidden items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Student LMS
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
                  Student Portal
                </span>
                <button
                  id="btn-student-sidebar-pin-toggle"
                  type="button"
                  onClick={togglePin}
                  className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    effectivePinned 
                      ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-2xs' 
                      : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/60 border border-transparent hover:border-indigo-100'
                  }`}
                  title={effectivePinned ? 'Sidebar is Pinned (Click to Unpin & auto-collapse)' : 'Sidebar is Unpinned (Click to Pin open)'}
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
                  id="btn-student-sidebar-pin-rail-toggle"
                  type="button"
                  onClick={togglePin}
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
              title={!isExpanded ? 'Dashboard (Home)' : undefined}
              className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isExpanded ? 'gap-3 px-3 py-2' : 'justify-center p-2.5'
              } ${
                isTabActive('dashboard')
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${isTabActive('dashboard') ? 'text-indigo-600' : 'text-slate-400'}`} />
              {isExpanded && <span className="whitespace-nowrap">Dashboard (Home)</span>}
            </button>
          </div>

          {/* SECTION 2: ACADEMICS & STUDY PLAN */}
          <div className="space-y-1 pt-1.5 border-t border-slate-100">
            {isExpanded ? (
              <button
                onClick={() => toggleSection('academics')}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="whitespace-nowrap">Academics</span>
                {collapsedSections.academics ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="my-1 border-t border-slate-100" />
            )}

            {(!collapsedSections.academics || !isExpanded) && (
              <div className="space-y-1">
                {/* My Course(s) */}
                <button
                  onClick={() => handleTabClick('courses')}
                  title={!isExpanded ? 'My Course(s) (1 Active)' : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
                  } ${
                    isTabActive('courses')
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                    <BookOpen className={`w-4 h-4 shrink-0 ${isTabActive('courses') ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {isExpanded && <span className="whitespace-nowrap shrink-0">My Course(s)</span>}
                  </div>
                  {isExpanded && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                      1 Active
                    </span>
                  )}
                </button>

                {/* Study Plan */}
                <button
                  onClick={() => handleTabClick('plan')}
                  title={!isExpanded ? 'Study Plan (Week 1)' : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
                  } ${
                    isTabActive('plan')
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                    <Calendar className={`w-4 h-4 shrink-0 ${isTabActive('plan') ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {isExpanded && <span className="whitespace-nowrap shrink-0">Study Plan</span>}
                  </div>
                  {isExpanded && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                      Week 1
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* SECTION 3: LIVE & ASSESSMENTS */}
          <div className="space-y-1 pt-1.5 border-t border-slate-100">
            {isExpanded ? (
              <button
                onClick={() => toggleSection('liveAssessments')}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="whitespace-nowrap">Live & Tests</span>
                {collapsedSections.liveAssessments ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="my-1 border-t border-slate-100" />
            )}

            {(!collapsedSections.liveAssessments || !isExpanded) && (
              <div className="space-y-1">
                {/* Live Sessions */}
                <button
                  onClick={() => handleTabClick('live')}
                  title={!isExpanded ? 'Live Sessions (Tonight)' : undefined}
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

                {/* Tests */}
                <button
                  onClick={() => handleTabClick('tests')}
                  title={!isExpanded ? 'Tests (2 Pending)' : undefined}
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
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                      2 Pending
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* SECTION 4: PERFORMANCE & SETTINGS */}
          <div className="space-y-1 pt-1.5 border-t border-slate-100">
            {isExpanded ? (
              <button
                onClick={() => toggleSection('performance')}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="whitespace-nowrap">Performance</span>
                {collapsedSections.performance ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="my-1 border-t border-slate-100" />
            )}

            {(!collapsedSections.performance || !isExpanded) && (
              <div className="space-y-1">
                {/* Progress */}
                <button
                  onClick={() => handleTabClick('progress')}
                  title={!isExpanded ? 'Progress & Analytics' : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
                  } ${
                    isTabActive('progress')
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                    <BarChart3 className={`w-4 h-4 shrink-0 ${isTabActive('progress') ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {isExpanded && <span className="whitespace-nowrap shrink-0">Progress</span>}
                  </div>
                  {isExpanded && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ml-auto">
                      KPIs
                    </span>
                  )}
                </button>

                {/* Settings */}
                <button
                  onClick={() => handleTabClick('settings')}
                  title={!isExpanded ? 'Account Settings' : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isExpanded ? 'gap-3 px-3 py-2' : 'justify-center p-2.5'
                  } ${
                    isTabActive('settings')
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Settings className={`w-4 h-4 shrink-0 ${isTabActive('settings') ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {isExpanded && <span className="whitespace-nowrap">Settings</span>}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Sidebar Box: Student Daily Streak Card */}
        <div className="p-2.5 border-t border-slate-100 bg-slate-50/70">
          {isExpanded ? (
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                  <span>Daily Streak</span>
                </div>
                <span className="text-xs font-black text-indigo-600">5 Days</span>
              </div>
              
              <p className="text-[10.5px] text-slate-500 leading-snug">
                Target: 3.5 hrs daily active recall. Keep it up!
              </p>

              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-indigo-600 w-4/5 rounded-full" />
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div 
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs cursor-pointer hover:border-amber-300 transition-colors"
                title="Daily Streak: 5 Days (Target: 3.5 hrs daily active recall)"
              >
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
            </div>
          )}
        </div>

      </aside>
    </>
  );
}

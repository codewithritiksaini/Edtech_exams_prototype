import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
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
  X
} from 'lucide-react';
import { authService, USER_ROLES } from '../../services/authService';

export default function AdminSidebar({ 
  activeTab, 
  onSelectTab, 
  isCollapsed, 
  isOpenMobile, 
  onCloseMobile 
}) {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
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

  const toggleSection = (sectionKey) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleTabClick = (tabId) => {
    onSelectTab(tabId);
    if (onCloseMobile) onCloseMobile();
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

      {/* Persistent Sidebar */}
      <aside className={`fixed lg:sticky top-0 lg:top-16 left-0 z-50 h-screen lg:h-[calc(100vh-4rem)] bg-white border-r border-slate-200 transition-all duration-300 flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Navigation Items Area */}
        <div className="p-3.5 space-y-4 overflow-y-auto flex-grow">
          
          {/* Mobile Close Bar */}
          <div className="flex lg:hidden items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isAdmin ? 'Admin Navigation' : 'Faculty Navigation'}
            </span>
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section 1: Dashboard Overview (Always Visible) */}
          <div className="space-y-1">
            <button
              onClick={() => handleTabClick('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`} />
              {!isCollapsed && <span>Dashboard</span>}
            </button>
          </div>

          {/* Section 2: Course Setup (Admin: Visible; Faculty: HIDDEN) */}
          {isAdmin && (
            <div className="space-y-1 pt-2 border-t border-slate-100">
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection('courseSetup')}
                  className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <span>Course Setup</span>
                  {collapsedSections.courseSetup ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}

              {!collapsedSections.courseSetup && (
                <div className="space-y-1">
                  <button
                    onClick={() => handleTabClick('exams')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      activeTab === 'exams'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className={`w-4 h-4 shrink-0 ${activeTab === 'exams' ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {!isCollapsed && <span>Manage Exams</span>}
                    </div>
                    {!isCollapsed && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded-md">
                        4 Live
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleTabClick('packages')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      activeTab === 'packages'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Package className={`w-4 h-4 shrink-0 ${activeTab === 'packages' ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {!isCollapsed && <span>Manage Packages</span>}
                    </div>
                    {!isCollapsed && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded-md">
                        12 Tiers
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Section 3: People (Manage Faculty is Admin only; Students visible to both with scoped data) */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            {!isCollapsed && (
              <button
                onClick={() => toggleSection('people')}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span>People</span>
                {collapsedSections.people ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}

            {!collapsedSections.people && (
              <div className="space-y-1">
                {/* Manage Faculty (Admin Only) */}
                {isAdmin && (
                  <button
                    onClick={() => handleTabClick('faculty')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      activeTab === 'faculty'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className={`w-4 h-4 shrink-0 ${activeTab === 'faculty' ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {!isCollapsed && <span>Manage Faculty</span>}
                    </div>
                    {!isCollapsed && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded-md">
                        8 Leads
                      </span>
                    )}
                  </button>
                )}

                {/* Manage Students (Admin: All Students; Faculty: Scoped Students) */}
                <button
                  onClick={() => handleTabClick('students')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'students'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className={`w-4 h-4 shrink-0 ${activeTab === 'students' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {!isCollapsed && (
                      <span>{isAdmin ? 'Manage Students' : 'Enrolled Students'}</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">
                      {isAdmin ? '1.4k All' : '680 Cardio'}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Section 4: Content & Schedule (Visible to both; Faculty sees only assigned exam scope) */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            {!isCollapsed && (
              <button
                onClick={() => toggleSection('contentSchedule')}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span>Content & Schedule</span>
                {collapsedSections.contentSchedule ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}

            {!collapsedSections.contentSchedule && (
              <div className="space-y-1">
                <button
                  onClick={() => handleTabClick('content')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'content'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UploadCloud className={`w-4 h-4 shrink-0 ${activeTab === 'content' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {!isCollapsed && (
                      <span>{isAdmin ? 'Content Management' : 'Assigned Daily Content'}</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded-md">
                      Drip Feed
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleTabClick('live')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'live'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Video className={`w-4 h-4 shrink-0 ${activeTab === 'live' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {!isCollapsed && <span>Live Sessions</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded-md">
                      Tonight
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleTabClick('tests')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'tests'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={`w-4 h-4 shrink-0 ${activeTab === 'tests' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {!isCollapsed && <span>Manage Tests</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">
                      CBT Engine
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Section 5: Reports & Analytics (Admin: Visible; Faculty: HIDDEN) */}
          {isAdmin && (
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleTabClick('analytics')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className={`w-4 h-4 shrink-0 ${activeTab === 'analytics' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {!isCollapsed && <span>Reports & Analytics</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-[10px] bg-brand-100 text-brand-700 font-bold px-1.5 py-0.2 rounded-md">
                    KPIs
                  </span>
                )}
              </button>
            </div>
          )}

        </div>

        {/* Bottom Sidebar Box: Current Scope Display */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-100 bg-slate-50/70">
            {isAdmin ? (
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Crown className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Super Admin Account</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Full Platform Authority across all 4 exam tracks, 12 packages, and financial reports.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200/80 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                  <span>Faculty Assigned Scope</span>
                </div>
                <p className="text-[11px] text-purple-700 leading-snug">
                  Assigned: <strong>NEET PG & USMLE Cardio</strong>. Only assigned exams and students are visible.
                </p>
              </div>
            )}
          </div>
        )}

      </aside>
    </>
  );
}

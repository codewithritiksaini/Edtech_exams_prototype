import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  Video, 
  FileText, 
  BarChart3, 
  Settings, 
  Flame, 
  X,
  GraduationCap
} from 'lucide-react';
import { dashboardUserData } from '../data/mockData';

export default function DashboardSidebar({ activeTab, onSelectTab, isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard (Home)', icon: Home, route: '/student/dashboard' },
    { id: 'courses', label: 'My Course(s)', icon: BookOpen, badge: '1 Active', route: '/student/courses' },
    { id: 'plan', label: 'Study Plan', icon: Calendar, badge: 'Week 1', route: '/student/study-plan' },
    { id: 'live', label: 'Live Sessions', icon: Video, badge: 'Tonight', route: '/student/live-sessions' },
    { id: 'tests', label: 'Tests', icon: FileText, badge: '2 Pending', route: '/student/tests' },
    { id: 'progress', label: 'Progress', icon: BarChart3, route: '/student/progress' },
    { id: 'settings', label: 'Settings', icon: Settings, route: '/student/settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Persistent Left Sidebar */}
      <aside className={`fixed lg:sticky top-0 lg:top-16 left-0 z-50 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 transition-transform duration-300 flex flex-col justify-between ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Top items */}
        <div className="p-4 space-y-6 overflow-y-auto">
          
          {/* Mobile close bar */}
          <div className="flex lg:hidden items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              LMS Navigation
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab ? activeTab === item.id : (
                location.pathname === item.route ||
                (item.id === 'dashboard' && (location.pathname === '/dashboard' || location.pathname === '/student')) ||
                (item.id === 'courses' && (location.pathname.startsWith('/student/courses') || location.pathname.startsWith('/courses'))) ||
                (item.id === 'plan' && (location.pathname.startsWith('/student/study-plan') || location.pathname.startsWith('/day/'))) ||
                (item.id === 'tests' && (location.pathname.startsWith('/student/tests') || location.pathname.startsWith('/test/'))) ||
                (item.route !== '/student/dashboard' && location.pathname.startsWith(item.route))
              );
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (onSelectTab) onSelectTab(item.id);
                    else navigate(item.route);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive 
                        ? 'bg-brand-600 text-white' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Box: Student Streak Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Daily Streak</span>
              </div>
              <span className="text-xs font-extrabold text-brand-600">5 Days</span>
            </div>
            
            <p className="text-[11px] text-slate-500">
              Target: 3.5 hrs daily active recall. Keep it up!
            </p>

            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-brand-500 w-4/5 rounded-full" />
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}

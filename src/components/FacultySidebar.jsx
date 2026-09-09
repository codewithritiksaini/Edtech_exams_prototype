import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  UploadCloud, 
  Video, 
  FileText, 
  Users, 
  BarChart3, 
  X,
  Sparkles,
  BookOpen,
  Calendar
} from 'lucide-react';
import { facultyProfileData } from '../data/mockData';

export default function FacultySidebar({ activeTab, onSelectTab, isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'overview', label: 'Dashboard (Overview)', icon: Home, route: '/faculty/dashboard' },
    { id: 'exams', label: 'Exams & Curriculum', icon: BookOpen, badge: 'Assigned', route: '/faculty/exams' },
    { id: 'schedule', label: 'Teaching Schedule', icon: Calendar, route: '/faculty/schedule' },
    { id: 'upload', label: 'Upload Content', icon: UploadCloud, badge: 'Main Flow', route: '/faculty/upload' },
    { id: 'live', label: 'Schedule Live Session', icon: Video, badge: 'Tonight', route: '/faculty/live-sessions' },
    { id: 'tests', label: 'Manage Tests', icon: FileText, route: '/faculty/tests' },
    { id: 'students', label: 'My Students', icon: Users, badge: '1.4k', route: '/faculty/students' },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3, route: '/faculty/analytics' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Persistent Left Sidebar */}
      <aside className={`fixed lg:sticky top-0 lg:top-16 left-0 z-50 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 text-slate-600 transition-transform duration-300 flex flex-col justify-between ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        <div className="p-4 space-y-6 overflow-y-auto">
          
          {/* Mobile close bar */}
          <div className="flex lg:hidden items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Controls
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab ? activeTab === item.id : (
                (item.id === 'overview' && (location.pathname === '/faculty' || location.pathname === '/faculty/dashboard')) ||
                location.pathname === item.route || 
                (item.route !== '/faculty/dashboard' && location.pathname.startsWith(item.route))
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
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-200/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive 
                        ? 'bg-indigo-100 text-indigo-700' 
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

        {/* Bottom Assigned Modules Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100 space-y-1.5">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
              Teaching Assignment
            </span>
            <div className="text-xs font-bold text-slate-900">
              Cardiology & ECG Curriculum
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              2 Active Exam Modules • 28 Week-Days Controlled
            </p>
          </div>
        </div>

      </aside>
    </>
  );
}

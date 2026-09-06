import React from 'react';
import { 
  Home, 
  UploadCloud, 
  Video, 
  FileText, 
  Users, 
  BarChart3, 
  X,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { facultyProfileData } from '../data/mockData';

export default function FacultySidebar({ activeTab, onSelectTab, isOpen, onClose }) {
  const menuItems = [
    { id: 'overview', label: 'Dashboard (Overview)', icon: Home },
    { id: 'upload', label: 'Upload Content', icon: UploadCloud, badge: 'Main Flow' },
    { id: 'live', label: 'Schedule Live Session', icon: Video, badge: 'Tonight' },
    { id: 'tests', label: 'Manage Tests', icon: FileText },
    { id: 'students', label: 'My Students', icon: Users, badge: '1.4k' },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Persistent Left Sidebar */}
      <aside className={`fixed lg:sticky top-0 lg:top-16 left-0 z-50 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-slate-900 border-r border-slate-800 text-slate-300 transition-transform duration-300 flex flex-col justify-between ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        <div className="p-4 space-y-6 overflow-y-auto">
          
          {/* Mobile close bar */}
          <div className="flex lg:hidden items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Controls
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive 
                        ? 'bg-indigo-700 text-white' 
                        : 'bg-slate-800 text-slate-400'
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
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-1.5">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
              Teaching Assignment
            </span>
            <div className="text-xs font-bold text-white">
              Cardiology & ECG Curriculum
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              2 Active Exam Modules • 28 Week-Days Controlled
            </p>
          </div>
        </div>

      </aside>
    </>
  );
}

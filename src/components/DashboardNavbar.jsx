import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Bell, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { dashboardUserData } from '../data/mockData';

export default function DashboardNavbar({ onToggleSidebar, isSidebarOpen }) {
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const notifications = [
    {
      id: 1,
      title: 'Live Grand Round Tonight @ 8:00 PM',
      desc: 'Dr. Siddharth V. is hosting STEMI & Acute ECG Drills.',
      time: '15m ago',
      unread: true
    },
    {
      id: 2,
      title: 'New High-Yield PDF Uploaded',
      desc: 'Cardiology: Class I-IV Antiarrhythmics notes ready for download.',
      time: '2h ago',
      unread: true
    },
    {
      id: 3,
      title: 'Weekly Test Series Scheduled',
      desc: 'Grand Mock Test #08 syllabus released for Sunday.',
      time: '1d ago',
      unread: true
    }
  ];

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Hamburger + Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Sidebar"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 font-sans">
                  MedPrep<span className="text-brand-600">Pro</span>
                </span>
                <span className="bg-brand-50 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-brand-200 hidden sm:inline-block">
                  LMS Portal
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
              <span className="text-xs text-slate-400 font-medium">Target:</span>
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                🇮🇳 {dashboardUserData.enrolledCourse}
              </span>
            </div>
          </div>

          {/* Right: Notification Bell + Student Avatar Dropdown */}
          <div className="flex items-center gap-3">
            
            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                }}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-600 ring-2 ring-white animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Study Notifications
                    </span>
                    <button
                      onClick={() => setUnreadCount(0)}
                      className="text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-900 leading-snug">{n.title}</h5>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-slate-100 text-center bg-slate-50">
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900"
                    >
                      Close Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Student Profile Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
              >
                <img
                  src={dashboardUserData.avatar}
                  alt={dashboardUserData.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-brand-500"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {dashboardUserData.name}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Resident Aspirant
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <div className="text-sm font-bold text-slate-900">{dashboardUserData.name}</div>
                    <div className="text-xs text-slate-500">{dashboardUserData.email}</div>
                    <div className="mt-2 text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md inline-block border border-brand-200">
                      {dashboardUserData.packageTier}
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>Student Profile</span>
                    </button>
                    <button
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Study Preferences & Goals</span>
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out to Homepage</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
